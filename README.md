# GFS Dashboards

Goodwine Financial Services' internal account, quoting, reporting, and credit-union prospect dashboard.

## Run locally

```bash
npm install
npm start
```

The Express server starts on `PORT` (default `3000`). Configure `MONGODB_URI` and the existing GFS deployment variables before using database-backed features.

## Main workspaces

- `potential-new-client-overview.html` — national credit-union map and directory
- `clients.html` — current client portfolio, products, lending totals, and projections
- `credit-union-prospects.html` — Prospect and Radar account views
- `accounts.html` — account management
- `quotes.html` — quote workflows

The dashboard pages use `dashboard-theme.css`. That stylesheet is intentionally scoped through the `dashboard-shell` body class so the dashboard redesign does not affect Quotes, Accounts, or other workspaces.

## Custom non-NCUA clients

Privately insured credit unions are stored in `data/custom-credit-unions.json`. The adapter in `ncua/custom-credit-unions.mjs` maps each provider report into the same assets, members, loans, auto, indirect-auto, mortgage, history, and map fields used by the NCUA directory. Custom records are merged at read time, so an NCUA refresh cannot remove them, while MongoDB status, notes, tags, products, and training logs continue to use the report charter number.

## Validation

```bash
npm test
```
