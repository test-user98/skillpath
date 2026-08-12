# Skillpath — courses section

Framer code components for the Skillpath landing page. All data comes live
from the assignment API, nothing is hardcoded.

- Live page: https://skillpath-jai.framer.website
- [CourseSection.tsx](CourseSection.tsx) — the courses section (the part the assignment is about)
- [Hero.tsx](Hero.tsx), [Footer.tsx](Footer.tsx) — the sections around it

## How the flaky API is handled

- Every request retries up to 3 times with growing delays, because the
  failures come in bursts.
- The two endpoints are fetched with `Promise.allSettled`, so a failed
  country lookup never hides the courses — they render in USD with a
  small note instead.
- Four states: skeleton loading, error with a retry button, empty, grid.

## Currency

Prices arrive in the smallest unit (`pricePaise`, `priceUsdCents`). Both
are divided by 100 and formatted with `Intl.NumberFormat`:
199900 paise → ₹1,999, 3999 cents → $39.99.

## Layout and controls

3 columns on desktop, 2 under 1024px, 1 under 640px — the grid doesn't
care how many cards come back. Property controls: **Heading** (section
title) and **Accent** (tag + button color).

Extras: search, sort by price, skeleton loaders, retry button, and a
"Refundable" badge that only shows when it's true.
