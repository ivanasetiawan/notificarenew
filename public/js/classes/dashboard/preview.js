Notificare.Preview = Class.create({
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

		this.markers = [];
		this.icon = this.options.markerOptions.iconUrl;

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
		if(this.dictionaryLoaded && this.configLoaded && this.templatesLoaded){
			this.setEventDelegates();
			this.showMap();
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
		'change':{

		}
	},
	/**
	* Show the map
	*/
	showMap: function() {
		this.element.show();
		var mapOptions = {
			scrollwheel: true,
			zoomControlOptions: { style: google.maps.ZoomControlStyle.SMALL},
			zoom : this.options.zoom,
			center : this.options.center,
			mapTypeId : this.options.mapTypeId,
			mapTypeControl: false,
			panControl: false,
			streetViewControl: false
		};

		this.map = new google.maps.Map(this.element, mapOptions);
		this.loadMarkers(this.onLoadSuccess.bind(this),this.onLoadFailure.bind(this));
	},
	loadMarkers: function(success,failure){
		new Ajax.Request('/api/loadmarkers', {
			method: 'GET',
			onSuccess: success.bind(this),
			onFailure: (failure) ? failure.bind(this) : null
		});
	},
	onLoadSuccess: function(data){

		this.markers = [];
		
		data.responseJSON.each(function(m){
			
			var marker = new google.maps.Marker({
				map:this.map,
				icon: this.icon,
				position: new google.maps.LatLng(m.data.latitude,m.data.longitude),
				draggable:false
			});
			
			this.markers.push({'id': i+1,'marker':marker,'data': m.data});
						
			marker.setMap(this.map);

		}.bind(this));
		
		this.showAllMarkers();

	},
	onLoadFailure: function(){
		console.log('failed to load');
	},
	showAllMarkers: function(){
		
		if(this.markers.length >0){
			var points = [];
			
			this.markers.each(function(marker){
				points.push(new google.maps.LatLng(marker.data.latitude,marker.data.longitude));
			});

			var bounds = new google.maps.LatLngBounds();

			points.each(function(point){

				bounds.extend(point);
				
			}.bind(this));

			this.map.fitBounds(bounds);			
		}
	}
	
});