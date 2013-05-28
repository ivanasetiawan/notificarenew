YoutubeUserVideo = Class.create({
	initialize: function(element, options){
		Object.extend(this, pH8.Mixin.needsTemplates);
		Object.extend(this, pH8.Mixin.needsDictionary);
		Object.extend(this, pH8.Mixin.needsConfig);

		this.element = $(element);
		this.options = Object.extend({
			maxResults: 3
		}, options || {});

		this.waitForTemplates(this.options.templates, this.onTemplatesLoaded.bind(this));
		this.waitForDictionary(this.onDictionaryLoaded.bind(this),'nl');
		this.waitForConfig(this.onConfigLoaded.bind(this));
		this.dictionary = new pH8.Dictionary('nl');	
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
		if(this.templatesLoaded && this.dictionaryLoaded && this.configLoaded){
			this.setEventDelegates();
			
			this.loadUserData();
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
		click: {
			'xxx': function(e){
				e.stop();			
			}
		}
	},
	loadUserData: function(){
		this.observeYoutubeCallback();
		if (this.options.playlist) {
	    	this.url = 'http://gdata.youtube.com/feeds/api/playlists/'+ this.options.playlist;
	    } else {
	    	this.url = 'http://gdata.youtube.com/feeds/users/'+ this.options.user + '/uploads';
	    }
	    this.url += '?alt=json-in-script&start-index=1&max-results=' + this.options.maxResults + '&orderby=published';
	    this.loader = new pH8.Loader(this.url + '&callback=YoutubeUserVideo.callBack');
	},
	observeYoutubeCallback: function(){
		this.observer = this.onYoutubeUserVideoLoaded.bind(this);
		document.observe('youtubeuser:dataloaded', this.observer);
	},
	onYoutubeUserVideoLoaded: function(event){
		event.memo.data.feed.link.each(function(link){
			if(link.rel == 'self' && link.href == this.url){
				this.showVideo(event.memo.data);
				document.stopObserving('youtubeuser:dataloaded', this.observer);
				return;
			}
		}.bind(this));
	},
	showVideo: function(data){
			var entries = data.feed.entry || [];

			this.element.update(this.templates.youtube.process({
				entries: entries,
				dictionary: this.dictionary
			}));
			// var html = ['<ul>'];
			// for (var i = 0; i < entries.length; i++) {
			// 	var entry = entries[i];
			// 	var title = entry.title.$t.substr(0, 70);
			// 	var viewCount = entry.yt$statistics.viewCount; 
			// 	var thumbnailUrl = entries[i].media$group.media$thumbnail[3].url;
			// 	var playerUrl = entries[i].media$group.media$player[0].url;
			// 	html.push('<li>', 
			// 				'<a href="', playerUrl, '">' ,
			// 					'<img src="', thumbnailUrl, '" width="190" height="138"/>',
			// 					'<span class="flip-info">', title, '<span>', viewCount,  'x bekeken</span></span></a></li>');
			// }
			// html.push('</ul>');
			// this.element.update(html.join(''));
	}
});

YoutubeUserVideo.callBack = function(data){
	document.fire('youtubeuser:dataloaded', {
		data: data
	});
};