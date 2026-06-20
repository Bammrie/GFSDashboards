window.POTENTIAL_NEW_CLIENT_DATA = {
  updatedAt: '2026-06-20T16:45:00-05:00',
  cadenceMinutes: 10,
  latestPublicNcuaCycleDate: '2026-03-31',
  notes: [
    'First seed record pulled from NCUA Research a Credit Union and the March 31, 2026 call report.',
    'Loan values are call-report balances unless a field is marked as derived.',
    'LinkedIn Sales Navigator data is a visible search snapshot from the authenticated Chrome session and should remain internal research.'
  ],
  prospects: [
    {
      id: 'alliant-67955-2026-03-31',
      name: 'Alliant Credit Union',
      charterNumber: '67955',
      priority: 'High',
      status: 'First-run research captured',
      summary:
        'Large Illinois FISCU with a $15.71B loan book, $3.53B in indirect loans, and $522.68M in new/used vehicle loans before indirect adjustment.',
      profile: {
        ncuaName: 'ALLIANT',
        type: 'FISCU',
        status: 'Active',
        charterState: 'Illinois',
        region: '8 - ONES',
        peerGroup: '6 - $500,000,000 and greater',
        assets: 19656761468,
        members: 938005,
        ceo: 'Michael Dobbins',
        website: 'http://www.alliantcreditunion.org',
        phone: '800-328-1935',
        mainOffice: {
          street: '11545 W Touhy Ave',
          city: 'Chicago',
          state: 'IL',
          zip: '60666',
          county: 'Cook',
          country: 'United States',
          latitude: 42.008121,
          longitude: -87.9336485,
          geocodePrecision: 'Street segment approximation from OpenStreetMap Nominatim'
        }
      },
      callReport: {
        cycleDate: '2026-03-31',
        reportLabel: 'March 2026 NCUA 5300 Call Report',
        totals: {
          loansHeldForSale: 415432461,
          totalLoansAndLeases: { count: 302098, amount: 15707973198 },
          allowanceForCreditLossesLoansAndLeases: 308738203,
          accruedInterestOnLoansAndLeases: 79297583,
          loansGrantedYtd: { count: 18730, amount: 1222283006 },
          interestOnLoansAndLeasesYtd: 236998914,
          creditLossExpenseLoansAndLeasesYtd: 37317269,
          gainLossOnSalesOfLoansAndLeasesYtd: 2852077,
          loanServicingExpenseYtd: 3886883
        },
        loanCategories: [
          {
            label: 'Unsecured Credit Card Loans',
            accountAmountCode: '396',
            interestRate: 15.74,
            count: 50401,
            amount: 162330380,
            productFit: 'Credit insurance/debt protection - unsecured consumer'
          },
          {
            label: 'Payday Alternative Loans (PALs I and PALs II)',
            accountAmountCode: '397A',
            interestRate: null,
            count: 0,
            amount: 0,
            productFit: 'Not material in this call report'
          },
          {
            label: 'Non-Federally Guaranteed Student Loans',
            accountAmountCode: '698A',
            interestRate: 0,
            count: 2630,
            amount: 5251384,
            productFit: 'Consumer loan review'
          },
          {
            label: 'All Other Unsecured Loans/Lines of Credit',
            accountAmountCode: '397',
            interestRate: 11.74,
            count: 103898,
            amount: 1389139154,
            productFit: 'Credit insurance/debt protection - unsecured consumer'
          },
          {
            label: 'New Vehicle Loans',
            accountAmountCode: '385',
            interestRate: 4.99,
            count: 9881,
            amount: 239987369,
            productFit: 'VSC, GAP, credit insurance, debt protection'
          },
          {
            label: 'Used Vehicle Loans',
            accountAmountCode: '370',
            interestRate: 5.14,
            count: 17009,
            amount: 282691801,
            productFit: 'VSC, GAP, credit insurance, debt protection'
          },
          {
            label: 'All Other Secured Non-Real Estate Loans/Lines of Credit',
            accountAmountCode: '698C',
            interestRate: 9.29,
            count: 77274,
            amount: 3398405962,
            productFit: 'Collateral and consumer protection review'
          },
          {
            label: 'First Lien 1- to 4-Family Residential Property Loans/Lines',
            accountAmountCode: '703A',
            interestRate: 5.63,
            count: 11411,
            amount: 6753726812,
            productFit: 'Mortgage credit insurance review'
          },
          {
            label: 'Junior Lien 1- to 4-Family Residential Property Loans/Lines',
            accountAmountCode: '386A',
            interestRate: 7,
            count: 28474,
            amount: 1473715259,
            productFit: 'Mortgage and HELOC protection review'
          },
          {
            label: 'All Other Non-Commercial Real Estate Loans/Lines of Credit',
            accountAmountCode: '386B',
            interestRate: 0,
            count: 0,
            amount: 0,
            productFit: 'Not material in this call report'
          },
          {
            label: 'Commercial Loans/Lines of Credit Real Estate Secured',
            accountAmountCode: '718A5',
            interestRate: 7.75,
            count: 148,
            amount: 1988355453,
            productFit: 'Commercial lending context only'
          },
          {
            label: 'Commercial Loans/Lines of Credit Not Real Estate Secured',
            accountAmountCode: '400P',
            interestRate: 0,
            count: 0,
            amount: 0,
            productFit: 'Not material in this call report'
          }
        ],
        indirectLoans: [
          {
            label: 'New and Used Vehicle Loans',
            count: 9147,
            amount: 171027436,
            countAccountCode: 'IN0001',
            amountAccountCode: 'IN0002',
            source: 'Schedule A, Section 5'
          },
          {
            label: 'First Lien and Junior Lien Residential Loans',
            count: 10618,
            amount: 201000568,
            countAccountCode: 'IN0003',
            amountAccountCode: 'IN0004',
            source: 'Schedule A, Section 5'
          },
          {
            label: 'Commercial Loans',
            count: 0,
            amount: 0,
            countAccountCode: 'IN0005',
            amountAccountCode: 'IN0006',
            source: 'Schedule A, Section 5'
          },
          {
            label: 'All Other Loans',
            count: 78535,
            amount: 3157879042,
            countAccountCode: 'IN0007',
            amountAccountCode: 'IN0008',
            source: 'Derived from Schedule A, Section 5 total minus listed categories',
            derived: true
          }
        ],
        indirectTotals: {
          count: 98300,
          amount: 3529907046,
          countAccountCode: '617A',
          amountAccountCode: '618A',
          delinquentAmount: 59650322,
          delinquentAmountAccountCode: '041E',
          chargeOffsYtd: 32266176,
          chargeOffsAccountCode: '550E',
          recoveriesYtd: 8203766,
          recoveriesAccountCode: '551E'
        },
        derivedMetrics: {
          nonCommercialLoanBalance: 13719617745,
          autoLoanBalance: 522679170,
          autoLoanCount: 26890,
          directAutoLoanBalance: 351651734,
          directAutoLoanCount: 17743,
          directAutoCalculation:
            'New vehicle plus used vehicle loans minus indirect new/used vehicle loans; count never below zero.',
          indirectShareOfLoanBook: 0.2247206387,
          indirectVehicleShareOfAutoBalance: 0.3271940144
        },
        realEstateDetails: {
          firstLienBalance: 6753726811,
          firstLienGrantedYtd: 385579059,
          juniorLienBalance: 1473715259,
          juniorLienGrantedYtd: 271766818,
          constructionBalance: 25683325,
          repricesOrMaturesWithinFiveYears: 1886540668,
          interestOnlyPaymentOptionFirstLien: { count: 576, amount: 186257260, grantedYtd: 19804481 }
        },
        commercialDetails: {
          commercialMemberLoans: { count: 148, amount: 1988355453, grantedYtdCount: 4, grantedYtdAmount: 88015000 },
          totalMemberBusinessLoansNet: 2142928979,
          commercialUnfundedCommitments: 154573526
        },
        purchasedAndSoldLoans: {
          purchasedFromOtherFinancialInstitutionsYtd: { count: 726, amount: 33583401 },
          purchasedFromOtherFinancialInstitutionsOutstanding: { count: 21886, amount: 652154555 },
          purchasedFromOtherSourcesYtd: { count: 9165, amount: 228706181 },
          purchasedFromOtherSourcesOutstanding: { count: 78424, amount: 5435041249 },
          loansSoldYtd: { count: 379, amount: 134210575 },
          firstMortgageLoansSoldSecondaryMarketYtd: { count: 379, amount: 134210575 },
          realEstateLoansSoldServicingRetained: { ytdCount: 15, ytdAmount: 2493955, outstandingCount: 3287, outstandingAmount: 616525788 },
          allOtherLoansSoldServicingRetained: { ytdCount: 0, ytdAmount: 0, outstandingCount: 302, outstandingAmount: 9599962 }
        },
        unfundedCommitments: {
          commercialLoans: 154573526,
          revolvingOpenEndSecuredByResidentialProperty: 1113501825,
          creditCardLines: 1551474038,
          unsecuredShareDraftLinesOfCredit: 35245495,
          totalAllLoanTypes: 2936997684,
          unconditionallyCancelableAllLoanTypes: 1668922333
        }
      },
      modeledOpportunity: {
        assumptions: {
          creditLifeRatePerThousand: 1,
          creditDisabilityRatePerThousand: 2.25,
          debtProtectionIuiRatePerThousand: 1.4,
          creditAndDebtProtectionPenetration: 0.38,
          vscPenetration: 0.4,
          vscGfsMarginPerContract: 400,
          gapPenetration: 0.7,
          gapGfsMarginPerContract: 50,
          directAutoAverageTermMonths: 24
        },
        modeledMonthlyCreditLifePremium: 5213454.74,
        modeledMonthlyCreditDisabilityPremium: 11730273.67,
        modeledMonthlyDebtProtectionIuiPremium: 7298036.24,
        modeledMonthlyDirectAutoOriginations: 739.29,
        modeledMonthlyVscGfsIncome: 118286.67,
        modeledMonthlyGapGfsIncome: 25870.21,
        notes: [
          'Credit and debt protection uses the repo AGENTS prospect heuristic on non-commercial loan balance.',
          'VSC and GAP use direct auto count after subtracting indirect vehicle loans from new/used vehicle counts.'
        ]
      },
      relationshipResearch: {
        capturedAt: '2026-06-20T16:38:00-05:00',
        source: 'LinkedIn Sales Navigator visible search results in authenticated Chrome session',
        searchUrl: 'https://www.linkedin.com/sales/search/people?keywords=Alliant%20Credit%20Union',
        resultSummary: '2K+ keyword results; page 1 of 87 visible during capture',
        visibleLeads: [
          {
            name: 'Peter Margolin',
            title: 'Commercial Loan Originator',
            company: 'Alliant Credit Union',
            location: 'Deerfield, Illinois, United States',
            tenure: '8 years 8 months in role and company',
            signal: 'Commercial lending contact visible in Sales Navigator'
          },
          {
            name: 'Jamie Warder',
            title: 'CIO and Head of Business Strategy',
            company: 'Alliant Credit Union',
            location: 'United States',
            tenure: '2 years in role and company',
            signal: 'Business strategy and technology executive; 1 recent post shown'
          },
          {
            name: 'Tudor Enoiu',
            title: 'SVP Chief Credit and Data Officer',
            company: 'Alliant Credit Union',
            location: 'Chicago, Illinois, United States',
            tenure: '6 months in role; 5 years 4 months in company',
            signal: 'Consumer lending, credit strategy, risk management, and data leadership'
          },
          {
            name: 'Shailesh Vanani',
            title: 'VP Head of Digital Banking Technology',
            company: 'Alliant Credit Union',
            location: 'St Charles, Illinois, United States',
            tenure: '10 months in role; 4 years 4 months in company',
            signal: 'Digital banking technology leadership'
          }
        ],
        additionalVisibleNames: [
          'Sarah Searls',
          'Allan Nielson',
          'John Listak',
          'Michelle Spellerberg',
          'Josh Ward',
          'Charles Krawitz',
          'Christian Katavic',
          'Terry Hagio, PMP, MBA',
          'Michael Fasshauer',
          'Calli Cardillo',
          'Katarzyna P.',
          'Ken Kondo',
          'Jim Absher',
          'Rudy Pereira',
          'Mike Dobbins',
          'Katharine Hebenstreit',
          'Kevin Devlin',
          'Kathy Hall',
          'Yonah Sturmwind',
          'Jeff Gonzales',
          'Evan Hill'
        ]
      },
      sources: [
        {
          label: 'NCUA Research a Credit Union',
          url: 'https://mapping.ncua.gov/ResearchCreditUnion',
          capturedAt: '2026-06-20'
        },
        {
          label: 'NCUA credit union details API for charter 67955',
          url: 'https://mapping.ncua.gov/api/CreditUnionDetails/GetCreditUnionDetails/67955',
          capturedAt: '2026-06-20'
        },
        {
          label: 'NCUA March 2026 call report download endpoint',
          url: 'https://mapping.ncua.gov/api/CreditUnionDetails/GetDownloadCallReport/67955?isCorpCU=false&cycleDate=03/31/2026',
          capturedAt: '2026-06-20'
        },
        {
          label: 'OpenStreetMap Nominatim geocode for main office street',
          url: 'https://nominatim.openstreetmap.org/search?format=json&q=11545%20W%20Touhy%20Ave%2C%20Chicago%2C%20IL%2060666',
          capturedAt: '2026-06-20'
        },
        {
          label: 'LinkedIn Sales Navigator people search snapshot',
          url: 'https://www.linkedin.com/sales/search/people?keywords=Alliant%20Credit%20Union',
          capturedAt: '2026-06-20'
        }
      ],
      dataQuality: [
        'PDF text extraction matched Schedule A, Section 1 loan lines and Schedule A, Section 5 indirect loan totals.',
        'Poppler rendering wrapper was present but its nested runtime path was missing, so visual page rendering could not be completed in this environment.',
        'OpenStreetMap returned a road match rather than an exact building match for the NCUA main office address.'
      ]
    }
  ]
};
