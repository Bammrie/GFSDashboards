window.POTENTIAL_NEW_CLIENT_DATA = {
  updatedAt: '2026-06-20T20:05:41-05:00',
  cadenceMinutes: 10,
  latestPublicNcuaCycleDate: '2026-03-31',
  connectionTracking: {
    targetTitles: [
      'VP of Lending',
      'VP of Consumer Lending',
      'Consumer Lending Executive',
      'Lending Executive',
      'CEO',
      'President',
      'President & CEO'
    ],
    linkedInConnectionsMonitorUrl: 'https://www.linkedin.com/mynetwork/invite-connect/connections/',
    requestStoragePath: 'prospect.relationshipResearch.connectionRequests',
    requestPolicy: 'Send no-note LinkedIn connection requests only to verified current-company lending or executive leads surfaced by Sales Navigator, then reconcile accepted requests from the LinkedIn connections page.'
  },
  notes: [
    'First seed record pulled from NCUA Research a Credit Union and the March 31, 2026 call report.',
    'Loan values are call-report balances unless a field is marked as derived.',
    'LinkedIn Sales Navigator data is a visible search snapshot from the authenticated Chrome session and should remain internal research.',
    'Connection requests are tracked under relationshipResearch.connectionRequests and accepted requests are reconciled from the LinkedIn connections page when visible.'
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
    },
    {
      id: 'lake-michigan-62514-2026-03-31',
      name: 'Lake Michigan Credit Union',
      charterNumber: '62514',
      priority: 'High',
      status: 'Recurring research captured',
      summary:
        'Large Michigan FISCU with a $13.38B loan book, $825.97M in indirect loans, $1.08B in new/used vehicle loans, and material mortgage and commercial portfolios.',
      profile: {
        ncuaName: 'LAKE MICHIGAN',
        type: 'FISCU',
        status: 'Active',
        charterState: 'Michigan',
        region: '1 - Eastern',
        fieldOfMembership: 'Non-Federal Credit Union',
        lowIncomeDesignation: true,
        federalHomeLoanBankMember: true,
        peerGroup: '6 - $500,000,000 and greater',
        assets: 16863639122,
        members: 530662,
        ceo: 'Julie Leonard',
        website: 'http://www.lmcu.org',
        phone: '616-242-9790',
        mainOffice: {
          street: '5664 Prairie Creek Dr SE',
          city: 'Caledonia',
          state: 'MI',
          zip: '49316',
          county: 'Kent',
          country: 'United States',
          latitude: 42.8530042,
          longitude: -85.5222769,
          geocodePrecision: 'Address-level OpenStreetMap Nominatim match; returned POI label did not match the credit union name'
        }
      },
      callReport: {
        cycleDate: '2026-03-31',
        reportLabel: 'March 2026 NCUA 5300 Call Report',
        totals: {
          loansHeldForSale: 117761857,
          totalLoansAndLeases: { count: 293378, amount: 13377138815 },
          allowanceForCreditLossesLoansAndLeases: 117286463,
          accruedInterestOnLoansAndLeases: 48710472,
          loansGrantedYtd: { count: 15397, amount: 1433815634 },
          sbaNonCommercialLoans: { count: 1, amount: 4842, guaranteedPortion: 4842 },
          sbaCommercialLoans: { count: 200, amount: 100214930, guaranteedPortion: 4210967 },
          loanServicingRights: { realEstateOutstandingAmount: 9869757275, allOtherOutstandingAmount: 68881 }
        },
        loanCategories: [
          {
            label: 'Unsecured Credit Card Loans',
            accountAmountCode: '396',
            interestRate: 13.5,
            count: 122282,
            amount: 229924313,
            productFit: 'Credit insurance/debt protection - unsecured consumer'
          },
          {
            label: 'Non-Federally Guaranteed Student Loans',
            accountAmountCode: '698A',
            interestRate: 0,
            count: 0,
            amount: 0,
            productFit: 'Not material in this call report'
          },
          {
            label: 'All Other Unsecured Loans/Lines of Credit',
            accountAmountCode: '397',
            interestRate: 12,
            count: 40983,
            amount: 167248421,
            productFit: 'Credit insurance/debt protection - unsecured consumer'
          },
          {
            label: 'New Vehicle Loans',
            accountAmountCode: '385',
            interestRate: 5.99,
            count: 5420,
            amount: 142719930,
            productFit: 'VSC, GAP, credit insurance, debt protection'
          },
          {
            label: 'Used Vehicle Loans',
            accountAmountCode: '370',
            interestRate: 7.99,
            count: 61544,
            amount: 940707067,
            productFit: 'VSC, GAP, credit insurance, debt protection'
          },
          {
            label: 'All Other Secured Non-Real Estate Loans/Lines of Credit',
            accountAmountCode: '698C',
            interestRate: 6.99,
            count: 8590,
            amount: 624941372,
            productFit: 'CPI and secured consumer protection review'
          },
          {
            label: 'First Lien 1- to 4-Family Residential Property Loans/Lines of Credit',
            accountAmountCode: '703A',
            interestRate: 6.49,
            count: 31714,
            amount: 8171915173,
            productFit: 'Mortgage protection / life-disability review'
          },
          {
            label: 'Junior Lien 1- to 4-Family Residential Property Loans/Lines of Credit',
            accountAmountCode: '386A',
            interestRate: 6.49,
            count: 21335,
            amount: 957027192,
            productFit: 'Mortgage protection / debt protection review'
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
            interestRate: 6.25,
            count: 1124,
            amount: 1976498442,
            productFit: 'Commercial relationship context; not core consumer protection model'
          },
          {
            label: 'Commercial Loans/Lines of Credit Not Real Estate Secured',
            accountAmountCode: '400P',
            interestRate: 9.75,
            count: 386,
            amount: 166156905,
            productFit: 'Commercial relationship context; not core consumer protection model'
          }
        ],
        chargeOffAndRecoveryYtd: [
          { label: 'Unsecured Credit Card Loans', chargeOffs: 1684074, recoveries: 307189 },
          { label: 'Non-Federally Guaranteed Student Loans', chargeOffs: 0, recoveries: 0 },
          { label: 'All Other Unsecured Loans/Lines of Credit', chargeOffs: 978824, recoveries: 185269 },
          { label: 'New Vehicle Loans', chargeOffs: 222864, recoveries: 31532 },
          { label: 'Used Vehicle Loans', chargeOffs: 3376351, recoveries: 696307 },
          { label: 'All Other Secured Non-Real Estate Loans/Lines of Credit', chargeOffs: 167398, recoveries: 61104 },
          { label: 'First Lien Residential Property Loans/Lines of Credit', chargeOffs: 68780, recoveries: 0 },
          { label: 'Junior Lien Residential Property Loans/Lines of Credit', chargeOffs: 0, recoveries: 625 },
          { label: 'All Other Non-Commercial Real Estate Loans/Lines of Credit', chargeOffs: 0, recoveries: 0 },
          { label: 'Owner Occupied Non-Farm Non-Residential Commercial', chargeOffs: 409590, recoveries: 357286 },
          { label: 'Non-Owner Occupied Non-Farm Non-Residential Commercial', chargeOffs: 0, recoveries: 0 },
          { label: 'Unsecured Commercial Loans', chargeOffs: 0, recoveries: 0 },
          { label: 'Total Loans and Leases', chargeOffs: 6907881, recoveries: 1639312 },
          { label: 'Indirect Loans', chargeOffs: 3182776, recoveries: 627116 }
        ],
        delinquency: {
          indirectDelinquentAmount: 8222207,
          nonCommercialNonAccrualAmount: 36522946,
          commercialNonAccrualAmount: 9830551
        },
        indirectLoans: [
          {
            label: 'New and Used Vehicle Loans',
            count: 45471,
            amount: 770986071,
            countAccountCode: 'IN0001',
            amountAccountCode: 'IN0002',
            source: 'Schedule A, Section 5'
          },
          {
            label: 'First Lien and Junior Lien Residential Loans',
            count: 0,
            amount: 0,
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
            count: 2727,
            amount: 54980158,
            countAccountCode: 'IN0007',
            amountAccountCode: 'IN0008',
            source: 'Derived from Schedule A, Section 5 total minus listed categories',
            derived: true
          }
        ],
        indirectTotals: {
          count: 48198,
          amount: 825966229,
          countAccountCode: '617A',
          amountAccountCode: '618A',
          delinquentAmount: 8222207,
          delinquentAmountAccountCode: '041E',
          chargeOffsYtd: 3182776,
          chargeOffsAccountCode: '550E',
          recoveriesYtd: 627116,
          recoveriesAccountCode: '551E'
        },
        derivedMetrics: {
          nonCommercialLoanBalance: 11234483467,
          autoLoanBalance: 1083426997,
          autoLoanCount: 66964,
          directAutoLoanBalance: 312440926,
          directAutoLoanCount: 21493,
          directAutoCalculation:
            'New vehicle plus used vehicle loans minus indirect new/used vehicle loans; count never below zero.',
          indirectShareOfLoanBook: 0.0617430961,
          indirectVehicleShareOfAutoBalance: 0.7116177002
        },
        realEstateDetails: {
          firstLienBalance: 8171915173,
          firstLienGrantedYtd: 939916086,
          juniorLienBalance: 957027192,
          juniorLienGrantedYtd: 105731152,
          allOtherNonCommercialRealEstateBalance: 0,
          allOtherNonCommercialRealEstateGrantedYtd: 0,
          constructionBalance: 546588826,
          repricesOrMaturesWithinFiveYears: 3008426406,
          interestOnlyPaymentOptionFirstLien: { count: 4995, amount: 699292183, grantedYtd: 190224930 }
        },
        commercialDetails: {
          constructionAndDevelopmentMembers: { count: 104, amount: 325841432, grantedYtdCount: 7, grantedYtdAmount: 39799483 },
          agriculturalMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          commercialAndIndustrialMembers: { count: 285, amount: 156010372, grantedYtdCount: 30, grantedYtdAmount: 27758861 },
          unsecuredCommercialMembers: { count: 34, amount: 8281870, grantedYtdCount: 14, grantedYtdAmount: 5899333 },
          commercialMemberLoans: { count: 1493, amount: 2110801731, grantedYtdCount: 107, grantedYtdAmount: 151252455 },
          constructionAndDevelopmentNonmembers: { count: 1, amount: 3903413, grantedYtdCount: 0, grantedYtdAmount: 0 },
          agriculturalNonmembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          commercialAndIndustrialNonmembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          unsecuredCommercialNonmembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          totalCommercialNonmemberLoans: { count: 17, amount: 31853617, grantedYtdCount: 0, grantedYtdAmount: 0 },
          totalCommercialLoans: { count: 1510, amount: 2142655348 },
          outstandingAgriculturalRelatedLoans: { count: 2, amount: 122061 },
          commercialRealEstateRepricesOrMaturesWithinFiveYears: 1752269884,
          commercialParticipationsSoldServicingRetained: { count: 203, amount: 129845964 },
          commercialLoansSoldServicingRetained: { count: 5, amount: 19636988 },
          totalMemberBusinessLoansNet: 2491990667,
          commercialUnfundedCommitments: 349884408
        },
        purchasedAndSoldLoans: {
          purchasedFromOtherFinancialInstitutionsYtd: { count: 0, amount: 0 },
          purchasedFromOtherFinancialInstitutionsOutstanding: { count: 0, amount: 0 },
          purchasedFromOtherSourcesYtd: { count: 0, amount: 0 },
          purchasedFromOtherSourcesOutstanding: { count: 0, amount: 0 },
          loansSoldYtd: { count: 1399, amount: 429536842 },
          firstMortgageLoansSoldSecondaryMarketYtd: { count: 1399, amount: 429536842 },
          realEstateLoansSoldServicingRetained: { ytdCount: 1342, ytdAmount: 424179939, outstandingCount: 53864, outstandingAmount: 9869757275 },
          allOtherLoansSoldServicingRetained: { ytdCount: 0, ytdAmount: 0, outstandingCount: 3, outstandingAmount: 68881 }
        },
        unfundedCommitments: {
          commercialLoans: 349884408,
          revolvingOpenEndSecuredByResidentialProperty: 946410365,
          creditCardLines: 726314823,
          otherUnfundedCommitments: 483195881,
          totalAllLoanTypes: 2893920008,
          unconditionallyCancelableAllLoanTypes: 1090619330,
          conditionallyCancelableCommercialLoans: 349884408,
          consumerLoansSecuredAndRealEstate: 1429455544,
          consumerLoansUnsecured: 23960726,
          consumerLoansTransferredWithLimitedRecourse: 51049003
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
        modeledMonthlyCreditLifePremium: 4269103.72,
        modeledMonthlyCreditDisabilityPremium: 9605483.36,
        modeledMonthlyDebtProtectionIuiPremium: 5976745.2,
        modeledMonthlyDirectAutoOriginations: 895.54,
        modeledMonthlyVscGfsIncome: 143286.67,
        modeledMonthlyGapGfsIncome: 31343.54,
        notes: [
          'Credit and debt protection uses the repo AGENTS prospect heuristic on non-commercial loan balance.',
          'VSC and GAP use direct auto count after subtracting indirect vehicle loans from new/used vehicle counts.',
          'Lake Michigan has most auto balances in indirect channels, so direct VSC/GAP estimates intentionally use only the adjusted direct auto count.'
        ]
      },
      relationshipResearch: {
        capturedAt: '2026-06-20T17:03:00-05:00',
        source: 'LinkedIn Sales Navigator visible search results in authenticated Chrome session',
        searchUrl: 'https://www.linkedin.com/sales/search/people?keywords=Lake%20Michigan%20Credit%20Union',
        resultSummary: '2.5K+ keyword results; page 1 of 100 visible during capture.',
        visibleLeads: [
          {
            name: 'Meg Dunn',
            title: 'Vice President Mortgage Production',
            company: 'Lake Michigan Credit Union',
            location: 'Grand Rapids Metropolitan Area',
            tenure: '16 years 3 months in role and company',
            signal: 'Mortgage production leader; 2nd degree with 7 mutual connections'
          },
          {
            name: 'Alexander Clayson',
            title: 'Retail Regional Director',
            company: 'Lake Michigan Credit Union',
            location: 'Grand Rapids, Michigan, United States',
            tenure: '19 years 10 months in role and company',
            signal: 'Retail channel leader; 2nd degree with 12 mutual connections and 2 recent posts'
          },
          {
            name: 'Beth Baird, CCMP, PMP',
            title: 'VP of Business Enablement',
            company: 'Lake Michigan Credit Union',
            location: 'Grand Rapids Metropolitan Area',
            tenure: '8 years 7 months in role; 11 years 7 months in company',
            signal: 'Business enablement and mortgage operations leader; 2nd degree with 4 mutual connections'
          },
          {
            name: 'Maria Labie',
            title: 'Mortgage Market Manager',
            company: 'Lake Michigan Credit Union',
            location: 'Detroit Metropolitan Area',
            tenure: '2 months in role and company',
            signal: 'Mortgage market contact; 2nd degree with 2 mutual connections and 1 recent post'
          }
        ],
        additionalVisibleNames: [
          'Jayne Malinowski',
          'Emil Izrailov',
          'Emrah Sero',
          'Jason Sager',
          'Marty Peltier',
          'Nicholas Simatos',
          'Jason Sasena, CMB',
          'Nicholas Groulx',
          'Steve Kik, AMP',
          'Brent Green, CMB',
          'Bill Lantzy',
          'Corbin Buttleman',
          'Ryba, Jason',
          'Alex Lutke',
          'Patrick Rokosz',
          'Teresa Walker',
          'Scott Wiggins',
          'Carrie Kozak',
          'Jim Thelen',
          'Dan McLean',
          'Kate McDougall, AMP, CMB'
        ]
      },      sources: [
        {
          label: 'NCUA Research a Credit Union',
          url: 'https://mapping.ncua.gov/ResearchCreditUnion',
          capturedAt: '2026-06-20'
        },
        {
          label: 'NCUA credit union details API for charter 62514',
          url: 'https://mapping.ncua.gov/api/CreditUnionDetails/GetCreditUnionDetails/62514',
          capturedAt: '2026-06-20'
        },
        {
          label: 'NCUA March 2026 call report download endpoint',
          url: 'https://mapping.ncua.gov/api/CreditUnionDetails/GetDownloadCallReport/62514?isCorpCU=false&cycleDate=03/31/2026',
          capturedAt: '2026-06-20'
        },
        {
          label: 'OpenStreetMap Nominatim geocode for main office address',
          url: 'https://nominatim.openstreetmap.org/search?format=json&q=5664%20Prairie%20Creek%20Dr%20SE%2C%20Caledonia%2C%20MI%2049316',
          capturedAt: '2026-06-20'
        },
        {
          label: 'LinkedIn Sales Navigator people search attempt',
          url: 'https://www.linkedin.com/sales/search/people?keywords=Lake%20Michigan%20Credit%20Union',
          capturedAt: '2026-06-20'
        }
      ],
      dataQuality: [
        'PDF text extraction matched Schedule A loan lines, indirect loan totals, delinquency, charge-off/recovery, real estate, commercial, and unfunded commitment sections.',
        'OpenStreetMap returned the requested street address coordinates but with an unrelated POI label, so the map point should be treated as address-level rather than verified branch/building identity.',
        'Sales Navigator relationship research could not proceed because Chrome reached the LinkedIn Sales Navigator login page instead of authenticated results.'
      ]
    },
    {
      id: 'america-first-24694-2026-03-31',
      name: 'America First Credit Union',
      charterNumber: '24694',
      priority: 'High',
      status: 'Recurring research captured',
      summary:
        'Large Utah FCU with a $16.75B loan book, $6.64B in indirect loans, $7.47B in new/used vehicle loans, and the strongest indirect auto exposure captured so far.',
      profile: {
        ncuaName: 'AMERICA FIRST',
        type: 'FCU',
        status: 'Active',
        charterState: '',
        region: '8 - ONES',
        fieldOfMembership: 'Multiple common bond - other',
        lowIncomeDesignation: true,
        federalHomeLoanBankMember: true,
        peerGroup: '6 - $500,000,000 and greater',
        assets: 24729579208,
        members: 1552965,
        ceo: 'Thayne Shaffer',
        website: 'http://www.americafirst.com',
        phone: '801-627-0900',
        mainOffice: {
          street: '4774 S 1300 W Bldg 3',
          city: 'Riverdale',
          state: 'UT',
          zip: '84405-3621',
          county: 'Weber',
          country: 'United States',
          latitude: 41.1762711,
          longitude: -112.0136344,
          geocodePrecision: 'Address-level OpenStreetMap Nominatim match naming America First Credit Union Corporate Campus'
        }
      },
      callReport: {
        cycleDate: '2026-03-31',
        reportLabel: 'March 2026 NCUA 5300 Call Report',
        totals: {
          loansHeldForSale: 23054922,
          totalLoansAndLeases: { count: 943770, amount: 16747592302 },
          allowanceForCreditLossesLoansAndLeases: 310023350,
          accruedInterestOnLoansAndLeases: 64110603,
          loansGrantedYtd: { count: 61607, amount: 1789303303 },
          sbaNonCommercialLoans: { count: 203, amount: 50394541, guaranteedPortion: 38586473 },
          sbaCommercialLoans: { count: 254, amount: 297672432, guaranteedPortion: 217803244 },
          loansToOfficials: { count: 127, amount: 3953092 },
          loansAboveFcuInterestRateCeiling: { amount: 558015053, weightedAverageRate: 16.98 }
        },
        loanCategories: [
          {
            label: 'Unsecured Credit Card Loans',
            accountAmountCode: '396',
            interestRate: 14.99,
            count: 274643,
            amount: 992304746,
            productFit: 'Credit insurance/debt protection - unsecured consumer'
          },
          {
            label: 'Payday Alternative Loans (PALs I and PALs II)',
            accountAmountCode: '397A',
            interestRate: 0,
            count: 0,
            amount: 0,
            productFit: 'Not material in this call report'
          },
          {
            label: 'Non-Federally Guaranteed Student Loans',
            accountAmountCode: '698A',
            interestRate: 0,
            count: 0,
            amount: 0,
            productFit: 'Not material in this call report'
          },
          {
            label: 'All Other Unsecured Loans/Lines of Credit',
            accountAmountCode: '397',
            interestRate: 16.49,
            count: 164199,
            amount: 288806980,
            productFit: 'Credit insurance/debt protection - unsecured consumer'
          },
          {
            label: 'New Vehicle Loans',
            accountAmountCode: '385',
            interestRate: 4.99,
            count: 46368,
            amount: 1406594569,
            productFit: 'VSC, GAP, credit insurance, debt protection'
          },
          {
            label: 'Used Vehicle Loans',
            accountAmountCode: '370',
            interestRate: 4.99,
            count: 321165,
            amount: 6063595712,
            productFit: 'VSC, GAP, credit insurance, debt protection'
          },
          {
            label: 'Leases Receivable',
            accountAmountCode: '002',
            interestRate: 0,
            count: 0,
            amount: 0,
            productFit: 'Not material in this call report'
          },
          {
            label: 'All Other Secured Non-Real Estate Loans/Lines of Credit',
            accountAmountCode: '698C',
            interestRate: 7.49,
            count: 78577,
            amount: 1836041345,
            productFit: 'CPI and secured consumer protection review'
          },
          {
            label: 'First Lien 1- to 4-Family Residential Property Loans/Lines of Credit',
            accountAmountCode: '703A',
            interestRate: 6.4,
            count: 10884,
            amount: 1371786917,
            productFit: 'Mortgage protection / life-disability review'
          },
          {
            label: 'Junior Lien 1- to 4-Family Residential Property Loans/Lines of Credit',
            accountAmountCode: '386A',
            interestRate: 7.49,
            count: 46315,
            amount: 3126023767,
            productFit: 'Mortgage protection / debt protection review'
          },
          {
            label: 'All Other Non-Commercial Real Estate Loans/Lines of Credit',
            accountAmountCode: '386B',
            interestRate: 7.15,
            count: 26,
            amount: 4880316,
            productFit: 'Mortgage protection review'
          },
          {
            label: 'Commercial Loans/Lines of Credit Real Estate Secured',
            accountAmountCode: '718A5',
            interestRate: 6.75,
            count: 700,
            amount: 1619389157,
            productFit: 'Commercial relationship context; not core consumer protection model'
          },
          {
            label: 'Commercial Loans/Lines of Credit Not Real Estate Secured',
            accountAmountCode: '400P',
            interestRate: 18,
            count: 893,
            amount: 38168793,
            productFit: 'Commercial relationship context; not core consumer protection model'
          }
        ],
        delinquency: {
          totalDelinquentAmount30To59Days: 278324274,
          totalDelinquentAmount60PlusDays: 224745512,
          totalDelinquentLoanCount60PlusDays: 10899,
          indirectDelinquentAmount: 96329954,
          nonCommercialNonAccrualAmount: 205774245,
          commercialNonAccrualAmount: 62840779,
          bankruptcyClaimsOutstandingBalance: 15407344,
          borrowerDifficultyModifiedLoans: { count: 589, amount: 15064684 },
          borrowerDifficultyNotInCompliance: { count: 466, amount: 12084124 }
        },
        chargeOffAndRecoveryYtd: [
          { label: 'Unsecured Credit Card Loans', chargeOffs: 13304673, recoveries: 2125999 },
          { label: 'Payday Alternative Loans (PALs I and PALs II)', chargeOffs: 0, recoveries: 0 },
          { label: 'Non-Federally Guaranteed Student Loans', chargeOffs: 0, recoveries: 0 },
          { label: 'All Other Unsecured Loans/Lines of Credit', chargeOffs: 4427012, recoveries: 1290231 },
          { label: 'New Vehicle Loans', chargeOffs: 3240589, recoveries: 849048 },
          { label: 'Used Vehicle Loans', chargeOffs: 23297352, recoveries: 6268226 },
          { label: 'Leases Receivable', chargeOffs: 0, recoveries: 0 },
          { label: 'All Other Secured Non-Real Estate Loans/Lines of Credit', chargeOffs: 7427560, recoveries: 1571245 },
          { label: 'First Lien Residential Property Loans/Lines of Credit', chargeOffs: 0, recoveries: 3126 },
          { label: 'Junior Lien Residential Property Loans/Lines of Credit', chargeOffs: 1551772, recoveries: 79124 },
          { label: 'All Other Non-Commercial Real Estate Loans/Lines of Credit', chargeOffs: 0, recoveries: 0 },
          { label: 'Commercial Loans', chargeOffs: 0, recoveries: 0 },
          { label: 'Total Loans and Leases', chargeOffs: 53248958, recoveries: 12186999 },
          { label: 'Indirect Loans', chargeOffs: 24473904, recoveries: 6078426 }
        ],
        indirectLoans: [
          {
            label: 'New and Used Vehicle Loans',
            count: 243177,
            amount: 5398917331,
            countAccountCode: 'IN0001',
            amountAccountCode: 'IN0002',
            source: 'Schedule A, Section 5'
          },
          {
            label: 'First Lien and Junior Lien Residential Loans',
            count: 12,
            amount: 874172,
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
            count: 48415,
            amount: 1244535708,
            countAccountCode: 'IN0007',
            amountAccountCode: 'IN0008',
            source: 'Schedule A, Section 5'
          }
        ],
        indirectTotals: {
          count: 291604,
          amount: 6644327211,
          countAccountCode: '617A',
          amountAccountCode: '618A',
          delinquentAmount: 96329954,
          delinquentAmountAccountCode: '041E',
          chargeOffsYtd: 24473904,
          chargeOffsAccountCode: '550E',
          recoveriesYtd: 6078426,
          recoveriesAccountCode: '551E'
        },
        derivedMetrics: {
          nonCommercialLoanBalance: 15090034352,
          autoLoanBalance: 7470190281,
          autoLoanCount: 367533,
          directAutoLoanBalance: 2071272950,
          directAutoLoanCount: 124356,
          directAutoCalculation:
            'New vehicle plus used vehicle loans minus indirect new/used vehicle loans; count never below zero.',
          indirectShareOfLoanBook: 0.3967332791,
          indirectVehicleShareOfAutoBalance: 0.7227282208
        },
        realEstateDetails: {
          firstLienBalance: 1371786917,
          firstLienGrantedYtd: 214796628,
          juniorLienBalance: 3126023767,
          juniorLienGrantedYtd: 437843301,
          allOtherNonCommercialRealEstateBalance: 4880316,
          allOtherNonCommercialRealEstateGrantedYtd: 0,
          totalNonCommercialRealEstate: { count: 57225, amount: 4502691000, grantedYtd: 652639929 },
          constructionBalance: 157297914,
          repricesOrMaturesWithinFiveYears: 2459991304,
          interestOnlyPaymentOptionFirstLien: { count: 382, amount: 104643027, grantedYtd: 56564165 }
        },
        commercialDetails: {
          constructionAndDevelopmentMembers: { count: 39, amount: 115241442, grantedYtdCount: 10, grantedYtdAmount: 20864455 },
          securedByFarmlandMembers: { count: 0, amount: 0, grantedYtdCount: 1, grantedYtdAmount: 5000000 },
          multifamilyMembers: { count: 55, amount: 110281882, grantedYtdCount: 2, grantedYtdAmount: 1680000 },
          ownerOccupiedNonFarmNonResidentialMembers: { count: 386, amount: 616517498, grantedYtdCount: 20, grantedYtdAmount: 32445246 },
          nonOwnerOccupiedNonFarmNonResidentialMembers: { count: 207, amount: 679610015, grantedYtdCount: 8, grantedYtdAmount: 22523000 },
          totalCommercialRealEstateSecuredMembers: { count: 687, amount: 1521650837, grantedYtdCount: 41, grantedYtdAmount: 82512701 },
          commercialAndIndustrialMembers: { count: 571, amount: 32556462, grantedYtdCount: 62, grantedYtdAmount: 3561986 },
          unsecuredCommercialMembers: { count: 5, amount: 220854, grantedYtdCount: 0, grantedYtdAmount: 0 },
          unsecuredRevolvingCommercialMembers: { count: 317, amount: 5391477, grantedYtdCount: 19, grantedYtdAmount: 484694 },
          commercialMemberLoans: { count: 1580, amount: 1559819630, grantedYtdCount: 122, grantedYtdAmount: 86559381 },
          totalCommercialNonmemberLoans: { count: 13, amount: 97738320, grantedYtdCount: 2, grantedYtdAmount: 28618116 },
          totalCommercialLoans: { count: 1593, amount: 1657557950 },
          outstandingAgriculturalRelatedLoans: { count: 0, amount: 0 },
          commercialRealEstateRepricesOrMaturesWithinFiveYears: 1082557299,
          commercialParticipationsSoldServicingRetained: { count: 2, amount: 21898619 },
          commercialLoansSoldServicingRetained: { count: 0, amount: 0 },
          totalMemberBusinessLoansNet: 1465927346,
          commercialUnfundedCommitments: 140359890
        },
        purchasedAndSoldLoans: {
          purchasedFromOtherFinancialInstitutionsYtd: { count: 0, amount: 0 },
          purchasedFromOtherFinancialInstitutionsOutstanding: { count: 0, amount: 0 },
          purchasedFromOtherSourcesYtd: { count: 0, amount: 0 },
          purchasedFromOtherSourcesOutstanding: { count: 0, amount: 0 },
          loansSoldYtd: { count: 75, amount: 29064060 },
          firstMortgageLoansSoldSecondaryMarketYtd: { count: 75, amount: 29064060 },
          realEstateLoansSoldServicingRetained: { ytdCount: 75, ytdAmount: 29064060, outstandingCount: 16063, outstandingAmount: 2721148035 },
          allOtherLoansSoldServicingRetained: { ytdCount: 0, ytdAmount: 0, outstandingCount: 0, outstandingAmount: 0 },
          loanParticipations: {
            purchasedYtd: 198414667,
            purchasedOutstanding: 81798281,
            soldYtd: 83001058,
            soldOutstanding: 0
          }
        },
        unfundedCommitments: {
          commercialLoans: 140359890,
          revolvingOpenEndSecuredByResidentialProperty: 2828654083,
          creditCardLines: 2974938741,
          unsecuredShareDraftLinesOfCredit: 480489963,
          unusedOverdraftProtectionProgram: 884591139,
          otherUnfundedCommitments: 2320879,
          totalNonCommercialLoans: 7170994805,
          totalAllLoanTypes: 7311354695,
          unconditionallyCancelableAllLoanTypes: 4342340722,
          conditionallyCancelableCommercialLoans: 140359890,
          consumerLoansSecuredAndRealEstate: 2828654083,
          consumerLoansUnsecured: 0,
          totalConditionallyCancelable: 2969013973,
          financialStandbyLettersOfCredit: 7274386
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
        modeledMonthlyCreditLifePremium: 5734213.05,
        modeledMonthlyCreditDisabilityPremium: 12901979.37,
        modeledMonthlyDebtProtectionIuiPremium: 8027898.28,
        modeledMonthlyDirectAutoOriginations: 5181.5,
        modeledMonthlyVscGfsIncome: 829040,
        modeledMonthlyGapGfsIncome: 181352.5,
        notes: [
          'Credit and debt protection uses the repo AGENTS prospect heuristic on non-commercial loan balance.',
          'VSC and GAP use direct auto count after subtracting indirect vehicle loans from new/used vehicle counts.',
          'America First has very large indirect auto exposure, so the direct-auto model uses only the residual direct auto count after removing indirect vehicle loans.'
        ]
      },
      relationshipResearch: {
        capturedAt: '2026-06-20T17:12:00-05:00',
        source: 'LinkedIn Sales Navigator visible search results in authenticated Chrome session',
        searchUrl: 'https://www.linkedin.com/sales/search/people?keywords=America%20First%20Credit%20Union',
        resultSummary: '9K+ keyword results; page 1 of 100 visible during capture. Only visible cards showing America First Credit Union as current company were treated as relationship leads.',
        visibleLeads: [
          {
            name: 'Blake Terry',
            title: 'Deposit Management',
            company: 'America First Credit Union',
            location: 'Salt Lake City Metropolitan Area',
            tenure: '2 months in role and company',
            signal: 'Recently hired; 2nd degree with 30 mutual connections'
          },
          {
            name: 'Doug Youngberg',
            title: 'Identity and Access Management Architect',
            company: 'America First Credit Union',
            location: 'Clearfield, Utah, United States',
            tenure: '3 years 9 months in role; 30 years 6 months in company',
            signal: 'Long-tenured technology and systems contact; 3rd degree connection'
          }
        ],
        additionalVisibleNames: [
          'Robert Goebel',
          'Mike Salerno',
          'Debra Miles',
          'Brice M.',
          'Tammy Gallegos',
          'Courtney Fifield',
          'Kimberli Green, CCUE',
          'Troy K.',
          'Gerry Weston',
          'Zach Winegar',
          'Suzanne Oliver',
          'Thayne Shaffer',
          'Natalie Palmieri-Crosby, MBA',
          'Robbi Rederick',
          'Liz M. Escobar',
          'Kent Streuling, SPHR, SHRM-SCP',
          'Ben Christensen',
          'Katyanna Smith',
          'Brigitte Tebow',
          'Ken Ferrari, MBA',
          'Bill Bolton',
          'Bradley Long'
        ]
      },
      sources: [
        {
          label: 'NCUA Research a Credit Union',
          url: 'https://mapping.ncua.gov/ResearchCreditUnion',
          capturedAt: '2026-06-20'
        },
        {
          label: 'NCUA credit union details API for charter 24694',
          url: 'https://mapping.ncua.gov/api/CreditUnionDetails/GetCreditUnionDetails/24694',
          capturedAt: '2026-06-20'
        },
        {
          label: 'NCUA March 2026 call report download endpoint',
          url: 'https://mapping.ncua.gov/api/CreditUnionDetails/GetDownloadCallReport/24694?isCorpCU=false&cycleDate=03/31/2026',
          capturedAt: '2026-06-20'
        },
        {
          label: 'OpenStreetMap Nominatim geocode for main office address',
          url: 'https://nominatim.openstreetmap.org/search?format=json&q=4774%20S%201300%20W%2C%20Riverdale%2C%20UT%2084405',
          capturedAt: '2026-06-20'
        },
        {
          label: 'LinkedIn Sales Navigator people search snapshot',
          url: 'https://www.linkedin.com/sales/search/people?keywords=America%20First%20Credit%20Union',
          capturedAt: '2026-06-20'
        }
      ],
      dataQuality: [
        'NCUA call-report endpoint returned a JSON byte array for the PDF; bytes were decoded before text extraction.',
        'PDF text extraction matched Schedule A loan lines, indirect loan totals, delinquency, charge-off/recovery, real estate, commercial, loan sale/participation, and unfunded commitment sections.',
        'OpenStreetMap returned an address-level match naming America First Credit Union Corporate Campus.',
        'Sales Navigator keyword results were broad; only visible cards with America First Credit Union shown as current company were promoted to visible leads.'
      ]
    },
    {
      id: 'golden-1-61650-2026-03-31',
      name: 'The Golden 1 Credit Union',
      charterNumber: '61650',
      priority: 'High',
      status: 'Recurring research captured',
      summary:
        'Large California FISCU with a $16.18B loan book, $4.11B in indirect loans, $4.51B in new/used vehicle loans, and a large first-lien mortgage portfolio.',
      profile: {
        ncuaName: 'THE GOLDEN 1',
        type: 'FISCU',
        status: 'Active',
        charterState: 'California',
        region: '8 - ONES',
        fieldOfMembership: 'Non-Federal Credit Union',
        lowIncomeDesignation: true,
        federalHomeLoanBankMember: true,
        peerGroup: '6 - $500,000,000 and greater',
        assets: 21737187207,
        members: 1195395,
        ceo: 'Donna A Bland',
        website: 'http://www.golden1.com',
        phone: '916-732-2900',
        mainOffice: {
          street: '8945 Cal Center Dr',
          city: 'Sacramento',
          state: 'CA',
          zip: '95826-3239',
          county: 'Sacramento',
          country: 'United States',
          latitude: 38.55698,
          longitude: -121.375994,
          geocodePrecision: 'Address-level OpenStreetMap Nominatim match for 8945 Cal Center Drive; POI name not returned'
        }
      },
      callReport: {
        cycleDate: '2026-03-31',
        reportLabel: 'March 2026 NCUA 5300 Call Report',
        totals: {
          loansHeldForSale: 566381,
          totalLoansAndLeases: { count: 497905, amount: 16177394521 },
          allowanceForCreditLossesLoansAndLeases: 178266030,
          accruedInterestOnLoansAndLeases: 55316815,
          loansGrantedYtd: { count: 221485, amount: 1662118772 },
          sbaNonCommercialLoans: { count: 0, amount: 0, guaranteedPortion: 0 },
          sbaCommercialLoans: { count: 0, amount: 0, guaranteedPortion: 0 },
          loansToOfficials: { count: 71, amount: 4999602 }
        },
        loanCategories: [
          {
            label: 'Unsecured Credit Card Loans',
            accountAmountCode: '396',
            interestRate: 16.49,
            count: 175835,
            amount: 760920582,
            productFit: 'Credit insurance/debt protection - unsecured consumer'
          },
          {
            label: 'Payday Alternative Loans (PALs I and PALs II)',
            accountAmountCode: '397A',
            interestRate: null,
            count: 0,
            amount: 0,
            productFit: 'Not applicable to this FISCU call report line'
          },
          {
            label: 'Non-Federally Guaranteed Student Loans',
            accountAmountCode: '698A',
            interestRate: 0,
            count: 0,
            amount: 0,
            productFit: 'Not material in this call report'
          },
          {
            label: 'All Other Unsecured Loans/Lines of Credit',
            accountAmountCode: '397',
            interestRate: 11.49,
            count: 79068,
            amount: 633237889,
            productFit: 'Credit insurance/debt protection - unsecured consumer'
          },
          {
            label: 'New Vehicle Loans',
            accountAmountCode: '385',
            interestRate: 6.09,
            count: 71044,
            amount: 2135380776,
            productFit: 'VSC, GAP, credit insurance, debt protection'
          },
          {
            label: 'Used Vehicle Loans',
            accountAmountCode: '370',
            interestRate: 6.79,
            count: 115797,
            amount: 2376236082,
            productFit: 'VSC, GAP, credit insurance, debt protection'
          },
          {
            label: 'Leases Receivable',
            accountAmountCode: '002',
            interestRate: 0,
            count: 0,
            amount: 0,
            productFit: 'Not material in this call report'
          },
          {
            label: 'All Other Secured Non-Real Estate Loans/Lines of Credit',
            accountAmountCode: '698C',
            interestRate: 7.74,
            count: 25900,
            amount: 337560771,
            productFit: 'CPI and secured consumer protection review'
          },
          {
            label: 'First Lien 1- to 4-Family Residential Property Loans/Lines of Credit',
            accountAmountCode: '703A',
            interestRate: 6.13,
            count: 16683,
            amount: 7412511796,
            productFit: 'Mortgage protection / life-disability review'
          },
          {
            label: 'Junior Lien 1- to 4-Family Residential Property Loans/Lines of Credit',
            accountAmountCode: '386A',
            interestRate: 7.25,
            count: 13149,
            amount: 872237207,
            productFit: 'Mortgage protection / debt protection review'
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
            interestRate: 5.44,
            count: 429,
            amount: 1649309418,
            productFit: 'Commercial relationship context; not core consumer protection model'
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
        delinquency: {
          totalDelinquentAmount30To59Days: 166216950,
          totalDelinquentAmount60PlusDays: 111760657,
          totalDelinquentLoanCount60PlusDays: 7184,
          participationLoansPurchasedDelinquentAmount: 1359220,
          indirectDelinquentAmount: 48585052,
          wholeOrPartialLoansPurchasedDelinquentAmount: 915384,
          nonCommercialNonAccrualAmount: 111760657,
          commercialNonAccrualAmount: 0,
          bankruptcyClaimsOutstandingBalance: 10875752,
          borrowerDifficultyModifiedLoans: { count: 1974, amount: 69383776 },
          borrowerDifficultyNotInCompliance: { count: 411, amount: 15685289 }
        },
        chargeOffAndRecoveryYtd: [
          { label: 'Unsecured Credit Card Loans', chargeOffs: 12455166, recoveries: 772951 },
          { label: 'Payday Alternative Loans (PALs I and PALs II)', chargeOffs: 0, recoveries: 0 },
          { label: 'Non-Federally Guaranteed Student Loans', chargeOffs: 0, recoveries: 0 },
          { label: 'All Other Unsecured Loans/Lines of Credit', chargeOffs: 10981269, recoveries: 981268 },
          { label: 'New Vehicle Loans', chargeOffs: 7285429, recoveries: 2047319 },
          { label: 'Used Vehicle Loans', chargeOffs: 9822891, recoveries: 2785869 },
          { label: 'Leases Receivable', chargeOffs: 0, recoveries: 0 },
          { label: 'All Other Secured Non-Real Estate Loans/Lines of Credit', chargeOffs: 1789349, recoveries: 217192 },
          { label: 'First Lien Residential Property Loans/Lines of Credit', chargeOffs: 421619, recoveries: 0 },
          { label: 'Junior Lien Residential Property Loans/Lines of Credit', chargeOffs: 10331, recoveries: 27662 },
          { label: 'All Other Non-Commercial Real Estate Loans/Lines of Credit', chargeOffs: 0, recoveries: 0 },
          { label: 'Commercial Loans', chargeOffs: 0, recoveries: 0 },
          { label: 'Total Loans and Leases', chargeOffs: 42766054, recoveries: 6832261 },
          { label: 'Participation Loans Purchased', chargeOffs: 516248, recoveries: 181123 },
          { label: 'Indirect Loans', chargeOffs: 17268659, recoveries: 4479700 },
          { label: 'Whole or Partial Loans Purchased', chargeOffs: 941709, recoveries: 204272 }
        ],
        indirectLoans: [
          {
            label: 'New and Used Vehicle Loans',
            count: 147710,
            amount: 3821531870,
            countAccountCode: 'IN0001',
            amountAccountCode: 'IN0002',
            source: 'Schedule A, Section 5'
          },
          {
            label: 'First Lien and Junior Lien Residential Loans',
            count: 7,
            amount: 1007226,
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
            count: 7566,
            amount: 287780706,
            countAccountCode: 'IN0007',
            amountAccountCode: 'IN0008',
            source: 'Schedule A, Section 5'
          }
        ],
        indirectTotals: {
          count: 155283,
          amount: 4110319802,
          countAccountCode: '617A',
          amountAccountCode: '618A',
          delinquentAmount: 48585052,
          delinquentAmountAccountCode: '041E',
          chargeOffsYtd: 17268659,
          chargeOffsAccountCode: '550E',
          recoveriesYtd: 4479700,
          recoveriesAccountCode: '551E'
        },
        derivedMetrics: {
          nonCommercialLoanBalance: 14528085103,
          autoLoanBalance: 4511616858,
          autoLoanCount: 186841,
          directAutoLoanBalance: 690084988,
          directAutoLoanCount: 39131,
          directAutoCalculation:
            'New vehicle plus used vehicle loans minus indirect new/used vehicle loans; count never below zero.',
          indirectShareOfLoanBook: 0.254077985,
          indirectVehicleShareOfAutoBalance: 0.8470426435
        },
        realEstateDetails: {
          firstLienBalance: 7412511796,
          firstLienGrantedYtd: 339847010,
          juniorLienBalance: 872237207,
          juniorLienGrantedYtd: 137619403,
          allOtherNonCommercialRealEstateBalance: 0,
          allOtherNonCommercialRealEstateGrantedYtd: 0,
          totalNonCommercialRealEstate: { count: 29832, amount: 8284749003, grantedYtd: 477466413 },
          constructionBalance: 0,
          repricesOrMaturesWithinFiveYears: 2851229004,
          interestOnlyPaymentOptionFirstLien: { count: 1601, amount: 120074746, grantedYtd: 17758721 }
        },
        commercialDetails: {
          constructionAndDevelopmentMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          securedByFarmlandMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          multifamilyMembers: { count: 207, amount: 610759395, grantedYtdCount: 18, grantedYtdAmount: 46719000 },
          ownerOccupiedNonFarmNonResidentialMembers: { count: 12, amount: 55504546, grantedYtdCount: 0, grantedYtdAmount: 0 },
          nonOwnerOccupiedNonFarmNonResidentialMembers: { count: 204, amount: 940850652, grantedYtdCount: 18, grantedYtdAmount: 59717886 },
          totalCommercialRealEstateSecuredMembers: { count: 423, amount: 1607114593, grantedYtdCount: 36, grantedYtdAmount: 106436886 },
          commercialAndIndustrialMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          unsecuredCommercialMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          unsecuredRevolvingCommercialMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          commercialMemberLoans: { count: 423, amount: 1607114593, grantedYtdCount: 36, grantedYtdAmount: 106436886 },
          totalCommercialNonmemberLoans: { count: 6, amount: 42194825, grantedYtdCount: 0, grantedYtdAmount: 0 },
          totalCommercialLoans: { count: 429, amount: 1649309418 },
          outstandingAgriculturalRelatedLoans: { count: 0, amount: 0 },
          commercialRealEstateRepricesOrMaturesWithinFiveYears: 1572926864,
          commercialParticipationsSoldServicingRetained: { count: 0, amount: 0 },
          commercialLoansSoldServicingRetained: { count: 0, amount: 0 },
          totalMemberBusinessLoansNet: 1610692234,
          commercialUnfundedCommitments: 3577642
        },
        purchasedAndSoldLoans: {
          purchasedFromOtherFinancialInstitutionsYtd: { count: 0, amount: 0 },
          purchasedFromOtherFinancialInstitutionsOutstanding: { count: 0, amount: 0 },
          purchasedFromOtherSourcesYtd: { count: 0, amount: 0 },
          purchasedFromOtherSourcesOutstanding: { count: 5533, amount: 68720985 },
          loansSoldYtd: { count: 21, amount: 5449699 },
          firstMortgageLoansSoldSecondaryMarketYtd: { count: 12, amount: 5205257 },
          realEstateLoansSoldServicingRetained: { ytdCount: 0, ytdAmount: 0, outstandingCount: 4616, outstandingAmount: 899824650 },
          allOtherLoansSoldServicingRetained: { ytdCount: 0, ytdAmount: 0, outstandingCount: 0, outstandingAmount: 0 },
          loanParticipations: {
            purchasedYtd: 408169559,
            purchasedOutstanding: 0,
            soldYtd: 1364345,
            soldOutstanding: 0
          }
        },
        unfundedCommitments: {
          commercialLoans: 3577642,
          revolvingOpenEndSecuredByResidentialProperty: 1052299096,
          creditCardLines: 2096745078,
          unsecuredShareDraftLinesOfCredit: 250109594,
          unusedOverdraftProtectionProgram: 20380833,
          otherUnfundedCommitments: 0,
          totalNonCommercialLoans: 3419534601,
          totalAllLoanTypes: 3423112243,
          unconditionallyCancelableAllLoanTypes: 2367235505,
          conditionallyCancelableCommercialLoans: 3577642,
          consumerLoansSecuredAndRealEstate: 1052299096,
          consumerLoansUnsecured: 0,
          totalConditionallyCancelable: 1055876738,
          consumerLoansTransferredWithLimitedRecourse: 2248970
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
        modeledMonthlyCreditLifePremium: 5520672.34,
        modeledMonthlyCreditDisabilityPremium: 12421512.76,
        modeledMonthlyDebtProtectionIuiPremium: 7728941.27,
        modeledMonthlyDirectAutoOriginations: 1630.46,
        modeledMonthlyVscGfsIncome: 260873.33,
        modeledMonthlyGapGfsIncome: 57066.04,
        notes: [
          'Credit and debt protection uses the repo AGENTS prospect heuristic on non-commercial loan balance.',
          'VSC and GAP use direct auto count after subtracting indirect vehicle loans from new/used vehicle counts.',
          'Golden 1 has a high indirect vehicle share, so direct VSC/GAP estimates intentionally use only the adjusted direct auto count.'
        ]
      },
      relationshipResearch: {
        capturedAt: '2026-06-20T17:22:00-05:00',
        source: 'LinkedIn Sales Navigator attempted in authenticated Chrome session; page snapshot timed out before visible leads could be read',
        searchUrl: 'https://www.linkedin.com/sales/search/people?keywords=The%20Golden%201%20Credit%20Union',
        resultSummary: 'No visible professional leads captured because Sales Navigator page reads repeatedly timed out and reset the Chrome automation session.',
        visibleLeads: [],
        additionalVisibleNames: []
      },
      sources: [
        {
          label: 'NCUA Research a Credit Union',
          url: 'https://mapping.ncua.gov/ResearchCreditUnion',
          capturedAt: '2026-06-20'
        },
        {
          label: 'NCUA credit union details API for charter 61650',
          url: 'https://mapping.ncua.gov/api/CreditUnionDetails/GetCreditUnionDetails/61650',
          capturedAt: '2026-06-20'
        },
        {
          label: 'NCUA March 2026 call report download endpoint',
          url: 'https://mapping.ncua.gov/api/CreditUnionDetails/GetDownloadCallReport/61650?isCorpCU=false&cycleDate=03/31/2026',
          capturedAt: '2026-06-20'
        },
        {
          label: 'OpenStreetMap Nominatim geocode for main office address',
          url: 'https://nominatim.openstreetmap.org/search?format=json&q=8945%20Cal%20Center%20Dr%2C%20Sacramento%2C%20CA%2095826-3239',
          capturedAt: '2026-06-20'
        },
        {
          label: 'LinkedIn Sales Navigator people search attempt',
          url: 'https://www.linkedin.com/sales/search/people?keywords=The%20Golden%201%20Credit%20Union',
          capturedAt: '2026-06-20'
        }
      ],
      dataQuality: [
        'NCUA call-report endpoint returned a JSON byte array for the PDF; bytes were decoded before text extraction.',
        'PDF text extraction matched Schedule A loan lines, indirect loan totals, delinquency, charge-off/recovery, real estate, commercial, loan sale/participation, and unfunded commitment sections.',
        'OpenStreetMap returned address-level coordinates for 8945 Cal Center Drive but did not return a named Golden 1 POI.',
        'Sales Navigator relationship research could not be captured because the authenticated search page repeatedly timed out the Chrome automation session before a readable result snapshot was available.'
      ]
    },
    {
      id: 'schoolsfirst-24212-2026-03-31',
      name: 'SchoolsFirst Federal Credit Union',
      charterNumber: '24212',
      priority: 'High',
      status: 'Recurring research captured',
      summary:
        'Large California FCU with a $22.33B loan book, $5.86B in new/used vehicle loans, and $2.49B in reported indirect loans including $2.48B indirect vehicle exposure.',
      profile: {
        ncuaName: 'SCHOOLSFIRST',
        type: 'FCU',
        status: 'Active',
        charterState: 'California',
        charterYear: 1985,
        fieldOfMembership: 'Educational',
        lowIncomeDesignation: 'No',
        fhlbMember: 'Yes',
        region: '8 - ONES',
        peerGroup: '6 - $500,000,000 and greater',
        assets: 36737428874,
        members: 1568368,
        ceo: 'Bill Cheney',
        website: 'https://www.schoolsfirstfcu.org',
        phone: '800-462-8328',
        mainOffice: {
          street: '15332 Newport Ave',
          city: 'Tustin',
          state: 'CA',
          zip: '92780',
          county: 'Orange',
          country: 'United States',
          latitude: 33.7218624,
          longitude: -117.8348357,
          geocodePrecision: 'Address-level OpenStreetMap building match for the NCUA main-office address'
        }
      },
      callReport: {
        cycleDate: '2026-03-31',
        reportLabel: 'March 2026 NCUA 5300 Call Report',
        totals: {
          loansHeldForSale: 10041218,
          totalLoansAndLeases: { count: 1135119, amount: 22331794817 },
          allowanceForCreditLossesLoansAndLeases: 225866571,
          accruedInterestOnLoansAndLeases: 82930268,
          loansGrantedYtd: { count: 94322, amount: 2157300944 }
        },
        loanCategories: [
          {
            label: 'Unsecured Credit Card Loans',
            accountAmountCode: '396',
            interestRate: 13.25,
            count: 380613,
            amount: 1433072763,
            productFit: 'Credit insurance/debt protection - unsecured consumer'
          },
          {
            label: 'Payday Alternative Loans (PALs I and PALs II)',
            accountAmountCode: '397A',
            interestRate: 0,
            count: 0,
            amount: 0,
            productFit: 'Not material in this call report'
          },
          {
            label: 'Non-Federally Guaranteed Student Loans',
            accountAmountCode: '698A',
            interestRate: 0,
            count: 0,
            amount: 0,
            productFit: 'Not material in this call report'
          },
          {
            label: 'All Other Unsecured Loans/Lines of Credit',
            accountAmountCode: '397',
            interestRate: 14.49,
            count: 396894,
            amount: 2386205367,
            productFit: 'Credit insurance/debt protection - unsecured consumer'
          },
          {
            label: 'New Vehicle Loans',
            accountAmountCode: '385',
            interestRate: 4.74,
            count: 96494,
            amount: 2507899828,
            productFit: 'VSC, GAP, credit insurance, debt protection'
          },
          {
            label: 'Used Vehicle Loans',
            accountAmountCode: '370',
            interestRate: 5.44,
            count: 198282,
            amount: 3350174323,
            productFit: 'VSC, GAP, credit insurance, debt protection'
          },
          {
            label: 'Leases Receivable',
            accountAmountCode: '002',
            interestRate: 0,
            count: 0,
            amount: 0,
            productFit: 'Not material in this call report'
          },
          {
            label: 'All Other Secured Non-Real Estate Loans/Lines of Credit',
            accountAmountCode: '698C',
            interestRate: 6.47,
            count: 525,
            amount: 7069997,
            productFit: 'Collateral and consumer protection review'
          },
          {
            label: 'First Lien 1- to 4-Family Residential Property Loans/Lines',
            accountAmountCode: '703A',
            interestRate: 5.5,
            count: 28031,
            amount: 9346406767,
            productFit: 'Mortgage credit insurance review'
          },
          {
            label: 'Junior Lien 1- to 4-Family Residential Property Loans/Lines',
            accountAmountCode: '386A',
            interestRate: 6.25,
            count: 34212,
            amount: 3027300782,
            productFit: 'Home-equity credit protection review'
          },
          {
            label: 'All Other Non-Commercial Real Estate Loans/Lines',
            accountAmountCode: '386B',
            interestRate: 0,
            count: 0,
            amount: 0,
            productFit: 'Not material in this call report'
          },
          {
            label: 'Commercial Real Estate Secured Loans/Lines',
            accountAmountCode: '718A5',
            interestRate: 5.92,
            count: 66,
            amount: 273609227,
            productFit: 'Commercial participation concentration review'
          },
          {
            label: 'Commercial Loans/Lines Not Secured by Real Estate',
            accountAmountCode: '400P',
            interestRate: 0,
            count: 2,
            amount: 55763,
            productFit: 'Not material in this call report'
          }
        ],
        chargeOffAndRecoveryYtd: [
          { label: 'Unsecured Credit Card Loans', chargeOffs: 25120754, recoveries: 3356220 },
          { label: 'Payday Alternative Loans (PALs I and PALs II)', chargeOffs: 0, recoveries: 0 },
          { label: 'Non-Federally Guaranteed Student Loans', chargeOffs: 0, recoveries: 0 },
          { label: 'All Other Unsecured Loans/Lines of Credit', chargeOffs: 31006308, recoveries: 3040687 },
          { label: 'New Vehicle Loans', chargeOffs: 3335461, recoveries: 649943 },
          { label: 'Used Vehicle Loans', chargeOffs: 10472973, recoveries: 2178231 },
          { label: 'Leases Receivable', chargeOffs: 0, recoveries: 0 },
          { label: 'All Other Secured Non-Real Estate Loans/Lines of Credit', chargeOffs: 0, recoveries: 20 },
          { label: 'First Lien Residential Property Loans/Lines of Credit', chargeOffs: 0, recoveries: 0 },
          { label: 'Junior Lien Residential Property Loans/Lines of Credit', chargeOffs: 0, recoveries: 75723 },
          { label: 'All Other Non-Commercial Real Estate Loans/Lines of Credit', chargeOffs: 0, recoveries: 0 },
          { label: 'Commercial Loans', chargeOffs: 0, recoveries: 0 },
          { label: 'Total Loans and Leases', chargeOffs: 69935496, recoveries: 9300824 },
          { label: 'Participation Loans Purchased', chargeOffs: 1105043, recoveries: 352397 },
          { label: 'Indirect Loans', chargeOffs: 6565572, recoveries: 1409555 },
          { label: 'Whole/Partial Purchased Loans', chargeOffs: 0, recoveries: 0 }
        ],
        delinquency: {
          totalDelinquent30To59Amount: 145330430,
          totalDelinquent60Plus: { count: 17582, amount: 198434206 },
          participationLoansPurchasedDelinquentAmount: 596868,
          indirectDelinquentAmount: 18844542,
          wholeOrPartialPurchasedLoansDelinquentAmount: 0,
          nonCommercialNonAccrualAmount: 137414657,
          commercialNonAccrualAmount: 0,
          bankruptcyClaimsOutstanding: 59278886,
          borrowerDifficultyModifiedLoans: { count: 2154, amount: 45598569 },
          borrowerDifficultyModifiedLoansNotInCompliance: { count: 1523, amount: 34280833 }
        },
        indirectLoans: [
          {
            label: 'New and Used Vehicle Loans',
            count: 110768,
            amount: 2479230141,
            countAccountCode: 'IN0001',
            amountAccountCode: 'IN0002',
            source: 'Schedule A, Section 5'
          },
          {
            label: 'First Lien and Junior Lien Residential Loans',
            count: 0,
            amount: 0,
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
            count: 1092,
            amount: 6258677,
            countAccountCode: 'IN0007',
            amountAccountCode: 'IN0008',
            source: 'Schedule A, Section 5'
          }
        ],
        indirectTotals: {
          count: 111860,
          amount: 2485488818,
          countAccountCode: '617A',
          amountAccountCode: '618A',
          delinquentAmount: 18844542,
          delinquentAmountAccountCode: '041E',
          chargeOffsYtd: 6565572,
          chargeOffsAccountCode: '550E',
          recoveriesYtd: 1409555,
          recoveriesAccountCode: '551E'
        },
        derivedMetrics: {
          nonCommercialLoanBalance: 22058129827,
          autoLoanBalance: 5858074151,
          autoLoanCount: 294776,
          directAutoLoanBalance: 3378844010,
          directAutoLoanCount: 184008,
          directAutoCalculation:
            'New vehicle plus used vehicle loans minus indirect new/used vehicle loans; count never below zero.',
          indirectShareOfLoanBook: 0.1112982113,
          indirectVehicleShareOfAutoBalance: 0.4232159029
        },
        realEstateDetails: {
          firstLienBalance: 9346406767,
          firstLienGrantedYtd: 493697793,
          juniorLienBalance: 3027300782,
          juniorLienGrantedYtd: 391075937,
          allOtherNonCommercialRealEstateBalance: 0,
          allOtherNonCommercialRealEstateGrantedYtd: 0,
          totalNonCommercialRealEstate: { count: 62243, amount: 12373707549, grantedYtd: 884773730 },
          constructionBalance: 0,
          repricesOrMaturesWithinFiveYears: 3623608504,
          interestOnlyPaymentOptionFirstLien: { count: 2394, amount: 214242195, grantedYtd: 59516000 }
        },
        commercialDetails: {
          constructionAndDevelopmentMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          securedByFarmlandMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          multifamilyMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          ownerOccupiedNonFarmNonResidentialMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          nonOwnerOccupiedNonFarmNonResidentialMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          totalCommercialRealEstateSecuredMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          commercialAndIndustrialMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          unsecuredCommercialMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          unsecuredRevolvingCommercialMembers: { count: 2, amount: 55763, grantedYtdCount: 0, grantedYtdAmount: 0 },
          commercialMemberLoans: { count: 2, amount: 55763, grantedYtdCount: 0, grantedYtdAmount: 0 },
          nonmemberConstructionAndDevelopment: { count: 2, amount: 6416896 },
          nonmemberMultifamily: { count: 21, amount: 88063621 },
          nonmemberOwnerOccupiedNonFarmNonResidential: { count: 4, amount: 3606339 },
          nonmemberNonOwnerOccupiedNonFarmNonResidential: { count: 39, amount: 175522371, grantedYtdCount: 1, grantedYtdAmount: 4900000 },
          totalCommercialRealEstateSecuredNonmembers: { count: 66, amount: 273609227, grantedYtdCount: 1, grantedYtdAmount: 4900000 },
          totalCommercialNonmemberLoans: { count: 66, amount: 273609227, grantedYtdCount: 1, grantedYtdAmount: 4900000 },
          totalCommercialLoans: { count: 68, amount: 273664990 },
          outstandingAgriculturalRelatedLoans: { count: 0, amount: 0 },
          commercialRealEstateRepricesOrMaturesWithinFiveYears: 213406838,
          commercialParticipationsSoldServicingRetained: { count: 0, amount: 0 },
          commercialLoansSoldServicingRetained: { count: 0, amount: 0 },
          totalMemberBusinessLoansNet: 100000,
          commercialUnfundedCommitments: 6582488
        },
        purchasedAndSoldLoans: {
          purchasedFromOtherFinancialInstitutionsYtd: { count: 0, amount: 0 },
          purchasedFromOtherFinancialInstitutionsOutstanding: { count: 0, amount: 0 },
          purchasedFromOtherSourcesYtd: { count: 0, amount: 0 },
          purchasedFromOtherSourcesOutstanding: { count: 0, amount: 0 },
          loansSoldYtd: { count: 84, amount: 33271883 },
          firstMortgageLoansSoldSecondaryMarketYtd: { count: 84, amount: 33271883 },
          realEstateLoansSoldServicingRetained: { ytdCount: 84, ytdAmount: 33271883, outstandingCount: 6305, outstandingAmount: 1443260902 },
          allOtherLoansSoldServicingRetained: { ytdCount: 0, ytdAmount: 0, outstandingCount: 0, outstandingAmount: 0 },
          loanParticipations: {
            vehicleNonCommercial: { purchasedYtd: 37798418, purchasedOutstanding: 0, soldYtd: 0, soldOutstanding: 0 },
            oneToFourFamilyResidential: { purchasedYtd: 2212268, purchasedOutstanding: 0, soldYtd: 0, soldOutstanding: 0 },
            commercialExcludingConstructionAndDevelopment: { purchasedYtd: 267192331, purchasedOutstanding: 4900000, soldYtd: 0, soldOutstanding: 0 },
            commercialConstructionAndDevelopment: { purchasedYtd: 6416896, purchasedOutstanding: 0, soldYtd: 0, soldOutstanding: 0 },
            allOther: { purchasedYtd: 6594736, purchasedOutstanding: 0, soldYtd: 0, soldOutstanding: 0 },
            total: { purchasedYtd: 320214649, purchasedOutstanding: 4900000, soldYtd: 0, soldOutstanding: 0 }
          }
        },
        unfundedCommitments: {
          commercialLoans: 6582488,
          revolvingOpenEndSecuredByResidentialProperty: 2346533632,
          creditCardLines: 3364999409,
          unsecuredShareDraftLinesOfCredit: 335177,
          unusedOverdraftProtectionProgram: 141838735,
          otherUnfundedCommitments: 38630530,
          totalNonCommercialLoans: 5892337483,
          totalAllLoanTypes: 5898919971,
          unconditionallyCancelableAllLoanTypes: 3365043646,
          conditionallyCancelableCommercialLoans: 6538251,
          consumerLoansSecuredAndRealEstate: 2346533632,
          consumerLoansUnsecured: 180804442,
          totalConditionallyCancelable: 2533876325,
          consumerLoansTransferredWithLimitedRecourse: 3159291
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
        modeledMonthlyCreditLifePremium: 8382089.33,
        modeledMonthlyCreditDisabilityPremium: 18859701,
        modeledMonthlyDebtProtectionIuiPremium: 11734925.07,
        modeledMonthlyDirectAutoOriginations: 7667,
        modeledMonthlyVscGfsIncome: 1226720,
        modeledMonthlyGapGfsIncome: 268345,
        notes: [
          'Credit and debt protection uses the repo AGENTS prospect heuristic on non-commercial loan balance.',
          'VSC and GAP use direct auto count after subtracting indirect vehicle loans from new/used vehicle counts.',
          'SchoolsFirst has a large absolute direct-auto estimate even after removing reported indirect vehicle loans.'
        ]
      },
      relationshipResearch: {
        capturedAt: '2026-06-20T17:32:00-05:00',
        source: 'LinkedIn Sales Navigator attempted in authenticated Chrome session; page snapshot timed out before visible leads could be read',
        searchUrl: 'https://www.linkedin.com/sales/search/people?keywords=SchoolsFirst%20Federal%20Credit%20Union',
        resultSummary: 'No visible professional leads captured because the SchoolsFirst Sales Navigator search page repeatedly timed out and reset the Chrome automation session before a readable result snapshot was available.',
        visibleLeads: [],
        additionalVisibleNames: []
      },
      sources: [
        {
          label: 'NCUA Research a Credit Union',
          url: 'https://mapping.ncua.gov/ResearchCreditUnion',
          capturedAt: '2026-06-20'
        },
        {
          label: 'NCUA credit union details API for charter 24212',
          url: 'https://mapping.ncua.gov/api/CreditUnionDetails/GetCreditUnionDetails/24212',
          capturedAt: '2026-06-20'
        },
        {
          label: 'NCUA March 2026 call report download endpoint',
          url: 'https://mapping.ncua.gov/api/CreditUnionDetails/GetDownloadCallReport/24212?isCorpCU=false&cycleDate=03/31/2026',
          capturedAt: '2026-06-20'
        },
        {
          label: 'OpenStreetMap Nominatim geocode for main office address',
          url: 'https://nominatim.openstreetmap.org/search?format=json&q=15332%20Newport%20Ave%2C%20Tustin%2C%20CA%2092780',
          capturedAt: '2026-06-20'
        },
        {
          label: 'LinkedIn Sales Navigator people search attempt',
          url: 'https://www.linkedin.com/sales/search/people?keywords=SchoolsFirst%20Federal%20Credit%20Union',
          capturedAt: '2026-06-20'
        }
      ],
      dataQuality: [
        'NCUA call-report endpoint returned a JSON byte array for the PDF; bytes were decoded before text extraction.',
        'PDF text extraction matched Schedule A loan categories, indirect loan totals, delinquency, charge-off/recovery, real estate, commercial, loan sale/participation, and unfunded commitment sections.',
        'OpenStreetMap returned an address-level building match for 15332 Newport Ave; a separate named SchoolsFirst POI was nearby at 15432 Newport Ave, so the NCUA address coordinates were retained.',
        'Sales Navigator relationship research could not be captured because the authenticated SchoolsFirst search page repeatedly timed out the Chrome automation session before a readable result snapshot was available.'
      ]
    },
    {
      id: 'mountain-america-24692-2026-03-31',
      name: 'Mountain America Credit Union',
      charterNumber: '24692',
      priority: 'High',
      status: 'Recurring research captured',
      summary:
        'Large Utah-based FCU with an $18.44B loan book, $6.22B in new/used vehicle loans, and $4.30B in reported indirect loans including $3.24B indirect vehicle exposure.',
      profile: {
        ncuaName: 'MOUNTAIN AMERICA',
        type: 'FCU',
        status: 'Active',
        charterState: 'Utah',
        charterYear: 1936,
        fieldOfMembership: 'Multiple common bond - other',
        lowIncomeDesignation: 'Yes',
        fhlbMember: 'Yes',
        region: '8 - ONES',
        peerGroup: '6 - $500,000,000 and greater',
        assets: 22659231635,
        members: 1433256,
        ceo: 'Sterling W Nielsen',
        website: 'http://www.macu.com',
        phone: '801-325-6220',
        mainOffice: {
          street: '9800 S Monroe St',
          city: 'Sandy',
          state: 'UT',
          zip: '84070',
          county: 'Salt Lake',
          country: 'United States',
          latitude: 40.5725681,
          longitude: -111.8991369,
          geocodePrecision: 'OpenStreetMap bank/POI match for 9800 South Monroe Street; exact NCUA abbreviation query returned only a road segment'
        }
      },
      callReport: {
        cycleDate: '2026-03-31',
        reportLabel: 'March 2026 NCUA 5300 Call Report',
        totals: {
          loansHeldForSale: 22796726,
          totalLoansAndLeases: { count: 1065348, amount: 18439836531 },
          allowanceForCreditLossesLoansAndLeases: 294538822,
          accruedInterestOnLoansAndLeases: 86553535,
          loansGrantedYtd: { count: 130115, amount: 1959366802 },
          paydayAlternativeLoansGrantedYtd: { count: 8335, amount: 7943726 }
        },
        loanCategories: [
          {
            label: 'Unsecured Credit Card Loans',
            accountAmountCode: '396',
            interestRate: 11.49,
            count: 458124,
            amount: 1086270745,
            productFit: 'Credit insurance/debt protection - unsecured consumer'
          },
          {
            label: 'Payday Alternative Loans (PALs I and PALs II)',
            accountAmountCode: '397A',
            interestRate: 28,
            count: 16287,
            amount: 10710580,
            productFit: 'Small-dollar consumer loan review'
          },
          {
            label: 'Non-Federally Guaranteed Student Loans',
            accountAmountCode: '698A',
            interestRate: 8,
            count: 1819,
            amount: 12400250,
            productFit: 'Consumer loan review'
          },
          {
            label: 'All Other Unsecured Loans/Lines of Credit',
            accountAmountCode: '397',
            interestRate: 13.24,
            count: 128594,
            amount: 827979385,
            productFit: 'Credit insurance/debt protection - unsecured consumer'
          },
          {
            label: 'New Vehicle Loans',
            accountAmountCode: '385',
            interestRate: 5.49,
            count: 21502,
            amount: 736938702,
            productFit: 'VSC, GAP, credit insurance, debt protection'
          },
          {
            label: 'Used Vehicle Loans',
            accountAmountCode: '370',
            interestRate: 5.49,
            count: 308334,
            amount: 5487881076,
            productFit: 'VSC, GAP, credit insurance, debt protection'
          },
          {
            label: 'Leases Receivable',
            accountAmountCode: '002',
            interestRate: 0,
            count: 0,
            amount: 0,
            productFit: 'Not material in this call report'
          },
          {
            label: 'All Other Secured Non-Real Estate Loans/Lines of Credit',
            accountAmountCode: '698C',
            interestRate: 7.74,
            count: 64805,
            amount: 1454271609,
            productFit: 'Collateral and consumer protection review'
          },
          {
            label: 'First Lien 1- to 4-Family Residential Property Loans/Lines',
            accountAmountCode: '703A',
            interestRate: 6.12,
            count: 19948,
            amount: 3972474412,
            productFit: 'Mortgage credit insurance review'
          },
          {
            label: 'Junior Lien 1- to 4-Family Residential Property Loans/Lines',
            accountAmountCode: '386A',
            interestRate: 7.24,
            count: 39039,
            amount: 2359916424,
            productFit: 'Home-equity credit protection review'
          },
          {
            label: 'All Other Non-Commercial Real Estate Loans/Lines',
            accountAmountCode: '386B',
            interestRate: 6.23,
            count: 13,
            amount: 336164,
            productFit: 'Not material in this call report'
          },
          {
            label: 'Commercial Real Estate Secured Loans/Lines',
            accountAmountCode: '718A5',
            interestRate: 6.23,
            count: 1612,
            amount: 2310799055,
            productFit: 'Commercial concentration and participation review'
          },
          {
            label: 'Commercial Loans/Lines Not Secured by Real Estate',
            accountAmountCode: '400P',
            interestRate: 6.49,
            count: 5271,
            amount: 179858129,
            productFit: 'Commercial member business loan review'
          }
        ],
        governmentGuaranteedLoans: {
          nonCommercialSba: { count: 305, balance: 50784157, guaranteedPortion: 35683231 },
          nonCommercialPppIncludedInSba: { count: 5, balance: 2563267 },
          nonCommercialOtherGovernmentGuaranteed: { count: 247, balance: 53086322, guaranteedPortion: 44992450 },
          commercialSba: { count: 767, balance: 553523252, guaranteedPortion: 194827742 },
          commercialOtherGovernmentGuaranteed: { count: 1, balance: 973900, guaranteedPortion: 779120 }
        },
        chargeOffAndRecoveryYtd: [
          { label: 'Unsecured Credit Card Loans', chargeOffs: 16106377, recoveries: 1253529 },
          { label: 'Payday Alternative Loans (PALs I and PALs II)', chargeOffs: 544392, recoveries: 117527 },
          { label: 'Non-Federally Guaranteed Student Loans', chargeOffs: 98349, recoveries: 43872 },
          { label: 'All Other Unsecured Loans/Lines of Credit', chargeOffs: 16973060, recoveries: 2882977 },
          { label: 'New Vehicle Loans', chargeOffs: 1770511, recoveries: 643427 },
          { label: 'Used Vehicle Loans', chargeOffs: 31260485, recoveries: 7983520 },
          { label: 'Leases Receivable', chargeOffs: 0, recoveries: 0 },
          { label: 'All Other Secured Non-Real Estate Loans/Lines of Credit', chargeOffs: 5776931, recoveries: 1529966 },
          { label: 'First Lien Residential Property Loans/Lines of Credit', chargeOffs: 73810, recoveries: 0 },
          { label: 'Junior Lien Residential Property Loans/Lines of Credit', chargeOffs: 639085, recoveries: 20051 },
          { label: 'All Other Non-Commercial Real Estate Loans/Lines of Credit', chargeOffs: 0, recoveries: 2901 },
          { label: 'Construction and Development Commercial Loans', chargeOffs: 0, recoveries: 0 },
          { label: 'Commercial and Industrial Loans', chargeOffs: 432181, recoveries: 98503 },
          { label: 'Unsecured Commercial Loans', chargeOffs: 14456, recoveries: 0 },
          { label: 'Unsecured Revolving Commercial Lines', chargeOffs: 268083, recoveries: 2135 },
          { label: 'Total Loans and Leases', chargeOffs: 73957720, recoveries: 14578408 },
          { label: 'Participation Loans Purchased', chargeOffs: 153802, recoveries: 26655 },
          { label: 'Indirect Loans', chargeOffs: 20163571, recoveries: 5789966 },
          { label: 'Whole/Partial Purchased Loans', chargeOffs: 0, recoveries: 0 }
        ],
        delinquency: {
          totalDelinquent30To59Amount: 306606903,
          totalDelinquent60Plus: { count: 14049, amount: 190106412 },
          participationLoansPurchasedDelinquentAmount: 0,
          indirectDelinquentAmount: 42739853,
          wholeOrPartialPurchasedLoansDelinquentAmount: 2850822,
          nonCommercialNonAccrualAmount: 128292364,
          commercialNonAccrualAmount: 9777343,
          bankruptcyClaimsOutstanding: 43269263,
          borrowerDifficultyModifiedLoans: { count: 1019, amount: 29931024 },
          borrowerDifficultyModifiedLoansNotInCompliance: { count: 200, amount: 11906227 }
        },
        indirectLoans: [
          {
            label: 'New and Used Vehicle Loans',
            count: 139270,
            amount: 3236781264,
            countAccountCode: 'IN0001',
            amountAccountCode: 'IN0002',
            source: 'Schedule A, Section 5'
          },
          {
            label: 'First Lien and Junior Lien Residential Loans',
            count: 0,
            amount: 0,
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
            count: 43738,
            amount: 1061399799,
            countAccountCode: 'IN0007',
            amountAccountCode: 'IN0008',
            source: 'Schedule A, Section 5'
          }
        ],
        indirectTotals: {
          count: 183008,
          amount: 4298181063,
          countAccountCode: '617A',
          amountAccountCode: '618A',
          delinquentAmount: 42739853,
          delinquentAmountAccountCode: '041E',
          chargeOffsYtd: 20163571,
          chargeOffsAccountCode: '550E',
          recoveriesYtd: 5789966,
          recoveriesAccountCode: '551E'
        },
        derivedMetrics: {
          nonCommercialLoanBalance: 15949179347,
          autoLoanBalance: 6224819778,
          autoLoanCount: 329836,
          directAutoLoanBalance: 2988038514,
          directAutoLoanCount: 190566,
          directAutoCalculation:
            'New vehicle plus used vehicle loans minus indirect new/used vehicle loans; count never below zero.',
          indirectShareOfLoanBook: 0.2330921457,
          indirectVehicleShareOfAutoBalance: 0.5199799158
        },
        otherLoanInformation: {
          loansToOfficials: { count: 92, amount: 8654319 },
          fcuInterestRateCeiling: { amountOver15Percent: 626749176, weightedAverageRateOver15Percent: 16.64 },
          purchasedCreditImpairedLoans: { contractualBalanceOutstanding: 0, reportedAsLoans: 0 },
          purchasedFinancialAssetsWithCreditDeterioration: { purchasePrice: 0, nonCreditDiscountOrPremium: 0, unpaidPrincipalBalanceOrParValue: 0, acquirersAclAtAcquisitionDate: 0 }
        },
        realEstateDetails: {
          firstLienBalance: 3972474412,
          firstLienGrantedYtd: 298552741,
          juniorLienBalance: 2359916424,
          juniorLienGrantedYtd: 154121921,
          allOtherNonCommercialRealEstateBalance: 336164,
          allOtherNonCommercialRealEstateGrantedYtd: 0,
          totalNonCommercialRealEstate: { count: 59000, amount: 6332727000, grantedYtd: 452674662 },
          constructionBalance: 82469261,
          repricesOrMaturesWithinFiveYears: 2468288014,
          interestOnlyPaymentOptionFirstLien: { count: 4975, amount: 387688422, grantedYtd: 24409235 }
        },
        commercialDetails: {
          constructionAndDevelopmentMembers: { count: 31, amount: 122604002, grantedYtdCount: 11, grantedYtdAmount: 36091316 },
          securedByFarmlandMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          multifamilyMembers: { count: 217, amount: 362088679, grantedYtdCount: 4, grantedYtdAmount: 2526000 },
          ownerOccupiedNonFarmNonResidentialMembers: { count: 758, amount: 780288746, grantedYtdCount: 25, grantedYtdAmount: 41352284 },
          nonOwnerOccupiedNonFarmNonResidentialMembers: { count: 606, amount: 1045817628, grantedYtdCount: 12, grantedYtdAmount: 95346000 },
          totalCommercialRealEstateSecuredMembers: { count: 1612, amount: 2310799055, grantedYtdCount: 52, grantedYtdAmount: 175315600 },
          commercialAndIndustrialMembers: { count: 3337, amount: 153453225, grantedYtdCount: 469, grantedYtdAmount: 23008923 },
          unsecuredCommercialMembers: { count: 69, amount: 133137, grantedYtdCount: 55, grantedYtdAmount: 12698 },
          unsecuredRevolvingCommercialMembers: { count: 1865, amount: 26271767, grantedYtdCount: 11, grantedYtdAmount: 475000 },
          commercialMemberLoans: { count: 6883, amount: 2490657184, grantedYtdCount: 587, grantedYtdAmount: 198812221 },
          totalCommercialNonmemberLoans: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          totalCommercialLoans: { count: 6883, amount: 2490657184 },
          outstandingAgriculturalRelatedLoans: { count: 0, amount: 0 },
          commercialRealEstateRepricesOrMaturesWithinFiveYears: 531789807,
          commercialParticipationsSoldServicingRetained: { count: 22, amount: 96783740 },
          commercialLoansSoldServicingRetained: { count: 0, amount: 0 },
          commercialLoansSoldNoRetainedServicingYtd: { count: 0, amount: 0 },
          totalMemberBusinessLoansNet: 2456314020,
          commercialUnfundedCommitments: 164174073
        },
        purchasedAndSoldLoans: {
          purchasedFromOtherFinancialInstitutionsYtd: { count: 0, amount: 0 },
          purchasedFromOtherFinancialInstitutionsOutstanding: { count: 1074, amount: 409236405 },
          purchasedFromOtherSourcesYtd: { count: 0, amount: 0 },
          purchasedFromOtherSourcesOutstanding: { count: 0, amount: 0 },
          loansSoldYtd: { count: 406, amount: 143658526 },
          firstMortgageLoansSoldSecondaryMarketYtd: { count: 406, amount: 143658526 },
          loansTransferredWithLimitedRecourseQualifyingForSalesAccounting: { count: 0, amount: 0 },
          realEstateLoansSoldServicingRetained: { ytdCount: 31, ytdAmount: 8166768, outstandingCount: 9342, outstandingAmount: 1451483465 },
          allOtherLoansSoldServicingRetained: { ytdCount: 0, ytdAmount: 0, outstandingCount: 0, outstandingAmount: 0 },
          loanParticipations: {
            vehicleNonCommercial: { purchasedYtd: 0, purchasedOutstanding: 0, soldYtd: 6795071, soldOutstanding: 0 },
            nonFederallyGuaranteedStudent: { purchasedYtd: 0, purchasedOutstanding: 0, soldYtd: 0, soldOutstanding: 0 },
            oneToFourFamilyResidential: { purchasedYtd: 0, purchasedOutstanding: 0, soldYtd: 58290234, soldOutstanding: 31952075 },
            commercialExcludingConstructionAndDevelopment: { purchasedYtd: 0, purchasedOutstanding: 0, soldYtd: 89190485, soldOutstanding: 0 },
            commercialConstructionAndDevelopment: { purchasedYtd: 0, purchasedOutstanding: 0, soldYtd: 0, soldOutstanding: 0 },
            allOther: { purchasedYtd: 0, purchasedOutstanding: 0, soldYtd: 1107330, soldOutstanding: 0 },
            total: { purchasedYtd: 0, purchasedOutstanding: 0, soldYtd: 155383120, soldOutstanding: 31952075 }
          }
        },
        unfundedCommitments: {
          commercialLoans: 164174073,
          revolvingOpenEndSecuredByResidentialProperty: 2125270028,
          creditCardLines: 2506050531,
          unsecuredShareDraftLinesOfCredit: 6119279,
          unusedOverdraftProtectionProgram: 439406656,
          otherUnfundedCommitments: 3121804,
          totalNonCommercialLoans: 5079968298,
          totalAllLoanTypes: 5244142371,
          unconditionallyCancelableAllLoanTypes: 2951576467,
          conditionallyCancelableCommercialLoans: 164174073,
          consumerLoansSecuredAndRealEstate: 2127410198,
          consumerLoansUnsecured: 981633,
          totalConditionallyCancelable: 2292565904,
          commercialLoansTransferredWithLimitedRecourse: 0,
          consumerLoansTransferredWithLimitedRecourse: 0,
          totalLoansTransferredWithLimitedRecourse: 0,
          loansTransferredFhlbMpf: 0
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
        modeledMonthlyCreditLifePremium: 6060688.15,
        modeledMonthlyCreditDisabilityPremium: 13636548.34,
        modeledMonthlyDebtProtectionIuiPremium: 8484963.41,
        modeledMonthlyDirectAutoOriginations: 7940.25,
        modeledMonthlyVscGfsIncome: 1270440,
        modeledMonthlyGapGfsIncome: 277908.75,
        notes: [
          'Credit and debt protection uses the repo AGENTS prospect heuristic on non-commercial loan balance.',
          'VSC and GAP use direct auto count after subtracting indirect vehicle loans from new/used vehicle counts.',
          'Mountain America has a large used-auto book and still leaves a high direct-auto estimate after removing reported indirect vehicle loans.'
        ]
      },
      relationshipResearch: {
        capturedAt: '2026-06-20T17:45:00-05:00',
        source: 'Visible LinkedIn Sales Navigator search results in the authenticated Chrome session; no messages, saves, or profile actions performed',
        searchUrl: 'https://www.linkedin.com/sales/search/people?keywords=Mountain%20America%20Credit%20Union',
        resultSummary: 'Sales Navigator showed 5K+ people results for Mountain America Credit Union. Visible first-screen leads included government affairs, technology, and direct consumer lending contacts.',
        visibleLeads: [
          {
            name: 'Suzanne Oliver',
            title: 'VP Government Affairs, Mountain America Credit Union',
            location: 'Sandy, Utah, United States',
            tenure: '38 years 5 months in role; 38 years 5 months in company',
            signal: '2nd degree connection; 7 mutual connections'
          },
          {
            name: 'Kelly Albiston',
            title: 'EVP / Chief Technology Officer, Mountain America Credit Union',
            location: 'Salt Lake City Metropolitan Area',
            tenure: '1 year 4 months in role; 13 years 1 month in company',
            signal: '2nd degree connection; LinkedIn premium member; prior visible role SVP Digital Product / CTO'
          },
          {
            name: 'Jonathan Brouse',
            title: 'Vice President Direct Consumer Lending, Mountain America Credit Union',
            location: 'Sandy, Utah, United States',
            tenure: '3 years 2 months in role; 14 years 8 months in company',
            signal: '2nd degree connection; LinkedIn premium member; 21 mutual connections; directly relevant consumer lending title'
          }
        ],
        additionalVisibleNames: [
          'Blake Terry',
          'Michael Griffiths',
          'Sterling Nielsen',
          'Chad Witcher',
          'Kristin Patterson',
          'Brad Clegg',
          'Amy Moser',
          'Nathan Anderson',
          'Joseph Weinberg',
          'Jeff Chandler',
          'Michael S.',
          'Jason Rogers',
          'Josh Davies',
          'James H.',
          'David Hillyard',
          'Jeremy Kartchner',
          'Chad Curtis',
          'Andres Pinilla',
          'Tim Toy',
          'Brandon Eberhard',
          'Eric Rollins'
        ]
      },
      sources: [
        {
          label: 'NCUA Research a Credit Union',
          url: 'https://mapping.ncua.gov/ResearchCreditUnion',
          capturedAt: '2026-06-20'
        },
        {
          label: 'NCUA credit union details API for charter 24692',
          url: 'https://mapping.ncua.gov/api/CreditUnionDetails/GetCreditUnionDetails/24692',
          capturedAt: '2026-06-20'
        },
        {
          label: 'NCUA March 2026 call report download endpoint',
          url: 'https://mapping.ncua.gov/api/CreditUnionDetails/GetDownloadCallReport/24692?isCorpCU=false&cycleDate=03/31/2026',
          capturedAt: '2026-06-20'
        },
        {
          label: 'OpenStreetMap Nominatim geocode for main office address',
          url: 'https://nominatim.openstreetmap.org/search?format=json&q=9800%20South%20Monroe%20Street%20Sandy%20Utah',
          capturedAt: '2026-06-20'
        },
        {
          label: 'LinkedIn Sales Navigator people search snapshot',
          url: 'https://www.linkedin.com/sales/search/people?keywords=Mountain%20America%20Credit%20Union',
          capturedAt: '2026-06-20'
        }
      ],
      dataQuality: [
        'NCUA call-report endpoint returned a JSON byte array for the PDF; bytes were decoded before text extraction.',
        'PDF text extraction matched Schedule A loan categories, government-guaranteed loan lines, indirect loan totals, delinquency, charge-off/recovery, other loan information, real estate, commercial, loan sale/participation, and unfunded commitment sections.',
        'OpenStreetMap exact NCUA abbreviation query returned a Monroe Street road segment; a second expanded-address query returned a bank/POI match at 9800 Monroe Street named Mountain American Credit Union, so that coordinate was used with the typo noted.',
        'Sales Navigator relationship research was limited to visible first-screen result text from the authenticated Chrome session; no messages, saves, list changes, or profile navigation were performed.'
      ]
    },
    {
      id: 'penfed-227-2026-03-31',
      name: 'PenFed Credit Union',
      charterNumber: '227',
      priority: 'High',
      status: 'Recurring research captured',
      summary:
        'Large military-field FCU with a $22.51B loan book, $3.56B in new/used vehicle loans, and $9.16B in reported indirect loans, led by an $8.56B indirect residential-loan portfolio.',
      profile: {
        ncuaName: 'PENTAGON',
        type: 'FCU',
        status: 'Active',
        charterState: 'Virginia',
        charterYear: 1935,
        fieldOfMembership: 'Multiple common bond - primarily military',
        lowIncomeDesignation: 'No',
        fhlbMember: 'Yes',
        region: '8 - ONES',
        peerGroup: '6 - $500,000,000 and greater',
        assets: 29396724251,
        members: 2759060,
        ceo: 'James R Schenck',
        website: 'http://www.penfed.org',
        phone: '571-341-6706',
        mainOffice: {
          street: '7940 Jones Branch Dr',
          city: 'McLean',
          state: 'VA',
          zip: '22102',
          county: 'Fairfax',
          country: 'United States',
          latitude: 38.929609875901,
          longitude: -77.216565532618,
          geocodePrecision: 'U.S. Census geocoder address-range match for 7940 Jones Branch Dr; OpenStreetMap returned no match'
        }
      },
      callReport: {
        cycleDate: '2026-03-31',
        reportLabel: 'March 2026 NCUA 5300 Call Report',
        totals: {
          loansHeldForSale: 235413222,
          totalLoansAndLeases: { count: 1300855, amount: 22506146459 },
          allowanceForCreditLossesLoansAndLeases: 506975593,
          accruedInterestOnLoansAndLeases: 85271946,
          loansGrantedYtd: { count: 34640, amount: 1748366598 },
          paydayAlternativeLoansGrantedYtd: { count: 0, amount: 0 }
        },
        loanCategories: [
          {
            label: 'Unsecured Credit Card Loans',
            accountAmountCode: '396',
            interestRate: 17.99,
            count: 738079,
            amount: 1701941785,
            productFit: 'Credit insurance/debt protection - unsecured consumer'
          },
          {
            label: 'Payday Alternative Loans (PALs I and PALs II)',
            accountAmountCode: '397A',
            interestRate: 0,
            count: 0,
            amount: 0,
            productFit: 'Not material in this call report'
          },
          {
            label: 'Non-Federally Guaranteed Student Loans',
            accountAmountCode: '698A',
            interestRate: 3.53,
            count: 17658,
            amount: 677136345,
            productFit: 'Consumer education loan review'
          },
          {
            label: 'All Other Unsecured Loans/Lines of Credit',
            accountAmountCode: '397',
            interestRate: 14.65,
            count: 203032,
            amount: 844572275,
            productFit: 'Credit insurance/debt protection - unsecured consumer'
          },
          {
            label: 'New Vehicle Loans',
            accountAmountCode: '385',
            interestRate: 1.99,
            count: 52971,
            amount: 1175799279,
            productFit: 'VSC, GAP, credit insurance, debt protection'
          },
          {
            label: 'Used Vehicle Loans',
            accountAmountCode: '370',
            interestRate: 5.79,
            count: 161703,
            amount: 2387834859,
            productFit: 'VSC, GAP, credit insurance, debt protection'
          },
          {
            label: 'Leases Receivable',
            accountAmountCode: '002',
            interestRate: 0,
            count: 0,
            amount: 0,
            productFit: 'Not material in this call report'
          },
          {
            label: 'All Other Secured Non-Real Estate Loans/Lines of Credit',
            accountAmountCode: '698C',
            interestRate: 2.05,
            count: 51925,
            amount: 841037186,
            productFit: 'Collateral and consumer protection review'
          },
          {
            label: 'First Lien 1- to 4-Family Residential Property Loans/Lines',
            accountAmountCode: '703A',
            interestRate: 3.25,
            count: 32735,
            amount: 11320720689,
            productFit: 'Mortgage credit insurance review'
          },
          {
            label: 'Junior Lien 1- to 4-Family Residential Property Loans/Lines',
            accountAmountCode: '386A',
            interestRate: 7.25,
            count: 42359,
            amount: 2728475776,
            productFit: 'Home-equity credit protection review'
          },
          {
            label: 'All Other Non-Commercial Real Estate Loans/Lines',
            accountAmountCode: '386B',
            interestRate: 9,
            count: 3,
            amount: 379945,
            productFit: 'Not material in this call report'
          },
          {
            label: 'Commercial Real Estate Secured Loans/Lines',
            accountAmountCode: '718A5',
            interestRate: 6.23,
            count: 36,
            amount: 799014100,
            productFit: 'Commercial concentration and participation review'
          },
          {
            label: 'Commercial Loans/Lines Not Secured by Real Estate',
            accountAmountCode: '400P',
            interestRate: 7.05,
            count: 354,
            amount: 29234220,
            productFit: 'Commercial member business loan review'
          }
        ],
        governmentGuaranteedLoans: {
          nonCommercialSba: { count: 0, balance: 0, guaranteedPortion: 0 },
          nonCommercialPppIncludedInSba: { count: 0, balance: 0 },
          nonCommercialOtherGovernmentGuaranteed: { count: 1991, balance: 852822458, guaranteedPortion: 227559810 },
          commercialSba: { count: 0, balance: 0, guaranteedPortion: 0 },
          commercialOtherGovernmentGuaranteed: { count: 0, balance: 0, guaranteedPortion: 0 }
        },
        chargeOffAndRecoveryYtd: [
          { label: 'Unsecured Credit Card Loans', chargeOffs: 42109396, recoveries: 4384080 },
          { label: 'Payday Alternative Loans (PALs I and PALs II)', chargeOffs: 0, recoveries: 0 },
          { label: 'Non-Federally Guaranteed Student Loans', chargeOffs: 1466734, recoveries: 344599 },
          { label: 'All Other Unsecured Loans/Lines of Credit', chargeOffs: 16256348, recoveries: 3264905 },
          { label: 'New Vehicle Loans', chargeOffs: 2785961, recoveries: 1711454 },
          { label: 'Used Vehicle Loans', chargeOffs: 17398610, recoveries: 9236397 },
          { label: 'Leases Receivable', chargeOffs: 0, recoveries: 0 },
          { label: 'All Other Secured Non-Real Estate Loans/Lines of Credit', chargeOffs: 6735820, recoveries: 603702 },
          { label: 'First Lien Residential Property Loans/Lines of Credit', chargeOffs: 634081, recoveries: 0 },
          { label: 'Junior Lien Residential Property Loans/Lines of Credit', chargeOffs: 777994, recoveries: 37326 },
          { label: 'All Other Non-Commercial Real Estate Loans/Lines of Credit', chargeOffs: 0, recoveries: 0 },
          { label: 'Construction and Development Commercial Loans', chargeOffs: 0, recoveries: 0 },
          { label: 'Non-Owner Occupied Non-Farm Non-Residential Commercial', chargeOffs: 1402, recoveries: 0 },
          { label: 'Commercial and Industrial Loans', chargeOffs: 0, recoveries: 0 },
          { label: 'Total Loans and Leases', chargeOffs: 88166346, recoveries: 19582463 },
          { label: 'Participation Loans Purchased', chargeOffs: 110725, recoveries: 18006 },
          { label: 'Indirect Loans', chargeOffs: 8591480, recoveries: 4406666 },
          { label: 'Whole/Partial Purchased Loans', chargeOffs: 6626263, recoveries: 722351 }
        ],
        delinquency: {
          totalDelinquent30To59Amount: 175816731,
          totalDelinquent60Plus: { count: 10744, amount: 300133579 },
          participationLoansPurchasedDelinquentAmount: 190587,
          indirectDelinquentAmount: 57085972,
          wholeOrPartialPurchasedLoansDelinquentAmount: 6933210,
          nonCommercialNonAccrualAmount: 255911398,
          commercialNonAccrualAmount: 131972415,
          bankruptcyClaimsOutstanding: 87941956,
          borrowerDifficultyModifiedLoans: { count: 1869, amount: 221948525 },
          borrowerDifficultyModifiedLoansNotInCompliance: { count: 504, amount: 48012770 }
        },
        indirectLoans: [
          {
            label: 'New and Used Vehicle Loans',
            count: 23463,
            amount: 260314715,
            countAccountCode: 'IN0001',
            amountAccountCode: 'IN0002',
            source: 'Schedule A, Section 5'
          },
          {
            label: 'First Lien and Junior Lien Residential Loans',
            count: 13306,
            amount: 8562910568,
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
            count: 29726,
            amount: 337096102,
            countAccountCode: 'IN0007',
            amountAccountCode: 'IN0008',
            source: 'Schedule A, Section 5'
          }
        ],
        indirectTotals: {
          count: 66495,
          amount: 9160321385,
          countAccountCode: '617A',
          amountAccountCode: '618A',
          delinquentAmount: 57085972,
          delinquentAmountAccountCode: '041E',
          chargeOffsYtd: 8591480,
          chargeOffsAccountCode: '550E',
          recoveriesYtd: 4406666,
          recoveriesAccountCode: '551E'
        },
        derivedMetrics: {
          nonCommercialLoanBalance: 21677898139,
          autoLoanBalance: 3563634138,
          autoLoanCount: 214674,
          directAutoLoanBalance: 3303319423,
          directAutoLoanCount: 191211,
          directAutoCalculation:
            'New vehicle plus used vehicle loans minus indirect new/used vehicle loans; count never below zero.',
          indirectShareOfLoanBook: 0.4070142084,
          indirectVehicleShareOfAutoBalance: 0.0730475422
        },
        otherLoanInformation: {
          loansToOfficials: { count: 56, amount: 5168677 },
          fcuInterestRateCeiling: { amountOver15Percent: 1873552649, weightedAverageRateOver15Percent: 17.89 },
          purchasedCreditImpairedLoans: { contractualBalanceOutstanding: 0, reportedAsLoans: 0 },
          purchasedFinancialAssetsWithCreditDeterioration: { purchasePrice: 0, nonCreditDiscountOrPremium: 0, unpaidPrincipalBalanceOrParValue: 0, acquirersAclAtAcquisitionDate: 0 }
        },
        realEstateDetails: {
          firstLienBalance: 11320720689,
          firstLienGrantedYtd: 564851466,
          juniorLienBalance: 2728475776,
          juniorLienGrantedYtd: 357392147,
          allOtherNonCommercialRealEstateBalance: 379945,
          allOtherNonCommercialRealEstateGrantedYtd: 0,
          totalNonCommercialRealEstate: { count: 75097, amount: 14049576410, grantedYtd: 922243613 },
          constructionBalance: 0,
          repricesOrMaturesWithinFiveYears: 3553624676,
          interestOnlyPaymentOptionFirstLien: { count: 1, amount: 401690, grantedYtd: 0 }
        },
        commercialDetails: {
          constructionAndDevelopmentMembers: { count: 7, amount: 96756710, grantedYtdCount: 0, grantedYtdAmount: 0 },
          securedByFarmlandMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          multifamilyMembers: { count: 2, amount: 107728249, grantedYtdCount: 0, grantedYtdAmount: 0 },
          ownerOccupiedNonFarmNonResidentialMembers: { count: 3, amount: 748184, grantedYtdCount: 0, grantedYtdAmount: 0 },
          nonOwnerOccupiedNonFarmNonResidentialMembers: { count: 19, amount: 583174432, grantedYtdCount: 0, grantedYtdAmount: 0 },
          totalCommercialRealEstateSecuredMembers: { count: 31, amount: 788407575, grantedYtdCount: 0, grantedYtdAmount: 0 },
          commercialAndIndustrialMembers: { count: 354, amount: 29234220, grantedYtdCount: 10, grantedYtdAmount: 1060760 },
          unsecuredCommercialMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          unsecuredRevolvingCommercialMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          commercialMemberLoans: { count: 385, amount: 817641795, grantedYtdCount: 10, grantedYtdAmount: 1060760 },
          nonmemberConstructionAndDevelopment: { count: 0, amount: 0 },
          nonmemberMultifamily: { count: 0, amount: 0 },
          nonmemberOwnerOccupiedNonFarmNonResidential: { count: 0, amount: 0 },
          nonmemberNonOwnerOccupiedNonFarmNonResidential: { count: 5, amount: 10606525, grantedYtdCount: 0, grantedYtdAmount: 0 },
          totalCommercialRealEstateSecuredNonmembers: { count: 5, amount: 10606525, grantedYtdCount: 0, grantedYtdAmount: 0 },
          totalCommercialNonmemberLoans: { count: 5, amount: 10606525, grantedYtdCount: 0, grantedYtdAmount: 0 },
          totalCommercialLoans: { count: 390, amount: 828248320 },
          outstandingAgriculturalRelatedLoans: { count: 0, amount: 0 },
          commercialRealEstateRepricesOrMaturesWithinFiveYears: 797815654,
          commercialParticipationsSoldServicingRetained: { count: 145, amount: 20386180 },
          commercialLoansSoldServicingRetained: { count: 0, amount: 0 },
          commercialLoansSoldNoRetainedServicingYtd: { count: 0, amount: 0 },
          totalMemberBusinessLoansNet: 828989345,
          commercialUnfundedCommitments: 11347550
        },
        purchasedAndSoldLoans: {
          purchasedFromOtherFinancialInstitutionsYtd: { count: 0, amount: 0 },
          purchasedFromOtherFinancialInstitutionsOutstanding: { count: 976, amount: 102340007 },
          purchasedFromOtherSourcesYtd: { count: 0, amount: 0 },
          purchasedFromOtherSourcesOutstanding: { count: 32124, amount: 656675007 },
          loansSoldYtd: { count: 1282, amount: 508069232 },
          firstMortgageLoansSoldSecondaryMarketYtd: { count: 1282, amount: 508069232 },
          loansTransferredWithLimitedRecourseQualifyingForSalesAccounting: { count: 0, amount: 0 },
          realEstateLoansSoldServicingRetained: { ytdCount: 1282, ytdAmount: 508069232, outstandingCount: 57351, outstandingAmount: 14530540164 },
          allOtherLoansSoldServicingRetained: { ytdCount: 0, ytdAmount: 0, outstandingCount: 35816, outstandingAmount: 599450575 },
          loanParticipations: {
            vehicleNonCommercial: { purchasedYtd: 0, purchasedOutstanding: 0, soldYtd: 48216074, soldOutstanding: 25910710 },
            nonFederallyGuaranteedStudent: { purchasedYtd: 1325088, purchasedOutstanding: 0, soldYtd: 0, soldOutstanding: 0 },
            oneToFourFamilyResidential: { purchasedYtd: 16953188, purchasedOutstanding: 0, soldYtd: 731168193, soldOutstanding: 0 },
            commercialExcludingConstructionAndDevelopment: { purchasedYtd: 10606525, purchasedOutstanding: 0, soldYtd: 6697304, soldOutstanding: 0 },
            commercialConstructionAndDevelopment: { purchasedYtd: 0, purchasedOutstanding: 0, soldYtd: 0, soldOutstanding: 0 },
            allOther: { purchasedYtd: 590038, purchasedOutstanding: 0, soldYtd: 54668776, soldOutstanding: 0 },
            total: { purchasedYtd: 29474839, purchasedOutstanding: 0, soldYtd: 840750347, soldOutstanding: 25910710 }
          }
        },
        unfundedCommitments: {
          commercialLoans: 11347550,
          revolvingOpenEndSecuredByResidentialProperty: 3184460470,
          creditCardLines: 7213455169,
          unsecuredShareDraftLinesOfCredit: 134163160,
          unusedOverdraftProtectionProgram: 0,
          otherUnfundedCommitments: 470766121,
          totalNonCommercialLoans: 11002844920,
          totalAllLoanTypes: 11014192470,
          unconditionallyCancelableAllLoanTypes: 7457037478,
          conditionallyCancelableCommercialLoans: 11347550,
          consumerLoansSecuredAndRealEstate: 3516616838,
          consumerLoansUnsecured: 29190604,
          totalConditionallyCancelable: 3557154992,
          commercialLoansTransferredWithLimitedRecourse: 0,
          consumerLoansTransferredWithLimitedRecourse: 3385365,
          totalLoansTransferredWithLimitedRecourse: 3385365,
          loansTransferredFhlbMpf: 115460542
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
        modeledMonthlyCreditLifePremium: 8237601.29,
        modeledMonthlyCreditDisabilityPremium: 18534602.91,
        modeledMonthlyDebtProtectionIuiPremium: 11532641.81,
        modeledMonthlyDirectAutoOriginations: 7967.13,
        modeledMonthlyVscGfsIncome: 1274740,
        modeledMonthlyGapGfsIncome: 278849.38,
        notes: [
          'Credit and debt protection uses the repo AGENTS prospect heuristic on non-commercial loan balance.',
          'VSC and GAP use direct auto count after subtracting indirect vehicle loans from new/used vehicle counts.',
          'PenFed has very large indirect exposure, but the indirect schedule is mostly residential rather than vehicle, so direct-auto opportunity remains large.'
        ]
      },
      relationshipResearch: {
        capturedAt: '2026-06-20T18:04:00-05:00',
        source: 'Visible LinkedIn Sales Navigator search results in the authenticated Chrome session; no messages, saves, or profile actions performed',
        searchUrl: 'https://www.linkedin.com/sales/search/people?keywords=Pentagon%20Federal%20Credit%20Union',
        resultSummary: 'The first PenFed keyword search returned no cards; the formal Pentagon Federal Credit Union search showed 1.5K+ results. Visible PenFed-current leads included a vice president and the president/CEO; one visible non-PenFed current-company result was excluded from leads.',
        visibleLeads: [
          {
            name: 'John Dorn',
            title: 'Vice President, Pentagon Federal Credit Union',
            location: 'Washington DC-Baltimore Area',
            tenure: '17 years in role; 17 years in company',
            signal: '2nd degree connection; 33 mutual connections'
          },
          {
            name: 'James Schenck',
            title: 'President & CEO, Pentagon Federal Credit Union',
            location: 'Washington DC-Baltimore Area',
            tenure: '12 years 3 months in role; 15 years 6 months in company',
            signal: '2nd degree connection; 216 mutual connections; 2 recent posts on LinkedIn'
          }
        ],
        additionalVisibleNames: [
          'Joan Sommerer',
          'Ed Cody',
          'Shashi Vohra',
          'Dorecia A. Waisome',
          'Bill Siegert',
          'Melinda Edmunds',
          'Jim Mau',
          'Kathleen Harrington',
          'Derrick H.',
          'Stephanie M. Covington',
          'Paul Velky',
          'Craig Olson',
          'Philip Romanelli',
          'Deborah Ames Naylor',
          'Richard Chin',
          'Roderick Mitchell',
          'James Quinn',
          'Megan Curameng Green',
          'Richa Varshney',
          'Chris Nerz, PSM',
          'Annette Kalinowski',
          'Gary Schuette II, CFA'
        ]
      },
      sources: [
        {
          label: 'NCUA Research a Credit Union',
          url: 'https://mapping.ncua.gov/ResearchCreditUnion',
          capturedAt: '2026-06-20'
        },
        {
          label: 'NCUA credit union details API for charter 227',
          url: 'https://mapping.ncua.gov/api/CreditUnionDetails/GetCreditUnionDetails/227',
          capturedAt: '2026-06-20'
        },
        {
          label: 'NCUA March 2026 call report download endpoint',
          url: 'https://mapping.ncua.gov/api/CreditUnionDetails/GetDownloadCallReport/227?isCorpCU=false&cycleDate=03/31/2026',
          capturedAt: '2026-06-20'
        },
        {
          label: 'U.S. Census geocoder for main office address',
          url: 'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=7940%20JONES%20BRANCH%20DR%2C%20McLean%2C%20VA%2022102&benchmark=Public_AR_Current&format=json',
          capturedAt: '2026-06-20'
        },
        {
          label: 'LinkedIn Sales Navigator people search snapshot',
          url: 'https://www.linkedin.com/sales/search/people?keywords=Pentagon%20Federal%20Credit%20Union',
          capturedAt: '2026-06-20'
        }
      ],
      dataQuality: [
        'NCUA call-report endpoint returned a JSON byte array for the PDF; bytes were decoded before text extraction.',
        'PDF text extraction matched Schedule A loan categories, government-guaranteed loan lines, indirect loan totals, delinquency, charge-off/recovery, other loan information, real estate, commercial, loan sale/participation, and unfunded commitment sections.',
        'OpenStreetMap returned no match for 7940 Jones Branch Dr or PenFed headquarters queries; U.S. Census geocoder returned an address-range match for 7940 Jones Branch Dr, McLean, VA 22102.',
        'Sales Navigator relationship research was limited to visible first-screen result text from the authenticated Chrome session; no messages, saves, list changes, or profile navigation were performed.'
      ]
    },
    {
      id: 'becu-62604-2026-03-31',
      name: 'BECU',
      charterNumber: '62604',
      priority: 'High',
      status: 'Recurring research captured',
      summary:
        'Large Washington FISCU with a $20.28B loan book, $2.67B in new/used vehicle loans, and $2.94B in reported indirect loans including $2.05B indirect vehicle exposure.',
      profile: {
        ncuaName: 'BOEING EMPLOYEES',
        type: 'FISCU',
        status: 'Active',
        charterState: 'Washington',
        charterYear: 1935,
        fieldOfMembership: 'Non-Federal Credit Union',
        lowIncomeDesignation: 'No',
        fhlbMember: 'Yes',
        region: '8 - ONES',
        peerGroup: '6 - $500,000,000 and greater',
        assets: 30006145279,
        members: 1575792,
        ceo: 'Beverly Anderson',
        website: 'http://www.becu.org',
        phone: '800-233-2328',
        mainOffice: {
          street: '12770 Gateway Dr S',
          city: 'Tukwila',
          state: 'WA',
          zip: '98168',
          county: 'King',
          country: 'United States',
          latitude: 47.4870483,
          longitude: -122.2734912,
          geocodePrecision: 'Address-level OpenStreetMap match for the NCUA main-office address'
        }
      },
      callReport: {
        cycleDate: '2026-03-31',
        reportLabel: 'March 2026 NCUA 5300 Call Report',
        totals: {
          loansHeldForSale: 37176843,
          totalLoansAndLeases: { count: 757649, amount: 20280154994 },
          allowanceForCreditLossesLoansAndLeases: 247536217,
          accruedInterestOnLoansAndLeases: 90702377,
          loansGrantedYtd: { count: 31185, amount: 1435886377 },
          paydayAlternativeLoansGrantedYtd: { count: 0, amount: 0 }
        },
        loanCategories: [
          {
            label: 'Unsecured Credit Card Loans',
            accountAmountCode: '396',
            interestRate: 12.49,
            count: 366123,
            amount: 1641688180,
            productFit: 'Credit insurance/debt protection - unsecured consumer'
          },
          {
            label: 'Payday Alternative Loans (PALs I and PALs II)',
            accountAmountCode: '397A',
            interestRate: null,
            count: 0,
            amount: 0,
            productFit: 'Not applicable/material for this FISCU call report'
          },
          {
            label: 'Non-Federally Guaranteed Student Loans',
            accountAmountCode: '698A',
            interestRate: 7.99,
            count: 3285,
            amount: 61393821,
            productFit: 'Consumer education loan review'
          },
          {
            label: 'All Other Unsecured Loans/Lines of Credit',
            accountAmountCode: '397',
            interestRate: 9.99,
            count: 129835,
            amount: 900278584,
            productFit: 'Credit insurance/debt protection - unsecured consumer'
          },
          {
            label: 'New Vehicle Loans',
            accountAmountCode: '385',
            interestRate: 5.24,
            count: 67239,
            amount: 1499892613,
            productFit: 'VSC, GAP, credit insurance, debt protection'
          },
          {
            label: 'Used Vehicle Loans',
            accountAmountCode: '370',
            interestRate: 5.79,
            count: 77212,
            amount: 1172770899,
            productFit: 'VSC, GAP, credit insurance, debt protection'
          },
          {
            label: 'Leases Receivable',
            accountAmountCode: '002',
            interestRate: 0,
            count: 0,
            amount: 0,
            productFit: 'Not material in this call report'
          },
          {
            label: 'All Other Secured Non-Real Estate Loans/Lines of Credit',
            accountAmountCode: '698C',
            interestRate: 21.49,
            count: 22913,
            amount: 368358082,
            productFit: 'Collateral and consumer protection review'
          },
          {
            label: 'First Lien 1- to 4-Family Residential Property Loans/Lines',
            accountAmountCode: '703A',
            interestRate: 6.99,
            count: 28993,
            amount: 8257678663,
            productFit: 'Mortgage credit insurance review'
          },
          {
            label: 'Junior Lien 1- to 4-Family Residential Property Loans/Lines',
            accountAmountCode: '386A',
            interestRate: 6.99,
            count: 61167,
            amount: 3385299726,
            productFit: 'Home-equity credit protection review'
          },
          {
            label: 'All Other Non-Commercial Real Estate Loans/Lines',
            accountAmountCode: '386B',
            interestRate: 0,
            count: 2,
            amount: 49910,
            productFit: 'Not material in this call report'
          },
          {
            label: 'Commercial Real Estate Secured Loans/Lines',
            accountAmountCode: '718A5',
            interestRate: 0,
            count: 681,
            amount: 2986794643,
            productFit: 'Commercial concentration and participation review'
          },
          {
            label: 'Commercial Loans/Lines Not Secured by Real Estate',
            accountAmountCode: '400P',
            interestRate: 8.75,
            count: 199,
            amount: 5949873,
            productFit: 'Commercial member business loan review'
          }
        ],
        governmentGuaranteedLoans: {
          nonCommercialSba: { count: 4, balance: 3981, guaranteedPortion: 3951 },
          nonCommercialPppIncludedInSba: { count: 4, balance: 3981 },
          nonCommercialOtherGovernmentGuaranteed: { count: 0, balance: 0, guaranteedPortion: 0 },
          commercialSba: { count: 0, balance: 0, guaranteedPortion: 0 },
          commercialOtherGovernmentGuaranteed: { count: 0, balance: 0, guaranteedPortion: 0 }
        },
        chargeOffAndRecoveryYtd: [
          { label: 'Unsecured Credit Card Loans', chargeOffs: 21425102, recoveries: 2052130 },
          { label: 'Payday Alternative Loans (PALs I and PALs II)', chargeOffs: 0, recoveries: 0 },
          { label: 'Non-Federally Guaranteed Student Loans', chargeOffs: 266903, recoveries: 15095 },
          { label: 'All Other Unsecured Loans/Lines of Credit', chargeOffs: 13002042, recoveries: 1216883 },
          { label: 'New Vehicle Loans', chargeOffs: 2692446, recoveries: 520883 },
          { label: 'Used Vehicle Loans', chargeOffs: 3622476, recoveries: 779113 },
          { label: 'Leases Receivable', chargeOffs: 0, recoveries: 0 },
          { label: 'All Other Secured Non-Real Estate Loans/Lines of Credit', chargeOffs: 420098, recoveries: 70597 },
          { label: 'First Lien Residential Property Loans/Lines of Credit', chargeOffs: 0, recoveries: 300 },
          { label: 'Junior Lien Residential Property Loans/Lines of Credit', chargeOffs: 536224, recoveries: 176709 },
          { label: 'All Other Non-Commercial Real Estate Loans/Lines of Credit', chargeOffs: 0, recoveries: 0 },
          { label: 'Unsecured Revolving Commercial Lines', chargeOffs: 10975, recoveries: 8000 },
          { label: 'Total Loans and Leases', chargeOffs: 41976266, recoveries: 4839710 },
          { label: 'Participation Loans Purchased', chargeOffs: 214661, recoveries: 4416 },
          { label: 'Indirect Loans', chargeOffs: 6491333, recoveries: 1048951 },
          { label: 'Whole/Partial Purchased Loans', chargeOffs: 0, recoveries: 0 }
        ],
        delinquency: {
          totalDelinquent30To59Amount: 69236709,
          totalDelinquent60Plus: { count: 4438, amount: 84046801 },
          participationLoansPurchasedDelinquentAmount: 5264111,
          indirectDelinquentAmount: 12812563,
          wholeOrPartialPurchasedLoansDelinquentAmount: 0,
          nonCommercialNonAccrualAmount: 86083422,
          commercialNonAccrualAmount: 13267869,
          bankruptcyClaimsOutstanding: 20639523,
          borrowerDifficultyModifiedLoans: { count: 1052, amount: 32679553 },
          borrowerDifficultyModifiedLoansNotInCompliance: { count: 112, amount: 3478345 }
        },
        indirectLoans: [
          {
            label: 'New and Used Vehicle Loans',
            count: 103526,
            amount: 2045546309,
            countAccountCode: 'IN0001',
            amountAccountCode: 'IN0002',
            source: 'Schedule A, Section 5'
          },
          {
            label: 'First Lien and Junior Lien Residential Loans',
            count: 715,
            amount: 603683256,
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
            count: 8403,
            amount: 293315416,
            countAccountCode: 'IN0007',
            amountAccountCode: 'IN0008',
            source: 'Schedule A, Section 5'
          }
        ],
        indirectTotals: {
          count: 112644,
          amount: 2942544981,
          countAccountCode: '617A',
          amountAccountCode: '618A',
          delinquentAmount: 12812563,
          delinquentAmountAccountCode: '041E',
          chargeOffsYtd: 6491333,
          chargeOffsAccountCode: '550E',
          recoveriesYtd: 1048951,
          recoveriesAccountCode: '551E'
        },
        derivedMetrics: {
          nonCommercialLoanBalance: 17287410478,
          autoLoanBalance: 2672663512,
          autoLoanCount: 144451,
          directAutoLoanBalance: 627117203,
          directAutoLoanCount: 40925,
          directAutoCalculation:
            'New vehicle plus used vehicle loans minus indirect new/used vehicle loans; count never below zero.',
          indirectShareOfLoanBook: 0.1450947974,
          indirectVehicleShareOfAutoBalance: 0.7653587142
        },
        otherLoanInformation: {
          loansToOfficials: { count: 104, amount: 24427890 },
          fcuInterestRateCeiling: { amountOver15Percent: null, weightedAverageRateOver15Percent: null },
          purchasedCreditImpairedLoans: { contractualBalanceOutstanding: 0, reportedAsLoans: 0 },
          purchasedFinancialAssetsWithCreditDeterioration: { purchasePrice: 0, nonCreditDiscountOrPremium: 0, unpaidPrincipalBalanceOrParValue: 0, acquirersAclAtAcquisitionDate: 0 }
        },
        realEstateDetails: {
          firstLienBalance: 8257678663,
          firstLienGrantedYtd: 522126128,
          juniorLienBalance: 3385299726,
          juniorLienGrantedYtd: 116026069,
          allOtherNonCommercialRealEstateBalance: 49910,
          allOtherNonCommercialRealEstateGrantedYtd: 0,
          totalNonCommercialRealEstate: { count: 90162, amount: 11643028298, grantedYtd: 638152197 },
          constructionBalance: 52747753,
          repricesOrMaturesWithinFiveYears: 3985061565,
          interestOnlyPaymentOptionFirstLien: { count: 5644, amount: 471355655, grantedYtd: 21255345 }
        },
        commercialDetails: {
          constructionAndDevelopmentMembers: { count: 7, amount: 77023170, grantedYtdCount: 0, grantedYtdAmount: 0 },
          securedByFarmlandMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          multifamilyMembers: { count: 444, amount: 1900697191, grantedYtdCount: 0, grantedYtdAmount: 0 },
          ownerOccupiedNonFarmNonResidentialMembers: { count: 29, amount: 55214790, grantedYtdCount: 0, grantedYtdAmount: 0 },
          nonOwnerOccupiedNonFarmNonResidentialMembers: { count: 195, amount: 945430555, grantedYtdCount: 0, grantedYtdAmount: 0 },
          totalCommercialRealEstateSecuredMembers: { count: 675, amount: 2978365706, grantedYtdCount: 0, grantedYtdAmount: 0 },
          commercialAndIndustrialMembers: { count: 45, amount: 3610314, grantedYtdCount: 4, grantedYtdAmount: 489896 },
          unsecuredCommercialMembers: { count: 0, amount: 0, grantedYtdCount: 0, grantedYtdAmount: 0 },
          unsecuredRevolvingCommercialMembers: { count: 154, amount: 2339559, grantedYtdCount: 16, grantedYtdAmount: 542289 },
          commercialMemberLoans: { count: 874, amount: 2984315579, grantedYtdCount: 20, grantedYtdAmount: 1032185 },
          nonmemberConstructionAndDevelopment: { count: 0, amount: 0 },
          nonmemberMultifamily: { count: 2, amount: 4734426, grantedYtdCount: 0, grantedYtdAmount: 0 },
          nonmemberOwnerOccupiedNonFarmNonResidential: { count: 0, amount: 0 },
          nonmemberNonOwnerOccupiedNonFarmNonResidential: { count: 4, amount: 3694511, grantedYtdCount: 0, grantedYtdAmount: 0 },
          totalCommercialRealEstateSecuredNonmembers: { count: 6, amount: 8428937, grantedYtdCount: 0, grantedYtdAmount: 0 },
          totalCommercialNonmemberLoans: { count: 6, amount: 8428937, grantedYtdCount: 0, grantedYtdAmount: 0 },
          totalCommercialLoans: { count: 880, amount: 2992744516 },
          outstandingAgriculturalRelatedLoans: { count: 0, amount: 0 },
          commercialRealEstateRepricesOrMaturesWithinFiveYears: 1722898901,
          commercialParticipationsSoldServicingRetained: { count: 6, amount: 49012070 },
          commercialLoansSoldServicingRetained: { count: 0, amount: 0 },
          commercialLoansSoldNoRetainedServicingYtd: { count: 0, amount: 0 },
          totalMemberBusinessLoansNet: 3059885863,
          commercialUnfundedCommitments: 75570284
        },
        purchasedAndSoldLoans: {
          purchasedFromOtherFinancialInstitutionsYtd: { count: 0, amount: 0 },
          purchasedFromOtherFinancialInstitutionsOutstanding: { count: 0, amount: 0 },
          purchasedFromOtherSourcesYtd: { count: 0, amount: 0 },
          purchasedFromOtherSourcesOutstanding: { count: 0, amount: 0 },
          loansSoldYtd: { count: 461, amount: 188248256 },
          firstMortgageLoansSoldSecondaryMarketYtd: { count: 461, amount: 188248256 },
          loansTransferredWithLimitedRecourseQualifyingForSalesAccounting: { count: 0, amount: 0 },
          realEstateLoansSoldServicingRetained: { ytdCount: 461, ytdAmount: 188248256, outstandingCount: 21429, outstandingAmount: 5100898246 },
          allOtherLoansSoldServicingRetained: { ytdCount: 0, ytdAmount: 0, outstandingCount: 0, outstandingAmount: 0 },
          loanParticipations: {
            vehicleNonCommercial: { purchasedYtd: 59382109, purchasedOutstanding: 0, soldYtd: 0, soldOutstanding: 0 },
            nonFederallyGuaranteedStudent: { purchasedYtd: 0, purchasedOutstanding: 0, soldYtd: 0, soldOutstanding: 0 },
            oneToFourFamilyResidential: { purchasedYtd: 1017427052, purchasedOutstanding: 0, soldYtd: 0, soldOutstanding: 0 },
            commercialExcludingConstructionAndDevelopment: { purchasedYtd: 8428937, purchasedOutstanding: 0, soldYtd: 170343522, soldOutstanding: 0 },
            commercialConstructionAndDevelopment: { purchasedYtd: 0, purchasedOutstanding: 0, soldYtd: 0, soldOutstanding: 0 },
            allOther: { purchasedYtd: 0, purchasedOutstanding: 0, soldYtd: 0, soldOutstanding: 0 },
            total: { purchasedYtd: 1085238098, purchasedOutstanding: 0, soldYtd: 170343522, soldOutstanding: 0 }
          }
        },
        unfundedCommitments: {
          commercialLoans: 75570284,
          revolvingOpenEndSecuredByResidentialProperty: 5800986022,
          creditCardLines: 5334867869,
          unsecuredShareDraftLinesOfCredit: 1072520830,
          unusedOverdraftProtectionProgram: 996028367,
          otherUnfundedCommitments: 44523491,
          totalNonCommercialLoans: 13248926579,
          totalAllLoanTypes: 13324496863,
          unconditionallyCancelableAllLoanTypes: 7365759159,
          conditionallyCancelableCommercialLoans: 72278058,
          consumerLoansSecuredAndRealEstate: 5845347663,
          consumerLoansUnsecured: 41111983,
          totalConditionallyCancelable: 5958737704,
          commercialLoansTransferredWithLimitedRecourse: 0,
          consumerLoansTransferredWithLimitedRecourse: 18985332,
          totalLoansTransferredWithLimitedRecourse: 18985332,
          loansTransferredFhlbMpf: 0
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
        modeledMonthlyCreditLifePremium: 6569215.98,
        modeledMonthlyCreditDisabilityPremium: 14780735.96,
        modeledMonthlyDebtProtectionIuiPremium: 9196902.37,
        modeledMonthlyDirectAutoOriginations: 1705.21,
        modeledMonthlyVscGfsIncome: 272833.33,
        modeledMonthlyGapGfsIncome: 59682.29,
        notes: [
          'Credit and debt protection uses the repo AGENTS prospect heuristic on non-commercial loan balance.',
          'VSC and GAP use direct auto count after subtracting indirect vehicle loans from new/used vehicle counts.',
          'BECU has a high indirect vehicle share, so direct VSC/GAP estimates intentionally use only the adjusted direct auto count.'
        ]
      },
      relationshipResearch: {
        capturedAt: '2026-06-20T19:15:00-05:00',
        source: 'LinkedIn Sales Navigator and connections monitor were not available because the Codex Chrome Extension could not connect to Chrome during this run',
        searchUrl: 'https://www.linkedin.com/sales/search/people?keywords=BECU%20Credit%20Union',
        resultSummary: 'No visible professional leads, connection requests, or accepted-connection updates were captured because Chrome extension access was unavailable after the required retry.',
        visibleLeads: [],
        additionalVisibleNames: [],
        connectionRequests: []
      },
      sources: [
        {
          label: 'NCUA Research a Credit Union',
          url: 'https://mapping.ncua.gov/ResearchCreditUnion',
          capturedAt: '2026-06-20'
        },
        {
          label: 'NCUA credit union details API for charter 62604',
          url: 'https://mapping.ncua.gov/api/CreditUnionDetails/GetCreditUnionDetails/62604',
          capturedAt: '2026-06-20'
        },
        {
          label: 'NCUA March 2026 call report download endpoint',
          url: 'https://mapping.ncua.gov/api/CreditUnionDetails/GetDownloadCallReport/62604?isCorpCU=false&cycleDate=03/31/2026',
          capturedAt: '2026-06-20'
        },
        {
          label: 'OpenStreetMap Nominatim geocode for main office address',
          url: 'https://nominatim.openstreetmap.org/search?format=json&q=12770%20Gateway%20Dr%20S%20Tukwila%20WA%2098168',
          capturedAt: '2026-06-20'
        },
        {
          label: 'LinkedIn Sales Navigator people search attempt',
          url: 'https://www.linkedin.com/sales/search/people?keywords=BECU%20Credit%20Union',
          capturedAt: '2026-06-20'
        },
        {
          label: 'LinkedIn connections monitor not reached this run',
          url: 'https://www.linkedin.com/mynetwork/invite-connect/connections/',
          capturedAt: '2026-06-20'
        }
      ],
      dataQuality: [
        'NCUA call-report endpoint returned a JSON byte array for the PDF; bytes were decoded before text extraction.',
        'PDF text extraction matched Schedule A loan categories, government-guaranteed loan lines, indirect loan totals, delinquency, charge-off/recovery, other loan information, real estate, commercial, loan sale/participation, and unfunded commitment sections.',
        'OpenStreetMap returned an address-level match for 12770 Gateway Drive South, Tukwila, WA 98168.',
        'Chrome extension access was unavailable after retry, so Sales Navigator leads, LinkedIn connection requests, accepted-connection reconciliation, and one-time visible connections scan were blocked for this heartbeat.'
      ]
    },
    {
        "id":  "vystar-68490-2026-03-31",
        "name":  "VyStar Credit Union",
        "charterNumber":  "68490",
        "priority":  "High",
        "status":  "Recurring research captured",
        "summary":  "Large Florida FISCU with a $10.40B loan book, $2.58B in new/used vehicle loans, and $2.73B in total indirect loans, including $1.97B in indirect vehicle loans.",
        "profile":  {
                        "ncuaName":  "VYSTAR",
                        "type":  "FISCU",
                        "status":  "Active",
                        "charterState":  "Florida",
                        "region":  "2 - Southern",
                        "peerGroup":  "6 - $500,000,000 and greater",
                        "assets":  13800743298,
                        "members":  1058604,
                        "ceo":  "Brian E Wolfburg",
                        "website":  "https://www.vystarcu.org",
                        "phone":  "904-777-6000",
                        "mainOffice":  {
                                           "street":  "76 S Laura St",
                                           "city":  "Jacksonville",
                                           "state":  "FL",
                                           "zip":  "32202-3433",
                                           "county":  "Duval",
                                           "country":  "United States",
                                           "latitude":  30.3258472,
                                           "longitude":  -81.6600117,
                                           "geocodePrecision":  "Address-level match from OpenStreetMap Nominatim"
                                       }
                    },
        "callReport":  {
                           "cycleDate":  "2026-03-31",
                           "reportLabel":  "March 2026 NCUA 5300 Call Report",
                           "totals":  {
                                          "loansHeldForSale":  0,
                                          "totalLoansAndLeases":  {
                                                                      "count":  470081,
                                                                      "amount":  10400492648
                                                                  },
                                          "allowanceForCreditLossesLoansAndLeases":  153599592,
                                          "accruedInterestOnLoansAndLeases":  36487411,
                                          "loansGrantedYtd":  {
                                                                  "count":  19996,
                                                                  "amount":  1055832549
                                                              },
                                          "interestOnLoansAndLeasesYtd":  154361038,
                                          "creditLossExpenseLoansAndLeasesYtd":  32037251,
                                          "gainLossOnSalesOfLoansAndLeasesYtd":  4577836,
                                          "loanServicingExpenseYtd":  1453915
                                      },
                           "loanCategories":  [
                                                  {
                                                      "label":  "Unsecured Credit Card Loans",
                                                      "accountAmountCode":  "396",
                                                      "interestRate":  16,
                                                      "count":  172460,
                                                      "amount":  656913546,
                                                      "productFit":  "Credit insurance/debt protection - unsecured consumer"
                                                  },
                                                  {
                                                      "label":  "Payday Alternative Loans (PALs I and PALs II)",
                                                      "accountAmountCode":  "397A",
                                                      "interestRate":  null,
                                                      "count":  0,
                                                      "amount":  0,
                                                      "productFit":  "Not material in this call report"
                                                  },
                                                  {
                                                      "label":  "Non-Federally Guaranteed Student Loans",
                                                      "accountAmountCode":  "698A",
                                                      "interestRate":  9.25,
                                                      "count":  3,
                                                      "amount":  59371,
                                                      "productFit":  "Consumer loan review"
                                                  },
                                                  {
                                                      "label":  "All Other Unsecured Loans/Lines of Credit",
                                                      "accountAmountCode":  "397",
                                                      "interestRate":  15.7,
                                                      "count":  86816,
                                                      "amount":  347463411,
                                                      "productFit":  "Credit insurance/debt protection - unsecured consumer"
                                                  },
                                                  {
                                                      "label":  "New Vehicle Loans",
                                                      "accountAmountCode":  "385",
                                                      "interestRate":  6.01,
                                                      "count":  41855,
                                                      "amount":  1102114068,
                                                      "productFit":  "VSC, GAP, credit insurance, debt protection"
                                                  },
                                                  {
                                                      "label":  "Used Vehicle Loans",
                                                      "accountAmountCode":  "370",
                                                      "interestRate":  7.27,
                                                      "count":  85302,
                                                      "amount":  1474328215,
                                                      "productFit":  "VSC, GAP, credit insurance, debt protection"
                                                  },
                                                  {
                                                      "label":  "Leases Receivable",
                                                      "accountAmountCode":  "002",
                                                      "interestRate":  0,
                                                      "count":  0,
                                                      "amount":  0,
                                                      "productFit":  "Not material in this call report"
                                                  },
                                                  {
                                                      "label":  "All Other Secured Non-Real Estate Loans/Lines of Credit",
                                                      "accountAmountCode":  "698C",
                                                      "interestRate":  7.14,
                                                      "count":  46847,
                                                      "amount":  1196111031,
                                                      "productFit":  "Collateral and consumer protection review"
                                                  },
                                                  {
                                                      "label":  "First Lien 1- to 4-Family Residential Property Loans/Lines",
                                                      "accountAmountCode":  "703A",
                                                      "interestRate":  4.27,
                                                      "count":  22620,
                                                      "amount":  3712004149,
                                                      "productFit":  "Mortgage credit insurance review"
                                                  },
                                                  {
                                                      "label":  "Junior Lien 1- to 4-Family Residential Property Loans/Lines",
                                                      "accountAmountCode":  "386A",
                                                      "interestRate":  5.9,
                                                      "count":  12709,
                                                      "amount":  895970718,
                                                      "productFit":  "Mortgage and HELOC protection review"
                                                  },
                                                  {
                                                      "label":  "All Other Non-Commercial Real Estate Loans/Lines of Credit",
                                                      "accountAmountCode":  "386B",
                                                      "interestRate":  6.5,
                                                      "count":  29,
                                                      "amount":  790036,
                                                      "productFit":  "Small real-estate tail"
                                                  },
                                                  {
                                                      "label":  "Commercial Loans/Lines of Credit Real Estate Secured",
                                                      "accountAmountCode":  "718A5",
                                                      "interestRate":  4.95,
                                                      "count":  914,
                                                      "amount":  976859601,
                                                      "productFit":  "Commercial lending context only"
                                                  },
                                                  {
                                                      "label":  "Commercial Loans/Lines of Credit Not Real Estate Secured",
                                                      "accountAmountCode":  "400P",
                                                      "interestRate":  7.7,
                                                      "count":  526,
                                                      "amount":  37878502,
                                                      "productFit":  "Commercial lending context only"
                                                  }
                                              ],
                           "governmentGuaranteedLoans":  {
                                                             "nonCommercialSba":  {
                                                                                      "count":  7,
                                                                                      "balance":  143649,
                                                                                      "guaranteedPortion":  358
                                                                                  },
                                                             "nonCommercialPppIncludedInSba":  {
                                                                                                   "count":  1,
                                                                                                   "balance":  358
                                                                                               },
                                                             "nonCommercialOtherGovernmentGuaranteed":  {
                                                                                                            "count":  16,
                                                                                                            "balance":  21833,
                                                                                                            "guaranteedPortion":  21833
                                                                                                        },
                                                             "commercialSba":  {
                                                                                   "count":  77,
                                                                                   "balance":  40372303,
                                                                                   "guaranteedPortion":  178414
                                                                               },
                                                             "commercialOtherGovernmentGuaranteed":  {
                                                                                                         "count":  1,
                                                                                                         "balance":  6315858,
                                                                                                         "guaranteedPortion":  6315858
                                                                                                     }
                                                         },
                           "chargeOffAndRecoveryYtd":  [
                                                           {
                                                               "label":  "Unsecured Credit Card Loans",
                                                               "chargeOffs":  11992021,
                                                               "recoveries":  895413
                                                           },
                                                           {
                                                               "label":  "Payday Alternative Loans (PALs I and PALs II)",
                                                               "chargeOffs":  0,
                                                               "recoveries":  0
                                                           },
                                                           {
                                                               "label":  "Non-Federally Guaranteed Student Loans",
                                                               "chargeOffs":  0,
                                                               "recoveries":  0
                                                           },
                                                           {
                                                               "label":  "All Other Unsecured Loans/Lines of Credit",
                                                               "chargeOffs":  4733606,
                                                               "recoveries":  676484
                                                           },
                                                           {
                                                               "label":  "New Vehicle Loans",
                                                               "chargeOffs":  3286335,
                                                               "recoveries":  726525
                                                           },
                                                           {
                                                               "label":  "Used Vehicle Loans",
                                                               "chargeOffs":  7554671,
                                                               "recoveries":  1876029
                                                           },
                                                           {
                                                               "label":  "Leases Receivable",
                                                               "chargeOffs":  0,
                                                               "recoveries":  0
                                                           },
                                                           {
                                                               "label":  "All Other Secured Non-Real Estate Loans/Lines of Credit",
                                                               "chargeOffs":  5655320,
                                                               "recoveries":  409606
                                                           },
                                                           {
                                                               "label":  "First Lien Residential Property Loans/Lines of Credit",
                                                               "chargeOffs":  380531,
                                                               "recoveries":  3218
                                                           },
                                                           {
                                                               "label":  "Junior Lien Residential Property Loans/Lines of Credit",
                                                               "chargeOffs":  0,
                                                               "recoveries":  15666
                                                           },
                                                           {
                                                               "label":  "All Other Non-Commercial Real Estate Loans/Lines of Credit",
                                                               "chargeOffs":  0,
                                                               "recoveries":  0
                                                           },
                                                           {
                                                               "label":  "Commercial and Industrial Loans",
                                                               "chargeOffs":  1201101,
                                                               "recoveries":  70235
                                                           },
                                                           {
                                                               "label":  "Unsecured Commercial Loans",
                                                               "chargeOffs":  0,
                                                               "recoveries":  0
                                                           },
                                                           {
                                                               "label":  "Unsecured Revolving Commercial Lines",
                                                               "chargeOffs":  206948,
                                                               "recoveries":  0
                                                           },
                                                           {
                                                               "label":  "Total Loans and Leases",
                                                               "chargeOffs":  35010533,
                                                               "recoveries":  4673176
                                                           },
                                                           {
                                                               "label":  "Participation Loans Purchased",
                                                               "chargeOffs":  1465624,
                                                               "recoveries":  360564
                                                           },
                                                           {
                                                               "label":  "Indirect Loans",
                                                               "chargeOffs":  11543826,
                                                               "recoveries":  2203296
                                                           },
                                                           {
                                                               "label":  "Whole/Partial Purchased Loans",
                                                               "chargeOffs":  0,
                                                               "recoveries":  0
                                                           }
                                                       ],
                           "delinquency":  {
                                               "totalDelinquent30To59Amount":  138736765,
                                               "totalDelinquent60Plus":  {
                                                                             "count":  5784,
                                                                             "amount":  127087819
                                                                         },
                                               "participationLoansPurchasedDelinquentAmount":  4632854,
                                               "indirectDelinquentAmount":  29609301,
                                               "wholeOrPartialPurchasedLoansDelinquentAmount":  0,
                                               "nonCommercialNonAccrualAmount":  40451712,
                                               "commercialNonAccrualAmount":  44454706,
                                               "bankruptcyClaimsOutstanding":  95401276,
                                               "borrowerDifficultyModifiedLoans":  {
                                                                                       "count":  881,
                                                                                       "amount":  125503944
                                                                                   },
                                               "borrowerDifficultyModifiedLoansNotInCompliance":  {
                                                                                                      "count":  176,
                                                                                                      "amount":  59421766
                                                                                                  }
                                           },
                           "indirectLoans":  [
                                                 {
                                                     "label":  "New and Used Vehicle Loans",
                                                     "count":  82513,
                                                     "amount":  1972859740,
                                                     "countAccountCode":  "IN0001",
                                                     "amountAccountCode":  "IN0002",
                                                     "source":  "Schedule A, Section 5"
                                                 },
                                                 {
                                                     "label":  "First Lien and Junior Lien Residential Loans",
                                                     "count":  0,
                                                     "amount":  0,
                                                     "countAccountCode":  "IN0003",
                                                     "amountAccountCode":  "IN0004",
                                                     "source":  "Schedule A, Section 5"
                                                 },
                                                 {
                                                     "label":  "Commercial Loans",
                                                     "count":  0,
                                                     "amount":  0,
                                                     "countAccountCode":  "IN0005",
                                                     "amountAccountCode":  "IN0006",
                                                     "source":  "Schedule A, Section 5"
                                                 },
                                                 {
                                                     "label":  "All Other Loans",
                                                     "count":  16141,
                                                     "amount":  753418752,
                                                     "countAccountCode":  "IN0007",
                                                     "amountAccountCode":  "IN0008",
                                                     "source":  "Schedule A, Section 5"
                                                 }
                                             ],
                           "indirectTotals":  {
                                                  "count":  98654,
                                                  "amount":  2726278492,
                                                  "countAccountCode":  "617A",
                                                  "amountAccountCode":  "618A",
                                                  "delinquentAmount":  29609301,
                                                  "delinquentAmountAccountCode":  "041E",
                                                  "chargeOffsYtd":  11543826,
                                                  "chargeOffsAccountCode":  "550E",
                                                  "recoveriesYtd":  2203296,
                                                  "recoveriesAccountCode":  "551E"
                                              },
                           "derivedMetrics":  {
                                                  "nonCommercialLoanBalance":  9385754545,
                                                  "autoLoanBalance":  2576442283,
                                                  "autoLoanCount":  127157,
                                                  "directAutoLoanBalance":  603582543,
                                                  "directAutoLoanCount":  44644,
                                                  "directAutoCalculation":  "New vehicle plus used vehicle loans minus indirect new/used vehicle loans; count never below zero.",
                                                  "indirectShareOfLoanBook":  0.2621297456,
                                                  "indirectVehicleShareOfAutoBalance":  0.7657302292
                                              },
                           "otherLoanInformation":  {
                                                        "loansToOfficials":  {
                                                                                 "count":  17,
                                                                                 "amount":  3850188
                                                                             },
                                                        "fcuInterestRateCeiling":  {
                                                                                       "amountOver15Percent":  null,
                                                                                       "weightedAverageRateOver15Percent":  null
                                                                                   },
                                                        "purchasedCreditImpairedLoans":  {
                                                                                             "contractualBalanceOutstanding":  0,
                                                                                             "reportedAsLoans":  0
                                                                                         },
                                                        "purchasedFinancialAssetsWithCreditDeterioration":  {
                                                                                                                "purchasePrice":  0,
                                                                                                                "nonCreditDiscountOrPremium":  0,
                                                                                                                "unpaidPrincipalBalanceOrParValue":  0,
                                                                                                                "acquirersAclAtAcquisitionDate":  0
                                                                                                            }
                                                    },
                           "realEstateDetails":  {
                                                     "firstLienBalance":  3712004149,
                                                     "firstLienGrantedYtd":  486917625,
                                                     "juniorLienBalance":  895970718,
                                                     "juniorLienGrantedYtd":  37953849,
                                                     "allOtherNonCommercialRealEstateBalance":  790036,
                                                     "allOtherNonCommercialRealEstateGrantedYtd":  0,
                                                     "totalNonCommercialRealEstate":  {
                                                                                          "count":  35358,
                                                                                          "amount":  4608764903,
                                                                                          "grantedYtd":  524871474
                                                                                      },
                                                     "constructionBalance":  185399134,
                                                     "repricesOrMaturesWithinFiveYears":  1017311212,
                                                     "interestOnlyPaymentOptionFirstLien":  {
                                                                                                "count":  1132,
                                                                                                "amount":  251621089,
                                                                                                "grantedYtd":  91297473
                                                                                            }
                                                 },
                           "commercialDetails":  {
                                                     "constructionAndDevelopmentMembers":  {
                                                                                               "count":  10,
                                                                                               "amount":  43768379,
                                                                                               "grantedYtdCount":  4,
                                                                                               "grantedYtdAmount":  2481931
                                                                                           },
                                                     "securedByFarmlandMembers":  {
                                                                                      "count":  0,
                                                                                      "amount":  0,
                                                                                      "grantedYtdCount":  0,
                                                                                      "grantedYtdAmount":  0
                                                                                  },
                                                     "multifamilyMembers":  {
                                                                                "count":  32,
                                                                                "amount":  75206807,
                                                                                "grantedYtdCount":  1,
                                                                                "grantedYtdAmount":  7600000
                                                                            },
                                                     "ownerOccupiedNonFarmNonResidentialMembers":  {
                                                                                                       "count":  550,
                                                                                                       "amount":  377245289,
                                                                                                       "grantedYtdCount":  10,
                                                                                                       "grantedYtdAmount":  30654250
                                                                                                   },
                                                     "nonOwnerOccupiedNonFarmNonResidentialMembers":  {
                                                                                                          "count":  320,
                                                                                                          "amount":  450297708,
                                                                                                          "grantedYtdCount":  7,
                                                                                                          "grantedYtdAmount":  12595000
                                                                                                      },
                                                     "totalCommercialRealEstateSecuredMembers":  {
                                                                                                     "count":  912,
                                                                                                     "amount":  946518183,
                                                                                                     "grantedYtdCount":  22,
                                                                                                     "grantedYtdAmount":  53331181
                                                                                                 },
                                                     "commercialAndIndustrialMembers":  {
                                                                                            "count":  328,
                                                                                            "amount":  32988934,
                                                                                            "grantedYtdCount":  16,
                                                                                            "grantedYtdAmount":  1750593
                                                                                        },
                                                     "unsecuredCommercialMembers":  {
                                                                                        "count":  34,
                                                                                        "amount":  1239885,
                                                                                        "grantedYtdCount":  0,
                                                                                        "grantedYtdAmount":  0
                                                                                    },
                                                     "unsecuredRevolvingCommercialMembers":  {
                                                                                                 "count":  164,
                                                                                                 "amount":  3649683,
                                                                                                 "grantedYtdCount":  0,
                                                                                                 "grantedYtdAmount":  0
                                                                                             },
                                                     "commercialMemberLoans":  {
                                                                                   "count":  1438,
                                                                                   "amount":  984396685,
                                                                                   "grantedYtdCount":  38,
                                                                                   "grantedYtdAmount":  55081774
                                                                               },
                                                     "nonmemberConstructionAndDevelopment":  {
                                                                                                 "count":  0,
                                                                                                 "amount":  0
                                                                                             },
                                                     "nonmemberMultifamily":  {
                                                                                  "count":  1,
                                                                                  "amount":  30000000,
                                                                                  "grantedYtdCount":  0,
                                                                                  "grantedYtdAmount":  0
                                                                              },
                                                     "nonmemberOwnerOccupiedNonFarmNonResidential":  {
                                                                                                         "count":  1,
                                                                                                         "amount":  341418,
                                                                                                         "grantedYtdCount":  0,
                                                                                                         "grantedYtdAmount":  0
                                                                                                     },
                                                     "nonmemberNonOwnerOccupiedNonFarmNonResidential":  {
                                                                                                            "count":  0,
                                                                                                            "amount":  0,
                                                                                                            "grantedYtdCount":  0,
                                                                                                            "grantedYtdAmount":  0
                                                                                                        },
                                                     "totalCommercialRealEstateSecuredNonmembers":  {
                                                                                                        "count":  2,
                                                                                                        "amount":  30341418,
                                                                                                        "grantedYtdCount":  0,
                                                                                                        "grantedYtdAmount":  0
                                                                                                    },
                                                     "totalCommercialNonmemberLoans":  {
                                                                                           "count":  2,
                                                                                           "amount":  30341418,
                                                                                           "grantedYtdCount":  0,
                                                                                           "grantedYtdAmount":  0
                                                                                       },
                                                     "totalCommercialLoans":  {
                                                                                  "count":  1440,
                                                                                  "amount":  1014738103
                                                                              },
                                                     "outstandingAgriculturalRelatedLoans":  {
                                                                                                 "count":  0,
                                                                                                 "amount":  0
                                                                                             },
                                                     "commercialRealEstateRepricesOrMaturesWithinFiveYears":  440526331,
                                                     "commercialParticipationsSoldServicingRetained":  {
                                                                                                           "count":  1,
                                                                                                           "amount":  2706796
                                                                                                       },
                                                     "commercialLoansSoldServicingRetained":  {
                                                                                                  "count":  0,
                                                                                                  "amount":  0
                                                                                              },
                                                     "commercialLoansSoldNoRetainedServicingYtd":  {
                                                                                                       "count":  0,
                                                                                                       "amount":  0
                                                                                                   },
                                                     "totalMemberBusinessLoansNet":  1061903039,
                                                     "commercialUnfundedCommitments":  22048847
                                                 },
                           "purchasedAndSoldLoans":  {
                                                         "purchasedFromOtherFinancialInstitutionsYtd":  {
                                                                                                            "count":  0,
                                                                                                            "amount":  0
                                                                                                        },
                                                         "purchasedFromOtherFinancialInstitutionsOutstanding":  {
                                                                                                                    "count":  0,
                                                                                                                    "amount":  0
                                                                                                                },
                                                         "purchasedFromOtherSourcesYtd":  {
                                                                                              "count":  0,
                                                                                              "amount":  0
                                                                                          },
                                                         "purchasedFromOtherSourcesOutstanding":  {
                                                                                                      "count":  0,
                                                                                                      "amount":  0
                                                                                                  },
                                                         "loansSoldYtd":  {
                                                                              "count":  104,
                                                                              "amount":  30380455
                                                                          },
                                                         "firstMortgageLoansSoldSecondaryMarketYtd":  {
                                                                                                          "count":  104,
                                                                                                          "amount":  30380455
                                                                                                      },
                                                         "loansTransferredWithLimitedRecourseQualifyingForSalesAccounting":  {
                                                                                                                                 "count":  0,
                                                                                                                                 "amount":  0
                                                                                                                             },
                                                         "realEstateLoansSoldServicingRetained":  {
                                                                                                      "ytdCount":  104,
                                                                                                      "ytdAmount":  30380455,
                                                                                                      "outstandingCount":  2567,
                                                                                                      "outstandingAmount":  413339343
                                                                                                  },
                                                         "allOtherLoansSoldServicingRetained":  {
                                                                                                    "ytdCount":  0,
                                                                                                    "ytdAmount":  0,
                                                                                                    "outstandingCount":  0,
                                                                                                    "outstandingAmount":  0
                                                                                                },
                                                         "loanParticipations":  {
                                                                                    "vehicleNonCommercial":  {
                                                                                                                 "purchasedYtd":  58303832,
                                                                                                                 "purchasedOutstanding":  0,
                                                                                                                 "soldYtd":  27376885,
                                                                                                                 "soldOutstanding":  161534249
                                                                                                             },
                                                                                    "nonFederallyGuaranteedStudent":  {
                                                                                                                          "purchasedYtd":  0,
                                                                                                                          "purchasedOutstanding":  0,
                                                                                                                          "soldYtd":  0,
                                                                                                                          "soldOutstanding":  0
                                                                                                                      },
                                                                                    "oneToFourFamilyResidential":  {
                                                                                                                       "purchasedYtd":  878809976,
                                                                                                                       "purchasedOutstanding":  218999761,
                                                                                                                       "soldYtd":  5061327,
                                                                                                                       "soldOutstanding":  0
                                                                                                                   },
                                                                                    "commercialExcludingConstructionAndDevelopment":  {
                                                                                                                                          "purchasedYtd":  30341418,
                                                                                                                                          "purchasedOutstanding":  0,
                                                                                                                                          "soldYtd":  6315859,
                                                                                                                                          "soldOutstanding":  0
                                                                                                                                      },
                                                                                    "commercialConstructionAndDevelopment":  {
                                                                                                                                 "purchasedYtd":  0,
                                                                                                                                 "purchasedOutstanding":  0,
                                                                                                                                 "soldYtd":  0,
                                                                                                                                 "soldOutstanding":  0
                                                                                                                             },
                                                                                    "allOther":  {
                                                                                                     "purchasedYtd":  179087812,
                                                                                                     "purchasedOutstanding":  0,
                                                                                                     "soldYtd":  0,
                                                                                                     "soldOutstanding":  0
                                                                                                 },
                                                                                    "total":  {
                                                                                                  "purchasedYtd":  1146543038,
                                                                                                  "purchasedOutstanding":  218999761,
                                                                                                  "soldYtd":  38754071,
                                                                                                  "soldOutstanding":  161534249
                                                                                              }
                                                                                }
                                                     },
                           "unfundedCommitments":  {
                                                       "commercialLoans":  22048847,
                                                       "revolvingOpenEndSecuredByResidentialProperty":  537399223,
                                                       "creditCardLines":  1526917792,
                                                       "unsecuredShareDraftLinesOfCredit":  262987127,
                                                       "unusedOverdraftProtectionProgram":  20492962,
                                                       "otherUnfundedCommitments":  25131797,
                                                       "totalNonCommercialLoans":  2372928901,
                                                       "totalAllLoanTypes":  2394977748,
                                                       "unconditionallyCancelableAllLoanTypes":  1530909001,
                                                       "conditionallyCancelableCommercialLoans":  18057638,
                                                       "consumerLoansSecuredAndRealEstate":  561789520,
                                                       "consumerLoansUnsecured":  284221589,
                                                       "totalConditionallyCancelable":  864068747,
                                                       "commercialLoansTransferredWithLimitedRecourse":  0,
                                                       "consumerLoansTransferredWithLimitedRecourse":  0,
                                                       "totalLoansTransferredWithLimitedRecourse":  0,
                                                       "loansTransferredFhlbMpf":  0
                                                   }
                       },
        "modeledOpportunity":  {
                                   "assumptions":  {
                                                       "creditLifeRatePerThousand":  1,
                                                       "creditDisabilityRatePerThousand":  2.25,
                                                       "debtProtectionIuiRatePerThousand":  1.4,
                                                       "creditAndDebtProtectionPenetration":  0.38,
                                                       "vscPenetration":  0.4,
                                                       "vscGfsMarginPerContract":  400,
                                                       "gapPenetration":  0.7,
                                                       "gapGfsMarginPerContract":  50,
                                                       "directAutoAverageTermMonths":  24
                                                   },
                                   "modeledMonthlyCreditLifePremium":  3566586.73,
                                   "modeledMonthlyCreditDisabilityPremium":  8024820.14,
                                   "modeledMonthlyDebtProtectionIuiPremium":  4993221.42,
                                   "modeledMonthlyDirectAutoOriginations":  1860.17,
                                   "modeledMonthlyVscGfsIncome":  297626.67,
                                   "modeledMonthlyGapGfsIncome":  65105.83,
                                   "notes":  [
                                                 "Credit and debt protection uses the repo AGENTS prospect heuristic on non-commercial loan balance.",
                                                 "VSC and GAP use direct auto count after subtracting indirect vehicle loans from new/used vehicle loan counts.",
                                                 "VyStar has a high indirect vehicle share, so direct VSC/GAP estimates intentionally use only the adjusted direct auto count."
                                             ]
                               },
        "relationshipResearch":  {
                                     "capturedAt":  "2026-06-20T19:51:30-05:00",
                                     "source":  "LinkedIn Sales Navigator and LinkedIn connections monitor tabs were present in authenticated Chrome, but browser control timed out before a readable result page or refreshed monitor state could be captured.",
                                     "searchUrl":  "https://www.linkedin.com/sales/search/people?keywords=VyStar%20Credit%20Union",
                                     "resultSummary":  "No visible professional leads, connection requests, or accepted-connection updates were captured because Sales Navigator navigation/read timed out twice during this run.",
                                     "visibleLeads":  [
    
                                                      ],
                                     "additionalVisibleNames":  [
    
                                                                ],
                                     "connectionRequests":  [
    
                                                            ],
                                     "connectionMonitor":  {
                                                               "url":  "https://www.linkedin.com/mynetwork/invite-connect/connections/",
                                                               "checkedAt":  "2026-06-20T19:51:30-05:00",
                                                               "status":  "Blocked",
                                                               "blocker":  "Chrome extension connected, but Sales Navigator navigation timed out twice before a visible result set; accepted-connection monitor was not refreshed to avoid further browser disruption."
                                                           }
                                 },
        "sources":  [
                        {
                            "label":  "NCUA Research a Credit Union",
                            "url":  "https://mapping.ncua.gov/ResearchCreditUnion",
                            "capturedAt":  "2026-06-20"
                        },
                        {
                            "label":  "NCUA credit union details API for charter 68490",
                            "url":  "https://mapping.ncua.gov/api/CreditUnionDetails/GetCreditUnionDetails/68490",
                            "capturedAt":  "2026-06-20"
                        },
                        {
                            "label":  "NCUA March 2026 call report download endpoint",
                            "url":  "https://mapping.ncua.gov/api/CreditUnionDetails/GetDownloadCallReport/68490?isCorpCU=false\u0026cycleDate=03/31/2026",
                            "capturedAt":  "2026-06-20"
                        },
                        {
                            "label":  "OpenStreetMap Nominatim geocode for main office address",
                            "url":  "https://nominatim.openstreetmap.org/search?format=json\u0026q=76%20S%20Laura%20St%20Jacksonville%20FL%2032202",
                            "capturedAt":  "2026-06-20"
                        },
                        {
                            "label":  "LinkedIn Sales Navigator people search attempt",
                            "url":  "https://www.linkedin.com/sales/search/people?keywords=VyStar%20Credit%20Union",
                            "capturedAt":  "2026-06-20"
                        },
                        {
                            "label":  "LinkedIn connections monitor not refreshed this run",
                            "url":  "https://www.linkedin.com/mynetwork/invite-connect/connections/",
                            "capturedAt":  "2026-06-20"
                        }
                    ],
        "dataQuality":  [
                            "NCUA call-report endpoint returned a JSON byte array for the PDF; bytes were decoded before text extraction.",
                            "PDF text extraction matched Schedule A loan categories, government-guaranteed loan lines, indirect loan totals, delinquency, charge-off/recovery, other loan information, real estate, commercial, loan sale/participation, and unfunded commitment sections.",
                            "OpenStreetMap returned an address-level match for 76 South Laura Street, Jacksonville, FL 32202.",
                            "Chrome extension connected and LinkedIn/Sales Navigator tabs were visible, but Sales Navigator navigation/read timed out twice. No Sales Navigator leads, LinkedIn connection requests, accepted-connection reconciliation, or one-time visible connections scan were completed for this heartbeat."
                        ]
    },
    {
        "id":  "first-tech-23521-2026-03-31",
        "name":  "First Tech Federal Credit Union",
        "charterNumber":  "23521",
        "priority":  "High",
        "status":  "Recurring research captured; LinkedIn request sent",
        "summary":  "Large technology-sector FCU with a $22.10B loan book, $4.63B in new/used vehicle loans, and $1.56B in total indirect loans, including $1.54B in indirect vehicle loans.",
        "profile":  {
                        "ncuaName":  "FIRST TECHNOLOGY",
                        "type":  "FCU",
                        "status":  "Active",
                        "charterState":  "Federal charter",
                        "region":  "8 - ONES",
                        "peerGroup":  "6 - $500,000,000 and greater",
                        "assets":  28579913967,
                        "members":  1868605,
                        "ceo":  "Shruti Miyashiro",
                        "website":  "http://www.firsttechfed.com",
                        "phone":  "855-855-8805",
                        "mainOffice":  {
                                           "street":  "2890 Zanker Rd, Ste 120",
                                           "city":  "San Jose",
                                           "state":  "CA",
                                           "zip":  "95134-2118",
                                           "county":  "Santa Clara",
                                           "country":  "United States",
                                           "latitude":  37.3958576,
                                           "longitude":  -121.9289281,
                                           "geocodePrecision":  "Building/base-address match for 2890 Zanker Rd from OpenStreetMap Nominatim; suite not separately geocoded"
                                       }
                    },
        "callReport":  {
                           "cycleDate":  "2026-03-31",
                           "reportLabel":  "March 2026 NCUA 5300 Call Report",
                           "totals":  {
                                          "loansHeldForSale":  24976915,
                                          "totalLoansAndLeases":  {
                                                                      "count":  952576,
                                                                      "amount":  22102854867
                                                                  },
                                          "allowanceForCreditLossesLoansAndLeases":  381556731,
                                          "accruedInterestOnLoansAndLeases":  94888157,
                                          "loansGrantedYtd":  {
                                                                  "count":  49245,
                                                                  "amount":  1165690489
                                                              },
                                          "paydayAlternativeLoansGrantedYtd":  {
                                                                                   "count":  10353,
                                                                                   "amount":  19203295
                                                                               },
                                          "interestOnLoansAndLeasesYtd":  362617087,
                                          "creditLossExpenseLoansAndLeasesYtd":  80017437,
                                          "gainLossOnSalesOfLoansAndLeasesYtd":  363634,
                                          "loanServicingExpenseYtd":  12342277
                                      },
                           "loanCategories":  [
                                                  {
                                                      "label":  "Unsecured Credit Card Loans",
                                                      "accountAmountCode":  "396",
                                                      "interestRate":  13,
                                                      "count":  371773,
                                                      "amount":  1042104389,
                                                      "productFit":  "Credit insurance/debt protection - unsecured consumer"
                                                  },
                                                  {
                                                      "label":  "Payday Alternative Loans (PALs I and PALs II)",
                                                      "accountAmountCode":  "397A",
                                                      "interestRate":  17.99,
                                                      "count":  33419,
                                                      "amount":  39531369,
                                                      "productFit":  "Small-dollar consumer lending review"
                                                  },
                                                  {
                                                      "label":  "Non-Federally Guaranteed Student Loans",
                                                      "accountAmountCode":  "698A",
                                                      "interestRate":  9.25,
                                                      "count":  19632,
                                                      "amount":  770969516,
                                                      "productFit":  "Consumer loan review"
                                                  },
                                                  {
                                                      "label":  "All Other Unsecured Loans/Lines of Credit",
                                                      "accountAmountCode":  "397",
                                                      "interestRate":  18,
                                                      "count":  159890,
                                                      "amount":  1407672554,
                                                      "productFit":  "Credit insurance/debt protection - unsecured consumer"
                                                  },
                                                  {
                                                      "label":  "New Vehicle Loans",
                                                      "accountAmountCode":  "385",
                                                      "interestRate":  4.99,
                                                      "count":  69699,
                                                      "amount":  1450206060,
                                                      "productFit":  "VSC, GAP, credit insurance, debt protection"
                                                  },
                                                  {
                                                      "label":  "Used Vehicle Loans",
                                                      "accountAmountCode":  "370",
                                                      "interestRate":  4.99,
                                                      "count":  215935,
                                                      "amount":  3182246466,
                                                      "productFit":  "VSC, GAP, credit insurance, debt protection"
                                                  },
                                                  {
                                                      "label":  "Leases Receivable",
                                                      "accountAmountCode":  "002",
                                                      "interestRate":  0,
                                                      "count":  0,
                                                      "amount":  0,
                                                      "productFit":  "Not material in this call report"
                                                  },
                                                  {
                                                      "label":  "All Other Secured Non-Real Estate Loans/Lines of Credit",
                                                      "accountAmountCode":  "698C",
                                                      "interestRate":  5.99,
                                                      "count":  24540,
                                                      "amount":  212071214,
                                                      "productFit":  "Collateral and consumer protection review"
                                                  },
                                                  {
                                                      "label":  "First Lien 1- to 4-Family Residential Property Loans/Lines",
                                                      "accountAmountCode":  "703A",
                                                      "interestRate":  6.63,
                                                      "count":  21906,
                                                      "amount":  8511994456,
                                                      "productFit":  "Mortgage credit insurance review"
                                                  },
                                                  {
                                                      "label":  "Junior Lien 1- to 4-Family Residential Property Loans/Lines",
                                                      "accountAmountCode":  "386A",
                                                      "interestRate":  7.75,
                                                      "count":  34313,
                                                      "amount":  2562589036,
                                                      "productFit":  "Mortgage and HELOC protection review"
                                                  },
                                                  {
                                                      "label":  "All Other Non-Commercial Real Estate Loans/Lines of Credit",
                                                      "accountAmountCode":  "386B",
                                                      "interestRate":  0,
                                                      "count":  0,
                                                      "amount":  0,
                                                      "productFit":  "Not material in this call report"
                                                  },
                                                  {
                                                      "label":  "Commercial Loans/Lines of Credit Real Estate Secured",
                                                      "accountAmountCode":  "718A5",
                                                      "interestRate":  6,
                                                      "count":  1020,
                                                      "amount":  2906912680,
                                                      "productFit":  "Commercial lending context only"
                                                  },
                                                  {
                                                      "label":  "Commercial Loans/Lines of Credit Not Real Estate Secured",
                                                      "accountAmountCode":  "400P",
                                                      "interestRate":  7.49,
                                                      "count":  449,
                                                      "amount":  16557127,
                                                      "productFit":  "Commercial lending context only"
                                                  }
                                              ],
                           "governmentGuaranteedLoans":  {
                                                             "nonCommercialSba":  {
                                                                                      "count":  1,
                                                                                      "balance":  22461,
                                                                                      "guaranteedPortion":  16846
                                                                                  },
                                                             "nonCommercialPppIncludedInSba":  {
                                                                                                   "count":  0,
                                                                                                   "balance":  0
                                                                                               },
                                                             "nonCommercialOtherGovernmentGuaranteed":  {
                                                                                                            "count":  0,
                                                                                                            "balance":  0,
                                                                                                            "guaranteedPortion":  0
                                                                                                        },
                                                             "commercialSba":  {
                                                                                   "count":  0,
                                                                                   "balance":  0,
                                                                                   "guaranteedPortion":  0
                                                                               },
                                                             "commercialOtherGovernmentGuaranteed":  {
                                                                                                         "count":  0,
                                                                                                         "balance":  0,
                                                                                                         "guaranteedPortion":  0
                                                                                                     }
                                                         },
                           "chargeOffAndRecoveryYtd":  [
                                                           {
                                                               "label":  "Unsecured Credit Card Loans",
                                                               "chargeOffs":  15199052,
                                                               "recoveries":  1425923
                                                           },
                                                           {
                                                               "label":  "Payday Alternative Loans (PALs I and PALs II)",
                                                               "chargeOffs":  1496829,
                                                               "recoveries":  84219
                                                           },
                                                           {
                                                               "label":  "Non-Federally Guaranteed Student Loans",
                                                               "chargeOffs":  1721336,
                                                               "recoveries":  589340
                                                           },
                                                           {
                                                               "label":  "All Other Unsecured Loans/Lines of Credit",
                                                               "chargeOffs":  27400626,
                                                               "recoveries":  3905560
                                                           },
                                                           {
                                                               "label":  "New Vehicle Loans",
                                                               "chargeOffs":  6600686,
                                                               "recoveries":  1347042
                                                           },
                                                           {
                                                               "label":  "Used Vehicle Loans",
                                                               "chargeOffs":  19857334,
                                                               "recoveries":  1123781
                                                           },
                                                           {
                                                               "label":  "Leases Receivable",
                                                               "chargeOffs":  0,
                                                               "recoveries":  0
                                                           },
                                                           {
                                                               "label":  "All Other Secured Non-Real Estate Loans/Lines of Credit",
                                                               "chargeOffs":  831620,
                                                               "recoveries":  150065
                                                           },
                                                           {
                                                               "label":  "First Lien Residential Property Loans/Lines of Credit",
                                                               "chargeOffs":  0,
                                                               "recoveries":  0
                                                           },
                                                           {
                                                               "label":  "Junior Lien Residential Property Loans/Lines of Credit",
                                                               "chargeOffs":  22521,
                                                               "recoveries":  93074
                                                           },
                                                           {
                                                               "label":  "All Other Non-Commercial Real Estate Loans/Lines of Credit",
                                                               "chargeOffs":  0,
                                                               "recoveries":  0
                                                           },
                                                           {
                                                               "label":  "Commercial Multifamily Loans",
                                                               "chargeOffs":  4779303,
                                                               "recoveries":  0
                                                           },
                                                           {
                                                               "label":  "Commercial Non-Owner Occupied Non-Farm Non-Residential Loans",
                                                               "chargeOffs":  28076042,
                                                               "recoveries":  0
                                                           },
                                                           {
                                                               "label":  "Commercial and Industrial Loans",
                                                               "chargeOffs":  160293,
                                                               "recoveries":  42595
                                                           },
                                                           {
                                                               "label":  "Unsecured Commercial Loans",
                                                               "chargeOffs":  0,
                                                               "recoveries":  0
                                                           },
                                                           {
                                                               "label":  "Unsecured Revolving Commercial Lines",
                                                               "chargeOffs":  0,
                                                               "recoveries":  0
                                                           },
                                                           {
                                                               "label":  "Total Loans and Leases",
                                                               "chargeOffs":  106145642,
                                                               "recoveries":  8761599
                                                           },
                                                           {
                                                               "label":  "Participation Loans Purchased",
                                                               "chargeOffs":  680611,
                                                               "recoveries":  305686
                                                           },
                                                           {
                                                               "label":  "Indirect Loans",
                                                               "chargeOffs":  10508222,
                                                               "recoveries":  1628150
                                                           },
                                                           {
                                                               "label":  "Whole/Partial Purchased Loans",
                                                               "chargeOffs":  0,
                                                               "recoveries":  0
                                                           }
                                                       ],
                           "delinquency":  {
                                               "totalDelinquent30To59Amount":  180761343,
                                               "totalDelinquent60Plus":  {
                                                                             "count":  15926,
                                                                             "amount":  271599326
                                                                         },
                                               "participationLoansPurchasedDelinquentAmount":  2846945,
                                               "indirectDelinquentAmount":  31755051,
                                               "wholeOrPartialPurchasedLoansDelinquentAmount":  1345344,
                                               "nonCommercialNonAccrualAmount":  155855267,
                                               "commercialNonAccrualAmount":  93116688,
                                               "bankruptcyClaimsOutstanding":  54243940,
                                               "borrowerDifficultyModifiedLoans":  {
                                                                                       "count":  1232,
                                                                                       "amount":  46754353
                                                                                   },
                                               "borrowerDifficultyModifiedLoansNotInCompliance":  {
                                                                                                      "count":  140,
                                                                                                      "amount":  2918008
                                                                                                  }
                                           },
                           "indirectLoans":  [
                                                 {
                                                     "label":  "New and Used Vehicle Loans",
                                                     "count":  78677,
                                                     "amount":  1541085132,
                                                     "countAccountCode":  "IN0001",
                                                     "amountAccountCode":  "IN0002",
                                                     "source":  "Schedule A, Section 5"
                                                 },
                                                 {
                                                     "label":  "First Lien and Junior Lien Residential Loans",
                                                     "count":  0,
                                                     "amount":  0,
                                                     "countAccountCode":  "IN0003",
                                                     "amountAccountCode":  "IN0004",
                                                     "source":  "Schedule A, Section 5"
                                                 },
                                                 {
                                                     "label":  "Commercial Loans",
                                                     "count":  0,
                                                     "amount":  0,
                                                     "countAccountCode":  "IN0005",
                                                     "amountAccountCode":  "IN0006",
                                                     "source":  "Schedule A, Section 5"
                                                 },
                                                 {
                                                     "label":  "All Other Loans",
                                                     "count":  1567,
                                                     "amount":  22977262,
                                                     "countAccountCode":  "IN0007",
                                                     "amountAccountCode":  "IN0008",
                                                     "source":  "Schedule A, Section 5"
                                                 }
                                             ],
                           "indirectTotals":  {
                                                  "count":  80244,
                                                  "amount":  1564062394,
                                                  "countAccountCode":  "617A",
                                                  "amountAccountCode":  "618A",
                                                  "delinquentAmount":  31755051,
                                                  "delinquentAmountAccountCode":  "041E",
                                                  "chargeOffsYtd":  10508222,
                                                  "chargeOffsAccountCode":  "550E",
                                                  "recoveriesYtd":  1628150,
                                                  "recoveriesAccountCode":  "551E"
                                              },
                           "derivedMetrics":  {
                                                  "nonCommercialLoanBalance":  19179385061,
                                                  "autoLoanBalance":  4632452526,
                                                  "autoLoanCount":  285634,
                                                  "directAutoLoanBalance":  3091367394,
                                                  "directAutoLoanCount":  206957,
                                                  "directAutoCalculation":  "New vehicle plus used vehicle loans minus indirect new/used vehicle loans; count never below zero.",
                                                  "indirectShareOfLoanBook":  0.0707629129,
                                                  "indirectVehicleShareOfAutoBalance":  0.3326715435
                                              },
                           "otherLoanInformation":  {
                                                        "loansToOfficials":  {
                                                                                 "count":  117,
                                                                                 "amount":  31199612
                                                                             },
                                                        "fcuInterestRateCeiling":  {
                                                                                       "amountOver15Percent":  585765562,
                                                                                       "weightedAverageRateOver15Percent":  17.24
                                                                                   },
                                                        "purchasedCreditImpairedLoans":  {
                                                                                             "contractualBalanceOutstanding":  0,
                                                                                             "reportedAsLoans":  0
                                                                                         },
                                                        "purchasedFinancialAssetsWithCreditDeterioration":  {
                                                                                                                "purchasePrice":  301188623,
                                                                                                                "nonCreditDiscountOrPremium":  53370567,
                                                                                                                "unpaidPrincipalBalanceOrParValue":  42113844,
                                                                                                                "acquirersAclAtAcquisitionDate":  363571384
                                                                                                            }
                                                    },
                           "realEstateDetails":  {
                                                     "firstLienBalance":  8511994456,
                                                     "firstLienGrantedYtd":  346840081,
                                                     "juniorLienBalance":  2562589035,
                                                     "juniorLienGrantedYtd":  311891154,
                                                     "allOtherNonCommercialRealEstateBalance":  0,
                                                     "allOtherNonCommercialRealEstateGrantedYtd":  0,
                                                     "totalNonCommercialRealEstate":  {
                                                                                          "count":  56219,
                                                                                          "amount":  11074583491,
                                                                                          "grantedYtd":  658731235
                                                                                      },
                                                     "constructionBalance":  17620122,
                                                     "repricesOrMaturesWithinFiveYears":  6227987642,
                                                     "interestOnlyPaymentOptionFirstLien":  {
                                                                                                "count":  77,
                                                                                                "amount":  214134196,
                                                                                                "grantedYtd":  4770000
                                                                                            }
                                                 },
                           "commercialDetails":  {
                                                     "constructionAndDevelopmentMembers":  {
                                                                                               "count":  13,
                                                                                               "amount":  82915193,
                                                                                               "grantedYtdCount":  0,
                                                                                               "grantedYtdAmount":  0
                                                                                           },
                                                     "securedByFarmlandMembers":  {
                                                                                      "count":  0,
                                                                                      "amount":  0,
                                                                                      "grantedYtdCount":  0,
                                                                                      "grantedYtdAmount":  0
                                                                                  },
                                                     "multifamilyMembers":  {
                                                                                "count":  361,
                                                                                "amount":  989917894,
                                                                                "grantedYtdCount":  8,
                                                                                "grantedYtdAmount":  20961750
                                                                            },
                                                     "ownerOccupiedNonFarmNonResidentialMembers":  {
                                                                                                       "count":  93,
                                                                                                       "amount":  197320638,
                                                                                                       "grantedYtdCount":  1,
                                                                                                       "grantedYtdAmount":  5410000
                                                                                                   },
                                                     "nonOwnerOccupiedNonFarmNonResidentialMembers":  {
                                                                                                          "count":  545,
                                                                                                          "amount":  1628032960,
                                                                                                          "grantedYtdCount":  8,
                                                                                                          "grantedYtdAmount":  35140000
                                                                                                      },
                                                     "totalCommercialRealEstateSecuredMembers":  {
                                                                                                     "count":  1012,
                                                                                                     "amount":  2898186685,
                                                                                                     "grantedYtdCount":  17,
                                                                                                     "grantedYtdAmount":  61511750
                                                                                                 },
                                                     "commercialAndIndustrialMembers":  {
                                                                                            "count":  424,
                                                                                            "amount":  16222499,
                                                                                            "grantedYtdCount":  4,
                                                                                            "grantedYtdAmount":  248655
                                                                                        },
                                                     "unsecuredCommercialMembers":  {
                                                                                        "count":  0,
                                                                                        "amount":  0,
                                                                                        "grantedYtdCount":  0,
                                                                                        "grantedYtdAmount":  0
                                                                                    },
                                                     "unsecuredRevolvingCommercialMembers":  {
                                                                                                 "count":  25,
                                                                                                 "amount":  334628,
                                                                                                 "grantedYtdCount":  0,
                                                                                                 "grantedYtdAmount":  0
                                                                                             },
                                                     "commercialMemberLoans":  {
                                                                                   "count":  1461,
                                                                                   "amount":  2914743812,
                                                                                   "grantedYtdCount":  21,
                                                                                   "grantedYtdAmount":  61760405
                                                                               },
                                                     "nonmemberConstructionAndDevelopment":  {
                                                                                                 "count":  0,
                                                                                                 "amount":  0
                                                                                             },
                                                     "nonmemberMultifamily":  {
                                                                                  "count":  0,
                                                                                  "amount":  0,
                                                                                  "grantedYtdCount":  0,
                                                                                  "grantedYtdAmount":  0
                                                                              },
                                                     "nonmemberOwnerOccupiedNonFarmNonResidential":  {
                                                                                                         "count":  0,
                                                                                                         "amount":  0,
                                                                                                         "grantedYtdCount":  0,
                                                                                                         "grantedYtdAmount":  0
                                                                                                     },
                                                     "nonmemberNonOwnerOccupiedNonFarmNonResidential":  {
                                                                                                            "count":  8,
                                                                                                            "amount":  8725994,
                                                                                                            "grantedYtdCount":  0,
                                                                                                            "grantedYtdAmount":  0
                                                                                                        },
                                                     "totalCommercialRealEstateSecuredNonmembers":  {
                                                                                                        "count":  8,
                                                                                                        "amount":  8725994,
                                                                                                        "grantedYtdCount":  0,
                                                                                                        "grantedYtdAmount":  0
                                                                                                    },
                                                     "totalCommercialNonmemberLoans":  {
                                                                                           "count":  8,
                                                                                           "amount":  8725994,
                                                                                           "grantedYtdCount":  0,
                                                                                           "grantedYtdAmount":  0
                                                                                       },
                                                     "totalCommercialLoans":  {
                                                                                  "count":  1469,
                                                                                  "amount":  2923469806
                                                                              },
                                                     "outstandingAgriculturalRelatedLoans":  {
                                                                                                 "count":  0,
                                                                                                 "amount":  0
                                                                                             },
                                                     "commercialRealEstateRepricesOrMaturesWithinFiveYears":  2349256175,
                                                     "commercialParticipationsSoldServicingRetained":  {
                                                                                                           "count":  257,
                                                                                                           "amount":  445359834
                                                                                                       },
                                                     "commercialLoansSoldServicingRetained":  {
                                                                                                  "count":  0,
                                                                                                  "amount":  0
                                                                                              },
                                                     "commercialLoansSoldNoRetainedServicingYtd":  {
                                                                                                       "count":  0,
                                                                                                       "amount":  0
                                                                                                   },
                                                     "totalMemberBusinessLoansNet":  2975916647,
                                                     "commercialUnfundedCommitments":  60748715
                                                 },
                           "purchasedAndSoldLoans":  {
                                                         "purchasedFromOtherFinancialInstitutionsYtd":  {
                                                                                                            "count":  0,
                                                                                                            "amount":  0
                                                                                                        },
                                                         "purchasedFromOtherFinancialInstitutionsOutstanding":  {
                                                                                                                    "count":  858,
                                                                                                                    "amount":  70696678
                                                                                                                },
                                                         "purchasedFromOtherSourcesYtd":  {
                                                                                              "count":  358,
                                                                                              "amount":  75223310
                                                                                          },
                                                         "purchasedFromOtherSourcesOutstanding":  {
                                                                                                      "count":  1179,
                                                                                                      "amount":  158376082
                                                                                                  },
                                                         "loansSoldYtd":  {
                                                                              "count":  75,
                                                                              "amount":  36947893
                                                                          },
                                                         "firstMortgageLoansSoldSecondaryMarketYtd":  {
                                                                                                          "count":  75,
                                                                                                          "amount":  36947893
                                                                                                      },
                                                         "loansTransferredWithLimitedRecourseQualifyingForSalesAccounting":  {
                                                                                                                                 "count":  0,
                                                                                                                                 "amount":  0
                                                                                                                             },
                                                         "realEstateLoansSoldServicingRetained":  {
                                                                                                      "ytdCount":  67,
                                                                                                      "ytdAmount":  27647932,
                                                                                                      "outstandingCount":  24658,
                                                                                                      "outstandingAmount":  5299571783
                                                                                                  },
                                                         "allOtherLoansSoldServicingRetained":  {
                                                                                                    "ytdCount":  0,
                                                                                                    "ytdAmount":  0,
                                                                                                    "outstandingCount":  0,
                                                                                                    "outstandingAmount":  0
                                                                                                },
                                                         "loanParticipations":  {
                                                                                    "vehicleNonCommercial":  {
                                                                                                                 "purchasedYtd":  124189354,
                                                                                                                 "purchasedOutstanding":  0,
                                                                                                                 "soldYtd":  2940774,
                                                                                                                 "soldOutstanding":  0
                                                                                                             },
                                                                                    "nonFederallyGuaranteedStudent":  {
                                                                                                                          "purchasedYtd":  0,
                                                                                                                          "purchasedOutstanding":  0,
                                                                                                                          "soldYtd":  0,
                                                                                                                          "soldOutstanding":  0
                                                                                                                      },
                                                                                    "oneToFourFamilyResidential":  {
                                                                                                                       "purchasedYtd":  353405294,
                                                                                                                       "purchasedOutstanding":  33608047,
                                                                                                                       "soldYtd":  9453737,
                                                                                                                       "soldOutstanding":  0
                                                                                                                   },
                                                                                    "commercialExcludingConstructionAndDevelopment":  {
                                                                                                                                          "purchasedYtd":  16152003,
                                                                                                                                          "purchasedOutstanding":  0,
                                                                                                                                          "soldYtd":  445746559,
                                                                                                                                          "soldOutstanding":  12300000
                                                                                                                                      },
                                                                                    "commercialConstructionAndDevelopment":  {
                                                                                                                                 "purchasedYtd":  0,
                                                                                                                                 "purchasedOutstanding":  0,
                                                                                                                                 "soldYtd":  0,
                                                                                                                                 "soldOutstanding":  0
                                                                                                                             },
                                                                                    "allOther":  {
                                                                                                     "purchasedYtd":  0,
                                                                                                     "purchasedOutstanding":  0,
                                                                                                     "soldYtd":  12730998,
                                                                                                     "soldOutstanding":  0
                                                                                                 },
                                                                                    "total":  {
                                                                                                  "purchasedYtd":  493746651,
                                                                                                  "purchasedOutstanding":  33608047,
                                                                                                  "soldYtd":  470872068,
                                                                                                  "soldOutstanding":  12300000
                                                                                              }
                                                                                }
                                                     },
                           "unfundedCommitments":  {
                                                       "commercialLoans":  60748715,
                                                       "revolvingOpenEndSecuredByResidentialProperty":  2562165023,
                                                       "creditCardLines":  4382635341,
                                                       "unsecuredShareDraftLinesOfCredit":  154652082,
                                                       "unusedOverdraftProtectionProgram":  415663773,
                                                       "otherUnfundedCommitments":  61745033,
                                                       "totalNonCommercialLoans":  7576861252,
                                                       "totalAllLoanTypes":  7637609967,
                                                       "unconditionallyCancelableAllLoanTypes":  4597083549,
                                                       "conditionallyCancelableCommercialLoans":  50622164,
                                                       "consumerLoansSecuredAndRealEstate":  2588490391,
                                                       "consumerLoansUnsecured":  401413863,
                                                       "totalConditionallyCancelable":  3040526418,
                                                       "commercialLoansTransferredWithLimitedRecourse":  0,
                                                       "consumerLoansTransferredWithLimitedRecourse":  0,
                                                       "totalLoansTransferredWithLimitedRecourse":  0,
                                                       "loansTransferredFhlbMpf":  0,
                                                       "financialStandbyLettersOfCredit":  80499200,
                                                       "forwardAgreementsNotDerivativeContracts":  224999997
                                                   }
                       },
        "modeledOpportunity":  {
                                   "assumptions":  {
                                                       "creditLifeRatePerThousand":  1,
                                                       "creditDisabilityRatePerThousand":  2.25,
                                                       "debtProtectionIuiRatePerThousand":  1.4,
                                                       "creditAndDebtProtectionPenetration":  0.38,
                                                       "vscPenetration":  0.4,
                                                       "vscGfsMarginPerContract":  400,
                                                       "gapPenetration":  0.7,
                                                       "gapGfsMarginPerContract":  50,
                                                       "directAutoAverageTermMonths":  24
                                                   },
                                   "modeledMonthlyCreditLifePremium":  7288166.32,
                                   "modeledMonthlyCreditDisabilityPremium":  16398374.23,
                                   "modeledMonthlyDebtProtectionIuiPremium":  10203432.85,
                                   "modeledMonthlyDirectAutoOriginations":  8623.21,
                                   "modeledMonthlyVscGfsIncome":  1379713.33,
                                   "modeledMonthlyGapGfsIncome":  301812.29,
                                   "notes":  [
                                                 "Credit and debt protection uses the repo AGENTS prospect heuristic on non-commercial loan balance.",
                                                 "VSC and GAP use direct auto count after subtracting indirect vehicle loans from new/used vehicle loan counts.",
                                                 "First Tech has both direct and indirect auto volume; the direct-auto estimate remains large after removing reported indirect vehicle loans."
                                             ]
                               },
        "relationshipResearch":  {
                                     "capturedAt":  "2026-06-20T20:05:41-05:00",
                                     "source":  "LinkedIn Sales Navigator visible search results and regular LinkedIn profile actions from authenticated Chrome session",
                                     "searchUrl":  "https://www.linkedin.com/sales/search/people?keywords=First%20Tech%20Federal%20Credit%20Union%20lending%20executive",
                                     "resultSummary":  "Sales Navigator returned 86 results for the tighter First Tech lending executive search. David Gorman was visibly verified as a current First Tech SVP/head of third-party lending, and a no-note LinkedIn connection request was submitted from his regular LinkedIn profile.",
                                     "visibleLeads":  [
                                                          {
                                                              "name":  "David Gorman",
                                                              "title":  "SVP - Head of Third Party Lending - Mortgage, Consumer, Auto, Fintech",
                                                              "company":  "First Tech Federal Credit Union",
                                                              "location":  "Portland, Oregon, United States",
                                                              "tenure":  "4 months in role; 1 year 10 months in company",
                                                              "signal":  "Current role covers third-party lending channels including mortgage, consumer, auto, fintech, and indirect auto; Sales Navigator also showed recent posts and 7 mutual connections.",
                                                              "titleMatched":  "Lending executive; SVP/head of third-party lending, mortgage, consumer, auto, fintech",
                                                              "salesNavigatorUrl":  "https://www.linkedin.com/sales/lead/ACwAAAGit8EBJQJg0dqxNy9qxSeQzbOVIJmw4Uw,NAME_SEARCH,4V4_?_ntb=UYeSzqH5TaSVaxjALFQBEA%3D%3D",
                                                              "profileUrl":  "https://www.linkedin.com/in/david-gorman-3152349/",
                                                              "requestedAt":  "2026-06-20T20:05:41-05:00",
                                                              "status":  "requested",
                                                              "blocker":  null
                                                          }
                                                      ],
                                     "additionalVisibleNames":  [
                                                                    "John Wilkening - visible result, current company Tech Credit Union, not target company",
                                                                    "Kenn D. Darling - visible result, current company Coast Central Credit Union, not target company",
                                                                    "Fabricio Redrovan Ponce",
                                                                    "Shruti M.",
                                                                    "Jennifer Wilkinson, JD/MBA",
                                                                    "Chris Michalak",
                                                                    "Rich Mukhtar",
                                                                    "David Balcom",
                                                                    "Crystal Chandler - regular LinkedIn profile recommendation, Director National Sales at First Tech Federal Credit Union, Indirect Lending",
                                                                    "Erika Cantrell - regular LinkedIn profile recommendation, Vice President, Mortgage (TPO) at First Tech Federal Credit Union"
                                                                ],
                                     "connectionRequests":  [
                                                                {
                                                                    "name":  "David Gorman",
                                                                    "title":  "SVP - Head of Third Party Lending - Mortgage, Consumer, Auto, Fintech",
                                                                    "company":  "First Tech Federal Credit Union",
                                                                    "titleMatched":  "Lending executive; third-party lending includes mortgage, consumer, auto, fintech, and indirect auto",
                                                                    "requestedAt":  "2026-06-20T20:05:41-05:00",
                                                                    "status":  "requested",
                                                                    "acceptedAt":  null,
                                                                    "profileUrl":  "https://www.linkedin.com/in/david-gorman-3152349/",
                                                                    "searchUrl":  "https://www.linkedin.com/sales/search/people?keywords=First%20Tech%20Federal%20Credit%20Union%20lending%20executive",
                                                                    "salesNavigatorUrl":  "https://www.linkedin.com/sales/lead/ACwAAAGit8EBJQJg0dqxNy9qxSeQzbOVIJmw4Uw,NAME_SEARCH,4V4_?_ntb=UYeSzqH5TaSVaxjALFQBEA%3D%3D",
                                                                    "blocker":  null,
                                                                    "note":  "Clicked LinkedIn custom invite Send without a note; profile state did not fully rehydrate afterward, but the confirmation dialog closed without visible error."
                                                                }
                                                            ],
                                     "connectionMonitor":  {
                                                               "url":  "https://www.linkedin.com/mynetwork/invite-connect/connections/",
                                                               "checkedAt":  "2026-06-20T20:05:41-05:00",
                                                               "status":  "Checked",
                                                               "acceptedRequestMatches":  [
    
                                                                                          ],
                                                               "visibleExistingCreditUnionConnections":  [
                                                                                                             {
                                                                                                                 "name":  "Brandon Leonard",
                                                                                                                 "title":  "Consumer Lending Relations Advisor",
                                                                                                                 "company":  "Veridian Credit Union",
                                                                                                                 "connectedOn":  "2026-06-19"
                                                                                                             },
                                                                                                             {
                                                                                                                 "name":  "Amy White",
                                                                                                                 "title":  "VP of Retail Branch Operations",
                                                                                                                 "company":  "Heartland Credit Union - Kansas",
                                                                                                                 "connectedOn":  "2026-06-16"
                                                                                                             },
                                                                                                             {
                                                                                                                 "name":  "Rachel Murphy",
                                                                                                                 "title":  "VP of Consumer Lending",
                                                                                                                 "company":  null,
                                                                                                                 "connectedOn":  "2026-06-12"
                                                                                                             },
                                                                                                             {
                                                                                                                 "name":  "Jennifer Walker",
                                                                                                                 "title":  "Controller",
                                                                                                                 "company":  "Heartland Credit Union",
                                                                                                                 "connectedOn":  "2026-06-06"
                                                                                                             },
                                                                                                             {
                                                                                                                 "name":  "Mike Gutshall",
                                                                                                                 "title":  "President \u0026 CEO",
                                                                                                                 "company":  "Heritage Valley FCU",
                                                                                                                 "connectedOn":  "2026-04-22"
                                                                                                             },
                                                                                                             {
                                                                                                                 "name":  "Holly Augustine",
                                                                                                                 "title":  "Director of Operations",
                                                                                                                 "company":  "Colorado Credit Union",
                                                                                                                 "connectedOn":  "2026-04-10"
                                                                                                             }
                                                                                                         ],
                                                               "note":  "Connections monitor was refreshed after the request. David Gorman appeared only in the search box/recent-search context, not as an accepted connection in the visible list."
                                                           }
                                 },
        "sources":  [
                        {
                            "label":  "NCUA Research a Credit Union",
                            "url":  "https://mapping.ncua.gov/ResearchCreditUnion",
                            "capturedAt":  "2026-06-20"
                        },
                        {
                            "label":  "NCUA credit union details API for charter 23521",
                            "url":  "https://mapping.ncua.gov/api/CreditUnionDetails/GetCreditUnionDetails/23521",
                            "capturedAt":  "2026-06-20"
                        },
                        {
                            "label":  "NCUA March 2026 call report download endpoint",
                            "url":  "https://mapping.ncua.gov/api/CreditUnionDetails/GetDownloadCallReport/23521?isCorpCU=false\u0026cycleDate=03/31/2026",
                            "capturedAt":  "2026-06-20"
                        },
                        {
                            "label":  "OpenStreetMap Nominatim geocode for main office address",
                            "url":  "https://nominatim.openstreetmap.org/search?format=json\u0026q=2890%20Zanker%20Rd%20San%20Jose%20CA%2095134",
                            "capturedAt":  "2026-06-20"
                        },
                        {
                            "label":  "U.S. Census geocoder confirmation for main office address range",
                            "url":  "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=2890%20Zanker%20Rd%20Ste%20120%20San%20Jose%20CA%2095134\u0026benchmark=Public_AR_Current\u0026format=json",
                            "capturedAt":  "2026-06-20"
                        },
                        {
                            "label":  "LinkedIn Sales Navigator people search",
                            "url":  "https://www.linkedin.com/sales/search/people?keywords=First%20Tech%20Federal%20Credit%20Union%20lending%20executive",
                            "capturedAt":  "2026-06-20"
                        },
                        {
                            "label":  "LinkedIn profile used for no-note connection request",
                            "url":  "https://www.linkedin.com/in/david-gorman-3152349/",
                            "capturedAt":  "2026-06-20"
                        },
                        {
                            "label":  "LinkedIn connections monitor refreshed",
                            "url":  "https://www.linkedin.com/mynetwork/invite-connect/connections/",
                            "capturedAt":  "2026-06-20"
                        }
                    ],
        "dataQuality":  [
                            "NCUA name search identified FIRST TECHNOLOGY charter 23521; NCUA details page listed the credit union as active with March 2026 as the latest available call report cycle.",
                            "NCUA call-report endpoint returned a JSON byte array for the PDF; bytes were decoded before text extraction.",
                            "PDF text extraction matched Schedule A loan categories, government-guaranteed loan lines, indirect loan totals, delinquency, charge-off/recovery, other loan information, real estate, commercial, loan sale/participation, and unfunded commitment sections.",
                            "Schedule A Section 1 and Section 7 differ by $1 on junior-lien residential balance; the loan category uses Section 1 account 386A while real estate detail uses Section 7 account RL0030.",
                            "OpenStreetMap returned a building/base-address match for 2890 Zanker Rd; Census returned the matching address range for the suite address.",
                            "LinkedIn request was submitted through the regular LinkedIn custom invite dialog with no note. Post-submit profile verification did not fully rehydrate, so the request is recorded as requested/pending based on the completed Send without a note action and absence of a visible error.",
                            "Connections monitor refresh was visible and showed existing credit-union relationships, but no accepted match for David Gorman yet."
                        ]
    }
  ]
};