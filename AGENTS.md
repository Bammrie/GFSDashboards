2029-02-12: Focused the UI on the quote-only service, added quote client 
management in the quotes directory, and opened quote APIs for public 
access.
2029-02-11: Scoped top navigation visibility to the workspace selected 
on the landing page, redirecting mismatched routes so Quotes and 
Accounts stay isolated. 2029-02-10: Replaced the index redirect with 
a two-button gateway separating Account Management (password protected) 
from Product Quotes, and scoped auth to account/reporting routes. 
2029-02-08: Moved the Menu Pricing dialog and actions from the account 
workspace into the quote workspace so pricing stays with quoting 
workflows. 2029-02-07: Prevented empty Menu Pricing autosaves from 
overwriting stored MOB rates when toggling blended/unblended coverage 
setups. 2029-02-06: Added coverage request send receipts in Quotes (UI + 
API) so the last sent details display for loan officers. 2029-02-05: 
Added a config endpoint plus quote workspace webhook target copy so 
coverage requests show the active Zapier destination. 2029-02-02: Added 
toast notification styling and a success toast in the quote workspace 
coverage request flow so confirmations stand out. 2029-01-18: Removed 
the Menu Pricing warranty fetch UI so only VSC/GAP markups and MOB rates 
remain, and added an explicit save action to persist pricing inputs to 
the database. 2029-01-16: Synced quote workspace pricing defaults to the 
persisted menu pricing config when loading quotes. 2029-01-17: Ensured 
hidden form sections stay hidden so MOB pricing only shows applicable 
rate groups. 2029-01-14: Added a configurable coverage request webhook 
fallback so quotes can send requests directly when the backend endpoint 
is unavailable, and clarified UI feedback for backend vs. webhook sends. 
2029-01-14: Removed the Training page, its navigation entry, and 
training-frequency summary content now that the view is no longer used. 
2029-01-15: Ensured quotes reuse persisted Menu Pricing MOB rates by 
falling back to stored credit union configs when menu pricing inputs are 
unavailable. 2029-01-13: Added a coverage request payload preview in the 
quote workspace so Zapier JSON updates are visible as inputs change. 
2029-01-12: Removed Baycel-only gating from coverage request 
availability and submit flow so any selected credit union can request 
coverage. 2029-01-11: Prioritized the coverage request flow in the quote 
workspace, added loan ID + member response tracking in the sales 
register, and expanded the Zapier request payload with loan details and 
term extension options. 2029-01-10: Expanded coverage request webhook 
payload metadata (coverage summary, detailed options, timestamp) and 
added a phrase fallback for Zapier diagnostics. 2029-01-09: Normalized 
Baycel coverage request gating to use case-insensitive name checks and 
clarified blocked messaging in the UI. 2029-01-09: Added a coverage 
request API endpoint that forwards Zapier webhook payloads and updated 
the UI to post locally for Podium coverage requests. 2029-01-08: 
Expanded the Baycel coverage request webhook payload with member 
contact, loan amount, coverage options, and a summary phrase for 
Zapier/Podium workflows. 2029-01-07: Added a Baycel Federal Credit Union 
coverage request form in Quotes that posts a Zapier webhook payload with 
member contact details and coverage options for Podium texting tests. 
2029-01-06: Added Quotes navigation plus dedicated quotes list/workspace 
with a sales register flow so quoting is separated from Accounts while 
Menu Pricing stays in Accounts. 2025-03-20: Added MongoDB loan log model 
and /api/loans CRUD endpoints plus account workspace loan log form so 
loan entries and coverage selections sync across users. 2029-01-05: 
Synced MOB blended rate visibility to hide single/joint inputs and 
persisted menu pricing configs in MongoDB so updates sync across users. 
2026-01-15: Hid Menu Pricing MOB rate inputs until coverage type and 
rate structure are selected, adding single/joint debt protection rate 
fields for complete pricing setup. 2028-09-20: Moved the Menu 
Presentation VIN decode card to the right of loan details and added a 
personal loan calculator for credit insurance/debt protection scenarios. 
2028-09-15: Preserved the year end review PDF logo proportions so the 
header branding stays true to the original dimensions. 2028-09-16: 
Repositioned Menu Pricing so MOB coverage sits on its own top row with 
the remaining pricing cards aligned together for faster review. 
2028-09-15: Refined the year end review PDF layout with cleaner 
print-friendly styling for client review meetings. 2028-09-15: 
Reorganized the Menu Presentation payment quoter layout so coverage 
options stay on their own row with a clearer summary block. 2026-01-11: 
Added MOB credit insurance/debt protection setup and declining balance 
premium estimates to the payment illustration and menu pricing controls. 
2028-09-13: Renamed the payment illustration heading to Coverage 
Selection to align menu presentation labeling. 2028-09-14: Expanded the 
Menu Presentation coverage section with enhanced maroon gradients and 
payment combination cards for every coverage bundle. 2028-09-12: Added 
term extension controls to Menu Pricing and a dual-option payment 
illustration so menu presentations show standard vs extended terms. 
2028-09-09: Renamed the loan officer coverage illustration panel to Menu 
Presentation and moved GAP/VSC pricing inputs into the Menu Pricing 
dialog alongside Call Reports to keep the workspace uncluttered. 
2028-09-08: Allowed VIN decode clean message variants so newer NHTSA 
responses are treated as successful decodes. 2026-01-10: Improved 
subtitle contrast on light panels, surfaced VIN decode Make/Model/Year 
results, and moved the account change log into a dialog for cleaner 
workflows. 2028-09-07: Updated the VIN decoder to use the NHTSA 
DecodeVin endpoint with validation and clearer errors. 2028-09-06: 
Expanded the account selection panel to span the full workspace width 
while keeping the back link aligned top-left. 2026-01-10: Restyled the 
UI with a maroon/black/white palette and sharp-cornered panels/buttons 
to deliver a crisper financial look. 2026-01-10: Renamed coverage and 
year end review headings, moved account notes into a modal, and 
repositioned the coverage panel under account selection for the account 
workspace layout update. 2028-09-05: Expanded the account workspace 
panels to a two-column layout while keeping the loan officer 
illustration full width. 2028-09-03: Added GAP pricing inputs and 
coverage selection toggles to the loan officer illustration so VSC/GAP 
payment deltas can be compared. 2028-09-02: Moved the loan officer 
coverage illustration panel to the bottom of the account workspace so 
the new loan calculator stays out of focus until launch. 2028-09-01: 
Added the Training page to summarize year end review training 
frequencies with monthly cadence rollups. 2026-02-14: Grouped 
frontend/backend revenue lines under each product row in the account 
workspace and added backend tracking for VSC to keep coverage views 
concise. 2026-01-08: Added a year end review PDF download button that 
generates a branded report with the credit union details for sharing. 
2026-01-08: Updated the year end review worksheet fields (training 
frequency, income/incentives split, term extensions, integration 
options) and refreshed the PDF logo layout for client printouts. 
2025-03-18: Added a dedicated last reported month column to the Accounts 
directory, aligned the latest assets/consumer lending amounts, and 
highlighted the month label for easier scanning. 2025-03-07: Split the 
Accounts directory into Accounts/Prospects tabs, added move buttons for 
reclassifying entries, and filtered out the duplicate CoastLife record 
when CoastLife CU is present. 2028-08-24: Added classification controls 
in the Accounts directory so each credit union can be marked as a 
prospect or a full account, persisting the choice in the API. 
2028-08-25: Grouped the Income Streams page by credit union and added a 
filter dropdown so teams can focus on a single account’s streams. 
2025-11-21: Split Accounts into a directory landing page and a dedicated 
workspace page so the overview stays separate from account detail work. 
2025-11-21: Reordered the site navigation to lead with Accounts and 
added an Accounts directory table with status lights and latest call 
report assets. 2025-11-21: Added an asset growth chart to the Accounts 
call report dialog so assets display over time. REMINDER COMMAND: After 
every website request/PR, run `nano AGENTS.md` and log what was created 
and why it was created so the history is preserved. 2025-10-31: Moved 
the account selection dropdown into the header row, removed the 
coverage-creation helper line, relocated the asset growth chart into the 
main workspace beside active lines, and made Account Details span full 
width to streamline the layout. 2026-01-10: Added the loan officer 
coverage illustration panel with loan payment calculator, VIN decoder, 
and warranty markup inputs to preview member pricing. 2027-01-30: 
Widened the accounts workspace and income stream table so desktop 
layouts can display more columns without wrapping while keeping the page 
compact. 2027-01-29: Added the ability to update an income stream's 
first reporting month and rebuild reporting requirements from the new 
start date. 2027-01-28: Added call report deletion controls (API + UI) 
so uploads can be removed after parser tweaks. 2028-05-21: Swapped the 
call report upload table to display direct consumer lending totals 
instead of indirect loan balances to match the desired view. 2025-11-21: 
Moved call report tooling into a modal, added account-level notes 
capture, and tightened indirect loan extraction to avoid false 
positives. 2025-11-20: Sorted call reports chronologically in the 
account dashboard so graphs and tables follow quarter/year order instead 
of upload order. 2025-11-19: Rebuilt Reporting into a missing-revenue 
workspace, added call report upload/extraction to account dashboards, 
and removed the standalone Revenue Updates tab while keeping revenue 
entry inline. 2027-01-27: Removed commission-only income stream options 
for GAP and Debt Protection and tightened page spacing so more content 
stays visible without scrolling. 2027-01-26: Added a startup backfill 
that sets missing income stream statuses to active and regenerates 
reporting requirements so historical revenue reappears. 2027-01-25: 
Restored prospects.html as a redirect to Accounts to resolve merge 
conflicts and keep legacy links working. 2027-01-24: Finished the 
Accounts-only workflow so creation happens from a single 
drop-down-driven workspace, restored existing active streams as locked 
green lights, and wired first-report month persistence into the 
reporting requirement generator. 2027-01-23: Replaced the Prospects grid 
with the Accounts workspace so each product/revenue type shows 
red/yellow/green lights tied to income streams, added first-report month 
tracking, and routed all stream creation through the new page. 
2025-11-19: Reworked the Prospects experience into an account-level 
coverage tracker so each credit union lists every product with 
Active/Prospect checkboxes that stay synced with existing income 
streams. 2027-01-22: Enabled adding a new credit union directly from the 
Prospects page by reusing the add dialog so partners can be created 
before logging prospect income streams. 2025-11-17: Added a prospect 
income stream workspace with monthly estimate tracking, activation into 
active reporting, and navigation to the new page. 2027-01-21: Linked the 
reporting credit union totals to a new detail view that lists each 
income stream with its revenue and share of the selected window, adding 
percentages to highlight contribution mix. 2027-01-20: Surfaced total 
monthly revenue on the Monthly Totals grid and added a revenue trend 
chart to stream detail pages so teams can review performance in-page. 
2027-01-19: Moved the monthly completion tracker into a dedicated 
Monthly Totals tab, added a detail view with per-stream rankings, and 
exposed a monthly totals API. 2027-01-18: Added a monthly reporting 
completion tracker that aggregates active income streams per month, 
exposes a percent complete API, and highlights months that reach full 
coverage in the reporting view. 2027-01-17: Added income stream 
cancellation controls with a final reporting month selector and enabled 
editing monthly revenue directly from the reporting grid, persisting 
updates in MongoDB. 2027-01-16: Synced reporting requirements with 
historical revenue entries so prior months like October 2025 show as 
completed once their revenue was logged. 2027-01-15: Added required 
monthly reporting scaffolding for every income stream, auto-generated 
periods back to Jan 2023, and built the stream detail red/green status 
view so duplicate or missing revenue entries are prevented. 2027-01-14: 
Updated select dropdown option colors to a dark navy on white so the 
menu text stays readable against the browser default background. 
2027-01-13: Added HTTP basic authentication with the adminpass 
credential to block search engine indexing, split the single-page app 
into dedicated Income Streams, Revenue Updates, and Reporting pages with 
a credit union filter on reporting, and refreshed typography colors for 
better contrast. 2025-11-04: Allowed the income dashboard server to 
start without a MongoDB URI by disabling API routes when the database is 
not configured, so static assets still deploy instead of crashing. 
2027-01-12: Rebuilt the dashboard as an income stream and revenue 
tracking platform, replaced the static call-report tooling with a 
MongoDB-backed API, and redesigned the frontend around income stream 
creation, revenue updates, and reporting intelligence. 2027-01-11: Added 
reporting leaderboards that rank call report accounts by direct auto 
balances and consumer installment exposure. 2027-01-10: Added loan mix 
total cross-checks to the call report extractor, surfaced validation 
failures in the prospect build script, and documented the new guardrail 
so future uploads confirm totals before publishing. 2027-01-09: 
Corrected Ascension Credit Union total loan balance to match NCUA 
account 025B1 across call report JSON and generated prospect bundles. 
2027-01-08: Rebuilt consumer credit insurance modeling to pull call 
report accounts 396, 385, 370, 703A, and 397 at 30% penetration with 
$2.00 per $1,000 rates, 15% commission, and 20% loss ratio underwriting 
profit. 2025-10-27: Converted the dashboard product status grid into a 
compact table and added category revenue rollups above the controls for 
faster scanning. 2027-01-06: Parsed the newly uploaded Beaumont 
Community, Coastal Community, CoastLife, Golden Triangle, Jackson 
County, Nspire, Texas Bridge, Bayou Community, FedFinancial, JCT, Met 
Tran, and Old Ocean call reports; generated structured JSON, and 
refreshed prospect data/pages so each dashboard renders live analytics 
from the latest filings. 2027-01-05: Consolidated consumer credit 
insurance and debt protection modeling into a single product, renamed 
mortgage coverage, and updated MOB sourcing to use Schedule 703A 
balances in the prospect revenue calculations. 2027-01-04: Swapped 
product yes/no toggles for On/TBD/Off status lights with animated 
indicators, surfaced modeled monthly revenue per product, and added a 
prospects directory table showing total monthly revenue potential for 
every credit union. 2027-01-04: Expanded the prospect detail layout 
width so the production potential table displays without horizontal 
scrolling on desktop. 2027-01-03: Renamed the prospect production 
section to "Production potential", moved it to the top of the page, and 
regenerated dashboards so every call report exposes an active workspace. 
2027-01-02: Removed the June/September 2025 call report PDFs for Coastal 
Community, CoastLife, Jackson County, Matagorda County, FedFinancial, 
J.C.T., Met Tran, and CommonCents plus nulled their callReportUrl 
entries so the repo stays binary-free for GitHub submission. 2027-01-01: 
Added placeholder prospects and detail pages for Coastal Community, 
CoastLife, Jackson County, Matagorda County, FedFinancial, J.C.T., and 
Met Tran June/September 2025 call report PDFs and moved the uploaded 
filings into CallReports to keep the root tidy. 2026-12-31: Published 
placeholder prospects for Building Trades and InStep call report PDFs, 
updated the generator to keep camel-case branding, and regenerated the 
static bundles/pages so both filings surface on the site. 2026-12-30: 
Hyperlinked coverage summary account names directly to dashboards and 
removed the duplicate "Open dashboard" link from the latest report 
column to tighten each row layout. 2026-12-29: Parsed Matagorda County 
and CommonCents call reports, generated JSON plus prospect detail pages, 
and published updated data bundles with placeholder PDFs so dashboard 
links remain live. 2026-12-28: Parsed six newly uploaded call reports 
for Ascension, EFCU Financial, Gulf Coast, Maple, Rave Financial, and 
TLC Community; moved PDFs into CallReports and generated JSON plus 
prospect detail pages.


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

