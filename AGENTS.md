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
