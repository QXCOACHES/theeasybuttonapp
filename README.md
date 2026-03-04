# The Easy Button — by Sol

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → import your repo
3. In **Environment Variables**, add:
   - `VITE_ANTHROPIC_API_KEY` = your Anthropic API key
4. Deploy ✦

## Local Development

```bash
npm install
cp .env.example .env
# add your VITE_ANTHROPIC_API_KEY to .env
npm run dev
```
