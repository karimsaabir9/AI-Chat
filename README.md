# AI Chat

A Next.js AI chat application built with the [Vercel AI SDK](https://ai-sdk.dev), [better-auth](https://www.better-auth.com), and [Drizzle ORM](https://orm.drizzle.team) over Postgres (Neon).

## Features

- **Streaming chat** with OpenAI (`gpt-4o`), persisted per conversation
- **Guest mode** — chat immediately without an account; sign in later and your conversation carries over
- **Image generation** (`gpt-image-1`) from inside any chat, with one-click download
- **Auto-generated conversation titles** from the first message, shown in a collapsible sidebar (mobile-friendly drawer)
- **Authentication** via email/password and Google OAuth (better-auth), with route protection enforced in middleware
- **Dashboard** with account info and quick actions

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [AI SDK](https://ai-sdk.dev) (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`)
- [better-auth](https://www.better-auth.com) for authentication
- [Drizzle ORM](https://orm.drizzle.team) + [Neon Postgres](https://neon.tech)
- Tailwind CSS v4

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root with:

```bash
OPENAI_API_KEY=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

- `DATABASE_URL` — a Postgres connection string (e.g. from [Neon](https://neon.tech))
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from a [Google OAuth client](https://console.cloud.google.com/apis/credentials) (optional, only needed for "Continue with Google")

### 3. Push the database schema

```bash
npx drizzle-kit push
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Signed-out visitors land directly in guest chat; signed-in users are redirected to the dashboard.

## Project structure

```
app/
  api/            API routes (chat, image generation, auth)
  chat/           Guest + authenticated chat routes
  dashboard/      Account dashboard
  signin/ signup/ Auth pages
components/       Chat UI, sidebar, auth forms
db/               Drizzle schema and client
lib/              Auth config, chat persistence, shared chat helpers
middleware.ts     Route protection (dashboard/chat auth checks)
```

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start the dev server     |
| `npm run build` | Build for production     |
| `npm run start` | Run the production build |
| `npm run lint`  | Lint the codebase        |
