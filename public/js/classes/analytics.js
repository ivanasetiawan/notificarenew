/**
 * @fileoverview Advanced Google Analytics implementation
 * @author Joel Oliveira
 */

/**
 * Implements Google Analytics methods
 * @class Analytics
 */
Analytics = Class.create({
	/**
	 * Constructor
	 * @param {FormElement} element The form
	 */
		
	/*
	 * TO DO:
	 * In style.js
	 * _gaq.push(['_trackSocial', 'Facebook', 'Like', '', '']);/// Track clicks on Social Networks
	 * _gaq.push(['_trackEvent',  'occasions', $$('member-details').next('h2').innerHTML]);/// Track onload of a Occasion page (Dealer)
	 *
	 * 
	 */
	initialize: function(element, options, ga) {
		Object.extend(this, pH8.Mixin.needsTemplates);
		Object.extend(this, pH8.Mixin.needsDictionary);
		Object.extend(this, pH8.Mixin.needsPages);
		this.element = $(element);
		this.waitForDictionary(this.onDictionaryLoaded.bind(this));
		this.waitForPages(this.onPagesLoaded.bind(this));
		
		this.options = Object.extend({},options||{});	
		this.tracker = ga;

		
		if (this.options.settings.account) {
			this.tracker.push(['_setAccount', this.options.settings.account]);
			this.tracker.push(['_setDomainName', this.options.settings.domain]);
			this.tracker.push(['_setAllowLinker', this.options.settings.allowlinker]);
			this.tracker.push(['_setAllowHash', this.options.settings.allowhash]);
			this.tracker.push(['_trackPageLoadTime']);
			if (this.options.settings.target) {
				this.tracker.push(['_trackPageview', this.options.settings.target]);
			} else {
				this.tracker.push(['_trackPageview']);
			}
		}
	},
	delegates: {
		'click': {
			'.signup-form input[type="submit"]': function(e){
				//e.stop();
				var category = 'sign-up', action = $$('.your-order')[0].down(1).innerHTML;
				this.tracker.push(['_trackEvent', category, action]);
				//console.log(this.tracker,category,action);
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
	 * Handle dictionary:loaded event
	 * @param {Event}
	 */
	onDictionaryLoaded: function(event) {
		this.dictionary = new pH8.Dictionary();
		this.dictionaryLoaded = true;
		this.onReady();
	},
	/**
	 * Handle pages:loaded event
	 * @param {Event}
	 */
	onPagesLoaded: function(event) {
		this.pages = new pH8.Pages();
		this.pagesLoaded = true;
		this.onReady();
	},
	/**
	 * Everything done
	 */
	onReady: function(){
		if(this.pagesLoaded && this.dictionaryLoaded){
			this.setEventDelegates();
		}
	}
});