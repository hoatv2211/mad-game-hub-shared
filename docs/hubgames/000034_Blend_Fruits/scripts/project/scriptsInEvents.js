


const scriptsInEvents = {

	async Yandex_Event16_Act1(runtime, localVars)
	{
var newWindow = window.open(`https://yandex.${runtime.globalVars.domain}/games/developer?name=truelisgames&clid=2670653&utm_source=refferal_program&utm_medium=${runtime.globalVars.gamename}`,
          '_blank');
if (newWindow ==  null)  alert( runtime.globalVars.error );
parent.location.reload();
	},

	async Gamesheet_Event369(runtime, localVars)
	{
		localVars.HEXColor = localVars.HEXColor.replace('#', '');
		localVars.R = parseInt(localVars.HEXColor.substring(0, 2), 16);
		localVars.G = parseInt(localVars.HEXColor.substring(2, 4), 16);
		localVars.B = parseInt(localVars.HEXColor.substring(4, 6), 16);
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

