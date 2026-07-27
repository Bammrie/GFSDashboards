# GFS Dashboards / CuLoanPortal Decisioning

## Decision-Support Status

The decisioning engine is an explainable decision-support tool. It is not a legally final underwriting black box unless the lender formally approves it for production underwriting.

Before production use, the final implementation must be reviewed for ECOA, FCRA, Regulation B, fair lending, adverse action, model governance, and applicable state lending requirements. Do not use prohibited basis variables for scoring or decisioning. Any use of alternative data must be explainable, validated, monitored for disparate impact, and auditable.

## Architecture

The backend is Express with Mongoose/MongoDB. Decisioning code lives in `decisioning/` and is wired through:

- `POST /api/decisioning/evaluate`
- `GET /api/decisioning/runs`
- `GET /api/decisioning/config`

Every evaluation stores a `decisioning_runs` audit record with:

- input snapshot
- normalized input
- rules evaluated and matched
- category score breakdown
- final decision
- reason codes
- model/config versions
- triggering user/system

## Model Flow

1. `normalizer.mjs` accepts flexible borrower, co-borrower, loan, collateral, credit, cash-flow, and fraud fields.
2. `rules-engine.mjs` evaluates JSON-configured hard-decline, manual-review, counteroffer, and approval policy rules.
3. `score-engine.mjs` produces transparent category scores for credit, capacity, cash-flow, collateral, relationship, and fraud/application integrity.
4. `counteroffer-engine.mjs` tests adjusted amount, term, payment, down payment, and LTV structures.
5. `decision-service.mjs` applies the hierarchy: hard decline, manual/fraud review, counteroffer, score thresholds, conditional approval, decline.

## Configuration

The seed policy lives in `decisioning/default-config.json`. MongoDB collections are also created for:

- `decisioning_configs`
- `decisioning_reason_codes`
- `decisioning_rule_sets`
- `pricing_tiers`

To adjust thresholds safely:

1. Copy the current config and increment `configVersion`.
2. Change one policy area at a time, such as max DTI, max PTI, max LTV, fraud thresholds, or pricing tiers.
3. Run `npm test`.
4. Back-test against historical applications before activating.
5. Confirm reason codes still accurately describe the actual factors driving the recommendation.

## Reason Codes

Each reason code includes:

- code
- severity
- category
- internal explanation
- consumer-friendly explanation
- adverse-action relevance flag

Reason codes are designed to support internal review and adverse-action workflows, but legal/compliance teams must approve the final wording and mapping before use.

## Admin UI

Open `decisioning.html` from the dashboard to run an internal/admin evaluation and review audit history. The panel is intended for staff only; do not show sensitive model details to applicants.

## Tests

Run:

```bash
npm test
```

Current scenarios cover clear approval, hard decline, manual review, high-LTV counteroffer, high-PTI counteroffer, fraud review, missing data, thin credit with strong cash-flow, high credit with weak cash-flow, and old/high-mileage collateral.

## CU Loan Advisor

The landing page links to `cu-loan-advisor/`, a browser chat workspace for the local `cu-loan-advisor:latest` Ollama model.

Browsers never call Ollama directly. The advisor page calls same-origin dashboard routes:

- `POST /api/advisor/chat`
- `GET /api/ollama/health`

The dashboard backend calls Ollama using:

```bash
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=cu-loan-advisor:latest
```

The advisor starts with a structured loan intake screen for loan type and amount, then asks for the borrower's primary address before moving into chat. Address autocomplete is proxied through the dashboard backend so the Geoapify key is not exposed to browsers:

```bash
GEOAPIFY_API_KEY=your_geoapify_key
```

If the key is missing or Geoapify is unavailable, borrowers can still enter the address manually; that address is marked as unverified in the application context.

For company-wide access, publish the dashboard/backend URL, not the Ollama URL. The backend must be able to reach `OLLAMA_BASE_URL`; that means running the dashboard on the same computer/server as Ollama, using a private tunnel from the hosted backend to the Ollama computer, or moving Ollama to a reachable server. Do not expose Ollama port `11434` directly to the public internet.

## Self-Hosting CU Loan Advisor

Use this mode when the credit-union computer hosts both the dashboard backend and Ollama. Public users access Caddy on HTTPS `443`; Caddy proxies to the dashboard on local port `5192`; the dashboard calls Ollama locally at `127.0.0.1:11434`.

Run once from the repo folder:

```powershell
npm run selfhost:setup -- -Domain cu-loan.goodwinefinancialservices.com -BackendPort 5192
```

Run the elevated setup steps from an Administrator PowerShell window on the host computer:

```powershell
npm run selfhost:setup -- -Domain cu-loan.goodwinefinancialservices.com -BackendPort 5192 -InstallCaddy -ConfigureFirewall -InstallStartupTasks -HardenOllamaLocalhost
```

Manual network steps still happen outside the app:

- Point DNS for the chosen domain to the credit union internet public IP.
- Port-forward TCP `80` and `443` from the router/firewall to the host computer.
- Do not forward TCP `11434`.
- Keep the host on wired internet, plugged in, and configured not to sleep.

Verification:

```powershell
npm run selfhost:verify
npm run selfhost:verify -- -PublicUrl https://cu-loan.goodwinefinancialservices.com -PublicHostOrIp cu-loan.goodwinefinancialservices.com
```

If the public advisor works but raw `http://<public-ip>:11434/api/tags` is unreachable, the intended public/private boundary is working.

## State-Specific Payment Protection Quotes

The single-premium quote tool has separate, locked experiences for the two configured programs:

- Missouri: `/single-premium-quote/missouri/`
- Arkansas: `/single-premium-quote/arkansas/`
- Administration: `/single-premium-quote/admin/`

Users sign in at `/single-premium-quote/`. Administrators can create or deactivate user accounts, assign Missouri and/or Arkansas access, reset passwords, and manage each state's branding, life rates, disability rate table, coverage limits, unsupported loan types, and gross-factor adjustment.

Quote users, sessions, and state program settings are stored in MongoDB. Sessions use HTTP-only cookies and expire after 12 hours.

The first quote administrator is created automatically when the database starts and has no active quote administrator. Configure it with:

```bash
QUOTE_ADMIN_USERNAME=admin
QUOTE_ADMIN_PASSWORD=use-a-long-unique-password
```

If those variables are omitted, the bootstrap account uses `DASHBOARD_USERNAME` (or `admin`) and `DASHBOARD_PASSWORD`. Set a production-specific `QUOTE_ADMIN_PASSWORD` before launch.
