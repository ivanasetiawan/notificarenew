pH8.Loader = Class.create({
	initialize: function(src) {
		var s = new Element('script', {
			type: "text/javascript",
			src: src
		});
		var head = $$("head")[0];
		head.appendChild(s);
	}
});
