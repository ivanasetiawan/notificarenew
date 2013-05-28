<fieldset>
	<legend>${formatted_type}</legend>
	<a href="" class="remove">${dictionary.getText('remove')}</a>
	<div class="field">
		<label for="label">${dictionary.getText('label')}</label>
		<input type="text" name="actions[${counter}][label]">
 		<div class="tooltip push-form-action-tooltips" data-ot="${dictionary.getText('action_callback_label_info_text')}" data-ot-hide-trigger="closeButton" data-ot-fixed="true">i</div>
	</div>
	<div class="field">
		<label for="target">${dictionary.getText('url_scheme')}</label>
		<input type="text" name="actions[${counter}][target]" placeholder="${dictionary.getText('eg.: fb://')}">
 		<div class="tooltip push-form-action-tooltips" data-ot="${dictionary.getText('action_app_label_info_text')}" data-ot-hide-trigger="closeButton" data-ot-fixed="true">i</div>
	</div>
	<input type="hidden" name="actions[${counter}][type]" value="${type}">
</fieldset>