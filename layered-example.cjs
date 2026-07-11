/**
 * 信息分层采集 - 与量化交易Agent集成的使用示例
 * 
 * 演示如何将L0/L1/L2/L3分层框架应用于：
 * 1. 海关进出口数据分析（宏观数据）
 * 2. 产业政策公告解读（事件数据）
 * 3. 板块异动信息追踪（市场数据）
 */

const https = require('https');
const { LayeredCollector, executeLayeredCollection } = require('./layered-collector-skill.cjs');
const fs = require('fs');
const path = require('path');

// ====== 工具函数 ======

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        ...options.headers
      },
      timeout: options.timeout || 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
  });
}

function parseJSON(text) {
  try { return JSON.parse(text); } catch (e) { return null; }
}

// ====== 实际数据源连接器 ======

const DATA_SOURCES = {
  mysql: {
    // L0：原始数据源
    l0: [
      {
        name: '海关进出口月度数据（模拟）',
        url: 'https://api.exchangerate-api.com/v4/latest/USD', // 用汇率做示例
        type: 'macroeconomic',
        category: '贸易'
      },
      {
        name: '港口集装箱吞吐量（模拟）',
        url: 'api.customs.gov.cn',
        type: 'logistics',
        category: '航运'
      }
    ],
    // L1：专业分析来源
    l1: [
      { name: '券商宏观经济研报', url: 'research.eastmoney.com', type: 'research', category: '宏观' },
      { name: '行业协会分析报告', url: 'www.caam.org.cn', type: 'industry', category: '汽车' }
    ],
    // L2：传播渠道
    l2: [
      { name: '东方财富经济新闻', url: 'finance.eastmoney.com', type: 'news', category: '财经' },
      { name: '同花顺资讯', url: 'news.10jqka.com.cn', type: 'news', category: '股市' }
    ],
    // L3：反馈渠道
    l3: [
      { name: '股吧讨论', url: 'guba.eastmoney.com', type: 'forum', category: '散户' },
      { name: '雪球讨论', url: 'xueqiu.com', type: 'social', category: '投资者' }
    ]
  },
  policy: {
    l0: [
      { name: '国务院政策文件', url: 'www.gov.cn/zhengce', type: 'policy', category: '中央' },
      { name: '工信部公告', url: 'www.miit.gov.cn', type: 'policy', category: '产业' }
    ],
    l1: [
      { name: '政策解读（官媒）', url: 'www.chinanews.com.cn', type: 'analysis', category: '政策' },
      { name: '产业研究院分析', url: 'www.keejazg.com', type: 'research', category: '产业' }
    ],
    l2: [
      { name: '财经自媒体', url: 'mp.weixin.qq.com', type: 'social', category: '传播' },
      { name: '短视频解读', url: 'douyin.com', type: 'video', category: '传播' }
    ],
    l3: [
      { name: '微博讨论', url: 'weibo.com', type: 'social', category: '大众' },
      { name: '微信群讨论', url: 'wechat', type: 'private', category: '圈层' }
    ]
  }
};

// ====== 自定义数据获取器 ======

async function fetchMacroData(source) {
  try {
    const raw = await fetch(source.url);
    const data = parseJSON(raw);
    if (!data) throw new Error('JSON解析失败');
    
    return {
      content: data,
      coreFacts: [
        `汇率基准日: ${data.date}`,
        `EUR/USD: ${data.rates?.EUR}`,
        `USD/CNY: ${(1 / data.rates?.USD * data.rates?.CNY).toFixed(4)}`
      ],
      conditions: ['基于可逆报价', '不含银行点差'],
      uncertainties: ['数据仅作参考，不构成交易建议'],
      publishDate: data.date,
      publisher: 'ExchangeRate-API'
    };
  } catch (e) {
    throw new Error(`获取失败: ${e.message}`);
  }
}

