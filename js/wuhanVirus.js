Chart.defaults.global.animation.duration = 0;
Chart.defaults.global.defaultFontColor = '#000';
Chart.defaults.global.defaultFontFamily = 'SimSun';
Chart.defaults.global.title.fontStyle = 'normal';
Chart.defaults.global.title.fontSize = 30;
var timeFormat = 'YYYY/MM/DD HH:mm';
var displayFormat = 'MM/DD HH';

var com_charts = {};

Chart.pluginService.register({
    beforeDraw: function(chart) {
        var ctx = chart.chart.ctx;
        var xaxis = chart.scales['x-axis-0'];
        var yaxis = chart.scales['y-axis-0'];
        var chartArea = chart.chartArea;
        var lastUpdateTime = chart.config.lastUpdateTime;
        var x1 = xaxis.getPixelForValue(lastUpdateTime);
        x1 += 3;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x1, yaxis.top);
        ctx.strokeStyle = 'rgb(255, 0, 0, 0.2)';
        ctx.lineWidth = 3;
        ctx.lineTo(x1, yaxis.bottom);
        ctx.stroke();

        ctx.font = "20px Arial";
        ctx.fillStyle = 'red';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(lastUpdateTime, x1, yaxis.bottom + 30);

        ctx.restore();
    }
});

