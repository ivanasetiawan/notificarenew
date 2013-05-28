Feeds = Class.create({
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
		
		this.posts = [];
		this.placeholder = this.element.down('.scroll');
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
			this.loadFBPosts(this.onFBSuccess.bind(this),this.onFBFailure.bind(this));
			this.loadTWPosts(this.onTWSuccess.bind(this),this.onTWFailure.bind(this));
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

			}
		}
	},
	/**
	 * 
	 */
	loadFBPosts: function(success,failure){
		new Ajax.Request('/proxy?url=' + escape('https://apps.notifica.re/feeds/facebook-search/faae31f637f4da47d29ad39941b097b1b5c144e9e8ba26bd71ecb6b550c07616'), {
			method: 'GET',
			onSuccess: success.bind(this),
			onFailure: (failure) ? failure.bind(this) : null
		});
	},
	onFBSuccess: function(response){
		var fbposts =  response.responseJSON.data;
		this.posts = this.posts.concat(fbposts);
		this.fbPostAreReady = true;
		this.showPosts();
	},	
	onFBFailure: function(response){
		console.log(response);		
	},
	/**
	 * 
	 */
	loadTWPosts: function(success,failure){
		this.placeholder.update('loading...');
		new Ajax.Request('/proxy?url=' + escape('https://apps.notifica.re/feeds/twitter-search/e1285e82ae5a0df073830f785fd1674724f71dc2d04dcf8d6dc0153cf3c382ec'), {
			method: 'GET',
			onSuccess: success.bind(this),
			onFailure: (failure) ? failure.bind(this) : null
		});
	},
	onTWSuccess: function(response){
		var twposts =  response.responseJSON.data;
		this.posts = this.posts.concat(twposts);
		this.twPostAreReady = true;
		this.showPosts();
	},
	onTWFailure: function(response){
		this.placeholder.update('failed to get feeds!');
		console.log(response);		
	},
	showPosts: function(){
		
		if(this.twPostAreReady && this.fbPostAreReady){
			var data = {};
			data.dictionary = this.dictionary;
			data.posts = this.posts;
			this.placeholder.update(this.templates.facebooktpl.process(data));
			this.counter = 1;
			//this.animationTimer = new PeriodicalExecuter(this.scrollPosts.bindAsEventListener(this), 1);
		}	
	},
	scrollPosts: function(){
		console.log('moving');
		new Effect.Move(this.placeholder, { x: 0, y:'-'+this.counter*5, mode: 'relative' });
		this.counter++;
	}
});