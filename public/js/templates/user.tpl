<a href="" class="close">x</a>
<div class="device-userid">${device.data.userID}</div>
<div id="${device.data.userID}" class="device-user">
	
</div>
<div class="device-${device.data.type}" {if device.data.location} data-location="{for location in device.data.location}${location},{/for}"{/if}>
	<div class="language bubble">${device.data.language}</div>
	<div class="os-version">${device.data.osVersion}</div>
	<div class="app-version bubble">${device.data.appVersion}</div>
	<div class="device-string">${device.data.deviceString}</div>
	<div class="platform ${device.data.platform}"></div>
</div>