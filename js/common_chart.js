Chart.defaults.global.animation.duration = 0;
Chart.defaults.global.defaultFontColor = '#000';
Chart.defaults.global.defaultFontFamily = 'SimSun';
Chart.defaults.global.title.fontStyle = 'normal';
Chart.defaults.global.title.fontSize = 21.28;

var com_charts = {};

Chart.pluginService.register({
	beforeDraw : function(chart, easing) {
		if (chart.config.options.chartArea
				&& chart.config.options.chartArea.backgroundColor) {
			var ctx = chart.chart.ctx;
			var chartArea = chart.chartArea;

			ctx.save();
			ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
			ctx.fillRect(chartArea.left, chartArea.top, chartArea.right
					- chartArea.left, chartArea.bottom - chartArea.top);
			ctx.restore();
		}
	}
});

function com_formatNumber(num, n) {
	var result = parseFloat(num).toFixed(n);
	if (parseFloat(result) == 0) { // -0
		result = parseFloat('0').toFixed(n);
	}
	return result;
}

function com_getSystemDate(timeFormat) {
	if (typeof (timeFormat) == 'undefined') {
		timeFormat = 'YYYY/MM/DD HH:mm';
	}
	return moment().format(timeFormat);
}

function com_getDummyGraphData(sDateStr, dataSize, min, max) {
	var datas = [];
	for (var j = 0; j < dataSize; j++) {
		var x = moment(sDateStr, 'YYYY/MM/DD HH:mm').add(j, 'm').format(
				'YYYY/MM/DD HH:mm');
		var y = com_getRandomValue(min, max);
		if (max == 30 && j == 0) {
			y = "####";
		}
		datas.push({
			'x' : x,
			'y' : y
		});
	}
	return datas;
}

function com_getRandomValue(min, max) {
	var tmpVal = Math.random();
	if (tmpVal < 0.1) {
		return "####";
	} else if (tmpVal < 0.2) {
		return "****";
	}
	return min + Math.random() * (max - min);
}

