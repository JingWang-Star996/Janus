#!/usr/bin/env node

/**
 * Agent 指挥官 Orchestra - 入口文件
 * 
 * 职责：调用 Orchestra 模块，协调多 Agent 协作
 */

const path = require('path');

// 加载 Orchestra 模块
const Orchestra = require('../../orchestra/orchestra');
const GameDesignWorkflow = require('../../orchestra/gameDesignWorkflow');
const ToolSystem = require('../../orchestra/toolSystem');
const FlexibleRecovery = require('../../orchestra/flexibleRecovery');

class AgentCommander {
  constructor(options) {
    this.options = {
      model: (options && options.model) || 'qwen3.5-plus',
      verbose: (options && options.verbose) || false
    };
    
    this.orchestra = new Orchestra(this.options);
    this.toolSystem = new ToolSystem(this.options);
    this.recovery = new FlexibleRecovery(this.options);
  }

  /**
   * 执行任务
   */
  async execute(userInput) {
    console.log('\n🎻 Agent 指挥官 Orchestra 接收请求');
    console.log('用户输入：' + userInput + '\n');
    
    // 分析意图
    var intent = this._analyzeIntent(userInput);
    console.log('【意图分析】');
    console.log('任务类型：' + intent.type);
    console.log('复杂度：' + intent.complexity);
    console.log('领域：' + intent.domain + '\n');
    
    // 路由决策
    var routing = this._makeRoutingDecision(intent);
    console.log('【路由决策】');
    console.log('类型：' + routing.type);
    console.log('目标：' + routing.target);
    console.log('理由：' + routing.reason + '\n');
    
    // 执行
    var result;
    if (routing.type === 'team') {
      result = await this._executeTeam(routing.target, userInput);
    } else {
      result = await this.orchestra.run(userInput);
    }
    
    // 汇总
    var output = this._summarizeResult(result, intent, routing);
    console.log('【执行结果】');
    console.log(output);
    
    return output;
  }

  /**
   * 分析意图
   */
  _analyzeIntent(userInput) {
    var type = '创作';
    var complexity = '复杂';
    var domain = '游戏';
    
    if (userInput.indexOf('review') !== -1 || userInput.indexOf('分析') !== -1) {
      type = '分析';
    }
    if (userInput.indexOf('简单') !== -1 || userInput.indexOf('快速') !== -1) {
      complexity = '简单';
    }
    if (userInput.indexOf('代码') !== -1 || userInput.indexOf('技术') !== -1) {
      domain = '技术';
    }
    
    return { type: type, complexity: complexity, domain: domain };
  }

  /**
   * 路由决策
   */
  _makeRoutingDecision(intent) {
    if (intent.complexity === '复杂' && intent.domain === '游戏') {
      return {
        type: 'team',
        target: '游戏设计团队',
        reason: '需要多岗位协作完成系统设计'
      };
    }
    
    return {
      type: 'single',
      target: 'AI 主程',
      reason: '简单任务由单个 Agent 处理'
    };
  }

  /**
   * 执行团队任务
   */
  async _executeTeam(teamName, userInput) {
    if (teamName === '游戏设计团队') {
      var workflow = new GameDesignWorkflow({
        maxConcurrent: 8,
        verbose: this.options.verbose
      });
      
      return await workflow.execute(userInput);
    }
    
    return await this.orchestra.run(userInput);
  }

  /**
   * 汇总结果
   */
  _summarizeResult(result, intent, routing) {
    var output = '';
    output += '【Agent 指挥官 Orchestra 执行报告】\n\n';
    output += '【意图分析】\n';
    output += '任务类型：' + intent.type + '\n';
    output += '复杂度：' + intent.complexity + '\n';
    output += '领域：' + intent.domain + '\n\n';
    output += '【路由决策】\n';
    output += '类型：' + routing.type + '\n';
    output += '目标：' + routing.target + '\n';
    output += '理由：' + routing.reason + '\n\n';
    output += '【执行结果】\n';
    
    if (result && result.deliverables) {
      output += '交付物：' + Object.keys(result.deliverables).length + '个\n';
      for (var key in result.deliverables) {
        output += '  - ' + result.deliverables[key] + '\n';
      }
    } else {
      output += '执行完成\n';
    }
    
    output += '\n【下一步建议】\n';
    output += '可以开始实现代码，或调整设计方案。\n';
    
    return output;
  }
}

// 导出
module.exports = AgentCommander;

// CLI 入口
if (require.main === module) {
  var userInput = process.argv.slice(2).join(' ') || '设计一个宠物养成系统';
  
  var commander = new AgentCommander({
    model: 'qwen3.5-plus',
    verbose: true
  });
  
  commander.execute(userInput)
    .then(function(result) {
      console.log('\n=== 执行完成 ===');
    })
    .catch(function(err) {
      console.error('执行失败：', err.message);
      process.exit(1);
    });
}
