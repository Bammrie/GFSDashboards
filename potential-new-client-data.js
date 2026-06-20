window.POTENTIAL_NEW_CLIENT_DATA = {
  updatedAt: '2026-06-20T16:58:00-05:00',
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
        capturedAt: '2026-06-20T16:58:00-05:00',
        source: 'LinkedIn Sales Navigator attempted in Chrome; session redirected to LinkedIn Sales Navigator login before visible leads loaded',
        searchUrl: 'https://www.linkedin.com/sales/search/people?keywords=Lake%20Michigan%20Credit%20Union',
        resultSummary: 'No visible professional leads captured because the Chrome Sales Navigator session was not authenticated at capture time.',
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
    }
  ]
};