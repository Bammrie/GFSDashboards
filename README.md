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
