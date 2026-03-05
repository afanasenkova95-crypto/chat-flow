# Chat Flow

AI-powered presentation creation tool. Attach a document or link, describe your topic, and the AI builds a full presentation through a conversational chat flow.

## Features

- **Chat-based workflow** — describe your topic, attach files/links, and the AI generates a structured presentation
- **Multiple design themes** — choose from pre-built visual themes
- **Editable structure** — drag, reorder, add, and edit slides before generation
- **Live preview** — split-view with chat on the left and slide preview on the right
- **Full-screen slideshow** — present with keyboard navigation
- **AI-powered editing** — modify the presentation through natural language commands

## Prerequisites

- Node.js 18+
- OpenAI API key
- GitHub personal access token with `read:packages` scope (for `@campstudio/camp-ui-kit`)

## Setup

1. **Clone the repository**

```bash
git clone https://github.com/afanasenkova95-crypto/chat-flow.git
cd chat-flow
```

2. **Create `.env.local`** in the project root:

```
OPENAI_API_KEY=your-openai-api-key
```

3. **Configure npm registry** for the Camp UI Kit package. Add your GitHub token to `~/.npmrc`:

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

4. **Install dependencies**

```bash
npm install
```

5. **Set up fonts**

```bash
npm run setup-fonts
```

6. **Run the app**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **CSS Modules**
- **OpenAI API** (GPT-4)
- **@campstudio/camp-ui-kit**
