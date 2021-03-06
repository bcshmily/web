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
var defaultStartTime = "2021/01/01";

function getGraphStartTime() {
    if ($("#btn3MonthData").prop("disabled") === true) {
        var date = new Date();
        date.setMonth(date.getMonth() - 3);
        var str = date.getFullYear() + "/" + (date.getMonth() + 1) + "/01";;
        console.log(str);
        return str;
    }
    return defaultStartTime;
}

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
    defaultStartTime = graphInfo.startTime;
    var startTime = getGraphStartTime();    
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
                                label = label + ": ???";
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
            text: '??????????????????',
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

        // ?????????????????????
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
        // ????????????
        series: [{
            name: '??????',
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
            name: '???/?????????',
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
                // ??????
        }]
    };
    var myChart = com_charts[divId];
    if (myChart) {
        myChart.dispose();
        myChart = null;
    }
    // ?????????echarts??????
    myChart = echarts.init(document.getElementById(divId));
    // dispose
    // ?????????????????????????????????????????????
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
            text: '??????????????????',
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

        // ?????????????????????
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
        // ????????????
        series: [{
            name: '??????',
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
                // ??????
        }]
    };
    var worldChart = com_charts[divId];
    if (worldChart) {
        worldChart.dispose();
        worldChart = null;
    }
    // ?????????echarts??????
    worldChart = echarts.init(document.getElementById(divId));
    // dispose
    // ?????????????????????????????????????????????
    worldChart.setOption(optionMap);
    com_charts[divId] = worldChart;
}

function getWorldNameMap() {
    // ???????????????????????????
    var nameMap = {
        'Canada': '?????????',
        'Russia': '?????????',
        'China': '??????',
        'United States': '??????',
        'Singapore Rep.': '?????????',
        'Dominican Rep.': '????????????',
        'Palestine': '????????????',
        'Bahamas': '?????????',
        'Timor-Leste': '?????????',
        'Afghanistan': '?????????',
        'Guinea-Bissau': '???????????????',
        "C??ted'Ivoire": '????????????',
        'Siachen Glacier': '???????????????',
        "Br. Indian Ocean Ter.": '?????????????????????',
        'Angola': '?????????',
        'Albania': '???????????????',
        'United Arab Emirates': '?????????',
        'Argentina': '?????????',
        'Armenia': '????????????',
        'French Southern and Antarctic Lands': '??????????????????????????????',
        'Australia': '????????????',
        'Austria': '?????????',
        'Azerbaijan': '????????????',
        'Burundi': '?????????',
        'Belgium': '?????????',
        'Benin': '??????',
        'Burkina Faso': '???????????????',
        'Bangladesh': '????????????',
        'Bulgaria': '????????????',
        'The Bahamas': '?????????',
        'Bosnia and Herz.': '??????????????????????????????',
        'Belarus': '????????????',
        'Belize': '?????????',
        'Bermuda': '?????????',
        'Bolivia': '????????????',
        'Brazil': '??????',
        'Brunei': '??????',
        'Bhutan': '??????',
        'Botswana': '????????????',
        'Central African Rep.': '??????',
        'Switzerland': '??????',
        'Chile': '??????',
        'Ivory Coast': '????????????',
        'Cameroon': '?????????',
        'Dem. Rep. Congo': '?????????????????????',
        'Congo': '??????',
        'Colombia': '????????????',
        'Costa Rica': '???????????????',
        'Cuba': '??????',
        'N. Cyprus': '???????????????',
        'Cyprus': '????????????',
        'Czech Rep.': '??????',
        'Germany': '??????',
        'Djibouti': '?????????',
        'Denmark': '??????',
        'Algeria': '???????????????',
        'Ecuador': '????????????',
        'Egypt': '??????',
        'Eritrea': '???????????????',
        'Spain': '?????????',
        'Estonia': '????????????',
        'Ethiopia': '???????????????',
        'Finland': '??????',
        'Fiji': '???',
        'Falkland Islands': '???????????????',
        'France': '??????',
        'Gabon': '??????',
        'United Kingdom': '??????',
        'Georgia': '????????????',
        'Ghana': '??????',
        'Guinea': '?????????',
        'Gambia': '?????????',
        'Guinea Bissau': '???????????????',
        'Eq. Guinea': '???????????????',
        'Greece': '??????',
        'Greenland': '?????????',
        'Guatemala': '????????????',
        'French Guiana': '???????????????',
        'Guyana': '?????????',
        'Honduras': '????????????',
        'Croatia': '????????????',
        'Haiti': '??????',
        'Hungary': '?????????',
        'Indonesia': '???????????????',
        'India': '??????',
        'Ireland': '?????????',
        'Iran': '??????',
        'Iraq': '?????????',
        'Iceland': '??????',
        'Israel': '?????????',
        'Italy': '?????????',
        'Jamaica': '?????????',
        'Jordan': '??????',
        'Japan': '??????',
        'Kazakhstan': '???????????????',
        'Kenya': '?????????',
        'Kyrgyzstan': '??????????????????',
        'Cambodia': '?????????',
        'Korea': '??????',
        'Kosovo': '?????????',
        'Kuwait': '?????????',
        'Lao PDR': '??????',
        'Lebanon': '?????????',
        'Liberia': '????????????',
        'Libya': '?????????',
        'Sri Lanka': '????????????',
        'Lesotho': '?????????',
        'Lithuania': '?????????',
        'Luxembourg': '?????????',
        'Latvia': '????????????',
        'Morocco': '?????????',
        'Moldova': '????????????',
        'Madagascar': '???????????????',
        'Mexico': '?????????',
        'Macedonia': '?????????',
        'Mali': '??????',
        'Myanmar': '??????',
        'Montenegro': '??????',
        'Mongolia': '??????',
        'Mozambique': '????????????',
        'Mauritania': '???????????????',
        'Malawi': '?????????',
        'Malaysia': '????????????',
        'Namibia': '????????????',
        'New Caledonia': '??????????????????',
        'Niger': '?????????',
        'Nigeria': '????????????',
        'Nicaragua': '????????????',
        'Netherlands': '??????',
        'Norway': '??????',
        'Nepal': '?????????',
        'New Zealand': '?????????',
        'Oman': '??????',
        'Pakistan': '????????????',
        'Panama': '?????????',
        'Peru': '??????',
        'Philippines': '?????????',
        'Papua New Guinea': '?????????????????????',
        'Poland': '??????',
        'Puerto Rico': '????????????',
        'Dem. Rep. Korea': '??????',
        'Portugal': '?????????',
        'Paraguay': '?????????',
        'Qatar': '?????????',
        'Romania': '????????????',
        'Rwanda': '?????????',
        'W. Sahara': '????????????',
        'Saudi Arabia': '???????????????',
        'Sudan': '??????',
        'S. Sudan': '?????????',
        'Senegal': '????????????',
        'Solomon Is.': '???????????????',
        'Sierra Leone': '????????????',
        'El Salvador': '????????????',
        'Somaliland': '????????????',
        'Somalia': '?????????',
        'Serbia': '????????????',
        'Suriname': '?????????',
        'Slovakia': '????????????',
        'Slovenia': '???????????????',
        'Sweden': '??????',
        'Swaziland': '????????????',
        'Syria': '?????????',
        'Chad': '??????',
        'Togo': '??????',
        'Thailand': '??????',
        'Tajikistan': '???????????????',
        'Turkmenistan': '???????????????',
        'East Timor': '?????????',
        'Trinidad and Tobago': '????????????????????????',
        'Tunisia': '?????????',
        'Turkey': '?????????',
        'Tanzania': '????????????',
        'Uganda': '?????????',
        'Ukraine': '?????????',
        'Uruguay': '?????????',
        'Uzbekistan': '??????????????????',
        'Venezuela': '????????????',
        'Vietnam': '??????',
        'Vanuatu': '????????????',
        'West Bank': '??????',
        'Yemen': '??????',
        'South Africa': '??????',
        'Zambia': '?????????',
        'Zimbabwe': '????????????'
    };
    return nameMap;
}

