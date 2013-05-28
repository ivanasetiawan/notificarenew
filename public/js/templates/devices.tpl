{for device in devices}
	<li><div class="device-${device.type}" {if device.location} data-location="{for location in device.location}${location},{/for}"{/if}><div class="language bubble">${device.language}</div><div class="os-version">${device.osVersion}</div><div class="app-version bubble">${device.appVersion}</div><div class="device-string">${device.deviceString}</div><div class="platform ${device.platform}"></div></div></li>	
{/for}
