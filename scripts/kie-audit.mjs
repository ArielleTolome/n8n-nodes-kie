#!/usr/bin/env node
/**
 * Kie.ai API Audit Script
 * 
 * Checks the Kie.ai announcement API for new models/features,
 * compares against the last known state, and reports what needs updating.
 * 
 * Usage: node scripts/kie-audit.mjs
 * Env: KIE_AUDIT_STATE_FILE (default: .kie-audit-state.json)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const STATE_FILE = join(ROOT, '.kie-audit-state.json');

const KIE_ANNOUNCEMENTS_URL = 'https://api.kie.ai/api/v1/common/pageApiAnnouncementList';

async function fetchAnnouncements(pageNum = 1, pageSize = 20) {
  const res = await fetch(KIE_ANNOUNCEMENTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: 'en', projectSource: 'kie.ai', pageNum, pageSize }),
  });
  const data = await res.json();
  return data.data;
}

async function fetchAllAnnouncements() {
  const first = await fetchAnnouncements(1, 20);
  const totalPages = first.pages;
  const all = [...first.records];
  
  for (let p = 2; p <= Math.min(totalPages, 5); p++) {
    const page = await fetchAnnouncements(p, 20);
    all.push(...page.records);
  }
  return all;
}

function loadState() {
  if (existsSync(STATE_FILE)) {
    return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  }
  return { lastChecked: null, knownPublishDates: [], lastAnnouncementDate: 0 };
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function main() {
  console.log('🔍 Fetching Kie.ai announcements...');
  
  const state = loadState();
  const lastKnownDate = state.lastAnnouncementDate || 0;
  
  const announcements = await fetchAllAnnouncements();
  
  const newAnnouncements = announcements.filter(a => 
    a.publishDate > lastKnownDate
  );
  
  const latestDate = Math.max(...announcements.map(a => a.publishDate));
  
  if (newAnnouncements.length === 0) {
    console.log('✅ No new announcements since last check.');
    state.lastChecked = new Date().toISOString();
    saveState(state);
    process.exit(0);
  }
  
  console.log(`\n🆕 Found ${newAnnouncements.length} new announcement(s):\n`);
  
  const actionItems = [];
  
  for (const a of newAnnouncements.sort((a, b) => b.publishDate - a.publishDate)) {
    const date = new Date(a.publishDate).toISOString().split('T')[0];
    console.log(`📢 [${date}] ${a.title}`);
    
    // Parse for actionable items
    const content = a.content.toLowerCase();
    const title = a.title.toLowerCase();
    
    if (content.includes('new') || content.includes('now live') || content.includes('launched') || 
        content.includes('available') || title.includes('new') || title.includes('now live')) {
      
      // Detect model names
      const modelMatches = [];
      if (content.includes('suno')) modelMatches.push('suno');
      if (content.includes('kling')) modelMatches.push('kling');
      if (content.includes('grok')) modelMatches.push('grok-imagine');
      if (content.includes('seedream') || content.includes('seedance')) modelMatches.push('bytedance');
      if (content.includes('elevenlabs')) modelMatches.push('elevenlabs');
      if (content.includes('veo')) modelMatches.push('veo');
      if (content.includes('wan')) modelMatches.push('wan');
      if (content.includes('hailuo')) modelMatches.push('hailuo');
      if (content.includes('flux')) modelMatches.push('flux');
      if (content.includes('ideogram')) modelMatches.push('ideogram');
      if (content.includes('qwen')) modelMatches.push('qwen');
      if (content.includes('runway')) modelMatches.push('runway');
      if (content.includes('gemini')) modelMatches.push('gemini');
      if (content.includes('midjourney') || content.includes('niji')) modelMatches.push('midjourney');
      if (content.includes('claude')) modelMatches.push('claude');
      if (content.includes('gpt-5') || content.includes('codex') || content.includes('openai')) modelMatches.push('openai-chat');
      if (content.includes('nano banana')) modelMatches.push('google-nano-banana');
      
      if (modelMatches.length > 0) {
        actionItems.push({
          title: a.title,
          date,
          models: [...new Set(modelMatches)],
          docPath: a.documentPath,
          content: a.content.substring(0, 300),
        });
      }
    }
  }
  
  if (actionItems.length > 0) {
    console.log('\n⚡ ACTION ITEMS (models/features to add/update in n8n-nodes-kie-pro):\n');
    for (const item of actionItems) {
      console.log(`  📦 ${item.models.join(', ')} — ${item.title}`);
      if (item.docPath) console.log(`     📄 Docs: ${item.docPath}`);
      console.log('');
    }
    
    // Output as JSON for programmatic use
    const output = {
      hasUpdates: true,
      newCount: newAnnouncements.length,
      actionItems,
      checkedAt: new Date().toISOString(),
    };
    
    writeFileSync(join(ROOT, '.kie-audit-results.json'), JSON.stringify(output, null, 2));
    console.log('💾 Results saved to .kie-audit-results.json');
  }
  
  // Update state
  state.lastChecked = new Date().toISOString();
  state.lastAnnouncementDate = latestDate;
  state.lastKnownAnnouncements = announcements.slice(0, 5).map(a => ({ title: a.title, publishDate: a.publishDate }));
  saveState(state);
  
  // Exit with code 1 if there are action items (signals to CI/cron that work needs doing)
  process.exit(actionItems.length > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(2);
});
