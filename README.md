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

## Quote visitor log

The Missouri and Arkansas quote routes record daily unique browsers and page views in the existing MongoDB database. The calculators' HTML, styles, scripts, rates, and calculations are unchanged. Only successful GET responses (including conditional 304 responses) count; known bots, HEAD requests, and prefetches are excluded. Logging runs after the page response and cannot block quoting.

Open `/quote-usage.html` with the existing dashboard credentials for the daily log. `/api/quote-usage/daily?days=30` uses the same dashboard authentication. Days follow `America/Chicago`, including daylight saving time. An anonymous first-party HttpOnly cookie identifies a browser; only its daily SHA-256 hash and first/last visit timestamps are stored, with no IP addresses, names, or quote inputs. Same-day combined totals deduplicate browsers visiting both states. These are estimated browsers, not identified people, quotes, or sales.

`quote_usage_daily` stores one document per day, state, and browser with atomic page-view increments. `quote_usage_meta` records the tracking start so earlier days are never reported as zero. Reporting returns 503 on unavailable storage, and flags recording failures since the current server start. Existing MongoDB backups and retention apply to these collections as well.

The daily ChatGPT report reads `/api/quote-usage/report?days=8` with a dedicated read-only bearer credential stored privately in its automation. Only the SHA-256 token hash is in source; the endpoint returns daily aggregates, never browser identifiers. To rotate access, set `QUOTE_USAGE_REPORT_TOKEN_HASH` to the SHA-256 hex digest of a new random 32-byte token (encoded as 64 hex characters), and update the private automation's bearer credential. To revoke reporting access, set that variable to `disabled`. The password-protected dashboard log continues to work independently.

## Validation

```bash
npm test
```
