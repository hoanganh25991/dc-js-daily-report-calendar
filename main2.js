fetch('data1.json')
	.then(res =>{
		return Promise.resolve(res.json());
	})
	.then(closures => {
		window.tiCalendarChart = new TiCalendarChart('testAnchor', closures);
		tiCalendarChart.render();
		// console.log(closures);
		let yearRange = [];
		//clean data
		closures.forEach(c => {
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
			
			let timezone = 8*60; //SG time
			let momentObj = moment(cTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(timezone);
			c.timestamp = momentObj.unix();
			c.momentObj = momentObj;
			c.calendarDayFormat = momentObj.format('YYYY-MM-DD');
			c.date = momentObj;

			let year = momentObj.year();
			if(yearRange.indexOf(year) == -1){
				yearRange.push(year);
			}
		});
		yearRange.sort((a,b) => {
			if(a > b)
				return 1;
			if(a < b)
				return -1;
			if(a == b)
				return 0;
		});



        window.dailyReportCalendar = new dc.calendarChart('#daily-report-calendar');
        let ndx = crossfilter(closures);
        
        let closureDayDim = ndx.dimension(function(d){
			return d.calendarDayFormat;
        });
        
        let calendarGroupBy = function computeDynamicAttr(attr = 'total'){
			return closureDayDim.group().reduceSum(function(d){
				return d[attr];
			});
        }
        
        dailyReportCalendar
			.width(700)
            .height(130)
            .dimension(closureDayDim)
            .group(calendarGroupBy('total'))
            .valueAccessor(function (p) {
                // return p.value;
                // console.log(p);
                return p[0].value;
            })
            .rangeYears([2015, 2016])
            ;
        
        dailyReportCalendar.render();
        console.log(dailyReportCalendar);
        // drawCalLegend();

		
		// dc.renderAll();
	});