var inside_flg = "0";
var all_data_flg = "1";
// ---------------------------------------------------------------------------------------
// ??????json??????
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
        //		all_data_flg = "1";
        //		updateChart(true);
        $("#btnAllData").prop("disabled", true);
        $("#btn3MonthData").prop("disabled", false);
        resetStartTime("1");
    });
    $("#btn3MonthData").click(function() {
        //		all_data_flg = "0";
        //		updateChart(true);
        $("#btnAllData").prop("disabled", false);
        $("#btn3MonthData").prop("disabled", true);
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
                chart.options.scales.xAxes[0].ticks.min = getGraphStartTime();
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
            $("#graphDesc").text("??????????????????");
        },
        complete: function() {

        }
    });
}

var lastSelectInsideArea = '??????';
var lastSelectOutsideArea = '??????';

function updateChart(buttonClick) {
    $("#graphDesc").text("???????????????...");
    $("#btnUpdate").prop("disabled", true);
    var count = 0;
    var requestCount = 0;
    var lastUpdateTimeNew = "";
    var endFun = function() {
        count++;
        if (requestCount == count) {
            $("#graphDesc").text("??????????????? :" + lastUpdateTimeNew);
            $("#btnUpdate").prop("disabled", false);
            if (!buttonClick) {
                setTimeout(updateChart, 300000);
            }
        } else {
            $("#graphDesc").text("??????????????? :" + count + "/" + requestCount);
        }
    };
    var resetAreaDropDown = function(subAreaList) {
        $("#selAreaList").empty();
        $.each(subAreaList, function(index, value) {
            if (value != '??????') {
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

        // ????????????????????????(??????
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

    // ????????????
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
    // ??????/?????????????????????(????????????????????????)
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

    // ????????????????????????(??????)
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
    // ????????????????????????(??????
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