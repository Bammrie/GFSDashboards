import json
import re
from pathlib import Path
from typing import Dict, List, Tuple

import pdfplumber

ROOT = Path(__file__).resolve().parents[2]
CALL_REPORTS_DIR = ROOT / 'CallReports'

LOAN_MIX_ORDER: List[Tuple[str, str, str]] = [
    ('creditCard', 'Unsecured Credit Card Loans', 'Unsecured credit card'),
    ('student', 'Non-Federally Guaranteed Student Loans', 'Non-federally guaranteed student'),
    ('otherUnsecured', 'All Other Unsecured Loans/Lines of Credit', 'All other unsecured'),
    ('newVehicle', 'New Vehicle Loans', 'New vehicle'),
    ('usedVehicle', 'Used Vehicle Loans', 'Used vehicle'),
    ('leases', 'Leases Receivable', 'Leases receivable'),
    ('otherSecured', 'All Other Secured Non-Real Estate Loans/Lines of Credit', 'Other secured non-real estate'),
    ('firstMortgage', 'Loans/Lines of Credit Secured by a First Lien', '1st lien residential real estate'),
    ('juniorMortgage', 'Loans/Lines of Credit Secured by a Junior Lien', 'Junior lien residential real estate'),
    ('otherNonCommercialRE', 'All Other Non-Commercial Real Estate Loans/Lines of Credit', 'Other non-commercial real estate'),
    ('commercialRE', 'Commercial Loans/Lines of Credit Real Estate Secured', 'Commercial real estate'),
    ('commercialOther', 'Commercial Loans/Lines of Credit Not Real Estate Secured', 'Commercial & industrial'),
]

DELINQ_KEYS = [
    ('creditCard', 'Unsecured Credit Card Loans', 'Credit card'),
    ('otherUnsecured', 'All Other Unsecured Loans/Lines\nof Credit', 'All other unsecured'),
    ('usedVehicle', 'Used Vehicle Loans', 'Used vehicle'),
    ('otherSecured', 'All Other Secured Non-Real\nEstate Loans/Lines of Credit', 'Other secured non-real estate'),
    ('firstMortgage', 'Secured by 1st Lien on a single', '1st lien residential real estate'),
    ('juniorMortgage', 'Secured by Junior Lien on a single', 'Junior lien residential real estate'),
]

CHARGEOFF_KEYS = [
    ('creditCard', 'Unsecured Credit Card Loans', 'Credit card'),
    ('otherUnsecured', 'All Other Unsecured Loans/Lines of Credit', 'All other unsecured'),
    ('newVehicle', 'New Vehicle Loans', 'New vehicle'),
    ('usedVehicle', 'Used Vehicle Loans', 'Used vehicle'),
    ('otherSecured', 'All Other Secured Non-Real Estate Loans/Lines of Credit', 'Other secured non-real estate'),
]

INDIRECT_ROWS = [
    ('auto', 'New and Used Vehicle Loans'),
    ('other', 'All Other Loans'),
]

QUARTER_LOOKUP = {
    'q1': ('March 31', 3),
    'q2': ('June 30', 6),
    'q3': ('September 30', 9),
    'q4': ('December 31', 12),
}

MONTH_LOOKUP = {
    'march': ('March 31', 3),
    'june': ('June 30', 6),
    'september': ('September 30', 9),
    'december': ('December 31', 12),
}


def slugify_file_stem(file_stem: str) -> str:
    slug = re.sub(r'[^a-z0-9]+', '-', file_stem.lower()).strip('-')
    return slug


def parse_number(value: str) -> int:
    if value is None:
        return 0
    cleaned = value.replace('$', '').replace(',', '').replace('\u2212', '-').strip()
    if not cleaned:
        return 0
    if cleaned.startswith('(') and cleaned.endswith(')'):
        cleaned = '-' + cleaned[1:-1]
    try:
        return int(float(cleaned))
    except ValueError:
        return 0


def parse_rate(value: str) -> float:
    if value is None:
        return 0.0
    cleaned = value.strip().replace('%', '')
    if not cleaned:
        return 0.0
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def extract_name_charter(clean_pages: List[str]) -> Tuple[str, str]:
    for text in clean_pages:
        if 'Credit Union Name:' in text and 'Federal Charter/Certificate Number:' in text:
            after = text.split('Credit Union Name:')[1]
            name_part, rest = after.split('Federal Charter/Certificate Number:')
            name = ' '.join(name_part.strip().split())
            charter_match = re.search(r'(\d+)', rest)
            charter = charter_match.group(1) if charter_match else ''
            if name:
                return title_case(name), charter
    return '', ''


