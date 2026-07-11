/**
 * 信息分层采集 Skill v1.0
 * 蒸馏自：信息分层采集框架 v5.0 (2026-07-10)
 * 
 * 核心认知操作系统：
 * - 按"离原始来源的距离"分层：L0原始→L1专业→L2传播→L3反馈
 * - 同一事件四层版本，层间差距本身就是信息
 * - 操作方向：先L0建立事实基线，再顺加工链看变形过程
 * 
 * 使用方式：
 * const { LayeredCollector } = require('./layered-collector-skill.cjs');
 * const collector = new LayeredCollector('事件核心陈述');
 * await collector.execute();
 */

class LayeredCollector {
  constructor(eventCoreStatement, options = {}) {
    this.event = eventCoreStatement; // 30字以内核心陈述
    this.options = {
      timeLimit: options.timeLimit || 90, // 分钟
      l0MaxSources: options.l0MaxSources || 5,
      l1MaxSources: options.l1MaxSources || 3,
      l2SampleSize: options.l2SampleSize || 10,
      ...options
    };
    
    // 四层数据存储
    this.layers = {
      l0: { // 原始层
        name: 'L0 原始层',
        definition: '信息首次出现时的原始形态：政府公报、判决书、科研论文、一手统计',
        data: [],
        status: 'pending'
      },
      l1: { // 专业加工层
        name: 'L1 专业加工层',
        definition: '专业主体基于L0的结构化解释：研报、白皮书、深度报道',
        data: [],
        status: 'pending'
      },
      l2: { // 传播适配层
        name: 'L2 传播适配层',
        definition: '适配传播渠道的再编码：社交媒体、短视频、新闻推送',
        data: [],
        status: 'pending'
      },
      l3: { // 反馈共振层
        name: 'L3 反馈共振层',
        definition: '受众接收后的反应：评论区、二次创作、立场固化',
        data: [],
        status: 'pending'
      }
    };
    
    // 层间偏差记录
    this.deviations = [];
    
    // 采集质量标记
    this.qualityFlags = {
      l0BaselineEstablished: false,
      missingSources: [],
      unverifiedClaims: [],
      coverageBoundary: null,
      timeExpired: false
    };
    
    this.startTime = Date.now();
  }

  // ===== 第一步：L0事实基线建立（必须最先完成）=====
  
  async collectL0(sources) {
    console.log('\n🔍 [Step 1] 建立L0事实基线...');
    console.log('   核心陈述:', this.event);
    
    const results = [];
    
    for (const source of sources.slice(0, this.options.l0MaxSources)) {
      this._checkTimeLimit();
      if (this.qualityFlags.timeExpired) break;
      
      try {
        // 尝试获取原始来源
        const raw = await this._fetchSource(source);
        if (raw) {
          const entry = {
            source: source.name || source.url,
            type: source.type || 'document',
            url: source.url,
            fetchTime: new Date().toISOString(),
            content: raw.content || raw,
            coreFacts: raw.coreFacts || [],
            conditions: raw.conditions || [],
            uncertainties: raw.uncertainties || [],
            scope: raw.scope || '',
            publishDate: raw.publishDate || null,
            publisher: raw.publisher || ''
          };
          results.push(entry);
          console.log('   ✅ L0获取:', source.name || source.url);
        }
      } catch (e) {
        this.qualityFlags.missingSources.push({
          source: source.name || source.url,
          reason: e.message,
          searchQuery: source.searchQuery
        });
        console.log('   ❌ L0缺失:', source.name, '-', e.message);
      }
    }
    
    this.layers.l0.data = results;
    this.layers.l0.status = results.length > 0 ? 'complete' : 'insufficient';
    
    if (results.length > 0) {
      this.qualityFlags.l0BaselineEstablished = true;
      console.log('   📌 L0基线已建立:', results.length, '个来源');
    } else {
      console.log('   ⚠️ L0基线不足，后续偏差标注改为"与近似L0对比"');
    }
    
    return results;
  }

  // ===== 第二步：L1专业加工层扫描 =====
  
