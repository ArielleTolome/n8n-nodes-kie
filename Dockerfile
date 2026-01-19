FROM docker.n8n.io/n8nio/n8n

USER root

# Устанавливаем ваш пакет напрямую из npm
RUN npm install -g @myspacet_ai/n8n-nodes-ai-hub@1.0.31

USER node