def title_case(value: str) -> str:
    return ' '.join(word.capitalize() if word.isupper() else word for word in value.split())


def extract_tables_with_marker(pdf: pdfplumber.PDF, marker: str) -> List[List[List[str]]]:
    for page in pdf.pages:
        text = page.extract_text() or ''
        if marker in text:
            return page.extract_tables()
    return []


def parse_loan_mix(
    pdf: pdfplumber.PDF,
) -> Tuple[Dict[str, Dict], int, int, Dict[str, int]]:
    tables = extract_tables_with_marker(pdf, 'SECTION 1 - LOANS AND LEASES')
    rows: List[List[str]] = []
    reported_total = {'count': 0, 'balance': 0}
    extras_count = 0
    extras_amount = 0
    finished = False
    for table in tables:
        if finished:
            break
        for row in table:
            if len(row) < 6:
                continue
            joined = ' '.join(filter(None, row))
            normalized = joined.upper()
            if 'TOTAL LOANS' in normalized and 'LEASES' in normalized:
                count_value = row[3] if len(row) > 3 else ''
                amount_value = row[5] if len(row) > 5 else ''
                reported_total['count'] = parse_number(count_value)
                reported_total['balance'] = parse_number(amount_value)
                finished = True
                continue
            if 'PAYDAY ALTERNATIVE LOANS' in normalized:
                extras_count += parse_number(row[3] if len(row) > 3 else '')
                extras_amount += parse_number(row[5] if len(row) > 5 else '')
                continue
            rate, count, amount = row[1], row[3], row[5]
            if not rate or 'Interest Rate' in rate:
                continue
            if not count or not amount:
                continue
            if not any(ch.isdigit() for ch in rate):
                continue
            rows.append(row)
    mix: Dict[str, Dict] = {}
    total_count = 0
    total_amount = 0
    for (key, label, display), row in zip(LOAN_MIX_ORDER, rows):
        mix[key] = {
            'label': display,
            'count': parse_number(row[3]),
            'balance': parse_number(row[5]),
            'rate': parse_rate(row[1]),
        }
        total_count += mix[key]['count']
        total_amount += mix[key]['balance']
    total_count += extras_count
    total_amount += extras_amount
    return mix, total_count, total_amount, reported_total


def parse_loans_granted(tables: List[List[List[str]]]) -> Tuple[int, int]:
    for table in tables:
        for row in table:
            if row and 'Granted Year-to-Date' in ' '.join(filter(None, row)):
                digits = [cell for cell in row if cell and cell.replace(',', '').isdigit()]
                count = parse_number(digits[0]) if digits else 0
                amount = next((parse_number(cell) for cell in row if cell and '$' in cell), 0)
                return count, amount
    return 0, 0


def parse_interest_and_credit_loss(pdf: pdfplumber.PDF) -> Tuple[int, int]:
    for page in pdf.pages:
        text = page.extract_text() or ''
        if 'INTEREST INCOME YEAR-TO-DATE' in text:
            lines = text.replace('\u200b', '').split('\n')
            interest = 0
            credit_loss = 0
            for line in lines:
                clean = line.replace('_', '')
                if 'Interest on Loans and Leases' in clean:
                    m = re.search(r'\$([\d,()]+)', clean)
                    if m:
                        interest = parse_number(m.group(0))
                if 'Credit Loss Expense a. Loans & Leases' in clean or 'Credit Loss Expense a. Loans' in clean:
                    m = re.search(r'\$([\d,()]+)', clean)
                    if m:
                        credit_loss = parse_number(m.group(0))
            return interest, credit_loss
    return 0, 0


def parse_delinquency(pdf: pdfplumber.PDF) -> Tuple[int, int, Dict[str, Dict[str, int]]]:
    tables = extract_tables_with_marker(pdf, 'SECTION 2 - DELINQUENT LOANS & LEASES')
    breakdown: Dict[str, Dict[str, int]] = {}
    total_amount = 0
    total_loans = 0
    for table in tables:
        for row in table:
            if not row:
                continue
            joined = ' '.join(filter(None, row))
            for key, marker, display in DELINQ_KEYS:
                if marker in joined:
                    # 60+ amount typically at column index -4, loans at -2
                    amount = parse_number(row[-4]) if len(row) >= 4 else 0
                    loans = parse_number(row[-2]) if len(row) >= 2 else 0
                    breakdown[key] = {
                        'label': display,
                        'balance': amount,
                        'loans': loans,
                    }
                    total_amount += amount
                    total_loans += loans
        # total row is last
        if table:
            last = table[-1]
            if last and 'TOTAL DELINQUENT LOANS' in ' '.join(filter(None, last)):
                total_amount = parse_number(last[-4])
                total_loans = parse_number(last[-2])
    return total_amount, total_loans, breakdown