  async collectL1(sources) {
    console.log('\n🔍 [Step 2] 扫描L1专业加工层...');
    
    const results = [];
    
    for (const source of sources.slice(0, this.options.l1MaxSources)) {
      this._checkTimeLimit();
      if (this.qualityFlags.timeExpired) break;
      
      try {
        const raw = await this._fetchSource(source);
        if (raw) {
          const entry = {
            source: source.name || source.url,
            type: source.type || 'analysis',
            url: source.url,
            fetchTime: new Date().toISOString(),
            content: raw.content || raw,
            frameworks: raw.frameworks || [], // 引入的分析框架
            filters: raw.filters || [],       // 筛选/忽略的信息
            assumptions: raw.assumptions || [], // 附加前提假设
            conflicts: raw.conflicts || []     // 与L0的偏差
          };
          results.push(entry);
          console.log('   ✅ L1获取:', source.name || source.url);
        }
      } catch (e) {
        this.qualityFlags.missingSources.push({
          source: source.name || source.url,
          reason: e.message
        });
      }
    }
    
    this.layers.l1.data = results;
    this.layers.l1.status = results.length > 0 ? 'complete' : 'insufficient';
    return results;
  }

  // ===== 第三步：L2传播适配层扫描 =====
  
  async collectL2(sources) {
    console.log('\n🔍 [Step 3] 扫描L2传播适配层...');
    
    const results = [];
    
    for (const source of sources.slice(0, this.options.l2SampleSize)) {
      this._checkTimeLimit();
      if (this.qualityFlags.timeExpired) break;
      
      try {
        const raw = await this._fetchSource(source);
        if (raw) {
          const entry = {
            source: source.name || source.url,
            type: source.type || 'social',
            url: source.url,
            fetchTime: new Date().toISOString(),
            content: raw.content || raw,
            headline: raw.headline || '',
            emotionalWords: raw.emotionalWords || [],
            droppedConditions: raw.droppedConditions || [],
            addedNarrative: raw.addedNarrative || [],
            commentHighFreq: raw.commentHighFreq || []
          };
          results.push(entry);
          console.log('   ✅ L2获取:', source.name || source.url);
        }
      } catch (e) {
        // L2允许跳过
      }
    }
    
    this.layers.l2.data = results;
    this.layers.l2.status = results.length > 0 ? 'complete' : 'insufficient';
    return results;
  }

  // ===== 第四步：L3反馈共振层抽样 =====
  
  async collectL3(opposingCommunities) {
    console.log('\n🔍 [Step 4] 抽样L3反馈共振层...');
    
    const results = [];
    
    for (const community of opposingCommunities.slice(0, 3)) {
      this._checkTimeLimit();
      if (this.qualityFlags.timeExpired) break;
      
      try {
        const samples = await this._fetchSource(community);
        if (samples) {
          results.push({
            community: community.name,
            url: community.url,
            fetchTime: new Date().toISOString(),
            topVoices: samples.slice(0, 10),
            dominantNarrative: this._extractNarrative(samples),
            factualCitations: this._countFactualCitations(samples)
          });
          console.log('   ✅ L3抽样:', community.name);
        }
      } catch (e) {
        // L3允许跳过
      }
    }
    
    this.layers.l3.data = results;
    this.layers.l3.status = results.length > 0 ? 'complete' : 'insufficient';
    return results;
  }

  // ===== 第五步：层间偏差绘制 =====
  
  analyzeDeviations() {
    console.log('\n📊 [Step 5] 分析层间偏差...');
    
    const l0Facts = this.layers.l0.data.flatMap(d => d.coreFacts || []);
    const l0Conditions = this.layers.l0.data.flatMap(d => d.conditions || []);
    
    const deviations = [];
    
    // 对比L1与L0
    this.layers.l1.data.forEach(l1 => {
      const conflicts = l1.conflicts || [];
      conflicts.forEach(c => {
        deviations.push({
          type: '限定条件丢失',
          from: 'L0',
          to: 'L1',
          fact: c.fact,
          original: c.original,
          simplified: c.simplified,
          source: l1.source
        });
      });
    });
    
    // 对比L2与L0
    this.layers.l2.data.forEach(l2 => {
      if (l2.droppedConditions) {
        l2.droppedConditions.forEach(c => {
          deviations.push({
            type: '限定条件丢失',
            from: 'L0',
            to: 'L2',
            fact: c.fact,
            dropped: c.condition,
            source: l2.source
          });
        });
      }
    });
    
    // 检测传播无锚
    if (this.layers.l2.data.length > 0 && this.layers.l0.data.length === 0) {
      deviations.push({
        type: '传播无锚',
        from: 'L0(缺失)',
        to: 'L2',
        note: 'L2有传播但回溯不到L0原文'
      });
    }
    
    // 检测共识加固
    const l2Emotional = this.layers.l2.data.flatMap(d => d.emotionalWords || []);
    if (l2Emotional.length > l0Facts.length * 3) {
      deviations.push({
        type: '情绪污染指数偏高',
        from: 'L0',
        to: 'L2',
        emotionalRatio: l2Emotional.length / Math.max(l0Facts.length, 1)
      });
    }
    
    this.deviations = deviations;
    console.log('   发现偏差:', deviations.length, '个');
    
    return deviations;
  }

