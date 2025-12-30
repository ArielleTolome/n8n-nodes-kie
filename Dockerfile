FROM docker.n8n.io/n8nio/n8n

USER root

# Создаем чистую папку для узлов (вне .n8n)
RUN mkdir -p /opt/nodes

# Копируем архив версии 1.0.27
COPY myspacet_ai-n8n-nodes-ai-hub-1.0.27.tgz /opt/nodes/
WORKDIR /opt/nodes

# Устанавливаем пакет
RUN npm install myspacet_ai-n8n-nodes-ai-hub-1.0.27.tgz

# Возвращаем права пользователю node
RUN chown -R node:node /opt/nodes

USER node
WORKDIR /home/node