def parse_delinquency_sources_and_nonaccrual(pdf: pdfplumber.PDF) -> Dict[str, int]:
    tables = extract_tables_with_marker(pdf, 'Amount of reportable delinquency included')
    result = {
        'participations': 0,
        'indirect': 0,
        'purchased': 0,
        'nonAccrual': 0,
        'commercialNonAccrual': 0,
        'bankruptcy': 0,
        'tdrLoans': 0,
        'tdrBalance': 0,
    }
    for table in tables:
        for row in table:
            if not row:
                continue
            joined = ' '.join(filter(None, row))
            if 'Participation Loans Purchased Under 701.22' in joined:
                result['participations'] = parse_number(row[-2])
            elif 'Indirect Loans (Account 618A)' in joined:
                result['indirect'] = parse_number(row[-2])
            elif 'Whole or Partial Loans Purchased Under 701.23' in joined:
                result['purchased'] = parse_number(row[-2])
            elif 'Non-Commercial Loans in Non-Accrual Status' in joined:
                result['nonAccrual'] = parse_number(row[-2])
            elif 'Commercial Loans in Non-Accrual Status' in joined:
                result['commercialNonAccrual'] = parse_number(row[-2])
            elif 'loans affected by bankruptcy claims' in joined:
                result['bankruptcy'] = parse_number(row[-2])
            elif row[-3:] and all(cell and cell.replace(',', '').replace('.', '').isdigit() or '$' in cell for cell in row[-3:]):
                # TDR row
                if any(cell and cell.isdigit() for cell in row[-3:]):
                    result['tdrLoans'] = parse_number(row[-3])
                    result['tdrBalance'] = parse_number(row[-1])
    return result


def parse_chargeoffs(pdf: pdfplumber.PDF) -> Tuple[Dict[str, Dict[str, int]], Dict[str, Dict[str, int]]]:
    tables = extract_tables_with_marker(pdf, 'LOAN LOSS INFORMATION')
    breakdown = {}
    total = {'chargeOffs': 0, 'recoveries': 0}
    value_rows: List[List[int]] = []
    in_section = False
    for table in tables:
        for row in table:
            if not row:
                continue
            joined = ' '.join(filter(None, row)).strip()
            if 'LOAN LOSS INFORMATION' in joined:
                in_section = True
                continue
            if not in_section:
                continue
            if joined.startswith('21. Total Charge Offs and Recoveries'):
                values = [parse_number(cell) for cell in row if cell and '$' in cell]
                if values:
                    total['chargeOffs'] = values[0]
                if len(values) > 1:
                    total['recoveries'] = values[1]
                continue
            if any(cell and '$' in cell for cell in row):
                value_rows.append([parse_number(cell) for cell in row if cell and '$' in cell])

    index_map = {
        'creditCard': 0,
        'otherUnsecured': 2,
        'newVehicle': 3,
        'usedVehicle': 4,
        'otherSecured': 6,
    }
    labels = {
        'creditCard': 'Credit card',
        'otherUnsecured': 'All other unsecured',
        'newVehicle': 'New vehicle',
        'usedVehicle': 'Used vehicle',
        'otherSecured': 'Other secured non-real estate',
    }
    for key, idx in index_map.items():
        if idx < len(value_rows):
            values = value_rows[idx]
            charge_off = values[0] if values else 0
            recovery = values[1] if len(values) > 1 else 0
            breakdown[key] = {
                'label': labels[key],
                'chargeOffs': charge_off,
                'recoveries': recovery,
            }
    if 'creditCard' not in breakdown:
        breakdown['creditCard'] = {'label': 'Credit card', 'chargeOffs': 0, 'recoveries': 0}
    return breakdown, total


