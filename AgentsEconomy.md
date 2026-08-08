# GFS Agent Economics Reference

This file documents how Goodwine Financial Services (GFS) makes money at credit-union accounts and defines the account-level inputs the dashboard should maintain when calculating production, revenue, underwriting economics, reserve income, and total account value.

The purpose is to give future developers and AI agents a durable source of truth for implementing GFS economics in the Dashboard and goodwinefinancialservices.com.

## Core Principle

GFS deal economics are account-specific. Do **not** assume that two credit unions have the same commission structure, markup, reinsurance arrangement, experience refund, reserve requirement, or administration fee.

Production and GFS income are separate concepts. The system must first capture an account's production and then apply that account's specific Deal Economics Profile to determine what GFS actually earns.

There are four primary GFS income streams. The economics currently documented are MOB, VSC, and GAP. Additional/fourth-stream rules should be added here when defined.

---

# 1. MOB — Monthly Outstanding Balance

MOB stands for **Monthly Outstanding Balance**. It refers to life and disability insurance that a credit union can sell on loans. Premium is charged based on the outstanding monthly loan balance.

GFS, as the agent, may have the ability to reinsure this business.

There are two important structures:

1. **GFS retains the reinsurance economics.** GFS receives the underwriting profit and bears the underwriting losses.
2. **Experience Refund arrangement.** The credit union receives the applicable remaining profit, after the contractual administration economics and reserve requirements are applied.

Because of this, MOB income must not be modeled as a simple commission percentage.

## MOB Account Inputs

Each credit union's MOB Deal Economics Profile should support the following parameters:

- **Monthly Premium Collected** — monthly production input.
- **Insurance Company Admin Fee** — carrier/insurance-company administration fee applicable to the account.
- **Up Front Commission** — commission paid to GFS upfront.
- **Experience Refund Active?** — Yes/No.
- **Active Reserve Requirement** — required when an Experience Refund is active.
- **GFS Admin Fee** — required when applicable to the Experience Refund structure. This represents the administration economics retained/guaranteed to GFS before remaining funds become available to the credit union. The overall administration structure can include the insurance-company admin fee, upfront commission, and the additional economics retained by GFS.
- **Monthly Claims** — actual claims for the month.
- **APR Earned on Minimum Balance / Reserve** — annual investment/yield assumption earned on the required minimum balance or reserve.

## MOB Economic Flow

Conceptually, the dashboard should understand the following layers:

**Premium Collected → Carrier/Admin Economics → GFS Guaranteed Economics → Claims → Reserve → Investment Income → Remaining Underwriting / Experience Refund Economics**

The exact calculation must be driven by the individual account's Deal Economics Profile rather than a universal hard-coded formula.

## EFCU Example

EFCU's Life coverage example illustrates why retail rate, CLP rate, credit-union markup, and GFS economics must be stored separately.

- **Retail Rate:** $1.99
- **Credit Union Markup:** $0.99
- **CLP Rate:** $1.00
- **Insurance Company Admin Fee:** 12.5% of the $1.99 retail rate
- **Up Front Commission:** 6% of the retail rate
- The insurance-company admin fee plus upfront commission creates an **18.5% retail-rate administration layer**.
- **Actual GFS Admin Fee:** 22.5% of the retail rate under the account's economics.
- Under the described EFCU deal structure, these economics result in **10% of the retail rate being GFS income**.

Important: preserve the distinction between the **$1.99 retail rate**, **$1.00 CLP rate**, and **$0.99 CU markup**. Do not collapse these into one rate.

The EFCU example is an account-specific example and should not become the default formula for other credit unions.

## MOB Reporting Goal

Once the account parameters and monthly actuals are known, the dashboard should be capable of determining GFS's actual economic result for that credit union and month, including the applicable guaranteed/admin income, claims/underwriting position, reserve economics, and investment income.

---

# 2. VSC — Vehicle Service Contracts

For VSC, the dashboard currently needs to know:

## Monthly Production

- **Number of VSCs Sold**

## Account Deal Parameters

- **GFS / Current Markup per VSC**
- **Credit Union Markup per VSC**

At the basic markup level:

**GFS Markup Income = VSC Units Sold × GFS Markup per Contract**

**Credit Union Markup Income = VSC Units Sold × CU Markup per Contract**

Example: if 50 VSCs are sold and GFS's markup is $400 per VSC, gross GFS markup income is $20,000.

Do not assume that markup is necessarily the complete long-term VSC economics if additional reinsurance, underwriting, reserve, investment-income, or profit-sharing rules are subsequently defined. Add those rules to this file when established.

---

# 3. GAP

For GAP, the dashboard currently needs to know:

## Monthly Production

- **Number of GAP Policies Sold**

## Account Deal Parameters

- **GFS Markup per GAP Policy**
- **Credit Union Markup per GAP Policy**

At the basic markup level:

**GFS Markup Income = GAP Units Sold × GFS Markup per Policy**

**Credit Union Markup Income = GAP Units Sold × CU Markup per Policy**

As with VSC, additional underwriting, reserve, investment-income, reinsurance, or profit-sharing economics should be modeled separately if/when they apply to a particular account.

---

# 4. Additional Primary Income Stream

GFS has four main income streams. The fourth stream's detailed economic rules have not yet been defined in this reference. Do not invent its calculation. Add its production inputs and Deal Economics Profile fields here once they are established.

---

# Recommended Dashboard Architecture

Every Client should have an account-specific **Deal Economics Profile** stored independently from monthly production.

Conceptually:

**Credit Union → Product → Monthly Production → Account Deal Economics → GFS Income Calculation**

For example:

**EFCU → MOB → July 2026 → Monthly Premium / Claims → EFCU MOB Deal Profile → GFS Economic Result**

The same architecture should allow another credit union to use completely different economics without changing application code.

## Separate Static Deal Parameters From Monthly Actuals

### Deal Parameters

Values that generally persist until the contract/deal changes, such as:

- Insurance company admin fee
- Upfront commission
- Experience refund status
- Reserve requirement
- GFS admin fee
- Reserve APR
- GFS VSC markup
- CU VSC markup
- GFS GAP markup
- CU GAP markup

### Monthly Actuals

Values entered/imported for a reporting month, such as:

- MOB premium collected
- MOB claims
- VSC units sold
- GAP units sold

This separation is important. Historical months should continue to use the deal economics that were effective for those months if an account's economics later change.

## Effective Dating

Deal Economics Profiles should ultimately support effective dates/versioning so a contract change does not rewrite historical economics.

Example:

- EFCU MOB Deal Version A: effective 2026-10-01 through 2027-09-30
- EFCU MOB Deal Version B: effective 2027-10-01 onward

Monthly calculations should select the deal version effective during that production month.

---

# Development Rule

**Never infer missing account economics.**

If a required parameter is unknown, the dashboard should identify the economic calculation as incomplete rather than silently applying another credit union's assumptions or a global default.

This file should be updated whenever GFS defines a new revenue rule, product structure, reinsurance arrangement, reserve requirement, markup structure, experience-refund structure, or other material account-level economic term.