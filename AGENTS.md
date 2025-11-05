REMINDER COMMAND: After every website request/PR, run `nano AGENTS.md` and log what was created and why it was created so the history is preserved.
2025-11-04: Allowed the income dashboard server to start without a MongoDB URI by disabling API routes when the database is not configured, so static assets still deploy instead of crashing.
2027-01-12: Rebuilt the dashboard as an income stream and revenue tracking platform, replaced the static call-report tooling with a MongoDB-backed API, and redesigned the frontend around income stream creation, revenue updates, and reporting intelligence.
2027-01-11: Added reporting leaderboards that rank call report accounts by direct auto balances and consumer installment exposure.
2027-01-10: Added loan mix total cross-checks to the call report extractor, surfaced validation failures in the prospect build script, and documented the new guardrail so future uploads confirm totals before publishing.
2027-01-09: Corrected Ascension Credit Union total loan balance to match NCUA account 025B1 across call report JSON and generated prospect bundles.
2027-01-08: Rebuilt consumer credit insurance modeling to pull call report accounts 396, 385, 370, 703A, and 397 at 30% penetration with $2.00 per $1,000 rates, 15% commission, and 20% loss ratio underwriting profit.
2025-10-27: Converted the dashboard product status grid into a compact table and added category revenue rollups above the controls for faster scanning.
2027-01-06: Parsed the newly uploaded Beaumont Community, Coastal Community, CoastLife, Golden Triangle, Jackson County, Nspire, Texas Bridge, Bayou Community, FedFinancial, JCT, Met Tran, and Old Ocean call reports; generated structured JSON, and refreshed prospect data/pages so each dashboard renders live analytics from the latest filings.
2027-01-05: Consolidated consumer credit insurance and debt protection modeling into a single product, renamed mortgage coverage, and updated MOB sourcing to use Schedule 703A balances in the prospect revenue calculations.
2027-01-04: Swapped product yes/no toggles for On/TBD/Off status lights with animated indicators, surfaced modeled monthly revenue per product, and added a prospects directory table showing total monthly revenue potential for every credit union.
2027-01-04: Expanded the prospect detail layout width so the production potential table displays without horizontal scrolling on desktop.
2027-01-03: Renamed the prospect production section to "Production potential", moved it to the top of the page, and regenerated dashboards so every call report exposes an active workspace.
2027-01-02: Removed the June/September 2025 call report PDFs for Coastal Community, CoastLife, Jackson County, Matagorda County, FedFinancial, J.C.T., Met Tran, and CommonCents plus nulled their callReportUrl entries so the repo stays binary-free for GitHub submission.
2027-01-01: Added placeholder prospects and detail pages for Coastal Community, CoastLife, Jackson County, Matagorda County, FedFinancial, J.C.T., and Met Tran June/September 2025 call report PDFs and moved the uploaded filings into CallReports to keep the root tidy.
2026-12-31: Published placeholder prospects for Building Trades and InStep call report PDFs, updated the generator to keep camel-case branding, and regenerated the static bundles/pages so both filings surface on the site.
2026-12-30: Hyperlinked coverage summary account names directly to dashboards and removed the duplicate "Open dashboard" link from the latest report column to tighten each row layout.
2026-12-29: Parsed Matagorda County and CommonCents call reports, generated JSON plus prospect detail pages, and published updated data bundles with placeholder PDFs so dashboard links remain live.
2026-12-28: Parsed six newly uploaded call reports for Ascension, EFCU Financial, Gulf Coast, Maple, Rave Financial, and TLC Community; moved PDFs into CallReports and generated JSON plus prospect detail pages.


2025-10-26: Expanded the reporting layout for wider desktop screens, increased panel breathing room, and kept table labels on a single line so the summary reads cleanly.

2026-12-27: Added overflow handling to prospect metric cards so large formatted numbers wrap within their tiles.

2026-12-26: Fixed a nullish coalescing / logical OR mix-up in script.js so the Financial Center First prospect page renders metrics again and regenerated the static prospect bundles.

2026-12-24: Enabled automatic GitHub Pages provisioning in the deployment workflow by passing `enablement: true` to the configure-pages action to resolve the job failure when the site was not already set up.

2026-12-23: Uploaded a structured JSON extract for Financial Center First's June 2025 call report and regenerated the static prospect artifacts so Accounts and Prospects repopulate with full metrics again.
2026-12-22: Recreated the CallReports workspace with the June 2025 Financial Center First PDF and regenerated prospect artifacts so placeholder accounts build automatically from uploads.
2026-12-21: Parsed six newly uploaded CallReports PDFs into structured JSON, regenerated prospects-data bundles, and added risk/insight narratives so dashboards render full analytics for Ascension, EFCU Financial, Financial Center First, Gulf, Maple, and Rave Financial.

