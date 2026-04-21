# 30 Days of Python Math

A 30-day curriculum that teaches practical mathematics through Python-based exercises.

## Snapshot
- Canonical URL: `https://python-math.nealfrazier.tech/`
- Author: `Neal Frazier`
- Stack: `React 19 + TypeScript + Vite 6 + Tailwind CSS 4`
- Deployment target: `Netlify`

## What This Site Delivers
- Structured daily lessons combining math concepts and code
- Interactive coding-oriented learning UX
- AI-assisted feedback path via Gemini API integration points

## Local Development
### Prerequisites
- Node.js 20+
- npm 10+

### Setup
```bash
npm install
cp .env.example .env.local
```

Add your key in `.env.local`:
```env
GEMINI_API_KEY="your_key_here"
```

### Run
```bash
npm run dev
```
App runs on `http://localhost:3000`.

## Build and Quality
```bash
npm run lint
npm run build
npm run preview
```

## Deploy (Netlify)
- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback behavior is configured for Netlify deployment

## SEO Baseline
- Canonical and social URLs point to: `https://python-math.nealfrazier.tech/`
- `robots.txt` and `sitemap.xml` are aligned to the canonical host

## Project Layout
```text
src/
public/
index.html
vite.config.ts
```
