<div class="replies">
<h3>${dictionary.getText('responses')}</h3>
<table>
{if replies && replies.length > 0}
{for reply in replies}
	<tr id="${reply._id}">
		<td class="${reply.userID} thumb center"></td>
		<td class="thumb center">{if reply.data.media}<img src="{if reply.dataType == 'url'}${reply.data.media}{else}data:image/jpeg;base64,${reply.data.media}{/if}" class="media" alt="${reply.label}">{else}-{/if}</td>
		{if reply.data.message}<td class="center">${reply.data.message}</td>{/if}
		{if reply.data.message}{else}<td class="center">${reply.label}</td>{/if}
		<td class=" right time-ago">${reply.time}</div></td>
	</tr>
{/for}
{else}
	<tr>
		<td class="nothing">${dictionary.getText('no_replies_found')}</td>
	</tr>
{/if}
</table>
</div>