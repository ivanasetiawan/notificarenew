function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.search);
	if (results == null) {
		return "";
	} else {
		return decodeURIComponent(results[1].replace(/\+/g, " "));
	}
}

jQuery(document).ready(function ($) {
	var messageElement = $('#message');
	var instructionsElement = $('#instructions p')
	var token = getParameterByName('token'); 
	if (token) {
		var baseUrl = 'https://api.notifica.re/user/validate/';
		$.ajax({
			type: 'PUT',
			url: '/proxy/?url=' + escape(baseUrl),
			dataType: 'json',
			data: {
				token: token
			},
			success: function() {
				messageElement.html('Successfully validated');
				instructionsElement.html('Ah, so it really is you! Welcome to Notificare. Please check out your <a href="/admin/">Dashboard</a>')
			},
			error: function() {
				messageElement.html('Validation did not succeed');
				instructionsElement.html("Hmm. Apparently something is not right here. Please check your e-mail again and try copy/pasting the link in your browser instead of clicking it. If this still doesn't work, please contact us at <a href=\"mailto:y-u-no-work@notifica.re\">y-u-no-work@notifica.re</a>")
		    }
		});		
	} else {
		messageElement.html('Missing token');
	}
});
