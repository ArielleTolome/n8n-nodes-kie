# AI Hub by MySpacet (Kie.ai) for n8n

Коллекция профессиональных узлов для работы с самыми мощными AI моделями через единый API Kie.ai. Генерация видео (Sora 2 Pro), высококачественных изображений (Seedream v4) и интеллектуальное редактирование (GPT-image-1.5) прямо в ваших workflow n8n.

## 🚀 Доступные инструменты

### 🎥 Sora 2 Pro (Kie.ai)
*   **Text-to-Video**: Создание реалистичных видеороликов по текстовому описанию.
*   **Высокое качество**: Поддержка 1080p и 720p.
*   **Гибкость**: Длительность до 15 секунд.

### 🎨 Seedream v4 (Kie.ai)
*   **Text-to-Image**: Генерация детализированных артов и фотографий.
*   **Image-Edit**: Профессиональное редактирование существующих изображений.
*   **Вариативность**: Настройка Seed, разрешения до 4K и выбор соотношения сторон.

### 🧠 GPT-image-1.5 (Kie.ai)
*   **Text-to-Image**: Умная генерация изображений на базе архитектуры GPT.
*   **Image-to-Image**: Глубокое понимание контекста при изменении ваших фото.
*   **Качество**: Режимы Medium и High для идеального результата.

## ⚙️ Установка

1. Перейдите в **Settings > Community Nodes > Install a community node**.
2. Введите название пакета:
   ```bash
   @myspacet_ai/n8n-nodes-ai-hub
   ```
3. Нажмите **Install**.

## 🔑 Настройка доступа

EN: One key for all Kie.ai services. Register via author's link on the website: [kie.ai](https://kie.ai?ref=61a3dfe897fb3596cef5cce97e7d82c5) and get welcome bonuses (exact amount in kie.ai terms). After registration: API keys tab -> Create new key button -> paste below.

RU: Один ключ для всех сервисов Kie.ai. Зарегистрируйтесь по ссылке автора на сайте: [kie.ai](https://kie.ai?ref=61a3dfe897fb3596cef5cce97e7d82c5) и получите приветственные бонусы (точное количество в условиях kie.ai). После регистрации: вкладка API keys -> кнопка Create new key -> вставьте ключ ниже.

## 🛠 Использование

Все узлы работают по двухэтапной схеме:
1.  **Create Task**: Вы отправляете запрос (промпт, настройки) и получаете `taskId`.
2.  **Get Task Status**: Используйте полученный `taskId`, чтобы забрать готовый результат после завершения обработки.

---
💡 **Инструкции и примеры** в нашем телеграм-канале: [https://t.me/myspacet_ai](https://t.me/myspacet_ai)

## Лицензия
MIT