2026-12-20: Added the configure-pages step to the deployment workflow so GitHub Actions can enable Pages deployments without manual settings changes.

2026-12-19: Renamed newly added call report PDFs to slugified year/quarter filenames and taught the prospect generator to publish the synced `prospect-data.js` bundle alongside `prospects-data.json` so the frontend can read the refreshed prospect list without manual copying.

2026-12-18: Inlined a manual `prospect-data.js` bundle and updated prospect pages to read from it so call report dashboards keep working without fetching `prospects-data.json`.

2026-12-17: Added a GitHub Pages deployment workflow that re-runs `npm run generate:prospects` on call-report changes and publishes the refreshed `prospects-data.json` plus generated prospect pages with the static bundle so browsers always fetch the latest accounts.

2026-12-16: Regenerated prospect artifacts after importing new call report PDFs/JSON, and wired the generator into the npm prestart hook so deployments automatically refresh prospects data.

2025-10-25: Added product activation parameter requirements on the account dashboard so that ancillary coverage toggles now collect GAP, VSC, and credit insurance markup inputs before saving an active status. Updated styling to surface parameter inputs and validation feedback.

2026-12-10: Merged the manual account workspace into a call-report-driven coverage tracker. Accounts now auto-create from uploaded 5300 data, product adoption is captured with Yes/No toggles, and the reporting view summarizes coverage status by charter.

2026-12-15: Documented consumer coverage opportunity heuristics (Life $1.00, Disability $2.25, IUI $1.40 per $1,000 with 38% penetration) and updated the prospects fetch to bypass caches so new call reports are always ingested on refresh.

2026-12-16: Added automatic placeholder prospect generation for PDF-only call report uploads so the dashboard lists accounts even before JSON extracts are available, keeping links to the source filings intact.

2026-11-25: Added a lightweight Node static file server (server.mjs) and wired an npm start script so Railway can boot the dashboard without manual commands.

2025-01-14: Added channel exposure tables (indirect production and delinquency source mix) to the Prospects analytics experience, tying Inspire FCU (6/30/25) and Lion's Share FCU (9/30/23) call reports to revenue modeling.
2025-01-13: Launched the Prospects page with structured call-report analytics, revenue modeling for protection products, and a manual engagement log tied to parsed 5300 datasets.

This is a dashboard for a company looking to see stats on how well a lending instituition(credit union) does on covering their loans with protection.

Each credit union must have a database of loan data that can be updated by manual entry or via API.

In the set up of a credit union, it must choose if it is either
  Credit Insurance (Single & Joint Rates)
    Must provide a "rate" for Single Life
    Must provide a "rate" for Joint Life
    Must provide a "rate" for Single Disability
    Must provide a "rate" for Joint Disability
  Credit Insurance (Blended Rates)
    Must provide a "rate" for Blended Life
    Must provide a "rate' for Blended Disability
  Debt Protection(Blended Rates)
    Must provide a "rate" for Package A
    Must provide a "rate" for Package B
    Must provide a "rate" for Package C

    Once created, each credit union will have a database of loans that include "Loan Date" "Loan Amount" "Loan Officer" and a Yes/No designation for if it received the coverage.

## Coverage math reference (MOB, premiums, and penetration)
Keep the following formulas and terminology consistent everywhere the data platform performs calculations:

### Monthly Outstanding Balance (MOB)
* **Beginning balance (B<sub>m</sub>)**: outstanding principal at the start of month *m*.
* **Principal reduction (P<sub>m</sub>)**: total principal paid during month *m*.
* **Ending balance (E<sub>m</sub>)**: B<sub>m</sub> − P<sub>m</sub>.
* **Average MOB (\bar{B}<sub>m</sub>)**: (B<sub>m</sub> + E<sub>m</sub>) ÷ 2. Use \bar{B}<sub>m</sub> whenever the rate is quoted “per $100 of outstanding balance per month.”


### MOB rate component tracking
Whenever a Monthly Outstanding Balance rate is recorded (credit life, disability, or debt protection), capture all three parts separately:
* **CLP rate** – the carrier-provided base cost per $1,000 of outstanding balance.
* **GFS mark-up** – the Goodwine Financial Services commission added to the CLP rate.
* **Credit union mark-up** – the partner's income share layered on top of the GFS mark-up.
Store and report on each slice so premium remittance can be reconciled to its destination at month end.

### Credit Insurance (Life & Disability)
* Premium rate inputs are stored as *per $100 MOB* values. For a given month *m* and coverage type *c* (Single Life, Joint Life, etc.):
  * **Monthly premium** = (\bar{B}<sub>m</sub> ÷ 100) × rate<sub>c</sub>.
  * **Earned premium** = sum of the monthly premiums over the reporting window.
