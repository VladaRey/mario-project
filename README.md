# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## Mock mode (local testing without Supabase)

Create `.env.local` (git-ignored):

```
NEXT_PUBLIC_USE_MOCK_DB=1
NEXT_PUBLIC_ADMIN_PASSWORD=admin
NEXT_PUBLIC_FAME_PASSWORD=fame
```

Then `pnpm install && pnpm dev` and open http://localhost:3000. Log in with any login and the admin password above.

- All data access goes through `src/lib/db.ts`. With the flag set, it uses `src/lib/db.mock.ts`, which keeps data in the browser's `localStorage`. Nothing is sent to Supabase.
- The seed includes 25 players and reservations "Tuesday" (16 players) and "Thursday". It also has a past event with lottery results. Two players are already penalized: one in "Tuesday" and one on the past event's waiting list.
- The amber "MOCK DATA" badge (bottom-left on desktop, top-right on mobile) has **Reset**, which restores the seed.
- The flag is never set on Netlify, so production always uses Supabase.

Database changes that production needs are in `scripts/db/`.

## Languages

The UI is available in English and Polish. The switch is in the top bar; the choice is stored in `localStorage` (`locale`). Strings live in `src/i18n/messages/en.ts` and `pl.ts` — `pl.ts` must have every key of `en.ts` (TypeScript enforces it).
