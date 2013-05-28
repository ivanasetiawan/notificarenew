<fieldset>
	<legend>${formatted_type}</legend>
	<a href="" class="remove">${dictionary.getText('remove')}</a>
	<div class="field">
		<label for="label">${dictionary.getText('label')}</label>
		<input type="text" name="actions[${counter}][label]">
 		<div class="tooltip push-form-action-tooltips" data-ot="${dictionary.getText('action_callback_label_info_text')}" data-ot-hide-trigger="closeButton" data-ot-fixed="true">i</div>
	</div>
	<div class="field">
		<label for="target">${dictionary.getText('target')}</label>
		<input type="text" name="actions[${counter}][target]" placeholder="${dictionary.getText('action_callback_target_info_placeholder')}">
 		<div class="tooltip push-form-action-tooltips" data-ot="${dictionary.getText('action_callback_target_info_text')}" data-ot-hide-trigger="closeButton" data-ot-fixed="true">i</div>
	</div>
	<div class="field left">
		<label for="keyboard">${dictionary.getText('keyboard')}</label>
 		<ul class="radio-buttons">
			<li>
			<label for="actions-keyboard-true">
				<input type="radio" name="actions[${counter}][keyboard]" value="1">
				${dictionary.getText('yes')}
			</label>
			</li>
			<li>
			<label for="actions-keyboard-false">
				<input type="radio" name="actions[${counter}][keyboard]" value="0" checked="checked">
				${dictionary.getText('no')}
			</label>
			</li>
		</ul>
	</div>
	<div class="field right">
		<label for="camera">${dictionary.getText('camera')}</label>
 		<ul class="radio-buttons">
			<li>
			<label for="actions-camera-true">
				<input type="radio" name="actions[${counter}][camera]" value="1">
				${dictionary.getText('yes')}
			</label>
			</li>
			<li>
			<label for="actions-camera-false">
				<input type="radio" name="actions[${counter}][camera]" value="0" checked="checked">
				${dictionary.getText('no')}
			</label>
			</li>
		</ul>
	</div>
	<input type="hidden" name="actions[${counter}][type]" value="${type}">
</fieldset>