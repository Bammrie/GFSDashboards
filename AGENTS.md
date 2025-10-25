REMINDER COMMAND: After every website request/PR, run `nano AGENTS.md` and log what was created and why it was created so the history is preserved.

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
