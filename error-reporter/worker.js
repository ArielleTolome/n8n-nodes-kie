/**
 * Kie.ai n8n Node Error Reporter — Cloudflare Worker
 *
 * Receives error reports from n8n-nodes-kie-pro installations,
 * deduplicates them, and creates GitHub issues automatically.
 *
 * Environment variables required (set in Cloudflare dashboard):
 *   GITHUB_TOKEN  — Personal access token with repo:issues write
 *   GITHUB_REPO   — e.g. "ArielleTolome/n8n-nodes-kie"
 *   SECRET_KEY    — Shared secret to prevent spam (set in node credential too)
 */

const GITHUB_API = 'https://api.github.com';
const DEDUP_CACHE_TTL = 3600; // 1 hour — don't re-open same error within this window

export default {
  async fetch(request, env, ctx) {
    // Only accept POST to /report
    if (request.method !== 'POST' || !new URL(request.url).pathname.startsWith('/report')) {
      return new Response('Not found', { status: 404 });
    }

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    // Validate secret key if configured
    if (env.SECRET_KEY && body.secretKey !== env.SECRET_KEY) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { node, operation, errorCode, errorMessage, packageVersion, n8nVersion, timestamp } = body;

    if (!node || !errorMessage) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Deduplication key — same node + operation + error code within TTL = skip
    const dedupKey = `dedup:${node}:${operation}:${errorCode}:${errorMessage.substring(0, 50)}`;

    if (env.KV) {
      const existing = await env.KV.get(dedupKey);
      if (existing) {
        return new Response(JSON.stringify({ status: 'deduplicated', message: 'Already reported recently' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      // Mark as seen
      ctx.waitUntil(env.KV.put(dedupKey, '1', { expirationTtl: DEDUP_CACHE_TTL }));
    }

    // Create GitHub issue
    const issueTitle = `[Auto] ${node} — ${operation || 'unknown op'}: ${errorMessage.substring(0, 80)}`;
    const issueBody = buildIssueBody({ node, operation, errorCode, errorMessage, packageVersion, n8nVersion, timestamp });

    const labels = ['bug', 'auto-reported'];
    if (node) labels.push(`node:${node.toLowerCase()}`);

    const ghResponse = await fetch(`${GITHUB_API}/repos/${env.GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'n8n-nodes-kie-error-reporter/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        title: issueTitle,
        body: issueBody,
        labels,
      }),
    });

    if (!ghResponse.ok) {
      const err = await ghResponse.text();
      console.error('GitHub issue creation failed:', err);
      return new Response(JSON.stringify({ status: 'error', message: 'Failed to create GitHub issue' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const issue = await ghResponse.json();

    return new Response(JSON.stringify({
      status: 'reported',
      issueUrl: issue.html_url,
      issueNumber: issue.number,
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  },
};

function buildIssueBody({ node, operation, errorCode, errorMessage, packageVersion, n8nVersion, timestamp }) {
  return `## Auto-reported Error

**Node:** \`${node}\`
**Operation:** \`${operation || 'unknown'}\`
**Error Code:** \`${errorCode || 'unknown'}\`
**Package Version:** \`n8n-nodes-kie-pro@${packageVersion || 'unknown'}\`
**n8n Version:** \`${n8nVersion || 'unknown'}\`
**Reported At:** ${timestamp || new Date().toISOString()}

### Error Message
\`\`\`
${errorMessage}
\`\`\`

---
*This issue was automatically created by the error reporter built into n8n-nodes-kie-pro.*
*To disable error reporting, uncheck "Enable Error Reporting" in your Kie.ai credential settings.*
`;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
