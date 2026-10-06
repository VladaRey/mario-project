# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle every screen of Mario Group with the "Violet 2.0" design, add a single responsive app shell (bottom tab bar on phones, top nav on desktop), EN/PL switching, a public penalty list, logout and a searchable player picker. Business logic, data and permissions do not change.

**Architecture:**
- Design tokens live in `globals.css` and `tailwind.config.ts`.
- A small set of design-system components live in `src/components/ds/`, and a shell in `src/components/shell/`. One `AppShell` is mounted by the `(app)` and `admin` layouts.
- Strings move into typed flat dictionaries (`src/i18n/`) read through `useT()`.
- Screens are rebuilt on top of these pieces. Their data calls and handlers are kept line for line.

**Tech Stack:** Next.js 16 (App Router, client components), React 18, TypeScript (strict, `noUncheckedIndexedAccess`), Tailwind 3 + `tailwindcss-animate`, shadcn/Radix (`Sheet`, `Dialog`, `AlertDialog`, `Popover`), `cmdk`, `lucide-react`, `date-fns` 4, `sonner`, Jest 29 + ts-jest + Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-10-07-ui-redesign-design.md`. Test cases: `docs/superpowers/specs/2026-10-07-ui-redesign-test-cases.md`. Visual source of truth: the design canvas https://claude.ai/artifact/93jjTm6AfWB6iE1AA71vCa. Artboard names are quoted in each task.

## Global Constraints

- **Do not change** `src/services/calculation-service.ts`, `src/services/calculate-event-statistics-service.ts`, `src/services/lottery-service.ts` or `src/utils/auto-pricing-util.ts`.
- **Data-layer changes only in Task 5 (spec §6a):** `getAllEvents` also reads `paid`, and a new `renameReservationList`. There are no schema migrations. Otherwise screens keep calling exactly the same `*Operations` methods with the same arguments.
- **No new runtime dependencies.** The font comes from `next/font/google` (Manrope, subsets `latin` and `latin-ext`, weights 400/500/600/700/800).
- Breakpoint: **mobile < 768px, desktop ≥ 768px** (Tailwind `md:`).
- **Colours** (hex, from spec §3):
  - violet-900 `#3B1F6E`, violet-700 `#5B2D8C`, violet-600 `#7A3E9D`, violet-50 `#F1EBFB`;
  - coral `#FF7A59` (always with ink text, never white);
  - bg `#F6F4FB`, line `#E7E2F2`, ink `#1C1530`, muted `#6B6384`;
  - danger `#DC2626`; penalty chip `#FEE4E2` / `#B42318`; warning `#FFF4ED` / `#FED7AA` / `#7C2D12`.
- **Every user-visible string goes through `t()`.** This includes toasts, aria-labels and confirm texts. Player and reservation names stay as data.
- Roles: Guest / Fame / Admin as today (`localStorage` keys `admin-password`, `fame-password`; env `NEXT_PUBLIC_ADMIN_PASSWORD`, `NEXT_PUBLIC_FAME_PASSWORD`).
- **New behaviours allowed are only those in spec §9:**
  - logout;
  - language switch;
  - public `/penalties` page;
  - client-side All/Unpaid/Paid filter;
  - lottery Reset confirmation;
  - quiet hints (pricing sources, FAME-cleared, free spots, unsaved marker with leave-guard only when dirty, extended penalty notice);
  - player picker search.
- **Route changes:** new `/penalties`, new `/admin/defaults`, new `/admin/events` (the old `/admin` list moves here), and `/admin` becomes the hub. Nothing else moves.
- **Verification gate for every task:** `npx tsc --noEmit` and `pnpm test` both pass. `pnpm lint` (`next lint`) does not work on Next 16; do not rely on it and do not try to fix it in this plan.
- Work in mock mode for manual checks: `.env.local` with `NEXT_PUBLIC_USE_MOCK_DB=1`, then `pnpm dev`.
- Commit after every task. End every commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Polish text overflow.** PL labels are about 30% longer: the tab bar ("Wydarzenia"), segmented controls and dock buttons must truncate or wrap without overflow at 360px. Task 8 adds a test that `BottomTabBar` labels carry `truncate`. Reviewers check every new row and chip at 360px in PL.
2. **Role changes without reload.** After login or logout the tab bar, account menu and admin-only controls must update at once, in every mounted component. Task 4 pins this with a test where two `useGetRole` consumers both switch after `logout()`.
3. **Diacritics and case in search.** "wozniak", "WOŹNIAK" and "woź" must find "Iga Woźniak". The Polish letter "ł" does not decompose under NFD and needs explicit mapping. Task 9 tests `normalizeForSearch("Łukasz Michał") === "lukasz michal"`.
4. **The leave guard must stay quiet when nothing changed.** The confirm must not fire after Save, after a reload, or on an untouched form. Task 18 tests `isEventFormDirty` on an untouched and a reverted form (returns `false`).
5. **FFP and pricing numbers unchanged.** Any markup change that alters input parsing (for example a stepper sending numbers instead of strings) changes results. Task 1 adds golden tests for both calculators, and Task 12 adds a render test feeding fixed inputs through the restyled `FfpForm` and comparing it with `calculateStatistics`.

---

## File map

**Create**
- `src/i18n/messages/en.ts`, `src/i18n/messages/pl.ts`: flat dictionaries (`MessageKey`, `Messages`).
- `src/i18n/translate.ts`: pure `translate`, `detectLocale`, `formatDuration`.
- `src/i18n/i18n-provider.tsx`: `I18nProvider`, `useI18n`, `useT`.
- `src/hooks/use-media-query.ts`: `useMediaQuery`, `useIsDesktop`.
- `src/hooks/use-penalty-count.ts`.
- `src/components/ds/*`: `player-avatar.tsx`, `chip.tsx`, `list.tsx`, `stat-tile.tsx`, `notice.tsx`, `segmented.tsx`, `stepper.tsx`, `action-dock.tsx`, `more-menu.tsx`, `empty-state.tsx`, `skeleton-rows.tsx`, `section-label.tsx`, `date-tile.tsx`, `responsive-sheet.tsx`.
- `src/components/shell/*`: `app-shell.tsx`, `desktop-top-bar.tsx`, `bottom-tab-bar.tsx`, `screen-header.tsx`, `lang-switch.tsx`, `account-menu.tsx`, `account-sheet.tsx`, `admin-sub-nav.tsx`, `ffp-launcher.tsx`, `navigation-guard.tsx`, `logo.tsx`.
- `src/utils/search.ts`, `src/utils/event-view.ts`, `src/utils/event-form-state.ts`.
- `src/app/(app)/penalties/page.tsx`, `src/app/admin/layout.tsx`, `src/app/admin/events/page.tsx`, `src/app/admin/defaults/page.tsx`.
- Tests in `src/_tests_/`.

**Modify (restyle; logic kept)**
- `src/styles/globals.css`, `tailwind.config.ts`, `jest.config.ts`, `src/app/layout.tsx`, `src/app/(app)/layout.tsx`.
- `src/components/ui/button.tsx`, `src/components/confirmation-dialog.tsx`, `src/components/multi-select.tsx`.
- `src/hooks/use-get-role.ts`.
- Every page under `src/app` and its feature components.

**Delete (at the end, Task 22):** `src/components/navbar.tsx`, `src/components/admin-navbar.tsx`, `src/components/breadcrumbs.component.tsx`, `src/components/event-breadcrumbs.component.tsx`, `src/components/default-values-admin-sheet.component.tsx`, `src/components/players-by-card-type-dropdown.tsx` (if unused). Only delete a file after `grep -rn` shows no imports. Leave `src/components/ffp-sheet.component.tsx` alone (out of scope, spec §10).

### Task 1: Green baseline and golden pricing tests

Today `pnpm test` fails: `new-calc.test.ts` calls `calculateEventStatistics` with 3 arguments, but it takes 4. `tsc` reports 3 errors. This task makes the baseline green and freezes the current maths, **before any other change**.

**Files:**
- Modify: `jest.config.ts`
- Create: `jest.setup.ts`
- Modify: `src/_tests_/new-calc.test.ts` (the two `calculateEventStatistics(` calls)
- Modify: `src/features/players-page/player-info-cards.tsx:18`
- Create: `src/_tests_/golden-pricing.test.ts`

**Interfaces:**
- Produces: Jest supports the `~/` alias, `.css` imports and `@testing-library/jest-dom` matchers in every later test.

- [ ] **Step 1: Configure Jest**

Replace `jest.config.ts` with:

```ts
export default {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/src/$1",
    "\\.(css)$": "identity-obj-proxy",
    "\\.(gif|ttf|eot|svg|png)$": "<rootDir>/test/__ mocks __/fileMock.js",
  },
  setupFiles: ["<rootDir>/jest.env.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
```

Create `jest.env.ts` (runs before any module is imported; `src/lib/db.ts` throws without Supabase env unless mock mode is on):

```ts
process.env.NEXT_PUBLIC_USE_MOCK_DB = "1";
process.env.NEXT_PUBLIC_ADMIN_PASSWORD = "admin";
process.env.NEXT_PUBLIC_FAME_PASSWORD = "fame";
```

Create `jest.setup.ts`:

```ts
import "@testing-library/jest-dom";

beforeEach(() => {
  localStorage.clear();
});
```

- [ ] **Step 2: Fix the stale test calls**

In `src/_tests_/new-calc.test.ts`, add `import { DISCOUNT_PER_USAGE } from "../constants/event-pricing-defaults";` at the top. Then pass `DISCOUNT_PER_USAGE` as the 4th argument to both `calculateEventStatistics(...)` calls (lines 27 and 73). For example, `calculateEventStatistics(event, params, usages)` becomes `calculateEventStatistics(event, params, usages, DISCOUNT_PER_USAGE)`. Keep the existing variable names.

- [ ] **Step 3: Fix the type error in player-info-cards**

In `src/features/players-page/player-info-cards.tsx`, line 18, change

```ts
const { infoCards } = getPlayerCards(player, playerEventDates, lotteryResults.wins, lotteryResults.played);
```

to

```ts
const { infoCards } = getPlayerCards(player, playerEventDates, lotteryResults.wins.length, lotteryResults.played.length);
```

- [ ] **Step 4: Run baseline**

Run: `npx tsc --noEmit && pnpm test`
Expected: no TS errors; 3 suites pass. If an assertion in `new-calc.test.ts` now fails on a value, **stop and report it**. The test's expected values would then be from an older discount, so ask before changing them.

- [ ] **Step 5: Write golden tests for both calculators**

Create `src/_tests_/golden-pricing.test.ts`:

```ts
import { calculateStatistics, type InputDataType } from "~/services/calculation-service";
import { calculateEventStatistics } from "~/services/calculate-event-statistics-service";
import { DISCOUNT_PER_USAGE } from "~/constants/event-pricing-defaults";
import type { CardType, Event, Player } from "~/lib/db";

const base: InputDataType = {
  courts: 3, hours: 2, pricePerHour: 77, fameTotal: 0,
  medicoverOwners: 3, medicoverCardUsages: 2,
  medicoverLightOwners: 2, medicoverLightCardUsages: 1,
  msOwners: 3, msCardUsages: 2,
  msClassicOwners: 2, noCardOwners: 4,
};

describe("FFP calculator golden values (must not change during the redesign)", () => {
  test.each([
    ["spec 5.1 input", base],
    ["with FAME total 300", { ...base, fameTotal: 300 }],
    ["3 hours (MS Classic 1/3)", { ...base, hours: 3 }],
    ["4 hours (MS Classic 1/4)", { ...base, hours: 4 }],
    ["1 hour", { ...base, hours: 1 }],
    ["only no-card players", { ...base, medicoverOwners: 0, medicoverCardUsages: 0, medicoverLightOwners: 0, medicoverLightCardUsages: 0, msOwners: 0, msCardUsages: 0, msClassicOwners: 0, noCardOwners: 8 }],
    ["discount larger than total", { ...base, courts: 1, hours: 1, pricePerHour: 20, medicoverCardUsages: 6 }],
  ])("%s", (_name, input) => {
    expect(calculateStatistics(input)).toMatchSnapshot();
  });
});

const CARDS: CardType[] = ["Medicover", "Multisport", "Classic", "No card", "Medicover Light"];
const players: Player[] = Array.from({ length: 12 }, (_, i) => ({
  id: `p${i + 1}`, name: `P${i + 1}`, cardType: CARDS[i % CARDS.length]!, paid: false, amount: 0,
}));
const event = { id: "e1", name: "Past training", date: "2026-09-29", players } as Event;

describe("Event pricing golden values (must not change during the redesign)", () => {
  test.each([
    ["no usage, no fame", { courts: 3, hours: 2, pricePerHour: 77, fameTotal: null }, {}],
    ["Anna uses card once (spec 0.2)", { courts: 3, hours: 2, pricePerHour: 77, fameTotal: null }, { p1: 1 }],
    ["fame total 100 with usage", { courts: 3, hours: 2, pricePerHour: 77, fameTotal: 100 }, { p1: 1 }],
    ["heavy usage redistributes negatives", { courts: 1, hours: 1, pricePerHour: 40, fameTotal: null }, { p1: 3, p2: 3 }],
  ])("%s", (_name, params, usages: Record<string, number>) => {
    expect(calculateEventStatistics(event, params, usages, DISCOUNT_PER_USAGE)).toMatchSnapshot();
  });
});
```

- [ ] **Step 6: Record the snapshots from the current code**

Run: `pnpm test -- golden-pricing`
Expected: PASS, "11 snapshots written". The file `src/_tests_/__snapshots__/golden-pricing.test.ts.snap` now exists. **Never update this snapshot** (`-u`) in later tasks. A snapshot diff means a task broke the maths.

- [ ] **Step 7: Commit**

```bash
git add jest.config.ts jest.env.ts jest.setup.ts src/_tests_ src/features/players-page/player-info-cards.tsx
git commit -m "test: green baseline and golden pricing snapshots before redesign

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Design tokens, Manrope and Button variants

**Files:**
- Modify: `src/styles/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/utils/getCardTypeColor.ts`
- Test: `src/_tests_/button.test.tsx`

**Interfaces:**
- Produces:
  - Tailwind colours `brand-50/600/700/900`, `coral`, `coral-soft`, `ink`, `line`, `danger-soft`, `danger-ink`, `warn-bg`, `warn-line`, `warn-ink`.
  - `Button` variants `default | accent | outline | secondary | ghost | destructive | link` and sizes `default | sm | lg | icon`.
  - `CARD_TYPE_STYLE: Record<CardType, { soft: string; ink: string; dot: string }>` and `getCardTypeColor(cardType): string` (soft + ink classes).

- [ ] **Step 1: Write the failing test**

`src/_tests_/button.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Button } from "~/components/ui/button";
import { CARD_TYPE_STYLE, getCardTypeColor } from "~/utils/getCardTypeColor";

test("accent button uses coral with ink text", () => {
  render(<Button variant="accent">Add</Button>);
  const b = screen.getByRole("button", { name: "Add" });
  expect(b.className).toContain("bg-coral");
  expect(b.className).toContain("text-ink");
  expect(b.className).not.toContain("text-white");
});

test("card type colours expose soft, ink and dot classes", () => {
  expect(CARD_TYPE_STYLE.Medicover.soft).toBe("bg-[#E0ECFF]");
  expect(getCardTypeColor("No card")).toBe("bg-[#F1F5F9] text-[#475569]");
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test -- button`
Expected: FAIL (`variant="accent"` unknown and `CARD_TYPE_STYLE` not exported).

- [ ] **Step 3: Tokens in globals.css**

Replace the top of `src/styles/globals.css` (from the beginning up to and including the closing `}` of `.dark { … }`) with the block below. Keep the final `@layer base { * {…} body {…} }` block that follows it.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 257 47% 97%;
    --foreground: 256 39% 14%;
    --card: 0 0% 100%;
    --card-foreground: 256 39% 14%;
    --popover: 0 0% 100%;
    --popover-foreground: 256 39% 14%;
    --primary: 261 56% 28%;
    --primary-foreground: 0 0% 100%;
    --secondary: 263 67% 95%;
    --secondary-foreground: 269 51% 36%;
    --muted: 260 45% 94%;
    --muted-foreground: 255 14% 45%;
    --accent: 263 67% 95%;
    --accent-foreground: 261 56% 28%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --border: 259 38% 92%;
    --input: 259 38% 92%;
    --ring: 269 51% 36%;
    --coral: 12 100% 67%;
    --radius: 0.75rem;
    --tabbar-h: 72px;
  }
}

@layer utilities {
  .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
  .pb-tabbar { padding-bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom) + 24px); }
}

@media (prefers-reduced-motion: reduce) {
  .motion-page { animation: none !important; }
}
```

Also delete the old `body { font-family: 'Roboto', … }` rule.

- [ ] **Step 4: Tailwind config**

In `tailwind.config.ts`:
- change `fontFamily.sans` to `['var(--font-manrope)', ...fontFamily.sans]`;
- add `coral: 'hsl(var(--coral))'` inside `colors`;
- add these colour entries next to it:

```ts
brand: { 50: "#F1EBFB", 600: "#7A3E9D", 700: "#5B2D8C", 900: "#3B1F6E" },
"coral-soft": "#FFF1E6",
ink: "#1C1530",
line: "#E7E2F2",
"danger-soft": "#FEE4E2",
"danger-ink": "#B42318",
"warn-bg": "#FFF4ED",
"warn-line": "#FED7AA",
"warn-ink": "#7C2D12",
```

and set `borderRadius` to:

```ts
borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)", xl: "14px", "2xl": "16px", "3xl": "24px" },
```

- [ ] **Step 5: Font in the root layout**

`src/app/layout.tsx`: remove the `geist` import and the duplicated CSS import. Add:

```tsx
import { Manrope } from "next/font/google";
const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700", "800"], variable: "--font-manrope", display: "swap" });
```

and render `<html lang="en" className={manrope.variable}>` with `<body className="bg-background font-sans text-foreground antialiased">`. Leave the `<html lang>` handling to Task 3.

- [ ] **Step 6: Button variants**

In `src/components/ui/button.tsx`, replace the `buttonVariants` definition with:

```ts
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-extrabold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-[#D8D2E6] disabled:text-white disabled:border-transparent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-brand-900 text-white hover:bg-brand-700",
        accent: "bg-coral text-ink hover:bg-[#ff6a45]",
        outline: "border border-line bg-white text-ink hover:bg-brand-50",
        secondary: "bg-brand-50 text-brand-700 hover:bg-[#e6dcf7]",
        ghost: "text-brand-700 hover:bg-brand-50",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        link: "text-brand-700 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-[13px]",
        lg: "h-12 px-6 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
```

- [ ] **Step 7: Card-type colours**

Replace `src/utils/getCardTypeColor.ts` with:

```ts
import { type CardType } from "~/lib/db";

export const CARD_TYPE_STYLE: Record<CardType, { soft: string; ink: string; dot: string }> = {
  Medicover: { soft: "bg-[#E0ECFF]", ink: "text-[#1D4ED8]", dot: "bg-[#1D4ED8]" },
  "Medicover Light": { soft: "bg-[#EFE5FF]", ink: "text-[#6D28D9]", dot: "bg-[#6D28D9]" },
  Multisport: { soft: "bg-[#DCFCE7]", ink: "text-[#15803D]", dot: "bg-[#15803D]" },
  Classic: { soft: "bg-[#FEF3C7]", ink: "text-[#B45309]", dot: "bg-[#B45309]" },
  "No card": { soft: "bg-[#F1F5F9]", ink: "text-[#475569]", dot: "bg-[#475569]" },
};

export function getCardTypeColor(cardType: CardType): string {
  const s = CARD_TYPE_STYLE[cardType] ?? CARD_TYPE_STYLE["No card"];
  return `${s.soft} ${s.ink}`;
}
```

Run `grep -rn "getCardVariant" src`. If `src/lib/color-util.ts` is still imported by `event-card.tsx`, leave it for now; Task 9 removes the usage.

- [ ] **Step 8: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS, and the golden snapshots are unchanged. Run `pnpm dev`, open http://localhost:3000: the page background is lilac and the text uses Manrope.

- [ ] **Step 9: Commit**

```bash
git add src/styles/globals.css tailwind.config.ts src/app/layout.tsx src/components/ui/button.tsx src/utils/getCardTypeColor.ts src/_tests_/button.test.tsx
git commit -m "feat(ui): Violet 2.0 tokens, Manrope font and button variants

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: i18n core (EN/PL)

**Files:**
- Create: `src/i18n/messages/en.ts`, `src/i18n/messages/pl.ts`, `src/i18n/translate.ts`, `src/i18n/i18n-provider.tsx`
- Modify: `src/app/layout.tsx`
- Test: `src/_tests_/i18n.test.ts`

**Interfaces:**
- Produces:
  - `type Locale = "en" | "pl"`
  - `type PluralMessage = { one: string; few?: string; many?: string; other: string }`
  - `type MessageKey = keyof typeof en`
  - `type Messages = Record<MessageKey, string | PluralMessage>`
  - `translate(locale: Locale, key: MessageKey, params?: Record<string, string | number>): string`. When the message is a `PluralMessage`, `params.count` (number) picks the form with `Intl.PluralRules(locale)`. `{name}` placeholders are replaced.
  - `detectLocale(stored: string | null, navigatorLanguage: string | undefined): Locale`
  - `LOCALE_STORAGE_KEY = "locale"`
  - `formatDate(date: Date | string, pattern: string, locale: Locale): string` (date-fns with `enGB` or `pl`)
  - `daysSince(iso: string, now?: Date): number` (whole days, minimum 0)
  - `I18nProvider({ children })`, `useI18n(): { locale; setLocale(l: Locale): void; t: typeof translate-bound; fmt(date, pattern): string }`, `useT(): (key: MessageKey, params?) => string`
- **Rule for later tasks:** each screen task adds its keys to **both** `en.ts` and `pl.ts`. `pl.ts` is typed `Messages`, so a missing key fails `tsc`.

- [ ] **Step 1: Write the failing test**

`src/_tests_/i18n.test.ts`:

```ts
import { translate, detectLocale, daysSince } from "~/i18n/translate";
import { en } from "~/i18n/messages/en";
import { pl } from "~/i18n/messages/pl";

test("pl has exactly the en keys", () => {
  expect(Object.keys(pl).sort()).toEqual(Object.keys(en).sort());
});

test("interpolates params", () => {
  expect(translate("en", "account.loggedInAs", { role: "Admin" })).toBe("Logged in as Admin");
});

test("polish plurals for days", () => {
  expect(translate("pl", "penalties.days", { count: 1 })).toBe("1 dzień");
  expect(translate("pl", "penalties.days", { count: 3 })).toBe("3 dni");
  expect(translate("pl", "penalties.days", { count: 5 })).toBe("5 dni");
  expect(translate("en", "penalties.days", { count: 1 })).toBe("1 day");
  expect(translate("en", "penalties.days", { count: 3 })).toBe("3 days");
});

test("detectLocale prefers stored value, then browser language", () => {
  expect(detectLocale("pl", "en-US")).toBe("pl");
  expect(detectLocale(null, "pl-PL")).toBe("pl");
  expect(detectLocale(null, "de-DE")).toBe("en");
  expect(detectLocale("xx", undefined)).toBe("en");
});

test("daysSince counts whole days and never goes negative", () => {
  const now = new Date("2026-10-07T12:00:00Z");
  expect(daysSince("2026-10-04T12:00:00Z", now)).toBe(3);
  expect(daysSince("2026-10-07T08:00:00Z", now)).toBe(0);
  expect(daysSince("2026-10-09T08:00:00Z", now)).toBe(0);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test -- i18n`
Expected: FAIL ("Cannot find module '~/i18n/translate'").

- [ ] **Step 3: Dictionaries (shell and common keys)**

`src/i18n/messages/en.ts`:

```ts
export type PluralMessage = { one: string; few?: string; many?: string; other: string };

export const en = {
  "app.name": "Mario Group",
  "nav.events": "Events",
  "nav.players": "Players",
  "nav.penalties": "Penalties",
  "nav.admin": "Admin",
  "nav.login": "Log in",
  "nav.fame": "Fame",
  "nav.ffp": "FFP",
  "nav.ffpCalculator": "FFP calculator",
  "nav.back": "Back",
  "nav.main": "Main",
  "nav.breadcrumb": "Breadcrumb",
  "lang.switch": "Language",
  "account.loggedInAs": "Logged in as {role}",
  "account.onThisDevice": "on this device",
  "account.logout": "Log out",
  "account.adminPanel": "Admin panel",
  "account.title": "Account",
  "account.fameCan1": "Mark payments as paid",
  "account.fameCan2": "Change card usage per player",
  "account.fameCan3": "Apply event pricing",
  "role.admin": "Admin",
  "role.fame": "Fame",
  "admin.nav": "Admin",
  "admin.events": "Events",
  "admin.players": "Players",
  "admin.reservations": "Reservations",
  "admin.penalties": "Penalties",
  "admin.defaults": "Defaults",
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.save": "Save",
  "common.close": "Close",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.remove": "Remove",
  "common.add": "Add",
  "common.more": "More actions",
  "common.areYouSure": "Are you sure?",
  "common.loading": "Loading…",
  "common.decrease": "Decrease",
  "common.increase": "Increase",
  "common.leaveUnsaved": "You have unsaved changes. Leave without saving?",
  "common.unsaved": "Unsaved changes",
  "common.search": "Search",
  "common.noResults": "No players found",
  "common.pln": "{value} PLN",
  "common.players": { one: "{count} player", other: "{count} players" },
  "penalty.chip": "Penalty",
  "penalties.days": { one: "{count} day", other: "{count} days" },
  "cardType.Medicover": "Medicover",
  "cardType.Medicover Light": "Medicover Light",
  "cardType.Multisport": "Multisport",
  "cardType.Classic": "Classic",
  "cardType.No card": "No card",
} satisfies Record<string, string | PluralMessage>;

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string | PluralMessage>;
```

`src/i18n/messages/pl.ts`:

```ts
import type { Messages } from "./en";

export const pl: Messages = {
  "app.name": "Mario Group",
  "nav.events": "Wydarzenia",
  "nav.players": "Gracze",
  "nav.penalties": "Kary",
  "nav.admin": "Admin",
  "nav.login": "Zaloguj",
  "nav.fame": "Fame",
  "nav.ffp": "FFP",
  "nav.ffpCalculator": "Kalkulator FFP",
  "nav.back": "Wstecz",
  "nav.main": "Główna",
  "nav.breadcrumb": "Ścieżka",
  "lang.switch": "Język",
  "account.loggedInAs": "Zalogowano jako {role}",
  "account.onThisDevice": "na tym urządzeniu",
  "account.logout": "Wyloguj",
  "account.adminPanel": "Panel admina",
  "account.title": "Konto",
  "account.fameCan1": "Oznaczanie płatności",
  "account.fameCan2": "Zmiana użycia kart graczy",
  "account.fameCan3": "Zatwierdzanie cen wydarzenia",
  "role.admin": "Admin",
  "role.fame": "Fame",
  "admin.nav": "Admin",
  "admin.events": "Wydarzenia",
  "admin.players": "Gracze",
  "admin.reservations": "Rezerwacje",
  "admin.penalties": "Kary",
  "admin.defaults": "Domyślne",
  "common.cancel": "Anuluj",
  "common.confirm": "Potwierdź",
  "common.save": "Zapisz",
  "common.close": "Zamknij",
  "common.delete": "Usuń",
  "common.edit": "Edytuj",
  "common.remove": "Usuń",
  "common.add": "Dodaj",
  "common.more": "Więcej akcji",
  "common.areYouSure": "Na pewno?",
  "common.loading": "Ładowanie…",
  "common.decrease": "Zmniejsz",
  "common.increase": "Zwiększ",
  "common.leaveUnsaved": "Masz niezapisane zmiany. Wyjść bez zapisywania?",
  "common.unsaved": "Niezapisane zmiany",
  "common.search": "Szukaj",
  "common.noResults": "Nie znaleziono graczy",
  "common.pln": "{value} zł",
  "common.players": { one: "{count} gracz", few: "{count} gracze", many: "{count} graczy", other: "{count} gracza" },
  "penalty.chip": "Kara",
  "penalties.days": { one: "{count} dzień", few: "{count} dni", many: "{count} dni", other: "{count} dnia" },
  "cardType.Medicover": "Medicover",
  "cardType.Medicover Light": "Medicover Light",
  "cardType.Multisport": "Multisport",
  "cardType.Classic": "Classic",
  "cardType.No card": "Bez karty",
};
```

Polish plural forms: one = 1, few = 2–4 (but not 12–14), many = 0 and 5+, other = fractions. Every PL plural entry needs all four.

- [ ] **Step 4: translate.ts**

```ts
import { format as formatFns } from "date-fns";
import { enGB, pl as plLocale } from "date-fns/locale";
import { en, type MessageKey, type Messages, type PluralMessage } from "./messages/en";
import { pl } from "./messages/pl";

export type Locale = "en" | "pl";
export const LOCALE_STORAGE_KEY = "locale";
const DICTS: Record<Locale, Messages> = { en, pl };

export function translate(
  locale: Locale,
  key: MessageKey,
  params: Record<string, string | number> = {},
): string {
  const msg = DICTS[locale][key] ?? en[key];
  let text: string;
  if (typeof msg === "string") {
    text = msg;
  } else {
    const p = msg as PluralMessage;
    const count = Number(params.count ?? 0);
    const form = new Intl.PluralRules(locale).select(count) as keyof PluralMessage;
    text = p[form] ?? p.other;
  }
  return text.replace(/\{(\w+)\}/g, (_, name: string) =>
    params[name] !== undefined ? String(params[name]) : `{${name}}`,
  );
}

export function detectLocale(stored: string | null, navigatorLanguage: string | undefined): Locale {
  if (stored === "en" || stored === "pl") return stored;
  return navigatorLanguage?.toLowerCase().startsWith("pl") ? "pl" : "en";
}

export function formatDate(date: Date | string, pattern: string, locale: Locale): string {
  return formatFns(typeof date === "string" ? new Date(date) : date, pattern, {
    locale: locale === "pl" ? plLocale : enGB,
  });
}

export function daysSince(iso: string, now: Date = new Date()): number {
  const diff = now.getTime() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}
```

- [ ] **Step 5: Provider**

`src/i18n/i18n-provider.tsx`:

```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { detectLocale, formatDate, LOCALE_STORAGE_KEY, translate, type Locale } from "./translate";
import type { MessageKey } from "./messages/en";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  fmt: (date: Date | string, pattern: string) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    let stored: string | null = null;
    try { stored = localStorage.getItem(LOCALE_STORAGE_KEY); } catch { /* storage blocked */ }
    setLocaleState(detectLocale(stored, navigator.language));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem(LOCALE_STORAGE_KEY, l); } catch { /* storage blocked */ }
  }, []);

  const value = useMemo<Ctx>(() => ({
    locale,
    setLocale,
    t: (key, params) => translate(locale, key, params),
    fmt: (date, pattern) => formatDate(date, pattern, locale),
  }), [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

export const useT = () => useI18n().t;
```

- [ ] **Step 6: Mount the provider**

In `src/app/layout.tsx`, wrap `{children}` and `<MockDbBanner />` in `<I18nProvider>` (import from `~/i18n/i18n-provider`).

For component tests in later tasks, create `src/_tests_/test-utils.tsx`:

```tsx
import { render, type RenderOptions } from "@testing-library/react";
import { I18nProvider } from "~/i18n/i18n-provider";

export function renderWithI18n(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: ({ children }) => <I18nProvider>{children}</I18nProvider>, ...options });
}
```

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS (the i18n tests are green).

- [ ] **Step 8: Commit**

```bash
git add src/i18n src/app/layout.tsx src/_tests_/i18n.test.ts src/_tests_/test-utils.tsx
git commit -m "feat(i18n): EN/PL dictionaries, translate with plurals, provider

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Shared role store with logout

