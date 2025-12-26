FROM docker.n8n.io/n8nio/n8n

USER root

# Создаем директорию для кастомных узлов
RUN mkdir -p /home/node/.n8n/custom

# Копируем архив
COPY myspacet_ai-n8n-nodes-ai-hub-1.0.0.tgz /home/node/.n8n/custom/

# Переходим в папку custom
WORKDIR /home/node/.n8n/custom

# Устанавливаем пакет (это распакует его и установит зависимости, если они есть)
RUN npm install myspacet_ai-n8n-nodes-ai-hub-1.0.0.tgz

# Возвращаем права пользователю node
RUN chown -R node:node /home/node/.n8n

USER node
WORKDIR /home/node