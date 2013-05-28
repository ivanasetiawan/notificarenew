/*
 * pH8 Extensions of Prototype
 * (c) 2005-2008 Joris Verbogt
 */

/**
 * @namespace pH8
 */
pH8 = {};
pH8.Version = '2.0';
pH8.CompatibleWithPrototype = '1.7';

if (Prototype.Version.indexOf(pH8.CompatibleWithPrototype) !== 0
		&& window.console && window.console.warn)
	console.warn("This version of pH8 extensions is tested with Prototype "
			+ pH8.CompatibleWithPrototype
			+ " it may not work as expected with this version ("
			+ Prototype.Version + ")");
pH8.SiteVersion = function() {
	var meta = Element.getElementsBySelector(document,
			"meta[name='site-version']");
	if (meta[0]) {
		return meta[0].getAttribute('content');
	} else {
		return 0;
	}
}();

pH8.currentLanguage = $$('html')[0].readAttribute('lang');

/*
 * Console fix
 */
if (!window.console) {
	window.console = {
		log : function(message) {
			// Do nothing
		}
	};
}
/*
 * Space for Mixin classes
 */
pH8.Mixin = {};
/*
 * Custom methods to extended DOM Elements
 */
Element.addMethods({
	/**
	 * Get all class parameters, i.e. class names like {prefix}-{name}={value}
	 * @param Element element The element when called statically
	 * @param String prefix Optional prefix, default 'param'
	 * @return Array name: value hash
	 */
	getClassParameters : function(element, prefix) {
		element = $(element);
		if (arguments.length < 2) {
			prefix = 'param';
		}
		var regex = new RegExp(prefix + '-(\\w*)=(\\S*)', 'g');
		var params = {};//new Array();

		while ((result = regex.exec(element.className)) != null) {
			params[result[1]] = result[2];
		}

		return params;
	},
	/**
	 * Get specific class parameter, i.e. class name like {prefix}-{param}={value}
	 * @param Element element The element when called statically
	 * @param String param The parameter to look for
	 * @param String prefix Optional prefix, default 'param'
	 * @return String The parameter value
	 */
	getClassParameter : function(element, param, prefix) {
		if (arguments.length < 3) {
			prefix = 'param';
		}
		var regex = new RegExp(prefix + '-' + param + '=(\\S*)');
		var parts = regex.exec(element.className);
		if (parts) {
			return parts[1];
		}
	},
	getDataAttribute : function(element, name) {
		if (typeof element.dataset === 'object') {
			return element.dataset[name];
		} else {
			return element.readAttribute('data-' + name.toDash());
		}
	},
	setDataAttribute : function(element, name, value) {
		if (typeof element.dataset === 'object') {
			return element.dataset[name] = value;
		} else {
			return element.writeAttribute('data-' + name.toDash(), value);
		}
	}
});

/*
 * Extensions to String
 */
Object.extend(String.prototype, {
	/**
	 * Does this String represent (only) numerical digits?
	 * @return Boolean
	 */
	isDigits : function() {
		return (this.match(/^\d+$/) !== null);
	},
	/**
	 * Strip the query from the URL
	 * @return String
	 */
	stripQuery : function() {
		return (this.split('?')[0]);
	},
	/**
	 * Parse the String for query parameters as well as anchor parameters
	 * @return Object
	 */
	parseExtendedQuery : function() {
		var queryParams = this.parseQuery();
		var pos = this.indexOf('#') + 1;
		if (pos) {
			var hashParams = this.substr(pos).parseQuery();
			Object.extend(queryParams, hashParams);
		}
		return queryParams;
	},
	addHashParam : function(key, value) {
		var splitQuery = this.split('#');
		if (splitQuery.size() > 1) {
			var hashParams = $H(splitQuery[1].parseQuery());
			hashParams.set(key, value);
			return splitQuery[0] + '#' + hashParams.toQueryString();
		} else {
			return this + '#' + encodeURIComponent(key) + '='
					+ encodeURIComponent(value);
		}
	},
	toCamelCase : function() {
		return this.replace(/\-./g, function(substr) {
			return substr.charAt(1).toUpperCase();
		});
	},
	toDash: function(){
		return this.replace(/([A-Z])/g, function(substr) {
			return "-"+substr.toLowerCase();
		});
	}
});

/*
 * Extensions to Number
 */
Object.extend(Number.prototype, {
	/**
	 * Is this Number an Integer?
	 * @return Boolean
	 */
	isInteger : function() {
		return (Math.round(this) === this);
	}
});