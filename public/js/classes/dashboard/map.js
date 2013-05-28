Notificare.Map = Class.create({
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
		
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(this.onLocationSuccess.bind(this), this.onLocationError.bind(this));
		}

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
	onLocationSuccess: function(position){
		this.userLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
		this.map.setCenter(this.userLocation);
	},
	onLocationError: function(){

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
			center : (this.userLocation) ? this.userLocation : this.options.center,
			mapTypeId : this.options.mapTypeId,
			mapTypeControl: false,
			panControl: false,
			streetViewControl: false
		};

		this.map = new google.maps.Map(this.element, mapOptions);
		google.maps.event.addListener(this.map,'click',this.addMarker.bind(this));
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
				draggable:true
			});
			
			this.markers.push({'id': i+1,'marker':marker,'data': m.data});
			
			google.maps.event.addListener(marker, 'dragstart',this.willPositionMarker.bind(this));
			google.maps.event.addListener(marker, 'dragend',this.onPositionMarker.bind(this));
			google.maps.event.addListener(marker, 'click',this.willEditMarker.bind(this));
			
			marker.setMap(this.map);

		}.bind(this));
		
		this.showAllMarkers();

	},
	onLoadFailure: function(){
		console.log('failed to load');
	},
	/**
	* Place marker
	*/
	addMarker: function(e){

		var marker = new google.maps.Marker({
			map:this.map,
			icon: this.icon,
			position: e.latLng,
            draggable:true
		});
		
		
		var i = 1;
		if(this.markers.length>0){
			i = this.markers.length;
		}
		this.markers.push({'id':i,
							'marker':marker,
							'data':{
								'title':'',
								'description':'',
								'latitude':marker.getPosition().lat(),
								'longitude':marker.getPosition().lng()
							}});
		
		
		marker.setMap(this.map);
		this.map.setCenter(e.latLng);
		
		this.showForm(this.markers.length-1,'insert');
		
		google.maps.event.addListener(marker, 'dragstart',this.willPositionMarker.bind(this));
		google.maps.event.addListener(marker, 'dragend',this.onPositionMarker.bind(this));
		google.maps.event.addListener(marker, 'click',this.willEditMarker.bind(this));

	},
	showAllMarkers: function(){
		
		if(this.markers.length > 2){
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
	},
	/**
	 * 
	 * 
	 */
	willPositionMarker: function(e){
		var index;
		this.markers.each(function(marker,i){

			if(e.latLng.lat() == parseFloat(marker.data.latitude) && e.latLng.lng() == parseFloat(marker.data.longitude)){
				index = i;
				console.log(i);
			}
		});
		
		this.activeMarkerIndex = index;

	},
	onPositionMarker: function(m){
		//get the data first from the active marker index and 
		//remove the marker from array and db
		//insert a new marker in array with the new data
		
		if(this.markers && this.markers[this.activeMarkerIndex]){
			
			this.markers[this.activeMarkerIndex].marker.setMap(null);
			
			this.markers[this.activeMarkerIndex].data.latitude = m.latLng.lat();
			this.markers[this.activeMarkerIndex].data.longitude = m.latLng.lng();

			var marker = new google.maps.Marker({
				map:this.map,
				icon: this.icon,
				position: m.latLng,
	            draggable:true
			});
			
			this.markers[this.activeMarkerIndex].marker = marker;
			
			google.maps.event.addListener(marker, 'dragstart',this.willPositionMarker.bind(this));
			google.maps.event.addListener(marker, 'dragend',this.onPositionMarker.bind(this));
			google.maps.event.addListener(marker, 'click',this.willEditMarker.bind(this));

			this.editMarker(this.markers[this.activeMarkerIndex],null, null);
			
		}
	},
	/**
	 * 
	 * 
	 */
	showForm: function(index,type){
		var data = {};
		data.dictionary = this.dictionary;

		data.title = this.markers[index].data.title;
		data.description = this.markers[index].data.description;
			
		this.overlay = new Element('div', { 'class': 'map-overlay'}).update(this.templates.editMarker.process(data));		
		this.element.insert({'after':this.overlay});
		this.activeMarkerIndex = index;
		
		if(type=='insert'){
			this.overlay.down('.save-marker').observe('click', this.onSaveMarker.bind(this));
		}else{
			this.overlay.down('.save-marker').observe('click', this.onEditMarker.bind(this));
		}
		this.overlay.down('.delete-marker').observe('click', this.onDeleteMarker.bind(this));
	},
	/**
	 * 
	 * 
	 */
	onSaveMarker: function(e){
		e.stop();
		var title = e.findElement().previous(1),description = e.findElement().previous();
		this.markers[this.activeMarkerIndex].data.title = title.getValue();
		this.markers[this.activeMarkerIndex].data.description = description.getValue();
		this.saveMarker(this.markers[this.activeMarkerIndex],this.onSaveSuccess.bind(this),this.onSaveFailure.bind(this));
	},
	saveMarker: function(marker,success,failure){
		new Ajax.Request('/api/addmarker', {
			method: 'GET',
			parameters:{
				title: marker.data.title,
				description: marker.data.description,
				latitude: marker.data.latitude,
				longitude: marker.data.longitude
			},
			onSuccess: success.bind(this),
			onFailure: (failure) ? failure.bind(this) : null
		});
	},
	onSaveSuccess: function(){
		this.overlay.fade({ 
			duration: 1.0, 
			from: 1, 
			to: 0
		});
		
		this.showAllMarkers();
	},
	onSaveFailure: function(){
		console.log('failed');
	},
	/**
	 * 
	 * 
	 */
	willEditMarker: function(e){
		e.stop();

		this.markers.each(function(marker,index){
			if(marker.data.latitude == e.latLng.lat() && marker.data.longitude == e.latLng.lng()){
				this.activeMarkerIndex = index;
			}
		}.bind(this));
		
		this.showForm(this.activeMarkerIndex,'edit');
	},
	/**
	 * 
	 * 
	 */
	onEditMarker: function(e){
		e.stop();
		var title = e.findElement().previous(1),description = e.findElement().previous();
		this.markers[this.activeMarkerIndex].data.title = title.getValue();
		this.markers[this.activeMarkerIndex].data.description = description.getValue();
		this.editMarker(this.markers[this.activeMarkerIndex],this.onEditSuccess.bind(this),this.onEditFailure.bind(this));
	},
	editMarker: function(marker,success,failure){
		new Ajax.Request('/api/editmarker', {
			method: 'GET',
			parameters:{
				index: this.activeMarkerIndex,
				title: marker.data.title,
				description: marker.data.description,
				latitude: marker.data.latitude,
				longitude: marker.data.longitude
			},
			onSuccess: (success) ? success.bind(this) : null,
			onFailure: (failure) ? failure.bind(this) : null
		});
	},
	onEditSuccess: function(){
		this.overlay.fade({ 
			duration: 1.0, 
			from: 1, 
			to: 0
		});

	},
	onEditFailure: function(){
		console.log('failed');
	},
	/**
	 * 
	 * 
	 */
	onDeleteMarker: function(e){
		e.stop();
		this.markers[this.activeMarkerIndex].marker.setMap(null);
		this.deleteMarker(this.markers[this.activeMarkerIndex],this.onDeleteSuccess.bind(this),this.onDeleteFailure.bind(this));
	},
	deleteMarker: function(marker,success,failure){
		new Ajax.Request('/api/removemarker', {
			method: 'GET',
			parameters:{
				title: marker.data.title,
				description: marker.data.description,
				latitude: marker.data.latitude,
				longitude: marker.data.longitude
			},
			onSuccess: (success) ? success.bind(this) : null,
			onFailure: (failure) ? failure.bind(this) : null
		});
	},
	onDeleteSuccess: function(){
		this.overlay.fade({ 
			duration: 1.0, 
			from: 1, 
			to: 0
		});
		
		this.showAllMarkers();
	},
	onDeleteFailure: function(){
		console.log('failed');
	}
	
});