function createWuhanGraph(id, graphInfo, graphType) {
    var chart = com_charts[id];
    if (chart) {
        chart.destroy();
        chart = null;
    }
    if (typeof(graphType) == 'undefined') {
        graphType = 'line';
    }
    var legendId = id + "Legend";
    var chartDataset = [];
    var datasets = graphInfo.datasets;
    var rightYaxisDisplay = false;
    for (var i = 0; i < datasets.length; i++) {
        var yAxisID = '';
        if (typeof(datasets[i].yAxisIndex) == 'undefined') {
            datasets[i].yAxisIndex = 0;
            yAxisID = 'y-axis-0';
        } else {
            yAxisID = 'y-axis-' + datasets[i].yAxisIndex;
            if (datasets[i].yAxisIndex != '0') {
                rightYaxisDisplay = true;
            }
        }
        var dataList = datasets[i].data;
        var dataset = {
            type: graphType,
            label: datasets[i].label,
            unit: datasets[i].unit,
            borderColor: datasets[i].color,
            backgroundColor: datasets[i].color,
            borderWidth: datasets[i].borderWidth,
            fill: false,
            yAxisID: yAxisID,
            yAxisIndex: datasets[i].yAxisIndex,
            steppedLine: 'before',
            data: dataList,
            hidden: !datasets[i].show
        };
        chartDataset.push(dataset);
    }
    var startTime = graphInfo.startTime;
    if ($("#btn3MonthData").prop("disabled") == false) {

    }
    var config = {
        lastUpdateTime: graphInfo.lastUpdateTime,
        type: 'line',
        data: {
            datasets: chartDataset
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: graphInfo.title
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            legend: {
                display: true,
                position: 'right',
                // position : 'bottom',
                labels: {
                    boxWidth: 20,
                    generateLabels: function(chart) {
                        var labels = [];
                        var maxIndex = 0;
                        var lastUpdateTime = chart.config.lastUpdateTime;
                        for (var i = 0; i < chart.data.datasets.length; i++) {
                            var dataset = chart.data.datasets[i];
                            var datas = dataset.data;
                            var lastData = datas[datas.length - 1];
                            var val = '';
                            var label = dataset.label;
                            if (label.length > 5) {
                                label = label.substring(0, 5);
                            }
                            if (lastData != null && typeof(lastData.y) != 'undefined' && lastData.y != null && lastData.x == lastUpdateTime) {
                                val = lastData.y;
                                // label = "No." + (i + 1) + " " + label + ":" +
                                // val + ' ' + dataset.unit
                                label = label + ":" + val + ' ' + dataset.unit
                            } else {
                                label = label + ": 无";
                            }
                            labels.push({
                                text: label,
                                fillStyle: dataset.backgroundColor,
                                hidden: !chart.isDatasetVisible(i),
                                lineCap: dataset.borderCapStyle,
                                lineDash: dataset.borderDash,
                                lineDashOffset: dataset.borderDashOffset,
                                lineJoin: dataset.borderJoinStyle,
                                lineWidth: dataset.borderWidth,
                                strokeStyle: dataset.borderColor,
                                pointStyle: dataset.pointStyle,
                                datasetIndex: i,
                                // hidden : !datasets[i].show
                            });
                        }
                        return labels;
                    }
                },
                onClick: function(e, legendItem) {
                    var index = legendItem.datasetIndex;
                    var ci = this.chart;
                    var meta = ci.getDatasetMeta(index);

                    // See controller.isDatasetVisible comment
                    meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;

                    // We hid a dataset ... rerender the chart
                    ci.update();
                }
            },
            elements: {
                line: {
                    borderWidth: 2
                },
                point: {
                    radius: 0,
                    hoverRadius: 2
                }
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        parser: timeFormat,
                        stepSize: 20160,
                        unit: 'minute',
                        tooltipFormat: timeFormat,
                        displayFormats: {
                            minute: displayFormat
                        }
                    },
                    scaleLabel: {
                        display: true,
                    },
                    ticks: {
                        min: startTime,
                        minInit: graphInfo.startTime,
                        max: graphInfo.endTime,
                        padding: 5,
                        callback: function(dataLabel, index) {
                            if (dataLabel.indexOf(" 00") != -1) {
                                return dataLabel.substr(0, 5);
                            } else if (index == 0) {
                                return dataLabel;
                            }
                            return "";
                        }
                    },
                    gridLines: {
                        display: true,
                        drawBorder: false,
                        drawOnChartArea: false,
                        drawTicks: true,
                        lineWidth: 1,
                        color: '#DEDEE3'
                    }
                }],
                yAxes: [{
                    min: 0,
                    position: "left",
                    type: 'logarithmic',
                    gridLines: {
                        display: true,
                        drawBorder: true,
                        drawOnChartArea: true,
                        lineWidth: 0.5
                    },
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            return value;
                        }
                    }
                }, {
                    display: rightYaxisDisplay,
                    min: 0,
                    position: "right",
                    gridLines: {
                        display: false,
                        drawBorder: true,
                        drawOnChartArea: false
                    }
                }]
            },
        }
    };
    config.options.tooltips = {
        enabled: true,
        // mode : 'index',
        position: 'nearest',
        intersect: false,
        displayColors: false,
        titleAlign: 'center',
        bodyAlign: 'center',
        titleFontColor: '#000',
        titleFontFamily: 'SimSun',
        titleFontSize: 12,
        titleFontStyle: 'normal',
        backgroundColor: 'white',
        borderColor: 'black',
        borderWidth: 1,
        callbacks: {
            label: function(tooltipItem, data) {
                // console.log(tooltipItem.xLabel);
                var dataItem = data.datasets[tooltipItem.datasetIndex];
                var value = dataItem.data[tooltipItem.index].y;
                return '-   ' + dataItem.label + ':' + Math.round(value * 100) / 100 + '   -';
            },
            labelTextColor: function(tooltipItem, chart) {
                var meta = chart.getDatasetMeta(tooltipItem.datasetIndex);
                var activeElement = meta.data[tooltipItem.index];
                var view = activeElement._view;
                return view.backgroundColor;
            },
        }
    };

    var ctx = document.getElementById(id).getContext('2d');
    chart = new Chart(ctx, config);
    com_charts[id] = chart;
}

