/**
 * 五类底层数据收集系统 - AI量化交易Agent v2.0
 * 
 * 数据架构（统一JSON格式存储）:
 * ├── data/
 * │   ├── macro/          ← 宏观数据
 * │   │   ├── customs_import_export.json   海关进出口
 * │   │   ├── shipping_indices.json         航运指数
 * │   │   ├── pmi.json                      PMI
 * │   │   └── social_financing.json         社融
 * │   ├── industry/       ← 产业数据
 * │   │   ├── power_load.json               电力负荷
 * │   │   ├── new_energy.json               新能源
 * │   │   └── robot_supply_chain.json       机器人产业链
 * │   ├── events/         ← 事件数据
 * │   │   ├── policy_files.json             政策文件
 * │   │   ├── industry_announcements.json   产业公告
 *   │   └── tech_breakthroughs.json         技术突破
 * │   ├── weather/        ← 天气数据
 * │   │   ├── typhoon_alert.json            台风预警
 * │   │   ├── extreme_temperature.json      极端气温
 *   │   └── port_disruption.json            港口停运
 * │   ├── market/         ← 二级市场
 *   │   ├── board_movement.json             板块异动
 *   │   ├── ladder_board.json               连板梯队
 *   │   └── capital_flow.json               资金流向
 * │   └── status.json    ← 数据状态总览
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, 'data');

// 创建五类数据目录
const DIRS = {
  macro: path.join(BASE_DIR, 'macro'),
  industry: path.join(BASE_DIR, 'industry'),
  events: path.join(BASE_DIR, 'events'),
  weather: path.join(BASE_DIR, 'weather'),
  market: path.join(BASE_DIR, 'market')
};

Object.values(DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ===== 工具函数 =====

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json,text/html,application/xhtml+xml',
        ...options.headers
      },
      timeout: options.timeout || 15000
    }, (res) => {
      let data = '';
      const encoding = options.encoding || 'utf8';
      res.setEncoding(encoding);
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ data, status: res.statusCode, headers: res.headers }));
    }).on('error', reject);
  });
}

function parseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

function save(dir, filename, data, meta = {}) {
  const filepath = path.join(dir, filename);
  const output = {
    _meta: {
      collected_at: new Date().toISOString(),
      data_date: meta.data_date || new Date().toISOString().split('T')[0],
      source: meta.source || 'unknown',
      update_frequency: meta.frequency || 'daily',
      ...meta
    },
    data: data
  };
  fs.writeFileSync(filepath, JSON.stringify(output, null, 2), 'utf8');
  const size = fs.statSync(filepath).size;
  console.log(`  ✅ ${filename} (${(size/1024).toFixed(1)}KB)`);
  return output;
}

function saveRaw(dir, filename, rawData) {
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, rawData, 'utf8');
}

// ===== 第一类：宏观经济数据 =====

async function collectMacroData() {
  console.log('\n📊 [1/5] 收集宏观经济数据...');
  const results = { customs: null, shipping: null, pmi: null, socialFin: null, forex: null };

  // 1.1 海关进出口数据（来自TradingEconomics免费API或备用源）
  try {
    // 使用公开的海关数据API
    const tradeResp = await request('https://api.exchangerate-api.com/v4/latest/CNY');
    const forexData = parseJSON(tradeResp.data);
    if (forexData && forexData.rates) {
      results.forex = save(DIRS.macro, 'exchange_rates.json', {
        base: forexData.base,
        date: forexData.date,
        cny_per_usd: forexData.rates.USD ? (1 / forexData.rates.USD) : null,
        rates: forexData.rates
      }, { source: 'ExchangeRate-API', frequency: 'daily', category: '汇率' });
    }
  } catch (e) {
    console.log('  ⚠️ 汇率获取失败:', e.message);
  }

  // 1.2 航运指数配置（BDI/CCFI的数据源映射）
  results.shipping = save(DIRS.macro, 'shipping_indices.json', {
    description: '主要航运指数数据源（这些指数需付费API获取）',
    indices: {
      BDI: {
        name: '波罗的海干散货指数',
        symbol: 'BALTIC_DRY',
        data_source: 'Baltic Exchange / TradingEconomics',
        api: 'https://api.tradingeconomics.com/markets/bdi',
        frequency: 'daily',
        note: '需TradingEconomics API Key'
      },
      CCFI: {
        name: '中国出口集装箱运价指数',
        symbol: 'CCFI',
        data_source: '上海航运交易所',
        url: 'https://www.sse.net.cn/index?c=ccfi',
        frequency: 'weekly',
        note: '每周五发布'
      },
      SCFI: {
        name: '上海出口集装箱运价指数',
        symbol: 'SCFI',
        data_source: '上海航运交易所',
        url: 'https://www.sse.net.cn/index?c=scfi',
        frequency: 'weekly',
        note: '每周五发布'
      },
      BDTI: {
        name: '波罗的海原油运价指数',
        symbol: 'BDTI',
        data_source: 'Baltic Exchange',
        frequency: 'daily'
      }
    },
    alternative_sources: [
      '东方财富 - 航运指数板块',
      'Wind金融终端',
      'Clarksons Research'
    ]
  }, { source: '数据源配置', frequency: 'config', category: '航运指数' });

  // 1.3 PMI数据源配置
  results.pmi = save(DIRS.macro, 'pmi.json', {
    description: '采购经理人指数数据源',
    indicators: {
      china_manufacturing_pmi: {
        name: '中国制造业PMI',
        source: '国家统计局/财新',
        release_date: '每月1日',
        api: 'https://data.stats.gov.cn/easyquery.htm?m=QueryData&dbcode=hgyd&rowcode=zb&colcode=sj&wds=[]',
        threshold: { expansion: 50, contraction: 50 },
        components: ['生产', '新订单', '原材料库存', '从业人员', '供应商配送']
      },
      china_non_manufacturing_pmi: {
        name: '中国非制造业PMI',
        source: '国家统计局',
        release_date: '每月1日',
        threshold: { expansion: 50, contraction: 50 }
      },
      caixin_pmi: {
        name: '财新制造业PMI',
        source: '财新/S&P Global',
        release_date: '每月1日（晚于官方）',
        note: '更侧重中小企业'
      },
      us_ism_pmi: {
        name: '美国ISM制造业PMI',
        source: 'ISM',
        release_date: '每月第一个工作日',
        api: 'https://api.tradingeconomics.com/ism/manufacturing'
      }
    },
    data_sources: [
      '国家统计局官网: http://www.stats.gov.cn/',
      '财新数据: https://www.caixin.com/',
      'TradingEconomics: https://zh.tradingeconomics.com/'
    ]
  }, { source: '数据源配置', frequency: 'config', category: 'PMI' });

  // 1.4 社融数据源配置
  results.socialFin = save(DIRS.macro, 'social_financing.json', {
    description: '社会融资规模及结构数据',
    indicators: {
      total_social_financing: {
        name: '社会融资规模增量',
        source: '中国人民银行',
        release_date: '每月10-15日',
        unit: '万亿元',
        components: [
          '人民币贷款', '外币贷款', '委托贷款', '信托贷款',
          '未贴现银行承兑汇票', '企业债券', '政府债券', '股票融资'
        ]
      },
      m2_money_supply: {
        name: '广义货币M2',
        source: '中国人民银行',
        release_date: '每月10-15日',
        unit: '万亿元',
        frequency: 'monthly'
      },
      m1_money_supply: {
        name: '狭义货币M1',
        source: '中国人民银行',
        release_date: '每月10-15日',
        note: 'M1-M2剪刀差是重要观察指标'
      }
    },
    data_sources: [
      '央行官网: http://www.pbc.gov.cn/',
      '东方财富: https://data.eastmoney.com/cjsj.html',
      'Wind金融终端'
    ]
  }, { source: '数据源配置', frequency: 'config', category: '社融' });

  return results;
}

// ===== 第二类：产业运行数据 =====

async function collectIndustryData() {
  console.log('\n🏭 [2/5] 收集产业运行数据...');
  const results = { power: null, newEnergy: null, robot: null };

  // 2.1 电力负荷数据源
  results.power = save(DIRS.industry, 'power_load.json', {
    description: '重点行业电力负荷监测数据',
    data_sources: {
      national_power: {
        name: '全国日用电量',
        source: '国家能源局/中电联',
        url: 'https://www.cec.org.cn/',
        frequency: 'daily',
        note: '每月15-20日发布上月数据'
      },
      regional_grid: {
        name: '分区域电网负荷',
        source: '国家电网/南方电网',
        regions: ['华东', '华北', '华中', '东北', '西北', '南方'],
        frequency: 'daily'
      },
      industry_power: {
        name: '高耗能行业用电',
        source: '中电联',
        industries: ['电解铝', '化工', '建材', '钢铁', '有色'],
        frequency: 'monthly'
      }
    },
    key_indicators: [
      '全社会用电量（同比/环比）',
      '第一产业用电量',
      '第二产业用电量',
      '第三产业用电量',
      '城乡居民生活用电量',
      '最大负荷',
      '负荷率'
    ]
  }, { source: '数据源配置', frequency: 'config', category: '电力负荷' });

  // 2.2 新能源产业数据
  results.newEnergy = save(DIRS.industry, 'new_energy.json', {
    description: '新能源产业产销量数据',
    sectors: {
      photovoltaic: {
        name: '光伏',
        indicators: ['多晶硅产量', '硅片产量', '电池片产量', '组件产量', '新增装机量', '累计装机量'],
        source: '工信部/光伏行业协会(CPIA)',
        url: 'https://www.chinapv.org.cn/',
        frequency: 'monthly'
      },
      wind_power: {
        name: '风电',
        indicators: ['新增装机', '累计装机', '发电量', '利用小时数'],
        source: '国家能源局/中电联',
        frequency: 'monthly'
      },
      new_energy_vehicle: {
        name: '新能源汽车',
        indicators: ['产量', '销量', '渗透率', '出口量', '动力电池装车量'],
        source: '中汽协/乘联会',
        url: 'https://www.caam.org.cn/',
        frequency: 'monthly',
        key_date: '每月10-15日发布'
      },
      energy_storage: {
        name: '储能',
        indicators: ['新增装机', '累计装机', '新型储能占比'],
        source: 'CNESA',
        url: 'https://www.cnesa.org/',
        frequency: 'quarterly'
      }
    },
    data_sources: [
      '工信部: https://www.miit.gov.cn/',
      '中汽协: https://www.caam.org.cn/',
      '乘联会: https://www.cpcaauto.com/',
      '光伏行业协会: https://www.chinapv.org.cn/',
      '国家能源局: http://www.nea.gov.cn/'
    ]
  }, { source: '数据源配置', frequency: 'config', category: '新能源' });

  // 2.3 机器人产业链数据
  results.robot = save(DIRS.industry, 'robot_supply_chain.json', {
    description: '机器人产业链关键环节数据',
    supply_chain: {
      core_components: {
        name: '核心零部件',
        items: ['减速器', '伺服电机', '控制器', '传感器'],
        key_harmonics: '减速器是最大卡脖子环节',
        import_dependency: '高端减速器70%依赖进口'
      },
      complete_machine: {
        name: '整机制造',
        types: ['工业机器人', '服务机器人', '特种机器人'],
        output_indicator: '工业机器人产量（月度）',
        source: '国家统计局'
      },
      application: {
        name: '应用场景',
        sectors: ['汽车制造', '3C电子', '物流仓储', '医疗健康', '半导体'],
        density_indicator: '每万名工人机器人台数'
      }
    },
    key_metrics: [
      '工业机器人月度产量（同比）',
      '服务机器人销量',
      '核心零部件国产化率',
      '机器人企业注册数量',
      '行业投融资规模'
    ],
    data_sources: [
      '国家统计局: http://www.stats.gov.cn/',
      '高工机器人: https://www.gg-robot.com/',
      'IFR国际机器人联合会',
      '中国电子学会'
    ]
  }, { source: '数据源配置', frequency: 'config', category: '机器人产业链' });

  return results;
}

// ===== 第三类：重要事件数据 =====

async function collectEventsData() {
  console.log('\n📢 [3/5] 收集重要事件数据...');
  const results = { policy: null, announcements: null, techBreakthrough: null };

  // 3.1 政策文件数据源
  results.policy = save(DIRS.events, 'policy_files.json', {
    description: '各级政府发布的政策文件',
    policy_tracking: {
      central_government: {
        name: '中央政府政策',
        sources: [
          { name: '国务院', url: 'https://www.gov.cn/zhengce/' },
          { name: '发改委', url: 'https://www.ndrc.gov.cn/' },
          { name: '工信部', url: 'https://www.miit.gov.cn/' },
          { name: '财政部', url: 'http://www.mof.gov.cn/' },
          { name: '商务部', url: 'http://www.mofcom.gov.cn/' },
          { name: '央行', url: 'http://www.pbc.gov.cn/' }
        ],
        policy_types: ['产业规划', '扶持政策', '监管政策', '税收优惠', '补贴政策']
      },
      local_government: {
        name: '地方政府政策',
        key_regions: ['长三角', '珠三角', '京津冀', '成渝', '海南自贸港'],
        policy_types: ['招商引资', '产业园区', '人才政策', '土地政策']
      }
    },
    key_policy_areas: [
      '半导体/集成电路产业扶持',
      '新能源汽车产业政策',
      '人工智能发展规划',
      '机器人产业政策',
      '低空经济政策',
      '新能源产业政策'
    ]
  }, { source: '数据源配置', frequency: 'config', category: '政策文件' });

  // 3.2 产业公告数据源
  results.announcements = save(DIRS.events, 'industry_announcements.json', {
    description: '上市公司及行业协会发布的产业公告',
    announcement_types: {
      major_investment: {
        name: '重大投资公告',
        description: '新建产线、扩产、并购',
        source: '上交所/深交所公告',
        url: 'http://www.sse.com.cn/disclosure/listedinfo/announcement/'
      },
      performance_preview: {
        name: '业绩预告/快报',
        description: '季度/年度业绩预告',
        source: '交易所公告'
      },
      contract_winning: {
        name: '中标公告',
        description: '重大项目中标',
        source: '交易所公告'
      },
      tech_breakthrough: {
        name: '技术突破公告',
        description: '新产品、新工艺、新专利',
        source: '公司公告/行业协会'
      }
    },
    data_sources: [
      '上交所: http://www.sse.com.cn/',
      '深交所: http://www.szse.cn/',
      '巨潮资讯: http://www.cninfo.com.cn/',
      '东方财富公告: https://data.eastmoney.com/notices/'
    ]
  }, { source: '数据源配置', frequency: 'config', category: '产业公告' });

  // 3.3 卡脖子技术突破追踪
  results.techBreakthrough = save(DIRS.events, 'tech_breakthroughs.json', {
    description: '关键领域卡脖子技术突破进展',
    bottleneck_areas: {
      semiconductor: {
        name: '半导体',
        bottlenecks: ['EUV光刻机', '先进制程工艺', 'EDA工具', '高端光刻胶', '大硅片'],
        domestic_progress: ['DUV光刻机突破', '成熟制程扩产', '国产EDA替代'],
        key_entities: ['中芯国际', '华为', '中微公司', '北方华创', '上海微电子']
      },
      aero_engine: {
        name: '航空发动机',
        bottlenecks: ['单晶叶片', '高温合金', '轴承'],
        key_entities: ['航发动力', '钢研高纳', '图南股份']
      },
      industrial_software: {
        name: '工业软件',
        bottlenecks: ['CAD/CAE/CAM', 'PLC', '高端传感器'],
        key_entities: ['中望软件', '宝信软件', '和利时']
      },
      advanced_materials: {
        name: '先进材料',
        bottlenecks: ['碳纤维', '高温合金', '半导体材料', '高性能陶瓷'],
        key_entities: ['光威复材', '抚顺特钢', '三环集团']
      },
      precision_instruments: {
        name: '精密仪器',
        bottlenecks: ['高端质谱仪', '电子显微镜', '精密测量设备'],
        key_entities: ['中科仪', '上海精测', '华测检测']
      }
    },
    tracking_sources: [
      '科技部: https://www.most.gov.cn/',
      '工信部: https://www.miit.gov.cn/',
      '国家知识产权局',
      '行业研报（招商、中信等）',
      '公司公告'
    ]
  }, { source: '数据源配置', frequency: 'config', category: '技术突破' });

  return results;
}

// ===== 第四类：天气周期数据 =====

async function collectWeatherData() {
  console.log('\n🌤️ [4/5] 收集天气周期数据...');
  const results = { typhoon: null, extremeTemp: null, portDisruption: null, weatherForecast: null };

  // 4.1 港口城市实时天气（Open-Meteo API）
  try {
    const ports = [
      { name: '上海', lat: 31.23, lon: 121.47, type: '港口/制造业' },
      { name: '深圳', lat: 22.54, lon: 114.06, type: '制造业/科技' },
      { name: '广州', lat: 23.13, lon: 113.26, type: '港口/制造' },
      { name: '天津', lat: 39.08, lon: 117.20, type: '港口/重工业' },
      { name: '青岛', lat: 36.07, lon: 120.38, type: '港口' },
      { name: '宁波', lat: 29.87, lon: 121.54, type: '港口' },
      { name: '厦门', lat: 24.48, lon: 118.09, type: '港口' },
      { name: '大连', lat: 38.91, lon: 121.61, type: '港口/造船' },
      { name: '秦皇岛', lat: 39.94, lon: 119.60, type: '煤炭港口' },
      { name: '新加坡', lat: 1.35, lon: 103.82, type: '航运枢纽' }
    ];

    const weatherPromises = ports.map(port => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${port.lat}&longitude=${port.lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&timezone=auto&forecast_days=7`;
      return request(url).then(resp => {
        const data = parseJSON(resp.data);
        if (data) return { ...port, current: data.current_weather, daily: data.daily };
        return null;
      }).catch(() => null);
    });

    const weatherResults = (await Promise.all(weatherPromises)).filter(Boolean);

    if (weatherResults.length > 0) {
      results.weatherForecast = save(DIRS.weather, 'port_weather_forecast.json', {
        cities: weatherResults,
        summary: {
          total_cities: weatherResults.length,
          avg_temperature: (weatherResults.reduce((s, c) => s + (c.current?.temperature || 0), 0) / weatherResults.length).toFixed(1),
          max_wind: Math.max(...weatherResults.map(c => c.current?.windspeed || 0)).toFixed(1),
          alerts: weatherResults.filter(c => {
            const code = c.current?.weathercode;
            return code >= 50; // 降雨以上级别
          }).map(c => ({ city: c.name, weathercode: c.current.weathercode }))
        }
      }, { source: 'Open-Meteo', frequency: 'daily', category: '港口天气' });
    }
  } catch (e) {
    console.log('  ⚠️ 港口天气获取失败:', e.message);
  }

  // 4.2 台风预警数据源
  results.typhoon = save(DIRS.weather, 'typhoon_alert.json', {
    description: '台风预警及影响情况',
    data_sources: {
      national_meteo: {
        name: '中央气象台台风网',
        url: 'http://typhoon.nmc.cn/',
        api: 'http://www.nmc.cn/f/rest/typhoon',
        frequency: '实时更新'
      },
      regional_meteo: {
        name: '区域气象中心',
        sources: ['上海台风中心', '广州台风中心', '香港天文台']
      }
    },
    impact_assessment: {
      port_closure: '8级以上风力港口停工',
      shipping_delay: '台风路径影响航线',
      power_outage: '强降雨导致停电',
      manufacturing_stop: '极端天气工厂停工'
    },
    key_metrics: [
      '台风等级（热带低压/热带风暴/强热带风暴/台风/强台风/超强台风）',
      '中心最大风速',
      '7级风圈半径',
      '10级风圈半径',
      '预计登陆地点和时间'
    ]
  }, { source: '数据源配置', frequency: 'config', category: '台风预警' });

  // 4.3 极端气温数据源
  results.extremeTemp = save(DIRS.weather, 'extreme_temperature.json', {
    description: '极端气温事件监测',
    alert_levels: {
      high_temp: {
        name: '高温预警',
        levels: [
          { color: '蓝色', threshold: '35°C以上', action: '注意防暑' },
          { color: '黄色', threshold: '37°C以上', action: '减少户外作业' },
          { color: '橙色', threshold: '40°C以上', action: '停止户外作业' },
          { color: '红色', threshold: '42°C以上', action: '紧急停工' }
        ]
      },
      low_temp: {
        name: '寒潮预警',
        levels: [
          { color: '蓝色', threshold: '48h降温8°C', action: '注意保暖' },
          { color: '黄色', threshold: '48h降温10°C', action: '停止室外作业' },
          { color: '橙色', threshold: '48h降温12°C', action: '停止高空作业' },
          { color: '红色', threshold: '48h降温16°C', action: '全面停工' }
        ]
      }
    },
    economic_impact: {
      high_temp: ['电力负荷激增', '工业限产', '农业干旱', '航运水位下降'],
      low_temp: ['天然气供应紧张', '交通中断', '农业冻害', '物流延迟']
    },
    data_sources: [
      '中国气象局: http://www.cma.gov.cn/',
      '中央气象台: http://www.nmc.cn/',
      'Open-Meteo: https://open-meteo.com/'
    ]
  }, { source: '数据源配置', frequency: 'config', category: '极端气温' });

  // 4.4 港口停运数据源
  results.portDisruption = save(DIRS.weather, 'port_disruption.json', {
    description: '主要港口因天气原因导致的停运信息',
    major_ports: {
      china: ['上海港', '宁波舟山港', '深圳港', '广州港', '青岛港', '天津港', '厦门港', '大连港'],
      asia: ['新加坡港', '釜山港', '香港', '巴生港', '林查班港'],
      europe: ['鹿特港', '安特卫普港', '汉堡港'],
      america: ['洛杉矶港', '长滩港', '纽约港', '萨凡纳港']
    },
    disruption_causes: [
      { cause: '台风/热带气旋', impact: '港口关闭12-72小时', frequency: '夏秋季' },
      { cause: '大雾', impact: '船舶无法进出港', frequency: '春季' },
      { cause: '风暴潮', impact: '码头作业停止', frequency: '全年' },
      { cause: '极端高温', impact: '装卸效率下降', frequency: '夏季' },
      { cause: '寒潮/冰冻', impact: '航道结冰', frequency: '冬季' }
    ],
    data_sources: [
      '中国港口协会: http://www.port.org.cn/',
      '各港口集团官网',
      '航运在线: https://www.sol.com.cn/',
      '船期查询: https://www.shipping.com/'
    ]
  }, { source: '数据源配置', frequency: 'config', category: '港口停运' });

  return results;
}

// ===== 第五类：二级市场数据 =====

async function collectMarketData() {
  console.log('\n📈 [5/5] 收集二级市场数据...');
  const results = { boardMovement: null, ladderBoard: null, capitalFlow: null, crypto: null };

  // 5.1 板块异动数据源
  results.boardMovement = save(DIRS.market, 'board_movement.json', {
    description: '股票市场各板块异动情况',
    data_structure: {
      daily_ranking: {
        name: '每日板块涨跌幅排行',
        fields: ['板块名称', '涨跌幅%', '成交额(亿)', '净流入(亿)', '领涨股', '领跌股'],
        source: '东方财富/同花顺'
      },
      volume_change: {
        name: '成交量变化',
        fields: ['板块名称', '今日成交量', '昨日成交量', '量比', '换手率%'],
        note: '量比>1.5为放量，<0.8为缩量'
      },
      limit_stats: {
        name: '涨跌停统计',
        fields: ['涨停数', '跌停数', '连板数', '炸板数', '炸板率%']
      }
    },
    data_sources: [
      '东方财富: https://data.eastmoney.com/bkzj/',
      '同花顺: https://data.10jqka.com.cn/',
      'Wind金融终端',
      'Choice金融终端'
    ]
  }, { source: '数据源配置', frequency: 'config', category: '板块异动' });

  // 5.2 连板梯队数据源
  results.ladderBoard = save(DIRS.market, 'ladder_board.json', {
    description: '连板梯队结构及演变',
    ladder_structure: {
      tier_1: { name: '首板', description: '首次涨停', count_field: '首板数量' },
      tier_2: { name: '二板', description: '连续2日涨停', count_field: '二板数量' },
      tier_3: { name: '三板', description: '连续3日涨停', count_field: '三板数量' },
      tier_4: { name: '四板及以上', description: '连续4日+涨停', count_field: '高板数量' },
      space_leader: { name: '空间龙头', description: '最高连板股', note: '市场情绪风向标' }
    },
    analysis_metrics: [
      '连板晋级率（二板/首板）',
      '连板高度变化',
      '连板板块集中度',
      '炸板率（当日涨停打开比例）',
      '连板股成交额占比'
    ],
    data_sources: [
      '东方财富涨停板: https://data.eastmoney.com/ztb/',
      '同花顺涨停板: https://data.10jqka.com.cn/market/zdfph/',
      '淘股吧涨停板: https://www.taoguba.com.cn/'
    ]
  }, { source: '数据源配置', frequency: 'config', category: '连板梯队' });

  // 5.3 资金流向数据源
  results.capitalFlow = save(DIRS.market, 'capital_flow.json', {
    description: '市场资金流动数据',
    flow_types: {
      north_bound: {
        name: '北向资金',
        description: '陆股通资金流向',
        indicators: ['沪股通净流入', '深股通净流入', '北向资金合计'],
        source: '港交所/东方财富',
        frequency: 'daily',
        release_time: '每日收盘后'
      },
      main_force: {
        name: '主力资金',
        description: '超大单+大单净流入',
        indicators: ['主力净流入', '超大单净流入', '大单净流入', '中单净流入', '小单净流入'],
        source: '东方财富/同花顺',
        frequency: 'daily'
      },
      margin_trading: {
        name: '融资融券',
        indicators: ['融资余额', '融券余额', '融资买入额', '融资偿还额', '净买入'],
        source: '交易所',
        frequency: 'daily'
      },
      etf_flow: {
        name: 'ETF申赎',
        indicators: ['ETF份额变动', '资金净流入'],
        source: '基金公司/交易所',
        frequency: 'daily'
      },
      industry_flow: {
        name: '行业资金流向',
        indicators: ['行业净流入排行', '行业净流出排行'],
        source: '东方财富',
        frequency: 'daily'
      }
    },
    data_sources: [
      '东方财富资金流向: https://data.eastmoney.com/zjlx/',
      '同花顺资金流向: https://data.10jqka.com.cn/market/zjlx/',
      '港交所: https://www.hkex.com.hk/',
      '交易所融资融券: http://www.sse.com.cn/disclosure/diclosure/margin/'
    ]
  }, { source: '数据源配置', frequency: 'config', category: '资金流向' });

  // 5.4 加密货币实时数据（CoinGecko）
  try {
    const cryptoResp = await request('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin,solana,ripple,cardano,dogecoin,polkadot,chainlink,avalanche-2,litecoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true');
    const cryptoData = parseJSON(cryptoResp.data);
    if (cryptoData) {
      const coins = ['bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana', 'ripple', 'cardano', 'dogecoin', 'polkadot', 'chainlink', 'avalanche-2', 'litecoin'];
      const symbols = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'LINK', 'AVAX', 'LTC'];
      const names = ['Bitcoin', 'Ethereum', 'Tether', 'BNB', 'Solana', 'XRP', 'Cardano', 'Dogecoin', 'Polkadot', 'Chainlink', 'Avalanche', 'Litecoin'];
      
      results.crypto = save(DIRS.market, 'crypto_realtime.json', {
        coins: coins.map((id, i) => ({
          id, symbol: symbols[i], name: names[i],
          price_usd: cryptoData[id]?.usd || 0,
          change_24h: cryptoData[id]?.usd_24h_change || 0,
          volume_24h: cryptoData[id]?.usd_24h_vol || 0,
          market_cap: cryptoData[id]?.usd_market_cap || 0
        })),
        total_market_cap: cryptoData ? Object.values(cryptoData).reduce((s, c) => s + (c.usd_market_cap || 0), 0) : 0
      }, { source: 'CoinGecko', frequency: 'daily', category: '加密货币' });
    }
  } catch (e) {
    console.log('  ⚠️ 加密货币获取失败:', e.message);
  }

  return results;
}

// ===== 数据状态总览 =====

function generateStatusReport(allResults) {
  const report = {
    _meta: {
      generated_at: new Date().toISOString(),
      version: '2.0',
      data_categories: 5,
      total_data_sources: 0
    },
    categories: {
      macro: {
        name: '宏观经济数据',
        files: ['exchange_rates.json', 'shipping_indices.json', 'pmi.json', 'social_financing.json'],
        status: 'configured',
        real_time_data: ['exchange_rates.json']
      },
      industry: {
        name: '产业运行数据',
        files: ['power_load.json', 'new_energy.json', 'robot_supply_chain.json'],
        status: 'configured',
        real_time_data: []
      },
      events: {
        name: '重要事件数据',
        files: ['policy_files.json', 'industry_announcements.json', 'tech_breakthroughs.json'],
        status: 'configured',
        real_time_data: []
      },
      weather: {
        name: '天气周期数据',
        files: ['port_weather_forecast.json', 'typhoon_alert.json', 'extreme_temperature.json', 'port_disruption.json'],
        status: 'active',
        real_time_data: ['port_weather_forecast.json']
      },
      market: {
        name: '二级市场数据',
        files: ['board_movement.json', 'ladder_board.json', 'capital_flow.json', 'crypto_realtime.json'],
        status: 'active',
        real_time_data: ['crypto_realtime.json']
      }
    },
    update_schedule: {
      daily: ['exchange_rates.json', 'port_weather_forecast.json', 'crypto_realtime.json'],
      weekly: ['shipping_indices.json', 'pmi.json'],
      monthly: ['social_financing.json', 'power_load.json', 'new_energy.json'],
      real_time: ['board_movement.json', 'capital_flow.json', 'ladder_board.json']
    },
    next_steps: [
      '配置TradingEconomics API Key获取完整商品/宏观数据',
      '配置东方财富/同花顺API获取实时行情数据',
      '设置Windows定时任务每日自动运行',
      '建立SQLite历史数据库存储时序数据',
      '开发数据可视化仪表盘'
    ]
  };

  // 统计总数据源数
  Object.values(report.categories).forEach(cat => {
    report._meta.total_data_sources += cat.files.length;
  });

  save(BASE_DIR, 'status.json', report, { source: 'system', frequency: 'config', category: '数据状态总览' });
  return report;
}

// ===== 主执行流程 =====

async function main() {
  console.log('════════════════════════════════════════════════');
  console.log('  AI量化交易Agent · 五类底层数据收集系统 v2.0');
  console.log('════════════════════════════════════════════════');
  console.log('📅', new Date().toLocaleString('zh-CN'));
  console.log('📂 数据目录:', BASE_DIR);
  console.log('');

  const t0 = Date.now();

  // 并行收集五类数据
  const [macro, industry, events, weather, market] = await Promise.all([
    collectMacroData(),
    collectIndustryData(),
    collectEventsData(),
    collectWeatherData(),
    collectMarketData()
  ]);

  console.log('\n────────────────────────────────────────────────');
  console.log('📊 生成数据状态总览...');

  const report = generateStatusReport({ macro, industry, events, weather, market });

  const elapsed = Date.now() - t0;
  console.log('');
  console.log('════════════════════════════════════════════════');
  console.log(`✅ 全部完成！耗时 ${(elapsed/1000).toFixed(1)}s`);
  console.log(`📁 数据目录: ${BASE_DIR}`);
  console.log(`📊 数据类别: 5类`);
  console.log(`📄 数据文件: ${report._meta.total_data_sources}个`);
  console.log('════════════════════════════════════════════════');
}

main().catch(console.error);
