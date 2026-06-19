# Lyntl

**Estate assistance, so you don't have to do it alone.**

Lyntl is an AI-powered estate administration platform delivered through funeral homes. It guides families through 40+ post-loss administrative tasks via a white-labeled partner portal.

## Stack

- **Next.js 15** — App Router, TypeScript, Tailwind CSS
- **Supabase** — PostgreSQL, Auth, Row Level Security
- **Stripe** — $49/family one-time payment
- **Twilio** — SMS delivery to families
- **Anthropic Claude** — AI-generated task lists from intake responses
- **Resend** — Email reminders
- **Vercel** — Deployment

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/partner/login` | Funeral home partner login |
| `/partner/signup` | New partner registration |
| `/partner/dashboard` | Activate families, view status |
| `/f/[token]` | Family portal (redirects to intake or checklist) |
| `/f/[token]/intake` | 5-section branching intake form |
| `/f/[token]/checklist` | AI-generated 90-day task list |
| `/f/[token]/task/[id]` | Individual task + letter template |

## Setup

1. Clone the repo
2. Copy `.env.local.template` to `.env.local` and fill in all values
3. Run schema migration in Supabase SQL Editor (`schema.sql`)
4. `npm install`
5. `npm run dev`

## Environment Variables

See `.env.local.template` for all required variables.

## Database

See `schema.sql` for the complete Supabase migration.
Tables: `partners`, `families`, `intake_responses`, `tasks`, `reminders`, `partner_users`

