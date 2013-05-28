Notificare.Websockets = Class.create({
	initialize: function(element, options){
		Object.extend(this, pH8.Mixin.needsTemplates);
		Object.extend(this, pH8.Mixin.needsDictionary);
		Object.extend(this, pH8.Mixin.needsConfig);

		this.element = $(element);
		this.options = Object.extend({
			maxresults: 5,
			language: pH8.currentLanguage
		}, options || {});

		//this.waitForTemplates(this.options.templates, this.onTemplatesLoaded.bind(this));
		this.waitForDictionary(this.onDictionaryLoaded.bind(this), this.options.language);
		this.waitForConfig(this.onConfigLoaded.bind(this));
		
		
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
			this.setWebsocket();
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
	setWebsocket: function(){
		this.socket = new WebSocket(this.options.source,[this.options.protocols]);
		
		this.socket.onopen = function () {
			this.onSocketOpen();
		}.bind(this);

		this.socket.onmessage = function (msg) {
			this.onSocketMessage(msg);
		}.bind(this);
		
		this.socket.onclose = function () {
			this.onSocketClose();
		}.bind(this);
		
	},
	onSocketOpen: function(){
		this.socket.send(JSON.stringify({"command":"register"}));
	},
	onSocketMessage: function(message){
		if (message.data) {
			var data = JSON.parse(message.data);
			if (data.registration) {
				this.registerDevice(data.registration.uuid);
			} else if (data.notification) {
				this.getNotification(data.notification.id);
			}
		}
	},
	onSocketClose: function(){
		console.log('closed');
	},
	registerDevice: function(uuid) {
		new Ajax.Request('https://push.notifica.re/device', {
			method: 'POST',
			parameters:{
				deviceID: uuid,
				userID: this.options.userID,
				userName: this.options.userName,
				osVersion: "6.1",
				appVersion: "1.0",
				transport: "Websocket",
				platform: "Web",
				sdkVersion: "0.0.1"
			},
			requestHeaders: {
				Authorization: 'Basic ' + Base64.encode(this.options.applicationKey + ':' + this.options.applicationSecret)
			},
			onSuccess: this.onRegisterDevice.bind(this),
	        onException: this.onRegisterError.bind(this),
	        onFailure: this.onRegisterError.bind(this)
		});
	},
	onRegisterDevice: function(response) {
		console.log("Registered device");
	},
	onRegisterError: function(response) {
		console.log("Error registering");
	},
	getNotification: function(notificationId) {
		new Ajax.Request('https://push.notifica.re/notification/' + notificationId, {
			method: 'GET',
			requestHeaders: {
				Authorization: 'Basic ' + Base64.encode(this.options.applicationKey + ':' + this.options.applicationSecret)
			},
			onSuccess: this.onGetNotification.bind(this),
	        onException: this.onGetNotificationError.bind(this),
	        onFailure: this.onGetNotificationError.bind(this)
		});
	},
	onGetNotification: function(response) {
		this.showNotification(response.responseJSON.notification);
	},
	onGetNotificationError: function(response) {
		console.log("Error getting notification");
	},
	showNotification: function(notification) {
		console.log(notification);
		var html = '<p>' + notification.message + '</p>';
		if (notification.type == 're.notifica.notification.Image' && notification.content) {
			notification.content.each(function(content) {
				html += '<p><img src="' + content.data + '" /></p>';
			});
		}
		if (notification.actions) {
			notification.actions.each(function(action) {
				if (action.type == 're.notifica.action.Browser') {
					html += '<p><a href="' + action.target + '">' + action.label + '</a></p>';
				}
			});
		}
		this.element.innerHTML = html;
	}
});