def parse_indirect(pdf: pdfplumber.PDF) -> Dict[str, Dict[str, int]]:
    tables = extract_tables_with_marker(pdf, 'SECTION 5 - INDIRECT LOANS')
    data = {
        'auto': {'count': 0, 'balance': 0},
        'other': {'count': 0, 'balance': 0},
        'total': {'count': 0, 'balance': 0},
    }
    if not tables:
        return data
    table = tables[0]
    for row in table:
        if not row:
            continue
        joined = ' '.join(filter(None, row))
        if 'TOTAL OUTSTANDING INDIRECT LOANS' in joined:
            data['total'] = {
                'count': parse_number(row[0] if row[0] else '0'),
                'balance': parse_number(row[2] if len(row) > 2 else '0'),
            }
        for key, marker in INDIRECT_ROWS:
            if marker in joined:
                data[key] = {
                    'count': parse_number(row[0] if row[0] else '0'),
                    'balance': parse_number(row[2] if len(row) > 2 else '0'),
                }
    if data['total']['count'] == 0:
        data['total']['count'] = data['auto']['count'] + data['other']['count']
    if data['total']['balance'] == 0:
        data['total']['balance'] = data['auto']['balance'] + data['other']['balance']
    return data


def parse_assets_fields(pages_text: List[str]) -> Dict[str, int]:
    result = {
        'totalAssets': 0,
        'allowance': 0,
        'accruedInterestLoans': 0,
        'netLoans': 0,
    }
    for text in pages_text:
        for raw_line in text.split('\n'):
            line = raw_line.replace('_', '')
            if (
                result['netLoans'] == 0
                and 'TOTAL LOANS' in line.upper()
                and 'LEASES' in line.upper()
                and 'TOTAL ASSETS' not in line.upper()
            ):
                m = re.search(r'\$([\d,()]+)', line)
                if m:
                    result['netLoans'] = parse_number(m.group(0))
            if 'TOTAL ASSETS' in line and result['totalAssets'] == 0:
                m = re.search(r'\$([\d,()]+)', line)
                if m:
                    result['totalAssets'] = parse_number(m.group(0))
            if 'Allowance for Credit Losses on Loans & Leases' in line and result['allowance'] == 0:
                m = re.search(r'\$([\d,()]+)', line)
                if m:
                    result['allowance'] = parse_number(m.group(0))
            if 'Accrued Interest on Loans & Leases' in line and result['accruedInterestLoans'] == 0:
                m = re.search(r'\$([\d,()]+)', line)
                if m:
                    result['accruedInterestLoans'] = parse_number(m.group(0))
    return result


def parse_nonaccrual_sources(pdf: pdfplumber.PDF) -> Dict[str, int]:
    tables = extract_tables_with_marker(pdf, 'Amount of reportable delinquency included')
    data = {
        'participations': 0,
        'indirect': 0,
        'purchased': 0,
        'nonAccrualLoans': 0,
        'commercialNonAccrual': 0,
        'bankruptcyOutstanding': 0,
        'tdrLoans': 0,
        'tdrBalance': 0,
    }
    for table in tables:
        for row in table:
            if not row:
                continue
            joined = ' '.join(filter(None, row))
            if 'Participation Loans Purchased Under 701.22' in joined:
                data['participations'] = parse_number(row[-2])
            elif 'Indirect Loans (Account 618A)' in joined:
                data['indirect'] = parse_number(row[-2])
            elif 'Whole or Partial Loans Purchased Under 701.23' in joined:
                data['purchased'] = parse_number(row[-2])
            elif 'Amount of Non-Commercial Loans in Non-Accrual Status' in joined:
                data['nonAccrualLoans'] = parse_number(row[-2])
            elif 'Amount of Commercial Loans in Non-Accrual Status' in joined:
                data['commercialNonAccrual'] = parse_number(row[-2])
            elif 'loans affected by bankruptcy claims' in joined:
                data['bankruptcyOutstanding'] = parse_number(row[-2])
            elif any(cell for cell in row if cell and '1000F' in cell):
                digits = [cell for cell in row if cell and cell.replace(',', '').isdigit()]
                data['tdrLoans'] = parse_number(digits[0]) if digits else 0
                data['tdrBalance'] = next((parse_number(cell) for cell in row if cell and '$' in cell), 0)
    return data


def quarter_info(file_stem: str) -> Tuple[str, int]:
    normalized = file_stem.lower()
    quarter_match = re.search(r'(20\d{2})[-_]?q([1-4])', normalized)
    if quarter_match:
        year = quarter_match.group(1)
        quarter = f"q{quarter_match.group(2)}"
        month_label, months = QUARTER_LOOKUP[quarter]
        return f"{month_label}, {year}", months

    month_match = re.search(r'(march|june|september|december)[-_]?(20\d{2})', normalized)
    if month_match:
        month = month_match.group(1)
        year = month_match.group(2)
        month_label, months = MONTH_LOOKUP[month]
        return f"{month_label}, {year}", months

    year_match = re.search(r'20\d{2}', normalized)
    if year_match:
        year = year_match.group(0)
        month_label, months = MONTH_LOOKUP['december']
        return f"{month_label}, {year}", months

    return '', 0


