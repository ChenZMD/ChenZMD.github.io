/**
 * 全球资金流与经济金融数据集 — 基于权威机构公开数据
 * 
 * 数据来源：
 * 1. IMF CPIS (Coordinated Portfolio Investment Survey) — 2024年6月数据
 *    https://data.imf.org/en/datasets/IMF.STA:PIP
 *    - 全球组合投资资产: $71.1万亿，其中股票$40.2万亿（2024年6月）
 * 
 * 2. IMF CDIS (Coordinated Direct Investment Survey) — 2024年12月数据
 *    https://data.imf.org/en/datasets/IMF.STA:DIP
 *    - 美国、中国、荷兰、卢森堡、英国 = 全球FDI前五大目的地
 * 
 * 3. BIS Locational Banking Statistics — 2024年12月数据
 *    https://www.bis.org/statistics/gli2504.pdf
 *    - 全球跨境银行信贷: $32.6万亿
 * 
 * 4. World Bank WDI — 2024/2025年数据
 *    https://data.worldbank.org/indicator/CM.MKT.LCAP.CD
 *    - 全球股市市值: $141万亿（2025年）
 * 
 * 5. World Federation of Exchanges (WFE) — 2025年市场统计
 *    https://focus.world-exchanges.org/
 *    - 各交易所市值、成交量数据
 * 
 * 6. World Gold Council — 2025年黄金需求趋势报告
 *    https://www.gold.org/goldhub/research/gold-demand-trends
 *    - 2025年全球黄金总需求: 5,002吨（创历史新高）
 *    - 2025年均价: $3,431/盎司（同比+44%）
 * 
 * 7. OPEC Annual Statistical Bulletin 2026
 *    https://publications.opec.org/
 *    - 2025年全球原油需求: 1.0515亿桶/日
 *    - 2025年OPEC原油出口: 1985万桶/日
 * 
 * 8. IEA Oil Market Report — 2025/2026
 *    https://www.iea.org/reports/oil-market-report
 *    - 2025年布伦特原油均价: ~$70/桶
 * 
 * 9. SteelRadar / 世界金属导报 — 2025年铁矿石贸易数据
 *    - 2025年全球铁矿石出口: 17.6亿吨
 *    - 澳大利亚出口: 9.24亿吨，巴西: 4.01亿吨
 * 
 * 10. 新浪财经 / 财新 — 2025年国债收益率数据
 *     - 美国10年期: ~4.35%，日本: ~1.58%，德国: ~2.69%
 * 
 * 数据说明：
 * - 以下数据为各来源的综合估算值，用于可视化展示
 * - 股票市场数据来自WFE及各交易所2025年末统计
 * - 债券市场数据来自各国央行及Bloomberg 2025年统计
 * - 大宗商品数据来自OPEC、IEA、SteelRadar等2025年报告
 * - 黄金市场数据来自World Gold Council 2025年报告
 */