async function fetchAnalyticsData(source) {
  // 模拟不同深度的分析内容
  const depth = source.depth || 'standard';
  const content = (source.content || '').trim();
  
  if (!content) {
    throw new Error('分析内容为空，请确保投喂完整的分析材料');
  }
  
  const factCount = source.factCount || null;
  const assumptionCount = source.assumptionCount || null;
  
  // 自动提取核心事实（基于句子长度和数字密度作为简单启发式）
  const sentences = content.split(/[。！？.!?]/).filter(s => s.trim().length > 5);
  const coreFacts = factCount ? sentences.slice(0, factCount) : sentences.slice(0, 3);
  
  // 自动识别假设（基于常见假设关键词）
  const assumptionKeywords = ['假设', '如果', '预计', '估计', 'should', 'if', 'expect', 'assume'];
  const assumptions = assumptionKeywords
    .map(kw => content.split(kw)[0]?.trim().slice(-50))
    .filter(Boolean)
    .slice(0, assumptionCount || 5);
  
  // 条件/范围识别
  const conditionKeywords = ['但', '但', '不过', 'however', 'although', '但'];
  const conditions = conditionKeywords
    .map(kw => content.split(kw)[1]?.trim().slice(0, 100))
    .filter(Boolean)
    .slice(0, 3);
  
  // 不确定性标记
  const uncertaintyKeywords = ['可能', '或许', '也许', 'may', 'might', 'could', '也许'];
  const uncertainties = uncertaintyKeywords
    .filter(kw => content.includes(kw))
    .slice(0, 3);
  
  return {
    content,
    coreFacts: coreFacts.map(f => f.trim().slice(0, 200)),
    frameworks: source.frameworks || ['宏观经济分析', '产业链传导'],
    assumptions,
    conditions,
    uncertainties
  };
}

async function fetchSocialData(source) {
  const content = (source.content || '').trim();
  const headline = source.headline || (content.slice(0, 50) + (content.length > 50 ? '...' : ''));
  
  // 自动识别条件丢失情况
  const conditionKeywords = ['但', '如果', '不过', '假设', '虽然'];
  const hasConditions = conditionKeywords.some(kw => content.includes(kw));
  const droppedConditions = [];
  if (!hasConditions) {
    droppedConditions.push('原文限定条件全部丢失');
  } else {
    conditionKeywords.forEach(kw => {
      if (content.includes(kw)) {
        droppedConditions.push(`条件词"${kw}"存在但可能被弱化`);
      }
    });
  }
  
  // 情绪词提取
  const positiveWords = ['暴涨', '利好', '突破', '重大利好', '惊喜', '突破', '暴涨'];
  const negativeWords = ['利空', '暴跌', '崩盘', '重大利空', '暴雷', '退市'];
  const foundEmotional = [
    ...positiveWords.filter(w => content.includes(w)),
    ...negativeWords.filter(w => content.includes(w))
  ];
  
  return {
    content,
    headline,
    droppedConditions: droppedConditions.slice(0, 3),
    emotionalWords: foundEmotional,
    addedNarrative: source.addedNarrative || [],
    anchors: source.anchors || []
  };
}

// ====== 示例执行：宏观经济事件分析 ======

