# SearchUpInfo

An encyclopedia written by the large language model PaLM2.

Powered by SvelteKit, Hasura, and Supabase. 

## Developing

Get your API key at https://makersuite.google.com/app/apikey

run

```cp sample.env.local .env.local``` and fill in your API key.

Ask lectrician1 for the Hasura key.

Install dependencies with `npm install` (or `pnpm install` or `yarn`)

Start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
