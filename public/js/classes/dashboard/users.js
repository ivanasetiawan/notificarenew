Notificare.Users = Class.create({
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

		Event.observe(this.element.down('form'), 'submit', function(event) {  
			Event.stop(event);  
		}, false);
		
		Event.observe(this.element.down('.lists-delete'), 'submit', function(event) {  
			Event.stop(event);  
		}, false);
		
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
//		'change': {
//			'input[name="search"]': function(e){
//				e.stop();
//				var query = e.findElement().getValue(),application = e.findElement().next().getValue();
//				this.searchUsers(query,application,this.onSearchSuccess.bind(this),this.onSearchFailure.bind(this));
//				
//			}
//		},
		'keyup': {
			'input[name="search"]': function(e){
				e.stop();
				if (e.keyCode == 13) {
					var query = e.findElement().getValue(),application = e.findElement().next().getValue();
					this.searchUsers(query,application,this.onSearchSuccess.bind(this),this.onSearchFailure.bind(this));
				}
			}
		},
		'click': {
			'input[name="search-button"]': function(e){
				e.stop();
				if (e.keyCode != 13) {
					var query = e.findElement().previous(1).getValue(),application = e.findElement().previous().getValue();
					this.searchUsers(query,application,this.onSearchSuccess.bind(this),this.onSearchFailure.bind(this));
				}
			},
			'.generate-token': function(e){
				e.stop();
				var button = e.findElement();
				this.accessTokenPlaceholder = button.up('.access-token');
				var userID = button.up('tr').id;
				var application = $F(button.up('form').previous('form')['application']);
				this.generateToken(userID,application,this.onGenerateTokenSuccess.bind(this),this.onGenerateTokenFailure.bind(this));
				
			},
			'.delete': function(e){
				e.stop();
				var form = e.findElement().up('form');
				var application = $F(e.findElement().up('form').previous('form')['application']);
				var inputs = form.getInputs('checkbox');
	    		inputs.each(function (elem) {
	    			if(elem.checked){
	    				this.deleteUser(elem.getValue(),application);
	    			}
	    		}.bind(this));				
			}
		}
	},
	/**
	 * 
	 */
	searchUsers: function(query,application,success,failure){
		if(query && application){
			var loader = new Element('div',{'class':'loader'});
			this.element.down('.users-list').update(loader);
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
		var data = {};
		data.dictionary = this.dictionary;
		data.profiles = users;
		this.element.down('.users-list').update(this.templates.users.process(data));
		this.element.down('.users-list').observe('click', Event.delegate(this.delegates['.generate-token']).bindAsEventListener(this));
		this.element.down('.users-list').observe('click', Event.delegate(this.delegates['.delete']).bindAsEventListener(this));
		
		users.each(function(user){
			var usr = user.user;
			this.getDevices(usr._id,usr.userID,usr.application,this.onGetDevicesSuccess.bind(this));
			this.getAvatar(usr.userID,this.onGetAvatarSuccess.bind(this));
		}.bind(this));
	},	
	onSearchFailure: function(data){
		this.element.down('.users-list').update('');		
	},
	/**
	 * 
	 */
	generateToken: function(user,application,success,failure){
		new Ajax.Request('/api/generatetoken', {
			method: 'GET',
			parameters:{
				'userID': user,
				'applicationID': application
			},
			onSuccess: success.bind(this),
			onFailure: (failure) ? failure.bind(this) : null
		});
	},
	onGenerateTokenSuccess: function(response){
		var token =  response.responseJSON;
		this.accessTokenPlaceholder.update('<span class="small"><strong>'+ this.dictionary.getText('access_token') +': </strong>'+ token.accessToken +'</span><div><a href="" class="btn generate-token">'+ this.dictionary.getText('regenerate_access_token') +'</a></div>');
	},	
	onGenerateTokenFailure: function(data){
		console.log(data);		
	},
	/**
	 * 
	 */
	getDevices: function(user,userID,application,success,failure){
		//var scope = this;
		new Ajax.Request('/api/devicesforuser', {
			method: 'GET',
			parameters:{
				'userID': userID,
				'applicationID': application
			},
			onSuccess: success.bind(this),
			onFailure: (failure) ? failure.bind(this) : null
		});
	},
	onGetDevicesSuccess: function(response){
		var r =  response.responseJSON;
		if(r.devices.length > 0){
			var data = {};
			data.dictionary = this.dictionary;
			data.devices = r.devices;
			$(r.devices[0].userID).update(this.templates.devices.process(data));				
		}else{
			$(response.request.parameters.userID).update(this.dictionary.getText('no_devices_found'));
		}

	},	
	onGetDevicesFailure: function(data){
		console.log(data);		
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
		var data = {};
		data.dictionary = this.dictionary;
		data.avatar = r.avatar;
		$('avatar-'+r.avatar.userID).update(this.templates.avatar.process(data));	
	},	
	onGetAvatarFailure: function(data){
		console.log(data);		
	},
	/**
	 * 
	 */
	deleteUser: function(userID,application){
		//var scope = this;
		new Ajax.Request('/api/deleteuser', {
			method: 'GET',
			parameters:{
				'userID': userID,
				'applicationID': application
			},
			onSuccess: $(userID).fade().remove(),
			onFailure:  null
		});
	}
});