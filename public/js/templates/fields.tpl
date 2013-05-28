<fieldset>
	<legend>${dictionary.getText('field')} #${counter}</legend>
	<div class="field">
		<label for="author">${dictionary.getText('name')}</label>
		<input type="text" name="field[field${counter}][name]">
	</div>
	<div class="field">
		<label for="author">${dictionary.getText('description')}</label>
		<textarea name="field[field${counter}][description]"></textarea>
	</div>
	<div class="field">
		<label for="author">${dictionary.getText('default_value')}</label>
		<input type="text" name="field[field${counter}][default_value]">
	</div>
</fieldset>