function com_createGraph(id, datasets, userConfig) {
	var legendId = id + "Legend";
	var chartCanvas = document.getElementById(id);
	var ctx = chartCanvas.getContext('2d');
	var graphConfig = {
		title : 'テストタイトル',
		timeFormat : 'YYYY/MM/DD HH:mm',
		tooltipFormat : 'YYYY/MM/DD HH:mm',
		displayFormat : 'YYYY/MM/DD HH:mm',
		startTime : moment().format('YYYY/MM/DD 00:00'),
		dataSize : 1441,
		showTickCount : 6,
		legendLabelWidth : 110,
		legendCheckBox : true,
		showTickLabelIndexs : [ 0, 6 ],
		yAxes : [ {
			min : 0,
			max : 6,
			negative : false,
			stepSize : 1.5,
			decimal : 1,
			showTickLabelIndexs : [ 0, 2, 4 ]
		} ]
	};

	if (typeof (userConfig) != 'undefined') {
		$.extend(true, graphConfig, userConfig);
	}
	var config = {};
	config.type = 'line';

	var chartDataset = [];
	for (var i = 0; i < datasets.length; i++) {
		var yAxisID = '';
		if (typeof (datasets[i].yAxisIndex) == 'undefined') {
			datasets[i].yAxisIndex = 0;
			yAxisID = 'y-axis-0';
		} else {
			yAxisID = 'y-axis-' + datasets[i].yAxisIndex;
		}
		var yAxisOpt = graphConfig.yAxes[datasets[i].yAxisIndex];
		var negative = yAxisOpt.negative;
		var dataList = datasets[i].data;
		if (negative) {
			var nDataList = [];
			for (var j = 0; j < dataList.length; j++) {
				var data = {
					x : dataList[j].x,
					y : dataList[j].y
				};
				if (!isNaN(data.y)) {
					data.y = data.y * -1;
				}
				nDataList.push(data);
			}
			dataList = nDataList;
			nDataList = null;
		}
		var dataset = {
			type : 'line',
			label : datasets[i].label,
			unit : datasets[i].unit,
			borderColor : datasets[i].color,
			backgroundColor : datasets[i].color,
			borderWidth : datasets[i].borderWidth,
			fill : false,
			yAxisID : yAxisID,
			yAxisIndex : datasets[i].yAxisIndex,
			data : dataList
		};
		chartDataset.push(dataset);
	}

	config.data = {
		datasets : chartDataset
	};
	config.options = {
		scales : {
			xAxes : [],
			yAxes : []
		},
		legend : {
			display : false
		},
		elements : {
			line : {
				borderWidth : 2
			},
			point : {
				radius : 0,
				hoverRadius : 1
			}
		},
		chartArea : {
			backgroundColor : '#FFFFFF'
		// backgroundColor: '#F7F3F7'
		}
	}

	if (typeof (graphConfig.title) != 'undefined' && graphConfig.title != '') {
		config.options.title = {
			display : true,
			text : graphConfig.title
		};
	}

	var startTime = graphConfig.startTime;
	var endTime = graphConfig.endTime;
	if (typeof (endTime) == 'undefined') {
		endTime = moment(startTime, graphConfig.timeFormat, true).add(
				graphConfig.dataSize, 'm').format(graphConfig.timeFormat);
	}
	var stepSize = (graphConfig.dataSize - 1) / graphConfig.showTickCount;
	var xAxeOpt = {
		id : 'x-axis-0',
		type : 'time',
		time : {
			min : startTime,
			max : endTime,
			unit : 'minute',
			stepSize : stepSize,
			parser : graphConfig.timeFormat,
			tooltipFormat : graphConfig.tooltipFormat,
			displayFormats : {
				minute : graphConfig.displayFormat
			}
		},
		ticks : {
			padding : 10,
			callback : function(dataLabel, index) {
				for (var i = 0; i < graphConfig.showTickLabelIndexs.length; i++) {
					if (index == graphConfig.showTickLabelIndexs[i]) {
						return dataLabel;
					}
				}
				return "";
			}
		},
		gridLines : {
			display : true,
			drawBorder : true,
			drawOnChartArea : true,
			drawTicks : false,
			lineWidth : 2,
			color : '#DEDEE3'
		}
	};
	config.options.scales.xAxes.push(xAxeOpt);

	for (var i = 0; i < graphConfig.yAxes.length; i++) {
		var userOpt = graphConfig.yAxes[i];
		var postion = 'left';
		var gridLineDisplay = true;
		if (i > 0) {
			postion = 'right';
			gridLineDisplay = false;
		}
		var min = userOpt.min;
		var max = userOpt.max;
		if (userOpt.negative) {
			var tmp = min;
			min = -1 * max;
			max = -1 * tmp;
			tmp = null;
		}
		var yAxeOpt = {
			position : postion,
			id : 'y-axis-' + i,
			ticks : {
				padding : 10,
				min : min,
				max : max,
				negative : userOpt.negative,
				stepSize : userOpt.stepSize,
				beginAtZero : userOpt.beginAtZero,
				decimal : userOpt.decimal,
				userCallback : function(value, index, values) {
					for (var j = 0; j < userOpt.showTickLabelIndexs.length; j++) {
						if (index == userOpt.showTickLabelIndexs[j]) {
							var obj = $(this)[0].options.ticks;
							var negative = obj.negative;
							if (negative) {
								value = -1 * value;
							}
							return com_formatNumber(value, obj.decimal);
						}
					}
					return "";
				}
			},
			gridLines : {
				display : gridLineDisplay,
				drawBorder : false,
				drawOnChartArea : true,
				drawTicks : false,
				tickMarkLength : 0,
				lineWidth : 2,
			}
		};
		config.options.scales.yAxes.push(yAxeOpt);
	}
	;

	config.options.tooltips = {
		enabled : true,
		mode : 'index',
		position : 'nearest',
		intersect : false,
		displayColors : false,
		titleAlign : 'center',
		bodyAlign : 'center',
		titleFontColor : '#000',
		titleFontFamily : 'SimSun',
		titleFontSize : 12,
		titleFontStyle : 'normal',
		backgroundColor : 'white',
		borderColor : 'black',
		borderWidth : 1,
		// custom: customTooltips
		callbacks : {
			label : function(tooltipItem, data) {
				var obj = $(this)[0];
				var dataItem = data.datasets[tooltipItem.datasetIndex];
				var value = dataItem.data[tooltipItem.index].y;
				var yAxisOpt = graphConfig.yAxes[dataItem.yAxisIndex];
				var negative = yAxisOpt.negative;
				if (negative) {
					value = -1 * value;
				}
				return '-   ' + dataItem.label + ':' + Math.round(value * 100)
						/ 100 + '   -';
			},
			labelTextColor : function(tooltipItem, chart) {
				var meta = chart.getDatasetMeta(tooltipItem.datasetIndex);
				var activeElement = meta.data[tooltipItem.index];
				var view = activeElement._view;
				return view.backgroundColor;
			},
		}
	};
	var chart = com_charts[id];
	if (chart) {
		chart.data.datasets = chartDataset;
		chart.update();
	} else {
		chart = new Chart(ctx, config);
		com_createXposLine(id, chart);
	}
	if ($('#' + legendId).length > 0) {
		com_createLegend(chart, legendId, graphConfig.legendLabelWidth,
				graphConfig.legendCheckBox);
	}
}

