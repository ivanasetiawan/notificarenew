Notificare.Audience = Class.create({
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

		this.colorRange = ['#466f77','#92c4cf','#bfd5d8','#39321f','#5c4f3f','#ad9b87','#ebe5e0','#7d2214','#d56351','#57710f','#a7c84a'];

		this.geocoder = new google.maps.Geocoder();
		
		this.mapElement = $('map-geo-location');
		this.radius = this.element['radius'].getValue();
		
		this.circles = [];

		this.application = $F(this.element['app']);

//		Event.observe(this.element,'submit', function(e) {
//			console.log(e);
//			Event.stop(e);
//			return false;
//		});

		this.element.down('.user-select-field').down('select').hide();
		this.element.down('.device-select-field').down('select').hide();
		
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
			
			if(this.options.showMap=='1'){
				this.showMap();
				this.reloadCircle(this.options.center.lat(),this.options.center.lng(),parseInt(this.element['radius'].value));
			}else{

//				if (navigator.geolocation) {
//					navigator.geolocation.getCurrentPosition(this.onLocationSuccess.bind(this), this.onLocationError.bind(this));
//				}
			}

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
		'keyup': {
			'input[name="search"]': function(e){
				e.stop();
				if (e.keyCode == 13) {
					var query = e.findElement().getValue();
					this.searchLocation(query,this.onSearchLocationSuccess.bind(this));
				}
			},
			'input[name="user-search"]': function(e){
				e.stop();
				e.stopPropagation();
				var query = e.findElement().getValue();
				if(query && query.length > 1){
					this.searchUsers(query,this.application,this.onSearchSuccess.bind(this),this.onSearchFailure.bind(this));					
				}
			},
			'input[name="device-search"]': function(e){
				e.stop();
				e.stopPropagation();
				var query = e.findElement().getValue();
				if(query && query.length > 1){
					this.getDevice(query,this.application,this.onGetDeviceSuccess.bind(this),this.onGetDeviceFailure.bind(this));					
				}
			}
		},
		'click': {
			'input[name="search-button"]': function(e){
				e.stop();
				if (e.keyCode != 13) {
					var query = e.findElement().previous().getValue();
					this.searchLocation(query,this.onSearchLocationSuccess.bind(this));
				}
			},
			'.steps': function(e){
				
				var element = e.findElement();
				
				if(!element.hasClassName('active')){
					e.stop();
				}
				
			},
			'.close': function(e){
				e.stop();
				this.userInfoBg.remove();
				this.userInfoData.remove();
				this.userInfoBg = null;
				this.userInfoData = null;
			},
			'.remove': function(e){
				e.stop();

			},
			'.user-search-results a': function(e){
				e.stop();		
				e.findElement().down().remove();
				this.addUser(e.findElement().up().id,e.findElement().innerHTML);
				e.findElement().up().remove();
			},
			'.delete-recipient': function(e){
				e.stop();
				this.removeUser(e.findElement().up().id);
			},
			'.device-search-results a': function(e){
				e.stop();		
				e.findElement().down().remove();
				this.addDevice(e.findElement().up().id,e.findElement().innerHTML);
				e.findElement().up().remove();
			},
			'.delete-device': function(e){
				e.stop();
				this.removeDevice(e.findElement().up().id);
			},
			'.go-next': function(e){
//				e.stopPropagation();
//				e.cancelBubble = true;
//				var form = e.findElement().up('form');
//				form.submit();
			},
			'.icon-selection': function(e){
				e.stop();
//				console.log(e.findElement(),this.element.down('.users'));
				var target = e.findElement(),users = this.element.down('.users'),
				devices = this.element.down('.devices'),
				location = this.element.down('.location'),
				//select = this.element.down('.select-box').down('select'),
				li = target.up('li');
				
//				console.log(target.hasClassName('user'),target.hasClassName('device'));

				users.hide();
				devices.hide();
				location.hide();
				
				target.up('ul').childElements().each(function(e){
					
					e.removeClassName('active');
					
					
				}.bind(this));
				console.log(this.element['audience-type']);
				if(target.hasClassName('p-users')){
					users.show();
					$('usersearch').focus();
					this.element['audience-type'].value="users";
					li.addClassName('active');
				}else if (target.hasClassName('p-devices')){
					devices.show();
					this.element['audience-type'].value="devices";
					li.addClassName('active');
				}else if(target.hasClassName('p-location')){
					location.show();
					this.showMap();
					this.element['audience-type'].value="location";
					li.addClassName('active');
				}else if(target.hasClassName('p-broadcast')){
					this.element['audience-type'].value="broadcast";
					li.addClassName('active');
				}
				
			}
		},
		'change': {
			'select[name="audience-type"]': function(e){
				e.stop();
				
				var select = e.findElement(),
				target = select.getValue(),
				users = select.up('.field').next(0),
				devices = select.up('.field').next(1),
				location = select.up('.field').next(2);

				users.hide();
				devices.hide();
				location.hide();
				if(target == 'users'){
					users.show();
					$('usersearch').focus();
				}else if (target == 'devices'){
					devices.show();
				}else if(target == 'location'){
					location.show();
					this.showMap();
				}
			},
			'select[name="radius"]': function(e){
				e.stop();
				this.reloadCircle(this.element['latitude'].value,this.element['longitude'].value,e.findElement().value);
			}
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

		this.map = new google.maps.Map(this.mapElement, mapOptions);

	},
	loadDevices: function(latitude,longitude,radius,application,success,failure){
		new Ajax.Request('/api/devicesbylocation', {
			method: 'GET',
			parameters:{
				'latitude': latitude,
				'longitude': longitude,
				'radius': radius,
				'applicationID': application
			},
			onSuccess: success.bind(this),
			onFailure: (failure) ? failure.bind(this) : null
		});
	},
	onLoadSuccess: function(data){

		data.responseJSON.each(function(m){
			
			var marker = new google.maps.Marker({
				map:this.map,
				icon: this.icon,
				position: new google.maps.LatLng(m.location.coordinates[1],m.location.coordinates[0]),
				draggable:false
			});
			
			this.markers.push({'id': i+1,'marker':marker,'data': m});
						
			marker.setMap(this.map);
			google.maps.event.addListener(marker, 'click',this.openInfoWindow.bind(this));

		}.bind(this));
		
		//this.showAllMarkers();

	},
	onLoadFailure: function(){
		console.log('failed to load');
	},
	openInfoWindow: function(e){

		this.loader = new Element('div',{'class':'map-loader'});
		this.mapElement.insert(this.loader);
		
		if(this.userInfoBg && this.userInfoData){
			this.userInfoBg.remove();
			this.userInfoData.remove();
		}
		
		this.userInfoBg = new Element('div',{'class':'user-overlay'});
		this.userInfoData = new Element('div',{'class':'user-info'});
		this.userInfoBg.hide();
		this.userInfoData.hide();
		var data = {};
		data.dictionary = this.dictionary;
		
		this.markers.each(function(marker,index){

			if(marker.marker.getPosition()===e.latLng){
				this.activeMarkerIndex = index;
			}
		}.bind(this));

		data.device = this.markers[this.activeMarkerIndex];
			
		this.userInfoData.update(this.templates.userInfo.process(data));
		
//		var infoWindow = new google.maps.InfoWindow({
//            content: this.userInfoData.innerHTML
//        });
//		
//		console.log(this.userInfoData);
//		infoWindow.open(this.map, this.markers[this.activeMarkerIndex].marker);

		this.mapElement.insert({'after':this.userInfoBg});
		this.mapElement.insert({'after':this.userInfoData});
		this.getAvatar(this.markers[this.activeMarkerIndex].data.userID,this.onGetAvatarSuccess.bind(this));
		
	},
	showAllMarkers: function(){
		
		if(this.markers.length >0){
			var points = [];
			
			this.markers.each(function(marker){
				points.push(marker.marker.getPosition());
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
	searchLocation: function(query,success){
		this.geocoder.geocode( { 'address': query}, success.bind(this));
	},
	onSearchLocationSuccess: function(results,status){
		if(status == google.maps.GeocoderStatus.OK){
			
			this.reloadCircle(results[0].geometry.location.lat(),results[0].geometry.location.lng(),this.element['radius'].value);

		}else{
			this.onSearchLocationFailure();
		}
	},
	onSearchLocationFailure: function(){
		console.log('failed to search location');
	},
	reloadCircle: function(latitude,longitude,distance){
		this.circles.each(function(circle){
			circle.setMap(null);
		});
		
		this.markers.each(function(marker){
			marker.marker.setMap(null);
		});
		
		this.circles = [];
		this.markers = [];
		
		this.element['latitude'].value = latitude;
		this.element['longitude'].value = longitude;
		this.element['distance'].value = distance;
			
		//this.center = new google.maps.LatLng(latitude,longitude);
		this.map.setCenter(new google.maps.LatLng(latitude,longitude));
		var location = new google.maps.Circle({
			center: new google.maps.LatLng(latitude,longitude),
			radius: parseInt(distance)*1000,
			strokeColor: this.colorRange[0],
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: this.colorRange[1],
			fillOpacity: 0.4
		});

		location.setMap(this.map);
		
		this.circles.push(location);
		
		this.loadDevices(latitude,longitude,distance,this.application,this.onLoadSuccess.bind(this),this.onLoadFailure.bind(this));

	},
	/**
	 * 
	 */
	getAvatar: function(userID,success,failure){

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
		var data = {};
		data.dictionary = this.dictionary;
		data.avatar = r.avatar;
		$(r.avatar.userID).update(this.templates.avatar.process(data));	
		this.loader.remove();
		this.userInfoBg.show();
		this.userInfoData.show();
	},	
	onGetAvatarFailure: function(data){
		console.log(data);		
	},
	/**
	 * 
	 */
	searchUsers: function(query,application,success,failure){
		if(query && application){
			
			this.element.down('.user-search-results').update('');
			
			var loader = new Element('div',{'class':'search-loader'});
			
			this.element.down('.user-search-results').show();
			this.element.down('.user-search-results').insert(loader);
			
			new Ajax.Request('/api/searchusers', {
				method: 'GET',
				parameters:{
					'q': query,
					'applicationID': application
				},
				onSuccess: success.bind(this),
				onFailure: (failure) ? failure.bind(this) : null
			});			
		}
	},
	onSearchSuccess: function(response){
		var users =  response.responseJSON;	
		
		var recipients = [];
		
		recipients = this.element.down('.user-select-field').down('select').childElements();

		if(users.length == 0){
			this.element.down('.user-search-results').update('<div class="no-results">' + this.dictionary.getText('no_users_found') + '</div>');
		}else{
			this.element.down('.user-search-results').update('');
			users.each(function(user){
				
				var isListed = false;

				recipients.each(function(recipient){

					if (recipient.value == user.user.userID) {
						isListed = true;
					}
				}.bind(this));
			
				if(!isListed){
					var usr = user.user;
					this.element.down('.user-search-results').insert('<ul></ul>');
					this.element.down('.user-search-results').down().insert({top: '<li id="user_'+ usr.userID +'"><a href=""><img src="/images/ajax-loader.gif" class="avatar">' + usr.userName + '</a></li>'});
					this.getAvatar(usr.userID,this.onGetUserAvatarSuccess.bind(this));
				}
				
			}.bind(this));
		}

	},	
	onSearchFailure: function(data){
		this.element.down('.user-search-results').update('');	
	},
	addUser: function(id,username){
		this.element.down('.user-search-results').insert('<ul></ul>');
		this.element.down('.user-list').down().insert({top: '<li id="'+ id +'"><span>' + username + '</span> <a href="" class="delete-recipient">'+ this.dictionary.getText('x') +'</a></li>'});
		
		this.element.down('.user-search-results').hide();
		this.element.down('.user-search-results').update('');
		$('usersearch').focus();
		$('usersearch').value='';
		$('usersearch').setAttribute('placeholder','');
		
		this.setUser(id);
	},
	removeUser: function(id){
		$(id).remove();
		this.element.down('.user-select-field').down('select').childElements().each(function(user){
			
			var usr  = id.replace('user_','');
			
			if(user.value == usr){
				user.selected = false;
				user.remove();
			}
		}.bind(this));	
		
		if(this.element.down('.user-list').down().childElements().length>1){
			$('usersearch').setAttribute('placeholder','');
		}else{
			
			$('usersearch').setAttribute('placeholder',this.dictionary.getText('type_a_username'));
		}
		
	},
	setUser: function(id){
		var user  = id.replace('user_','');
		this.element.down('.user-select-field').down('select').insert('<option value="'+ user +'">'+ user +'</option>');
		this.element.down('.user-select-field').down('select').childElements().each(function(user){
			user.selected = true;
		}.bind(this));	
	},
	/**
	 * 
	 */
	onGetUserAvatarSuccess: function(response){
		var r =  response.responseJSON;
		$('user_' + r.avatar.userID).down().down().src = r.avatar.picture;
	},	
	onGetUserAvatarFailure: function(data){
		console.log(data);		
	},

	/**
	 * 
	 */
	getDevice: function(deviceID,application,success,failure){
		if(deviceID && application){
			
			this.element.down('.device-search-results').update('');
			
			var loader = new Element('div',{'class':'search-loader'});
			
			this.element.down('.device-search-results').show();
			this.element.down('.device-search-results').insert(loader);
			new Ajax.Request('/api/device', {
				method: 'GET',
				parameters:{
					'deviceID': deviceID,
					'applicationID': application
				},
				onSuccess: success.bind(this),
				onFailure: (failure) ? failure.bind(this) : null
			});
		}
	},
	onGetDeviceSuccess: function(response){
		var device =  response.responseJSON;
		var recipients = [];
		
		recipients = this.element.down('.device-select-field').down('select').childElements();

		if(device){
			this.element.down('.device-search-results').update('');
			
			var isListed = false;

			recipients.each(function(recipient){

				if (recipient.value == device.device.deviceID) {
					isListed = true;
				}
			}.bind(this));
		
			if(!isListed){
				var d = device.device;
				this.element.down('.device-search-results').insert('<ul></ul>');
				this.element.down('.device-search-results').down().insert({top: '<li id="device_'+ d.deviceID +'"><a href=""><img src="/images/ajax-loader.gif" class="avatar">' + d.deviceString + '</a></li>'});
				this.device = d.deviceID;
				this.getAvatar(d.userID,this.onGetDeviceAvatarSuccess.bind(this));
			}
		}else{

			this.element.down('.device-search-results').update('<div class="no-results">' + this.dictionary.getText('no_device_found') + '</div>');
			
		}
//		if(r.devices.length > 0){
//			var data = {};
//			data.dictionary = this.dictionary;
//			data.devices = r.devices;
//			$(r.devices[0].userID).update(this.templates.devices.process(data));				
//		}else{
//			$(response.request.parameters.userID).update(this.dictionary.getText('no_devices_found'));
//		}

	},	
	onGetDeviceFailure: function(data){
		console.log(data);		
	},
	addDevice: function(id,device){
		this.element.down('.device-search-results').insert('<ul></ul>');
		this.element.down('.device-list').down().insert({top: '<li id="'+ id +'"><span>' + device + '</span> <a href="" class="delete-device">'+ this.dictionary.getText('x') +'</a></li>'});
		
		this.element.down('.device-search-results').hide();
		this.element.down('.device-search-results').update('');
		$('devicesearch').focus();
		$('devicesearch').value='';
		$('devicesearch').setAttribute('placeholder','');
		
		this.setDevice(id);
	},
	removeDevice: function(id){
		$(id).remove();
		
		this.element.down('.device-select-field').down('select').childElements().each(function(device){
			var dvc  = id.replace('device_','');
			if(device.value == dvc){
				device.selected = false;
				device.remove();
			}
		}.bind(this));	
		
		if(this.element.down('.device-list').down().childElements().length>1){
			$('devicesearch').setAttribute('placeholder','');
		}else{
			
			$('devicesearch').setAttribute('placeholder',this.dictionary.getText('type_a_device'));
		}
		
	},
	setDevice: function(id){
		var device  = id.replace('device_','');
		this.element.down('.device-select-field').down('select').insert('<option value="'+ device +'">'+ device +'</option>');
		this.element.down('.device-select-field').down('select').childElements().each(function(device){
			device.selected = true;
		}.bind(this));	
	},
	/**
	 * 
	 */
	onGetDeviceAvatarSuccess: function(response){
		var r =  response.responseJSON;
		$('device_' + this.device).down().down().src = r.avatar.picture;
	},	
	onGetDeviceAvatarFailure: function(data){
		console.log(data);		
	}
});