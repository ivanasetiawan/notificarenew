Notificare.Notifications = Class.create({
	initialize: function(element, options){
		Object.extend(this, pH8.Mixin.needsTemplates);
		Object.extend(this, pH8.Mixin.needsDictionary);
		Object.extend(this, pH8.Mixin.needsConfig);

		this.element = $(element);
		this.options = Object.extend({
			maxresults: 5,
			language: pH8.currentLanguage
		}, options || {});

		this.waitForTemplates(this.options.templates, this.onTemplatesLoaded.bind(this));
		this.waitForDictionary(this.onDictionaryLoaded.bind(this), this.options.language);
		this.waitForConfig(this.onConfigLoaded.bind(this));

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
			this.setEventDelegates();
			this.loadInfo();
		}
	},
	/**
	 * Loops over delegates and create event listeners for it
	 */
	setEventDelegates: function(){
		$H(this.delegates).each(function(pair){
			if(pair.key == 'blur'){
				$H(pair.value).each(function(couple){
					this.setEventListenerOnElement(couple.key, pair.key, couple.value);
				}.bind(this));
			}else{
				this.element.observe(pair.key, Event.delegate(this.delegates[pair.key]).bindAsEventListener(this));
				
			}
		}.bind(this));
	},
	/**
	 * Helper function to set a EventListener to a event
	 * @param cssQuery
	 * @param eventType
	 * @param listener
	 */
	setEventListenerOnElement: function(cssQuery, eventType, listener){
		var element = this.element.down(cssQuery);
		if(element){
			element.observe(eventType, listener.bindAsEventListener(this));
		}
	},
	/**
	 * Event delegates
	 */
	delegates: {
		'click': {
			'.open-notification': function(e){
				e.stop();
				var notification = e.findElement().up('tr').id;
				var application = $F(e.findElement().up('form')['application']);
				this.getInfo(notification,application,this.onRepliesSuccess.bind(this),this.onRepliesFailure.bind(this));
			}
		}
	},
	/**
	 * 
	 */
	loadInfo: function(){
		var notification = this.element.down('tr').id;
		var application = $F(this.element.down('form')['application']);
		this.getInfo(notification,application,this.onSuccess.bind(this),this.onFailure.bind(this));
	},
	/**
	 * 
	 */
	getInfo: function(notification,application,success,failure){
		if(notification && application){
			if(this.loader){
				this.loader.remove();
			}
			
			this.loader = new Element('div',{'class':'loader'});
			$(notification).next('tr').down('.notification-info').insert({top:this.loader});
			$(notification).next('tr').down('.notification-info').down('.preview-message').hide();
			$(notification).next('tr').down('.notification-info').down('.insights').hide();
			new Ajax.Request('/api/notification', {
				method: 'GET',
				parameters:{
					'notification': notification,
					'application': application
				},
				onSuccess: success.bind(this),
				onFailure: (failure) ? failure.bind(this) : null
			});			
		}
	},
	onSuccess: function(response){
		var notification =  response.responseJSON;
		var data = {};
		data.dictionary = this.dictionary;
		data.info = notification.info;
		data.replies = notification.replies;
		this.replies = notification.replies;
		this.loader.remove();
		
		if(notification.cleared){
			console.log('ehgererere');
			$(notification.info._id).next('tr').down('td').update(this.dictionary.getText('notification_cleared_no_preview_info'));
		}else{
			$(notification.info._id).next('tr').down('.notification-info').down('.preview-message').show();
			$(notification.info._id).next('tr').down('.notification-info').down('.insights').show();		
		}
		

		var insights = $(notification.info._id).next('tr').down('.notification-info').down('.insights');	
		insights.update(this.templates.replies.process(data));
				
		$$('.time-ago').each(function(d){
			var timeago = moment(d.innerHTML).fromNow();
			d.update(timeago); 
		});
		
		notification.replies.each(function(r){
			this.getAvatar(r.userID, this.onGetAvatarSuccess.bind(this), this.onGetAvatarFailure.bind(this));
		}.bind(this));



		//If theres more than one action show chart
		if(!notification.cleared && notification.replies.length>1 && notification.info.actions.length>1){
			
			var averageplc = new Element('div',{'class':'average-response'});
			var header = new Element('h3');
			var time = new Element('span',{'class':'time'});
			var timeunit = new Element('span',{'class':'time-unit'});
			header.update(this.dictionary.getText('average_response_time'));
			var average = this.calculateAverage(notification.replies,notification.info.time);	
			var value = average.split(" ");
			time.update(value[0]);
			timeunit.update(value[1]);
			averageplc.insert({'top':header});
			averageplc.insert({'bottom':time});
			averageplc.insert({'bottom':timeunit});
			insights.insert({'top':averageplc});
			
			
			var piechart = new Element('div',{'class':'chart'});
			piechart.insert('<svg style="height: 200px; width: 200px;"></svg>');
			insights.insert({'top':piechart});
			
			this.pieChartData =[];

			notification.info.actions.each(function(a){
				var entry={"label" : a.label ,"value" : 0};
				this.pieChartData.push(entry);
			}.bind(this));
			
			this.pieChartData.each(function(a){
				a.value = this.countResults(a.label);
			}.bind(this));
			
			this.showPieChart(piechart);
		}
			
			
		var preview = $(notification.info._id).next('tr').down('.notification-info').down('.preview-message');	
		var type = notification.info.type;
		
		if(type=='re.notifica.notification.Alert'){
			preview.update(this.templates.alert.process(data));
		}else if(type=='re.notifica.notification.WebView'){
			preview.update(this.templates.webview.process(data));

		}else if(type=='re.notifica.notification.URL'){
			preview.update(this.templates.url.process(data));
			
		}else if(type=='re.notifica.notification.Image'){
			
			preview.update(this.templates.image.process(data));
			
		}else if(type=='re.notifica.notification.Video'){
			preview.update(this.templates.video.process(data));

		}else if(type=='re.notifica.notification.Map'){
			preview.update(this.templates.map.process(data));
			
		}else if(type=='re.notifica.notification.Rate'){
			preview.update(this.templates.rate.process(data));

		}else if(type=='re.notifica.notification.Form'){
			preview.update(this.templates.form.process(data));

		}else if(type=='re.notifica.notification.Passbook'){
			preview.update(this.templates.passbook.process(data));

		}else{
			preview.update(this.templates.alert.process(data));	

		}

	},	
	onFailure: function(data){
		this.loader.remove();
		console.log('failed');
	},
	countResults: function(label){
		var count = 0;
		this.replies.each(function(d){
			if(label == d.label){
				count++;
			}
		});
		return count;
	},
	calculateAverage: function(replies,startdate){
		
		var date = new Date(startdate).getTime(); 
		var responseTimes = [];
		replies.each(function(r){
			var t = new Date(r.time).getTime();
			var diff = t-date;
			responseTimes.push(diff);
		}.bind(this));
		
		//console.log(responseTimes);
		var sum = 0;
		var average;
	
		responseTimes.each(function(r){	
			sum = parseInt(sum) + parseInt(r);
		}.bind(this));
		
		average = parseInt(sum) / parseInt(responseTimes.length);

		var result = this.formatTime(average/1000);

		return result;
	},
	formatTime: function(seconds){
		//console.log(seconds);
		if(seconds < 60){
			return Math.ceil(seconds) + ' seconds';
		}else if(seconds > 60 && seconds < 3600){
			var minutes = parseInt(seconds/60);
			return Math.ceil(minutes) + ' minutes';
		}else if(seconds > 3600 && seconds < 86400){
			var hours = parseInt(seconds/(60 * 60));
			return Math.ceil(hours) + ' hours';
		}
	},
	showPieChart: function(piechart){

		nv.addGraph(function() {
			var chart = nv.models.pieChart()
	        .x(function(d) { return d.label; })
	        .y(function(d) { return d.value; })
	        .showLegend(false)
	        .values(function(d) { return d; })
	        .valueFormat(d3.format('.0'))
	        .color(this.colorRange)
	        .width(200)
	        .height(200);
			
			d3.select(piechart.down('svg'))
				.datum([this.pieChartData])
				.transition().duration(1200)
				.call(chart);
			
			nv.utils.windowResize(chart.update);
				
			return chart;
		}.bind(this));
	},
	/**
	 * 
	 */
	getAvatar: function(userID,success,failure){
		//var scope = this;
		new Ajax.Request('/api/loadavatar', {
			method: 'GET',
			parameters:{
				'userID': userID
			},
			onSuccess: success.bind(this),
			onFailure: (failure) ? failure.bind(this) : null
		});
	},
	onGetAvatarSuccess: function(response){		
		var r =  response.responseJSON;
		$$('.'+r.avatar.userID).each(function(a){
			var img = new Element('img',{'class':'media'});
			img.src= r.avatar.picture;
			a.update(img);
		}.bind(this));	
	},	
	onGetAvatarFailure: function(data){
		console.log(data);		
	}
	
});