Today every `useGetRole()` call keeps its own `useState`, so a login or logout in one component is not seen by the tab bar. This task replaces it with one store read through `useSyncExternalStore`. The API stays compatible: `{ role, login }`, plus a new `logout`.

**Files:**
- Modify: `src/hooks/use-get-role.ts`
- Test: `src/_tests_/use-get-role.test.tsx`

**Interfaces:**
- Produces:
  - `roleFromStorage(adminPw: string | null, famePw: string | null, envAdmin?: string, envFame?: string): Role` (pure)
  - `useGetRole(): { role: Role; login(password: string): Role; logout(): void }`
  - DOM event name `ROLE_CHANGE_EVENT = "mg:role-change"`

- [ ] **Step 1: Write the failing test**

```tsx
import { act, render, screen } from "@testing-library/react";
import { roleFromStorage, useGetRole } from "~/hooks/use-get-role";
import { Role } from "~/lib/roles";

test("roleFromStorage", () => {
  expect(roleFromStorage("a", null, "a", "f")).toBe(Role.Admin);
  expect(roleFromStorage(null, "f", "a", "f")).toBe(Role.Fame);
  expect(roleFromStorage("wrong", "wrong", "a", "f")).toBe(Role.Guest);
  expect(roleFromStorage(null, null, undefined, undefined)).toBe(Role.Guest);
});

function Probe({ id }: { id: string }) {
  const { role, logout } = useGetRole();
  return <button data-testid={id} onClick={logout}>{role}</button>;
}

test("logout updates every mounted consumer", () => {
  localStorage.setItem("admin-password", "admin");
  render(<><Probe id="a" /><Probe id="b" /></>);
  expect(screen.getByTestId("a")).toHaveTextContent("admin");
  act(() => screen.getByTestId("a").click());
  expect(screen.getByTestId("a")).toHaveTextContent("guest");
  expect(screen.getByTestId("b")).toHaveTextContent("guest");
  expect(localStorage.getItem("admin-password")).toBeNull();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test -- use-get-role`
Expected: FAIL (`roleFromStorage` not exported).

- [ ] **Step 3: Implement**

Replace `src/hooks/use-get-role.ts`:

```ts
import { useCallback, useSyncExternalStore } from "react";
import { Role } from "~/lib/roles";

export const ROLE_CHANGE_EVENT = "mg:role-change";
const ADMIN_KEY = "admin-password";
const FAME_KEY = "fame-password";

export function roleFromStorage(
  adminPw: string | null,
  famePw: string | null,
  envAdmin: string | undefined = process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
  envFame: string | undefined = process.env.NEXT_PUBLIC_FAME_PASSWORD,
): Role {
  if (envAdmin && adminPw === envAdmin) return Role.Admin;
  if (envFame && famePw === envFame) return Role.Fame;
  return Role.Guest;
}

function read(): Role {
  try {
    return roleFromStorage(localStorage.getItem(ADMIN_KEY), localStorage.getItem(FAME_KEY));
  } catch {
    return Role.Guest;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(ROLE_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(ROLE_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const notify = () => window.dispatchEvent(new Event(ROLE_CHANGE_EVENT));

export function useGetRole() {
  const role = useSyncExternalStore(subscribe, read, () => Role.Guest);

  const login = useCallback((password: string): Role => {
    const next = roleFromStorage(password, password);
    try {
      if (next === Role.Admin) localStorage.setItem(ADMIN_KEY, password);
      if (next === Role.Fame) localStorage.setItem(FAME_KEY, password);
    } catch { /* storage blocked */ }
    notify();
    return next;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(ADMIN_KEY);
      localStorage.removeItem(FAME_KEY);
    } catch { /* storage blocked */ }
    notify();
  }, []);

  return { role, login, logout };
}
```

Note: the old login used `===` against the env vars at module load, and a wrong password left storage untouched. Both behaviours are kept. `withAuth` keeps reading `localStorage` directly and does not change.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS. In `pnpm dev`, log in on `/login` with the admin password. The old navbar now shows "Admin" without a reload.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-get-role.ts src/_tests_/use-get-role.test.tsx
git commit -m "feat(auth): shared role store with logout

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Data layer — paid status in event list, reservation rename

Spec §6a. These are query changes only, with no schema migration. Each change is made in both `db.ts` (Supabase) and `db.mock.ts`.

**Files:**
- Modify: `src/lib/db.ts` (`getAllEvents` ≈ line 581, `supabaseReservationOperations` ≈ line 200)
- Modify: `src/lib/db.mock.ts` (`mockEventOperations.getAllEvents` ≈ line 438, `mockReservationOperations` ≈ line 293)
- Test: `src/_tests_/db-mock.test.ts`

**Interfaces:**
- Produces:
  - `eventOperations.getAllEvents()`: every `Event.players[i].paid` is the real `player_events.paid` (previously always `undefined` / `false`).
  - `reservationOperations.renameReservationList(id: string, name: string): Promise<void>`.

- [ ] **Step 1: Write the failing test**

```ts
import { mockEventOperations, mockReservationOperations, resetMockDb } from "~/lib/db.mock";

beforeEach(() => resetMockDb());

test("getAllEvents carries real paid status", async () => {
  await mockEventOperations.updatePlayerPayment("e1", "p1", true);
  const grouped = await mockEventOperations.getAllEvents();
  const e1 = Object.values(grouped).flat().find((e) => e.id === "e1")!;
  expect(e1.players.find((p) => p.id === "p1")!.paid).toBe(true);
  expect(e1.players.find((p) => p.id === "p2")!.paid).toBe(false);
});

test("renameReservationList renames and keeps players", async () => {
  await mockReservationOperations.renameReservationList("r1", "Wtorek");
  const lists = await mockReservationOperations.getAllReservationLists();
  const r1 = lists.find((r) => r.id === "r1")!;
  expect(r1.name).toBe("Wtorek");
  expect(r1.players).toHaveLength(16);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test -- db-mock`
Expected: FAIL (the first test because `paid` is `false`, the second because `renameReservationList` is not a function).

- [ ] **Step 3: Mock implementation**

In `db.mock.ts`, `mockEventOperations.getAllEvents`, replace the loop line

```ts
for (const e of events) (grouped[e.date] ??= []).push(toEvent(db, e));
```

with

```ts
for (const e of events) {
  const ev = toEvent(db, e);
  ev.players = ev.players.map((p) => ({
    ...p,
    paid: db.playerEvents.find((x) => x.event_id === e.id && x.player_id === p.id)?.paid ?? false,
  }));
  (grouped[e.date] ??= []).push(ev);
}
```

Add to `mockReservationOperations`:

```ts
async renameReservationList(id: string, name: string): Promise<void> {
  write((db) => {
    const row = db.reservations.find((r) => r.id === id);
    if (!row) throw fail(`reservation ${id} not found`);
    row.name = name;
  });
},
```

- [ ] **Step 4: Supabase implementation**

In `db.ts`, `getAllEvents`, change the select to

```ts
`id, name, created_at, date, hours, courts, price_per_hour, fame_total, players:player_events(paid, player:players(id, name, created_at, cardType, penalty_since))`
```

and the mapping line `players: event.players.flatMap((pe: any) => pe.player),` to

```ts
players: event.players.map((pe: any) => ({ ...pe.player, paid: pe.paid ?? false })),
```

Add to `supabaseReservationOperations`:

```ts
async renameReservationList(id: string, name: string): Promise<void> {
  const { error } = await supabase.from("reservation_lists").update({ name }).eq("id", id);
  if (error) throw error;
},
```

`reservationOperations` is typed `typeof supabaseReservationOperations`, so `tsc` fails if the mock is missing the method.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS.

**Before deploy** (note it in the PR description): check that the Supabase row-level security policy on `reservation_lists` allows `update` for the anon key that is used today for insert and delete. If it does not, add a policy in a `scripts/db/002_…sql` file following the existing `scripts/db` convention.

- [ ] **Step 6: Commit**

```bash
git add src/lib/db.ts src/lib/db.mock.ts src/_tests_/db-mock.test.ts
git commit -m "feat(db): paid status in event list, rename reservation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Design-system primitives

All components live in `src/components/ds/`. They follow the "Tokens & components" artboard. Every component that shows text takes it from props or `useT()`.

**Files:**
- Create: `src/components/ds/player-avatar.tsx`, `chip.tsx`, `list.tsx`, `stat-tile.tsx`, `notice.tsx`, `segmented.tsx`, `stepper.tsx`, `action-dock.tsx`, `empty-state.tsx`, `skeleton-rows.tsx`, `section-label.tsx`, `date-tile.tsx`, `page-body.tsx`
- Modify: `src/components/penalty-badge.tsx`
- Modify: `src/components/mock-db-banner.tsx` (keep it above the tab bar)
- Test: `src/_tests_/ds.test.tsx`

**Interfaces (Produces):**

```ts
initials(name: string): string                                  // "Ewa Kamińska" -> "EK"
PlayerAvatar(props: { name: string; cardType: CardType; size?: "sm" | "md" | "lg"; className?: string })
Chip(props: { tone?: "violet" | "danger" | "warning" | "success" | "neutral" | "onDark"; className?: string; children: ReactNode })
CardTypeChip(props: { cardType: CardType; short?: boolean })
PenaltyBadge(props: { player: Pick<Player, "penalty_since"> })     // renders Chip tone="danger" t("penalty.chip") or null
ListCard(props: { className?: string; children: ReactNode })
ListRow(props: { leading?: ReactNode; title: ReactNode; meta?: ReactNode; trailing?: ReactNode; href?: string; muted?: boolean; className?: string })
StatTile(props: { label: string; value: ReactNode; sub?: ReactNode; tone?: "default" | "onDark"; progress?: number /*0..100*/; valueClassName?: string })
Notice(props: { tone?: "warning" | "info"; children: ReactNode; className?: string })
Segmented<T extends string>(props: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; ariaLabel: string; className?: string })
Stepper(props: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; size?: "sm" | "lg"; label: string })
ActionDock(props: { children: ReactNode })                         // mobile only, fixed above the tab bar
EmptyState(props: { icon?: ReactNode; title: string; text?: string; action?: ReactNode })
SkeletonRows(props: { count?: number })
SectionLabel(props: { children: ReactNode; className?: string })
DateTile(props: { date: string /*ISO*/ })
PageBody(props: { children: ReactNode; className?: string })       // centred container, max 1200px
```

- [ ] **Step 1: Write the failing test**

`src/_tests_/ds.test.tsx`:

```tsx
import { fireEvent, screen } from "@testing-library/react";
import { renderWithI18n } from "./test-utils";
import { initials } from "~/components/ds/player-avatar";
import { Stepper } from "~/components/ds/stepper";
import { Segmented } from "~/components/ds/segmented";
import { PenaltyBadge } from "~/components/penalty-badge";

test("initials", () => {
  expect(initials("Ewa Kamińska")).toBe("EK");
  expect(initials("  anna  ")).toBe("A");
});

test("stepper respects min and max", () => {
  const onChange = jest.fn();
  renderWithI18n(<Stepper value={1} min={1} max={2} onChange={onChange} label="Courts" />);
  expect(screen.getByRole("button", { name: /Decrease/ })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: /Increase/ }));
  expect(onChange).toHaveBeenCalledWith(2);
});

test("stepper keeps decimal steps exact", () => {
  const onChange = jest.fn();
  renderWithI18n(<Stepper value={1.5} min={1} max={4} step={0.5} onChange={onChange} label="Hours" />);
  fireEvent.click(screen.getByRole("button", { name: /Increase/ }));
  expect(onChange).toHaveBeenCalledWith(2);
});

test("segmented exposes tabs with aria-selected", () => {
  const onChange = jest.fn();
  renderWithI18n(<Segmented ariaLabel="Filter" value="all" onChange={onChange}
    options={[{ value: "all", label: "All" }, { value: "paid", label: "Paid" }]} />);
  expect(screen.getByRole("tab", { name: "All" })).toHaveAttribute("aria-selected", "true");
  fireEvent.click(screen.getByRole("tab", { name: "Paid" }));
  expect(onChange).toHaveBeenCalledWith("paid");
});

test("penalty badge only for penalized", () => {
  const { rerender } = renderWithI18n(<PenaltyBadge player={{ penalty_since: null }} />);
  expect(screen.queryByText("Penalty")).toBeNull();
  rerender(<PenaltyBadge player={{ penalty_since: "2026-10-01" }} />);
  expect(screen.getByText("Penalty")).toBeInTheDocument();
});
```

Note: `rerender` from `renderWithI18n` keeps the wrapper, because RTL re-applies the `wrapper` option.

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test -- ds`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement the components**

`player-avatar.tsx`

```tsx
import { cn } from "~/lib/utils";
import type { CardType } from "~/lib/db";
import { CARD_TYPE_STYLE } from "~/utils/getCardTypeColor";

export function initials(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

const SIZES = { sm: "h-8 w-8 text-[11px]", md: "h-9 w-9 text-xs", lg: "h-16 w-16 text-xl" } as const;

export function PlayerAvatar({ name, cardType, size = "md", className }: { name: string; cardType: CardType; size?: keyof typeof SIZES; className?: string }) {
  const s = CARD_TYPE_STYLE[cardType] ?? CARD_TYPE_STYLE["No card"];
  return (
    <span aria-hidden="true" className={cn("flex flex-none items-center justify-center rounded-full font-extrabold", s.soft, s.ink, SIZES[size], className)}>
      {initials(name)}
    </span>
  );
}
```

`chip.tsx`

```tsx
"use client";
import { cn } from "~/lib/utils";
import type { CardType } from "~/lib/db";
import { CARD_TYPE_STYLE } from "~/utils/getCardTypeColor";
import { getCardTypeDisplayLabel } from "~/utils/card-type-display";
import { useT } from "~/i18n/i18n-provider";

const BASE = "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-extrabold";
const TONES = {
  violet: "bg-brand-50 text-brand-700",
  danger: "bg-danger-soft text-danger-ink",
  warning: "bg-coral-soft text-[#9A3412]",
  success: "bg-[#DCFCE7] text-[#15803D]",
  neutral: "bg-[#F1F5F9] text-[#475569]",
  onDark: "bg-white/15 text-white",
} as const;

export function Chip({ tone = "neutral", className, children }: { tone?: keyof typeof TONES; className?: string; children: React.ReactNode }) {
  return <span className={cn(BASE, TONES[tone], className)}>{children}</span>;
}

export function CardTypeChip({ cardType, short = false }: { cardType: CardType; short?: boolean }) {
  const t = useT();
  const s = CARD_TYPE_STYLE[cardType] ?? CARD_TYPE_STYLE["No card"];
  return <span className={cn(BASE, s.soft, s.ink)}>{short ? getCardTypeDisplayLabel(cardType) : t(`cardType.${cardType}`)}</span>;
}
```

(`t(\`cardType.${cardType}\`)` type-checks because the template literal type is a union of existing `MessageKey`s.)

`penalty-badge.tsx` (replace):

```tsx
"use client";
import { Chip } from "~/components/ds/chip";
import { isPenalized } from "~/utils/penalty-util";
import { useT } from "~/i18n/i18n-provider";
import type { Player } from "~/lib/db";

export function PenaltyBadge({ player }: { player: Pick<Player, "penalty_since"> }) {
  const t = useT();
  if (!isPenalized(player)) return null;
  return <Chip tone="danger">{t("penalty.chip")}</Chip>;
}
```

`list.tsx`

```tsx
import Link from "next/link";
import { cn } from "~/lib/utils";

export function ListCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("divide-y divide-[#F0ECF7] rounded-2xl border border-line bg-white px-3 md:px-5", className)}>{children}</div>;
}

type RowProps = { leading?: React.ReactNode; title: React.ReactNode; meta?: React.ReactNode; trailing?: React.ReactNode; href?: string; muted?: boolean; className?: string };

export function ListRow({ leading, title, meta, trailing, href, muted, className }: RowProps) {
  const body = (
    <>
      {leading}
      <div className="min-w-0 flex-1">
        <div className={cn("truncate text-sm font-bold", muted && "text-muted-foreground")}>{title}</div>
        {meta ? <div className="truncate text-xs text-muted-foreground">{meta}</div> : null}
      </div>
      {trailing}
    </>
  );
  const cls = cn("flex min-h-[52px] items-center gap-3 py-2", className);
  return href ? <Link href={href} className={cn(cls, "-mx-3 px-3 hover:bg-brand-50/60 md:-mx-5 md:px-5")}>{body}</Link> : <div className={cls}>{body}</div>;
}
```

`stat-tile.tsx`

```tsx
import { cn } from "~/lib/utils";

export function StatTile({ label, value, sub, tone = "default", progress, valueClassName }: {
  label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: "default" | "onDark"; progress?: number; valueClassName?: string;
}) {
  const dark = tone === "onDark";
  return (
    <div className={cn("rounded-xl px-3 py-2.5 md:rounded-2xl md:px-[18px] md:py-4", dark ? "bg-white/[0.12] text-white" : "border border-line bg-white")}>
      <div className={cn("text-[11px] font-extrabold uppercase tracking-[0.06em] md:text-xs", dark ? "text-[#D9CCF0]" : "text-muted-foreground")}>{label}</div>
      <div className={cn("mt-0.5 text-xl font-extrabold md:mt-1 md:text-[30px]", valueClassName)}>
        {value}
        {sub ? <span className={cn("ml-1 text-sm md:text-base", dark ? "text-[#D9CCF0]" : "text-muted-foreground")}>{sub}</span> : null}
      </div>
      {progress !== undefined ? (
        <div className="mt-2 h-1.5 rounded-full bg-[#ECE7F6]" aria-hidden="true">
          <div className="h-full rounded-full bg-coral" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
      ) : null}
    </div>
  );
}
```

`notice.tsx`

```tsx
import { AlertTriangle, Info } from "lucide-react";
import { cn } from "~/lib/utils";

export function Notice({ tone = "warning", children, className }: { tone?: "warning" | "info"; children: React.ReactNode; className?: string }) {
  const warn = tone === "warning";
  const Icon = warn ? AlertTriangle : Info;
  return (
    <div role="status" className={cn("flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[13px] leading-snug",
      warn ? "border-warn-line bg-warn-bg text-warn-ink" : "border-[#E2D6F5] bg-brand-50 text-brand-900", className)}>
      <Icon className={cn("mt-0.5 h-4 w-4 flex-none", warn ? "text-[#C2410C]" : "text-brand-700")} aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
```

`segmented.tsx`

```tsx
"use client";
import { cn } from "~/lib/utils";

export function Segmented<T extends string>({ value, onChange, options, ariaLabel, className }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; ariaLabel: string; className?: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn("grid rounded-xl bg-[#ECE7F6] p-[3px] text-[13px] font-bold", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" role="tab" aria-selected={on} onClick={() => onChange(o.value)}
            className={cn("min-h-9 truncate rounded-[10px] px-2 py-2", on ? "bg-white text-ink shadow-sm" : "text-muted-foreground")}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
```

`stepper.tsx`

```tsx
"use client";
import { Minus, Plus } from "lucide-react";
import { cn } from "~/lib/utils";
import { useT } from "~/i18n/i18n-provider";

export function Stepper({ value, onChange, min = 0, max = Number.POSITIVE_INFINITY, step = 1, size = "sm", label }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; size?: "sm" | "lg"; label: string;
}) {
  const t = useT();
  const round = (n: number) => Math.round(n * 1000) / 1000;
  const btn = cn("flex items-center justify-center border border-line bg-white text-ink disabled:opacity-40",
    size === "lg" ? "h-10 w-10 rounded-xl" : "h-8 w-8 rounded-lg");
  return (
    <div className={cn("flex items-center font-extrabold", size === "lg" ? "gap-3 text-lg" : "gap-1.5 text-[13px]")} role="group" aria-label={label}>
      <button type="button" className={btn} aria-label={`${t("common.decrease")} ${label}`} disabled={value - step < min}
        onClick={() => onChange(round(value - step))}><Minus className="h-4 w-4" /></button>
      <span className="min-w-[1.5rem] text-center tabular-nums" aria-live="polite">{value}</span>
      <button type="button" className={btn} aria-label={`${t("common.increase")} ${label}`} disabled={value + step > max}
        onClick={() => onChange(round(value + step))}><Plus className="h-4 w-4" /></button>
    </div>
  );
}
```

`action-dock.tsx`

```tsx
export function ActionDock({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 z-30 flex items-center gap-2 border-t border-line bg-white px-4 py-2.5 shadow-[0_-6px_16px_rgba(28,21,48,0.06)] md:hidden"
      style={{ bottom: "calc(var(--tabbar-h) + env(safe-area-inset-bottom))" }}>
      {children}
    </div>
  );
}
```

Screens that use `ActionDock` add an extra `pb-20` to their body so the last row is not hidden.

`empty-state.tsx`

```tsx
export function EmptyState({ icon, title, text, action }: { icon?: React.ReactNode; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border-[1.5px] border-dashed border-[#D8D2E6] px-6 py-8 text-center">
      {icon ? <div className="text-brand-700">{icon}</div> : null}
      <div className="text-[15px] font-extrabold">{title}</div>
      {text ? <div className="text-[13px] text-muted-foreground">{text}</div> : null}
      {action}
    </div>
  );
}
```

`skeleton-rows.tsx`

```tsx
export function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-[#F0ECF7] rounded-2xl border border-line bg-white px-3" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 py-3">
          <span className="h-9 w-9 rounded-full bg-[#ECE7F6]" />
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="h-2.5 w-3/5 rounded bg-[#ECE7F6]" />
            <span className="h-2 w-2/5 rounded bg-[#F3F0F9]" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

`section-label.tsx`

```tsx
import { cn } from "~/lib/utils";
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("text-xs font-extrabold uppercase tracking-[0.06em] text-muted-foreground", className)}>{children}</div>;
}
```

`date-tile.tsx`

```tsx
"use client";
import { useI18n } from "~/i18n/i18n-provider";
export function DateTile({ date }: { date: string }) {
  const { fmt } = useI18n();
  return (
    <div className="w-11 flex-none rounded-[10px] bg-brand-50 py-1.5 text-center text-brand-700" aria-hidden="true">
      <div className="text-[17px] font-extrabold leading-none">{fmt(date, "dd")}</div>
      <div className="text-[10px] font-extrabold uppercase">{fmt(date, "LLL")}</div>
    </div>
  );
}
```

`page-body.tsx`

```tsx
import { cn } from "~/lib/utils";
export function PageBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto flex w-full max-w-[1200px] flex-col gap-3 px-4 pt-3 md:gap-5 md:px-8 md:pt-5", className)}>{children}</div>;
}
```

- [ ] **Step 4: Mock badge above the tab bar**

In `src/components/mock-db-banner.tsx`, change `fixed bottom-3 left-3` to `fixed bottom-[88px] left-3 md:bottom-3`.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/ds src/components/penalty-badge.tsx src/components/mock-db-banner.tsx src/_tests_/ds.test.tsx
git commit -m "feat(ui): design-system primitives

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Responsive sheet, confirm dialog and "⋯" menu

**Files:**
- Create: `src/hooks/use-media-query.ts`, `src/components/ds/responsive-sheet.tsx`, `src/components/ds/more-menu.tsx`
- Modify: `src/components/confirmation-dialog.tsx`, `src/components/ui/sheet.tsx` (bottom-sheet styling only)
- Test: `src/_tests_/sheet-confirm.test.tsx`

**Interfaces (Produces):**

```ts
useMediaQuery(query: string): boolean          // false on the server and on the first render
useIsDesktop(): boolean                        // "(min-width: 768px)"
ResponsiveSheet(props: {
  open: boolean; onOpenChange: (open: boolean) => void;
  title: string; description?: string;
  desktop?: "right" | "dialog";                // default "right"
  footer?: ReactNode; children: ReactNode;
})
MoreMenu(props: { label: string; items: { label: string; onSelect: () => void; destructive?: boolean; icon?: ReactNode }[]; triggerClassName?: string })
ConfirmDialog: same props as today; defaults now come from t(): title t("common.areYouSure"), confirmLabel t("common.confirm"), cancel t("common.cancel")
```

- [ ] **Step 1: Write the failing test**

```tsx
import { fireEvent, screen } from "@testing-library/react";
import { renderWithI18n } from "./test-utils";
import { ConfirmDialog } from "~/components/confirmation-dialog";
import { MoreMenu } from "~/components/ds/more-menu";

test("confirm dialog uses translated defaults", () => {
  renderWithI18n(<ConfirmDialog open onOpenChange={() => undefined} onConfirm={() => undefined} description="Gone forever" />);
  expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
});

