pH8.Config = (function() {
	/**
	 * Private var _instance, only one Pages instance needed
	 */
	var _instance = null;
	/**
	 * Private var _list holds the config hash
	 */
	var _list = null;
	/**
	 * Public interface
	 */
	return function(language) {
		if (_instance !== null) {
			return _instance;
		}
		_instance = this;
		new Ajax.Request("/api/site?query=config",{
			method: 'get',
			onSuccess: function(transport){
				_list = transport.responseJSON;
				document.fire("config:loaded");
			}
		});
		this.isLoaded = function() {
			return (null !== _list);
		};
		this.getList = function(){
			return _list;
		};
		this.getConfig = function(key) {
			if(_list[key]) {
				return _list[key];
			} else {
				return key;
			}
		};
	};
})();
/**
 * @description mixin if you need page label support, calls the callback function as soon as the pages labels are available
 */
pH8.Mixin.needsConfig = {
	/**
	 * Call this function in your initializer
	 * @param {Function} callback The function to call on successful dictionary load
	 */
	waitForConfig: function(callback){
		var config = new pH8.Config();
		if(config.isLoaded()){
			callback();
		} else {
			document.observe("config:loaded", callback);
		}
	}
};