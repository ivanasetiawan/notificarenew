/* Use this script if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'Notificare\'">' + entity + '</span>' + html;
	}
	var icons = {
			'i-icon_vimeo' : '&#xe000;',
			'i-icon_twitter' : '&#xe001;',
			'i-icon_rss' : '&#xe002;',
			'i-icon_facebook' : '&#xe003;',
			'i-icon_linkedin' : '&#xe004;',
			'i-icon_googleplus' : '&#xe005;',
			'i-icon_youtube' : '&#xe006;',
			'i-icon_windowsmobile' : '&#xe007;',
			'i-icon_star' : '&#xe008;',
			'i-icon_map' : '&#xe009;',
			'i-icon_images' : '&#xe00a;',
			'i-icon_html5' : '&#xe00b;',
			'i-icon_blackberry' : '&#xe00c;',
			'i-icon_compass' : '&#xe00d;',
			'i-icon_apple' : '&#xe00e;',
			'i-icon_android' : '&#xe00f;',
			'i-icon_alert' : '&#xe010;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; i < els.length; i += 1) {
		el = els[i];
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/i-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};