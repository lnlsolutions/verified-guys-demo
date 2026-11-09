# The Verified Guys — Funnel Demo + Client Dashboard

Demo build for The Verified Guys by **LNL Solutions**.

Two things live here:

1. **`index.html`** — a modern, funnel-first rebuild of their public site, using their real copy,
   photos, reviews, service areas, and ROC numbers. Includes the **Verified Guy AI** chat widget.
2. **`crm.html`** — the client-facing dashboard showing what their back end looks like from
   Google Ads, Local Services Ads, and Meta: spend, leads, CPL, CPA, booked revenue, ROAS,
   projects in production, and clickable job status.

## The demo trick

The chat widget writes real leads into a shared browser store (`localStorage`), so:

1. Open the site, walk through the AI chat, book a walkthrough.
2. Open the dashboard — that lead is sitting in the Leads table, scored, with its booked slot.
3. Click it to see the lead journey. Click any job card to see where the job sits in production.

Both pages read from the same store, so the hand-off is live in front of them.

## Demo script (5 minutes)

| Step | What to say |
|---|---|
| Open the site | "This is your funnel rebuilt — same proof, one job: get the quote." |
| Scroll to the problem section | "Two-company shuffle versus one team. This is the whole pitch in one graphic." |
| Ask the AI chat a question | "Watch it answer warranty and pricing, then book a walkthrough on its own." |
| Book a slot | "That lead just scored 85 and hit the CRM. Nobody typed anything into a form." |
| Switch to the dashboard | "Here's your side. $4,500 spend, 26 leads, 6 booked, $37,400 revenue, 8.3x." |
| Click the new lead | "Here it is, with the slot and the source." |
| Click a job card | "And here's where every job sits in production." |

## Numbers on the dashboard

Fixed campaign totals match the plan: **$4,500** spend across LSA / Google Ads / Meta,
**26** leads, **6** booked jobs, **$37,400** booked revenue, **$173** CPL, **$750** CPA, **8.3x** ROAS.

**Reset demo data** in the top-right restores the seeded state after a run-through.

## Deploy (GitHub Pages)

Settings → Pages → Source: *Deploy from a branch* → Branch: `main` → Folder: `/ (root)` → Save.
Live in about a minute at `https://lnlsolutions.github.io/verified-guys-demo/`.

## Notes

- Static site: no build step, no server, no dependencies.
- Data lives in the browser only. This is a sales demo, not a production CRM.
- Next step for a real build: swap `localStorage` for the client's CRM and point the chat at a
  model endpoint. The UI, flow, and tracking stay the same.