test("more menu runs the chosen item", () => {
  const onReset = jest.fn();
  renderWithI18n(<MoreMenu label="More actions" items={[{ label: "Reset", onSelect: onReset, destructive: true }]} />);
  fireEvent.click(screen.getByRole("button", { name: "More actions" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Reset" }));
  expect(onReset).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test -- sheet-confirm`
Expected: FAIL (`MoreMenu` not found; the dialog shows "Cancel" but the test for the defaults may already pass. That is fine, keep it as a regression test).

- [ ] **Step 3: use-media-query.ts**

```ts
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return matches;
}

export const useIsDesktop = () => useMediaQuery("(min-width: 768px)");
```

- [ ] **Step 4: Bottom-sheet styling**

In `src/components/ui/sheet.tsx` `sheetVariants.side.bottom`, use:

```ts
bottom: "inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-3xl border-t bg-background p-0 pb-safe data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
```

and change `right` to `"inset-y-0 right-0 h-full w-full overflow-y-auto border-l bg-background p-0 sm:max-w-[480px] data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"`. In `SheetOverlay`, change `bg-black/80` to `bg-[rgba(28,21,48,0.55)]`. Remove the built-in absolute `SheetPrimitive.Close` from `SheetContent`: `ResponsiveSheet` renders its own close button. Grep `SheetContent` users. All of them are rewritten in later tasks; until then the `Sheet`s that still exist (`AutoPricingSheet`, `PlayerSheet`, `AddReservationSheet`, `DefaultValuesAdminSheet`) lose their ✕ but still close with the overlay or Esc. That is acceptable between tasks.

- [ ] **Step 5: responsive-sheet.tsx**

```tsx
"use client";
import { X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "~/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "~/components/ui/dialog";
import { useIsDesktop } from "~/hooks/use-media-query";
import { useT } from "~/i18n/i18n-provider";
import { cn } from "~/lib/utils";

type Props = {
  open: boolean; onOpenChange: (open: boolean) => void;
  title: string; description?: string; desktop?: "right" | "dialog";
  footer?: React.ReactNode; children: React.ReactNode;
};

function Header({ title, description, onClose }: { title: string; description?: string; onClose: () => void }) {
  const t = useT();
  return (
    <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-3 md:px-6 md:pt-5">
      <div className="min-w-0">
        <div className="text-[22px] font-extrabold tracking-tight">{title}</div>
        {description ? <div className="mt-0.5 text-[13px] text-muted-foreground">{description}</div> : null}
      </div>
      <button type="button" onClick={onClose} aria-label={t("common.close")}
        className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#ECE7F6] text-ink"><X className="h-[18px] w-[18px]" /></button>
    </div>
  );
}

export function ResponsiveSheet({ open, onOpenChange, title, description, desktop = "right", footer, children }: Props) {
  const isDesktop = useIsDesktop();
  const close = () => onOpenChange(false);
  const body = (
    <>
      <Header title={title} description={description} onClose={close} />
      <div className="flex-1 px-4 pb-4 md:px-6">{children}</div>
      {footer ? <div className="sticky bottom-0 border-t border-line bg-white px-4 py-3 md:px-6">{footer}</div> : null}
    </>
  );

  if (isDesktop && desktop === "dialog") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[88vh] w-[860px] max-w-[calc(100%-32px)] gap-0 overflow-y-auto rounded-3xl bg-background p-0 [&>button.absolute]:hidden">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {description ? <DialogDescription className="sr-only">{description}</DialogDescription> : null}
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isDesktop ? "right" : "bottom"} className={cn("flex flex-col")}>
        <SheetTitle className="sr-only">{title}</SheetTitle>
        {description ? <SheetDescription className="sr-only">{description}</SheetDescription> : <SheetDescription className="sr-only">{title}</SheetDescription>}
        {!isDesktop ? <div className="flex justify-center pt-2"><span className="h-1 w-10 rounded-full bg-[#D8D2E6]" /></div> : null}
        {body}
      </SheetContent>
    </Sheet>
  );
}
```

(`ui/dialog.tsx` already exists. It renders its own absolute close button; the `[&>button.absolute]:hidden` class hides it in favour of `Header`.)

- [ ] **Step 6: more-menu.tsx**

```tsx
"use client";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export function MoreMenu({ label, items, triggerClassName }: {
  label: string; items: { label: string; onSelect: () => void; destructive?: boolean; icon?: React.ReactNode }[]; triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={label}
          className={cn("flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-line bg-white text-muted-foreground", triggerClassName)}>
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 rounded-2xl p-1.5" role="menu">
        {items.map((it) => (
          <button key={it.label} type="button" role="menuitem"
            onClick={() => { setOpen(false); it.onSelect(); }}
            className={cn("flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold hover:bg-brand-50",
              it.destructive ? "text-danger-ink" : "text-ink")}>
            {it.icon}{it.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 7: ConfirmDialog defaults and styling**

In `src/components/confirmation-dialog.tsx`:
- add `"use client";` and `import { useT } from "~/i18n/i18n-provider";`;
- add an optional prop `cancelLabel?: string`;
- inside the component: `const t = useT();`, then default `title ?? t("common.areYouSure")`, `confirmLabel ?? t("common.confirm")`, `cancelLabel ?? t("common.cancel")` (remove the literal defaults from the destructuring);
- give `AlertDialogContent` `className="w-[calc(100%-32px)] max-w-[400px] rounded-3xl"`;
- render the cancel button as `<AlertDialogCancel className="flex-1 rounded-xl">` and the action with `className={cn("flex-1 rounded-xl", confirmClassName)}`;
- `AlertDialogFooter` gets `className="flex-row gap-2 sm:space-x-0"`.

Behaviour stays the same: controlled and uncontrolled modes work as today.

- [ ] **Step 8: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/hooks/use-media-query.ts src/components/ds src/components/confirmation-dialog.tsx src/components/ui/sheet.tsx src/_tests_/sheet-confirm.test.tsx
git commit -m "feat(ui): responsive sheet, more menu, translated confirm dialog

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: App shell — tab bar, desktop nav, account, FFP launcher, leave guard

Canvas: "Home · Events" (tab bar, top bar), "Desktop · event" (top nav), "Fame · account sheet", "Admin · hub" (sub-nav).

**Files:**
- Create: `src/components/shell/logo.tsx`, `lang-switch.tsx`, `navigation-guard.tsx`, `ffp-launcher.tsx`, `bottom-tab-bar.tsx`, `desktop-top-bar.tsx`, `account-menu.tsx`, `account-sheet.tsx`, `admin-sub-nav.tsx`, `screen-header.tsx`, `app-shell.tsx`
- Create: `src/hooks/use-penalty-count.ts`, `src/app/admin/layout.tsx`
- Modify: `src/app/(app)/layout.tsx`, `src/components/with-admin-layout.tsx`, `src/components/with-auth.tsx`
- Modify: `src/i18n/messages/en.ts`, `pl.ts` (no new keys; the shell keys come from Task 3)
- Test: `src/_tests_/shell.test.tsx`

**Interfaces:**
- Consumes: `useGetRole` (Task 4), `useT` / `useI18n` (Task 3), `ResponsiveSheet` (Task 7), `PageBody` (Task 6).
- Produces:

```ts
type TabKey = "events" | "players" | "penalties" | "admin" | "login" | "fame";
activeTab(pathname: string): TabKey | null       // "/" or "/event/*" -> events; "/players*" -> players; "/penalties" -> penalties; "/admin*" -> admin; "/login" -> login
TabBarView(props: { role: Role; active: TabKey | null; penaltyCount: number; onFfp(): void; onFame(): void })   // presentational
BottomTabBar()                                   // wires hooks, md:hidden
DesktopTopBar()                                  // hidden md:block
NavigationGuardProvider, useNavigationGuard(): { setDirty(v: boolean): void; confirmLeave(): boolean }
useLeaveGuard(dirty: boolean): void              // registers dirty state + beforeunload while mounted
GuardedLink(props: LinkProps & { className?: string; children; "aria-label"?; "aria-current"? })
FfpProvider, useFfp(): { open(): void }
ScreenHeader(props: {
  title: ReactNode; back?: { href: string; label: string }; crumbs?: { label: string; href?: string }[];
  meta?: ReactNode; actions?: ReactNode; mobileBarAction?: ReactNode; mobileHero?: ReactNode;
  mobileTitleAside?: ReactNode; adminSection?: AdminSection;
})
type AdminSection = "events" | "players" | "reservations" | "penalties" | "defaults";
AppShell({ children })
usePenaltyCount(): number
```

- [ ] **Step 1: Write the failing test**

```tsx
import { fireEvent, screen } from "@testing-library/react";
import { renderWithI18n } from "./test-utils";
import { activeTab, TabBarView } from "~/components/shell/bottom-tab-bar";
import { Role } from "~/lib/roles";

jest.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push: jest.fn() }) }));

test("activeTab", () => {
  expect(activeTab("/")).toBe("events");
  expect(activeTab("/event/e1/lottery")).toBe("events");
  expect(activeTab("/players/player/p1")).toBe("players");
  expect(activeTab("/penalties")).toBe("penalties");
  expect(activeTab("/admin/events")).toBe("admin");
});

const noop = () => undefined;

test("last slot depends on role", () => {
  const { rerender } = renderWithI18n(<TabBarView role={Role.Guest} active="events" penaltyCount={2} onFfp={noop} onFame={noop} />);
  expect(screen.getByRole("link", { name: /Log in/ })).toHaveAttribute("href", "/login");
  rerender(<TabBarView role={Role.Admin} active="events" penaltyCount={2} onFfp={noop} onFame={noop} />);
  expect(screen.getByRole("link", { name: /Admin/ })).toHaveAttribute("href", "/admin");
  const onFame = jest.fn();
  rerender(<TabBarView role={Role.Fame} active="events" penaltyCount={2} onFfp={noop} onFame={onFame} />);
  fireEvent.click(screen.getByRole("button", { name: /Fame/ }));
  expect(onFame).toHaveBeenCalled();
});

test("FFP button, penalty badge and truncating labels", () => {
  const onFfp = jest.fn();
  renderWithI18n(<TabBarView role={Role.Guest} active="events" penaltyCount={2} onFfp={onFfp} onFame={noop} />);
  fireEvent.click(screen.getByRole("button", { name: "FFP calculator" }));
  expect(onFfp).toHaveBeenCalled();
  expect(screen.getByText("2")).toBeInTheDocument();
  expect(screen.getByText("Events")).toHaveClass("truncate");
});

test("no badge when nobody is penalized", () => {
  renderWithI18n(<TabBarView role={Role.Guest} active="events" penaltyCount={0} onFfp={noop} onFame={noop} />);
  expect(screen.queryByText("0")).toBeNull();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test -- shell`
Expected: FAIL (module not found).

- [ ] **Step 3: logo.tsx and lang-switch.tsx**

```tsx
// logo.tsx
import Link from "next/link";
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 text-white">
      <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-coral text-[15px] font-extrabold text-ink">M</span>
      <span className="text-[17px] font-extrabold tracking-tight">Mario Group</span>
    </Link>
  );
}
```

```tsx
// lang-switch.tsx
"use client";
import { useI18n } from "~/i18n/i18n-provider";
import { cn } from "~/lib/utils";
import type { Locale } from "~/i18n/translate";

export function LangSwitch({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div role="group" aria-label={t("lang.switch")} className={cn("flex rounded-full bg-white/[0.12] p-[3px] text-xs font-bold", className)}>
      {(["en", "pl"] as Locale[]).map((l) => (
        <button key={l} type="button" aria-pressed={locale === l} onClick={() => setLocale(l)}
          className={cn("rounded-full px-2.5 py-1 uppercase", locale === l ? "bg-white text-brand-900" : "text-white")}>{l}</button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: navigation-guard.tsx**

```tsx
"use client";
import Link, { type LinkProps } from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { useT } from "~/i18n/i18n-provider";

type Guard = { setDirty: (v: boolean) => void; confirmLeave: () => boolean };
const GuardContext = createContext<Guard>({ setDirty: () => undefined, confirmLeave: () => true });

export function NavigationGuardProvider({ children }: { children: React.ReactNode }) {
  const t = useT();
  const dirty = useRef(false);
  const setDirty = useCallback((v: boolean) => { dirty.current = v; }, []);
  const confirmLeave = useCallback(() => {
    if (!dirty.current) return true;
    const ok = window.confirm(t("common.leaveUnsaved"));
    if (ok) dirty.current = false;
    return ok;
  }, [t]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  return <GuardContext.Provider value={{ setDirty, confirmLeave }}>{children}</GuardContext.Provider>;
}

export const useNavigationGuard = () => useContext(GuardContext);

export function useLeaveGuard(dirty: boolean) {
  const { setDirty } = useNavigationGuard();
  useEffect(() => {
    setDirty(dirty);
    return () => setDirty(false);
  }, [dirty, setDirty]);
}

type GuardedLinkProps = LinkProps & { className?: string; children: React.ReactNode; "aria-label"?: string; "aria-current"?: "page" | undefined };

export function GuardedLink({ children, onClick, ...props }: GuardedLinkProps & { onClick?: React.MouseEventHandler<HTMLAnchorElement> }) {
  const { confirmLeave } = useNavigationGuard();
  return (
    <Link {...props} onClick={(e) => { if (!confirmLeave()) { e.preventDefault(); return; } onClick?.(e); }}>
      {children}
    </Link>
  );
}
```

- [ ] **Step 5: ffp-launcher.tsx**

```tsx
"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { ResponsiveSheet } from "~/components/ds/responsive-sheet";
import { FfpForm } from "~/components/ffp-form.component";
import { useT } from "~/i18n/i18n-provider";

const FfpContext = createContext<{ open: () => void }>({ open: () => undefined });

export function FfpProvider({ children }: { children: React.ReactNode }) {
  const t = useT();
  const [isOpen, setOpen] = useState(false);
  const value = useMemo(() => ({ open: () => setOpen(true) }), []);
  return (
    <FfpContext.Provider value={value}>
      {children}
      <ResponsiveSheet open={isOpen} onOpenChange={setOpen} title={t("nav.ffpCalculator")} desktop="dialog">
        {isOpen ? <FfpForm /> : null}
      </ResponsiveSheet>
    </FfpContext.Provider>
  );
}

export const useFfp = () => useContext(FfpContext);
```

`FfpForm` is unmounted when the sheet is closed, so every opening starts from the defaults, exactly like the old Home sheet.

- [ ] **Step 6: use-penalty-count.ts**

```ts
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { playerOperations } from "~/lib/db";
import { isPenalized } from "~/utils/penalty-util";

export function usePenaltyCount(): number {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  useEffect(() => {
    let alive = true;
    playerOperations.getAllPlayers()
      .then((ps) => { if (alive) setCount(ps.filter(isPenalized).length); })
      .catch(() => undefined);
    return () => { alive = false; };
  }, [pathname]);
  return count;
}
```

- [ ] **Step 7: bottom-tab-bar.tsx**

```tsx
"use client";
import { CalendarDays, Users, Ban, Shield, LogIn, Star, Calculator } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { Role } from "~/lib/roles";
import { useT } from "~/i18n/i18n-provider";
import { useGetRole } from "~/hooks/use-get-role";
import { usePenaltyCount } from "~/hooks/use-penalty-count";
import { GuardedLink } from "./navigation-guard";
import { useFfp } from "./ffp-launcher";
import { AccountSheet } from "./account-sheet";

export type TabKey = "events" | "players" | "penalties" | "admin" | "login" | "fame";

export function activeTab(pathname: string): TabKey | null {
  if (pathname === "/" || pathname.startsWith("/event")) return "events";
  if (pathname.startsWith("/players")) return "players";
  if (pathname.startsWith("/penalties")) return "penalties";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/login")) return "login";
  return null;
}

const item = "relative flex min-w-0 flex-col items-center gap-1 px-1 text-[11px] font-bold";

export function TabBarView({ role, active, penaltyCount, onFfp, onFame }: {
  role: Role; active: TabKey | null; penaltyCount: number; onFfp: () => void; onFame: () => void;
}) {
  const t = useT();
  const tab = (key: TabKey, href: string, Icon: typeof Users, label: string, badge?: number) => (
    <GuardedLink href={href} aria-current={active === key ? "page" : undefined}
      className={cn(item, active === key ? "text-brand-700" : "text-muted-foreground")}>
      {badge ? <span className="absolute -top-1.5 left-[calc(50%+4px)] rounded-full bg-destructive px-1.5 text-[10px] font-extrabold text-white">{badge}</span> : null}
      <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
      <span className="max-w-full truncate">{label}</span>
    </GuardedLink>
  );
  return (
    <nav aria-label={t("nav.main")}
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 items-center border-t border-line bg-white pb-safe md:hidden"
      style={{ height: "calc(var(--tabbar-h) + env(safe-area-inset-bottom))" }}>
      {tab("events", "/", CalendarDays, t("nav.events"))}
      {tab("players", "/players", Users, t("nav.players"))}
      <button type="button" onClick={onFfp} aria-label={t("nav.ffpCalculator")} className={cn(item, "text-brand-900")}>
        <span className="-mt-[30px] flex h-[54px] w-[54px] items-center justify-center rounded-[18px] border-[3px] border-white bg-brand-900 text-white shadow-[0_6px_16px_rgba(59,31,110,0.35)]">
          <Calculator className="h-6 w-6" aria-hidden="true" />
        </span>
        <span aria-hidden="true">{t("nav.ffp")}</span>
      </button>
      {tab("penalties", "/penalties", Ban, t("nav.penalties"), penaltyCount || undefined)}
      {role === Role.Admin ? tab("admin", "/admin", Shield, t("nav.admin"))
        : role === Role.Fame ? (
          <button type="button" onClick={onFame} className={cn(item, "text-[#B3ACC6]")}>
            <Star className="h-[22px] w-[22px]" aria-hidden="true" /><span className="max-w-full truncate">{t("nav.fame")}</span>
          </button>
        ) : tab("login", "/login", LogIn, t("nav.login"))}
    </nav>
  );
}

export function BottomTabBar() {
  const pathname = usePathname();
  const { role } = useGetRole();
  const penaltyCount = usePenaltyCount();
  const { open } = useFfp();
  const [accountOpen, setAccountOpen] = useState(false);
  return (
    <>
      <TabBarView role={role} active={activeTab(pathname)} penaltyCount={penaltyCount} onFfp={open} onFame={() => setAccountOpen(true)} />
      <AccountSheet open={accountOpen} onOpenChange={setAccountOpen} />
    </>
  );
}
```

- [ ] **Step 8: account-sheet.tsx and account-menu.tsx**

```tsx
// account-sheet.tsx — Fame (mobile). Canvas "Fame · account sheet".
"use client";
import { LogOut, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { ResponsiveSheet } from "~/components/ds/responsive-sheet";
import { Button } from "~/components/ui/button";
import { useGetRole } from "~/hooks/use-get-role";
import { useT } from "~/i18n/i18n-provider";

export function AccountSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const t = useT();
  const router = useRouter();
  const { logout } = useGetRole();
  return (
    <ResponsiveSheet open={open} onOpenChange={onOpenChange} title={t("account.title")}>
      <div className="flex flex-col gap-4 pb-2">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700"><Star className="h-5 w-5" /></span>
          <div>
            <div className="text-base font-extrabold">{t("account.loggedInAs", { role: t("role.fame") })}</div>
            <div className="text-[13px] text-muted-foreground">{t("account.onThisDevice")}</div>
          </div>
        </div>
        <ul className="list-disc pl-5 text-sm leading-relaxed text-[#4A4361]">
          <li>{t("account.fameCan1")}</li><li>{t("account.fameCan2")}</li><li>{t("account.fameCan3")}</li>
        </ul>
        <Button variant="outline" onClick={() => { logout(); onOpenChange(false); router.push("/"); }}>
          <LogOut />{t("account.logout")}
        </Button>
      </div>
    </ResponsiveSheet>
  );
}
```

```tsx
// account-menu.tsx — desktop account pill
"use client";
import { ChevronDown, LogIn, LogOut, Shield, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { useGetRole } from "~/hooks/use-get-role";
import { Role } from "~/lib/roles";
import { useT } from "~/i18n/i18n-provider";
import { GuardedLink } from "./navigation-guard";

const pill = "flex h-10 items-center gap-2 rounded-full border border-white/25 pl-1.5 pr-3 text-[13px] font-bold text-white";

export function AccountMenu() {
  const t = useT();
  const router = useRouter();
  const { role, logout } = useGetRole();
  if (role === Role.Guest) {
    return <GuardedLink href="/login" className={`${pill} pl-3.5`}><LogIn className="h-4 w-4" />{t("nav.login")}</GuardedLink>;
  }
  const isAdmin = role === Role.Admin;
  const Icon = isAdmin ? Shield : Star;
  const roleLabel = t(isAdmin ? "role.admin" : "role.fame");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={pill}>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.16]"><Icon className="h-[15px] w-[15px]" /></span>
          {roleLabel}<ChevronDown className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 rounded-2xl p-1.5">
        <div className="px-3 py-2 text-[13px] text-muted-foreground">{t("account.loggedInAs", { role: roleLabel })}</div>
        {isAdmin ? <GuardedLink href="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-brand-50"><Shield className="h-4 w-4" />{t("account.adminPanel")}</GuardedLink> : null}
        <button type="button" onClick={() => { logout(); router.push("/"); }}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold hover:bg-brand-50">
          <LogOut className="h-4 w-4" />{t("account.logout")}
        </button>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 9: desktop-top-bar.tsx and admin-sub-nav.tsx**

```tsx
// desktop-top-bar.tsx — canvas "Desktop · event" top bar
"use client";
import { Calculator } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import { Role } from "~/lib/roles";
import { useT } from "~/i18n/i18n-provider";
import { useGetRole } from "~/hooks/use-get-role";
import { usePenaltyCount } from "~/hooks/use-penalty-count";
import { activeTab, type TabKey } from "./bottom-tab-bar";
import { GuardedLink } from "./navigation-guard";
import { useFfp } from "./ffp-launcher";
import { LangSwitch } from "./lang-switch";
import { AccountMenu } from "./account-menu";

export function DesktopTopBar() {
  const t = useT();
  const pathname = usePathname();
  const active = activeTab(pathname);
  const { role } = useGetRole();
  const penaltyCount = usePenaltyCount();
  const { open } = useFfp();
  const link = (key: TabKey, href: string, label: string, badge?: number) => (
    <GuardedLink href={href} aria-current={active === key ? "page" : undefined}
      className={cn("flex h-full items-center gap-1.5 px-3.5", active === key ? "text-white shadow-[inset_0_-3px_0_hsl(var(--coral))]" : "text-[#D9CCF0] hover:text-white")}>
      {label}{badge ? <span className="rounded-full bg-destructive px-[7px] text-[11px] text-white">{badge}</span> : null}
    </GuardedLink>
  );
  return (
    <header className="sticky top-0 z-40 hidden bg-brand-900 text-white md:block">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-10 px-8">
        <GuardedLink href="/" className="flex flex-none items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-coral font-extrabold text-ink">M</span>
          <span className="text-[17px] font-extrabold">Mario Group</span>
        </GuardedLink>
        <nav aria-label={t("nav.main")} className="flex h-full items-center gap-1 text-sm font-bold">
          {link("events", "/", t("nav.events"))}
          {link("players", "/players", t("nav.players"))}
          {link("penalties", "/penalties", t("nav.penalties"), penaltyCount || undefined)}
          {role === Role.Admin ? link("admin", "/admin", t("nav.admin")) : null}
        </nav>
        <div className="ml-auto flex items-center gap-2.5">
          <button type="button" onClick={open} className="flex h-10 items-center gap-2 rounded-xl bg-coral px-3.5 text-sm font-extrabold text-ink">
            <Calculator className="h-[18px] w-[18px]" />{t("nav.ffpCalculator")}
          </button>
          <LangSwitch className="h-10 items-center" />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
```

```tsx
// admin-sub-nav.tsx — mobile pills (canvas "Admin · events") and desktop tab row (canvas "Desktop · admin edit event")
"use client";
import { cn } from "~/lib/utils";
import { useT } from "~/i18n/i18n-provider";
import { GuardedLink } from "./navigation-guard";

export type AdminSection = "events" | "players" | "reservations" | "penalties" | "defaults";
const ITEMS: { key: AdminSection; href: string }[] = [
  { key: "events", href: "/admin/events" }, { key: "players", href: "/admin/players" },
  { key: "reservations", href: "/admin/reservations" }, { key: "penalties", href: "/admin/penalties" },
  { key: "defaults", href: "/admin/defaults" },
];

export function AdminSubNav({ active }: { active?: AdminSection }) {
  const t = useT();
  return (
    <div className="border-b border-line bg-white">
      <nav aria-label={t("admin.nav")} className="mx-auto flex max-w-[1200px] gap-1 overflow-x-auto px-3 py-2 text-[13px] font-bold md:px-[18px] md:py-0 md:text-sm">
        {ITEMS.map((i) => (
          <GuardedLink key={i.key} href={i.href} aria-current={active === i.key ? "page" : undefined}
            className={cn("whitespace-nowrap rounded-full px-3 py-[7px] md:rounded-none md:px-3.5 md:py-3",
              active === i.key ? "bg-brand-50 text-brand-700 md:bg-transparent md:shadow-[inset_0_-2px_0_#5B2D8C]" : "text-muted-foreground")}>
            {t(`admin.${i.key}`)}
          </GuardedLink>
        ))}
      </nav>
    </div>
  );
}
```

- [ ] **Step 10: screen-header.tsx**

```tsx
"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Logo } from "./logo";
import { LangSwitch } from "./lang-switch";
import { GuardedLink } from "./navigation-guard";
import { AdminSubNav, type AdminSection } from "./admin-sub-nav";
import { useT } from "~/i18n/i18n-provider";

type Props = {
  title: React.ReactNode;
  back?: { href: string; label: string };
  crumbs?: { label: string; href?: string }[];
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  mobileBarAction?: React.ReactNode;
  mobileHero?: React.ReactNode;
  mobileTitleAside?: React.ReactNode;
  adminSection?: AdminSection;
};

export function ScreenHeader({ title, back, crumbs, meta, actions, mobileBarAction, mobileHero, mobileTitleAside, adminSection }: Props) {
  const t = useT();
  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 bg-brand-900 pl-1 pr-3 text-white md:hidden">
        {back ? (
          <GuardedLink href={back.href} className="flex min-w-0 items-center gap-0.5 px-2 py-2.5 text-[15px] font-bold">
            <ChevronLeft className="h-[22px] w-[22px] flex-none" aria-hidden="true" /><span className="truncate">{back.label}</span>
          </GuardedLink>
        ) : <div className="pl-3"><Logo /></div>}
        <div className="flex flex-none items-center gap-2">{mobileBarAction}<LangSwitch /></div>
      </div>

      {adminSection ? <AdminSubNav active={adminSection} /> : null}

      {/* mobile title / hero */}
      <div className="md:hidden">
        {mobileHero ?? (
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-[26px] font-extrabold tracking-tight">{title}</h1>
              {mobileTitleAside}
            </div>
            {meta ? <div className="mt-0.5 text-[13px] text-muted-foreground">{meta}</div> : null}
          </div>
        )}
      </div>

      {/* desktop header */}
      <div className="mx-auto hidden w-full max-w-[1200px] flex-col gap-2.5 px-8 pt-6 md:flex">
        {crumbs?.length ? (
          <nav aria-label={t("nav.breadcrumb")} className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
            {crumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                {i > 0 ? <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                {c.href ? <GuardedLink href={c.href} className="hover:text-ink">{c.label}</GuardedLink> : <span className="text-ink">{c.label}</span>}
              </span>
            ))}
          </nav>
        ) : null}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-[32px] font-extrabold tracking-tight">{title}</h1>
            {meta ? <div className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">{meta}</div> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 11: app-shell.tsx and layouts**

```tsx
// app-shell.tsx
"use client";
import { usePathname } from "next/navigation";
import { Toaster } from "~/components/ui/sonner";
import { NavigationGuardProvider } from "./navigation-guard";
import { FfpProvider } from "./ffp-launcher";
import { DesktopTopBar } from "./desktop-top-bar";
import { BottomTabBar } from "./bottom-tab-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <NavigationGuardProvider>
      <FfpProvider>
        <DesktopTopBar />
        <main key={pathname} className="motion-page min-h-dvh pb-tabbar duration-200 animate-in fade-in slide-in-from-bottom-1 md:pb-12">
          {children}
        </main>
        <BottomTabBar />
        <Toaster position="top-center" />
      </FfpProvider>
    </NavigationGuardProvider>
  );
}
```

`src/app/(app)/layout.tsx`:

```tsx
"use client";
import { AppShell } from "~/components/shell/app-shell";
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

`src/app/admin/layout.tsx` (new): same content as the `(app)` layout.

`src/components/with-admin-layout.tsx`: keep the export name. It now only adds auth:

```tsx
import { type ComponentType } from "react";
import { withAuth } from "./with-auth";

export function withAdminLayout<P extends object>(WrappedComponent: ComponentType<P>) {
  return withAuth(WrappedComponent);
}
```

`src/components/with-auth.tsx`: replace `return <div>Authenticating...</div>;` with

```tsx
return <div className="mx-auto max-w-[1200px] p-4 md:p-8"><SkeletonRows count={4} /></div>;
```

(import `SkeletonRows` from `~/components/ds/skeleton-rows`).

Pages still import `Breadcrumbs` and the old `Navbar` in places. The old `Navbar` is no longer rendered by the layout. The lottery page renders its own `<Toaster>`: remove that line in Task 13.

- [ ] **Step 12: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS.

Manual (mock mode), test cases 1.1–1.12 and 1.15–1.16 from the test-case doc:
- the tab bar on mobile and the top nav on desktop;
- Log in, Admin and Fame slots;
- logout from the desktop menu and the Fame sheet;
- the FFP button opens the old FFP form (it gets restyled in Task 12).

Screens still look old inside: expected.

- [ ] **Step 13: Commit**

```bash
git add src/components/shell src/hooks/use-penalty-count.ts src/app/(app)/layout.tsx src/app/admin/layout.tsx src/components/with-admin-layout.tsx src/components/with-auth.tsx src/_tests_/shell.test.tsx
git commit -m "feat(shell): responsive app shell with tab bar, desktop nav, account and FFP launcher

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Player picker (new `MultiSelect`)

Canvas: "Player picker · search sheet". Spec §7. The component keeps its name `MultiSelect` and its props, so all 8 call sites keep working. Later tasks pass `cardType` and translated hints.

**Files:**
- Create: `src/utils/search.ts`
- Modify: `src/components/multi-select.tsx` (full rewrite)
- Modify: `src/i18n/messages/en.ts`, `pl.ts`
- Test: `src/_tests_/search.test.ts`, `src/_tests_/multi-select.test.tsx`

**Interfaces:**
- Consumes: `ResponsiveSheet`, `useIsDesktop` (Task 7), `Chip`, `PlayerAvatar`, `CardTypeChip` (Task 6).
- Produces:

```ts
normalizeForSearch(s: string): string                 // lowercase, no diacritics, ł -> l, trimmed, single spaces
matchesQuery(label: string, query: string): boolean    // substring on normalized strings; empty query matches all
orderOptions<T extends { value: string; label: string; disabled?: boolean }>(options: T[], selected: string[]): T[]
                                                        // selected first, then enabled, then disabled; each group A–Z (pl collation)
type PickerOption = { value: string; label: string; disabled?: boolean; hint?: string; cardType?: CardType };
MultiSelect(props: { options: PickerOption[]; selected: string[]; onChange: (selected: string[]) => void; placeholder?: string; title?: string })
```

`hint` is shown as a red chip. Callers pass `t("penalty.chip")`. `disabled` options cannot be picked.

- [ ] **Step 1: Write the failing tests**

`src/_tests_/search.test.ts`:

```ts
import { matchesQuery, normalizeForSearch, orderOptions } from "~/utils/search";

test("normalizeForSearch strips Polish diacritics including ł", () => {
  expect(normalizeForSearch("Łukasz Michał")).toBe("lukasz michal");
  expect(normalizeForSearch("  Iga   WOŹNIAK ")).toBe("iga wozniak");
  expect(normalizeForSearch("Zażółć gęślą jaźń")).toBe("zazolc gesla jazn");
});

test("matchesQuery", () => {
  expect(matchesQuery("Iga Woźniak", "wozniak")).toBe(true);
  expect(matchesQuery("Iga Woźniak", "WOŹ")).toBe(true);
  expect(matchesQuery("Iga Woźniak", "iga w")).toBe(true);
  expect(matchesQuery("Iga Woźniak", "kowal")).toBe(false);
  expect(matchesQuery("Iga Woźniak", "   ")).toBe(true);
});

test("orderOptions: selected, enabled, disabled; alphabetical inside", () => {
  const opts = [
    { value: "3", label: "Zosia" }, { value: "1", label: "Anna" },
    { value: "2", label: "Ewa", disabled: true }, { value: "4", label: "Łucja" },
  ];
  expect(orderOptions(opts, ["3"]).map((o) => o.label)).toEqual(["Zosia", "Anna", "Łucja", "Ewa"]);
});
```

`src/_tests_/multi-select.test.tsx`:

```tsx
import { fireEvent, screen } from "@testing-library/react";
import { renderWithI18n } from "./test-utils";
import { MultiSelect } from "~/components/multi-select";

const options = [
  { value: "p9", label: "Iga Woźniak", cardType: "No card" as const },
  { value: "p5", label: "Ewa Kamińska", cardType: "Medicover Light" as const, disabled: true, hint: "Penalty" },
  { value: "p1", label: "Anna Kowalska", cardType: "Medicover" as const },
];

test("search ignores diacritics and disabled options cannot be picked", () => {
  const onChange = jest.fn();
  renderWithI18n(<MultiSelect options={options} selected={[]} onChange={onChange} />);
  fireEvent.click(screen.getByRole("combobox"));
  const search = screen.getByRole("searchbox");
  fireEvent.change(search, { target: { value: "wozniak" } });
  expect(screen.getByRole("option", { name: /Iga Woźniak/ })).toBeInTheDocument();
  expect(screen.queryByRole("option", { name: /Anna Kowalska/ })).toBeNull();

  fireEvent.change(search, { target: { value: "" } });
  fireEvent.click(screen.getByRole("option", { name: /Ewa Kamińska/ }));
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("option", { name: /Anna Kowalska/ }));
  expect(onChange).toHaveBeenCalledWith(["p1"]);
});

test("trigger shows selected names", () => {
  renderWithI18n(<MultiSelect options={options} selected={["p1"]} onChange={() => undefined} />);
  expect(screen.getByRole("combobox")).toHaveTextContent("Anna Kowalska");
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm test -- search multi-select`
Expected: FAIL (module `~/utils/search` not found; the old `MultiSelect` has no searchbox role).

- [ ] **Step 3: search.ts**

```ts
export function normalizeForSearch(s: string): string {
  return s
    .replace(/[łŁ]/g, "l")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesQuery(label: string, query: string): boolean {
  const q = normalizeForSearch(query);
  if (!q) return true;
  return normalizeForSearch(label).includes(q);
}

export function orderOptions<T extends { value: string; label: string; disabled?: boolean }>(options: T[], selected: string[]): T[] {
  const rank = (o: T) => (selected.includes(o.value) ? 0 : o.disabled ? 2 : 1);
  return [...options].sort((a, b) => rank(a) - rank(b) || a.label.localeCompare(b.label, "pl"));
}
```

- [ ] **Step 4: Dictionary keys**

Add to `en.ts`:

```ts
"picker.placeholder": "Select players…",
"picker.title": "Select players",
"picker.search": "Search by name…",
"picker.searchHint": "Matches first name or surname, with or without Polish letters.",
"picker.matches": { one: "{count} match", other: "{count} matches" },
"picker.done": "Done · {count} selected",
"picker.clear": "Clear",
"picker.more": "+{count} more",
"picker.clearSearch": "Clear search",
```

Add to `pl.ts`:

```ts
"picker.placeholder": "Wybierz graczy…",
"picker.title": "Wybierz graczy",
"picker.search": "Szukaj po imieniu…",
"picker.searchHint": "Szuka po imieniu i nazwisku, także bez polskich znaków.",
"picker.matches": { one: "{count} wynik", few: "{count} wyniki", many: "{count} wyników", other: "{count} wyniku" },
"picker.done": "Gotowe · wybrano {count}",
"picker.clear": "Wyczyść",
"picker.more": "+{count} więcej",
"picker.clearSearch": "Wyczyść wyszukiwanie",
```

- [ ] **Step 5: multi-select.tsx (replace the file)**

```tsx
"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "~/lib/utils";
import type { CardType } from "~/lib/db";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { ResponsiveSheet } from "~/components/ds/responsive-sheet";
import { Chip, CardTypeChip } from "~/components/ds/chip";
import { PlayerAvatar } from "~/components/ds/player-avatar";
import { SectionLabel } from "~/components/ds/section-label";
import { useIsDesktop } from "~/hooks/use-media-query";
import { useT } from "~/i18n/i18n-provider";
import { matchesQuery, orderOptions } from "~/utils/search";

export type PickerOption = { value: string; label: string; disabled?: boolean; hint?: string; cardType?: CardType };

type MultiSelectProps = {
  options: PickerOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  title?: string;
};

export function MultiSelect({ options = [], selected = [], onChange, placeholder, title }: MultiSelectProps) {
  const t = useT();
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visible = useMemo(
    () => orderOptions(options.filter((o) => matchesQuery(o.label, query)), selected),
    [options, query, selected],
  );
  const selectedOptions = options.filter((o) => selected.includes(o.value));

  const toggle = (o: PickerOption) => {
    if (o.disabled) return;
    onChange(selected.includes(o.value) ? selected.filter((v) => v !== o.value) : [...selected, o.value]);
  };

  const onListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="option"]'));
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = e.key === "ArrowDown" ? Math.min(items.length - 1, i + 1) : Math.max(0, i - 1);
    items[next]?.focus();
  };

  const triggerContent = (
    <>
      {selectedOptions.length === 0 ? (
        <span className="truncate text-muted-foreground">{placeholder ?? t("picker.placeholder")}</span>
      ) : (
        <span className="flex min-w-0 flex-wrap items-center gap-1.5">
          {selectedOptions.slice(0, 3).map((o) => <Chip key={o.value} tone="violet">{o.label}</Chip>)}
          {selectedOptions.length > 3 ? <span className="text-xs text-muted-foreground">{t("picker.more", { count: selectedOptions.length - 3 })}</span> : null}
        </span>
      )}
      <ChevronDown className="h-[18px] w-[18px] flex-none text-muted-foreground" aria-hidden="true" />
    </>
  );
  const triggerClass = "flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-line bg-white px-3 py-2 text-left text-sm";

  const searchBox = (
    <label className="flex h-12 items-center gap-2 rounded-xl border-2 border-brand-700 bg-white px-3">
      <Search className="h-[18px] w-[18px] text-brand-700" aria-hidden="true" />
      <input type="search" autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder={t("picker.search")} aria-label={t("picker.search")}
        className="min-w-0 flex-1 bg-transparent text-base font-bold outline-none" />
      {query ? (
        <button type="button" onClick={() => setQuery("")} aria-label={t("picker.clearSearch")}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ECE7F6]"><X className="h-3.5 w-3.5" /></button>
      ) : null}
    </label>
  );

  const list = (
    <div role="listbox" aria-multiselectable="true" aria-label={title ?? t("picker.title")} onKeyDown={onListKeyDown} className="flex flex-col">
      <SectionLabel className="pb-1 pt-2">{t("picker.matches", { count: visible.length })}</SectionLabel>
      {visible.length === 0 ? <div className="py-6 text-center text-sm text-muted-foreground">{t("common.noResults")}</div> : null}
      {visible.map((o) => {
        const on = selected.includes(o.value);
        return (
          <button key={o.value} type="button" role="option" aria-selected={on} aria-disabled={o.disabled || undefined}
            onClick={() => toggle(o)}
            className={cn("flex min-h-[52px] items-center gap-3 border-b border-[#F0ECF7] py-2 text-left last:border-0 focus:bg-brand-50 focus:outline-none",
              o.disabled && "cursor-not-allowed text-muted-foreground")}>
            <span className={cn("flex h-6 w-6 flex-none items-center justify-center rounded-lg",
              on ? "bg-brand-900 text-white" : o.disabled ? "bg-[#F4F2F8]" : "border-2 border-[#D8D2E6]")}>
              {on ? <Check className="h-[15px] w-[15px]" strokeWidth={3} /> : null}
            </span>
            {o.cardType ? <PlayerAvatar name={o.label} cardType={o.cardType} /> : null}
            <span className="min-w-0 flex-1 truncate text-[15px] font-bold">{o.label}</span>
            {o.hint ? <Chip tone="danger">{o.hint}</Chip> : null}
            {o.cardType ? <CardTypeChip cardType={o.cardType} short /> : null}
          </button>
        );
      })}
    </div>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(""); }}>
        <PopoverTrigger asChild>
          <button type="button" role="combobox" aria-expanded={open} aria-haspopup="listbox" className={triggerClass}>{triggerContent}</button>
        </PopoverTrigger>
        <PopoverContent align="start" className="max-h-[420px] w-[--radix-popover-trigger-width] min-w-[340px] overflow-y-auto rounded-2xl p-3">
          {searchBox}
          {list}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <>
      <button type="button" role="combobox" aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen(true)} className={triggerClass}>
        {triggerContent}
      </button>
      <ResponsiveSheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(""); }}
        title={title ?? t("picker.title")}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onChange([])}>{t("picker.clear")}</Button>
            <Button className="flex-1" onClick={() => setOpen(false)}>{t("picker.done", { count: selected.length })}</Button>
          </div>
        }>
        <div className="flex flex-col gap-2.5">
          {searchBox}
          {selectedOptions.length ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedOptions.map((o) => (
                <button key={o.value} type="button" onClick={() => toggle(o)} aria-label={`${t("common.remove")} ${o.label}`}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-2.5 pr-1.5 text-xs font-extrabold text-brand-700">
                  {o.label}<X className="h-3 w-3" />
                </button>
              ))}
            </div>
          ) : null}
          <div className="text-xs text-muted-foreground">{t("picker.searchHint")}</div>
          {list}
        </div>
      </ResponsiveSheet>
    </>
  );
}
```

Existing callers keep compiling. `hint: "penalty"` from today's call sites renders as a chip until those screens are converted to `t("penalty.chip")`.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS. Manual: Admin → Reservations (old screen) → Add New → the picker opens as a bottom sheet on mobile. Search "wozniak" finds Iga.

- [ ] **Step 7: Commit**

```bash
git add src/utils/search.ts src/components/multi-select.tsx src/i18n src/_tests_/search.test.ts src/_tests_/multi-select.test.tsx
git commit -m "feat(ui): searchable player picker with diacritic-insensitive search

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Home and events list

