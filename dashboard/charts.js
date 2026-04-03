/**
 * Orchestra Dashboard - 图表配置
 * 实时数据可视化系统
 */

// 模拟数据生成器（实际使用时替换为真实 API）
const DataGenerator = {
    // 生成 Token 消耗数据
    generateTokenData() {
        const now = new Date();
        const data = [];
        for (let i = 30; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 5000);
            data.push({
                name: time.toLocaleTimeString('zh-CN', { hour12: false }),
                value: Math.floor(Math.random() * 500) + 100
            });
        }
        return data;
    },

    // 生成 Agent 状态数据
    generateStatusData() {
        return [
            { value: Math.floor(Math.random() * 3) + 1, name: '运行中' },
            { value: Math.floor(Math.random() * 3) + 2, name: '已完成' },
            { value: Math.floor(Math.random() * 1), name: '失败' }
        ];
    },

    // 生成 Agent 成本数据
    generateCostData() {
        const agents = ['总编辑', '选题策划', '资深撰稿人', '技术审核', '文字编辑', '用户体验', '终审官'];
        return agents.map(name => ({
            name,
            value: (Math.random() * 100).toFixed(2)
        }));
    },

    // 生成甘特图数据
    generateGanttData() {
        const agents = ['总编辑', '选题策划', '资深撰稿人', '技术审核', '文字编辑', '用户体验', '终审官'];
        const tasks = [];
        let startTime = 0;
        
        agents.forEach((agent, index) => {
            const duration = Math.floor(Math.random() * 10) + 5;
            tasks.push({
                name: agent,
                value: [
                    index,
                    startTime,
                    startTime + duration,
                    Math.floor(Math.random() * 100)
                ]
            });
            startTime += duration;
        });
        
        return tasks;
    },

    // 生成成功率数据
    generateSuccessData() {
        return [
            { value: Math.floor(Math.random() * 50) + 100, name: '成功' },
            { value: Math.floor(Math.random() * 10), name: '失败' }
        ];
    }
};

// 图表配置
const ChartConfigs = {
    // Token 消耗折线图
    tokenChart: {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: '#00d9ff',
            textStyle: { color: '#fff' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: [],
            axisLine: { lineStyle: { color: '#00d9ff' } },
            axisLabel: { color: '#888' }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#00d9ff' } },
            axisLabel: { color: '#888' },
            splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
        },
        series: [{
            name: 'Token 消耗',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            data: [],
            itemStyle: {
                color: '#00d9ff'
            },
            lineStyle: {
                width: 3,
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#00d9ff' },
                    { offset: 1, color: '#00ff88' }
                ])
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(0, 217, 255, 0.3)' },
                    { offset: 1, color: 'rgba(0, 217, 255, 0)' }
                ])
            }
        }]
    },

    // Agent 状态饼图
    statusChart: {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: '#00ff88',
            textStyle: { color: '#fff' }
        },
        legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            textStyle: { color: '#888' }
        },
        series: [{
            name: 'Agent 状态',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#1a1a2e',
                borderWidth: 2
            },
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#fff'
                }
            },
            labelLine: {
                show: false
            },
            data: []
        }]
    },

    // 成本对比柱状图
    costChart: {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: '#00ff88',
            textStyle: { color: '#fff' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: [],
            axisLine: { lineStyle: { color: '#00ff88' } },
            axisLabel: { 
                color: '#888',
                rotate: 30
            }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#00ff88' } },
            axisLabel: { color: '#888' },
            splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
        },
        series: [{
            name: '成本',
            type: 'bar',
            barWidth: '60%',
            data: [],
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#00ff88' },
                    { offset: 1, color: '#00d9ff' }
                ]),
                borderRadius: [5, 5, 0, 0]
            }
        }]
    },

    // 成功率饼图
    successChart: {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: '#ff6b6b',
            textStyle: { color: '#fff' }
        },
        series: [{
            name: '任务成功率',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#1a1a2e',
                borderWidth: 2
            },
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#fff'
                }
            },
            labelLine: {
                show: false
            },
            data: []
        }]
    },

    // 甘特图
    ganttChart: {
        backgroundColor: 'transparent',
        tooltip: {
            formatter: function (params) {
                return params.name + '<br/>耗时：' + (params.value[2] - params.value[1]) + '分钟';
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: '#00d9ff',
            textStyle: { color: '#fff' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: '时间 (分钟)',
            axisLine: { lineStyle: { color: '#00d9ff' } },
            axisLabel: { color: '#888' },
            splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
        },
        yAxis: {
            type: 'category',
            data: ['总编辑', '选题策划', '资深撰稿人', '技术审核', '文字编辑', '用户体验', '终审官'],
            axisLine: { lineStyle: { color: '#00d9ff' } },
            axisLabel: { color: '#888' }
        },
        series: [{
            type: 'custom',
            renderItem: function (params, api) {
                const categoryIndex = api.value(0);
                const start = api.coord([api.value(1), categoryIndex]);
                const end = api.coord([api.value(2), categoryIndex]);
                const height = api.size([0, 1])[1] * 0.6;
                
                return {
                    type: 'rect',
                    shape: {
                        x: start[0],
                        y: start[1] - height / 2,
                        width: end[0] - start[0],
                        height: height
                    },
                    style: {
                        fill: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                            { offset: 0, color: '#00d9ff' },
                            { offset: 1, color: '#00ff88' }
                        ])
                    }
                };
            },
            data: [],
            itemStyle: {
                borderRadius: 5
            }
        }]
    }
};

