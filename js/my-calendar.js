class tx {
	constructor(rawData, elementId){
		/**
		 * Define by function in old style
		 * Assign methods, properties in THIS
		 * Redeclare in class scope, NOT HELPS to override
		 */
		dc.marginMixin(dc.baseMixin(this));
		/**
		 * Explicit tell override
		 * Remove first
		 */
		delete this._doRedraw;
		delete this._doRender;
		// delete this.valueAccessor;

		/**
		 * Const
		 */
		this._cellHeight = 16;
		this._minimumWidth = 500;

		/**
		 * Do not allow to change height
		 */
		delete this.height;
		this._height = 120 + this.margins().top + this._cellHeight;
	}

	/**
	 * Override
	 */
	_doRedraw(){

		this._doRender();
		return this;
	}

	reDrawAttr(){


	}

	reDrawWidth(width){
		let cellSize = this._computeCellWidth(width);
		this.rect.attr('width', cellSize);
		const week = d3.time.format('%U');
		this.rect.attr('x', d =>{
			return week(d) * cellSize;
		});
		this.xSVG.attr('width', width);
		this.monthLabel.attr('x', d =>{
			return week(d) * cellSize;
		});
	}

	_doRender(){
		d3.select('#' + this.anchorName())
		  .selectAll('svg')
		  .remove();

		let width = this.width();
		/**
		 * Check width requirement
		 */
		if(width < this._minimumWidth){
			console.warn('Width not large enough. Minimum: ', this._minimumWidth);
			width = this._minimumWidth;
		}
		/**
		 * Calculate width
		 */
		this._cellWidth = this._computeCellWidth(width);
		let height = this.height();

		const day = d3.time.format('%w'),
			week = d3.time.format('%U'),
			percent = d3.format('.1%'),
			format = d3.time.format('%Y-%m-%d'),
			fullMonth = d3.time.format('%b');

		const weekDay = {
			'M': 2,
			'W': 4,
			'F': 6
		};

		const emptyColor = 'white';
		const top100Color = '#004b00'; //nearly dark green
		const top50Color = 'green';
		const bottom10Color = 'red';
		const range10Color = 'yellow';
		const range40Color = 'orange';

		let colors = [emptyColor, bottom10Color, range10Color, range40Color, top50Color, top100Color];
		/**
		 * Clear before re-render
		 */
		this.xSVG =
			d3.select('#' + this.anchorName())
			  .selectAll('svg')
			  .data(this.range)
			  .enter()
			  .append('svg')
			  .style('padding', '3px');
		/**
		 * Draw title
		 */
		let _chart = this;

		let svg =
			this.xSVG
			    .attr('width', width)
			    .attr('height', _chart._height)
			    .append('g')
			    .attr('transform', 'translate(' + _chart.margins().left + ',' + _chart.margins().top + ')');

		svg.append('text')
		   .attr('transform', 'translate(-16,' + _chart._cellHeight * 3.5 + ')rotate(-90)')
		   .style('text-anchor', 'middle')
		   .text(function(d){
			   return d;
		   });


		if(this.renderTitle()){
			let dowLabel =
				svg.selectAll('.dowLabel')
				   .data(function(d){
					   return ['M', 'W', 'F'];
				   })
				   .enter().append('text')
				   .attr('transform', function(d){
					   return 'translate(-15,' + parseInt((_chart._cellWidth * weekDay[d]) - 3) + ')';
				   })
				   .text(function(d){
					   return d;
				   })
				   .attr('style', 'font-weight : bold');
		}

		this.rect =
			svg.selectAll('.day')
			   .data(function(d){
				   return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
			   })
			   .enter()
			   .append('rect')
			   .attr('class', 'day')
			   .attr('width', this._cellWidth)
			   .attr('height', this._cellHeight)
			   .attr('x', function(d){
				   return week(d) * _chart._cellWidth;
			   })
			   .attr('y', function(d){
				   return day(d) * _chart._cellWidth;
			   })
			   .style('fill', d =>{
				   return 'white';
			   })
		;

		if(this.renderTitle()){
			this.rect
			    .append('title')
			    .text(function(d){
				    return d;
			    });
		}

		this.monthLabel =
			svg.selectAll('.monthLabel')
			   .data(function(d){
				   return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
			   })
			   .enter().append('text')
			   .text(function(d){
				   return fullMonth(d);
			   })
			   .attr('x', function(d){
				   return week(d) * _chart._cellWidth /*+ cellSize*/;
			   })
			   .attr('y', -3)
			   .attr('class', 'monthLabel');


		let data =
			d3.nest()
			  .key(function(d){
				  return d.key;
			  })
			  .rollup(function(d){
				  return _chart.valueAccessor()(d);
			  })
			  .map(_chart.data());

		let valArr = this.group().all().map(c =>{
			return c.value
		});

		let maxVal = valArr.reduce((x, y) =>{
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

		const heatColorMapping = function(d){
			return d3.scale.linear()
			         .domain(domainRange)
			         .range([emptyColor, bottom10Color, range10Color, range40Color, top50Color, top100Color])(d);
		};

		/**
		 * Only apply on who has data
		 */
		this.rect
		    .filter(d =>{
			    let date = simpleDate(d);
			    return data[date];
		    })
		    .style('fill', function(d){
			    let date = simpleDate(d);
			    let val = data[date];
			    if(!val){
				    val = 0;
			    }
			    let color = heatColorMapping(val);
			    return color;
		    })
		    .on('click', onClick);

		if(this.renderTitle()){
			this.rect
			    .filter(d =>{
				    let date = simpleDate(d);
				    return data[date];
			    })
			    .select('title')
			    .text(function(d){
				    let date = simpleDate(d);
				    return data[date].toFixed(2);
			    });
		}


		function onClick(d, i){
			let dateClicked = simpleDate(d);
			console.log('fuck you');
			this.group().all().forEach(function(datum){
				if(datum.key === dateClicked){
					this.onClick(datum, i);
				}
			});

		}

		function prefixZero(value){
			let s = value + '';
			if(s.length === 1){
				return '0' + value;
			}else{
				return value;
			}
		}

		function simpleDate(date){
			return date.getFullYear() + '-' + prefixZero(date.getMonth() + 1) + '-' + prefixZero(date.getDate());
		}

		return this;
	}

	height(height){
		if(!height){
			return this._height;
		}

		console.warn('Do no allow change height. Height set at: ', this._height);
		return this;
	}

	_checkRequirement(){
		if(!this.range)
			console.error('No range years set up');
	}

	rangeYears(range){
		this.range = d3.range(range[0], range[1]);
		return this;
	}

	_computeCellWidth(width){
		return Math.floor((width - this.margins().left - this._cellHeight * 3) / 53);
	}
}