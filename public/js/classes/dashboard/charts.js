Notificare.Charts = Class.create({
	initialize: function(element, options){
		Object.extend(this, pH8.Mixin.needsTemplates);
		Object.extend(this, pH8.Mixin.needsDictionary);
		Object.extend(this, pH8.Mixin.needsConfig);

		this.element = $(element);
		this.options = Object.extend({
			language: pH8.currentLanguage
		}, options || {});

		
		this.waitForTemplates(this.options.templates, this.onTemplatesLoaded.bind(this));
		this.waitForDictionary(this.onDictionaryLoaded.bind(this), this.options.language);
		this.waitForConfig(this.onConfigLoaded.bind(this));
		
		this.chartID = this.options.chartID;
		this.placeholderClass = this.options.placeholderClass;		
		this.plan = this.options.plan;
		this.colorRange = ['#466f77','#92c4cf','#bfd5d8','#39321f','#5c4f3f','#ad9b87','#ebe5e0','#7d2214','#d56351','#57710f','#a7c84a'];

	},
	onTemplatesLoaded: function(){
		this.templatesLoaded = true;
		this.onReady();
	},
	/**
	 * Gets called when the dictionary is loaded
	 */
	onDictionaryLoaded: function(){
		this.dictionary = new pH8.Dictionary();
		this.dictionaryLoaded = true;
		this.onReady();
	},
	/**
	 * handle loaded config
	 */
	onConfigLoaded: function(){
		var tempConfig = new pH8.Config();
		this.config = new Hash();
		$H(tempConfig.getList()).each(function(pair){
			this.config.set(pair.key, new Hash());
			$H(pair.value).each(function(secondPair){
					this.config.get(pair.key).set(secondPair.value, secondPair.key);
			}.bind(this));
		}.bind(this));
		this.configLoaded = true;
		this.onReady();
	},
	/**
	 * The all the dependancies are loaded, apply this method
	 */
	onReady: function(){
		if(this.dictionaryLoaded && this.configLoaded){
			
			switch(this.chartID){
			case 1:
				this.getChart1(this.options.application, this.options.token);
				break;
			case 2:
				this.getChart2(this.options.application, this.options.token);
				break;
			case 3:
				this.getChart3(this.options.application, this.options.token);
				break;
				
			}
			
		}
	},
	sumStatsByDate: function(stats) { 
		
	},
	getChart1: function(application, token) {
		var auth = 'Basic ' + Base64.encode(token + ':xxx');
		var url = 'https://push.notifica.re/stats/notification/lastmonth';
//		new Ajax.Request('/proxy?url=' + encodeURIComponent(url), {
//		var url = 'http://localhost:3006/stats/notification/lastmonth';
		new Ajax.Request(url, {
			method: 'GET',
			requestHeaders : { Authorization : auth },
			contentType: 'application/json',
			onSuccess: this.onChart1Success.bind(this),
			onFailure: this.onChart1Failure.bind(this)
		});
	},
	onChart1Success: function(response) {
		var data = response.responseJSON;
		// Create a data set for the graph
		var graphData = [{
			key: this.dictionary.getText('chart_notifications_30_days'),
			values: [],
			color: this.colorRange[0]
		}];
		
		var check = 0;

		if (data.stats) {
			// Sum the data
			var sum = {};
			data.stats.forEach(function(dataPoint) {
				if (sum[dataPoint.date]) {
					sum[dataPoint.date] += dataPoint.count;
				} else {
					sum[dataPoint.date] = dataPoint.count;
				}
				check = check + dataPoint.count;
			});

			Object.keys(sum).sort().forEach(function(sumPoint) {
				graphData[0].values.push({x: new Date(sumPoint), y: sum[sumPoint]});
			});
		}
		
		if(check == 0){
			this.showChartFailureInfo();

		}else{
		
			nv.addGraph(function() {
				var chart = nv.models.lineChart();
				chart.xAxis.rotateLabels(-45).tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); });
				chart.yAxis.tickFormat(d3.format(',.r'));
				chart.showLegend(false);
				d3.select(this.element).datum(graphData).transition().duration(500).call(chart);
				
				nv.utils.windowResize(chart.update);
				
				return chart;
			}.bind(this));
		}
	},
	onChart1Failure: function(){
		console.log('failed to load chart 1');
	},
	/**
	 * 
	 * 
	 */
	getChart2: function(application, token){
		var auth = 'Basic ' + Base64.encode(token + ':xxx');
		var url = 'https://push.notifica.re/user/foraccount';
//		new Ajax.Request('/proxy?url=' + encodeURIComponent(url), {
//		var url = 'http://localhost:3006/stats/notification/lastmonth';
		new Ajax.Request(url, {
			method: 'GET',
			requestHeaders : { Authorization : auth },
			contentType: 'application/json',
			onSuccess: this.onChart2Success.bind(this),
			onFailure: this.onChart2Failure.bind(this)
		});
		
	},
	onChart2Success: function(response){
		var count = response.responseJSON.users.length, limit = parseInt(this.plan) - parseInt(count);
		var graphData =[{"label" : this.dictionary.getText('active') ,"value" : count} , {"label" : this.dictionary.getText('free') , "value" : limit }];

		nv.addGraph(function() {
			var chart = nv.models.pieChart()
	        .x(function(d) { return d.label; })
	        .y(function(d) { return d.value; })
	        .showLegend(false)
	        .values(function(d) { return d; })
	        .valueFormat(d3.format('.0'))
	        .color(this.colorRange)
	        .width(300)
	        .height(250);
			
			d3.select(this.element)
				.datum([graphData])
				.transition().duration(1200)
				.call(chart);
			
			nv.utils.windowResize(chart.update);
				
			return chart;
		}.bind(this));		
	},
	onChart2Failure: function(){
		console.log('failed to load chart 2');
	},
	/**
	 * 
	 * 
	 * 
	 */
	getChart3: function(application, token) {
		var auth = 'Basic ' + Base64.encode(token + ':xxx');
		var url = 'https://push.notifica.re/stats/notification/forapplication/'+ application +'/lastmonth';
//		new Ajax.Request('/proxy?url=' + encodeURIComponent(url), {
//		var url = 'http://localhost:3006/stats/notification/lastmonth';
		new Ajax.Request(url, {
			method: 'GET',
			requestHeaders : { Authorization : auth },
			contentType: 'application/json',
			onSuccess: this.onChart3Success.bind(this),
			onFailure: this.onChart3Failure.bind(this)
		});
	},
	onChart3Success: function(response) {
		var data = response.responseJSON;
		// Create a data set for the graph
		var graphData = [{
			key: this.dictionary.getText('chart_notifications_30_days'),
			values: [],
			color: this.colorRange[0]
		}];

		var check = 0;
		
		if (data.stats) {
			// Sum the data
			var sum = {};
			data.stats.forEach(function(dataPoint) {
				if (sum[dataPoint.date]) {
					sum[dataPoint.date] += dataPoint.count;
				} else {
					sum[dataPoint.date] = dataPoint.count;
				}
				check = check + dataPoint.count;
			});

			Object.keys(sum).sort().forEach(function(sumPoint) {
				graphData[0].values.push({x: new Date(sumPoint), y: sum[sumPoint]});
			});
		}
		

		if(check == 0){
			this.showChartFailureInfo();

		}else{
			nv.addGraph(function() {
				var chart = nv.models.lineChart();
				chart.xAxis.rotateLabels(-45).tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); });
				chart.yAxis.tickFormat(d3.format(',.r'));
				chart.showLegend(false);
				d3.select(this.element).datum(graphData).transition().duration(500).call(chart);
				
				nv.utils.windowResize(chart.update);
				
				return chart;
			}.bind(this));
		}
		


	},
	onChart3Failure: function(){
		console.log('failed to load chart 3');
	},
	showChartFailureInfo: function(){
		$$(this.placeholderClass)[0].addClassName('failed');
		$$(this.placeholderClass)[0].update(this.dictionary.getText('no_data_to_display_at_this_moment'));	
	}
});