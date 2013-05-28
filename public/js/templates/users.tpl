<table>
{if profiles && profiles.length > 0}
{for profile in profiles}
	<tr id="${profile.user._id}">
		<td class="check"><input type="checkbox" name="user[]" value="${profile.user._id}"></td>
		<td class="narrow"><div id="avatar-${profile.user.userID}"></div></td>
		<td class="left"><span class="small"><strong>${profile.user.userName}</strong></span><br />{if profile.user.userName != 'anonymous'}<span class="small"><strong>${dictionary.getText('user_id')|escape}</strong>: ${profile.user.userID}</span><br />{/if}<div class="access-token">{if profile.user.accessToken}<span class="small"><strong>${dictionary.getText('access_token')|escape}: </strong>${profile.user.accessToken}</span><div><a href="" class="btn generate-token">${dictionary.getText('regenerate_access_token')|escape}</a></div>{else}<a href="" class="btn generate-token">${dictionary.getText('generate_access_token')|escape}</a>{/if}</div></td>
		<td>
			<ul id="${profile.user.userID}" class="devices">
			</ul>
		</td>
	</tr>
{/for}
{else}
	<tr>
		<td class="nothing">${dictionary.getText('no_users_found')}</td>
	</tr>
{/if}
</table>
{if profiles.length > 0}
<input type="submit" class="delete" name="delete" value="${dictionary.getText('delete')}">
{/if}
