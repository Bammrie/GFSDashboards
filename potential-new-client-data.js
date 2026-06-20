window.POTENTIAL_NEW_CLIENT_DATA = {
  updatedAt: '2026-06-20T17:12:00-05:00',
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
    }
  ]
};