Canvas: "Home · Events", "Desktop · home", "Admin · events". Spec §5 row `/`.

**Files:**
- Create: `src/utils/event-view.ts`
- Modify: `src/components/events-list.tsx` (rewrite)
- Modify: `src/app/(app)/page.tsx` (rewrite)
- Delete: `src/components/event-card.tsx`; remove `getCardVariant` from `src/lib/color-util.ts` (delete the file if nothing else imports it: `grep -rn color-util src`)
- Modify: `en.ts`, `pl.ts`
- Test: `src/_tests_/event-view.test.ts`

**Interfaces:**
- Consumes: `ScreenHeader`, `GuardedLink` (Task 8); `PageBody`, `ListCard`, `ListRow`, `DateTile`, `Chip`, `EmptyState`, `SkeletonRows`, `SectionLabel` (Task 6); `eventOperations.getAllEvents` with `paid` (Task 5).
- Produces:

```ts
paidSummary(players: { paid?: boolean }[]): { paid: number; total: number; unpaid: number }
flattenEvents(grouped: Record<string, Event[]>): Event[]       // newest date first; inside a date keep the given order
type PaidFilter = "all" | "unpaid" | "paid";
filterByPaid<T extends { id: string }>(players: T[], status: Record<string, boolean>, filter: PaidFilter): T[]
averageAmount(amounts: Record<string, number>, ids: string[]): number | null   // null when no amounts
EventsList(props: { variant: "public" | "admin" })
```

- [ ] **Step 1: Write the failing test**

```ts
import { averageAmount, filterByPaid, flattenEvents, paidSummary } from "~/utils/event-view";
import type { Event } from "~/lib/db";

test("paidSummary", () => {
  expect(paidSummary([{ paid: true }, { paid: false }, {}])).toEqual({ paid: 1, total: 3, unpaid: 2 });
  expect(paidSummary([])).toEqual({ paid: 0, total: 0, unpaid: 0 });
});

test("flattenEvents sorts by date desc", () => {
  const ev = (id: string, date: string) => ({ id, date, name: id, players: [] }) as unknown as Event;
  const out = flattenEvents({ "2026-09-23": [ev("a", "2026-09-23")], "2026-10-06": [ev("b", "2026-10-06"), ev("c", "2026-10-06")] });
  expect(out.map((e) => e.id)).toEqual(["b", "c", "a"]);
});

test("filterByPaid", () => {
  const ps = [{ id: "1" }, { id: "2" }, { id: "3" }];
  const st = { "1": true, "2": false };
  expect(filterByPaid(ps, st, "all").map((p) => p.id)).toEqual(["1", "2", "3"]);
  expect(filterByPaid(ps, st, "paid").map((p) => p.id)).toEqual(["1"]);
  expect(filterByPaid(ps, st, "unpaid").map((p) => p.id)).toEqual(["2", "3"]);
});

test("averageAmount", () => {
  expect(averageAmount({ a: 38.5, b: 30 }, ["a", "b"])).toBe(34.25);
  expect(averageAmount({}, ["a"])).toBeNull();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test -- event-view`
Expected: FAIL (module not found).

- [ ] **Step 3: event-view.ts**

```ts
import type { Event } from "~/lib/db";

export function paidSummary(players: { paid?: boolean }[]) {
  const paid = players.filter((p) => p.paid).length;
  return { paid, total: players.length, unpaid: players.length - paid };
}

export function flattenEvents(grouped: Record<string, Event[]>): Event[] {
  return Object.keys(grouped)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .flatMap((d) => grouped[d] ?? []);
}

export type PaidFilter = "all" | "unpaid" | "paid";

export function filterByPaid<T extends { id: string }>(players: T[], status: Record<string, boolean>, filter: PaidFilter): T[] {
  if (filter === "all") return players;
  return players.filter((p) => (filter === "paid" ? status[p.id] === true : status[p.id] !== true));
}

export function averageAmount(amounts: Record<string, number>, ids: string[]): number | null {
  const vals = ids.map((id) => amounts[id]).filter((v): v is number => typeof v === "number");
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
}
```

- [ ] **Step 4: Dictionary keys**

en:

```ts
"home.title": "Events",
"home.latest": "Latest · {date}",
"home.open": "Open event",
"home.lottery": "Lottery",
"home.earlier": "Earlier",
"home.newEvent": "New event",
"home.paidOf": "{paid}/{total} paid",
"home.unpaid": { one: "{count} unpaid", other: "{count} unpaid" },
"home.emptyTitle": "No events yet",
"home.emptyText": "New trainings will appear here.",
```

pl:

```ts
"home.title": "Wydarzenia",
"home.latest": "Ostatnie · {date}",
"home.open": "Otwórz",
"home.lottery": "Losowanie",
"home.earlier": "Wcześniejsze",
"home.newEvent": "Nowe wydarzenie",
"home.paidOf": "{paid}/{total} opłacono",
"home.unpaid": { one: "{count} nieopłacony", few: "{count} nieopłacone", many: "{count} nieopłaconych", other: "{count} nieopłaconego" },
"home.emptyTitle": "Brak wydarzeń",
"home.emptyText": "Tu pojawią się nowe treningi.",
```

- [ ] **Step 5: events-list.tsx (replace)**

```tsx
"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ChevronRight, Dices, Pencil, Plus } from "lucide-react";
import { eventOperations, type Event } from "~/lib/db";
import { Role } from "~/lib/roles";
import { useGetRole } from "~/hooks/use-get-role";
import { useI18n } from "~/i18n/i18n-provider";
import { Button } from "~/components/ui/button";
import { Chip } from "~/components/ds/chip";
import { DateTile } from "~/components/ds/date-tile";
import { EmptyState } from "~/components/ds/empty-state";
import { SectionLabel } from "~/components/ds/section-label";
import { SkeletonRows } from "~/components/ds/skeleton-rows";
import { GuardedLink } from "~/components/shell/navigation-guard";
import { flattenEvents, paidSummary } from "~/utils/event-view";

export function EventsList({ variant }: { variant: "public" | "admin" }) {
  const { t, fmt } = useI18n();
  const { role } = useGetRole();
  const canSeePaid = role === Role.Admin || role === Role.Fame;
  const [events, setEvents] = useState<Event[] | null>(null);

  useEffect(() => {
    eventOperations.getAllEvents().then((g) => setEvents(flattenEvents(g))).catch(() => setEvents([]));
  }, []);

  if (!events) return <SkeletonRows count={4} />;

  if (!events.length) {
    return (
      <EmptyState icon={<CalendarDays className="h-8 w-8" />} title={t("home.emptyTitle")} text={t("home.emptyText")}
        action={role === Role.Admin ? <Button asChild size="sm"><GuardedLink href="/admin/event"><Plus />{t("home.newEvent")}</GuardedLink></Button> : undefined} />
    );
  }

  const paidChips = (e: Event, onDark = false) => {
    if (!canSeePaid) return null;
    const s = paidSummary(e.players);
    return (
      <>
        <Chip tone={onDark ? "onDark" : "success"}>{t("home.paidOf", { paid: s.paid, total: s.total })}</Chip>
        {s.unpaid > 0 ? <Chip tone={onDark ? "onDark" : "warning"}>{t("home.unpaid", { count: s.unpaid })}</Chip> : null}
      </>
    );
  };

  const row = (e: Event) => (
    <div key={e.id} className="flex flex-col gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5 md:rounded-2xl md:px-4 md:py-3.5">
      <GuardedLink href={variant === "admin" ? `/admin/event/${e.id}` : `/event/${e.id}`} className="flex items-center gap-3">
        <DateTile date={e.date} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-bold">{e.name}</div>
          <div className="text-xs text-muted-foreground">{t("common.players", { count: e.players.length })}</div>
        </div>
        <span className="hidden gap-1.5 sm:flex">{paidChips(e)}</span>
        {variant === "public" ? <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" /> : null}
      </GuardedLink>
      {variant === "admin" ? (
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1"><GuardedLink href={`/admin/event/${e.id}`}><Pencil />{t("common.edit")}</GuardedLink></Button>
          <Button asChild variant="outline" size="sm" className="flex-1"><GuardedLink href={`/event/${e.id}/lottery`}><Dices />{t("home.lottery")}</GuardedLink></Button>
        </div>
      ) : null}
    </div>
  );

  if (variant === "admin") return <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">{events.map(row)}</div>;

  const [latest, ...earlier] = events;
  return (
    <div className="flex flex-col gap-3 md:gap-5">
      {latest ? (
        <section className="flex flex-col gap-3 rounded-[20px] bg-brand-900 p-[18px] text-white md:flex-row md:items-center md:gap-6 md:border md:border-line md:bg-white md:p-6 md:text-ink">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#D9CCF0] md:text-xs md:font-extrabold md:text-brand-700">
              {t("home.latest", { date: fmt(latest.date, "EEE d MMM") })}
            </div>
            <div className="mt-1 text-2xl font-extrabold tracking-tight md:text-[28px]">{latest.name}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Chip tone="onDark" className="md:bg-brand-50 md:text-brand-700">{t("common.players", { count: latest.players.length })}</Chip>
              <span className="contents md:hidden">{paidChips(latest, true)}</span>
              <span className="hidden gap-1.5 md:flex">{paidChips(latest)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1 border-white/40 bg-transparent text-white hover:bg-white/10 md:flex-none md:border-line md:bg-white md:text-ink">
              <GuardedLink href={`/event/${latest.id}/lottery`}><Dices />{t("home.lottery")}</GuardedLink>
            </Button>
            <Button asChild className="flex-1 bg-white text-brand-900 hover:bg-white/90 md:flex-none md:bg-brand-900 md:text-white">
              <GuardedLink href={`/event/${latest.id}`}>{t("home.open")}</GuardedLink>
            </Button>
          </div>
        </section>
      ) : null}
      {earlier.length ? (
        <>
          <SectionLabel className="mt-1">{t("home.earlier")}</SectionLabel>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3 lg:grid-cols-3">{earlier.map(row)}</div>
        </>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 6: Home page (replace `src/app/(app)/page.tsx`)**

```tsx
"use client";

import { Plus } from "lucide-react";
import { EventsList } from "~/components/events-list";
import { ScreenHeader } from "~/components/shell/screen-header";
import { GuardedLink } from "~/components/shell/navigation-guard";
import { PageBody } from "~/components/ds/page-body";
import { Button } from "~/components/ui/button";
import { useGetRole } from "~/hooks/use-get-role";
import { Role } from "~/lib/roles";
import { useT } from "~/i18n/i18n-provider";

export default function HomePage() {
  const t = useT();
  const { role } = useGetRole();
  const newEvent = role === Role.Admin
    ? <Button asChild size="sm" className="md:h-11 md:px-4"><GuardedLink href="/admin/event"><Plus />{t("home.newEvent")}</GuardedLink></Button>
    : undefined;
  return (
    <>
      <ScreenHeader title={t("home.title")} actions={newEvent} mobileTitleAside={newEvent} />
      <PageBody><EventsList variant="public" /></PageBody>
    </>
  );
}
```

The FFP sheet that used to live on Home is gone. It is reachable from the tab bar and the top nav (Task 8).

- [ ] **Step 7: Admin events usage**

`src/app/admin/page.tsx` still renders `<EventsList basePath=… type="admin"/>`. Change it for now to `<EventsList variant="admin" />` so it compiles. Task 17 moves it.

- [ ] **Step 8: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS. Manual: test cases 3.1–3.7 in mock mode at 375px and 1280px, EN and PL.

- [ ] **Step 9: Commit**

```bash
git add -A src/utils/event-view.ts src/components/events-list.tsx src/components/event-card.tsx src/lib/color-util.ts "src/app/(app)/page.tsx" src/app/admin/page.tsx src/i18n src/_tests_/event-view.test.ts
git commit -m "feat(home): redesigned events list with latest-event hero

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Event screen and Pricing sheet

Canvas: "Event · admin / Fame", "Event · guest", "Event · Pricing sheet", "Desktop · event". Business rules: spec §2 (pricing, roles).

**Files:**
- Modify: `src/features/current-event/current-event.component.tsx` (render part plus the hint state; keep all data and handler code)
- Replace: `src/features/current-event/player-payment-card.tsx` → exports `PlayerPaymentRow`
- Modify: `src/components/card-type-counts.tsx` (chips)
- Modify: `src/components/auto-pricing-sheet.tsx`, `src/components/pricing-params-form.tsx`
- Modify: `src/components/player-card-usage.tsx` (compact stepper)
- Modify: `src/hooks/use-usage-change.ts` (translated toast texts as a parameter)
- Modify: `src/app/(app)/event/[id]/page.tsx`
- Delete: `src/features/current-event/players-by-card-type-dropdown.tsx`
- Modify: `en.ts`, `pl.ts`
- Test: `src/_tests_/pricing-hints.test.ts`

**Interfaces:**
- Consumes: `filterByPaid`, `paidSummary`, `averageAmount` (Task 10); DS components; `ScreenHeader`.
- Produces:

```ts
pricingHints(a: { eventCourts: number | null | undefined; playersCount: number; draft: { courts: number; hours: number; pricePerHour: number };
                  defaults: { hours: number; pricePerHour: number } }):
  { courtsAuto: boolean; hoursFromDefaults: boolean; priceFromDefaults: boolean }   // in src/utils/event-view.ts
PlayerPaymentRow(props: { player: Player; paid: boolean; canEdit: boolean; onPaidChange(id: string, paid: boolean): void;
                          amount?: number; usage: number; onUsageChange(id: string, usage: number): void })
AutoPricingSheet: same props as today + { hints: ReturnType<typeof pricingHints>; fameCleared: boolean; playersCount: number; discountPerUsage: number }
useUsageChange(..., discountPerUsage, messages: { success: string; error: string })     // new last parameter
```

- [ ] **Step 1: Write the failing test**

```ts
import { pricingHints } from "~/utils/event-view";

test("pricing hints show where values come from", () => {
  expect(pricingHints({ eventCourts: null, playersCount: 16, draft: { courts: 4, hours: 2, pricePerHour: 77 }, defaults: { hours: 2, pricePerHour: 77 } }))
    .toEqual({ courtsAuto: true, hoursFromDefaults: true, priceFromDefaults: true });
  expect(pricingHints({ eventCourts: 3, playersCount: 16, draft: { courts: 3, hours: 1.5, pricePerHour: 80 }, defaults: { hours: 2, pricePerHour: 77 } }))
    .toEqual({ courtsAuto: false, hoursFromDefaults: false, priceFromDefaults: false });
  expect(pricingHints({ eventCourts: null, playersCount: 16, draft: { courts: 5, hours: 2, pricePerHour: 77 }, defaults: { hours: 2, pricePerHour: 77 } }).courtsAuto)
    .toBe(false);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test -- pricing-hints`
Expected: FAIL (`pricingHints` is not exported).

- [ ] **Step 3: pricingHints**

Append to `src/utils/event-view.ts`:

```ts
import { getCourtsFromPlayersCount } from "~/constants/event-pricing-defaults";

export function pricingHints(a: {
  eventCourts: number | null | undefined; playersCount: number;
  draft: { courts: number; hours: number; pricePerHour: number };
  defaults: { hours: number; pricePerHour: number };
}) {
  return {
    courtsAuto: a.eventCourts == null && a.draft.courts === getCourtsFromPlayersCount(a.playersCount),
    hoursFromDefaults: a.draft.hours === a.defaults.hours,
    priceFromDefaults: a.draft.pricePerHour === a.defaults.pricePerHour,
  };
}
```

(Move the `import` line to the top of the file.)

- [ ] **Step 4: Dictionary keys**

en:

```ts
"event.pricing": "Pricing",
"event.lottery": "Lottery",
"event.players": "Players",
"event.paid": "Paid",
"event.unpaid": "Unpaid",
"event.avgPrice": "Average price",
"event.avgShort": "PLN avg",
"event.paidShort": "paid",
"event.playersShort": "players",
"event.filter": "Payment filter",
"event.filterAll": "All {count}",
"event.filterUnpaid": "Unpaid {count}",
"event.filterPaid": "Paid {count}",
"event.cardUse": "card ×{count}",
"event.cardUsage": "Card usage for {name}",
"event.paidToggle": "Paid: {name}",
"event.notFound": "Event not found",
"event.usageUpdated": "Card usage updated successfully",
"event.usageFailed": "Failed to update card usage",
"event.amountsUpdated": "Player payment amounts updated successfully!",
"event.amountsFailed": "Failed to update player payment amounts.",
"event.discardTitle": "Discard changes?",
"event.discardText": "You have unsaved changes to the pricing parameters. Are you sure you want to discard them?",
"event.discard": "Discard",
"pricing.title": "Pricing",
"pricing.subtitle": "{name} · {players}",
"pricing.courts": "Courts",
"pricing.hours": "Hours",
"pricing.pricePerHour": "Price per 1h",
"pricing.fameTotal": "FAME total",
"pricing.optional": "optional, PLN",
"pricing.courtsAuto": "auto: {count} players ÷ 4",
"pricing.fromDefaults": "from Defaults",
"pricing.pln": "PLN",
"pricing.fameCleared": "FAME total was cleared after a card-usage change. Enter it again if needed.",
"pricing.cardUseInfo": "Each card use takes {amount} PLN off that player (Defaults). Card use is set on each player row.",
"pricing.fameDiscount": "Fame discount",
"pricing.toBePaid": "To be paid",
"pricing.apply": "Apply",
"pricing.readOnly": "Apply is available to Admin and Fame.",
```

pl:

```ts
"event.pricing": "Cennik",
"event.lottery": "Losowanie",
"event.players": "Gracze",
"event.paid": "Opłacone",
"event.unpaid": "Nieopłacone",
"event.avgPrice": "Średnia cena",
"event.avgShort": "zł średnio",
"event.paidShort": "opłacono",
"event.playersShort": "graczy",
"event.filter": "Filtr płatności",
"event.filterAll": "Wszyscy {count}",
"event.filterUnpaid": "Nieopłac. {count}",
"event.filterPaid": "Opłac. {count}",
"event.cardUse": "karta ×{count}",
"event.cardUsage": "Użycie karty: {name}",
"event.paidToggle": "Opłacone: {name}",
"event.notFound": "Nie znaleziono wydarzenia",
"event.usageUpdated": "Zaktualizowano użycie karty",
"event.usageFailed": "Nie udało się zaktualizować użycia karty",
"event.amountsUpdated": "Zaktualizowano kwoty graczy!",
"event.amountsFailed": "Nie udało się zaktualizować kwot.",
"event.discardTitle": "Odrzucić zmiany?",
"event.discardText": "Masz niezapisane zmiany w parametrach ceny. Na pewno chcesz je odrzucić?",
"event.discard": "Odrzuć",
"pricing.title": "Cennik",
"pricing.subtitle": "{name} · {players}",
"pricing.courts": "Korty",
"pricing.hours": "Godziny",
"pricing.pricePerHour": "Cena za 1 h",
"pricing.fameTotal": "FAME łącznie",
"pricing.optional": "opcjonalnie, zł",
"pricing.courtsAuto": "auto: {count} graczy ÷ 4",
"pricing.fromDefaults": "z ustawień domyślnych",
"pricing.pln": "zł",
"pricing.fameCleared": "FAME łącznie wyczyszczono po zmianie użycia karty. Wpisz ponownie, jeśli trzeba.",
"pricing.cardUseInfo": "Każde użycie karty obniża cenę gracza o {amount} zł (ustawienia domyślne). Użycie karty ustawiasz przy graczu.",
"pricing.fameDiscount": "Rabat Fame",
"pricing.toBePaid": "Do zapłaty",
"pricing.apply": "Zastosuj",
"pricing.readOnly": "Zastosować mogą Admin i Fame.",
```

- [ ] **Step 5: use-usage-change messages**

In `src/hooks/use-usage-change.ts`, add a last parameter `messages: { success: string; error: string }`. Replace `toast.success("Card usage updated successfully")` with `toast.success(messages.success)` and `toast.error("Failed to update card usage")` with `toast.error(messages.error)`. Add `messages` to the `useCallback` dependency list. Nothing else changes.

- [ ] **Step 6: PlayerPaymentRow (replace player-payment-card.tsx)**

```tsx
"use client";
import { PlayerAvatar } from "~/components/ds/player-avatar";
import { Chip } from "~/components/ds/chip";
import { Stepper } from "~/components/ds/stepper";
import type { Player } from "~/lib/db";
import { useT } from "~/i18n/i18n-provider";
import { cn } from "~/lib/utils";

export function PlayerPaymentRow({ player, paid, canEdit, onPaidChange, amount, usage, onUsageChange }: {
  player: Player; paid: boolean; canEdit: boolean; onPaidChange: (id: string, paid: boolean) => void;
  amount?: number; usage: number; onUsageChange: (id: string, usage: number) => void;
}) {
  const t = useT();
  const hasCard = player.cardType !== "No card";
  const meta = [t(`cardType.${player.cardType}`), amount != null ? t("common.pln", { value: amount }) : null,
    !canEdit && hasCard && usage > 0 ? t("event.cardUse", { count: usage }) : null].filter(Boolean).join(" · ");
  return (
    <div className="flex min-h-[56px] items-center gap-2.5 py-2">
      <PlayerAvatar name={player.name} cardType={player.cardType} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">{player.name}</div>
        <div className="truncate text-xs text-muted-foreground">{meta}</div>
      </div>
      {canEdit && hasCard ? (
        <Stepper value={usage} min={0} onChange={(v) => onUsageChange(player.id, v)} label={t("event.cardUsage", { name: player.name })} />
      ) : null}
      {canEdit ? (
        <button type="button" role="switch" aria-checked={paid} aria-label={t("event.paidToggle", { name: player.name })}
          onClick={() => onPaidChange(player.id, !paid)}
          className={cn("relative h-[26px] w-11 flex-none rounded-full transition-colors", paid ? "bg-coral" : "bg-[#D8D2E6]")}>
          <span className={cn("absolute top-[3px] h-5 w-5 rounded-full bg-white transition-all", paid ? "right-[3px]" : "left-[3px]")} />
        </button>
      ) : (
        <Chip tone={paid ? "success" : "warning"}>{paid ? t("event.paid") : t("event.unpaid")}</Chip>
      )}
    </div>
  );
}
```

`player-card-usage.tsx` is no longer used by the event screen. Delete it if `grep -rn PlayerCardUsage src` finds nothing else.

- [ ] **Step 7: CardTypeCounts as chips**

Replace the body of `src/components/card-type-counts.tsx`:

```tsx
"use client";
import type { CardType } from "~/lib/db";
import { CARD_TYPE_STYLE } from "~/utils/getCardTypeColor";
import { getCardTypeDisplayLabel } from "~/utils/card-type-display";
import { useIsDesktop } from "~/hooks/use-media-query";
import { useT } from "~/i18n/i18n-provider";
import { cn } from "~/lib/utils";

export function CardTypeCounts({ items }: { items: { type: CardType; count: number }[] }) {
  const t = useT();
  const isDesktop = useIsDesktop();
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.filter((i) => i.count > 0).map(({ type, count }) => (
        <span key={type} className={cn("rounded-full px-2.5 py-1 text-xs font-extrabold", CARD_TYPE_STYLE[type].soft, CARD_TYPE_STYLE[type].ink)}>
          {isDesktop ? t(`cardType.${type}`) : getCardTypeDisplayLabel(type)} {count}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 8: PricingParamsForm and AutoPricingSheet**

`pricing-params-form.tsx`:
- keep the exported types and the `onChange` semantics exactly;
- replace the markup with three rows plus the FAME block, as in the canvas "Event · Pricing sheet";
- add the props `hints`, `fameCleared`, `playersCount`, `discountPerUsage`.

Code:

```tsx
"use client";
import { Stepper } from "~/components/ds/stepper";
import { useT } from "~/i18n/i18n-provider";

export interface PricingParamsFormValue { courts: number; hours: number; pricePerHour: number; fameTotal: number | null; }

type Props = {
  value: PricingParamsFormValue; onChange: (value: PricingParamsFormValue) => void;
  fameDiscount?: string; priceAfterDiscount?: string;
  hints: { courtsAuto: boolean; hoursFromDefaults: boolean; priceFromDefaults: boolean };
  fameCleared: boolean; playersCount: number; discountPerUsage: number;
};

const input = "w-24 rounded-[10px] border border-line px-2.5 py-2 text-right text-[15px] font-extrabold";

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#F0ECF7] py-2.5 last:border-0">
      <div><div className="text-sm font-extrabold">{label}</div>{hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}</div>
      {children}
    </div>
  );
}

export function PricingParamsForm({ value, onChange, fameDiscount, priceAfterDiscount, hints, fameCleared, playersCount, discountPerUsage }: Props) {
  const t = useT();
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-line bg-white px-3.5 py-1">
        <Row label={t("pricing.courts")} hint={hints.courtsAuto ? t("pricing.courtsAuto", { count: playersCount }) : undefined}>
          <Stepper value={value.courts} min={1} max={5} onChange={(v) => onChange({ ...value, courts: v })} label={t("pricing.courts")} />
        </Row>
        <Row label={t("pricing.hours")} hint={hints.hoursFromDefaults ? t("pricing.fromDefaults") : undefined}>
          <Stepper value={value.hours} min={1} max={4} step={0.5} onChange={(v) => onChange({ ...value, hours: v })} label={t("pricing.hours")} />
        </Row>
        <Row label={t("pricing.pricePerHour")} hint={`${t("pricing.pln")}${hints.priceFromDefaults ? ` · ${t("pricing.fromDefaults")}` : ""}`}>
          <input inputMode="decimal" aria-label={t("pricing.pricePerHour")} className={input} value={String(value.pricePerHour)}
            onChange={(e) => onChange({ ...value, pricePerHour: Number(e.target.value) || 0 })} />
        </Row>
        <div className="flex flex-col gap-1.5 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div><div className="text-sm font-extrabold">{t("pricing.fameTotal")}</div><div className="text-xs text-muted-foreground">{t("pricing.optional")}</div></div>
            <input inputMode="decimal" aria-label={t("pricing.fameTotal")} placeholder="—" className={input}
              value={value.fameTotal === null || value.fameTotal === undefined ? "" : String(value.fameTotal)}
              onChange={(e) => { const raw = e.target.value.trim(); onChange({ ...value, fameTotal: raw === "" ? null : Number(raw) || 0 }); }} />
          </div>
          {fameCleared && value.fameTotal == null ? <div className="text-xs font-bold text-[#9A3412]">{t("pricing.fameCleared")}</div> : null}
        </div>
      </div>
      <div className="px-1 text-xs text-muted-foreground">{t("pricing.cardUseInfo", { amount: discountPerUsage })}</div>
      {(fameDiscount != null || priceAfterDiscount != null) ? (
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-brand-900 p-3.5 text-white">
          <div><div className="text-[11px] font-bold text-[#D9CCF0]">{t("pricing.fameDiscount")}</div><div className="text-base font-extrabold">{fameDiscount ? t("common.pln", { value: fameDiscount }) : "—"}</div></div>
          <div><div className="text-[11px] font-bold text-[#D9CCF0]">{t("pricing.toBePaid")}</div><div className="text-base font-extrabold">{priceAfterDiscount ? t("common.pln", { value: priceAfterDiscount }) : "—"}</div></div>
        </div>
      ) : null}
    </div>
  );
}
```

The Courts stepper covers 1–5 and the Hours stepper 1–4 in 0.5 steps: exactly the options of the old `<Select>`s.

`auto-pricing-sheet.tsx`:
- keep the props and the `formValue` / `handleParamsFormChange` logic;
- delete `AutoPricingSheetTrigger` and the trigger button;
- render the form inside `ResponsiveSheet` (`title={t("pricing.title")}`, `description={t("pricing.subtitle", { name: eventName, players: t("common.players", { count: playersCount }) })}`);
- footer: if role is Admin or Fame, show `<Button variant="accent" className="w-full" onClick={onSave} disabled={!isDirty || saving}>{saving ? <Loader2 className="animate-spin" /> : null}{t("pricing.apply")}</Button>`; otherwise show `<div className="text-center text-xs text-muted-foreground">{t("pricing.readOnly")}</div>`.

Add the props `eventName: string`, `hints`, `fameCleared`, `playersCount`, `discountPerUsage` and pass them through to `PricingParamsForm`.

- [ ] **Step 9: CurrentEvent render**

In `current-event.component.tsx`:

1. Imports. Remove `Users`, `AutoPricingSheetTrigger`, `PlayerPaymentCard`, `PlayersByCardTypeDropdown`, `FullSizeLoader`, `Breadcrumbs` and `getCardTypeColor`. Add:

```tsx
import { Dices, SlidersHorizontal } from "lucide-react";
import { useGetRole } from "~/hooks/use-get-role";
import { Role } from "~/lib/roles";
import { useI18n } from "~/i18n/i18n-provider";
import { ScreenHeader } from "~/components/shell/screen-header";
import { GuardedLink } from "~/components/shell/navigation-guard";
import { PageBody } from "~/components/ds/page-body";
import { StatTile } from "~/components/ds/stat-tile";
import { Segmented } from "~/components/ds/segmented";
import { SkeletonRows } from "~/components/ds/skeleton-rows";
import { EmptyState } from "~/components/ds/empty-state";
import { Button } from "~/components/ui/button";
import { PlayerPaymentRow } from "./player-payment-row";
import { averageAmount, filterByPaid, paidSummary, pricingHints, type PaidFilter } from "~/utils/event-view";
```

Rename the file `player-payment-card.tsx` to `player-payment-row.tsx` with `git mv`.

2. New state, next to the other `useState`s:

```tsx
const { t, fmt } = useI18n();
const { role } = useGetRole();
const canEdit = role === Role.Admin || role === Role.Fame;
const [filter, setFilter] = useState<PaidFilter>("all");
const [fameCleared, setFameCleared] = useState(false);
```

3. Toasts. In `handleApplyAutoPricing`, use `t("event.amountsUpdated")` / `t("event.amountsFailed")` and add `t` to its dependency array. After a successful apply, call `setFameCleared(false)`. Pass `{ success: t("event.usageUpdated"), error: t("event.usageFailed") }` as the new last argument of `useUsageChange(...)`.

4. The wrapper that records the FAME reset (business rule: changing usage clears `fame_total`):

```tsx
const onUsageChange = (playerId: string, usage: number) => {
  if (event?.fame_total != null) setFameCleared(true);
  void handleUsageChange(playerId, usage);
};
```

5. Replace everything from `if (isLoading) {` to the end of the component's `return (...)` with:

```tsx
if (isLoading) {
  return <PageBody><SkeletonRows count={8} /></PageBody>;
}

if (!event) {
  return <PageBody><EmptyState title={t("event.notFound")} /></PageBody>;
}

const sortedCardTypeCounts = getSortedCardTypeCounts(event);
const sortedPlayers = getSortedPlayers(event);
const summary = paidSummary(event.players.map((p) => ({ paid: paymentStatus[p.id] })));
const avg = averageAmount(playerPaymentAmount, event.players.map((p) => p.id));
const visiblePlayers = filterByPaid(sortedPlayers, paymentStatus, filter);
const hints = pricingHints({ eventCourts: event.courts, playersCount: event.players.length, draft: draftPricingParams, defaults: defaultPricingValues });
const openPricing = () => handleAutoPricingSheetOpenChange(true);
const dateLabel = fmt(event.date, "EEE d MMM yyyy");

const pricingButton = (
  <Button variant="outline" onClick={openPricing}><SlidersHorizontal />{t("event.pricing")}</Button>
);
const lotteryButton = (
  <Button asChild variant="outline"><GuardedLink href={`/event/${event.id}/lottery`}><Dices />{t("event.lottery")}</GuardedLink></Button>
);

return (
  <>
    <ScreenHeader
      title={event.name}
      back={{ href: "/", label: t("nav.events") }}
      crumbs={[{ label: t("nav.events"), href: "/" }, { label: event.name }]}
      meta={dateLabel}
      actions={<>{lotteryButton}{pricingButton}</>}
      mobileBarAction={
        <button type="button" onClick={openPricing} className="flex items-center gap-1.5 rounded-[10px] bg-white/[0.12] px-2.5 py-2 text-[13px] font-bold">
          <SlidersHorizontal className="h-4 w-4" />{t("event.pricing")}
        </button>
      }
      mobileHero={
        <section className="flex flex-col gap-2.5 bg-brand-900 px-4 pb-[18px] pt-1 text-white">
          <div className="text-xs font-bold text-[#D9CCF0]">{dateLabel}</div>
          <h1 className="text-[26px] font-extrabold tracking-tight">{event.name}</h1>
          <div className="grid grid-cols-3 gap-2">
            <StatTile tone="onDark" label={t("event.playersShort")} value={summary.total} />
            <StatTile tone="onDark" label={t("event.paidShort")} value={`${summary.paid}/${summary.total}`} />
            <StatTile tone="onDark" label={t("event.avgShort")} value={avg ?? "—"} />
          </div>
        </section>
      }
    />
    <PageBody>
      <div className="hidden grid-cols-4 gap-3 md:grid">
        <StatTile label={t("event.players")} value={summary.total} />
        <StatTile label={t("event.paid")} value={summary.paid} sub={`/ ${summary.total}`} progress={summary.total ? (summary.paid / summary.total) * 100 : 0} />
        <StatTile label={t("event.unpaid")} value={summary.unpaid} valueClassName="text-[#9A3412]" />
        <StatTile label={t("event.avgPrice")} value={avg ?? "—"} sub={avg != null ? t("pricing.pln") : undefined} />
      </div>
      <section className="overflow-hidden rounded-2xl border-line md:border md:bg-white">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:border-b md:border-line md:px-[18px] md:py-3.5">
          <CardTypeCounts items={sortedCardTypeCounts} />
          <Segmented<PaidFilter> ariaLabel={t("event.filter")} value={filter} onChange={setFilter} className="md:ml-auto md:w-[300px]"
            options={[
              { value: "all", label: t("event.filterAll", { count: summary.total }) },
              { value: "unpaid", label: t("event.filterUnpaid", { count: summary.unpaid }) },
              { value: "paid", label: t("event.filterPaid", { count: summary.paid }) },
            ]} />
        </div>
        <div className="mt-2 grid grid-cols-1 divide-y divide-[#F0ECF7] rounded-2xl border border-line bg-white px-3 md:mt-0 md:grid-cols-2 md:gap-x-7 md:divide-y-0 md:rounded-none md:border-0 md:px-[18px] md:py-1.5 lg:grid-cols-3 [&>*]:border-[#F0ECF7] md:[&>*]:border-b">
          {visiblePlayers.map((player) => (
            <PlayerPaymentRow key={player.id} player={player} paid={!!paymentStatus[player.id]} canEdit={canEdit}
              onPaidChange={handlePaymentChange} amount={playerPaymentAmount[player.id]}
              usage={playerUsages[player.id] ?? 0} onUsageChange={onUsageChange} />
          ))}
        </div>
      </section>
    </PageBody>

    <AutoPricingSheet
      open={autoPricingSheetOpen}
      onOpenChange={handleAutoPricingSheetOpenChange}
      params={draftPricingParams}
      onParamsChange={setDraftPricingParams}
      isDirty={isAutoPricingDirty}
      onSave={handleApplyAutoPricing}
      saving={savingPricing}
      showTrigger={false}
      fameDiscount={pricingStatistics?.fameDiscount}
      priceAfterDiscount={pricingStatistics?.priceAfterDiscount}
      eventName={event.name}
      hints={hints}
      fameCleared={fameCleared}
      playersCount={event.players.length}
      discountPerUsage={discountPerUsage}
    />

    <ConfirmDialog
      open={discardDialogOpen}
      onOpenChange={setDiscardDialogOpen}
      title={t("event.discardTitle")}
      description={t("event.discardText")}
      confirmLabel={t("event.discard")}
      confirmVariant="destructive"
      onConfirm={handleDiscardAutoPricing}
    />
  </>
);
```

Keep `import { CardTypeCounts } from "~/components/card-type-counts";`. Do **not** touch `loadInitialEvent`, `handlePaymentChange`, `handleApplyAutoPricing` (except the toast strings), `handleAutoPricingSheetOpenChange`, `handleDiscardAutoPricing` or `pricingStatistics`.

6. `src/app/(app)/event/[id]/page.tsx`: remove the unused `Inter` import. It returns `<CurrentEvent id={id} />` with no wrapper div.

- [ ] **Step 10: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS, with unchanged golden snapshots. Manual: test cases 4.1–4.15. In particular, compare amounts with the values recorded in step 0.2 of the test-case doc (case 4.14).

- [ ] **Step 11: Commit**

```bash
git add -A src/features/current-event src/components/card-type-counts.tsx src/components/auto-pricing-sheet.tsx src/components/pricing-params-form.tsx src/components/player-card-usage.tsx src/hooks/use-usage-change.ts "src/app/(app)/event/[id]/page.tsx" src/utils/event-view.ts src/i18n src/_tests_/pricing-hints.test.ts
git commit -m "feat(event): redesigned event screen, payment rows, pricing sheet with hints

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: FFP calculator restyle (critical regression)

Canvas: "FFP calculator · sheet", "Desktop · FFP dialog". The state, the default values and the `calculateStatistics(transformState(...))` call in `FfpForm` stay **byte-for-byte**. Only the JSX below `return (` changes. The Courts and Hours `<Select>`s become steppers that write the **same strings** to state.

**Files:**
- Modify: `src/components/ffp-form.component.tsx` (only the JSX after `return (` and the helper components at the bottom)
- Modify: `src/components/ResultsPanel.component.tsx`
- Modify: `en.ts`, `pl.ts`
- Test: `src/_tests_/ffp-form.test.tsx`

**Interfaces:**
- Consumes: `Stepper`, `SectionLabel`, `useT`.
- Produces: result cells carry `data-testid="ffp-<key>"`, where key ∈ `medicover | medicoverLight | MS | msClassic | noMs | totalPrice | discount | fameDiscount | priceAfterDiscount`.

- [ ] **Step 1: Write the failing test**

```tsx
import { fireEvent, screen } from "@testing-library/react";
import { renderWithI18n } from "./test-utils";
import { FfpForm } from "~/components/ffp-form.component";
import { calculateStatistics } from "~/services/calculation-service";
import { transformState } from "~/utils/util";

const set = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

test("restyled FFP form produces exactly calculateStatistics output", () => {
  renderWithI18n(<FfpForm />);
  for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole("button", { name: "Increase Courts" }));
  set("Price per 1h", "77");
  set("Medicover owners", "3"); set("Medicover usage", "2");
  set("Medicover Light owners", "2"); set("Medicover Light usage", "1");
  set("MS+ owners", "3"); set("Multisport usage", "2");
  set("MS Classic owners", "2"); set("No card", "4");

  const expected = calculateStatistics(transformState({
    courts: "3", hours: "2", pricePerHour: "77", fameTotal: "",
    medicoverLightOwners: "2", mCoverOwners: "3", msOwners: "3", msClassicOwners: "2", noCard: "4",
    medicoverLightUsage: "1", mCoverUsage: "2", msUsage: "2",
  }));
  const show = (v?: string) => (v ? `${v} PLN` : "—");
  expect(screen.getByTestId("ffp-medicover")).toHaveTextContent(show(expected.medicover));
  expect(screen.getByTestId("ffp-medicoverLight")).toHaveTextContent(show(expected.medicoverLight));
  expect(screen.getByTestId("ffp-MS")).toHaveTextContent(show(expected.MS));
  expect(screen.getByTestId("ffp-msClassic")).toHaveTextContent(show(expected.msClassic));
  expect(screen.getByTestId("ffp-noMs")).toHaveTextContent(show(expected.noMs));
  expect(screen.getByTestId("ffp-totalPrice")).toHaveTextContent(show(expected.totalPrice));
  expect(screen.getByTestId("ffp-discount")).toHaveTextContent(show(expected.discount));
  expect(screen.getByTestId("ffp-fameDiscount")).toHaveTextContent(show(expected.fameDiscount));
  expect(screen.getByTestId("ffp-priceAfterDiscount")).toHaveTextContent(show(expected.priceAfterDiscount));
});

test("hours stepper moves in 0.5 steps within 1..4", () => {
  renderWithI18n(<FfpForm />);
  fireEvent.click(screen.getByRole("button", { name: "Increase Hours" }));
  expect(screen.getByRole("group", { name: "Hours" })).toHaveTextContent("2.5");
});
```

The stepper's aria-labels come from `t("common.increase")` + label. The labels are English because the test renders with the default `en` locale.

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test -- ffp-form`
Expected: FAIL (no "Increase Courts" button and no test ids).

- [ ] **Step 3: Dictionary keys**

en:

```ts
"ffp.court": "Court",
"ffp.cards": "Cards",
"ffp.owners": "Owners",
"ffp.usage": "Usage",
"ffp.courts": "Courts",
"ffp.hours": "Hours",
"ffp.pricePerHour": "Price per 1h",
"ffp.fameTotal": "FAME total",
"ffp.medicoverOwners": "Medicover owners",
"ffp.medicoverUsage": "Medicover usage",
"ffp.mlOwners": "Medicover Light owners",
"ffp.mlUsage": "Medicover Light usage",
"ffp.msOwners": "MS+ owners",
"ffp.msUsage": "Multisport usage",
"ffp.msClassicOwners": "MS Classic owners",
"ffp.noCard": "No card",
"ffp.perPlayer": "Per player",
"ffp.r.medicover": "Medicover",
"ffp.r.medicoverLight": "Medicover Light",
"ffp.r.MS": "MS+",
"ffp.r.msClassic": "MS classic",
"ffp.r.noMs": "No card",
"ffp.r.totalPrice": "Total w/o discount",
"ffp.r.discount": "Card discount",
"ffp.r.fameDiscount": "Fame discount",
"ffp.r.priceAfterDiscount": "To be paid",
```

pl:

```ts
"ffp.court": "Kort",
"ffp.cards": "Karty",
"ffp.owners": "Posiadacze",
"ffp.usage": "Użycia",
"ffp.courts": "Korty",
"ffp.hours": "Godziny",
"ffp.pricePerHour": "Cena za 1 h",
"ffp.fameTotal": "FAME łącznie",
"ffp.medicoverOwners": "Posiadacze Medicover",
"ffp.medicoverUsage": "Użycia Medicover",
"ffp.mlOwners": "Posiadacze Medicover Light",
"ffp.mlUsage": "Użycia Medicover Light",
"ffp.msOwners": "Posiadacze MS+",
"ffp.msUsage": "Użycia Multisport",
"ffp.msClassicOwners": "Posiadacze MS Classic",
"ffp.noCard": "Bez karty",
"ffp.perPlayer": "Na gracza",
"ffp.r.medicover": "Medicover",
"ffp.r.medicoverLight": "Medicover Light",
"ffp.r.MS": "MS+",
"ffp.r.msClassic": "MS classic",
"ffp.r.noMs": "Bez karty",
"ffp.r.totalPrice": "Suma bez rabatu",
"ffp.r.discount": "Rabat za karty",
"ffp.r.fameDiscount": "Rabat Fame",
"ffp.r.priceAfterDiscount": "Do zapłaty",
```

- [ ] **Step 4: FfpForm JSX**

In `ffp-form.component.tsx`:
- keep everything from `export function FfpForm(` up to and including the `useEffect` exactly as is;
- remove the `Select*` imports and add `import { Stepper } from "~/components/ds/stepper"; import { SectionLabel } from "~/components/ds/section-label"; import { useT } from "~/i18n/i18n-provider";`;
- add `const t = useT();` as the first line of the component body (hooks before other hooks is fine; it does not affect the state order logic);
- replace the returned JSX and the `Row` / `Label` / `Column` helpers with:

```tsx
  const num = "w-full rounded-[10px] border border-line px-2.5 py-2 text-center text-[15px] font-extrabold";
  const field = (label: string, value: string, set: (v: string) => void) => (
    <label className="flex flex-col gap-1 text-xs font-bold text-[#4A4361]">
      {label}
      <input inputMode="decimal" aria-label={label} className={num} value={value} onChange={(e) => set(e.target.value)} />
    </label>
  );
  const cardRow = (dot: string, label: string, owners: [string, string, (v: string) => void], usage?: [string, string, (v: string) => void]) => (
    <>
      <span className="flex items-center gap-1.5 text-[13px] font-bold"><span className={`h-2 w-2 rounded-full ${dot}`} />{label}</span>
      <input inputMode="numeric" aria-label={owners[0]} className={num} value={owners[1]} onChange={(e) => owners[2](e.target.value)} />
      {usage ? <input inputMode="numeric" aria-label={usage[0]} className={num} value={usage[1]} onChange={(e) => usage[2](e.target.value)} /> : <span />}
    </>
  );

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-[18px]">
      <div className="flex flex-col gap-3 md:flex-[1_1_420px]">
        <section className="rounded-2xl border border-line bg-white p-3.5">
          <SectionLabel className="mb-2">{t("ffp.court")}</SectionLabel>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="flex flex-col gap-1 text-xs font-bold text-[#4A4361]">{t("ffp.courts")}
              <Stepper value={Number(courts) || 0} min={1} max={5} onChange={(v) => setCourts(String(v))} label={t("ffp.courts")} />
            </div>
            <div className="flex flex-col gap-1 text-xs font-bold text-[#4A4361]">{t("ffp.hours")}
              <Stepper value={Number(hours) || 0} min={1} max={4} step={0.5} onChange={(v) => setHours(String(v))} label={t("ffp.hours")} />
            </div>
            {field(t("ffp.pricePerHour"), pricePerHour, setPricePerHour)}
            {field(t("ffp.fameTotal"), fameTotal, setFameTotal)}
          </div>
        </section>
        <section className="rounded-2xl border border-line bg-white p-3.5">
          <div className="grid grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))] items-center gap-x-2 gap-y-1.5">
            <SectionLabel>{t("ffp.cards")}</SectionLabel>
            <span className="text-center text-xs font-bold text-muted-foreground">{t("ffp.owners")}</span>
            <span className="text-center text-xs font-bold text-muted-foreground">{t("ffp.usage")}</span>
            {cardRow("bg-[#1D4ED8]", t("cardType.Medicover"), [t("ffp.medicoverOwners"), mCoverOwners, setMCoverOwners], [t("ffp.medicoverUsage"), mCoverUsage, setMCoverUsage])}
            {cardRow("bg-[#6D28D9]", t("cardType.Medicover Light"), [t("ffp.mlOwners"), medicoverLightOwners, setMedicoverLightOwners], [t("ffp.mlUsage"), medicoverLightUsage, setMedicoverLightUsage])}
            {cardRow("bg-[#15803D]", "MS+", [t("ffp.msOwners"), msOwners, setMSOwners], [t("ffp.msUsage"), msUsage, setMSUsage])}
            {cardRow("bg-[#B45309]", "MS Classic", [t("ffp.msClassicOwners"), msClassicOwners, setMSClassicOwners])}
            {cardRow("bg-[#475569]", t("cardType.No card"), [t("ffp.noCard"), noCard, setNoCard])}
          </div>
        </section>
      </div>
      <div className="md:sticky md:top-0 md:flex-[1_1_300px]">
        <ResultsPanel statistics={statistics} />
      </div>
    </div>
  );
}
```

Remove the `<img src="/divider.png">`. The mobile sheet scrolls, and the results panel ends with the coral "To be paid" block, so the final number is the last thing on screen.

- [ ] **Step 5: ResultsPanel**

Replace the markup of `src/components/ResultsPanel.component.tsx`. Keep its props (`statistics`) and the "value ? value + ' PLN' : '—'" rule:

```tsx
"use client";
import { type Statistics } from "~/services/calculation-service";
import { SectionLabel } from "~/components/ds/section-label";
import { useT } from "~/i18n/i18n-provider";
import type { MessageKey } from "~/i18n/messages/en";

