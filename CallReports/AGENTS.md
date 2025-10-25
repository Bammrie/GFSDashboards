Every document uploaded in this /CallReports/ folder will have the same format and fields. Make sure we have the documentation to pull the data from them and format them as needed. This is intended to be a tool for a site on the dashboard called "Prospects" where we are able to see the relevant data for our niche that can be pulled from the call report. Please update this file with more information as it becomes more relevant and built out.

2026-12-19: Normalized the September 2025 and June 2025 call report PDF filenames to `<credit-union>-<year>-q<quarter>.pdf` so the generator produces clean IDs and URLs without spaces.

2025-01-14: Captured indirect production and delinquency source breakouts from the Inspire FCU (6/30/25) and Lion's Share FCU (9/30/23) call reports to feed the Prospects channel exposure tables.
2025-01-13: Parsed the June 30, 2025 Inspire FCU and September 30, 2023 Lion's Share FCU call reports into structured datasets powering the Prospects page (loan mix, delinquency, charge-off, indirect, and allowance metrics).
2026-09-21: Call report uploads now include a matching JSON file that the prospect generator consumes to build detail pages and the shared prospects-data.json payload.

2026-12-15: Uploaded September 2025 call report PDFs for Ascension, Gulf, Maple, and Rave so the generator can ingest them once JSON extracts are ready; browser fetches now bypass cache to recognize new uploads immediately.
