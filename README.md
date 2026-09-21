# Palmara

Upload a palm photo, get an AI-generated reading, pay to unlock more.

## How the palm reading actually works

MediaPipe's hand-landmark model runs **in the visitor's browser**, not on
our server. It finds the hand's skeleton (finger joints, wrist), and from
that we compute a real, measurable ratio (finger length vs. palm length,
and palm length vs. palm width) that classifies the hand into one of four
traditional palmistry shapes: Earth, Air, Fire, or Water. Only those
measurements — never the photo — get sent to our server, which then asks
Claude to write a warm, personalized reading using that hand-shape
classification plus a few seeded details (so the same photo always gets a
consistent reading, since the reading is cached in Supabase by hand shape +
seed + language).

Being upfront: this is not scientifically-validated fortune telling. It's a
traditional classification system turned into personalized-feeling text.
Keep the marketing honest about that (see the site's own privacy/honesty
sections) rather than overclaiming accuracy.

## Local setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your real keys:
   ```
   cp .env.example .env.local
   ```
3. Create the `reports` table in Supabase — open your project's SQL Editor
   and run the contents of `supabase/schema.sql`.
4. Run the dev server:
   ```
   npm run dev
   ```
5. Open http://localhost:3000

## Where to get each key

- **ANTHROPIC_API_KEY** — console.anthropic.com → Settings → API Keys
- **SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY** — supabase.com → your project
  → Settings → API. Create a free project if you haven't yet.
- **RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET** — dashboard.razorpay.com →
  Settings → API Keys (use Test Mode keys until you're ready to go live)
- **RAZORPAY_WEBHOOK_SECRET** — after deploying, go to Razorpay dashboard →
  Settings → Webhooks → Add webhook, point it at
  `https://palmara.in/api/payment/webhook`, select at least the
  `payment.captured` event, and copy the secret it gives you

## Deploying

Push this to your existing `palmara-website` GitHub repo (replacing the old
single HTML file), and Vercel will redeploy automatically. Before it works
in production, add all the environment variables above in **Vercel →
Project → Settings → Environment Variables** — they don't carry over from
your local `.env.local` file automatically. Then create the `reports` table
in your production Supabase project too (same `supabase/schema.sql`).

## How the pieces fit together

- `components/PalmUploader.js` — client-side file picker, runs MediaPipe's
  HandLandmarker in the browser, classifies the hand shape, and calls
  `generate-reading`.
- `lib/handClassifier.js` — the actual geometry → shape → seed logic.
- `app/api/generate-reading` — looks up a cached reading in Supabase by
  hand shape + seed + language, or asks Claude for a new one and saves it.
- `components/ReadingResult.js` / `PaymentButton.js` — shows the free
  teaser, and the "unlock full reading" button.
- `app/api/create-order` — creates a Razorpay order for the unlock.
- `app/api/verify-payment` — verifies the client-side payment signature and
  unlocks the report immediately in the UI.
- `app/api/payment/webhook` — durable backup: Razorpay calls this directly,
  so a report still gets marked paid even if the visitor closes the tab
  right after paying.

## What's still worth finishing

- **Saved reports / sessions**: there's no way yet for a visitor to come
  back and see a past reading later — would need a session token or
  phone-number lookup added, since right now a report is only reachable via
  the id returned at generation time.
- **Photo quality validation**: currently only checks the image is at least
  400x400px and that a hand was detected at all — doesn't yet reject
  blurry or badly-lit-but-technically-detected photos.
- **Pricing/currency**: the unlock price (₹49) is hardcoded in
  `components/PaymentButton.js` — pull it into an env var or a pricing
  config if it needs to change often or vary by market.
