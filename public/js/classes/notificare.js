Notificare = Class.create({
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
		'click': {
			'.sign-in': function(e){
				e.stop();

				if(this.element.down().hasClassName('active')){
					e.findElement().next().hide();
					this.element.down().removeClassName('active');
				}else{
					e.findElement().next().show();
					this.element.down().addClassName('active');	
				}

			},
			'input[type="submit"]': function(e){
				var form = e.findElement().up('form');
				var error = form.up('.popup').down('.error');
				
				if(error){
					error.remove();
				}

				var fields = form.serialize();
				if(form[0].getValue()=="" && form[1].getValue()==""){
					e.stop();
					var error = new Element('div',{ 'class': 'error'}).update(this.dictionary.getText('signin_form_error'));
					form.insert({'before':error});
				}
				
			}
		},
		'change': {
			'select[name="accounts"]': function(e){
				window.location.href=e.findElement().value;
			}
		}
	}
});