const FUND_FLOW_DATA = {
  metadata: {
    title: "全球跨境资金流动与经济金融数据集",
    sources: [
      "IMF Coordinated Portfolio Investment Survey (CPIS) — June 2024",
      "IMF Coordinated Direct Investment Survey (CDIS) — December 2024",
      "BIS Locational Banking Statistics — December 2024",
      "World Bank World Development Indicators — 2024/2025",
      "World Federation of Exchanges (WFE) — 2025 Market Statistics",
      "World Gold Council — Gold Demand Trends Full Year 2025",
      "OPEC Annual Statistical Bulletin 2026",
      "IEA Oil Market Report — 2025/2026",
      "SteelRadar / World Metal Bulletin — 2025 Iron Ore Trade",
      "Bloomberg / Central Banks — 2025 Bond Yield Data"
    ],
    lastUpdated: "2025-07-10",
    
    // 全球资金流动总量
    totalGlobalPortfolioAssets: 71100,  // $71.1 trillion
    totalGlobalEquityAssets: 40200,    // $40.2 trillion
    totalCrossBorderBankCredit: 32600, // $32.6 trillion
    totalGlobalFDIInward: 45000,       // ~$45 trillion (estimated)
    
    // 全球股票市场总量 (WFE 2025)
    totalGlobalStockMarketCap: 141000,  // $141 trillion (2025)
    
    // 全球黄金市场 (World Gold Council 2025)
    globalGoldDemand2025: 5002,        // 吨
    globalGoldDemandValue: 5550,       // $555 billion
    goldPriceAvg2025: 3431,            // $/盎司
    goldPriceYoYChange: 44,            // % increase
    globalGoldETFInflow: 801,          // 吨
    globalCentralBankGoldPurchase: 863, // 吨
    globalGoldMineProduction: 3672,    // 吨
    globalGoldRecycling: 1404,         // 吨
    
    // 全球原油市场 (OPEC/IEA 2025)
    globalOilDemand2025: 105.15,       // 百万桶/日
    globalOilProduction2025: 74.85,    // 百万桶/日 (crude only)
    opecOilExports2025: 19.85,         // 百万桶/日
    brentOilPriceAvg2025: 70,          // $/桶 (approximate)
    
    // 全球铁矿石贸易 (SteelRadar 2025)
    globalIronOreExports2025: 17.6,    // 亿吨
    australiaIronOreExports: 9.24,     // 亿吨
    brazilIronOreExports: 4.01,        // 亿吨
    
    // 全球铜市场 (2025)
    globalCopperMineProduction2025: 22.8, // 百万吨 (estimated)
    lmeCopperPriceAvg2025: 9704,       // $/吨
  },

  countries: {
    "United States": {
      name: "美国", code: "USA", lat: 39.8, lng: -98.5,
      // 跨境资金流动 (十亿美元)
      fdiInward: 12800, fdiOutward: 9800,
      portfolioInward: 18500, portfolioOutward: 12400,
      bankClaims: 5200, bankLiabilities: 4800,
      color: "#f59e0b",
      
      // 股票市场 (WFE 2025)
      stockMarket: {
        totalMarketCap: 68938,  // $68.9 trillion (NYSE + Nasdaq)
        nyseMarketCap: 30921,   // $30.9 trillion
        nasdaqMarketCap: 30369, // $30.4 trillion
        listedCompanies: 4200,
        annualTurnover: 48000,  // $48 trillion
        mainIndices: {
          "S&P 500": { value: 6150, ytdChange: 24.5 },
          "Dow Jones": { value: 44500, ytdChange: 18.2 },
          "Nasdaq Composite": { value: 21500, ytdChange: 31.2 }
        }
      },
      
      // 债券市场 (2025)
      bondMarket: {
        governmentBondYield10Y: 4.35,  // %
        governmentBondYield30Y: 4.95,  // %
        totalBondOutstanding: 55000,   // $55 trillion (including Treasury, MBS, corporate)
        treasuryOutstanding: 37000,    // $37 trillion federal debt
        creditRating: { moody: "Aa1", sp: "AA+", fitch: "AA+" },
        bondIssuanceH1_2025: 1200,     // $1.2 trillion (H1 2025)
        debtToGDP: 125                 // %
      },
      
      // 大宗商品
      commodities: {
        oilProduction: 13.6,      // 百万桶/日
        oilExports: 4.2,          // 百万桶/日
        strategicPetroleumReserve: 350, // 百万桶
        ironOreExports: 0.052,    // 亿吨
        naturalGasProduction: 1050 // 十亿立方米
      },
      
      // 黄金
      gold: {
        officialReserves: 8133,   // 吨 (全球第一)
        goldReserveValue: 485,    // $485 billion (at $3,431/oz)
        goldShareOfReserves: 74.2 // %
      }
    },
    
    "China": {
      name: "中国", code: "CHN", lat: 35.9, lng: 104.2,
      fdiInward: 3200, fdiOutward: 2800,
      portfolioInward: 1800, portfolioOutward: 1200,
      bankClaims: 1400, bankLiabilities: 1100,
      color: "#ef4444",
      
      stockMarket: {
        totalMarketCap: 15509,  // $15.5 trillion (A股 + 港股)
        shanghaiMarketCap: 7800, // $7.8 trillion (A股)
        shenzhenMarketCap: 5200, // $5.2 trillion (A股)
        hongKongMarketCap: 6089, // $6.1 trillion (港股，单独统计)
        listedCompanies: 5200,
        annualTurnover: 28000,  // $28 trillion
        mainIndices: {
          "上证综指": { value: 3450, ytdChange: 15.8 },
          "深证成指": { value: 11200, ytdChange: 22.3 },
          "恒生指数": { value: 26500, ytdChange: 33.9 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 1.75,  // %
        governmentBondYield30Y: 2.10,  // %
        totalBondOutstanding: 18000,   // $18 trillion
        treasuryOutstanding: 12000,    // $12 trillion (government bonds)
        creditRating: { moody: "A1", sp: "A+", fitch: "A+" },
        bondIssuance2025: 700,         // $700 billion (stimulus)
        debtToGDP: 78                  // %
      },
      
      commodities: {
        oilImports: 11.5,         // 百万桶/日 (全球最大进口国)
        oilProduction: 4.2,       // 百万桶/日
        ironOreImports: 12.3,     // 亿吨 (全球最大进口国)
        copperImports: 2.8,       // 百万吨 (精炼铜)
        coalProduction: 4500,     // 百万吨
        rareEarthProduction: 240000 // 吨 (占全球70%)
      },
      
      gold: {
        officialReserves: 2299,   // 吨 (2025年6月)
        goldReserveValue: 138,    // $138 billion
        goldShareOfReserves: 4.2, // %
        goldProduction: 372,      // 吨 (全球最大产金国)
        goldConsumption: 1003     // 吨 (2025年)
      }
    },
    
    "United Kingdom": {
      name: "英国", code: "GBR", lat: 55.4, lng: -3.4,
      fdiInward: 2800, fdiOutward: 2400,
      portfolioInward: 4200, portfolioOutward: 3800,
      bankClaims: 3800, bankLiabilities: 3500,
      color: "#3b82f6",
      
      stockMarket: {
        totalMarketCap: 4070,  // $4.1 trillion (LSE)
        listedCompanies: 1800,
        annualTurnover: 3200,  // $3.2 trillion
        mainIndices: {
          "FTSE 100": { value: 8250, ytdChange: 12.5 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 4.63,  // %
        governmentBondYield30Y: 5.69,  // % (27年新高)
        totalBondOutstanding: 4500,    // $4.5 trillion
        creditRating: { moody: "Aa3", sp: "AA", fitch: "AA-" },
        debtToGDP: 103                 // %
      },
      
      commodities: {
        oilProduction: 0.8,       // 百万桶/日 (North Sea)
        oilExports: 0.5,
        naturalGasProduction: 350  // 十亿立方米
      },
      
      gold: {
        officialReserves: 807,    // 吨
        goldReserveValue: 48,     // $48 billion
        goldShareOfReserves: 11.5 // %
      }
    },
    
    "Japan": {
      name: "日本", code: "JPN", lat: 36.2, lng: 138.3,
      fdiInward: 680, fdiOutward: 2100,
      portfolioInward: 3200, portfolioOutward: 4100,
      bankClaims: 2800, bankLiabilities: 1800,
      color: "#d946ef",
      
      stockMarket: {
        totalMarketCap: 7611,  // $7.6 trillion (TSE)
        listedCompanies: 3900,
        annualTurnover: 6800,  // $6.8 trillion
        mainIndices: {
          "日经225": { value: 44500, ytdChange: 20.6 },
          "TOPIX": { value: 2950, ytdChange: 18.2 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 1.58,  // % (BoJ YCC退出后)
        governmentBondYield30Y: 3.45,  // % (历史新高)
        totalBondOutstanding: 12000,   // $12 trillion
        jgbOutstanding: 9000,          // $9 trillion (日本国债)
        creditRating: { moody: "A1", sp: "A+", fitch: "A" },
        debtToGDP: 235                 // % (主要经济体最高)
      },
      
      commodities: {
        oilImports: 3.0,          // 百万桶/日
        ironOreImports: 1.1,      // 亿吨
        copperImports: 1.2,       // 百万吨
        lngImports: 90            // 百万吨 (全球最大)
      },
      
      gold: {
        officialReserves: 846,    // 吨
        goldReserveValue: 51,     // $51 billion
        goldShareOfReserves: 5.2  // %
      }
    },
    
    "Germany": {
      name: "德国", code: "DEU", lat: 51.2, lng: 10.4,
      fdiInward: 1400, fdiOutward: 1800,
      portfolioInward: 2800, portfolioOutward: 3200,
      bankClaims: 2200, bankLiabilities: 2400,
      color: "#f97316",
      
      stockMarket: {
        totalMarketCap: 2899,  // $2.9 trillion (Deutsche Börse)
        listedCompanies: 1200,
        annualTurnover: 2100,  // $2.1 trillion
        mainIndices: {
          "DAX": { value: 19500, ytdChange: 18.5 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 2.69,  // %
        governmentBondYield30Y: 3.54,  // % (14年新高)
        totalBondOutstanding: 3500,    // $3.5 trillion
        bundOutstanding: 2200,         // $2.2 trillion
        creditRating: { moody: "Aaa", sp: "AAA", fitch: "AAA" },
        bondIssuance2025: 95,          // €95 billion (H1 2025)
        debtToGDP: 64                 // %
      },
      
      commodities: {
        oilImports: 1.8,          // 百万桶/日
        naturalGasImports: 120,   // 十亿立方米 (依赖俄罗斯管道气)
        coalImports: 45           // 百万吨
      },
      
      gold: {
        officialReserves: 3352,   // 吨 (全球第二)
        goldReserveValue: 201,    // $201 billion
        goldShareOfReserves: 72.8 // %
      }
    },
    
    "France": {
      name: "法国", code: "FRA", lat: 46.6, lng: 2.2,
      fdiInward: 1200, fdiOutward: 1500,
      portfolioInward: 2400, portfolioOutward: 2100,
      bankClaims: 2100, bankLiabilities: 2200,
      color: "#06b6d4",
      
      stockMarket: {
        totalMarketCap: 3390,  // $3.4 trillion (Euronext Paris)
        listedCompanies: 950,
        annualTurnover: 2800,  // $2.8 trillion
        mainIndices: {
          "CAC 40": { value: 7850, ytdChange: 10.2 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 3.50,  // %
        governmentBondYield30Y: 4.53,  // % (16年新高)
        totalBondOutstanding: 4200,    // $4.2 trillion
        oatOutstanding: 2800,          // €2.8 trillion
        creditRating: { moody: "Aa2", sp: "AA", fitch: "A+" }, // 惠誉2025年下调至A+
        debtToGDP: 116                // %
      },
      
      commodities: {
        oilImports: 1.2,          // 百万桶/日
        nuclearPowerShare: 70     // % (电力结构)
      },
      
      gold: {
        officialReserves: 2437,   // 吨
        goldReserveValue: 146,    // $146 billion
        goldShareOfReserves: 68.5 // %
      }
    },
    
    "Canada": {
      name: "加拿大", code: "CAN", lat: 56.1, lng: -106.3,
      fdiInward: 1100, fdiOutward: 1400,
      portfolioInward: 1800, portfolioOutward: 2200,
      bankClaims: 900, bankLiabilities: 1100,
      color: "#6366f1",
      
      stockMarket: {
        totalMarketCap: 4621,  // $4.6 trillion (TSX)
        listedCompanies: 3500,
        annualTurnover: 2800,  // $2.8 trillion
        mainIndices: {
          "S&P/TSX Composite": { value: 26500, ytdChange: 21.3 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 3.45,  // %
        totalBondOutstanding: 2800,    // $2.8 trillion
        creditRating: { moody: "Aaa", sp: "AAA", fitch: "AA+" },
        debtToGDP: 107                // %
      },
      
      commodities: {
        oilProduction: 4.6,       // 百万桶/日 (油砂)
        oilExports: 3.8,          // 百万桶/日 (主要出口美国)
        ironOreExports: 0.062,    // 亿吨
        uraniumProduction: 7200   // 吨 (全球第二)
      },
      
      gold: {
        officialReserves: 2,      // 吨 (几乎为零)
        goldReserveValue: 0.12,   // $0.12 billion
        goldShareOfReserves: 0.1  // %
      }
    },
    
    "Australia": {
      name: "澳大利亚", code: "AUS", lat: -25.3, lng: 133.8,
      fdiInward: 800, fdiOutward: 600,
      portfolioInward: 1200, portfolioOutward: 900,
      bankClaims: 500, bankLiabilities: 700,
      color: "#ec4899",
      
      stockMarket: {
        totalMarketCap: 2048,  // $2.0 trillion (ASX)
        listedCompanies: 2200,
        annualTurnover: 1500,  // $1.5 trillion
        mainIndices: {
          "S&P/ASX 200": { value: 8150, ytdChange: 12.8 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 4.25,  // %
        totalBondOutstanding: 1200,    // $1.2 trillion
        creditRating: { moody: "Aaa", sp: "AAA", fitch: "AAA" },
        debtToGDP: 42                 // %
      },
      
      commodities: {
        ironOreExports: 9.24,     // 亿吨 (全球最大)
        coalExports: 380,         // 百万吨 (动力煤)
        lngExports: 85,           // 百万吨 (全球最大)
        goldProduction: 310,      // 吨 (全球第二)
        lithiumProduction: 88000  // 吨 (全球最大)
      },
      
      gold: {
        officialReserves: 79,     // 吨
        goldReserveValue: 4.7,    // $4.7 billion
        goldShareOfReserves: 6.2  // %
      }
    },
    
    "India": {
      name: "印度", code: "IND", lat: 20.6, lng: 79.0,
      fdiInward: 620, fdiOutward: 180,
      portfolioInward: 450, portfolioOutward: 120,
      bankClaims: 280, bankLiabilities: 380,
      color: "#84cc16",
      
      stockMarket: {
        totalMarketCap: 10560,  // $10.6 trillion (NSE + BSE, 2025年超日本)
        nseMarketCap: 5365,    // $5.4 trillion
        bseMarketCap: 5389,    // $5.4 trillion
        listedCompanies: 5800,
        annualTurnover: 8500,   // $8.5 trillion
        mainIndices: {
          "Nifty 50": { value: 25300, ytdChange: 15.2 },
          "Sensex": { value: 82950, ytdChange: 14.8 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 7.05,  // %
        totalBondOutstanding: 2800,    // $2.8 trillion
        creditRating: { moody: "Baa3", sp: "BBB-", fitch: "BBB-" },
        debtToGDP: 82                 // %
      },
      
      commodities: {
        oilImports: 5.0,          // 百万桶/日 (全球第三)
        coalImports: 250,         // 百万吨
        goldConsumption: 750,     // 吨 (全球第二)
        ironOreExports: 0.029     // 亿吨
      },
      
      gold: {
        officialReserves: 879,    // 吨
        goldReserveValue: 53,     // $53 billion
        goldShareOfReserves: 10.8,// %
        goldConsumption: 750      // 吨 (2025年)
      }
    },
    
    "Brazil": {
      name: "巴西", code: "BRA", lat: -14.2, lng: -51.9,
      fdiInward: 680, fdiOutward: 280,
      portfolioInward: 380, portfolioOutward: 150,
      bankClaims: 180, bankLiabilities: 320,
      color: "#10b981",
      
      stockMarket: {
        totalMarketCap: 871,   // $0.87 trillion (B3)
        listedCompanies: 450,
        annualTurnover: 680,   // $0.68 trillion
        mainIndices: {
          "Bovespa": { value: 135000, ytdChange: 18.5 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 14.50, // % (新兴市场最高之一)
        totalBondOutstanding: 1200,    // $1.2 trillion
        creditRating: { moody: "Ba1", sp: "BB-", fitch: "BB-" },
        debtToGDP: 75                 // %
      },
      
      commodities: {
        ironOreExports: 4.01,     // 亿吨 (全球第二)
        oilExports: 1.8,          // 百万桶/日
        soybeansExports: 95,      // 百万吨 (全球最大)
        coffeeExports: 220        // 万袋 (60kg, 全球最大)
      },
      
      gold: {
        officialReserves: 129,    // 吨
        goldReserveValue: 7.7,    // $7.7 billion
        goldShareOfReserves: 1.8  // %
      }
    },
    
    "Netherlands": {
      name: "荷兰", code: "NLD", lat: 52.3, lng: 5.5,
      fdiInward: 3200, fdiOutward: 3800,
      portfolioInward: 2800, portfolioOutward: 3200,
      bankClaims: 1800, bankLiabilities: 1600,
      color: "#14b8a6",
      
      stockMarket: {
        totalMarketCap: 2100,  // $2.1 trillion (Euronext Amsterdam)
        listedCompanies: 450,
        mainIndices: {
          "AEX": { value: 850, ytdChange: 15.2 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 2.85,  // %
        totalBondOutstanding: 800,     // $0.8 trillion
        creditRating: { moody: "Aaa", sp: "AAA", fitch: "AAA" },
        debtToGDP: 48                 // %
      },
      
      gold: {
        officialReserves: 612,    // 吨
        goldReserveValue: 37,     // $37 billion
        goldShareOfReserves: 62.8 // %
      }
    },
    
    "Switzerland": {
      name: "瑞士", code: "CHE", lat: 46.8, lng: 8.2,
      fdiInward: 1400, fdiOutward: 1800,
      portfolioInward: 2200, portfolioOutward: 2800,
      bankClaims: 1600, bankLiabilities: 1400,
      color: "#f43f5e",
      
      stockMarket: {
        totalMarketCap: 2514,  // $2.5 trillion (SIX)
        listedCompanies: 280,
        annualTurnover: 1800,  // $1.8 trillion
        mainIndices: {
          "SMI": { value: 12500, ytdChange: 8.5 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 0.45,  // %
        totalBondOutstanding: 600,     // $0.6 trillion
        creditRating: { moody: "Aaa", sp: "AAA", fitch: "AAA" },
        debtToGDP: 38                 // %
      },
      
      gold: {
        officialReserves: 1040,   // 吨
        goldReserveValue: 62,     // $62 billion
        goldShareOfReserves: 9.5  // %
      }
    },
    
    "Hong Kong SAR": {
      name: "中国香港", code: "HKG", lat: 22.3, lng: 114.2,
      fdiInward: 1800, fdiOutward: 2100,
      portfolioInward: 1600, portfolioOutward: 1400,
      bankClaims: 1200, bankLiabilities: 1100,
      color: "#0ea5e9",
      
      stockMarket: {
        totalMarketCap: 6089,  // $6.1 trillion (HKEX)
        listedCompanies: 2600,
        annualTurnover: 4500,  // $4.5 trillion
        mainIndices: {
          "恒生指数": { value: 26500, ytdChange: 33.9 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 3.85,  // %
        totalBondOutstanding: 350,     // $0.35 trillion
        creditRating: { moody: "Aa3", sp: "AA+", fitch: "AA-" },
        debtToGDP: 8                  // %
      },
      
      gold: {
        officialReserves: 2.2,    // 吨
        goldReserveValue: 0.13,   // $0.13 billion
        goldShareOfReserves: 0.02 // %
      }
    },
    
    "Singapore": {
      name: "新加坡", code: "SGP", lat: 1.4, lng: 103.8,
      fdiInward: 1200, fdiOutward: 900,
      portfolioInward: 900, portfolioOutward: 700,
      bankClaims: 800, bankLiabilities: 600,
      color: "#8b5cf6",
      
      stockMarket: {
        totalMarketCap: 824,   // $0.82 trillion (SGX)
        listedCompanies: 650,
        annualTurnover: 450,   // $0.45 trillion
        mainIndices: {
          "Straits Times": { value: 4150, ytdChange: 12.5 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 2.95,  // %
        totalBondOutstanding: 400,     // $0.4 trillion
        creditRating: { moody: "Aaa", sp: "AAA", fitch: "AAA" },
        debtToGDP: 170                // % (高但主要为内部持有)
      },
      
      gold: {
        officialReserves: 215,    // 吨
        goldReserveValue: 13,     // $13 billion
        goldShareOfReserves: 5.8  // %
      }
    },
    
    "South Korea": {
      name: "韩国", code: "KOR", lat: 35.9, lng: 127.8,
      fdiInward: 280, fdiOutward: 380,
      portfolioInward: 420, portfolioOutward: 320,
      bankClaims: 280, bankLiabilities: 220,
      color: "#22c55e",
      
      stockMarket: {
        totalMarketCap: 2757,  // $2.8 trillion (KRX)
        listedCompanies: 2400,
        annualTurnover: 3200,  // $3.2 trillion
        mainIndices: {
          "KOSPI": { value: 3250, ytdChange: 77.0 },
          "KOSDAQ": { value: 1050, ytdChange: 65.2 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 3.25,  // %
        totalBondOutstanding: 1200,    // $1.2 trillion
        creditRating: { moody: "Aa2", sp: "AA", fitch: "AA-" },
        debtToGDP: 54                 // %
      },
      
      commodities: {
        oilImports: 2.8,          // 百万桶/日
        lngImports: 50,           // 百万吨
        semiconductorExports: 1200 // $1200 billion (芯片出口)
      },
      
      gold: {
        officialReserves: 104,    // 吨
        goldReserveValue: 6.2,    // $6.2 billion
        goldShareOfReserves: 2.2  // %
      }
    },
    
    "Luxembourg": {
      name: "卢森堡", code: "LUX", lat: 49.8, lng: 6.1,
      fdiInward: 2800, fdiOutward: 3200,
      portfolioInward: 4500, portfolioOutward: 4200,
      bankClaims: 800, bankLiabilities: 900,
      color: "#f59e0b",
      
      stockMarket: {
        totalMarketCap: 65,    // $65 billion
        listedCompanies: 120,
        mainIndices: {
          "LuxX": { value: 1450, ytdChange: 10.5 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 2.75,  // %
        totalBondOutstanding: 50,      // $0.05 trillion
        creditRating: { moody: "Aaa", sp: "AAA", fitch: "AAA" },
        debtToGDP: 25                 // %
      },
      
      gold: {
        officialReserves: 2.2,    // 吨
        goldReserveValue: 0.13,   // $0.13 billion
        goldShareOfReserves: 3.5  // %
      }
    },
    
    "Ireland": {
      name: "爱尔兰", code: "IRL", lat: 53.2, lng: -8.0,
      fdiInward: 2400, fdiOutward: 2100,
      portfolioInward: 3200, portfolioOutward: 2800,
      bankClaims: 600, bankLiabilities: 700,
      color: "#a855f7",
      
      stockMarket: {
        totalMarketCap: 120,   // $120 billion
        listedCompanies: 80,
        mainIndices: {
          "ISEQ": { value: 9800, ytdChange: 8.5 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 2.95,  // %
        totalBondOutstanding: 200,     // $0.2 trillion
        creditRating: { moody: "Aa1", sp: "AA+", fitch: "AA+" },
        debtToGDP: 43                 // %
      },
      
      gold: {
        officialReserves: 6,      // 吨
        goldReserveValue: 0.36,   // $0.36 billion
        goldShareOfReserves: 0.8  // %
      }
    },
    
    "Russia": {
      name: "俄罗斯", code: "RUS", lat: 61.5, lng: 105.3,
      fdiInward: 380, fdiOutward: 520,
      portfolioInward: 120, portfolioOutward: 180,
      bankClaims: 280, bankLiabilities: 350,
      color: "#dc2626",
      
      stockMarket: {
        totalMarketCap: 684,   // $0.68 trillion (MOEX, 2025年末)
        listedCompanies: 260,
        annualTurnover: 85,    // $85 billion
        mainIndices: {
          "MOEX Russia": { value: 2850, ytdChange: 24.7 },
          "RTS Index": { value: 1050, ytdChange: 24.7 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 16.50, // % (受制裁影响高企)
        totalBondOutstanding: 250,     // $0.25 trillion
        creditRating: { moody: "Ca", sp: "NR", fitch: "NR" }, // 被降级/撤销
        debtToGDP: 15                 // % (低但融资困难)
      },
      
      commodities: {
        oilProduction: 9.5,       // 百万桶/日 (OPEC+)
        oilExports: 4.8,          // 百万桶/日
        naturalGasProduction: 650, // 十亿立方米
        ironOreExports: 0.014,    // 亿吨
        goldProduction: 330,      // 吨 (全球第二)
        wheatExports: 45           // 百万吨 (全球最大)
      },
      
      gold: {
        officialReserves: 2336,   // 吨
        goldReserveValue: 140,    // $140 billion
        goldShareOfReserves: 32.5,// %
        goldProduction: 330       // 吨
      }
    },
    
    "Iran": {
      name: "伊朗", code: "IRN", lat: 32.4, lng: 53.7,
      fdiInward: 45, fdiOutward: 12,
      portfolioInward: 8, portfolioOutward: 5,
      bankClaims: 15, bankLiabilities: 25,
      color: "#059669",
      
      stockMarket: {
        totalMarketCap: 186,   // $0.19 trillion (TSE, 2025)
        listedCompanies: 594,
        annualTurnover: 45,    // $45 billion
        mainIndices: {
          "TEDPIX": { value: 2850000, ytdChange: 35.2 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 22.00, // % (受制裁影响)
        totalBondOutstanding: 80,      // $0.08 trillion
        creditRating: { moody: "NR", sp: "NR", fitch: "NR" },
        debtToGDP: 38                 // %
      },
      
      commodities: {
        oilProduction: 3.5,       // 百万桶/日 (受制裁)
        oilExports: 1.5,          // 百万桶/日 (主要出口中国)
        naturalGasProduction: 260, // 十亿立方米 (全球第二)
        petrochemicalExports: 25,  // 百万吨
        ironOreExports: 0.012     // 亿吨
      },
      
      gold: {
        officialReserves: 90,     // 吨 (估计)
        goldReserveValue: 5.4,    // $5.4 billion
        goldShareOfReserves: 15.0,// %
        goldProduction: 12        // 吨
      }
    },
    
    "Saudi Arabia": {
      name: "沙特阿拉伯", code: "SAU", lat: 23.9, lng: 45.1,
      fdiInward: 280, fdiOutward: 350,
      portfolioInward: 180, portfolioOutward: 220,
      bankClaims: 150, bankLiabilities: 180,
      color: "#0d9488",
      
      stockMarket: {
        totalMarketCap: 2359,  // $2.4 trillion (Tadawul)
        listedCompanies: 230,
        annualTurnover: 1200,  // $1.2 trillion
        mainIndices: {
          "TASI": { value: 12500, ytdChange: 8.5 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 4.85,  // %
        totalBondOutstanding: 350,     // $0.35 trillion
        creditRating: { moody: "A1", sp: "A-", fitch: "A+" },
        debtToGDP: 30                 // %
      },
      
      commodities: {
        oilProduction: 9.0,       // 百万桶/日 (OPEC领袖)
        oilExports: 6.8,          // 百万桶/日
        oilReserves: 2670,        // 桶 (十亿桶, 全球第二)
        naturalGasProduction: 115  // 十亿立方米
      },
      
      gold: {
        officialReserves: 323,    // 吨
        goldReserveValue: 19,     // $19 billion
        goldShareOfReserves: 4.5  // %
      }
    },
    
    "Taiwan": {
      name: "中国台湾", code: "TWN", lat: 23.7, lng: 121.0,
      fdiInward: 120, fdiOutward: 180,
      portfolioInward: 280, portfolioOutward: 320,
      bankClaims: 150, bankLiabilities: 120,
      color: "#7c3aed",
      
      stockMarket: {
        totalMarketCap: 3030,  // $3.0 trillion (TWSE)
        listedCompanies: 1020,
        annualTurnover: 4500,  // $4.5 trillion
        mainIndices: {
          "TAIEX": { value: 24500, ytdChange: 32.5 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 1.45,  // %
        totalBondOutstanding: 200,     // $0.2 trillion
        creditRating: { moody: "Aa3", sp: "AA+", fitch: "AA" },
        debtToGDP: 33                 // %
      },
      
      commodities: {
        semiconductorExports: 1600, // $1600 billion (芯片代工全球第一)
        oilImports: 0.8,            // 百万桶/日
        ironOreImports: 0.2         // 亿吨
      },
      
      gold: {
        officialReserves: 423,    // 吨
        goldReserveValue: 25,     // $25 billion
        goldShareOfReserves: 5.8  // %
      }
    },
    
    "United Arab Emirates": {
      name: "阿联酋", code: "ARE", lat: 24.5, lng: 54.4,
      fdiInward: 280, fdiOutward: 320,
      portfolioInward: 150, portfolioOutward: 180,
      bankClaims: 120, bankLiabilities: 150,
      color: "#ea580c",
      
      stockMarket: {
        totalMarketCap: 1111,  // $1.1 trillion (ADX + DFM)
        listedCompanies: 180,
        annualTurnover: 650,   // $0.65 trillion
        mainIndices: {
          "ADX General": { value: 9850, ytdChange: 12.5 },
          "DFM": { value: 4500, ytdChange: 15.2 }
        }
      },
      
      bondMarket: {
        governmentBondYield10Y: 4.65,  // %
        totalBondOutstanding: 180,     // $0.18 trillion
        creditRating: { moody: "Aa2", sp: "AA", fitch: "AA" },
        debtToGDP: 32                 // %
      },
      
      commodities: {
        oilProduction: 3.5,       // 百万桶/日
        oilExports: 2.8,          // 百万桶/日
        naturalGasProduction: 65,  // 十亿立方米
        aluminumExports: 280      // 万吨 (全球主要出口国)
      },
      
      gold: {
        officialReserves: 75,     // 吨
        goldReserveValue: 4.5,    // $4.5 billion
        goldShareOfReserves: 3.2  // %
      }
    }
  }
};

// Calculate derived totals for each country
Object.values(FUND_FLOW_DATA.countries).forEach(c => {
  c.totalInward = c.fdiInward + c.portfolioInward + c.bankLiabilities;
  c.totalOutward = c.fdiOutward + c.portfolioOutward + c.bankClaims;
  c.totalFlow = c.totalInward + c.totalOutward;
  c.netFlow = c.totalInward - c.totalOutward;
});

// Generate bilateral flow matrix for visualization
function generateBilateralFlows() {
  const countries = Object.keys(FUND_FLOW_DATA.countries);
  const flows = [];
  
  countries.forEach(from => {
    countries.forEach(to => {
      if (from === to) return;
      const f = FUND_FLOW_DATA.countries[from];
      const t = FUND_FLOW_DATA.countries[to];
      
      // Distance-based decay
      const dist = Math.sqrt(Math.pow(f.lat - t.lat, 2) + Math.pow(f.lng - t.lng, 2));
      const distFactor = Math.max(0.02, Math.min(1, 25 / dist));
      
      // Economic mass
      const massFactor = (f.totalOutward * t.totalInward) / 1e8;
      
      // Generate flows by type
      const fdiFlow = Math.round(massFactor * distFactor * 0.4 * (0.6 + Math.random() * 0.8));
      const portfolioFlow = Math.round(massFactor * distFactor * 0.35 * (0.6 + Math.random() * 0.8));
      const bankFlow = Math.round(massFactor * distFactor * 0.25 * (0.6 + Math.random() * 0.8));
      
      if (fdiFlow > 5) flows.push({ from, to, type: "fdi", amount: fdiFlow });
      if (portfolioFlow > 5) flows.push({ from, to, type: "portfolio", amount: portfolioFlow });
      if (bankFlow > 5) flows.push({ from, to, type: "lending", amount: bankFlow });
    });
  });
  
  return flows;
}

FUND_FLOW_DATA.bilateralFlows = generateBilateralFlows();

// Global commodity trade summary
FUND_FLOW_DATA.commodities = {
  oil: {
    name: "原油",
    globalDemand: 105.15,           // 百万桶/日
    globalProduction: 74.85,       // 百万桶/日 (crude)
    brentPriceAvg2025: 70,         // $/桶
    majorExporters: ["Saudi Arabia", "Russia", "United States", "Iraq", "Canada"],
    majorImporters: ["China", "United States", "India", "Japan", "South Korea"],
    tradeValue: 1800               // $1.8 trillion (estimated annual)
  },
  ironOre: {
    name: "铁矿石",
    globalExports: 17.6,           // 亿吨
    priceAvg2025: 90,              // $/吨 (FOB Australia)
    majorExporters: ["Australia", "Brazil", "South Africa", "Canada", "India"],
    majorImporters: ["China", "Japan", "South Korea", "Germany", "Taiwan"],
    tradeValue: 1580               // $158 billion
  },
  copper: {
    name: "铜",
    globalMineProduction: 22.8,    // 百万吨
    lmePriceAvg2025: 9704,         // $/吨
    majorExporters: ["Chile", "Peru", "Australia", "Indonesia", "Canada"],
    majorImporters: ["China", "Germany", "Japan", "South Korea", "Taiwan"],
    tradeValue: 380                // $380 billion
  },
  gold: {
    name: "黄金",
    globalDemand: 5002,            // 吨
    globalDemandValue: 5550,       // $555 billion
    priceAvg2025: 3431,            // $/盎司
    priceHigh2026: 5278,           // $/盎司 (2026年1月峰值)
    majorProducers: ["China", "Australia", "Russia", "Canada", "United States"],
    majorConsumers: ["China", "India", "United States", "Germany", "Turkey"],
    centralBankPurchases: 863      // 吨
  },
  naturalGas: {
    name: "天然气",
    globalProduction: 4100,        // 十亿立方米
    lngTradeVolume: 550,           // 百万吨
    majorExporters: ["United States", "Russia", "Qatar", "Australia", "Norway"],
    majorImporters: ["Japan", "China", "South Korea", "Germany", "Italy"],
    tradeValue: 450                // $450 billion
  },
  coal: {
    name: "煤炭",
    globalProduction: 8500,        // 百万吨
    majorExporters: ["Indonesia", "Australia", "Russia", "South Africa", "Colombia"],
    majorImporters: ["China", "India", "Japan", "South Korea", "Taiwan"],
    tradeValue: 280                // $280 billion
  },
  wheat: {
    name: "小麦",
    globalProduction: 780,         // 百万吨
    majorExporters: ["Russia", "United States", "Canada", "Australia", "France"],
    majorImporters: ["Egypt", "Indonesia", "Turkey", "China", "Bangladesh"],
    tradeValue: 95                 // $95 billion
  },
  soybeans: {
    name: "大豆",
    globalProduction: 380,         // 百万吨
    majorExporters: ["Brazil", "United States", "Argentina", "Canada", "Paraguay"],
    majorImporters: ["China", "European Union", "Mexico", "Egypt", "Thailand"],
    tradeValue: 165                // $165 billion
  }
};

// Global bond market summary
FUND_FLOW_DATA.bondMarket = {
  globalTotalOutstanding: 140000,  // $140 trillion (all bonds)
  governmentBonds: 65000,          // $65 trillion
  corporateBonds: 45000,           // $45 trillion
  financialBonds: 30000,           // $30 trillion
  
  majorMarkets: {
    "United States": { outstanding: 55000, yield10Y: 4.35, share: 39.3 },
    "China": { outstanding: 18000, yield10Y: 1.75, share: 12.9 },
    "Japan": { outstanding: 12000, yield10Y: 1.58, share: 8.6 },
    "Germany": { outstanding: 3500, yield10Y: 2.69, share: 2.5 },
    "France": { outstanding: 4200, yield10Y: 3.50, share: 3.0 },
    "United Kingdom": { outstanding: 4500, yield10Y: 4.63, share: 3.2 },
    "Italy": { outstanding: 3800, yield10Y: 3.85, share: 2.7 }
  },
  
  creditRatings: {
    "AAA": ["United States", "Germany", "Netherlands", "Switzerland", "Australia", "Canada", "Singapore", "Luxembourg"],
    "AA": ["United Kingdom", "France", "South Korea", "Taiwan", "United Arab Emirates"],
    "A": ["Japan", "Saudi Arabia"],
    "BBB": ["India", "Brazil"],
    "Below BBB": ["Russia", "Iran"]
  }
};

// Global stock market summary
FUND_FLOW_DATA.stockMarket = {
  globalTotalCap: 141000,          // $141 trillion (2025)
  globalTurnover: 120000,          // $120 trillion (annual)
  
  topMarkets: [
    { name: "United States", cap: 68938, share: 48.9 },
    { name: "China", cap: 15509, share: 11.0 },
    { name: "India", cap: 10560, share: 7.5 },
    { name: "Japan", cap: 7611, share: 5.4 },
    { name: "Hong Kong SAR", cap: 6089, share: 4.3 },
    { name: "Canada", cap: 4621, share: 3.3 },
    { name: "United Kingdom", cap: 4070, share: 2.9 },
    { name: "France", cap: 3390, share: 2.4 },
    { name: "Taiwan", cap: 3030, share: 2.2 },
    { name: "South Korea", cap: 2757, share: 2.0 }
  ],
  
  sectorDistribution: {
    technology: 28.5,
    financials: 15.2,
    healthcare: 12.8,
    consumerDiscretionary: 11.5,
    industrials: 10.2,
    energy: 6.8,
    materials: 5.5,
    utilities: 4.2,
    realEstate: 3.5,
    communicationServices: 1.8
  }
};
