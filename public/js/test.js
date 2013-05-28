jQuery(document).ready(function ($) {
	var applicationKey = $("input[name='application-key']");
	var serviceToken = $("input[name='service-token']");
	var message = $("input[name='message']");
	var fullMessage = $("input[name='full-message']");
	var firstButtonLabel = $("input[name='first-button-label']");
	var secondButtonLabel = $("input[name='second-button-label']");
	var button = $("input[name='submit']");
	var form = $('#form');
			
	$('#form').submit(function() {	
		
		$("p.ok").fadeOut('fast', function(){
			$("p.ok").remove();
		});
		
		$("p.error").fadeOut('fast', function(){
			$("p.error").remove();
		});
		
		message.removeClass('error');
		
		
		if(message.val() != ''){
	    	$('<p class="ok">sending...</p>').insertAfter(button).hide().fadeIn('fast');
	    	var baseUrl = 'https://apps.notifica.re/hooks/webhook/';
			var callbackBaseUrl = 'https://callback.notifica.re/test/?message='
			$.ajax({
				type: 'POST',
				url: '/proxy/?url=' + escape(baseUrl + applicationKey.val() + '?token=' + serviceToken.val()),
				dataType: 'json',
				//contentType: 'application/json',
				data: {
					message: message.val(),
					fullMessage: fullMessage.val(),
					targets: [
						{
							action: firstButtonLabel.val(),
							url: callbackBaseUrl + escape(firstButtonLabel.val())
						},
						{
							action: secondButtonLabel.val(),
							url: callbackBaseUrl + escape(secondButtonLabel.val())
						}
					] 
				},
				success: function() {
					var sending = button.next()[0];
					$(sending).remove();
					$('<p class="ok">Awesome! Now take a look at your phone.</p>').insertAfter(button).hide().fadeIn('fast');
					return false;
				},
				error: function() {
					form.effect(
					            'shake', {
					                times:3
					           }, 200,function(){
					        	message.addClass("error");
					        	$('<p class="error">Say something!</p>').insertAfter(button).hide().fadeIn('fast');
					      });
					return false;
			    }
			});
		}else{
			form.effect(
		            'shake', {
		                times:3
		           }, 200,function(){
		        	   message.addClass("error");
		        	   $('<p class="error">Say something!</p>').insertAfter(button).hide().fadeIn('fast');
		           });
    		return false;
		}
			
		return false;
	});

});
