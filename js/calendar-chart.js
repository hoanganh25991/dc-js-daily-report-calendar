function callCal() {
    dc.calendarChart = function (parent, chartGroup) {

        let thisYear = new Date().getFullYear();
        let _chart = dc.marginMixin(dc.baseMixin({}));
        let color;
        let width = 900,
            height = 120,
            cellSize = 16; // cell size
        _chart.SELECTED_CLASS = "day-selected";
        _chart.DESELECTED_CLASS = "day-deselected";
        _chart.range = d3.range(thisYear, thisYear + 1);

        let day = d3.time.format("%w"),
            week = d3.time.format("%U"),
            percent = d3.format(".1%"),
            format = d3.time.format("%Y-%m-%d"),
            fullMonth = d3.time.format("%b");

        let dowMap = {
            "M": 2,
            "W": 4,
            "F": 6
        };
        // let colors = ["#DB1414", "#DE2B2B", "#E24343", "#E55A5A", "#E97272", "#ED8989", "#F0A1A1", "#F4B8B8", "#F7D0D0", "#FBE7E7", "#eeeeee",
        //               "#E5EDF2", "#CCDBE5", "#B2C9D8", "#99B7CB", "#7FA6BE", "#6694B1", "#4C82A4", "#327097", "#195E8A", "#004D7D"];
        const emptyColor = 'white';
        const top100Color = '#004b00'; //nearly dark green
        const top50Color = 'green';
        const bottom10Color = 'red';
        const range10Color = 'yellow';
        const range40Color = 'orange';
        let colors = [emptyColor, bottom10Color, range10Color, range40Color, top50Color, top100Color];
        let legendElementWidth = cellSize * 2.5;

        _chart._doRedraw = function () {
            _chart._doRender();
            _highlightFilters();
            return _chart;
        };

        _chart._doRender = function () {
            d3.select("#" + _chart.anchorName())
                .selectAll("svg")
                .remove();

            let svg = d3.select("#" + _chart.anchorName())
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
                let dowLabel = svg.selectAll('.dowLabel')
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

            let rect = svg.selectAll(".day")
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
                })
                .style("fill", d => {
                    return 'white';
                })
                ;

            if (_chart.renderTitle()) {
                rect.append("title")
                    .text(function (d) {
                        return d;
                    });
            }

            let monthLabel = svg.selectAll(".monthLabel")
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

            let data = d3.nest()
                .key(function (d) {
                    return d.key;
                })
                .rollup(function (d) {
                    return _chart.valueAccessor()(d);
                })
                .map(_chart.data());

            let valArr = _chart.group().all().map(c => {return c.value});

            let maxVal = valArr.reduce((x, y) => {
                return x > y ? x : y;
            });
            console.log('MAX VAL: ', maxVal);
            let emptyVal = 0;
            let bottom10Val = maxVal * 0.1 - 1;
            let range10Val = maxVal * 0.1;
            let range40Val = maxVal * 0.4;
            let top50Val = maxVal * 0.5;
            let top100Val = maxVal;

            let domainRange = [emptyVal, bottom10Val, range10Val, range40Val, top50Val, top100Val];

            // if (!color) {
            //     color = d3.scale.quantile()
            //         .domain(domainRange)
            //         .range(colors);
            // }

            const heatColorMapping = function(d){

                return d3.scale.linear()
                         .domain(domainRange)
                         .range([emptyColor, bottom10Color, range10Color, range40Color, top50Color, top100Color])(d);
            };

            // heatColorMapping.domain = function(){
            //     return [0,1];
            // };

	        /**
             * Only apply on who has data
             */
            rect.filter(function (d) {
                    let date = simpleDate(d);
                    return data[date];
                })
                .style("fill", function (d) {
                    let date = simpleDate(d);
                    let val = data[date];
                    if(!val){
                        val = 0;
                    }
                    let color =  heatColorMapping(val);
                    return color;
                })
                .on('click', onClick);

            if (_chart.renderTitle()) {
                rect.filter(function (d) {
                        let date = simpleDate(d);
                        return data[date];
                    })
                    .select("title")
                    .text(function (d) {
                        let date = simpleDate(d);
                        return data[date].toFixed(2);
                    });
            }
            return _chart;
        };

        function onClick(d, i) {
            let dateClicked = simpleDate(d);
            console.log('fuck you');
            // _chart.group().all().forEach(function (datum) {
            //     if (datum.key === dateClicked) {
            //         _chart.onClick(datum, i);
            //     }
            // });

        }

        function prefixZero(value) {
            let s = value + "";
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
                let chartData = _chart.group().all();
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