function showVirusMap(virusMapData, divId) {
    var areaData = [];
    var cityData = [];
    $.each(virusMapData['china'], function(key, val) {
        areaData.push({
            'name': key,
            'value': val
        });
    });
    $.each(virusMapData['china_city'], function(key, val) {
        cityData.push({
            'name': key,
            'value': val
        });
    });
    var geoCoordMap = getCityGeoCoordMap();
    var convertData = function(data) {
        var res = [];
        for (var i = 0; i < data.length; i++) {
            var geoCoord = geoCoordMap[data[i].name];
            if (geoCoord) {
                res.push({
                    name: data[i].name,
                    value: geoCoord.concat(data[i].value)
                });
            }
        }
        return res;
    };
    var optionMap = {
        // aria : {
        // show : true
        // },
        backgroundColor: '#FFFFFF',
        title: {
            text: '国内疫情地图',
            subtext: '',
            x: 'center',
            textStyle: {
                fontFamily: 'SimSun',
                fontStyle: 'normal',
                fontWeight: 'normal',
                fontSize: 30
            }
        },
        tooltip: {
            trigger: 'item'
        },

        // 左侧小导航图标
        visualMap: {
            show: true,
            x: 'right',
            y: 'center',
            splitList: [{
                start: 10000,
                color: 'RGB(174, 0, 0)'
            }, {
                start: 1000,
                end: 10000,
                color: 'RGB(220, 0, 0)'
            }, {
                start: 300,
                end: 1000,
                color: 'RGB(255, 45, 45)'
            }, {
                start: 100,
                end: 300,
                color: 'RGB(255, 81, 81)'
            }, {
                start: 50,
                end: 100,
                color: 'RGB(255, 117, 117)'
            }, {
                start: 20,
                end: 50,
                color: 'RGB(255, 160, 160)'
            }, {
                start: 5,
                end: 20,
                color: 'RGB(255, 200, 200)'
            }, {
                start: 0,
                end: 5,
                color: 'RGB(251, 227, 15)'
            }, {
                start: 0,
                end: 0,
                color: '#EEEEEE'
            }]
        },
        geo: {
            map: 'china',
            roam: false,
            selectedMode: 'single',
            zoom: 1,
            label: {
                normal: {
                    show: true,
                    textStyle: {
                        color: 'rgba(0, 0, 0)'
                    }
                },
                emphasis: {
                    color: 'rgba(0, 0, 0)'
                }
            },
            itemStyle: {
                normal: {
                    borderColor: 'rgba(0, 0, 0, 0.2)'
                },
                emphasis: {
                    color: 'rgb(0, 0, 0)',
                    areaColor: 'rgb(153, 217, 234)',
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    shadowBlur: 20,
                    borderWidth: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        },
        // 配置属性
        series: [{
            name: '城市',
            type: 'scatter',
            coordinateSystem: 'geo',
            data: convertData(cityData),
            symbol: 'circle',
            symbolSize: function(val) {
                if (val[2] != null && val[2] > 0) {
                    if (val[2] > 5000) {
                        return 11;
                    } else if (val[2] > 1000) {
                        return 10;
                    } else if (val[2] > 500) {
                        return 9;
                    } else if (val[2] > 200) {
                        return 8;
                    } else if (val[2] > 50) {
                        return 7;
                    } else if (val[2] > 20) {
                        return 6;
                    } else {
                        return 5;
                    }
                }
                return 0;
            },
            tooltip: {
                formatter: function(params) {
                    var name = params['name'];
                    var value = params['value'];
                    if (value) {
                        return name + ':' + value[2];
                    }
                }
            },
            label: {
                normal: {
                    formatter: '{b}',
                    position: 'right',
                    show: false
                },
                emphasis: {
                    show: false
                }
            },
            itemStyle: {
                normal: {
                    color: '#ddb926',
                    borderColor: '#0000FF'
                }
            }
        }, {
            name: '省/直辖市',
            type: 'map',
            geoIndex: 0,
            tooltip: {
                formatter: function(params) {
                    var name = params['name'];
                    var value = params['value'];
                    if (value) {
                        return name + ':' + value;
                    }
                }
            },
            data: areaData
                // 数据
        }]
    };
    var myChart = com_charts[divId];
    if (myChart) {
        myChart.dispose();
        myChart = null;
    }
    // 初始化echarts实例
    myChart = echarts.init(document.getElementById(divId));
    // dispose
    // 使用制定的配置项和数据显示图表
    myChart.setOption(optionMap);
    com_charts[divId] = myChart;
}

function showWorldVirusMap(virusMapData, divId) {
    var worldData = [];
    $.each(virusMapData['world'], function(key, val) {
        worldData.push({
            'name': key,
            'value': val
        });
    });

    var optionMap = {
        // aria : {
        // show : true
        // },
        backgroundColor: '#FFFFFF',
        title: {
            text: '世界疫情地图',
            subtext: '',
            x: 'center',
            textStyle: {
                fontFamily: 'SimSun',
                fontStyle: 'normal',
                fontWeight: 'normal',
                fontSize: 30
            }
        },
        tooltip: {
            trigger: 'item'
        },

        // 左侧小导航图标
        visualMap: {
            show: true,
            x: 'right',
            y: 'center',
            splitList: [{
                start: 100000,
                color: 'RGB(20, 0, 0)'
            }, {
                start: 50000,
                end: 100000,
                color: 'RGB(80, 0, 0)'
            }, {
                start: 10000,
                end: 50000,
                color: 'RGB(140, 0, 0)'
            }, {
                start: 5000,
                end: 10000,
                color: 'RGB(180, 0, 0)'
            }, {
                start: 1000,
                end: 5000,
                color: 'RGB(220, 0, 0)'
            }, {
                start: 300,
                end: 1000,
                color: 'RGB(255, 0, 0)'
            }, {
                start: 100,
                end: 300,
                color: 'RGB(255, 40, 40)'
            }, {
                start: 50,
                end: 100,
                color: 'RGB(255, 80, 80)'
            }, {
                start: 20,
                end: 50,
                color: 'RGB(255, 120, 120)'
            }, {
                start: 10,
                end: 20,
                color: 'RGB(255, 160, 160)'
            }, {
                start: 5,
                end: 10,
                color: 'RGB(255, 200, 200)'
            }, {
                start: 0,
                end: 5,
                color: 'RGB(251, 227, 15)'
            }, {
                start: 0,
                end: 0,
                color: '#EEEEEE'
            }]
        },
        geo: {
            map: 'world',
            // center: [115.97, 29.71],
            selectedMode: 'single',
            roam: false,
            nameMap: getWorldNameMap(),
            zoom: 1,
            label: {
                normal: {
                    show: false,
                    textStyle: {
                        color: 'rgba(0, 0, 0)'
                    }
                },
                emphasis: {
                    color: 'rgba(0, 0, 0)'
                }
            },
            itemStyle: {
                normal: {
                    borderColor: 'rgba(0, 0, 0, 0.2)'
                },
                emphasis: {
                    color: 'rgb(0, 0, 0)',
                    areaColor: 'rgb(153, 217, 234)',
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    shadowBlur: 20,
                    borderWidth: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        },
        // 配置属性
        series: [{
            name: '世界',
            type: 'map',
            geoIndex: 0,
            tooltip: {
                formatter: function(params) {
                    var name = params['name'];
                    var value = params['value'];
                    if (value) {
                        return name + ':' + value;
                    }
                }
            },
            data: worldData
                // 数据
        }]
    };
    var worldChart = com_charts[divId];
    if (worldChart) {
        worldChart.dispose();
        worldChart = null;
    }
    // 初始化echarts实例
    worldChart = echarts.init(document.getElementById(divId));
    // dispose
    // 使用制定的配置项和数据显示图表
    worldChart.setOption(optionMap);
    com_charts[divId] = worldChart;
}

function getWorldNameMap() {
    // 国家名英文中文对比
    var nameMap = {
        'Canada': '加拿大',
        'Russia': '俄罗斯',
        'China': '中国',
        'United States': '美国',
        'Singapore Rep.': '新加坡',
        'Dominican Rep.': '多米尼加',
        'Palestine': '巴勒斯坦',
        'Bahamas': '巴哈马',
        'Timor-Leste': '东帝汶',
        'Afghanistan': '阿富汗',
        'Guinea-Bissau': '几内亚比绍',
        "Côted'Ivoire": '科特迪瓦',
        'Siachen Glacier': '锡亚琴冰川',
        "Br. Indian Ocean Ter.": '英属印度洋领土',
        'Angola': '安哥拉',
        'Albania': '阿尔巴尼亚',
        'United Arab Emirates': '阿联酋',
        'Argentina': '阿根廷',
        'Armenia': '亚美尼亚',
        'French Southern and Antarctic Lands': '法属南半球和南极领地',
        'Australia': '澳大利亚',
        'Austria': '奥地利',
        'Azerbaijan': '阿塞拜疆',
        'Burundi': '布隆迪',
        'Belgium': '比利时',
        'Benin': '贝宁',
        'Burkina Faso': '布基纳法索',
        'Bangladesh': '孟加拉国',
        'Bulgaria': '保加利亚',
        'The Bahamas': '巴哈马',
        'Bosnia and Herz.': '波斯尼亚和黑塞哥维那',
        'Belarus': '白俄罗斯',
        'Belize': '伯利兹',
        'Bermuda': '百慕大',
        'Bolivia': '玻利维亚',
        'Brazil': '巴西',
        'Brunei': '文莱',
        'Bhutan': '不丹',
        'Botswana': '博茨瓦纳',
        'Central African Rep.': '中非',
        'Switzerland': '瑞士',
        'Chile': '智利',
        'Ivory Coast': '象牙海岸',
        'Cameroon': '喀麦隆',
        'Dem. Rep. Congo': '刚果民主共和国',
        'Congo': '刚果',
        'Colombia': '哥伦比亚',
        'Costa Rica': '哥斯达黎加',
        'Cuba': '古巴',
        'N. Cyprus': '北塞浦路斯',
        'Cyprus': '塞浦路斯',
        'Czech Rep.': '捷克',
        'Germany': '德国',
        'Djibouti': '吉布提',
        'Denmark': '丹麦',
        'Algeria': '阿尔及利亚',
        'Ecuador': '厄瓜多尔',
        'Egypt': '埃及',
        'Eritrea': '厄立特里亚',
        'Spain': '西班牙',
        'Estonia': '爱沙尼亚',
        'Ethiopia': '埃塞俄比亚',
        'Finland': '芬兰',
        'Fiji': '斐',
        'Falkland Islands': '福克兰群岛',
        'France': '法国',
        'Gabon': '加蓬',
        'United Kingdom': '英国',
        'Georgia': '格鲁吉亚',
        'Ghana': '加纳',
        'Guinea': '几内亚',
        'Gambia': '冈比亚',
        'Guinea Bissau': '几内亚比绍',
        'Eq. Guinea': '赤道几内亚',
        'Greece': '希腊',
        'Greenland': '格陵兰',
        'Guatemala': '危地马拉',
        'French Guiana': '法属圭亚那',
        'Guyana': '圭亚那',
        'Honduras': '洪都拉斯',
        'Croatia': '克罗地亚',
        'Haiti': '海地',
        'Hungary': '匈牙利',
        'Indonesia': '印度尼西亚',
        'India': '印度',
        'Ireland': '爱尔兰',
        'Iran': '伊朗',
        'Iraq': '伊拉克',
        'Iceland': '冰岛',
        'Israel': '以色列',
        'Italy': '意大利',
        'Jamaica': '牙买加',
        'Jordan': '约旦',
        'Japan': '日本',
        'Kazakhstan': '哈萨克斯坦',
        'Kenya': '肯尼亚',
        'Kyrgyzstan': '吉尔吉斯斯坦',
        'Cambodia': '柬埔寨',
        'Korea': '韩国',
        'Kosovo': '科索沃',
        'Kuwait': '科威特',
        'Lao PDR': '老挝',
        'Lebanon': '黎巴嫩',
        'Liberia': '利比里亚',
        'Libya': '利比亚',
        'Sri Lanka': '斯里兰卡',
        'Lesotho': '莱索托',
        'Lithuania': '立陶宛',
        'Luxembourg': '卢森堡',
        'Latvia': '拉脱维亚',
        'Morocco': '摩洛哥',
        'Moldova': '摩尔多瓦',
        'Madagascar': '马达加斯加',
        'Mexico': '墨西哥',
        'Macedonia': '马其顿',
        'Mali': '马里',
        'Myanmar': '缅甸',
        'Montenegro': '黑山',
        'Mongolia': '蒙古',
        'Mozambique': '莫桑比克',
        'Mauritania': '毛里塔尼亚',
        'Malawi': '马拉维',
        'Malaysia': '马来西亚',
        'Namibia': '纳米比亚',
        'New Caledonia': '新喀里多尼亚',
        'Niger': '尼日尔',
        'Nigeria': '尼日利亚',
        'Nicaragua': '尼加拉瓜',
        'Netherlands': '荷兰',
        'Norway': '挪威',
        'Nepal': '尼泊尔',
        'New Zealand': '新西兰',
        'Oman': '阿曼',
        'Pakistan': '巴基斯坦',
        'Panama': '巴拿马',
        'Peru': '秘鲁',
        'Philippines': '菲律宾',
        'Papua New Guinea': '巴布亚新几内亚',
        'Poland': '波兰',
        'Puerto Rico': '波多黎各',
        'Dem. Rep. Korea': '朝鲜',
        'Portugal': '葡萄牙',
        'Paraguay': '巴拉圭',
        'Qatar': '卡塔尔',
        'Romania': '罗马尼亚',
        'Rwanda': '卢旺达',
        'W. Sahara': '西撒哈拉',
        'Saudi Arabia': '沙特阿拉伯',
        'Sudan': '苏丹',
        'S. Sudan': '南苏丹',
        'Senegal': '塞内加尔',
        'Solomon Is.': '所罗门群岛',
        'Sierra Leone': '塞拉利昂',
        'El Salvador': '萨尔瓦多',
        'Somaliland': '索马里兰',
        'Somalia': '索马里',
        'Serbia': '塞尔维亚',
        'Suriname': '苏里南',
        'Slovakia': '斯洛伐克',
        'Slovenia': '斯洛文尼亚',
        'Sweden': '瑞典',
        'Swaziland': '斯威士兰',
        'Syria': '叙利亚',
        'Chad': '乍得',
        'Togo': '多哥',
        'Thailand': '泰国',
        'Tajikistan': '塔吉克斯坦',
        'Turkmenistan': '土库曼斯坦',
        'East Timor': '东帝汶',
        'Trinidad and Tobago': '特里尼达和多巴哥',
        'Tunisia': '突尼斯',
        'Turkey': '土耳其',
        'Tanzania': '坦桑尼亚',
        'Uganda': '乌干达',
        'Ukraine': '乌克兰',
        'Uruguay': '乌拉圭',
        'Uzbekistan': '乌兹别克斯坦',
        'Venezuela': '委内瑞拉',
        'Vietnam': '越南',
        'Vanuatu': '瓦努阿图',
        'West Bank': '西岸',
        'Yemen': '也门',
        'South Africa': '南非',
        'Zambia': '赞比亚',
        'Zimbabwe': '津巴布韦'
    };
    return nameMap;
}

var inside_flg = "0";
var all_data_flg = "1";
// ---------------------------------------------------------------------------------------
// 提交json数据
$(document).ready(function() {
    inside_flg = "0";
    all_data_flg = "1";

    updateChart();
    $("#btnToInside").click(function() {
        $("#btnToInside").prop("disabled", true);
        $("#btnToOutside").prop("disabled", false);
        inside_flg = "0";
        // $("#selAreaDiv").show();
        updateChart(true);
    });
    $("#btnToOutside").click(function() {
        $("#btnToInside").prop("disabled", false);
        $("#btnToOutside").prop("disabled", true);
        inside_flg = "1";
        // $("#selAreaDiv").hide();
        updateChart(true);
    });

    // all_data_flg
    $("#btnAllData").click(function() {
        $("#btnAllData").prop("disabled", true);
        $("#btn3MonthData").prop("disabled", false);
        //		all_data_flg = "1";
        //		updateChart(true);
        resetStartTime("1");
    });
    $("#btn3MonthData").click(function() {
        $("#btnAllData").prop("disabled", false);
        $("#btn3MonthData").prop("disabled", true);
        //		all_data_flg = "0";
        //		updateChart(true);
        resetStartTime("0");
    });
});

function resetStartTime(flg) {
    $.each(com_charts, function(id, chart) {
        if (id.indexOf("graph") == 0) {
            if (flg == "1") {
                if (chart.options.scales.xAxes[0].ticks.minInit != chart.options.scales.xAxes[0].ticks.min) {
                    chart.options.scales.xAxes[0].ticks.min = chart.options.scales.xAxes[0].ticks.minInit;
                    chart.update();
                }
            } else {
                chart.options.scales.xAxes[0].ticks.min = "2021/09/01";
                chart.update();
            }
        }
    });
}
var lastUpdateTime = "";

function destroyChart() {
    com_charts["graph1"].destroy();
    com_charts["graph2"].destroy();
    com_charts["graph3"].destroy();
    com_charts["graph4"].destroy();
    com_charts["mainMap"].dispose();
    com_charts["worldMap"].dispose();
    lastUpdateTime = null;
}

function ajaxRequest(url, requestData, callBackFun) {
    $.ajax({
        type: "GET",
        url: "datas/" + url,
        timeout: 120000,
        data: {
            t: new Date().getTime()
        },
        dataType: "json",
        success: callBackFun,
        error: function(message) {
            console.error(message);
            $("#btnUpdate").prop("disabled", false);
            $("#graphDesc").text("数据更新失败");
        },
        complete: function() {

        }
    });
}

var lastSelectInsideArea = '辽宁';
var lastSelectOutsideArea = '日本';

function updateChart(buttonClick) {
    $("#graphDesc").text("数据更新中...");
    $("#btnUpdate").prop("disabled", true);
    var count = 0;
    var requestCount = 0;
    var lastUpdateTimeNew = "";
    var endFun = function() {
        count++;
        if (requestCount == count) {
            $("#graphDesc").text("数据更新至 :" + lastUpdateTimeNew);
            $("#btnUpdate").prop("disabled", false);
            if (!buttonClick) {
                setTimeout(updateChart, 300000);
            }
        } else {
            $("#graphDesc").text("数据更新中 :" + count + "/" + requestCount);
        }
    };
    var resetAreaDropDown = function(subAreaList) {
        $("#selAreaList").empty();
        $.each(subAreaList, function(index, value) {
            if (value != '中国') {
                var option = $('<option>').val(value).text(value);
                if (inside_flg == '0') {
                    if (lastSelectInsideArea == value) {
                        option.prop('selected', true);
                    }
                } else {
                    if (lastSelectOutsideArea == value) {
                        option.prop('selected', true);
                    }
                }
                $("#selAreaList").append(option);
            }
        });

        // 新型冠状病毒肺炎(省）
        ajaxRequest("getVirusSubAreaData/" + encodeURIComponent(inside_flg + "_" + $("#selAreaList").find("option:selected").val()) + ".json", {
            area: $("#selAreaList").find("option:selected").val(),
            limit: 30,
            inside: inside_flg,
            allDataFlg: all_data_flg
        }, function(dataMap) {
            var graphInfo = dataMap["graphInfo"];
            createWuhanGraph("graph3", graphInfo);
            endFun();
        });
        requestCount++;
    }

    // 疫情地图
    ajaxRequest("getVirusMapData/" + inside_flg + ".json", {
        inside: inside_flg
    }, function(dataMap) {
        var virusMap = dataMap["virusMap"];
        if (inside_flg == "0") {
            var subAreaList = virusMap["subAreaList"];
            resetAreaDropDown(subAreaList);
            showVirusMap(virusMap, "mainMap");
        } else {
            var subAreaList = virusMap["subAreaList"];
            resetAreaDropDown(subAreaList);
            showWorldVirusMap(virusMap, "mainMap");
        }
        endFun();
    });
    requestCount++;
    // 国内/国外疫情趋势图(在治，确诊等比较)
    ajaxRequest("getVirusSumData/" + inside_flg + ".json", {
        inside: inside_flg,
        allDataFlg: all_data_flg
    }, function(dataMap) {
        var graphInfo = dataMap["graphInfo"];
        createWuhanGraph("graph1", graphInfo, 'line', true);
        lastUpdateTimeNew = graphInfo.lastUpdateTime;
        endFun();
    });
    requestCount++;

    // 新型冠状病毒肺炎(国内)
    ajaxRequest("getVirusAreaData/" + inside_flg + ".json", {
        inside: inside_flg,
        allDataFlg: all_data_flg,
        limit: 50
    }, function(dataMap) {
        var graphInfo = dataMap["graphInfo"];
        createWuhanGraph("graph2", graphInfo);
        lastUpdateTimeNew = graphInfo.lastUpdateTime;
        endFun();
    });
    requestCount++;
}

function updateAreaChart() {
    if (inside_flg == '0') {
        lastSelectInsideArea = $("#selAreaList").find("option:selected").val();
    } else {
        lastSelectOutsideArea = $("#selAreaList").find("option:selected").val();
    }
    // 新型冠状病毒肺炎(省）
    ajaxRequest("getVirusSubAreaData/" + encodeURIComponent(inside_flg + "_" + $("#selAreaList").find("option:selected").val()) + ".json", {
        area: $("#selAreaList").find("option:selected").val(),
        limit: 30,
        inside: inside_flg,
        allDataFlg: all_data_flg
    }, function(dataMap) {
        var graphInfo = dataMap["graphInfo"];
        createWuhanGraph("graph3", graphInfo);
    });
}