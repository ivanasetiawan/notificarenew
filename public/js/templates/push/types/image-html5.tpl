<div class="field">
	<label for="message">${dictionary.getText('message')}</label>
	<textarea name="message"></textarea>
</div>
<div class="field multi-upload" data-extensions="jpeg,jpg,gif,png" data-maxsize="1">
	<label for="image">${dictionary.getText('image')}</label>
	<div class="file-box">
		<input type="file" name="file" value="" multiple>
	</div>
	<div class="drop-area">
		<span class="drop-instructions">${dictionary.getText('drag_here')}</span>
	</div>
	<ul class="file-list">
	</ul>
	<div class="clear"></div>
	<input type="hidden" name="multi_upload" value="1">
</div>

