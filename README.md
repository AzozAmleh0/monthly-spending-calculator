# Monthly Spending Calculator

A small web app for working out what recurring expenses cost every month.

Add each expense with a name, a price in shekels (₪) and how often you pay it,
and the app shows your total per month, your average daily and weekly spending,
and the monthly cost of every single item. Set your monthly income and it also
shows what is left after the expenses. Items can be edited and deleted, and
everything is saved on the device.

**Live app:** https://azozamleh0.github.io/monthly-spending-calculator/

## Features

- Frequencies: daily, weekly, monthly, yearly, "X times per period" (e.g. 2
  times per day) and "every N periods" (e.g. every 2 days).
- Monthly income, editable with the pencil on the income card, and a card for
  what is left after all the expenses.
- Totals update instantly on every add, edit or delete.
- Everything is stored in the browser's `localStorage` — no account, no backend,
  no sync. Each device keeps its own list.
- Installable as an app and works offline.

## Running it locally

```bash
npm install
npm run dev
```

Then open the URL that Vite prints (the app is served under
`/monthly-spending-calculator/`).

Other scripts:

```bash
npm run build     # type-check and build into dist/
npm run preview   # serve the production build
npm run lint      # oxlint
```

## Installing it on a device

- **iPhone:** open the site in Safari, tap Share, then "Add to Home Screen".
- **Android:** open the site in Chrome, tap the menu, then "Install app".
- **Mac:** open the site in Chrome and click the install icon in the address
  bar, or in Safari choose File > Add to Dock.
- **Windows:** open the site in Chrome or Edge and click the install icon in the
  address bar.

The installed app updates itself the next time it is opened after a new version
is deployed.

## How the numbers are calculated

Every item is converted to occurrences per year, and everything else follows
from the yearly cost:

```
yearlyCost(item)  = price × occurrencesPerYear(item)
monthlyCost(item) = yearlyCost(item) / 12

totalMonthly = sum of monthlyCost(item)
dailyRate    = sum of yearlyCost(item) / 365
weeklyRate   = sum of yearlyCost(item) / (365 / 7)
```

A year is 365 days, 365/7 weeks and 12 months. Full precision is kept in the
calculations; numbers are only rounded when displayed.

## Tech

React + Vite + TypeScript, Tailwind CSS, [shadcn/ui](https://ui.shadcn.com),
`react-hook-form` with `zod`, and `vite-plugin-pwa`.

```
src/
  App.tsx              two-column layout
  components/          ItemForm, ItemsList, DeleteConfirm, Summary, ItemBreakdown
    ui/                shadcn components
  lib/
    calculations.ts    occurrencesPerYear, monthlyCost, totals
    storage.ts         load and save items and income in localStorage
    format.ts          ILS formatting and frequency labels
    schema.ts          zod schema for the item form
  types.ts
```

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the app and
publishes `dist/` to GitHub Pages.

## A note on the data

Items and your income live in the browser on each device. They do not sync
between devices, and clearing the browser's site data for the app deletes them.
