<div class="device-content">
	<div class="content">
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
{for content in info.content}

		<!--<iframe class="iframe" src="http://notifica.re/proxy?url=${content.data}"></iframe>-->

{/for}

	</div>
</div>