async function demoMacroAnalysis() {
  console.log('══════════════════════════════════════════════');
  console.log('  示例: 海关进出口数据分析');
  console.log('══════════════════════════════════════════════');
  
  const collector = new LayeredCollector('2026年上半年进出口数据出炉: 新能源汽车出口同比增长超50%', {
    timeLimit: 10,
    l0MaxSources: 1,
    l1MaxSources: 2,
    l2SampleSize: 2
  });
  
  // L0: 获取真实汇率数据
  const l0sources = [
    {
      name: '汇率数据',
      url: 'https://api.exchangerate-api.com/v4/latest/USD',
      fetcher: fetchMacroData
    }
  ];
  
  await collector.collectL0(l0sources);
    
  // 如果L0失败，添加备用数据源
  if (!collector.qualityFlags.l0BaselineEstablished) {
    console.log('   → 尝试备用数据源...');
    await collector.collectL0([
      {
        name: '备用-L0模拟数据',
        url: 'backup://internal',
        fetcher: async () => ({
          content: { base: 'USD', date: '2026-07-10', simulated: true },
          coreFacts: ['USD/CNY=6.80', 'EUR/USD=1.14'],
          conditions: ['模拟数据，仅作流程演示'],
          uncertainties: ['实际数据需联网获取'],
          publishDate: new Date().toISOString(),
          publisher: 'BackupSource'
        })
      }
    ]);
  }
  
  // L1: 投喂券商研报（示例：模拟输入）
  await collector.collectL1([
    {
      name: '券商宏观研报 - 出口链分析',
      url: 'research.eastmoney.com',
      content: '2026年上半年，以新能源汽车、光伏、锂电池为代表的"新三样"出口延续高增态势。假设海外需求保持稳定，预计全年出口增速有望维持在15%以上。但需要关注贸易壁垒风险和汇率波动对盈利的潜在冲击。',
      depth: 'standard',
      factCount: 3,
      assumptionCount: 10,
      frameworks: ['出口产业链分析', '新三样概念']
    },
    {
      name: '行业协会报告 - 汽车工业协会',
      url: 'www.caam.org.cn',
      content: '据中汽协数据，2026年1-6月新能源汽车产销分别完成XXX万辆和XXX万辆，同比分别增长30%和32%。如果下半年政策延续，全年销量有望突破XXX万辆。但供应链安全和充电基础设施仍是制约因素。',
      depth: 'deep',
      factCount: 3,
      assumptionCount: 10,
      frameworks: ['产业周期分析', '政策驱动模型']
    }
  ]);
  
  // L2: 媒体传播层
  await collector.collectL2([
    {
      name: '东方财富新闻报道',
      url: 'finance.eastmoney.com',
      headline: '重磅！新能源汽车出口狂飙，产业链站上风口！',
      content: '新能源汽车出口再创新高！产业链全面爆发，龙头股集体异动。专家预计高景气度将延续。但也要警惕估值风险和海外政策不确定性。',
      droppedConditions: []
    },
    {
      name: '同花顺快讯',
      url: 'news.10jqka.com.cn',
      headline: '【利好】新能源车出口数据超预期！',
      content: '超预期！新能源汽车出口同比大增50%，产业链个股迎来重大利好。分析师普遍看好后市表现。但部分个股已处高位，追高需谨慎。',
      droppedConditions: []
    }
  ]);
  
  // L3: 投资者反馈
  await collector.collectL3([
    {
      community: '新能源车主',
      url: 'xueqiu.com',
      fetcher: async () => [
        { text: '终于等到新能源爆发的日子了！产业链相关基金准备加仓！', citations: 0 },
        { text: '出口高增长是确定的，但国内渗透率已经不低，要看海外市场能不能持续。', citations: 1 },
        { text: '利好尽出是利空，要不要先跑？', citations: 0 },
        { text: '长期看好，政策支持力度大，行业天花板还远未到。', citations: 0 },
        { text: '产业链上中游产能过剩，小心数据好看但利润被上游拿走。', citations: 1 }
      ]
    },
    {
      community: '传统汽车行业',
      url: 'guba.eastmoney.com',
      fetcher: async () => [
        { text: '燃油车还有未来吗？新能源这是要赶尽杀绝啊！', citations: 0 },
        { text: '数据看着好，但看看二手新能源的保值率，真实需求存疑。', citations: 0 },
        { text: '新能源龙头已经进入全球供应链，长期竞争力确定。', citations: 1 },
        { text: '涨太多，等回调再进。', citations: 0 },
        { text: '看研报说上游材料才是核心，下游整车厂利润薄。', citations: 1 }
      ]
    }
  ]);
  
  // 层间偏差分析
  collector.analyzeDeviations();
  
  // 生成报告
  const report = collector.generateReport();
  
  // 保存报告
  const reportPath = path.join(__dirname, 'data', 'layered_sample_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log('\n💾 报告已保存:', reportPath);
  
  return report;
}

// ====== 实际执行入口 ======

async function main() {
  console.log('数据分层采集 Skill 实操演示\n');
  
  try {
    const report = await demoMacroAnalysis();
    
    console.log('\n══════════════════════════════════════════════');
    console.log('  最终报告');
    console.log('══════════════════════════════════════════════');
    console.log('事件:', report.event);
    console.log('L0基线:', report.layers.l0.baselineEstablished ? '✅ 已建立' : '⚠️ 不完整');
    console.log('L1框架:', report.layers.l1.frameworks.join(' | '));
    console.log('L2头条:', report.layers.l2.topHeadlines[0] || '无');
    console.log('偏差数量:', report.deviations.total);
    console.log('偏差类型:', JSON.stringify(report.deviations.byType));
    console.log('覆盖级别:', report.coverageBoundary.level);
    console.log('总结:', report.summary);
    console.log('采集耗时:', report._meta.elapsedMinutes, '分钟');
    console.log('══════════════════════════════════════════════');
    
  } catch (e) {
    console.error('执行失败:', e.message);
  }
}

main();