def create_report(pdf_path: Path) -> Dict:
    with pdfplumber.open(pdf_path) as pdf:
        pages_text = [page.extract_text() or '' for page in pdf.pages]
        clean_text = [text.replace('_', '') for text in pages_text]
        name, charter = extract_name_charter(clean_text)
        loan_mix, loan_count, total_loans_calc, loan_mix_total = parse_loan_mix(pdf)
        interest_ytd, credit_loss_ytd = parse_interest_and_credit_loss(pdf)
        delinquency_total, delinquency_loans, delinquency_breakdown = parse_delinquency(pdf)
        nonaccrual_data = parse_nonaccrual_sources(pdf)
        chargeoffs_breakdown, chargeoffs_total = parse_chargeoffs(pdf)
        indirect = parse_indirect(pdf)
        assets = parse_assets_fields(pages_text)
        tables_section1 = extract_tables_with_marker(pdf, 'SECTION 1 - LOANS AND LEASES')
        loans_granted_count, loans_granted_amount = parse_loans_granted(tables_section1)

    as_of, period_months = quarter_info(pdf_path.stem)
    reported_loan_total = loan_mix_total.get('balance', 0)
    reported_loan_count = loan_mix_total.get('count', 0)
    tolerance = 5
    if reported_loan_total and abs(reported_loan_total - total_loans_calc) > tolerance:
        raise ValueError(
            'Loan mix balance mismatch for '
            f"{pdf_path.name}: schedule reports {reported_loan_total:,} but components sum to {total_loans_calc:,}."
        )
    asset_net_loans = assets.get('netLoans', 0)
    if asset_net_loans and reported_loan_total and abs(asset_net_loans - reported_loan_total) > tolerance:
        raise ValueError(
            'Asset page net loan balance mismatch for '
            f"{pdf_path.name}: assets page lists {asset_net_loans:,} vs schedule total {reported_loan_total:,}."
        )
    if asset_net_loans and not reported_loan_total and abs(asset_net_loans - total_loans_calc) > tolerance:
        raise ValueError(
            'Asset page net loan balance mismatch for '
            f"{pdf_path.name}: assets page lists {asset_net_loans:,} vs calculated total {total_loans_calc:,}."
        )

    report = {
        'id': slugify_file_stem(pdf_path.stem),
        'name': name,
        'charter': charter,
        'asOf': as_of,
        'periodMonths': period_months,
        'totalAssets': assets['totalAssets'],
        'totalLoans': reported_loan_total or total_loans_calc,
        'loanCount': reported_loan_count or loan_count,
        'allowance': assets['allowance'],
        'accruedInterestLoans': assets['accruedInterestLoans'],
        'loansGrantedYtdCount': loans_granted_count,
        'loansGrantedYtdAmount': loans_granted_amount,
        'interestOnLoansYtd': interest_ytd,
        'creditLossExpenseLoansYtd': credit_loss_ytd,
        'delinquencyTotal60Plus': delinquency_total,
        'delinquencyTotal60PlusLoans': delinquency_loans,
        'nonAccrualLoans': nonaccrual_data['nonAccrualLoans'],
        'bankruptcyOutstanding': nonaccrual_data['bankruptcyOutstanding'],
        'tdrLoans': nonaccrual_data['tdrLoans'],
        'tdrBalance': nonaccrual_data['tdrBalance'],
        'delinquencySources': {
            'participations': nonaccrual_data['participations'],
            'indirect': nonaccrual_data['indirect'],
            'purchased': nonaccrual_data['purchased'],
        },
        'indirect': indirect,
        'loanMix': loan_mix,
        'loanMixTotal': loan_mix_total,
        'delinquency60PlusDetail': {key: value for key, value in delinquency_breakdown.items() if value['balance'] > 0},
        'chargeOffs': {'total': chargeoffs_total, **chargeoffs_breakdown},
        'riskHighlights': [],
        'insights': [],
        'callReportFile': pdf_path.name,
    }
    return report


def main():
    for pdf_path in CALL_REPORTS_DIR.glob('*.pdf'):
        json_path = pdf_path.with_suffix('.json')
        if json_path.exists():
            continue
        report = create_report(pdf_path)
        json_path.write_text(json.dumps(report, indent=2) + '\n')
        print(f'Wrote {json_path.name}')


if __name__ == '__main__':
    main()
