/**
 * @lends Spotlight
 */
Spotlight = Class.create({
	/**
	 * @class Spotlight
	 * @constructs
	 */
	initialize: function(element, options){
		Object.extend(this, pH8.Mixin.needsDictionary);
		Object.extend(this, pH8.Mixin.needsTemplates);
		Object.extend(this, pH8.Mixin.needsPages);
		Object.extend(this, pH8.Mixin.needsConfig);
		this.element = $(element);
		this.options = Object.extend({
		},options || {});
		this.allowSearch = this.options.allowSearch || false;
		this.minimumSearchCharacters = this.options.minimumSearchCharacters || 3;
		this.waitForDictionary(this.onDictionaryLoaded.bind(this));
		this.waitForPages(this.onPagesLoaded.bind(this));
		this.waitForConfig(this.onConfigLoaded.bind(this));
		this.waitForTemplates({
			searchResults: this.options.searchResultsTemplateUrl
		}, this.onTemplatesLoaded.bind(this));
		this.setEventHandlers();
	},
	/**
	 * setEventhandlers
	 */
	setEventHandlers: function(){
		this.element.observe('click', Event.delegate(this.delegates.click).bindAsEventListener(this));
		this.element.observe('keyup', Event.delegate(this.delegates.keyup).bindAsEventListener(this));
		this.element.up('form').observe('submit', Event.delegate(this.delegates.submit).bindAsEventListener(this));
		this.element.up('form').next('div.search-results').observe('click', Event.delegate(this.delegates.click).bindAsEventListener(this));
		document.observe('spotlight:ready', this.onActive.bindAsEventListener(this));
	},
	/**
	 * handles keypresses
	 * @param {event} e keyboardEvent
	 */
	handleKeyInput: function(e){
		if(e.keyCode == 8 || (e.keyCode > 48 && e.keyCode <= 57) || (e.keyCode >= 65 && e.keyCode <= 90)){
			if(this.element.getValue().length >= this.minimumSearchCharacters){
				this.search();
			}else if(this.searchResultsListOpen){
				this.hide();
			}
		}else{
			if(this.searchResultsListOpen){
				switch(e.keyCode){
					case Event.KEY_UP:
						this.navigateResultSetUp();
						break;
					case Event.KEY_DOWN:
						this.navigateResultSetDown();
						break;
					case Event.KEY_RETURN:
						if(this.activeResultLink){
							pageTracker._trackEvent('search', 'go to page', this.activeResultLink.down('a').innerHTML, this.activeResultLink.down('a').readAttribute('href'));
							window.location = this.activeResultLink.down('a').readAttribute('href');
						}
				}
			}
		}
	},
	/**
	 * highlight next item
	 */
	navigateResultSetDown: function(){
		if(this.activeResultLink){
			if(this.activeResultLink.next('li')){
				this.activeResultLink.removeClassName('active');
				this.activeResultLink = this.activeResultLink.next('li').addClassName('active');
			}else if(this.activeResultLink.up('ul li') && this.activeResultLink.up('ul li').next('li')){
				this.activeResultLink.removeClassName('active');
				this.activeResultLink = this.activeResultLink.up('ul li').next('li').down('li').addClassName('active');
			}
		}else{
			this.activeResultLink = this.resultSetContainer.down('ul li ul li').addClassName('active');
		}
	},
	/**
	 * highlight previous item
	 */
	navigateResultSetUp: function(){
		if(this.activeResultLink){
			this.activeResultLink.removeClassName('active');
			if(this.activeResultLink.previous('li')){
				this.activeResultLink = this.activeResultLink.previous('li').addClassName('active');
			}else if(this.activeResultLink.up('ul li') && this.activeResultLink.up('ul li').previous('li')){
				this.activeResultLink = this.activeResultLink.up('ul li').previous('li').down('li', this.activeResultLink.up('ul li').previous('li').select('li').size() - 1).addClassName('active');
			}else{
				this.activeResultLink = null;
			}
		}
	},
	/**
	 * ajax search request
	 */
	search: function(){
		if(this.ajax){
			this.ajax.transport.abort();
		}
		
		this.ajax = new Ajax.Request('/api/', {
			method: 'get',
			parameters: {
				type: 'json',
				q: this.element.getValue(),
				action: 'search'
			},
			onSuccess: this.handleJSONData.bind(this),
			onFailure: this.handleJSONData.bind(this)
		});
	},
	/**
	 * handle the incoming data
	 * @param {object} transport result from ajax request
	 */
	handleJSONData: function(transport){
		pageTracker._trackEvent('search', 'typing query', this.element.getValue());
		var searchResultBox = this.templates.searchResults.process({
			modules: transport.responseJSON,
			dictionary: this.dictionary,
			pages: this.pages.getList(),
			searchstring: this.element.getValue(),
			config: this.config,
			status: transport.getStatus() + ''
		});
		this.resultSetContainer.update(searchResultBox);
		this.show();
	},
	/**
	 * show result container
	 */
	show: function(){
		this.resultSetContainer.removeClassName('hidden');
		this.searchResultsListOpen = true;
	},
	/**
	 * hide resultcontainer
	 */
	hide: function(){
		this.resultSetContainer.addClassName('hidden');
		this.resultSetContainer.update('');
		this.searchResultsListOpen = false;
	},
	/**
	 * defined delegates
	 */
	delegates: {
		click: {
			'a.close span': function(e){
				e.stop();
				if(this.searchResultsListOpen){
					this.hide();
				}
			}
		},
		keyup: {
			'input#search-form-searchstring': function(e){
				this.handleKeyInput(e);
			}
		},
		submit: {
			'.search-form': function(e){
				if(this.activeResultLink){
					e.stop();
				}
			}
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
	 * Templates loaded, what to do next?
	 */	
	onTemplatesLoaded: function() {
		this.templatesLoaded = true;
		this.onReady();
	},
	/**
	 * pages loaded, set boolean
	 */
	onPagesLoaded: function(){
		this.pages = new pH8.Pages();
		this.pagesLoaded = true;
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
	 * all prerequisites loaded, fire spotlight:ready event
	 */
	onReady: function(){
		if(this.dictionaryLoaded && this.templatesLoaded && this.pagesLoaded && this.configLoaded){
			this.allowSearch = true;
			document.fire('spotlight:ready');
		}
	},
	/**
	 * activated when spotlight:ready is fired
	 */
	onActive: function(e){
		this.element.writeAttribute('autocomplete', 'off');
		this.resultSetContainer = this.element.up('form').next('div.search-results');
	}
});