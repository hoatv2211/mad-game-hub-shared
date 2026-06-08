


const scriptsInEvents = {

	async EventSheet1_Event3_Act1(runtime, localVars)
	{
		var newWindow = window.open(`https://yandex.${runtime.globalVars.domain}/games/developer?name=truelisgames&clid=2670653&utm_source=refferal_program&utm_medium=spinmaze2`,
		          '_blank');
		if (newWindow ==  null)  alert( runtime.globalVars.error );
		parent.location.reload();
	},

	async EventSheet1_Event6_Act1(runtime, localVars)
	{
		confirm( runtime.globalVars.back )
				{
		
				ysdk.dispatchEvent(ysdk.EVENTS.EXIT);
		
				};
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

