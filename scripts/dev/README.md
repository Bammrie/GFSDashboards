# Call report extraction helpers

- `extract_call_reports.py` now captures the “Total Loans & Leases” row directly from Schedule A and compares it to the summed product balances.
- The extractor also compares the schedule total to the Statement of Financial Condition net loans line when it is present.
- Any mismatch beyond a $5 tolerance raises an error so ingestion stops before generating prospect assets. Re-run the extractor after adding PDFs to ensure the check passes before publishing updates.
