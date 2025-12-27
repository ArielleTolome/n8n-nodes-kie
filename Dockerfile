FROM docker.n8n.io/n8nio/n8n

USER root

# Создаем директорию для кастомных узлов
RUN mkdir -p /home/node/.n8n/custom

# Копируем архив версии 1.0.7
COPY myspacet_ai-n8n-nodes-ai-hub-1.0.14.tgz /home/node/.n8n/custom/

# Переходим в папку custom
WORKDIR /home/node/.n8n/custom

# Устанавливаем пакет
RUN npm install myspacet_ai-n8n-nodes-ai-hub-1.0.14.tgz

# Возвращаем права пользователю node
RUN chown -R node:node /home/node/.n8n

USER node
WORKDIR /home/node