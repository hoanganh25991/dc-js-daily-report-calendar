fetch('data1.json')
	.then(res =>{
		return Promise.resolve(res.json());
	})
	.then(closures => {
		window.tiCalendarChart = new TiCalendarChart('testAnchor', closures);
		tiCalendarChart.render();
	});