// 图表实例管理
const charts = {};

// 初始化所有图表
function initCharts() {
    // Token 消耗图表
    charts.token = echarts.init(document.getElementById('token-chart'));
    charts.token.setOption(ChartConfigs.tokenChart);

    // Agent 状态图表
    charts.status = echarts.init(document.getElementById('status-chart'));
    charts.status.setOption(ChartConfigs.statusChart);

    // 成本对比图表
    charts.cost = echarts.init(document.getElementById('cost-chart'));
    charts.cost.setOption(ChartConfigs.costChart);

    // 成功率图表
    charts.success = echarts.init(document.getElementById('success-chart'));
    charts.success.setOption(ChartConfigs.successChart);

    // 甘特图
    charts.gantt = echarts.init(document.getElementById('gantt-chart'));
    charts.gantt.setOption(ChartConfigs.ganttChart);

    // 响应式适配
    window.addEventListener('resize', () => {
        Object.values(charts).forEach(chart => chart.resize());
    });
}

// 更新图表数据
function updateCharts() {
    // 更新 Token 消耗
    const tokenData = DataGenerator.generateTokenData();
    charts.token.setOption({
        xAxis: { data: tokenData.map(item => item.name) },
        series: [{ data: tokenData.map(item => item.value) }]
    });

    // 更新 Agent 状态
    const statusData = DataGenerator.generateStatusData();
    charts.status.setOption({
        series: [{
            data: statusData,
            color: ['#00d9ff', '#00ff88', '#ff6b6b']
        }]
    });

    // 更新成本对比
    const costData = DataGenerator.generateCostData();
    charts.cost.setOption({
        xAxis: { data: costData.map(item => item.name) },
        series: [{ data: costData.map(item => item.value) }]
    });

    // 更新成功率
    const successData = DataGenerator.generateSuccessData();
    charts.success.setOption({
        series: [{
            data: successData,
            color: ['#00ff88', '#ff6b6b']
        }]
    });

    // 更新甘特图
    const ganttData = DataGenerator.generateGanttData();
    charts.gantt.setOption({
        series: [{ data: ganttData }]
    });

    // 更新统计数字
    updateStats();

    // 更新时间戳
    document.getElementById('last-update').textContent = new Date().toLocaleTimeString('zh-CN');
}

// 更新统计数据
function updateStats() {
    const runningAgents = Math.floor(Math.random() * 3) + 1;
    const completedTasks = Math.floor(Math.random() * 50) + 150;
    const totalTokens = (Math.random() * 10 + 20).toFixed(1);

    document.getElementById('running-agents').textContent = runningAgents;
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('total-tokens').textContent = totalTokens + 'K';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    updateCharts();

    // 每 5 秒自动刷新
    setInterval(updateCharts, 5000);
});

// 导出供外部调用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initCharts, updateCharts, charts, DataGenerator, ChartConfigs };
}