function com_createLegend(chart, legendId, legendLabelWidth, legendCheckBox) {
	var text = [];
	text
			.push('<ul style="list-style:none;padding:5px;margin-top: 0px;margin-bottom: 0px;">');

	for (var i = 0; i < chart.data.datasets.length; i++) {
		var dataItem = chart.data.datasets[i];
		var datas = dataItem.data;
		var lastData = datas[datas.length - 1];
		var chkId = legendId + "_chk_" + i;
		text.push('<li style="margin-bottom: 5px;">');
		text.push('<div style="display: inline-block;width:' + legendLabelWidth
				+ 'px">');
		if (legendCheckBox) {
			text.push('<input type="checkbox" id = "' + chkId + '" itemIndex="'
					+ i + '" checked>&nbsp;');
			text.push('<label for = "' + chkId + '">' + dataItem.label
					+ '</label>');
		} else {
			text.push('<label>' + dataItem.label + '</label>');
		}
		text.push('</div>');
		text
				.push('<div style="width:50px;height:5px;display:inline-block;margin-bottom:4px;background:'
						+ dataItem.backgroundColor + '" />&nbsp;');
		text.push('<div style="display: inline-block;">');
		text.push(lastData.y);
		text.push('</div>');
		text.push('<div style="display: inline-block;">');
		text.push(dataItem.unit);
		text.push('</div>');
		text.push('</li>');
	}
	text.push('</ul>');

	$("#" + legendId).html(text.join(''));
	if (legendCheckBox) {
		$("#" + legendId + " input:checkbox").unbind().bind('click',
				function() {
					if (chart.data.datasets.length == 0) {
						return;
					}
					var checked = $(this).get(0).checked;
					var itemIndex = $(this).attr("itemIndex");
					var dataItem = chart.data.datasets[itemIndex];
					var meta = chart.getDatasetMeta(itemIndex);
					meta.hidden = !checked;
					chart.update();
				});
	}
}

function com_isChartArea(chartInstance, x, y) {
	if (x < chartInstance.chartArea.left || chartInstance.chartArea.right < x
			|| y < chartInstance.chartArea.top
			|| chartInstance.chartArea.bottom < y) {
		return false;
	}
	return true;
}

function com_createXposLine(chartId, chart) {
	var helpers = Chart.helpers;
	var chartDom = document.getElementById(chartId);
	helpers.addEvent(chartDom, 'click', function(evt) {
		if (!com_isChartArea(chart, evt.offsetX, evt.offsetY)) {
			return;
		}
		var scale_x = chart.scales['x-axis-0'];
		var time = scale_x.getValueForPixel(evt.offsetX);
		var xposId = chartId + "_xpos_line";
		var xposEndId = xposId + "_end";
		var xposLine = jQuery("#" + xposId);
		var xposEndLine = jQuery("#" + xposEndId);
		if (xposLine.length == 0) {
			var offsetTop = chart.canvas.parentNode.offsetTop;
			var top = chart.chartArea.top;
			var bottom = chart.chartArea.bottom;
			var height = bottom - top;
			var lineTop = offsetTop + top;
			var cirleTop = lineTop + height;
			$("#" + chartId).parent().append(
					"<hr id='" + xposId + "' class='xpos_line'>");
			$("#" + chartId).parent().append(
					"<div id='" + xposEndId + "' class='xpos_line_end'/>");
			xposLine = jQuery("#" + xposId);
			xposEndLine = jQuery("#" + xposEndId);
			var xposEndHeight = xposEndLine.height();
			cirleTop = cirleTop - xposEndHeight / 2;
			xposLine.css("height", height + "px");
			xposLine.css("top", lineTop + "px");
			xposEndLine.css("top", cirleTop + "px");
		}
		xposLine.css("display", "block");
		var xposEndWidth = xposEndLine.width();
		xposEndLine.css("display", "block");
		var left = evt.x;
		xposLine.css("left", left + "px");
		xposEndLine.css("left", (left - xposEndWidth / 2) + "px");
	});

}