  // ===== 第六步：生成报告 =====
  
  generateReport() {
    const elapsed = ((Date.now() - this.startTime) / 1000 / 60).toFixed(1);
    
    const report = {
      _meta: {
        skillVersion: '1.0',
        collectedAt: new Date().toISOString(),
        elapsedMinutes: parseFloat(elapsed),
        timeLimit: this.options.timeLimit,
        timeExpired: this.qualityFlags.timeExpired
      },
      event: this.event,
      layers: {
        l0: {
          status: this.layers.l0.status,
          sourceCount: this.layers.l0.data.length,
          baselineEstablished: this.qualityFlags.l0BaselineEstablished,
          sources: this.layers.l0.data.map(d => d.source)
        },
        l1: {
          status: this.layers.l1.status,
          sourceCount: this.layers.l1.data.length,
          frameworks: [...new Set(this.layers.l1.data.flatMap(d => d.frameworks || []))]
        },
        l2: {
          status: this.layers.l2.status,
          sourceCount: this.layers.l2.data.length,
          topHeadlines: this.layers.l2.data.slice(0, 5).map(d => d.headline)
        },
        l3: {
          status: this.layers.l3.status,
          communityCount: this.layers.l3.data.length,
          narratives: this.layers.l3.data.map(d => ({
            community: d.community,
            dominant: d.dominantNarrative
          }))
        }
      },
      deviations: {
        total: this.deviations.length,
        byType: this._groupByType(this.deviations),
        details: this.deviations
      },
      qualityFlags: this.qualityFlags,
      coverageBoundary: this._generateCoverageBoundary(),
      summary: this._generateSummary()
    };
    
    return report;
  }

  // ===== 内部工具方法 =====
  
  _checkTimeLimit() {
    const elapsed = (Date.now() - this.startTime) / 1000 / 60;
    if (elapsed >= this.options.timeLimit * 0.8) {
      this.qualityFlags.timeExpired = true;
      console.log('   ⏰ 时间限制接近(80%)，准备收尾');
    }
  }
  
  async _fetchSource(source) {
    // 实际HTTP请求，需根据source类型适配
    // 此处为接口定义，实际实现需根据数据源类型选择不同解析方式
    if (source.fetcher) {
      return await source.fetcher(source);
    }
    // 默认：直接返回content字段
    return source.content || null;
  }
  
