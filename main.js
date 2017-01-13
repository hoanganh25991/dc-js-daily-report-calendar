class TxCalendarChart {
	constructor(rawData, elementId, ...attrs){
		/**
		 * Default config
		 */
		this.config = {
			timezone: 8 * 60
		};

		/**
		 * Init calendarChart as plugin chart into dc
		 */
		callCal();

		this.rawData = rawData;
		this._cleanData();
		
		this.elementId = elementId;
		this._chart = dc.calendarChart(elementId);

		attrs = attrs.length > 0 ? attrs : ['total'];
		this.attrs = attrs;
		// this._cleanAttrData();
	}

	_cleanData(){
		this.rawData.forEach(c => {
			let cTime = c.closed_timestamp;
			/**
			 * @WARN try on modified_timestamp
			 */
			if(!cTime){
				cTime = c.modified_timestamp;
			}

			if(!cTime){
				console.error('Closure closed_timestamp: null');
				throw c;
			}
			
			let timezone = this.config.timezone;
			let momentObj = moment(cTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(timezone);
			c.timestamp = momentObj.unix();
			c.momentObj = momentObj;
			c.calendarDayFormat = momentObj.format('YYYY-MM-DD');
			c.date = momentObj;
		});
	}
	
	setConfig(configObj){
		Object.keys(configObj).forEach(key => {
			//Override default val by user options
			this.config[key] = configObj[key];
		});
	}

	render(attr){
		let ndx = crossfilter(this.rawData);

		let dayDim = ndx.dimension(d => {
			return d.calendarDayFormat;
		});

		let countAttr = dayDim.group().reduceSum(d => {
			return d[attr];
		});

		this._chart
			// .width()
			// .height()
			.dimension(dayDim)
			.group(countAttr)
			.valueAccessor(c => {
				return c[0].value;
			})
			.rangeYears([2016, 2018]);

		this._chart.render();
	}
}

// fetch('data.json')
fetch('data1.json')
	.then(res =>{
		return Promise.resolve(res.json());
	})
	.then(closures => {
		window.closures = closures;
		
		let dailyReportCalendar = new TxCalendarChart(closures, 'daily-report-calendar');
		dailyReportCalendar.render('total');
	})
;