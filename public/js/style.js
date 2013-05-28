/**
 * General triggered behaviour on document load
 */
var general_rules = {
	'#analytics-placeholder':function(){
		_gaq = _gaq || [];
		if (this.getDataAttribute('sid')) {
			new Analytics($$('body')[0], {
				settings:{
					account: this.getDataAttribute('sid'),
					domain: 'none',
					allowlinker: true,
					allowhash: false,
					target: this.getDataAttribute('target')
				}

			},_gaq);
		}
	},
		'.hilite-keywords' : function() {
			 var hiliter = new KeywordHiliter("ajax.php",this);
			 hiliter.options.elementTag = 'ABBR';
			 hiliter.fetchKeywords();
		},
		'.no-javascript' : function() {
			this.hide();
		},
		'.show-no-javascript' : function() {
			this.show();
		},

		'.timeago': function() {
			var timeago = moment(this.innerHTML).fromNow();
			this.innerHTML = timeago;
		 }
};
Event.addBehavior(general_rules);

/**
 * Rules for hyperlink behaviour
 */
var hyperlink_rules = {
    'a.void:click' : function(e) {
      return false;
    },

    'a.popup:click' : function(e) {

        /**
         * Event:  click
         * Action: open a popup window
         */
        var width = this.getDataAttribute('width') || 684;
        var height = this.getDataAttribute('height') || 350;
        var top = this.getDataAttribute('top') || 200;
        var left = this.getDataAttribute('left') || '50%';
        window.open(this.href,
            'PopUp',
            'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left + ',scrollbars=0,status=no,resizable=0,toolbar=0,titlebar=0,menubar=0,location=0');
        return false;
    },

    'a.external:click,a.new-window:click' : function(e) {
        /**
         * Event:  click
         * Action: open a new window
         */
        if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
        	window.open(this.href);
        	return false;
        }
    },

    'a.status:mouseover' : function(e) {

        /**
         * Event:  mouseover
         * Action: display the hyperlinks title in the status bar
         */
        window.status=this.title;
        return true;
    },
    'a.status:mouseout' : function(e) {

        /**
         * Event:  mouseout
         * Action: clear the status bar
         */
        window.status='';
        return true;
    },

    'a.switch:click': function(e) {
        /**
         * Event:  click
         * Action: show / hide the tab with the same ID minus "_switch"
         */
        var c = $(this.id.replace('-switch',''));
        var content = $(c.id + '-content');
        if (c) {
          c.toggle();
        }
        return false;
    },

    'a.tabswitch:click' : function(e) {
        /**
        * Event: click
        * Action: hide related div, show related div's related element
        */
        var container = $(this.getAttribute('rel'));
        if(container) {
          var other = $(container.getAttribute('rel'));
          if (other) {
            container.addClassName('hide');
            other.removeClassName('hide');
          }
        }
        return false;
    },

    'a.modal:click' : function(e) {

        /**
         * Event:  click
         * Action: open a zoomed in image
         */
        var image = this.up().next().down('img');
        var dialog = new MUIL.Dialog.Image(image);
        return false;
    },

    'a.submit' : function(e) {
        /**
        * Event: click
        * Action: submit the form given as a param. (used by captcha)
        */
        var form = $(this.getDataAttribute('form'));
        if (form){
          form.submit();
        }
        return false;
    },

    'a.notificare-video:click' : function(e) {
    	/**
    	* Event: click
    	* Action: Open lightbox video
    	*/
    	var lightbox  = new Element('div',{id:"lightbox"});
    	var introvideo  = new Element('div',{id:"intro-video"}).update('<iframe src="http://player.vimeo.com/video/60687310?autoplay=1" width="1068" height="600" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
			$$('body')[0].insert({top:lightbox});
			$$('body')[0].insert({top:introvideo});
			introvideo.observe('click', function(){introvideo.remove();lightbox.remove();introvideo.down().remove();});
			return false;
    }
};
Event.addBehavior(hyperlink_rules);

/**
 * Behaviour rules for form elements
 */

var form_rules = {
	'form.overlabel' : function() {
		this.addClassName('overlabel-apply');
		this.removeClassName('overlabel');
	},
	'form.overlabel-apply label:click' : function(event) {
		// focus input field
		var field = this.getAttribute('for');
		if (field) {
			field.focus();
		}
	},
	'form.overlabel-apply input:focus' : function(event) {
		// hide label
		var label = $(this.form).down('label[for='+this.id+']');
		if (label) {
			label.setStyle({textIndent: '-10000px'});
		}
	},
	'form.overlabel-apply input:blur' : function(event) {
		if ('' == this.getValue()) {
			// show label if no value
			var label = $(this.form).down('label[for='+this.id+']');
			if (label) {
				label.setStyle({textIndent: '0px'});
			}
		}
	},
	'form.auto-submit' : function(e) {
		this.submit();
	},
	'select.auto-submit:change' : function(e) {
		this.form.submit();
	},
	/**
	 * Event:  blur
	 * Action: convert field value to upper case
	 */
	'input.auto-upper:blur' : function(e) {
		this.value = this.value.toUpperCase();
	},

	/**
	 * Event:  change
	 * Action: convert field value to upper case
	 */
	'input.auto-upper:change' : function(e) {
		this.value = this.value.toUpperCase();
	},
	'.default-value:blur' : function(e) {
		/**
		 * Event:  blur
		 * Action:
		 *   - when empty set default value
		 */
		if(this.value == ''){
			if(this.getDataAttribute('defaultValue') != ''){
				this.value = this.getDataAttribute('defaultValue');
				this.addClassName('auto-clear');
			}
		}
	},
	'input.auto-blur:focus' : function(e) {

		/**
		 * Event:  focus
		 * Action:
		 *   - replace field's classname from "-off" to "-on"
		 *   - if labeled, replace label's classname from "-off" to "-on"
		 *   - if label is image, replace image with "_hover" version
		 */
		this.className = this.className.replace('-off','-on');
		var fieldLabel = $(this.form).down('[for=' + this.id + ']');
		if (fieldLabel) {
			fieldLabel.className = fieldLabel.className.replace('-off','-on');
			var image = fieldLabel.down('img');
			if (image) {
				image.src = image.src.replace('_normal','_hover');
			}
		}
		// Check for grouped fields
		var fieldSet = this.up('fieldset');
		if (fieldSet && fieldSet.up('fieldset')) {
			var legend = fieldSet.down('legend');
			if (legend) {
				legend.className = legend.className.replace('-off', '-on');
			}
		}
	},
	'input.auto-blur:blur' : function(e) {

		/**
		 * Event:  blur
		 * Action:
		 *   - replace field's classname from "-on" to "-off"
		 *   - if labeled, replace label's classname from "-on" to "-off"
		 *   - if label is image, replace image with "_normal" version
		 */
		this.className = this.className.replace('-on','-off');
		var fieldLabel = $(this.form).down('[for=' + this.id + ']');
		if (fieldLabel) {
			fieldLabel.className = fieldLabel.className.replace('-on','-off');
			var image = fieldLabel.down('img');
			if (image) {
				image.src = image.src.replace('_hover','_normal');
			}
		}
		// Check for grouped fields
		var fieldSet = this.up('fieldset');
		if (fieldSet && fieldSet.up('fieldset')) {
			var legend = fieldSet.down('legend');
			if (legend) {
				legend.className = legend.className.replace('-on', '-off');
			}
		}
	},
	'.auto-clear:focus' : function(e) {

		/**
		 * Event:  focus
		 * Action:
		 *   - clear value
		 *   - remove auto-clear class
		 */
		if (this.hasClassName('auto-clear')) {
			this.value='';
		}
		this.removeClassName('auto-clear');
	},
	'input.rollover:mouseover' : function(el) {

		/**
		 * Event:  mouseover
		 * Action:
		 *   - if not "active", replace classname by "-hover" classname
		 *   - if type is "image", replace image by "_hover" version
		 */
		if (!this.hasClassName('active')) {
			this.className = this.className.replace('-normal','-hover');
			if (this.type == 'image') {
				this.src = this.src.replace('_normal','_hover');
			}
		}
	},
	'input.rollover:mouseout' : function(e) {
		/**
		 * Event:  mouseout
		 * Action:
		 *   - replace classname by "-hover" classname
		 *   - if type is "image", replace image by "_hover" version
		 */
		if (!this.hasClassName('active')) {
			this.className = this.className.replace('-hover','-normal');
			if (this.type == 'image') {
				this.src = this.src.replace('_hover','_normal');
			}
		}
	}
};
Event.addBehavior(form_rules);

var misc_rules = {
		'.app-switch:click': function(e){
			var element = e.findElement(),elements = e.findElement().down().childElements();

			if(!element.hasClassName('active')){
				element.addClassName('active');
				elements.each(function(elm,i){
					elm.show();
				});
			}else{
				element.removeClassName('active');
				elements.each(function(elm,i){
					if(i!=0){
						elm.hide();
					}

				});
			}

		}
	};
Event.addBehavior(misc_rules);

var spotlight_rules = {
	'input#search-form-searchstring': function(){
		new Spotlight(this, {
			searchResultsTemplateUrl: '/js/templates/spotlight.tpl'
		});
	}
};
Event.addBehavior(spotlight_rules);

var chosen_rules = {
	'select.chosen': function(){
		var options = {
			allow_single_deselect: true
		};
		$H(Element.getClassParameters(this)).each(function(pair) {
			options[pair.key] = unescape(pair.value);
		});
		new Chosen(this, options);

		// Nasty IE 7 hack
		var version = parseInt((navigator.userAgent.toLowerCase().match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1]);
		if (Prototype.Browser.IE && version <= 7){
			var zIndex = 1000;
			$$('.chzn-container').each(function(c){
				c.style.zIndex = zIndex;
				zIndex--;
			});
		}
	}
};
Event.addBehavior(chosen_rules);

var navigation_rules = {
		'.submenu': function(){
			new Notificare(this,{
				token: $('user-token').getDataAttribute('token')
			});
		},
		'.user': function(){
			new Notificare(this,{
				token: $('user-token').getDataAttribute('token')
			});
		}
	};
Event.addBehavior(navigation_rules);


var charts_rules = {
		'.chart-lastmonth': function(){
			new Notificare.Charts(this,{
				token: $('user-token').getDataAttribute('token'),
				plan: $('user-token').getDataAttribute('planlimit'),
				chartID: 1, 
				placeholderClass: '.charts'
			});
		},
		'.chart-users': function(){
			new Notificare.Charts(this,{
				token: $('user-token').getDataAttribute('token'),
				plan: $('user-token').getDataAttribute('planlimit'),
				chartID: 2
			});
		},
		'.chart-application-lastmonth': function(){
			new Notificare.Charts(this.down('svg'),{
				token: $('user-token').getDataAttribute('token'),
				plan: $('user-token').getDataAttribute('planlimit'),
				application: this.getDataAttribute('application'),
				chartID: 3, 
				placeholderClass: '.charts'
			});
		}
	};
Event.addBehavior(charts_rules);



var push_rules = {
		'.push-form': function(){
			new Notificare.Push(this,{
				token: $('user-token').getDataAttribute('token'),
				templates:{
					alert: '/js/templates/push/types/alert.tpl',
					webview: '/js/templates/push/types/webview.tpl',
					url: '/js/templates/push/types/url.tpl',
					image: '/js/templates/push/types/image.tpl',
					imagehtml5: '/js/templates/push/types/image-html5.tpl',
					video: '/js/templates/push/types/video.tpl',
					map: '/js/templates/push/types/map.tpl',
					rate: '/js/templates/push/types/rate.tpl',
					form: '/js/templates/push/types/form.tpl',
					passbook: '/js/templates/push/types/passbook.tpl',
					callback: '/js/templates/push/actions/callback.tpl',
					tel: '/js/templates/push/actions/tel.tpl',
					sms: '/js/templates/push/actions/sms.tpl',
					mail: '/js/templates/push/actions/mail.tpl',
					browser: '/js/templates/push/actions/browser.tpl',
					app: '/js/templates/push/actions/app.tpl',
					custom: '/js/templates/push/actions/custom.tpl'
				}
			});
		}
	};
Event.addBehavior(push_rules);

var carousel_rules = {
	'div.carousel': function() {
		new TabRotator(this, {
			contentElementSelector: '.carousel-content',
			tabsElementSelector: '.carousel-loader',
			parameterName: 'itemID',
			interval: 6,
			animateLoader: false,
			animatingLoaderClass: 'campaign-loader-animating',
			animationClassPrefix: 'state-',
			animationFrames: 1,
			animationDuration: 1
		});
	}
};
Event.addBehavior(carousel_rules);


var websockets_rules = {
	'div.websocket-notification': function() {
		new Notificare.Websockets(this, {
			source: 'wss://websocket.notifica.re',
			protocols: 'notificare-push',
			applicationKey: '9fd647431c4dc3798f2a5ae147411a787e8d52447e365d7972ec4d853b4cdd65',
			applicationSecret: '6540b4a9a0c82c16be18da73e074e271f9cf4313312c8b1751f662eac55e74e6',
			userID: 'silentjohnny',
			userName: 'silentjohnny'
		});
	}
};
Event.addBehavior(websockets_rules);

var accordion_rules = {
	'dl.faq-list': function(event) {
		new Accordion(this, {});
	}
};
Event.addBehavior(accordion_rules);

var audience_rules = {
		'.audience-selection': function(){
			var map = $('map-geo-location');
			new Notificare.Audience(this, {
					showMap: map.getDataAttribute('showmap'),
					zoom: 10,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					center: new google.maps.LatLng(map.getDataAttribute('latitude'),map.getDataAttribute('longitude')),
					markerOptions:{
						iconUrl: '/images/marker_man.png'
					},
					templates:{
						avatar: '/js/templates/avatar.tpl',
						userInfo: '/js/templates/user.tpl',
						deviceInfo: '/js/templates/devices.tpl'
					}
			});
		}
	};
Event.addBehavior(audience_rules);

var mappush_rules = {
		'div#map': function(){
			new Notificare.Map(this, {
					zoom: 10,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					center: new google.maps.LatLng(this.getDataAttribute('latitude'),this.getDataAttribute('longitude')),
					markerOptions:{
						iconUrl: '/images/mapMarker.png'
					},
					templates:{
						editMarker: '/js/templates/maps/edit_marker.tpl'
					}
			});
		}
	};
Event.addBehavior(mappush_rules);

var fileupload_rules = {
		'.multi-upload': function(){
			new Notificare.FileAPI(this,{	
				maxUploadSize: this.getDataAttribute('maxsize'),
				extensions: this.getDataAttribute('extensions'),
				fieldName: 'file',
				dropArea: '.drop-area',
				fileList: '.file-list'
			});
		}
	};
Event.addBehavior(fileupload_rules);

var preview_rules = {
		'div#preview-map': function(){
			new Notificare.Preview(this, {
					zoom: 10,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					center: new google.maps.LatLng(this.getDataAttribute('latitude'),this.getDataAttribute('longitude')),
					markerOptions:{
						iconUrl: '/images/mapMarker.png'
					},
					templates:{
						editMarker: '/js/templates/maps/edit_marker.tpl'
					}
			});
		}
	};
Event.addBehavior(preview_rules);


var users_rules = {
		'.search-form': function(){
			new Notificare.Users(this,{
				token: $('user-token').getDataAttribute('token'),
				templates:{
					users: '/js/templates/users.tpl',
					devices: '/js/templates/devices.tpl',
					avatar: '/js/templates/avatar.tpl'
				}
			});
		}
	};
Event.addBehavior(users_rules);

var notifications_rules = {
		'.notifications-sent': function(){
			new Notificare.Notifications(this,{
				token: $('user-token').getDataAttribute('token'),
				templates:{
					replies: '/js/templates/notification/replies.tpl',
					alert: '/js/templates/notification/alert.tpl',
					webview: '/js/templates/notification/webview.tpl',
					url: '/js/templates/notification/url.tpl',
					image: '/js/templates/notification/image.tpl',
					video: '/js/templates/notification/video.tpl',
					map: '/js/templates/notification/map.tpl',
					rate: '/js/templates/notification/rate.tpl',
					form: '/js/templates/notification/form.tpl',
					passbook: '/js/templates/notification/passbook.tpl',

				}
			});
		}
	};
Event.addBehavior(notifications_rules);

var tooltip_rules = {
	'body': function(){
		new Opentip(this);
	}		
};
Event.addBehavior(tooltip_rules);

var analytics = {
	'body':function(){
	var sid = $('analytics-async-placeholder').getDataAttribute('sid');	
	_gaq = _gaq || [];

	if (sid) {
        new Analytics(this, {
                settings:{
                        account: sid,
                        domain: 'none',
                                allowlinker: true,
                                allowhash: false
                        }
                        
                },_gaq);
        }
	},
	'span.404':function(){
	_gaq.push(['_trackPageview', '/404.html?page=' + document.location.pathname + document.location.search + '&from=' + document.referrer]);
	}
};
Event.addBehavior(analytics);