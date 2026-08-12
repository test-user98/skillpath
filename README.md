# Skillpath — courses section

A Framer code component that renders the courses grid for the Skillpath
landing page. All data comes live from the assignment API — nothing is
hardcoded.

- Live page: `<framer link here>`
- Component: [CourseSection.tsx](CourseSection.tsx) (single file, paste-ready for Framer)

## How it deals with the flaky API

The API fails roughly 1 in 3 requests, and in bursts. So:

- Every request goes through `fetchWithRetry`: up to 3 GET attempts with a
  growing pause between them (0.6s, then 1.2s), so retries don't all land
  inside the same bad window.
- The two endpoints are fetched in parallel with `Promise.allSettled`, so a
  failed country lookup can never take down the course grid.
- If the country call fails but courses load, the grid still renders with
  USD prices and a small note saying so. Hiding good data over a failed
  region lookup felt like the wrong product call.
- If the course call itself fails after all retries, there's a friendly
  error message and a "Try again" button (no raw errors, no blank page).

## The four states

1. **Loading** — pulsing skeleton cards.
2. **Error** — message + retry button.
3. **Empty** — "No courses are available right now." (also a separate
   message when a search matches nothing).
4. **Ready** — the grid.

## Currency

Prices arrive in the smallest unit: `pricePaise` (paise) and
`priceUsdCents` (cents). Both are divided by 100 and formatted with
`Intl.NumberFormat`, which also gets Indian digit grouping right:
199900 paise → **₹1,999** (not ₹1,99,900), 3999 cents → **$39.99**.
Whole amounts drop the decimals.

## Property controls

- **Heading** — the section title text.
- **Accent** — the color used for the category tag and the retry button.

## Layout

CSS grid: 3 columns on desktop, 2 under 1024px, 1 under 640px. The grid
doesn't care how many cards come back, so an uneven last row is fine.

## Extras included

Search box (name + category), sort by price (in the currency being shown),
skeleton loaders, retry button, and a "Refundable" badge that only shows
when `refundable` is true.

## Using it in Framer

1. In Framer: **Assets → Code → Create code file**, name it
   `CourseSection`, replace the contents with this file.
2. Drag the component onto the page between the hero and footer, set its
   width to fill.
3. Heading and accent color are editable from the properties panel.
