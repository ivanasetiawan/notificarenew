/**
 * @fileoverview Definition of Accordion
 * @author Joris Verbogt
 */

/**
 * create a new Accordion from a DL
 * @class Accordion
 * @lends Accordion
 */
Accordion = Class.create({
	/**
	 * @constructs
	 * @param {Object} element
	 * @param {Object} options
	 */
	initialize: function(element, options){
		this.element = $(element);
		this.options = {};
		this.options.openClass = options.openClass || 'active';
		this.options.duration = options.duration || 0.5;
		
		this.openElement = element.down('dd.' + this.options.openClass);
		this.isAnimating = false;
		this.element.observe('click', this.clickHandler.bindAsEventListener(this));		
	},
	/**
	 * clickHandler, Handle all the clicks on the element
	 * @param {Object} event
	 */
	clickHandler: function(event){
		var me = event.findElement('a');
		if (me && me.match('dt a')) {
			event.stop();
			var dt = me.up('dt');
			if (dt) {
				this.animateElement(dt.next('dd'));
			}
		}
	},
	/**
	 * Open clicked element, close active element
	 * @param {Object} element The element to open
	 */
	animateElement: function(element) {
		if(!this.isAnimating) {
	        /*
	         * Start 2 parallel scale transitions
	         */
			var effects = new Array();
			var options = {};
			if (!this.openElement || this.openElement != element) {
				// We should open this element
				options = {
					sync: true,
					scaleFrom: 0,
					scaleContent: false,
					scaleMode: 'contents',
					transition: Effect.Transitions.sinoidal,
					scaleX: false,
					scaleY: true
				};
		
				effects.push(new Effect.Scale(element, 100, options));
			}
			if (this.openElement) {
				// We should close the currently open element
				options = {
					sync: true,
					scaleContent: false,
					scaleMode: 'contents',
					transition: Effect.Transitions.sinoidal,
					scaleX: false,
					scaleY: true
				};
		
				effects.push(new Effect.Scale(this.openElement, 0, options));
			}
	
			new Effect.Parallel(effects,{
				duration: this.options.duration,
				fps: 35,
				queue: {
					position: 'end',
					scope: 'accordion'
				},
				beforeStart: function(){
					this.isAnimating = true;
					element.addClassName(this.options.openClass);
					element.previous('dt').addClassName(this.options.openClass);
					//element.setStyle({height: 0});
				}.bind(this),
				afterFinish: function() {
					if (this.openElement) {
						this.openElement.removeClassName(this.options.openClass);
						this.openElement.previous('dt').removeClassName(this.options.openClass);
					}
					if (this.openElement == element) {
						this.openElement = null;
					} else {
						this.openElement = element;
					}
					this.isAnimating = false;
				}.bind(this)
			});
		}
	}
});