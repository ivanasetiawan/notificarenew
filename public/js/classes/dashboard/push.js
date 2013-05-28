Notificare.Push = Class.create({
	initialize: function(element, options){
		Object.extend(this, pH8.Mixin.needsTemplates);
		Object.extend(this, pH8.Mixin.needsDictionary);
		Object.extend(this, pH8.Mixin.needsConfig);

		this.element = $(element);
		this.options = Object.extend({
			maxresults: 5,
			language: pH8.currentLanguage
		}, options || {});

		this.countFields = 1;
		
		this.waitForTemplates(this.options.templates, this.onTemplatesLoaded.bind(this));
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
		if(this.dictionaryLoaded && this.configLoaded && this.templatesLoaded){
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
		'click':{
			'.steps': function(e){
				
				var element = e.findElement();
				
				if(!element.hasClassName('active')){
					e.stop();
				}
				
			},
			'.go-next': function(e){

				if(this.type=='re.notifica.notification.WebView'){
					var html = this.editor.getData();					
			        var dyn_field  = new Element('input',{name:"editor",value: html});
					e.findElement().up().insert({top:dyn_field});

				}

			},
			'.remove': function(e){
				e.stop();
				var fieldset = e.findElement().up();
				fieldset.remove();
			}
		},
		'change':{
			'select[name="type"]': function(e){
							
				this.resetContent();
				
				var select = e.findElement(),type = select.getValue(),holder = select.up(1).next(),data = {},actions = select.up(1).next(1),actions_config = select.up(1).next(2);
				data.dictionary = this.dictionary;
				this.type = type;
				if(type=='re.notifica.notification.Alert'){
					holder.update(this.templates.alert.process(data));
				}else if(type=='re.notifica.notification.WebView'){
					holder.update(this.templates.webview.process(data));
					var config = {};
					this.editor = CKEDITOR.appendTo('editor',config,'');
				}else if(type=='re.notifica.notification.URL'){
					holder.update(this.templates.url.process(data));
					
				}else if(type=='re.notifica.notification.Image'){
					
					if( window.FormData === undefined && window.FileReader === undefined){
						holder.update(this.templates.image.process(data));
					}else{
						holder.update(this.templates.imagehtml5.process(data));
						var multiupload = $$('.multi-upload')[0];
						new Notificare.FileAPI(multiupload,{	
							maxUploadSize: multiupload.getDataAttribute('maxsize'),
							extensions: multiupload.getDataAttribute('extensions'),
							fieldName: 'file',
							dropArea: '.drop-area',
							fileList: '.file-list'
						});						
					}
					
				}else if(type=='re.notifica.notification.Video'){
					holder.update(this.templates.video.process(data));

				}else if(type=='re.notifica.notification.Map'){
					holder.update(this.templates.map.process(data));
					
					var map = $('map');
					new Notificare.Map(map, {
						token: $('user-token').getDataAttribute('token'),
						zoom: 10,
						mapTypeId: google.maps.MapTypeId.ROADMAP,
						center: new google.maps.LatLng(map.getDataAttribute('latitude'),map.getDataAttribute('longitude')),
						markerOptions:{
							iconUrl: '/images/mapMarker.png'
						},
						templates:{
							editMarker: '/js/templates/maps/edit_marker.tpl'
						}
					});

					
				}else if(type=='re.notifica.notification.Rate'){
					holder.update(this.templates.rate.process(data));

				}else if(type=='re.notifica.notification.Form'){
					holder.update(this.templates.form.process(data));

				}else if(type=='re.notifica.notification.Passbook'){
					holder.update(this.templates.passbook.process(data));

				}else{
					holder.update(this.templates.alert.process(data));	

				}

			},
			'select[name="action_type"]': function(e){
				e.stop();
				var select = e.findElement(),type = select.getValue(),holder = select.up(1).next(),data = {},formatted_type = type.split(".");				
				var fieldsets = holder.select('fieldset');
				if(fieldsets.length>0){
					data.counter = fieldsets.length+1;
				}else{
					data.counter = this.countFields;
				}
				
				data.formatted_type = this.dictionary.getText('action_'+formatted_type[3].toLowerCase());
				data.type = type;
				data.dictionary = this.dictionary;
				if(type=='re.notifica.action.Callback'){
					holder.insert({top:this.templates.callback.process(data)});	
				}else if(type=='re.notifica.action.Telephone'){
					holder.insert({top:this.templates.tel.process(data)});
				}else if(type=='re.notifica.action.SMS'){
					holder.insert({top:this.templates.sms.process(data)});
				}else if(type=='re.notifica.action.Mail'){
					holder.insert({top:this.templates.mail.process(data)});
				}else if(type=='re.notifica.action.Browser'){
					holder.insert({top:this.templates.browser.process(data)});
				}else if(type=='re.notifica.action.App'){
					holder.insert({top:this.templates.app.process(data)});
				}else if(type=='re.notifica.action.Custom'){
					holder.insert({top:this.templates.custom.process(data)});
				}else{
					
				}
				
				$$('.tooltip').each(function(e){
					new Opentip(e,e.getDataAttribute('ot'));
				});

				this.countFields++;
				select.selectedIndex = 0;

			},
			'input[name="target"]': function(e){
				e.stop();
				var select = e.findElement(),target = select.getValue(),users = select.up(3).next(),devices = select.up(3).next(1),location = select.up(3).next(2);
				users.hide();
				devices.hide();
				location.hide();
				if(target == 'users'){
					users.show();
				}else if (target == 'devices'){
					devices.show();
				}else if(target == 'location'){
					location.show();
				}
			}
		}
	},
	/**
	 * 
	 * 
	 * @param marker
	 * @param success
	 * @param failure
	 */
	resetContent: function(){
		new Ajax.Request('/api/resetcontent', {
			method: 'GET',
			onSuccess: null,
			onFailure: null
		});
	}
});
