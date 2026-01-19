FROM docker.n8n.io/n8nio/n8n

USER root

# Устанавливаем ваш пакет напрямую из npm (для PROD)
# RUN npm install -g @myspacet_ai/n8n-nodes-ai-hub@1.0.31

# === ЛОКАЛЬНАЯ РАЗРАБОТКА (DEV) ===
# Восстанавливаем проверенную схему работы через /opt/nodes

# Создаем чистую папку для узлов (вне .n8n)
RUN mkdir -p /opt/nodes

# Копируем архив версии 1.0.34
COPY myspacet_ai-n8n-nodes-ai-hub-1.0.34.tgz /opt/nodes/
WORKDIR /opt/nodes

# Устанавливаем пакет
RUN npm install myspacet_ai-n8n-nodes-ai-hub-1.0.34.tgz

# Возвращаем права пользователю node
RUN chown -R node:node /opt/nodes

USER node
WORKDIR /home/node
