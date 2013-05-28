<div class="device-content">
	<div class="content">
		<!--<div class="images">
{for content in info.content}

			<img src="${content.data}" class="pagecontrol">

{/for}
		</div>-->
		<div class="alert-message">
			<h3>${info.application.name}</h3>
			<p>${info.message}</p>
			<ul>
			{if info.actions.length > 0}
			{for action in info.actions}
				<li>${action.label}</li>
			{/for}
				<li>${dictionary.getText('cancel')}</li>
			{else}
				<li>${dictionary.getText('ok')}</li>
			{/if}
			</ul>
		</div>

	</div>

</div>