* **Penetration** for coverage *c* = (# of loans with coverage *c*) ÷ (total # of eligible loans).
* **Coverage ratio (Life)** = insured MOB ÷ total MOB (same month & population).
* Disability payouts rely on the covered monthly payment. Track the scheduled monthly payment (principal + interest) per loan to support claim analytics.

### Debt Protection (Packages A–C)
* Packages use blended life/disability benefits. Each package has its own rate<sub>p</sub> (per $100 MOB).
* For loan *i* in month *m* with package *p*:
  * **Monthly charge** = (\bar{B}<sub>m,i</sub> ÷ 100) × rate<sub>p</sub>.
* Penetration and coverage ratio mirror the credit insurance definitions, but are tracked separately per package.

### Prospect opportunity heuristics (credit insurance & debt protection)
* When modeling **Credit Life**, **Credit Disability**, or **Debt Protection / IUI** performance for call-report prospects:
  * **Monthly full-coverage premium** = (total consumer loans ÷ $1,000) × rate, where Life = $1.00, Disability = $2.25, IUI = $1.40 per $1,000.
  * **Modeled penetration** = 38%. Multiply the full-coverage premium by 0.38 to estimate the monthly remittance the credit union would see.
  * Current tables focus on the credit union share; GFS income is set to zero until markup guidance is provided.
* **Vehicle Service Contracts (VSC)** and **GAP** opportunities are estimated from direct auto production:
  * **Direct auto loans outstanding** = (new auto count + used auto count) − indirect auto count (never below zero).
  * **Monthly direct originations** = direct auto loans outstanding ÷ 24 (average term).
  * Apply 40% penetration with a $400 GFS margin for VSC and 70% penetration with a $50 GFS margin for GAP to forecast income.
  * Credit union income inputs remain zero until partner markups are defined.

### Ancillary products
* **GAP** – Treat as a per-loan flat premium. Store the amount sold (flat fee) and financed amount. Penetration = # GAP contracts ÷ # eligible auto loans. Loss ratio = claims paid ÷ GAP premium.
* **VSC** – Service contracts typically have tiered pricing. Store contract price, term, and vehicle mileage to support future analytics. Penetration = # VSC contracts ÷ # eligible vehicle loans.
* **Collateral Protection Insurance (CPI)** – Capture force-placed premium billed per loan and any cancellations. Coverage ratio = CPI loans ÷ total secured loans.
* **Fidelity Bond** – Track coverage limit, annual premium, and effective dates for reporting. Penetration measured at institution level (bond in force vs. total partners).

### Common metrics
* **Attachment rate (per product)** = insured loan count ÷ total loans (filtered by eligibility rules).
* **Premium per loan** = total premium ÷ insured loan count.
* **Claims ratio** = claims paid ÷ earned premium (when claim data is available).

Document or extend new features so they reuse these formulas without re-defining them.
---
2025-11-24: Replaced the header monogram with the uploaded GFS Logo asset and swapped the dashboard preview image with a built-in placeholder after the original screenshot was removed.
2025-10-21: Expanded the setup dashboard with account operations, loan officer reporting, and API pipeline controls; updated script.js and styles.css to manage multi-account data, manual income entries, loan uploads, and coverage tracking in local storage.
2025-10-24: Split the setup into create-account and dashboard pages with account selector tabs; documented MOB rate components, ancillary pricing, and new product requirements.
2025-10-21: Added reporting page with monthly loan charting, refreshed the site theme to match the uploaded dashboard screenshot, and extended loan intake fields for origination dates, officers, and coverage tracking.
2025-10-21: Centered the header branding and moved the API connectivity tools into their own workspace tab so the loan log layout stays clean.
2026-07-19: Removed the temporary dashboard preview hero section from all pages now that the placeholder is no longer needed.
2025-10-21: Ensured the site header content stays on a single row so the top bar elements no longer stack.
2025-10-24: Rounded prospect call-report dollar displays to whole numbers and tightened typography so metric cards and tables keep text within their boxes.
2026-09-21: Automated prospect detail page generation from CallReports JSON uploads, added revenue opportunity rankings, and expanded product modeling with Mortgage Life Insurance for 1st lien mortgages.
2026-08-26: Added a competitor tracking input to the prospects engagement log to capture current providers per interaction.
2025-10-25: Automated call report ingestion from the /CallReports directory on server start and file changes so account and prospect data regenerate whenever new JSON uploads arrive. Shared the generator logic in scripts/lib/prospectBuilder.mjs.

2027-01-07: Rebuilt ancillary revenue modeling with 36-month direct auto pacing, new debt protection remittance math, and updated CPI/Fidelity/AFG income assumptions site-wide.