  _extractNarrative(samples) {
    // 提取高频叙事模式
    if (!samples || samples.length === 0) return [];
    const freq = {};
    samples.forEach(s => {
      if (s.text) {
        const words = s.text.split(/\s+/).filter(w => w.length > 2);
        words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
      }
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([w]) => w);
  }
  
  _countFactualCitations(samples) {
    if (!samples) return 0;
    return samples.filter(s => 
      s.text && (s.text.includes('根据') || s.text.includes('来源') || s.text.includes('数据显示'))
    ).length;
  }
  
  _groupByType(deviations) {
    const grouped = {};
    deviations.forEach(d => {
      if (!grouped[d.type]) grouped[d.type] = 0;
      grouped[d.type]++;
    });
    return grouped;
  }
  
  _generateCoverageBoundary() {
    const l0Count = this.layers.l0.data.length;
    const l1Count = this.layers.l1.data.length;
    const l2Count = this.layers.l2.data.length;
    
    let coverage = 'partial';
    if (l0Count >= 3 && l1Count >= 2 && l2Count >= 5) coverage = 'good';
    else if (l0Count === 0) coverage = 'l0_missing';
    else if (l2Count === 0) coverage = 'l2_insufficient';
    
    return {
      level: coverage,
      l0: l0Count,
      l1: l1Count,
      l2: l2Count,
      l3: this.layers.l3.data.length,
      missingSources: this.qualityFlags.missingSources,
      note: '本次采集覆盖范围为局部快照，非全量覆盖'
    };
  }
  
  _generateSummary() {
    const l0Ok = this.layers.l0.data.length > 0;
    const devCount = this.deviations.length;
    
    let summary = '';
    
    if (!l0Ok) {
      summary = '⚠️ L0基线不足，建议补充原始来源后再做偏差分析';
    } else if (devCount === 0) {
      summary = '✅ 层间偏差较少，信息传播质量较高';
    } else if (devCount <= 3) {
      summary = '📊 发现少量层间偏差，情绪方向: ' + this._detectEmotionalDirection();
    } else {
      summary = '🔴 层间偏差较多，信息变形严重，需警惕传播无锚和限定条件丢失';
    }
    
    return summary;
  }
  
  _detectEmotionalDirection() {
    const allEmotional = this.layers.l2.data.flatMap(d => d.emotionalWords || []);
    const positive = allEmotional.filter(w => 
      ['利好','上涨','突破','重大利好','暴涨','牛市'].includes(w)
    ).length;
    const negative = allEmotional.filter(w => 
      ['利空','下跌','暴跌','崩盘','重大利空','风险'].includes(w)
    ).length;
    
    if (positive > negative) return '偏多(乐观)';
    if (negative > positive) return '偏空(悲观)';
    return '中性';
  }
}

// ===== 快捷执行协议 =====

async function executeLayeredCollection(eventStatement, allSources) {
  const collector = new LayeredCollector(eventStatement, {
    timeLimit: allSources.timeLimit || 90
  });
  
  console.log('════════════════════════════════════════════════');
  console.log('  信息分层采集 Skill v1.0');
  console.log('════════════════════════════════════════════════');
  console.log('事件:', eventStatement);
  console.log('时间限制:', collector.options.timeLimit, '分钟');
  
  // Step 1: L0事实基线
  await collector.collectL0(allSources.l0 || []);
  
  // Step 2: L1专业加工
  await collector.collectL1(allSources.l1 || []);
  
  // Step 3: L2传播适配
  await collector.collectL2(allSources.l2 || []);
  
  // Step 4: L3反馈抽样
  await collector.collectL3(allSources.l3 || []);
  
  // Step 5: 层间偏差分析
  collector.analyzeDeviations();
  
  // Step 6: 生成报告
  const report = collector.generateReport();
  
  console.log('\n════════════════════════════════════════════════');
  console.log('  📋 采集报告');
  console.log('════════════════════════════════════════════════');
  console.log('L0状态:', report.layers.l0.status, '(' + report.layers.l0.sourceCount + '来源)');
  console.log('L1状态:', report.layers.l1.status, '(' + report.layers.l1.sourceCount + '来源)');
  console.log('L2状态:', report.layers.l2.status, '(' + report.layers.l2.sourceCount + '来源)');
  console.log('L3状态:', report.layers.l3.status, '(' + report.layers.l3.communityCount + '社区)');
  console.log('偏差数量:', report.deviations.total);
  console.log('覆盖级别:', report.coverageBoundary.level);
  console.log('总结:', report.summary);
  console.log('采集耗时:', report._meta.elapsedMinutes, '分钟');
  console.log('════════════════════════════════════════════════');
  
  return report;
}

// ===== 导出 =====

module.exports = {
  LayeredCollector,
  executeLayeredCollection
};

// ===== 命令行直接执行 =====

if (require.main === module) {
  console.log('信息分层采集 Skill v1.0');
  console.log('');
  console.log('使用方法:');
  console.log('  const { LayeredCollector } = require("./layered-collector-skill.cjs");');
  console.log('  const collector = new LayeredCollector("事件核心陈述");');
  console.log('  await collector.collectL0([...]);');
  console.log('  await collector.analyzeDeviations();');
  console.log('  const report = collector.generateReport();');
  console.log('');
  console.log('快捷方式:');
  console.log('  const report = await executeLayeredCollection("事件", { l0: [...], l1: [...], l2: [...], l3: [...] });');
}