const ROWS: (keyof Statistics)[] = ["medicover", "medicoverLight", "MS", "msClassic", "noMs", "totalPrice", "discount", "fameDiscount"];

export function ResultsPanel({ statistics }: { statistics: Statistics }) {
  const t = useT();
  const show = (v?: string) => (v ? `${v} PLN` : "—");
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-line bg-white px-3.5 py-3">
        <SectionLabel className="mb-1">{t("ffp.perPlayer")}</SectionLabel>
        {ROWS.map((k) => (
          <div key={k} className="flex justify-between border-b border-[#F0ECF7] py-1.5 text-sm last:border-0">
            <span className="text-[#4A4361]">{t(`ffp.r.${k}` as MessageKey)}</span>
            <span className="font-extrabold" data-testid={`ffp-${k}`}>{show(statistics[k])}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-2xl bg-coral px-4 py-3.5 text-ink">
        <span className="text-[15px] font-extrabold">{t("ffp.r.priceAfterDiscount")}</span>
        <span className="text-2xl font-extrabold" data-testid="ffp-priceAfterDiscount">{show(statistics.priceAfterDiscount)}</span>
      </div>
    </div>
  );
}
```

Check: today `ResultsPanel` is a named or default export. Run `grep -n "export" src/components/ResultsPanel.component.tsx` and keep the same export form.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS. The golden snapshots and the new render test pass. Manual: test cases 5.0–5.5. Compare with the values recorded in step 0.1 (test cases 5.1–5.1c).

- [ ] **Step 7: Commit**

```bash
git add src/components/ffp-form.component.tsx src/components/ResultsPanel.component.tsx src/i18n src/_tests_/ffp-form.test.tsx
git commit -m "feat(ffp): restyled FFP calculator with steppers, same maths

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Lottery

Canvas: "Lottery · admin", "Lottery · reset confirm", "Lottery · guest", "Desktop · lottery". Spec §2 (lottery rules), §9.5 (Reset confirm) and §9.6 (free-spots hint).

**Files:**
- Modify: `src/app/(app)/event/[id]/lottery/page.tsx` (render part + translated toasts; keep data loading and handlers)
- Modify: `src/features/lottery/lottery-form.component.tsx`, `lottery-results.tsx`, `lottery-add-players-input.component.tsx`, `lottery-place-input.component.tsx`
- Modify: `src/utils/event-view.ts` (`freeSpots`)
- Modify: `en.ts`, `pl.ts`
- Test: `src/_tests_/free-spots.test.ts`

**Interfaces:**
- Produces:

```ts
freeSpots(courts: number | null | undefined, playersInEvent: number): number | null   // null when courts unknown; never < 0
LotteryForm props: today's + { winnersCount: number; onAddWinners: () => void; courts: number | null | undefined; playersInEvent: number }
LotteryResults props: today's minus nothing (addPlayersToEvent stays in the type but the button moves to LotteryForm's dock)
```

- [ ] **Step 1: Write the failing test**

```ts
import { freeSpots } from "~/utils/event-view";
test("freeSpots", () => {
  expect(freeSpots(4, 13)).toBe(3);
  expect(freeSpots(3, 12)).toBe(0);
  expect(freeSpots(2, 12)).toBe(0);
  expect(freeSpots(null, 12)).toBeNull();
  expect(freeSpots(undefined, 12)).toBeNull();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test -- free-spots`
Expected: FAIL.

- [ ] **Step 3: freeSpots**

Append to `src/utils/event-view.ts`:

```ts
import { PLAYERS_PER_COURT } from "~/constants/event-pricing-defaults";

export function freeSpots(courts: number | null | undefined, playersInEvent: number): number | null {
  if (courts == null) return null;
  return Math.max(0, courts * PLAYERS_PER_COURT - playersInEvent);
}
```

(Merge this import with the existing one from the same module at the top of the file.)

- [ ] **Step 4: Dictionary keys**

en:

```ts
"lottery.title": "Lottery",
"lottery.hint": "Choose random players to add to the event",
"lottery.participants": "Participants · {count}",
"lottery.addPlayers": "Add players…",
"lottery.places": "Places",
"lottery.freeSpots": "Free spots: {courts} courts × 4 − {players} players = {free}",
"lottery.tooManyPlaces": "You cannot have more places than players.",
"lottery.play": "Play",
"lottery.playAgain": "Play again",
"lottery.generating": "Generating…",
"lottery.addToEvent": { one: "Add {count} to event", other: "Add {count} to event" },
"lottery.reset": "Reset lottery",
"lottery.resetTitle": "Reset lottery results?",
"lottery.resetText": "Winners and the waiting list for {event} will be deleted. Players already added to the event stay in it.",
"lottery.resetConfirm": "Reset",
"lottery.winners": "Winners · {count}",
"lottery.waiting": "Waiting list · {count}",
"lottery.noWinners": "No winners yet.",
"lottery.noWaiting": "No players in the waiting list.",
"lottery.guestInfo": "If a winner drops out, the admin invites the next player from the waiting list. Players on the penalty list are skipped.",
"lottery.saved": "Winners and waiting list updated successfully!",
"lottery.saveFailed": "Failed to update winners and waiting list.",
"lottery.skipped": { one: "{count} player skipped (penalty)", other: "{count} players skipped (penalty)" },
"lottery.added": "Players added to event successfully!",
"lottery.addFailed": "Failed to add players to event.",
"lottery.hasPenalty": "{name} has an unpaid penalty.",
"lottery.promoted": "Player added to winners list successfully!",
"lottery.promoteFailed": "Failed to add player to winners list.",
"lottery.removedWinner": "Player removed from winners list successfully!",
"lottery.removeWinnerFailed": "Failed to remove player from winners list.",
"lottery.removedWaiting": "Player removed from waiting list successfully!",
"lottery.removeWaitingFailed": "Failed to remove player from waiting list.",
```

pl:

```ts
"lottery.title": "Losowanie",
"lottery.hint": "Wylosuj graczy na wolne miejsca",
"lottery.participants": "Uczestnicy · {count}",
"lottery.addPlayers": "Dodaj graczy…",
"lottery.places": "Miejsca",
"lottery.freeSpots": "Wolne miejsca: {courts} korty × 4 − {players} graczy = {free}",
"lottery.tooManyPlaces": "Miejsc nie może być więcej niż graczy.",
"lottery.play": "Losuj",
"lottery.playAgain": "Losuj ponownie",
"lottery.generating": "Losowanie…",
"lottery.addToEvent": { one: "Dodaj {count} do wydarzenia", few: "Dodaj {count} do wydarzenia", many: "Dodaj {count} do wydarzenia", other: "Dodaj {count} do wydarzenia" },
"lottery.reset": "Resetuj losowanie",
"lottery.resetTitle": "Zresetować wyniki losowania?",
"lottery.resetText": "Zwycięzcy i lista rezerwowa dla {event} zostaną usunięci. Gracze już dodani do wydarzenia w nim zostają.",
"lottery.resetConfirm": "Resetuj",
"lottery.winners": "Zwycięzcy · {count}",
"lottery.waiting": "Lista rezerwowa · {count}",
"lottery.noWinners": "Brak zwycięzców.",
"lottery.noWaiting": "Lista rezerwowa jest pusta.",
"lottery.guestInfo": "Jeśli zwycięzca zrezygnuje, admin zaprasza kolejną osobę z listy rezerwowej. Gracze z listy kar są pomijani.",
"lottery.saved": "Zapisano zwycięzców i listę rezerwową!",
"lottery.saveFailed": "Nie udało się zapisać wyników.",
"lottery.skipped": { one: "{count} gracz pominięty (kara)", few: "{count} graczy pominiętych (kara)", many: "{count} graczy pominiętych (kara)", other: "{count} gracza pominięto (kara)" },
"lottery.added": "Dodano graczy do wydarzenia!",
"lottery.addFailed": "Nie udało się dodać graczy.",
"lottery.hasPenalty": "{name} ma nieopłaconą karę.",
"lottery.promoted": "Dodano gracza do zwycięzców!",
"lottery.promoteFailed": "Nie udało się dodać gracza do zwycięzców.",
"lottery.removedWinner": "Usunięto gracza ze zwycięzców!",
"lottery.removeWinnerFailed": "Nie udało się usunąć gracza ze zwycięzców.",
"lottery.removedWaiting": "Usunięto gracza z listy rezerwowej!",
"lottery.removeWaitingFailed": "Nie udało się usunąć gracza z listy rezerwowej.",
```

- [ ] **Step 5: Page**

In `lottery/page.tsx`:
- remove the imports of `Navbar` and `Toaster` and the `<Toaster />` element;
- add `const { t } = useI18n();`;
- replace every toast string with its key, for example `toast.warning(t("lottery.skipped", { count: skipped.length }))` and `toast.error(t("lottery.hasPenalty", { name: player.name }))`;
- keep every handler body otherwise identical;
- replace `if (isLoading) return <FullSizeLoader />;` with `return <PageBody><SkeletonRows count={6} /></PageBody>;`.

Replace the returned JSX with:

```tsx
const winnersCount = winnersList.length;
const results = (
  <LotteryResults
    winnersList={withFreshPenalty(winnersList, allPlayers)}
    waitingList={withFreshPenalty(waitingList, allPlayers)}
    addPlayersToEvent={addPlayersToEvent}
    handleAddPlayer={handleAddPlayer}
    handleRemoveWinner={handleRemoveWinner}
    handleRemoveFromWaitingList={handleRemoveFromWaitingList}
  />
);
return (
  <>
    <ScreenHeader
      title={t("lottery.title")}
      back={{ href: `/event/${id}`, label: event?.name ?? t("nav.events") }}
      crumbs={[{ label: t("nav.events"), href: "/" }, { label: event?.name ?? "", href: `/event/${id}` }, { label: t("lottery.title") }]}
      meta={t("lottery.hint")}
    />
    <PageBody className={role === "admin" ? "pb-24 md:pb-0" : undefined}>
      {role === "admin" ? (
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-5">
          <div className="md:flex-[1_1_380px]">
            <LotteryForm event={event} availablePlayers={availablePlayers} isWinners={isWinners}
              onReset={handleReset} onLotteryGenerated={handleLotteryGenerated}
              winnersCount={winnersCount} onAddWinners={() => void addPlayersToEvent(winnersList)}
              courts={event?.courts} playersInEvent={event?.players.length ?? 0} />
          </div>
          <div className="flex flex-col gap-3 md:flex-[999_1_520px]">{results}</div>
        </div>
      ) : (
        <>
          {results}
          <Notice tone="info">{t("lottery.guestInfo")}</Notice>
        </>
      )}
    </PageBody>
  </>
);
```

Imports to add: `ScreenHeader`, `PageBody`, `SkeletonRows`, `Notice` and `useI18n`.

- [ ] **Step 6: LotteryForm**

Keep the state, `handleShuffle`, `removePlayer` and `handleReset` exactly. In `handleShuffle`, replace the toast strings with `t("lottery.saved")` / `t("lottery.saveFailed")`.

Add `const { t } = useI18n(); const [resetOpen, setResetOpen] = useState(false); const free = freeSpots(courts, playersInEvent);` and replace the JSX:

```tsx
const playDisabled = selectedPlayers.length === 0 || places > selectedPlayers.length || places <= 0 || isLoading;
const playButton = (
  <Button className="flex-1" disabled={playDisabled} onClick={handleShuffle}>
    {isLoading ? <Loader2 className="animate-spin" /> : <Dices />}
    {isLoading ? t("lottery.generating") : isWinners ? t("lottery.playAgain") : t("lottery.play")}
  </Button>
);
const addButton = winnersCount > 0
  ? <Button variant="accent" className="flex-1" onClick={onAddWinners}>{t("lottery.addToEvent", { count: winnersCount })}</Button>
  : null;
const more = (isResetting || isWinners)
  ? <MoreMenu label={t("common.more")} items={[{ label: t("lottery.reset"), destructive: true, onSelect: () => setResetOpen(true) }]} />
  : null;

return (
  <>
    <section className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-3.5 md:p-[18px]">
      <LotteryAddPlayersInput availablePlayers={availablePlayers} selectedPlayers={selectedPlayers} onAddPlayers={setSelectedPlayers} />
      {selectedPlayers.length > 0 && !isGenerated ? (
        <div className={cn("flex flex-wrap gap-1.5", isLoading && "opacity-50")}>
          {selectedPlayers.map((id) => {
            const p = availablePlayers.find((x) => x.id === id);
            return p ? (
              <button key={id} type="button" onClick={() => removePlayer(id)} aria-label={`${t("common.remove")} ${p.name}`}
                className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-2.5 pr-1.5 text-xs font-extrabold text-brand-700">
                {p.name}<X className="h-3 w-3" />
              </button>
            ) : null;
          })}
        </div>
      ) : null}
      <LotteryPlaceInput selectedPlayers={selectedPlayers} places={places} setPlaces={setPlaces} />
      {free !== null ? (
        <div className="text-xs text-muted-foreground">
          {t("lottery.freeSpots", { courts: courts ?? 0, players: playersInEvent, free })}
        </div>
      ) : null}
      <div className="hidden gap-2 pt-1 md:flex">{more}{playButton}{addButton}</div>
    </section>
    <ActionDock>{playButton}{addButton}{more}</ActionDock>
    <ConfirmDialog open={resetOpen} onOpenChange={setResetOpen}
      title={t("lottery.resetTitle")} description={t("lottery.resetText", { event: event?.name ?? "" })}
      confirmLabel={t("lottery.resetConfirm")} confirmVariant="destructive" onConfirm={() => void handleReset()} />
  </>
);
```

Add the imports for `Dices`, `X`, `ActionDock`, `MoreMenu`, `ConfirmDialog`, `freeSpots`, `useI18n` and `cn`. Extend `LotteryFormProps` with `winnersCount: number; onAddWinners: () => void; courts?: number | null; playersInEvent: number;`.

- [ ] **Step 7: Inputs**

`lottery-add-players-input.component.tsx`:
- the label becomes `t("lottery.participants", { count: selectedPlayers.length })` (wrapped in `SectionLabel`);
- option mapping:

```ts
const playerOptions = availablePlayers.map((player) => ({
  value: player.id, label: player.name, cardType: player.cardType,
  ...(isPenalized(player) ? { disabled: true, hint: t("penalty.chip") } : {}),
}));
```

- `placeholder={t("lottery.addPlayers")}`;
- the `.filter(...)` of already-selected options and the `selected={[]}` adder behaviour stay.

`lottery-place-input.component.tsx`: keep the props and the `invalidPlaces` rule. Render:

```tsx
<div className="flex items-center justify-between border-t border-[#F0ECF7] pt-3">
  <SectionLabel>{t("lottery.places")}</SectionLabel>
  <Stepper size="lg" value={places} min={1} onChange={setPlaces} label={t("lottery.places")} />
</div>
{invalidPlaces ? <p className="text-sm font-bold text-danger-ink">{t("lottery.tooManyPlaces")}</p> : null}
```

`places` starts at 1 in `LotteryForm`, as today, so the stepper never shows 0.

- [ ] **Step 8: LotteryResults**

Keep the props, the `useGetRole` admin checks, and the rule that "Add" is disabled when `isPenalized(player)`. Remove the "Add to event" button: it moved to `LotteryForm`. Render two cards:

```tsx
const num = (i: number, muted = false) => (
  <span className={cn("flex h-6 w-6 flex-none items-center justify-center rounded-lg text-xs font-extrabold",
    muted ? "bg-[#F4F2F8] text-muted-foreground" : "bg-brand-50 text-brand-700")}>{i + 1}</span>
);
return (
  <>
    <section className="rounded-2xl border border-line bg-white px-3.5 py-3 md:px-[18px]">
      <div className="mb-1 flex items-center gap-2 text-brand-700"><Trophy className="h-[18px] w-[18px]" /><SectionLabel className="text-brand-700">{t("lottery.winners", { count: winnersList.length })}</SectionLabel></div>
      {winnersList.length === 0 ? <p className="py-3 text-sm text-muted-foreground">{t("lottery.noWinners")}</p> : null}
      {winnersList.map((player, i) => (
        <ListRow key={player.id} leading={<>{num(i)}<PlayerAvatar name={player.name} cardType={player.cardType} size="sm" /></>}
          title={player.name} meta={t(`cardType.${player.cardType}`)}
          trailing={isAdmin ? <Button size="icon" variant="ghost" aria-label={`${t("common.remove")} ${player.name}`} onClick={() => handleRemoveWinner(player)}><X /></Button> : null} />
      ))}
    </section>
    <section className="rounded-2xl border border-line bg-white px-3.5 py-3 md:px-[18px]">
      <div className="mb-1 flex items-center gap-2 text-muted-foreground"><Clock className="h-[18px] w-[18px]" /><SectionLabel>{t("lottery.waiting", { count: waitingList.length })}</SectionLabel></div>
      {waitingList.length === 0 ? <p className="py-3 text-sm text-muted-foreground">{t("lottery.noWaiting")}</p> : null}
      {waitingList.map((player, i) => (
        <ListRow key={player.id} muted={isPenalized(player)}
          leading={<>{num(i, true)}<PlayerAvatar name={player.name} cardType={player.cardType} size="sm" /></>}
          title={player.name} meta={t(`cardType.${player.cardType}`)}
          trailing={<>
            <PenaltyBadge player={player} />
            {isAdmin ? <>
              <Button size="sm" variant="outline" disabled={isPenalized(player)} onClick={() => handleAddPlayer(player)}><Plus />{t("common.add")}</Button>
              <Button size="icon" variant="ghost" aria-label={`${t("common.remove")} ${player.name}`} onClick={() => handleRemoveFromWaitingList(player)}><X /></Button>
            </> : null}
          </>} />
      ))}
    </section>
  </>
);
```

Here `const isAdmin = role === "admin";`. Imports: `Trophy`, `Clock`, `X`, `Plus`, `ListRow`, `PlayerAvatar`, `SectionLabel`, `PenaltyBadge`, `useT` and `cn`. Remove `Separator`, `PlayerCard` and `Trash2`.

- [ ] **Step 9: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS. Manual: test cases 6.1–6.14. Note for 6.12: on the waiting list, "Add" is **disabled** for Ula; that is the existing rule. If the review finds the doc still says "error toast", update the case text.

- [ ] **Step 10: Commit**

```bash
git add "src/app/(app)/event/[id]/lottery/page.tsx" src/features/lottery src/utils/event-view.ts src/i18n src/_tests_/free-spots.test.ts
git commit -m "feat(lottery): redesigned lottery with dock, reset confirm and free-spots hint

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Players list and player profile

Canvas: "Players", "Player profile", "Desktop · players", "Desktop · player profile".

**Files:**
- Modify: `src/app/(app)/players/page.tsx`, `src/features/players-page/player-search-list.tsx`
- Modify: `src/app/(app)/players/player/[id]/page.tsx`, `src/features/players-page/player-info-cards.tsx`, `player-history.tsx`, `src/components/player-activity-calendar.component.tsx`, `src/utils/playerCards.tsx`
- Modify: `en.ts`, `pl.ts`
- Test: `src/_tests_/players-group.test.ts`

**Interfaces:**
- Produces: `groupByLetter<T extends { name: string }>(items: T[]): { letter: string; items: T[] }[]` in `src/utils/search.ts`. The letter is the first character upper-cased with diacritics kept ("Ł" stays its own group); groups are sorted with `localeCompare(…, "pl")`.

- [ ] **Step 1: Write the failing test**

```ts
import { groupByLetter } from "~/utils/search";
test("groupByLetter", () => {
  const g = groupByLetter([{ name: "Bartek" }, { name: "anna" }, { name: "Adam" }, { name: "Łucja" }, { name: "Leon" }]);
  expect(g.map((x) => x.letter)).toEqual(["A", "B", "L", "Ł"]);
  expect(g[0]!.items.map((x) => x.name)).toEqual(["Adam", "anna"]);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test -- players-group`
Expected: FAIL.

- [ ] **Step 3: groupByLetter**

Append to `src/utils/search.ts`:

```ts
export function groupByLetter<T extends { name: string }>(items: T[]): { letter: string; items: T[] }[] {
  const map = new Map<string, T[]>();
  for (const it of [...items].sort((a, b) => a.name.localeCompare(b.name, "pl"))) {
    const letter = (it.name.trim()[0] ?? "#").toLocaleUpperCase("pl");
    map.set(letter, [...(map.get(letter) ?? []), it]);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, "pl")).map(([letter, items]) => ({ letter, items }));
}
```

- [ ] **Step 4: Dictionary keys**

en:

```ts
"players.title": "Players",
"players.search": "Search by name…",
"players.notFoundTitle": "Player not found",
"players.notFoundText": "The player you're looking for doesn't exist.",
"players.back": "Back to players",
"profile.memberSince": "Member since {date}",
"profile.penaltySince": "Penalty since {date}",
"profile.penaltyNotice": "Can't join events or lotteries until the administrative fee is paid.",
"profile.seePenalties": "See penalty list",
"profile.eventsPlayed": "Events played",
"profile.lottery": "Lottery wins / attempts",
"profile.activity": "Activity",
"profile.allTime": "All time",
"profile.clearRange": "Clear",
"profile.noActivity": "No activity recorded",
"profile.tooltip": "{count} event(s) on {date}",
"profile.less": "No events",
"profile.more": "More events",
```

pl:

```ts
"players.title": "Gracze",
"players.search": "Szukaj po imieniu…",
"players.notFoundTitle": "Nie znaleziono gracza",
"players.notFoundText": "Taki gracz nie istnieje.",
"players.back": "Wróć do graczy",
"profile.memberSince": "W grupie od {date}",
"profile.penaltySince": "Kara od {date}",
"profile.penaltyNotice": "Nie może dołączać do wydarzeń ani losowań do czasu opłacenia opłaty administracyjnej.",
"profile.seePenalties": "Zobacz listę kar",
"profile.eventsPlayed": "Rozegrane wydarzenia",
"profile.lottery": "Wygrane / udziały w losowaniu",
"profile.activity": "Aktywność",
"profile.allTime": "Cały okres",
"profile.clearRange": "Wyczyść",
"profile.noActivity": "Brak aktywności",
"profile.tooltip": "Wydarzenia: {count}, {date}",
"profile.less": "Brak wydarzeń",
"profile.more": "Więcej wydarzeń",
```

- [ ] **Step 5: Players page and list**

`src/app/(app)/players/page.tsx`:

```tsx
"use client";
import PlayerSearchList from "~/features/players-page/player-search-list";
import { ScreenHeader } from "~/components/shell/screen-header";
import { PageBody } from "~/components/ds/page-body";
import { useT } from "~/i18n/i18n-provider";

export default function PlayersPage() {
  const t = useT();
  return (
    <>
      <ScreenHeader title={t("players.title")} />
      <PageBody><PlayerSearchList /></PageBody>
    </>
  );
}
```

`player-search-list.tsx`:
- keep loading through `playerOperations.getAllPlayers()`;
- the filter becomes `matchesQuery(player.name, searchTerm)`;
- render a search field like the "Players" artboard (`type="search"`, `aria-label`, placeholder `t("players.search")`);
- then `groupByLetter(filtered)`. Each group shows `SectionLabel` with the letter and a `ListCard` of `ListRow href={`/players/player/${p.id}`}` with `leading={<PlayerAvatar …/>}`, `trailing={<><PenaltyBadge player={p} /><CardTypeChip cardType={p.cardType} short={!isDesktop} /></>}`;
- on desktop, groups flow into `grid md:grid-cols-2 gap-x-8`;
- an empty result with a query shows `<EmptyState title={t("common.noResults")} />`; while loading, show `<SkeletonRows count={8} />`;
- the H1 count: pass `title={<>{t("players.title")} <span className="text-base font-bold text-muted-foreground">{players.length}</span></>}` from the page through a prop, or simply render the count above the list. Choose the prop: lift `players` into the page by giving `PlayerSearchList` an `onLoaded?(count: number)` callback.

- [ ] **Step 6: Profile page**

`players/player/[id]/page.tsx`:
- keep `useGetPlayerData`;
- loading → `<PageBody><SkeletonRows count={4} /></PageBody>`;
- not found → `ScreenHeader` back to `/players` plus `EmptyState` with `t("players.notFoundTitle")`, `t("players.notFoundText")` and a `Button asChild` link `t("players.back")`;
- found: render the following.

```tsx
<>
  <ScreenHeader
    title={player.name}
    back={{ href: "/players", label: t("nav.players") }}
    crumbs={[{ label: t("nav.players"), href: "/players" }, { label: player.name }]}
    mobileHero={<ProfileHero player={player} />}
  />
  <PageBody>
    <div className="hidden md:block"><ProfileHero player={player} desktop /></div>
    {isPenalized(player) ? (
      <Notice>{t("profile.penaltyNotice")} <GuardedLink href="/penalties" className="font-extrabold underline">{t("profile.seePenalties")}</GuardedLink></Notice>
    ) : null}
    <PlayerHistory player={player} lotteryResults={lotteryResults} playerEventDates={playerEventDates} />
  </PageBody>
</>
```

`player-info-cards.tsx` now exports `ProfileHero({ player, desktop? })`:
- mobile: a violet section with a large `PlayerAvatar` on `bg-white/15`, the name as H1, `CardTypeChip`, a red chip `t("profile.penaltySince", { date: fmt(player.penalty_since, "dd.MM") })` when penalized, and `t("profile.memberSince", { date: fmt(player.created_at, "LLL yyyy") })` when `created_at` exists;
- desktop: the same row on the light background, avatar `size="lg"` with no violet;
- remove the old info-card grid and the `getPlayerCards` call from this file.

`player-history.tsx`:
- keep the range state, `filterDatesByRange` and the counts;
- the stat tiles become `StatTile` × 2 (`profile.eventsPlayed` = `filteredDates.length`, `profile.lottery` = `` `${filteredWins.length}` `` with `sub={`/ ${filteredPlayed.length}`}`) in `grid grid-cols-2 md:grid-cols-3`;
- then a card "Activity" with the date-range `Popover` + `Calendar` (as today, restyled with `Button variant="outline" size="sm"`; label `t("profile.allTime")` when there is no range, otherwise the formatted range; "Clear" button `t("profile.clearRange")`) and `PlayerActivityCalendarComponent`;
- `src/utils/playerCards.tsx` is no longer used; delete it if `grep` shows no imports.

`player-activity-calendar.component.tsx`:
- theme light: `["#ECE7F6", "#C9B3EA", "#8A5CC4", "#5B2D8C", "#3B1F6E"]`;
- tooltip background `#3B1F6E`;
- `labels.legend` from `t("profile.less")` / `t("profile.more")`;
- months and weekdays from `date-fns` with the current locale (`Array.from({ length: 12 }, (_, m) => fmt(new Date(2026, m, 1), "LLL"))` and `Array.from({ length: 7 }, (_, d) => fmt(new Date(2026, 1, d + 1), "EEEEEE"))`; 1 Feb 2026 is a Sunday);
- tooltip text `t("profile.tooltip", { count, date: fmt(date, "d MMMM yyyy") })`;
- empty text `t("profile.noActivity")`.

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS. Manual: test cases 7.1–7.7.

- [ ] **Step 8: Commit**

```bash
git add -A "src/app/(app)/players" src/features/players-page src/components/player-activity-calendar.component.tsx src/utils/playerCards.tsx src/utils/search.ts src/i18n src/_tests_/players-group.test.ts
git commit -m "feat(players): grouped player list with search and redesigned profile

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: Public penalty list (`/penalties`)

Canvas: "Penalty list · guest · EN", "Lista kar · admin · PL", "Desktop · penalty list". Spec §8 (copy) and §9.3.

**Files:**
- Create: `src/app/(app)/penalties/page.tsx`
- Modify: `en.ts`, `pl.ts`
- Test: `src/_tests_/penalties-page.test.tsx`

**Interfaces:**
- Consumes: `playerOperations.getAllPlayers`, `isPenalized`, `daysSince`, DS components.

- [ ] **Step 1: Write the failing test**

```tsx
import { screen } from "@testing-library/react";
import { renderWithI18n } from "./test-utils";
import PenaltiesPage from "~/app/(app)/penalties/page";
import { resetMockDb } from "~/lib/db.mock";

jest.mock("next/navigation", () => ({ usePathname: () => "/penalties", useRouter: () => ({ push: jest.fn() }) }));

test("lists penalized players with explanation and no Manage for guests", async () => {
  resetMockDb();
  renderWithI18n(<PenaltiesPage />);
  expect(await screen.findByText("Ewa Kamińska")).toBeInTheDocument();
  expect(screen.getByText("Ula Wieczorek")).toBeInTheDocument();
  expect(screen.getAllByText(/administrative fee/).length).toBeGreaterThan(0);
  expect(screen.queryByRole("link", { name: /Manage/ })).toBeNull();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test -- penalties-page`
Expected: FAIL (module not found).

- [ ] **Step 3: Dictionary keys (copy from spec §8)**

en:

```ts
"penalties.title": "Penalty list",
"penalties.manage": "Manage",
"penalties.whatTitle": "What does it mean?",
"penalties.what1": "Cancelling after 12:00 on the day of the draw counts as a no-show and comes with a mandatory administrative fee.",
"penalties.what2": "Until the fee is paid, you can't sign up for group events or take part in lotteries. Once you've paid the organizer, you'll be removed from the list.",
"penalties.count": { one: "{count} player", other: "{count} players" },
"penalties.since": "Since {date}",
"penalties.emptyTitle": "No one is on the penalty list",
"penalties.emptyText": "Everyone can play!",
```

pl:

```ts
"penalties.title": "Lista kar",
"penalties.manage": "Zarządzaj",
"penalties.whatTitle": "Co to oznacza?",
"penalties.what1": "Rezygnacja po godzinie 12:00 w dniu losowania jest traktowana jak nieobecność i wiąże się z obowiązkową opłatą administracyjną.",
"penalties.what2": "Dopóki opłata nie zostanie uregulowana, nie możesz zapisywać się na wydarzenia grupy ani brać udziału w losowaniach. Po uregulowaniu opłaty u organizatora zostaniesz usunięty z listy.",
"penalties.count": { one: "{count} gracz", few: "{count} gracze", many: "{count} graczy", other: "{count} gracza" },
"penalties.since": "Od {date}",
"penalties.emptyTitle": "Nikt nie jest na liście kar",
"penalties.emptyText": "Wszyscy mogą grać!",
```


- [ ] **Step 4: Page**

```tsx
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Shield } from "lucide-react";
import { playerOperations, type Player } from "~/lib/db";
import { isPenalized } from "~/utils/penalty-util";
import { daysSince } from "~/i18n/translate";
import { useI18n } from "~/i18n/i18n-provider";
import { useGetRole } from "~/hooks/use-get-role";
import { Role } from "~/lib/roles";
import { ScreenHeader } from "~/components/shell/screen-header";
import { GuardedLink } from "~/components/shell/navigation-guard";
import { PageBody } from "~/components/ds/page-body";
import { ListCard, ListRow } from "~/components/ds/list";
import { PlayerAvatar } from "~/components/ds/player-avatar";
import { Chip } from "~/components/ds/chip";
import { SectionLabel } from "~/components/ds/section-label";
import { EmptyState } from "~/components/ds/empty-state";
import { SkeletonRows } from "~/components/ds/skeleton-rows";
import { Button } from "~/components/ui/button";

export default function PenaltiesPage() {
  const { t, fmt } = useI18n();
  const { role } = useGetRole();
  const [players, setPlayers] = useState<Player[] | null>(null);

  useEffect(() => {
    playerOperations.getAllPlayers()
      .then((ps) => setPlayers(ps.filter(isPenalized).sort((a, b) => (b.penalty_since ?? "").localeCompare(a.penalty_since ?? ""))))
      .catch(() => setPlayers([]));
  }, []);

  const manage = role === Role.Admin
    ? <Button asChild size="sm" className="md:h-11"><GuardedLink href="/admin/penalties"><Shield />{t("penalties.manage")}</GuardedLink></Button>
    : undefined;

  const explanation = (
    <section className="flex gap-3 rounded-2xl border border-warn-line bg-warn-bg p-3.5 text-warn-ink md:flex-col md:p-5">
      <AlertTriangle className="mt-0.5 h-[22px] w-[22px] flex-none text-[#C2410C]" aria-hidden="true" />
      <div className="flex flex-col gap-1.5 text-sm leading-relaxed">
        <h2 className="text-[15px] font-extrabold text-[#9A3412] md:text-[17px]">{t("penalties.whatTitle")}</h2>
        <p>{t("penalties.what1")}</p>
        <p>{t("penalties.what2")}</p>
      </div>
    </section>
  );

  return (
    <>
      <ScreenHeader title={t("penalties.title")} actions={manage} mobileTitleAside={manage} />
      <PageBody>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-5">
          <div className="md:sticky md:top-24 md:flex-[1_1_360px]">{explanation}</div>
          <div className="flex flex-col gap-2 md:flex-[999_1_520px]">
            {players === null ? <SkeletonRows count={3} /> : players.length === 0 ? (
              <EmptyState icon={<CheckCircle2 className="h-8 w-8 text-[#16A34A]" />} title={t("penalties.emptyTitle")} text={t("penalties.emptyText")} />
            ) : (
              <>
                <SectionLabel>{t("penalties.count", { count: players.length })}</SectionLabel>
                <ListCard>
                  {players.map((p) => (
                    <ListRow key={p.id} href={`/players/player/${p.id}`}
                      leading={<PlayerAvatar name={p.name} cardType={p.cardType} />}
                      title={p.name}
                      meta={t("penalties.since", { date: fmt(p.penalty_since!, "dd.MM.yyyy") })}
                      trailing={<Chip tone="danger" className="text-xs">{t("penalties.days", { count: daysSince(p.penalty_since!) })}</Chip>} />
                  ))}
                </ListCard>
              </>
            )}
          </div>
        </div>
      </PageBody>
    </>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS. Manual: test cases 8.1–8.3 and 8.10. Open `/penalties` while logged out: it must be visible without login.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(app)/penalties" src/i18n src/_tests_/penalties-page.test.tsx
git commit -m "feat(penalties): public penalty list with explanation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 16: Login

Canvas: "Login".

**Files:**
- Modify: `src/app/login/page.tsx`, `src/features/login-page/login-form.component.tsx`, `login-input.component.tsx`, `password-input.component.tsx`
- Modify: `en.ts`, `pl.ts`

**Interfaces:** consumes `useGetRole().login` (Task 4), `LangSwitch` (Task 8).

- [ ] **Step 1: Dictionary keys**

en:

```ts
"login.title": "Log in",
"login.login": "Login",
"login.loginPlaceholder": "Enter your login",
"login.password": "Password",
"login.passwordPlaceholder": "Enter your password",
"login.error": "Wrong password",
"login.submit": "Log in",
"login.guest": "Continue as guest",
"login.show": "Show password",
"login.hide": "Hide password",
```

pl:

```ts
"login.title": "Logowanie",
"login.login": "Login",
"login.loginPlaceholder": "Wpisz login",
"login.password": "Hasło",
"login.passwordPlaceholder": "Wpisz hasło",
"login.error": "Nieprawidłowe hasło",
"login.submit": "Zaloguj",
"login.guest": "Kontynuuj jako gość",
"login.show": "Pokaż hasło",
"login.hide": "Ukryj hasło",
```

Read `password-input.component.tsx` first and map its existing visible strings (label, placeholder, error text, any show/hide aria) to these keys. If it has a string not listed here, add a key for it in both files.

- [ ] **Step 2: Page and form**

`src/app/login/page.tsx`:

```tsx
"use client";
import { LoginForm } from "~/features/login-page/login-form.component";
import { LangSwitch } from "~/components/shell/lang-switch";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-brand-900 p-4">
      <div className="flex justify-end"><LangSwitch /></div>
      <div className="flex flex-1 items-center justify-center"><LoginForm /></div>
    </div>
  );
}
```

`login-form.component.tsx`: keep `handleSubmit`, `redirect` and `isDisabled` logic. Return:

```tsx
<div className="flex w-full max-w-[400px] flex-col gap-6">
  <div className="flex flex-col items-center gap-3 text-white">
    <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-coral text-3xl font-extrabold text-ink">M</div>
    <div className="text-[28px] font-extrabold tracking-tight">Mario Group</div>
  </div>
  <form className="flex flex-col gap-3 rounded-[22px] bg-white p-5" onSubmit={handleSubmit}>
    <h1 className="mb-1 text-xl font-extrabold">{t("login.title")}</h1>
    <LoginInput formData={formData} handleChange={handleChange} />
    <PasswordInput handleChange={handleChange} error={error} formData={formData} />
    <Button type="submit" size="lg" disabled={isDisabled} className="mt-1"><LogIn />{t("login.submit")}</Button>
    <Link href="/" className="py-1.5 text-center text-[13px] font-bold text-brand-700">{t("login.guest")}</Link>
  </form>
</div>
```

`LoginInput` / `PasswordInput`:
- labels `text-[13px] font-bold text-[#4A4361]`;
- inputs `h-12 rounded-xl border-line text-[15px]`;
- `autoComplete="username"` / `"current-password"`;
- every text from `t()`.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS. Manual: test cases 1.11–1.14, plus 1.2/1.3 for both passwords.

- [ ] **Step 4: Commit**

```bash
git add src/app/login src/features/login-page src/i18n
git commit -m "feat(login): redesigned login with guest link and language switch

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 17: Admin hub and `/admin/events`

Canvas: "Admin · hub", "Admin · events". Spec §6: `/admin` becomes the hub, and the events list moves to `/admin/events`.

**Files:**
- Modify: `src/app/admin/page.tsx` (becomes the hub)
- Create: `src/app/admin/events/page.tsx`
- Modify: `src/components/event-form.tsx` (two redirects: `router.push("/admin")` → `router.push("/admin/events")`)
- Modify: `en.ts`, `pl.ts`

**Interfaces:**
- Consumes: `EventsList variant="admin"` (Task 10), `ScreenHeader adminSection` (Task 8), `useGetRole().logout` (Task 4).

- [ ] **Step 1: Dictionary keys**

en:

```ts
"hub.title": "Admin",
"hub.newEvent": "New event",
"hub.eventsMeta": "Latest: {date}",
"hub.noEvents": "No events yet",
"hub.playersMeta": { one: "{count} player", other: "{count} players" },
"hub.penaltiesMeta": { one: "{count} on the list", other: "{count} on the list" },
"hub.noPenalties": "Nobody on the list",
"hub.defaults": "Default pricing",
"hub.defaultsMeta": "{price} PLN / h · {hours} h · −{discount} PLN per card use",
"adminEvents.title": "Events",
```

pl:

```ts
"hub.title": "Admin",
"hub.newEvent": "Nowe wydarzenie",
"hub.eventsMeta": "Ostatnie: {date}",
"hub.noEvents": "Brak wydarzeń",
"hub.playersMeta": { one: "{count} gracz", few: "{count} gracze", many: "{count} graczy", other: "{count} gracza" },
"hub.penaltiesMeta": { one: "{count} na liście", few: "{count} na liście", many: "{count} na liście", other: "{count} na liście" },
"hub.noPenalties": "Nikogo na liście",
"hub.defaults": "Domyślne ceny",
"hub.defaultsMeta": "{price} zł / h · {hours} h · −{discount} zł za użycie karty",
"adminEvents.title": "Wydarzenia",
```

- [ ] **Step 2: `/admin/events`**

```tsx
"use client";
import { Plus } from "lucide-react";
import { withAdminLayout } from "~/components/with-admin-layout";
import { EventsList } from "~/components/events-list";
import { ScreenHeader } from "~/components/shell/screen-header";
import { GuardedLink } from "~/components/shell/navigation-guard";
import { PageBody } from "~/components/ds/page-body";
import { Button } from "~/components/ui/button";
import { useT } from "~/i18n/i18n-provider";

function AdminEventsPage() {
  const t = useT();
  const add = <Button asChild size="sm" className="md:h-11 md:px-4"><GuardedLink href="/admin/event"><Plus />{t("hub.newEvent")}</GuardedLink></Button>;
  return (
    <>
      <ScreenHeader title={t("adminEvents.title")} adminSection="events" actions={add} mobileTitleAside={add}
        crumbs={[{ label: t("hub.title"), href: "/admin" }, { label: t("adminEvents.title") }]} />
      <PageBody><EventsList variant="admin" /></PageBody>
    </>
  );
}
export default withAdminLayout(AdminEventsPage);
```

- [ ] **Step 3: Hub (`src/app/admin/page.tsx`, replace)**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CalendarDays, ChevronRight, List, LogOut, Plus, Shield, SlidersHorizontal, Users } from "lucide-react";
import { withAdminLayout } from "~/components/with-admin-layout";
import { ScreenHeader } from "~/components/shell/screen-header";
import { GuardedLink } from "~/components/shell/navigation-guard";
import { PageBody } from "~/components/ds/page-body";
import { Button } from "~/components/ui/button";
import { DefaultAdminValuesOperations, eventOperations, playerOperations, reservationOperations, type DefaultAdminValues } from "~/lib/db";
import { isPenalized } from "~/utils/penalty-util";
import { flattenEvents } from "~/utils/event-view";
import { useI18n } from "~/i18n/i18n-provider";
import { useGetRole } from "~/hooks/use-get-role";
import { cn } from "~/lib/utils";

type Stats = { latest?: string; players: number; reservations: string[]; penalties: number; defaults?: DefaultAdminValues };

function Tile({ href, icon, title, meta, danger, wide }: { href: string; icon: React.ReactNode; title: string; meta: string; danger?: boolean; wide?: boolean }) {
  return (
    <GuardedLink href={href} className={cn("flex gap-3 rounded-2xl border border-line bg-white p-3.5 hover:bg-brand-50/50", wide ? "items-center md:col-span-3" : "flex-col")}>
      <span className={cn("flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl", danger ? "bg-danger-soft text-danger-ink" : "bg-brand-50 text-brand-700")}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-extrabold">{title}</span>
        <span className={cn("block truncate text-xs", danger ? "font-bold text-danger-ink" : "text-muted-foreground")}>{meta}</span>
      </span>
      {wide ? <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" /> : null}
    </GuardedLink>
  );
}

function AdminHub() {
  const { t, fmt } = useI18n();
  const router = useRouter();
  const { logout } = useGetRole();
  const [s, setS] = useState<Stats>({ players: 0, reservations: [], penalties: 0 });

  useEffect(() => {
    void Promise.all([
      eventOperations.getAllEvents(), playerOperations.getAllPlayers(),
      reservationOperations.getAllReservationLists(), DefaultAdminValuesOperations.getDefaultAdminValues(),
    ]).then(([events, players, reservations, defaults]) => setS({
      latest: flattenEvents(events)[0]?.date,
      players: players.length,
      reservations: reservations.map((r) => r.name),
      penalties: players.filter(isPenalized).length,
      defaults,
    })).catch(() => undefined);
  }, []);

  const add = <Button asChild size="sm" className="md:h-11 md:px-4"><GuardedLink href="/admin/event"><Plus />{t("hub.newEvent")}</GuardedLink></Button>;

  return (
    <>
      <ScreenHeader title={t("hub.title")} actions={add} mobileTitleAside={add} />
      <PageBody>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3">
          <Tile href="/admin/events" icon={<CalendarDays className="h-5 w-5" />} title={t("admin.events")}
            meta={s.latest ? t("hub.eventsMeta", { date: fmt(s.latest, "EEE d MMM") }) : t("hub.noEvents")} />
          <Tile href="/admin/players" icon={<Users className="h-5 w-5" />} title={t("admin.players")} meta={t("hub.playersMeta", { count: s.players })} />
          <Tile href="/admin/reservations" icon={<List className="h-5 w-5" />} title={t("admin.reservations")} meta={s.reservations.join(" · ") || "—"} />
          <Tile href="/admin/penalties" icon={<Ban className="h-5 w-5" />} title={t("admin.penalties")} danger={s.penalties > 0}
            meta={s.penalties ? t("hub.penaltiesMeta", { count: s.penalties }) : t("hub.noPenalties")} />
          <Tile wide href="/admin/defaults" icon={<SlidersHorizontal className="h-5 w-5" />} title={t("hub.defaults")}
            meta={s.defaults ? t("hub.defaultsMeta", { price: s.defaults.price_per_hour, hours: s.defaults.hours, discount: s.defaults.discount_per_usage }) : "—"} />
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-line pt-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-brand-900 text-white"><Shield className="h-4 w-4" /></span>
            <span><span className="block text-sm font-extrabold">{t("account.loggedInAs", { role: t("role.admin") })}</span>
              <span className="text-xs text-muted-foreground">{t("account.onThisDevice")}</span></span>
          </div>
          <Button variant="outline" size="sm" onClick={() => { logout(); router.push("/"); }}><LogOut />{t("account.logout")}</Button>
        </div>
      </PageBody>
    </>
  );
}

export default withAdminLayout(AdminHub);
```

In the 2-column mobile grid, the Penalties tile sits next to Reservations. The wide Defaults tile spans the full width (`col-span-2` on mobile): add `col-span-2` to the `wide` class list next to `md:col-span-3`.

- [ ] **Step 4: Redirects**

In `src/components/event-form.tsx`, change both `router.push("/admin")` calls (after save and after delete) to `router.push("/admin/events")`. Run `grep -rn '"/admin"' src` and confirm only `with-auth.tsx` (`/login?redirect=/admin`), the hub links and the tab-bar link remain.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS. Manual: test cases 1.10, 1.11 (hub logout) and 9.1.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/page.tsx src/app/admin/events src/components/event-form.tsx src/i18n
git commit -m "feat(admin): admin hub with logout, events list moved to /admin/events

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 18: Create / edit event form

Canvas: "Admin · edit event", "Desktop · admin edit event". Business rules (spec §2): changes are local until Save; penalized players are skipped; the waiting-list source exists only when that list is not empty. New: segmented source, "Unsaved changes" marker, leave guard only when dirty, extended penalty notice.

**Files:**
- Create: `src/utils/event-form-state.ts`
- Modify: `src/components/event-form.tsx` (render and small state additions; keep every handler's logic)
- Modify: `src/components/event-date-picker.component.tsx` (restyle only)
- Modify: `src/app/admin/event/page.tsx`, `src/app/admin/event/[id]/page.tsx`
- Modify: `en.ts`, `pl.ts`
- Test: `src/_tests_/event-form-state.test.ts`

**Interfaces:**
- Produces:

```ts
type EventFormSnapshot = { name: string; date: string /* yyyy-MM-dd */; players: string[] };
isEventFormDirty(baseline: EventFormSnapshot, current: EventFormSnapshot): boolean   // order-insensitive on players
type PlayerSource = "reservation" | "waiting" | "individual";
EventForm props unchanged: { initialEvent?: Event; onSave(...); mode: "create" | "edit" }
```

- [ ] **Step 1: Write the failing test**

```ts
import { isEventFormDirty } from "~/utils/event-form-state";

const base = { name: "Tuesday", date: "2026-10-06", players: ["p1", "p2"] };

test("untouched form is clean", () => {
  expect(isEventFormDirty(base, { ...base })).toBe(false);
});
test("player order does not matter", () => {
  expect(isEventFormDirty(base, { ...base, players: ["p2", "p1"] })).toBe(false);
});
test("reverted change is clean again", () => {
  const changed = { ...base, players: ["p1"] };
  expect(isEventFormDirty(base, changed)).toBe(true);
  expect(isEventFormDirty(base, { ...changed, players: ["p1", "p2"] })).toBe(false);
});
test("name or date change is dirty", () => {
  expect(isEventFormDirty(base, { ...base, name: "Tue" })).toBe(true);
  expect(isEventFormDirty(base, { ...base, date: "2026-10-07" })).toBe(true);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test -- event-form-state`
Expected: FAIL.

- [ ] **Step 3: event-form-state.ts**

```ts
export type EventFormSnapshot = { name: string; date: string; players: string[] };
export type PlayerSource = "reservation" | "waiting" | "individual";

export function isEventFormDirty(baseline: EventFormSnapshot, current: EventFormSnapshot): boolean {
  if (baseline.name !== current.name || baseline.date !== current.date) return true;
  if (baseline.players.length !== current.players.length) return true;
  const a = new Set(baseline.players);
  return current.players.some((id) => !a.has(id));
}
```

- [ ] **Step 4: Dictionary keys**

en:

```ts
"eventForm.createTitle": "New event",
"eventForm.editTitle": "Edit event",
"eventForm.details": "Details",
"eventForm.name": "Event name",
"eventForm.namePlaceholder": "Enter event name",
"eventForm.date": "Date",
"eventForm.addFrom": "Add players from",
"eventForm.srcReservation": "Reservation",
"eventForm.srcWaiting": "Waiting list · {count}",
"eventForm.srcIndividual": "Individual",
"eventForm.selectReservations": "Select reservations",
"eventForm.selectWaiting": "Select players from waiting list",
"eventForm.selectPlayers": "Select players",
"eventForm.skipped": "Not added — unpaid penalty: {names}.",
"eventForm.skippedRest": "Everyone else from “{from}” was added.",
"eventForm.addedSkipped": "Added {added} of {total}, {skipped} skipped (penalty)",
"eventForm.current": "Current players · {count}",
"eventForm.noPlayers": "No players yet. Add them from a reservation, the waiting list or one by one.",
"eventForm.removeAll": "Remove all players",
"eventForm.removeAllText": "This action will remove all players from the event. You can add them back individually or from reservations.",
"eventForm.removeAllConfirm": "Remove all",
"eventForm.delete": "Delete event",
"eventForm.deleteText": "This action will delete this event.",
"eventForm.create": "Create event",
"eventForm.save": "Save event",
"eventForm.created": "Event created successfully",
"eventForm.updated": "Event updated successfully",
"eventForm.deleted": "Event deleted successfully",
"eventForm.notFound": "Event not found",
```

pl:

```ts
"eventForm.createTitle": "Nowe wydarzenie",
"eventForm.editTitle": "Edytuj wydarzenie",
"eventForm.details": "Szczegóły",
"eventForm.name": "Nazwa wydarzenia",
"eventForm.namePlaceholder": "Wpisz nazwę",
"eventForm.date": "Data",
"eventForm.addFrom": "Dodaj graczy z",
"eventForm.srcReservation": "Rezerwacja",
"eventForm.srcWaiting": "Rezerwowi · {count}",
"eventForm.srcIndividual": "Pojedynczo",
"eventForm.selectReservations": "Wybierz rezerwacje",
"eventForm.selectWaiting": "Wybierz z listy rezerwowej",
"eventForm.selectPlayers": "Wybierz graczy",
"eventForm.skipped": "Nie dodano — nieopłacona kara: {names}.",
"eventForm.skippedRest": "Pozostali z „{from}” zostali dodani.",
"eventForm.addedSkipped": "Dodano {added} z {total}, pominięto {skipped} (kara)",
"eventForm.current": "Gracze · {count}",
"eventForm.noPlayers": "Brak graczy. Dodaj ich z rezerwacji, listy rezerwowej lub pojedynczo.",
"eventForm.removeAll": "Usuń wszystkich graczy",
"eventForm.removeAllText": "Usunie wszystkich graczy z wydarzenia. Możesz dodać ich ponownie pojedynczo lub z rezerwacji.",
"eventForm.removeAllConfirm": "Usuń wszystkich",
"eventForm.delete": "Usuń wydarzenie",
"eventForm.deleteText": "To usunie wydarzenie.",
"eventForm.create": "Utwórz wydarzenie",
"eventForm.save": "Zapisz wydarzenie",
"eventForm.created": "Utworzono wydarzenie",
"eventForm.updated": "Zapisano wydarzenie",
"eventForm.deleted": "Usunięto wydarzenie",
"eventForm.notFound": "Nie znaleziono wydarzenia",
```

- [ ] **Step 5: EventForm state additions**

In `event-form.tsx`, keep all existing state and effects. Add:

```tsx
const { t, fmt } = useI18n();
const [source, setSource] = useState<PlayerSource>("reservation");
const [skippedFrom, setSkippedFrom] = useState<string[]>([]);
const [baseline, setBaseline] = useState<EventFormSnapshot>(() => ({
  name: initialEvent?.name || formatDate(new Date()),
  date: format(initialEvent?.date ? new Date(initialEvent.date) : new Date(), "yyyy-MM-dd"),
  players: initialEvent?.players?.map((p) => p.id) || [],
}));
const current: EventFormSnapshot = { name: eventName, date: date ? format(date, "yyyy-MM-dd") : "", players: selectedPlayers };
const dirty = isEventFormDirty(baseline, current);
useLeaveGuard(dirty);
const { setDirty } = useNavigationGuard();
const [removeAllOpen, setRemoveAllOpen] = useState(false);
const [deleteOpen, setDeleteOpen] = useState(false);
```

`formatDate` is declared above `baseline` in the file, so move these lines below it. Then change:
- `handleSubmit`: after `await onSave(...)`, call `setBaseline(current); setDirty(false);`. Replace the toast strings with `t(mode === "create" ? "eventForm.created" : "eventForm.updated")`.
- `handleDeleteEvent`: call `setDirty(false)` before `router.push`, and use the toast `t("eventForm.deleted")`.
- In the reservation `onChange`, also call `setSkippedFrom(reservations.filter((r) => selectedReservations.includes(r.id)).map((r) => r.name));`. The warning toast becomes `t("eventForm.addedSkipped", { added: added.length, total: added.length + skipped.length, skipped: skipped.length })`.
- `penaltyOption` returns `{ disabled: true, hint: t("penalty.chip") }`.
- `playerOptions` and `waitingListOptions` add `cardType: player.cardType`.
- `if (isLoading) return <SkeletonRows count={6} />;`.

- [ ] **Step 6: EventForm render**

Replace the returned `<form>` with the block below. The `ScreenHeader` lives in the page component (Step 7); the form receives the header actions through the dock (mobile) and its own desktop action row.

```tsx
const skippedNames = skippedPlayers.map((id) => availablePlayers.find((p) => p.id === id)?.name ?? id).join(", ");
const saveLabel = mode === "create" ? t("eventForm.create") : t("eventForm.save");
const unsaved = dirty ? (
  <span className="flex items-center gap-1.5 text-xs font-bold text-[#9A3412] md:text-[13px]">
    <span className="h-2 w-2 rounded-full bg-coral" />{t("common.unsaved")}
  </span>
) : null;
const moreItems = [
  { label: t("eventForm.removeAll"), onSelect: () => setRemoveAllOpen(true) },
  ...(mode === "edit" ? [{ label: t("eventForm.delete"), destructive: true, onSelect: () => setDeleteOpen(true) }] : []),
];
const saveButton = (
  <Button type="submit" form="event-form" disabled={loading} className="flex-1 md:flex-none">
    {loading ? <Loader2 className="animate-spin" /> : null}{saveLabel}
  </Button>
);

const sourcePicker =
  source === "reservation" ? (
    <MultiSelect options={reservationOptions} selected={[]} placeholder={t("eventForm.selectReservations")} title={t("eventForm.srcReservation")}
      onChange={/* the existing reservation onChange body, unchanged plus setSkippedFrom */ onReservationsPicked} />
  ) : source === "waiting" ? (
    <MultiSelect options={waitingListOptions} selected={[]} placeholder={t("eventForm.selectWaiting")}
      onChange={(newPlayers) => setSelectedPlayers((prev) => [...new Set([...prev, ...newPlayers])])} />
  ) : (
    <MultiSelect options={playerOptions.filter((o) => !selectedPlayers.includes(o.value))} selected={[]} placeholder={t("eventForm.selectPlayers")}
      onChange={(newPlayers) => setSelectedPlayers((prev) => [...prev, ...newPlayers])} />
  );

return (
  <>
    <form id="event-form" onSubmit={handleSubmit} className="flex flex-col gap-4 pb-24 md:flex-row md:items-start md:gap-5 md:pb-0">
      <div className="flex flex-col gap-3 md:flex-[1_1_360px]">
        <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-3.5 md:p-[18px]">
          <label className="flex flex-col gap-1.5 text-[13px] font-bold text-[#4A4361]">{t("eventForm.name")}
            <Input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder={t("eventForm.namePlaceholder")} required className="h-12 rounded-xl text-[15px] font-bold" />
          </label>
          <div className="flex flex-col gap-1.5 text-[13px] font-bold text-[#4A4361]">{t("eventForm.date")}
            <EventDatePicker date={date!} setDate={handleSetDate} />
          </div>
        </section>
        <section className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-3.5 md:p-[18px]">
          <SectionLabel>{t("eventForm.addFrom")}</SectionLabel>
          <Segmented<PlayerSource> ariaLabel={t("eventForm.addFrom")} value={source} onChange={setSource}
            options={[
              { value: "reservation", label: t("eventForm.srcReservation") },
              ...(waitingListPlayers.length > 0 ? [{ value: "waiting" as const, label: t("eventForm.srcWaiting", { count: waitingListPlayers.length }) }] : []),
              { value: "individual", label: t("eventForm.srcIndividual") },
            ]} />
          {sourcePicker}
        </section>
        {skippedPlayers.length > 0 ? (
          <Notice>
            {t("eventForm.skipped", { names: skippedNames })}{" "}
            {skippedFrom.length ? t("eventForm.skippedRest", { from: skippedFrom.join(", ") }) : null}
          </Notice>
        ) : null}
        <div className="hidden items-center gap-2.5 md:flex">
          {unsaved}<span className="flex-1" />
          <MoreMenu label={t("common.more")} items={moreItems} />
          {saveButton}
        </div>
      </div>
      <section className="rounded-2xl border border-line bg-white px-3.5 py-2.5 md:flex-[999_1_520px] md:px-5">
        <SectionLabel className="py-1">{t("eventForm.current", { count: selectedPlayers.length })}</SectionLabel>
        {selectedPlayers.length === 0 ? <p className="py-4 text-sm text-muted-foreground">{t("eventForm.noPlayers")}</p> : null}
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-7">
          {selectedPlayers.map((playerId) => {
            const player = availablePlayers.find((p) => p.id === playerId);
            return player ? (
              <ListRow key={player.id} className="border-b border-[#F0ECF7]"
                leading={<PlayerAvatar name={player.name} cardType={player.cardType} />}
                title={player.name}
                trailing={<><PenaltyBadge player={player} /><CardTypeChip cardType={player.cardType} short />
                  <Button type="button" size="icon" variant="ghost" aria-label={`${t("common.remove")} ${player.name}`} onClick={() => handleRemovePlayer(player.id)}><X /></Button></>} />
            ) : null;
          })}
        </div>
      </section>
    </form>

    <ActionDock>
      <div className="flex flex-1 flex-col gap-1">{unsaved}{saveButton}</div>
      <MoreMenu label={t("common.more")} items={moreItems} />
    </ActionDock>

    <ConfirmDialog open={removeAllOpen} onOpenChange={setRemoveAllOpen} description={t("eventForm.removeAllText")}
      confirmLabel={t("eventForm.removeAllConfirm")} onConfirm={handleRemoveAllPlayers} />
    <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} description={t("eventForm.deleteText")}
      confirmLabel={t("common.delete")} confirmVariant="destructive" onConfirm={() => void handleDeleteEvent()} />
  </>
);
```

Before the `return`, extract the existing inline reservation `onChange` arrow into `const onReservationsPicked = (selectedReservations: string[]) => { …existing body…; setSkippedFrom(…); };`. The body is otherwise unchanged.

Imports to add: `X`, `useI18n`, `useLeaveGuard`, `useNavigationGuard`, `Segmented`, `SectionLabel`, `Notice`, `ListRow`, `PlayerAvatar`, `CardTypeChip`, `PenaltyBadge`, `MoreMenu`, `ActionDock`, `SkeletonRows`, `isEventFormDirty`, `EventFormSnapshot`, `PlayerSource`. Remove `Label`, `Trash2` and `PlayerCard`.

The adder behaviour stays: picking a reservation adds its players at once, with no extra "Add" button. This is a deliberate deviation from the desktop artboard, which showed one, to keep today's flow.

`event-date-picker.component.tsx`: keep the props and `Popover` + `Calendar`. The trigger becomes `<Button variant="outline" className="h-12 w-full justify-start rounded-xl text-[15px] font-bold"><CalendarIcon />{fmt(date, "EEE d MMM yyyy")}</Button>` (with `const { fmt } = useI18n()`).

- [ ] **Step 7: Pages**

`src/app/admin/event/page.tsx`:

```tsx
function CreateEventPage() {
  const t = useT();
  const handleCreateEvent = async (event: { name: string; date: string; players: string[] }) => {
    await eventOperations.addEvent(event.name, event.date, event.players);
  };
  return (
    <>
      <ScreenHeader title={t("eventForm.createTitle")} adminSection="events" back={{ href: "/admin/events", label: t("admin.events") }}
        crumbs={[{ label: t("hub.title"), href: "/admin" }, { label: t("admin.events"), href: "/admin/events" }, { label: t("eventForm.createTitle") }]} />
      <PageBody><EventForm onSave={handleCreateEvent} mode="create" /></PageBody>
    </>
  );
}
```

`src/app/admin/event/[id]/page.tsx`: keep the loading logic and `handleSaveEvent`. Loading → `<PageBody><SkeletonRows count={6} /></PageBody>`; not found → `EmptyState title={t("eventForm.notFound")}`. Then render `ScreenHeader` with `title={t("eventForm.editTitle")}`, `meta={event.name}`, back to `/admin/events`, crumbs Admin › Events › event name, and `<PageBody><EventForm initialEvent={event} onSave={handleSaveEvent} mode="edit" /></PageBody>`.

- [ ] **Step 8: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS. Manual: test cases 9.2–9.16. Confirm especially 9.8/9.9 (the guard fires only when dirty) and 9.4 (15 of 16 added, notice with "Everyone else from "Tuesday" was added").

- [ ] **Step 9: Commit**

```bash
git add src/utils/event-form-state.ts src/components/event-form.tsx src/components/event-date-picker.component.tsx src/app/admin/event src/i18n src/_tests_/event-form-state.test.ts
git commit -m "feat(admin): redesigned event form with source switch, unsaved marker and leave guard

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 19: Admin players and player sheet

Canvas: "Admin · players", "Admin · add / edit player".

**Files:**
- Modify: `src/app/admin/players/page.tsx`, `src/components/player-list.tsx`, `src/components/add-player-sheet.tsx`
- Modify: `en.ts`, `pl.ts`

**Interfaces:**
- `PlayerSheet` props become `{ player: Player; onSave: (player: Player) => void; trigger: React.ReactElement; mode: "add" | "edit" }`. The trigger is wrapped in Radix `Slot`, which adds the `onClick` that opens the sheet. Both call sites are updated in this task.

- [ ] **Step 1: Dictionary keys**

en:

```ts
"adminPlayers.title": "Players",
"adminPlayers.add": "Add player",
"adminPlayers.addTitle": "Add player",
"adminPlayers.editTitle": "Edit player",
"adminPlayers.name": "Player name",
"adminPlayers.namePlaceholder": "Enter player name",
"adminPlayers.cardType": "Card type",
"adminPlayers.cardHint": "The card type sets how card-usage discounts apply in events and in the FFP calculator.",
"adminPlayers.save": "Save player",
"adminPlayers.deleteText": "This action cannot be undone. This will permanently delete the player from the system.",
"adminPlayers.edit": "Edit {name}",
"adminPlayers.delete": "Delete {name}",
```

pl:

```ts
"adminPlayers.title": "Gracze",
"adminPlayers.add": "Dodaj gracza",
"adminPlayers.addTitle": "Nowy gracz",
"adminPlayers.editTitle": "Edytuj gracza",
"adminPlayers.name": "Imię i nazwisko",
"adminPlayers.namePlaceholder": "Wpisz imię i nazwisko",
"adminPlayers.cardType": "Typ karty",
"adminPlayers.cardHint": "Typ karty decyduje o rabatach za użycie karty w wydarzeniach i w kalkulatorze FFP.",
"adminPlayers.save": "Zapisz gracza",
"adminPlayers.deleteText": "Tej operacji nie można cofnąć. Gracz zostanie trwale usunięty.",
"adminPlayers.edit": "Edytuj: {name}",
"adminPlayers.delete": "Usuń: {name}",
```

- [ ] **Step 2: PlayerSheet**

Keep `playerName` / `cardType` state, the `useEffect` that syncs from `player`, and `handleSubmit` (calls `onSave({ ...player, name: playerName, cardType })` then closes). Render:

```tsx
<>
  <Slot onClick={() => setOpen(true)}>{trigger}</Slot>
  <ResponsiveSheet open={open} onOpenChange={setOpen} title={t(mode === "add" ? "adminPlayers.addTitle" : "adminPlayers.editTitle")}
    footer={<Button className="w-full" onClick={handleSubmit}>{t("adminPlayers.save")}</Button>}>
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-[13px] font-bold text-[#4A4361]">{t("adminPlayers.name")}
        <Input value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder={t("adminPlayers.namePlaceholder")} className="h-12 rounded-xl text-[15px] font-bold" />
      </label>
      <div role="radiogroup" aria-label={t("adminPlayers.cardType")} className="flex flex-col gap-2">
        <span className="text-[13px] font-bold text-[#4A4361]">{t("adminPlayers.cardType")}</span>
        {cardTypes.map((ct) => {
          const on = ct === cardType;
          const s = CARD_TYPE_STYLE[ct];
          return (
            <button key={ct} type="button" role="radio" aria-checked={on} onClick={() => setCardType(ct)}
              className={cn("flex min-h-12 items-center justify-between rounded-xl px-3.5 text-sm font-extrabold",
                on ? cn("border-2", s.soft, s.ink, "border-current") : "border border-line bg-white text-ink")}>
              <span className="flex items-center gap-2"><span className={cn("h-2.5 w-2.5 rounded-full", s.dot)} />{t(`cardType.${ct}`)}</span>
              {on ? <Check className="h-4 w-4" /> : null}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{t("adminPlayers.cardHint")}</p>
    </form>
  </ResponsiveSheet>
</>
```

Imports: `Slot` from `@radix-ui/react-slot`, `cardTypes` from `~/lib/db`, `CARD_TYPE_STYLE`, `Check`, `cn`, `useT` and `ResponsiveSheet`. `handleSubmit` takes an optional event: `(e?: React.FormEvent) => { e?.preventDefault(); … }`.

- [ ] **Step 3: PlayersList and page**

`player-list.tsx`: keep `refreshPlayers`, `handleSavePlayer` and `handleDeletePlayer`. Add a local search (`matchesQuery`) and render:
- a search input as in Task 14;
- `ListCard` / `ListRow` with `leading` `PlayerAvatar`;
- `trailing`: `PenaltyBadge`, `CardTypeChip short`, an Edit `PlayerSheet` (`mode="edit"`, trigger `<Button size="icon" variant="ghost" aria-label={t("adminPlayers.edit", { name })}><Pencil /></Button>`), and a Delete `ConfirmDialog` (trigger icon button `aria-label={t("adminPlayers.delete", { name })}` with `<Trash2 />`, `description={t("adminPlayers.deleteText")}`, `confirmLabel={t("common.delete")}`, `confirmVariant="destructive"`);
- desktop: `md:grid md:grid-cols-2 md:gap-x-8` inside the card.

`src/app/admin/players/page.tsx`: keep `handleAddPlayer` and `refreshTrigger`. Render `ScreenHeader title={t("adminPlayers.title")} adminSection="players"`, with `actions` and `mobileTitleAside` set to `<PlayerSheet mode="add" player={{ id: "", name: "", cardType: "Multisport", paid: false, amount: 0 }} onSave={handleAddPlayer} trigger={<Button size="sm" className="md:h-11"><Plus />{t("adminPlayers.add")}</Button>} />`. Because `actions` and `mobileTitleAside` are separate element instances, render the sheet twice: one copy is hidden per breakpoint by `ScreenHeader`'s own `md:hidden` / `hidden md:flex` containers. Then `<PageBody><PlayersList refreshTrigger={refreshTrigger} /></PageBody>`.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS. Manual: test cases 10.1–10.6.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/players src/components/player-list.tsx src/components/add-player-sheet.tsx src/i18n
git commit -m "feat(admin): redesigned players list and player sheet

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 20: Reservations and reservation sheet

Canvas: "Admin · reservations", "Admin · add / edit reservation", "Player picker · search sheet", "Desktop · admin reservations". Spec §6a: rename is saved.

**Files:**
- Modify: `src/app/admin/reservations/page.tsx`, `src/components/reservation-list.tsx`, `src/components/add-reservation-sheet.tsx`
- Modify: `en.ts`, `pl.ts`
- Test: `src/_tests_/reservation-edit.test.ts`

**Interfaces:**
- Consumes: `reservationOperations.renameReservationList` (Task 5).
- Produces: `saveReservationEdit(ops: { renameReservationList(id: string, name: string): Promise<void>; updateReservationPlayers(id: string, ids: string[]): Promise<void> }, current: { id: string; name: string }, data: { name: string; players: string[] }): Promise<void>` in `src/components/reservation-list.tsx` (exported). It renames only when the trimmed name changed, then updates the players.
- `AddReservationSheet` props become `{ reservation?: ReservationList; onSave: (data: SaveReservationData) => Promise<void>; trigger: React.ReactElement }`; the trigger is wrapped in `Slot`.

- [ ] **Step 1: Write the failing test**

```ts
import { saveReservationEdit } from "~/components/reservation-list";

test("renames only when the name changed, always updates players", async () => {
  const ops = { renameReservationList: jest.fn().mockResolvedValue(undefined), updateReservationPlayers: jest.fn().mockResolvedValue(undefined) };
  await saveReservationEdit(ops, { id: "r1", name: "Tuesday" }, { name: "Tuesday", players: ["p1"] });
  expect(ops.renameReservationList).not.toHaveBeenCalled();
  expect(ops.updateReservationPlayers).toHaveBeenCalledWith("r1", ["p1"]);
  await saveReservationEdit(ops, { id: "r1", name: "Tuesday" }, { name: "Wtorek", players: ["p1"] });
  expect(ops.renameReservationList).toHaveBeenCalledWith("r1", "Wtorek");
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test -- reservation-edit`
Expected: FAIL.

- [ ] **Step 3: Dictionary keys**

en:

```ts
"res.title": "Reservations",
"res.intro": "Regular line-ups. Pick one when creating an event to add everyone at once.",
"res.new": "New",
"res.newReservation": "New reservation",
"res.addTitle": "New reservation",
"res.editTitle": "Edit reservation",
"res.name": "Reservation name",
"res.namePlaceholder": "Enter reservation name",
"res.players": "Players · {count}",
"res.addPlayers": "Add players…",
"res.penaltyNote": "{names} on the penalty list: kept in the reservation, but skipped when it is added to an event.",
"res.save": "Save reservation",
"res.header": "{name} · {players}",
"res.deleteText": "This action cannot be undone. This will permanently delete this reservation.",
"res.removePlayerText": "Remove {name} from this reservation?",
"res.empty": "No reservations yet",
"res.tabs": "Reservations",
```

pl:

```ts
"res.title": "Rezerwacje",
"res.intro": "Stałe składy. Wybierz jeden przy tworzeniu wydarzenia, aby dodać wszystkich naraz.",
"res.new": "Nowa",
"res.newReservation": "Nowa rezerwacja",
"res.addTitle": "Nowa rezerwacja",
"res.editTitle": "Edytuj rezerwację",
"res.name": "Nazwa rezerwacji",
"res.namePlaceholder": "Wpisz nazwę",
"res.players": "Gracze · {count}",
"res.addPlayers": "Dodaj graczy…",
"res.penaltyNote": "{names} na liście kar: zostaje w rezerwacji, ale zostanie pominięty przy dodawaniu jej do wydarzenia.",
"res.save": "Zapisz rezerwację",
"res.header": "{name} · {players}",
"res.deleteText": "Tej operacji nie można cofnąć. Rezerwacja zostanie trwale usunięta.",
"res.removePlayerText": "Usunąć {name} z tej rezerwacji?",
"res.empty": "Brak rezerwacji",
"res.tabs": "Rezerwacje",
```

Before writing, check the current confirm texts in `reservation-list.tsx` (around line 160) and use the same meaning.

- [ ] **Step 4: saveReservationEdit and handleEdit**

In `reservation-list.tsx` (outside the component):

```ts
export async function saveReservationEdit(
  ops: { renameReservationList(id: string, name: string): Promise<void>; updateReservationPlayers(id: string, ids: string[]): Promise<void> },
  current: { id: string; name: string },
  data: { name: string; players: string[] },
) {
  const name = data.name.trim();
  if (name && name !== current.name) await ops.renameReservationList(current.id, name);
  await ops.updateReservationPlayers(current.id, data.players);
}
```

`handleEdit` becomes:

```ts
const handleEdit = async (data: SaveReservationData) => {
  const current = reservations.find((r) => r.id === activeTab);
  if (!current) return;
  try {
    await saveReservationEdit(reservationOperations, current, data);
    await refreshReservations();
  } catch (error) {
    console.error("Failed to update reservation:", error);
  }
};
```

`refreshReservations`, `handleSave`, `handleDelete` and `handleRemovePlayer` stay as they are. Remove the `console.log` debug lines while you are here, they print reservation data.

- [ ] **Step 5: Reservation list render**

- **Mobile:**
  - `role="tablist"` pills of reservation names with player counts (selected: `bg-brand-900 text-white`; other: white bordered), driving `activeTab`;
  - below, a card with the header `t("res.header", { name, players: t("common.players", { count }) })`, an Edit `AddReservationSheet` trigger (icon button) and a Delete `ConfirmDialog` (icon button);
  - then `ListRow`s of players (avatar, `t(\`cardType.${…}\`)` meta, `PenaltyBadge`) with a remove ✕ inside a `ConfirmDialog` with `description={t("res.removePlayerText", { name })}`.
- **Desktop (`md:`):** two columns, as on the artboard: on the left the intro paragraph and a vertical list of reservation buttons (active `bg-brand-50 border-[#D9CCF0]`); on the right the same card with players in `md:grid-cols-2`.
- Implement both with one data source. Render the pills `md:hidden` and the left column `hidden md:flex`. Drop the Radix `Tabs` (`ui/tabs`) from this file.
- Empty: `<EmptyState title={t("res.empty")} />`.

- [ ] **Step 6: AddReservationSheet**

Keep the state, the player loading, the `useEffect` sync from `reservation` and `handleSubmit`. Changes:
- in edit mode the name field is **editable** (the rename is now persisted by `handleEdit`);
- picker options:

```ts
const playerOptions = availablePlayers.map((player) => ({
  value: player.id, label: player.name, cardType: player.cardType,
  ...(isPenalized(player) ? { hint: t("penalty.chip") } : {}),
}));
```

  These are **not** disabled: business rule, spec §2;
- body: name `Input` (h-12), `MultiSelect options={playerOptions} selected={selectedPlayers} onChange={setSelectedPlayers} placeholder={t("res.addPlayers")} title={t("res.players", { count: selectedPlayers.length })}`;
- if any selected player is penalized: `<Notice>{t("res.penaltyNote", { names })}</Notice>`;
- footer: `<Button className="w-full" disabled={isSubmitting || !reservationName.trim()} onClick={handleSubmit}>{t("res.save")}</Button>`;
- wrap in `ResponsiveSheet` with the title `t(reservation ? "res.editTitle" : "res.addTitle")`, and the trigger in `Slot` as in Task 19.

`src/app/admin/reservations/page.tsx`: keep `handleAddReservation` and `refreshTrigger`. `ScreenHeader title={t("res.title")} adminSection="reservations"` with an "add" `AddReservationSheet` (trigger `<Button size="sm" className="md:h-11"><Plus />{t("res.new")}</Button>`; desktop label `t("res.newReservation")`) in `actions` and in `mobileTitleAside`. Then `<PageBody><ReservationList refreshTrigger={refreshTrigger} /></PageBody>`.

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS. Manual: test cases 11.1–11.13. Check 11.9 (rename to "Wtorek" survives a reload).

- [ ] **Step 8: Commit**

```bash
git add src/app/admin/reservations src/components/reservation-list.tsx src/components/add-reservation-sheet.tsx src/i18n src/_tests_/reservation-edit.test.ts
git commit -m "feat(admin): redesigned reservations with picker and persisted rename

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 21: Admin penalties and `/admin/defaults`

Canvas: "Admin · manage penalties", "Admin · defaults".

**Files:**
- Modify: `src/app/admin/penalties/page.tsx`
- Create: `src/app/admin/defaults/page.tsx`
- Modify: `src/components/default-admin-values-form.component.tsx`
- Modify: `en.ts`, `pl.ts`

- [ ] **Step 1: Dictionary keys**

en:

```ts
"adminPen.title": "Manage penalties",
"adminPen.public": "Public list ↗",
"adminPen.add": "Add to penalty list",
"adminPen.addButton": "Add to list",
"adminPen.onList": "On the list · {count}",
"adminPen.since": "Since {date} · {days}",
"adminPen.paid": "Paid",
"adminPen.paidTitle": "Mark {name} as paid?",
"adminPen.paidText": "They will be removed from the penalty list and can join events and lotteries again.",
"adminPen.paidConfirm": "Mark as paid",
"adminPen.empty": "No players with unpaid penalties",
"adminPen.loadFailed": "Failed to load players.",
"adminPen.addedAll": "Added {count} player(s) to the penalty list",
"adminPen.addedSome": "Added {ok} of {total}; {failed} failed, try again.",
"adminPen.removed": "{name} removed from the penalty list",
"adminPen.removeFailed": "Failed to remove penalty.",
"defaults.title": "Default pricing",
"defaults.hint": "Price and hours prefill the Pricing sheet of every event. The card-use discount is applied whenever an event’s amounts are recalculated.",
"defaults.price": "Price per hour",
"defaults.priceHint": "PLN per court per hour",
"defaults.hours": "Hours",
"defaults.hoursHint": "Length of a training",
"defaults.discount": "Discount per card usage",
"defaults.discountHint": "PLN off a player’s price for each card use",
"defaults.save": "Save defaults",
"defaults.saved": "Default values successfully updated!",
"defaults.failed": "Failed to update default values.",
```

pl:

```ts
"adminPen.title": "Zarządzaj karami",
"adminPen.public": "Lista publiczna ↗",
"adminPen.add": "Dodaj do listy kar",
"adminPen.addButton": "Dodaj",
"adminPen.onList": "Na liście · {count}",
"adminPen.since": "Od {date} · {days}",
"adminPen.paid": "Opłacone",
"adminPen.paidTitle": "Oznaczyć {name} jako opłacone?",
"adminPen.paidText": "Gracz zostanie usunięty z listy kar i znów może dołączać do wydarzeń i losowań.",
"adminPen.paidConfirm": "Oznacz jako opłacone",
"adminPen.empty": "Brak graczy z nieopłaconą karą",
"adminPen.loadFailed": "Nie udało się wczytać graczy.",
"adminPen.addedAll": "Dodano do listy kar: {count}",
"adminPen.addedSome": "Dodano {ok} z {total}; {failed} nie powiodło się, spróbuj ponownie.",
"adminPen.removed": "Usunięto {name} z listy kar",
"adminPen.removeFailed": "Nie udało się usunąć kary.",
"defaults.title": "Domyślne ceny",
"defaults.hint": "Cena i godziny wypełniają cennik każdego wydarzenia. Rabat za kartę jest stosowany przy każdym przeliczeniu kwot wydarzenia.",
"defaults.price": "Cena za godzinę",
"defaults.priceHint": "zł za kort za godzinę",
"defaults.hours": "Godziny",
"defaults.hoursHint": "Długość treningu",
"defaults.discount": "Rabat za użycie karty",
"defaults.discountHint": "zł mniej dla gracza za każde użycie karty",
"defaults.save": "Zapisz",
"defaults.saved": "Zapisano wartości domyślne!",
"defaults.failed": "Nie udało się zapisać wartości domyślnych.",
```

(The old sheet's error toast said "Failed to update player payment amounts." That was a copy-paste bug, so the new text is correct.)

- [ ] **Step 2: Admin penalties page**

Keep `refresh`, `handleAdd` (with `settleEach`, and failed ids staying selected) and `handleRemove`. Replace the toasts with keys (`adminPen.addedAll` uses `count: succeeded.length`; `adminPen.addedSome` uses `ok`, `total`, `failed`). Render:

```tsx
<>
  <ScreenHeader title={t("adminPen.title")} adminSection="penalties"
    meta={<GuardedLink href="/penalties" className="font-bold text-brand-700 underline">{t("adminPen.public")}</GuardedLink>} />
  <PageBody>
    <section className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-3.5 md:flex-row md:items-end md:p-[18px]">
      <div className="flex flex-1 flex-col gap-1.5">
        <SectionLabel>{t("adminPen.add")}</SectionLabel>
        <MultiSelect options={options} selected={selected} onChange={setSelected} placeholder={t("picker.placeholder")} />
      </div>
      <Button onClick={handleAdd} disabled={selected.length === 0 || isSaving}>{isSaving ? <Loader2 className="animate-spin" /> : null}{t("adminPen.addButton")}</Button>
    </section>
    {penalized.length === 0 ? <EmptyState title={t("adminPen.empty")} /> : (
      <>
        <SectionLabel>{t("adminPen.onList", { count: penalized.length })}</SectionLabel>
        <ListCard className="md:grid md:grid-cols-2 md:gap-x-8 md:divide-y-0">
          {penalized.map((player) => (
            <ListRow key={player.id} className="md:border-b md:border-[#F0ECF7]"
              leading={<PlayerAvatar name={player.name} cardType={player.cardType} />}
              title={player.name}
              meta={t("adminPen.since", { date: fmt(player.penalty_since!, "dd.MM.yyyy"), days: t("penalties.days", { count: daysSince(player.penalty_since!) }) })}
              trailing={
                <ConfirmDialog
                  trigger={<Button size="sm" variant="outline" className="border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]"><Check />{t("adminPen.paid")}</Button>}
                  title={t("adminPen.paidTitle", { name: player.name })} description={t("adminPen.paidText")}
                  confirmLabel={t("adminPen.paidConfirm")} onConfirm={() => void handleRemove(player)} />
              } />
          ))}
        </ListCard>
      </>
    )}
  </PageBody>
</>
```

`options` gains `cardType: p.cardType`.

- [ ] **Step 3: Defaults page**

`DefaultAdminValuesForm`: keep `updateField` (`Number(newValue)`). Render three labelled inputs (`inputMode="decimal"`, `h-12 rounded-xl`) with the hints `defaults.priceHint`, `defaults.hoursHint` and `defaults.discountHint`.

`src/app/admin/defaults/page.tsx`:

```tsx
"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { withAdminLayout } from "~/components/with-admin-layout";
import { ScreenHeader } from "~/components/shell/screen-header";
import { PageBody } from "~/components/ds/page-body";
import { ActionDock } from "~/components/ds/action-dock";
import { SkeletonRows } from "~/components/ds/skeleton-rows";
import { Button } from "~/components/ui/button";
import { DefaultAdminValuesForm } from "~/components/default-admin-values-form.component";
import { DefaultAdminValuesOperations, type DefaultAdminValues } from "~/lib/db";
import { useT } from "~/i18n/i18n-provider";

function DefaultsPage() {
  const t = useT();
  const [value, setValue] = useState<DefaultAdminValues | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    DefaultAdminValuesOperations.getDefaultAdminValues().then(setValue).catch((e) => console.error("Fetch error:", e));
  }, []);

  const save = async () => {
    if (!value) return;
    setSaving(true);
    const { id, ...values } = value;
    try {
      await DefaultAdminValuesOperations.updateDefaultAdminValues(id, values);
      toast.success(t("defaults.saved"));
    } catch (error) {
      console.error("Error updating default values:", error);
      toast.error(t("defaults.failed"));
    } finally {
      setSaving(false);
    }
  };

  const saveButton = <Button className="flex-1 md:flex-none" onClick={() => void save()} disabled={saving || !value}>{saving ? <Loader2 className="animate-spin" /> : null}{t("defaults.save")}</Button>;

  return (
    <>
      <ScreenHeader title={t("defaults.title")} adminSection="defaults" meta={t("defaults.hint")} actions={saveButton} />
      <PageBody className="pb-24 md:pb-0">
        {value ? (
          <section className="max-w-[560px] rounded-2xl border border-line bg-white p-3.5 md:p-5">
            <DefaultAdminValuesForm value={value} onChange={setValue} />
          </section>
        ) : <SkeletonRows count={3} />}
      </PageBody>
      <ActionDock>{saveButton}</ActionDock>
    </>
  );
}
export default withAdminLayout(DefaultsPage);
```

Remove every remaining render of `DefaultValuesAdminSheet`: it was only in `admin-navbar.tsx`, which is no longer rendered. The file itself is deleted in Task 22.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && pnpm test`
Expected: PASS. Manual: test cases 8.3–8.9 and 12.1–12.4.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/penalties src/app/admin/defaults src/components/default-admin-values-form.component.tsx src/i18n
git commit -m "feat(admin): redesigned penalties management and defaults page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 22: Cleanup, string sweep and full manual pass

**Files:**
- Delete (only when `grep -rn "<name>" src` shows no imports):
  - `src/components/navbar.tsx`
  - `src/components/admin-navbar.tsx`
  - `src/components/breadcrumbs.component.tsx`
  - `src/components/event-breadcrumbs.component.tsx`
  - `src/components/default-values-admin-sheet.component.tsx`
  - `src/components/player-card.tsx`
  - `src/components/full-size-loader.tsx` (check `src/app/login/layout.tsx`; replace its `Suspense` fallback with `<div className="min-h-dvh bg-brand-900" />`)
  - `src/components/ui/tabs.tsx`, `src/components/ui/breadcrumb.tsx`, `src/components/ui/separator.tsx` (only if unused)
- Modify: `README.md` (a short "Languages" note)
- Modify: `docs/superpowers/specs/2026-10-07-ui-redesign-test-cases.md` (case 6.12 wording, if not done in Task 13)

- [ ] **Step 1: Find hard-coded UI strings**

Run:

```bash
grep -rnE '>[[:space:]]*[A-Z][a-z]+([ ,.!?][A-Za-z]+)*[[:space:]]*<' src/app src/components src/features | grep -v "src/i18n" | grep -v "_tests_"
grep -rnE '(toast\.(success|error|warning)|placeholder=|aria-label=|title=|description=)\("?[A-Z]' src/app src/components src/features
grep -rnE '"(Loading|Cancel|Confirm|Delete|Save|Remove|Add)[^"]*"' src/app src/components src/features
```

Expected: no hits except `Mario Group`, `MS+`, `MS Classic`, `FFP`, the brand "M" and `MOCK DATA` (the dev-only banner). Move every other hit into both dictionaries.

- [ ] **Step 2: Remove dead files**

For each file in the delete list: `grep -rn "<basename without extension>" src`. If there are no imports, `git rm` it. Then run `npx tsc --noEmit`.

- [ ] **Step 3: Responsive and accessibility pass**

In mock mode, using the browser device toolbar, go through test-case sections 13.1–13.9 at 360, 375, 768, 1280 and 1440 widths. Fix any overflow: add `truncate` or `min-w-0` where a row breaks.

- [ ] **Step 4: README**

Add under "Mock mode":

```md
## Languages

The UI is available in English and Polish. The switch is in the top bar; the choice is stored in `localStorage` (`locale`). Strings live in `src/i18n/messages/en.ts` and `pl.ts` — `pl.ts` must have every key of `en.ts` (TypeScript enforces it).
```

- [ ] **Step 5: Full verification**

Run: `npx tsc --noEmit && pnpm test && pnpm build`
Expected: all three succeed. The golden snapshots are unchanged: `git diff --stat src/_tests_/__snapshots__` must show no changes since Task 1.

- [ ] **Step 6: Full manual pass**

Run every section of `docs/superpowers/specs/2026-10-07-ui-redesign-test-cases.md` in mock mode on M and D, EN and PL. Record the results in a copy of the file (`…-test-run-YYYY-MM-DD.md`). Each ❌ becomes a fix commit before the PR.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore(redesign): remove old navbars and unused components, string sweep, README

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
