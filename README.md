# LetzRyd Local Replica

Production-ready Next.js replica of the public LetzRyd website at `https://letzryd.com/`.

The crawler output in this repo preserves the live Hostinger/Astro-rendered DOM, scoped CSS, fonts, images, PDFs, and video assets locally under `public/replica-assets`. The Next app serves those captured pages through a catch-all route so it can run locally now and later deploy cleanly to GCP.

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS configuration
- Framer Motion dependency available for future componentized animation work
- Local static asset mirror for images, SVGs, fonts, PDFs, and videos

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm run start
```

## GCP Deployment Notes

This project uses `output: "standalone"` in `next.config.mjs`, which is suitable for containerized deployment on Cloud Run.

Typical deployment flow:

```bash
npm ci
npm run build
docker build -t letzryd-replica .
gcloud run deploy letzryd-replica --source .
```

Add environment-specific values to `.env.local` during development or your GCP secret/config system for production. The current replica has no backend dependency.

## Recrawl Live Assets

If the live website changes, refresh the captured route HTML and then regenerate local page data:

```bash
npm run recrawl
```

The crawler script expects the downloaded route HTML files in `live-pages/` and the source stylesheet at `live-slug.css`.

## Included Routes

- `/`
- `/know-us`
- `/drivers`
- `/partner`
- `/investors`
- `/blog`
- `/contact-us`
- `/privacy-policy`
- `/drivers-contact`
- `/investors-contact`
- `/letzryd-in-pact-with-mbsi`
- `/letzryd-and-yamaha-firm-in-pact-to-deploy-cng-car-fleet-in-bengaluru`
- `/letzryd-and-mbsi-announce-partnership-for-deployment-of-51-maruti-vehicles-to-enhance-urban-mobility-in-bengaluru`

## Verification Helper

Because this shell did not include `npm`, `scripts/preview-server.mjs` is included for visual QA of the captured DOM/CSS/assets without installing dependencies:

```bash
node scripts/preview-server.mjs
```

Then open `http://localhost:4173`.