2025-11-10: Enabled negative revenue entries across the UI and API so refunds can be logged as negative amounts.
2025-11-20: Added call report metric extraction (assets, income, loan segments, indirect balances) with dashboard trends and quarter coverage grids back to 2020 after updating the parser for the Ascension September 2025 template.

2025-11-19: Corrected call report field mapping to the uploaded Ascension template (assets, income totals, loan segments, indirects).
2025-11-21: Updated the account directory to drop cents from asset displays and show the latest consumer lending total alongside assets.

2026-01-07: Added year end review fields and an account change log section on the account workspace to support annual reviews and audit history.

2028-09-04: Condensed the account workspace coverage section into an add-only product list and shifted the workspace into a two-column layout to reduce scrolling.
2028-09-08: Updated panel subheader colors to maroon/black so headings stay readable on white panels.

2028-09-10: Updated Menu Presentation payment illustration text color to white for readability on maroon background.

2028-09-11: Grouped the top navigation into Main vs. Income & Reporting sections, moved the Income Streams screen to income-streams.html, and set the dashboard root to load Accounts by default.
2028-09-17: Added shared API persistence for account reviews, notes, and change logs so workspace activity syncs across users.
2028-09-18: Condensed the Menu Presentation VIN decoder into a smaller, standalone row to tighten the layout.

2028-09-19: Moved Menu Presentation coverage options into a Protection 
Options dialog so only loan details and VIN decode remain visible until 
required fields are completed. 2025-03-19: Updated Menu Pricing MOB rate 
visibility so rate inputs stay hidden until coverage type and rate 
structure are explicitly selected. 2025-03-21: Added loan illustration 
snapshots with saved Menu Presentation scenarios, plus the MongoDB 
model, API endpoints, and UI history list to reopen quotes. 2029-02-01: 
Preserved coverage request success feedback and clarified the Zapier 
send confirmation text so loan officers see a visible send status in 
quotes.
2029-02-03: Adjusted form control sizing so quote workspace inputs stay within their panels and remain responsive.
2029-02-04: Re-rendered account/quote workspaces after warranty configs load so Menu Pricing inputs hydrate from MongoDB instead of resetting on open.

2029-02-09: Added a static prospects-data fallback for account directory loading so the Accounts list still populates when the credit union API is unavailable.
