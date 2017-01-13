function callCal() {
    dc.calendarChart = function (parent, chartGroup) {

        var thisYear = new Date().getFullYear();
        var _chart = dc.marginMixin(dc.baseMixin({}));
        var color;
        var width = 900,
            height = 120,
            cellSize = 16; // cell size
        _chart.SELECTED_CLASS = "day-selected";
        _chart.DESELECTED_CLASS = "day-deselected";
        _chart.range = d3.range(thisYear, thisYear + 1);

        var day = d3.time.format("%w"),
            week = d3.time.format("%U"),
            percent = d3.format(".1%"),
            format = d3.time.format("%Y-%m-%d"),
            fullMonth = d3.time.format("%b");

        var dowMap = {
            "M": 2,
            "W": 4,
            "F": 6
        };
        var colors = ["#DB1414", "#DE2B2B", "#E24343", "#E55A5A", "#E97272", "#ED8989", "#F0A1A1", "#F4B8B8", "#F7D0D0", "#FBE7E7", "#eeeeee",
                      "#E5EDF2", "#CCDBE5", "#B2C9D8", "#99B7CB", "#7FA6BE", "#6694B1", "#4C82A4", "#327097", "#195E8A", "#004D7D"];
        var legendElementWidth = cellSize * 2.5;

        _chart._doRedraw = function () {
            _chart._doRender();
            _highlightFilters();
            return _chart;
        };

        _chart._doRender = function () {
            d3.select("#" + _chart.anchorName())
                .selectAll("svg")
                .remove();

            var svg = d3.select("#" + _chart.anchorName())
                .selectAll("svg")
                .data(_chart.range)
                .enter().append("svg")
                .style("padding", '3px')
                .attr("width", width + _chart.margins().left + (cellSize * 3))
                .attr("height", height + _chart.margins().top + cellSize)
                //                .attr("class", "RdYlGn")
                .append("g")
                .attr("transform", "translate(" + _chart.margins().left + "," + _chart.margins().top + ")");

            svg.append("text")
                .attr("transform", "translate(-16," + cellSize * 3.5 + ")rotate(-90)")
                .style("text-anchor", "middle")
                .text(function (d) {
                    return d;
                });


            if (_chart.renderTitle()) {
                var dowLabel = svg.selectAll('.dowLabel')
                    .data(function (d) {
                        return ["M", "W", "F"];
                    })
                    .enter().append("text")
                    .attr('transform', function (d) {

                        return "translate(-15," + parseInt((cellSize * dowMap[d]) - 3) + ")";
                    })
                    .text(function (d) {
                        return d;
                    })
                    .attr("style", "font-weight : bold");
            }

            var rect = svg.selectAll(".day")
                .data(function (d) {
                    return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
                })
                .enter()
                .append("rect")
                .attr("class", "day")
                .attr("width", cellSize)
                .attr("height", cellSize)
                .attr("x", function (d) {
                    return week(d) * cellSize;
                })
                .attr("y", function (d) {
                    return day(d) * cellSize;
                });

            if (_chart.renderTitle()) {
                rect.append("title")
                    .text(function (d) {
                        return d;
                    });
            }

            var monthLabel = svg.selectAll(".monthLabel")
                .data(function (d) {
                    return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
                })
                .enter().append("text")
                .text(function (d) {
                    return fullMonth(d);
                })
                .attr("x", function (d) {
                    return week(d) * cellSize /*+ cellSize*/ ;
                })
                .attr("y", -3)
                .attr("class", "monthLabel");

            var data = d3.nest()
                .key(function (d) {
                    return d.key;
                })
                .rollup(function (d) {
                    return _chart.valueAccessor()(d);
                })
                .map(_chart.data());

            if (!color) {
                color = d3.scale.quantile()
                    .domain([0, 100, 13000])
                    .range(colors);
            }

            rect.filter(function (d) {
                    var date = simpleDate(d);
                    return date in data;
                })
                .style("fill", function (d) {
                    var date = simpleDate(d);
                    var col = 0;
                    if (data[date] < -0 && data[date] >= -10) {
                        col = -1;
                    }
                    if (data[date] < -10 && data[date] >= -20) {
                        col = -2;
                    }
                    if (data[date] < -20 && data[date] >= -30) {
                        col = -3;
                    }
                    if (data[date] < -30 && data[date] >= -40) {
                        col = -4;
                    }
                    if (data[date] < -40 && data[date] >= -50) {
                        col = -5;
                    }
                    if (data[date] < -50 && data[date] >= -60) {
                        col = -6;
                    }
                    if (data[date] < -60 && data[date] >= -70) {
                        col = -7;
                    }
                    if (data[date] < -70 && data[date] >= -80) {
                        col = -8;
                    }
                    if (data[date] < -80 && data[date] >= -90) {
                        col = -9;
                    }
                    if (data[date] < -90) {
                        col = -10;
                    }
                    if (data[date] == 0) {
                        col = 0;
                    }
                    if (data[date] >= 0) {
                        col = 1;
                    }
                    if (data[date] >= 20) {
                        col = 2;
                    }
                    if (data[date] >= 40) {
                        col = 3;
                    }
                    if (data[date] >= 60) {
                        col = 4;
                    }
                    if (data[date] >= 80) {
                        col = 5;
                    }
                    if (data[date] >= 100) {
                        col = 6;
                    }
                    if (data[date] >= 120) {
                        col = 7;
                    }
                    if (data[date] >= 140) {
                        col = 8;
                    }
                    if (data[date] >= 160) {
                        col = 9;
                    }
                    if (data[date] >= 180) {
                        col = 10;
                    }
                    return color(col);
                })
                .on('click', onClick);

            if (_chart.renderTitle()) {
                rect.filter(function (d) {
                        var date = simpleDate(d);
                        return date in data;
                    })
                    .select("title")
                    .text(function (d) {
                        var date = simpleDate(d);
                        return date + ": " + data[date].toFixed(2);
                    });
            }
            return _chart;
        };

        function onClick(d, i) {
            var dateClicked = simpleDate(d);
            console.log('fuck you');
            _chart.group().all().forEach(function (datum) {
                if (datum.key === dateClicked) {
                    _chart.onClick(datum, i);
                }
            });
        }

        function prefixZero(value) {
            var s = value + "";
            if (s.length === 1) {
                return "0" + value;
            } else {
                return value;
            }
        }

        function simpleDate(date) {
            return date.getFullYear() + "-" + prefixZero(date.getMonth() + 1) + "-" + prefixZero(date.getDate());
        }

        _chart.legendables = function () {
            // do nothing in base, should be overridden by sub-function
            return [];
        };

        _chart.legend = function (d) {};

        _chart.legendReset = function (d) {
            // do nothing in base, should be overridden by sub-function
        };

        _chart.legendToggle = function (d) {
            // do nothing in base, should be overriden by sub-function
        };

        _chart.isLegendableHidden = function (d) {
            // do nothing in base, should be overridden by sub-function
            return false;
        };

        //custom overrides for calendarChart since standard selected and deselected
        //classes for DC make the chart look bad
        _chart.highlightSelected = function (e) {
            d3.select(e).classed(_chart.SELECTED_CLASS, true);
            d3.select(e).classed(_chart.DESELECTED_CLASS, false);
        };

        _chart.fadeDeselected = function (e) {
            d3.select(e).classed(_chart.SELECTED_CLASS, false);
            d3.select(e).classed(_chart.DESELECTED_CLASS, true);
        };

        _chart.resetHighlight = function (e) {
            d3.select(e).classed(_chart.SELECTED_CLASS, false);
            d3.select(e).classed(_chart.DESELECTED_CLASS, false);
        };

        _chart.rangeYears = function (range) {
            _chart.range = d3.range(range[0], range[1]);
            return _chart;
        }

        function _highlightFilters() {
            if (_chart.hasFilter()) {
                var chartData = _chart.group().all();
                _chart.root().selectAll('.day').each(function (d) {
                    if (_chart.hasFilter(simpleDate(d))) {
                        _chart.highlightSelected(this);
                    } else {
                        _chart.fadeDeselected(this);
                    }
                });
            } else {
                _chart.root().selectAll('.day').each(function (d) {
                    _chart.resetHighlight(this);
                });
            }
        }

        return _chart.anchor(parent, chartGroup);
    };
}