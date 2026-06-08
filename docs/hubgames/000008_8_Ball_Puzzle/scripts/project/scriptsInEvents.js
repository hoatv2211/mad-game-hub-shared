


const scriptsInEvents = {

	async GameEvents_Event141_Act1(runtime, localVars)
	{
		var newWindow = window.open(`https://yandex.${runtime.globalVars.domain}/games/developer?name=truelisgames&clid=2670653&utm_source=refferal_program&utm_medium=pool8`,
		          '_blank');
		if (newWindow ==  null)  alert( runtime.globalVars.error );
		
	},

	async GameEvents_Event181_Act1(runtime, localVars)
	{
		ysdk.adv.showFullscreenAdv({
		    callbacks: {
		
				onOpen: () => {
					runtime.callFunction("muteGame");
					
				},
				onClose: () => {
					runtime.callFunction("unmuteGame");
					
				}
		    }
		});
	},

	async GameEvents_Event197(runtime, localVars)
	{
		ysdk.onEvent(ysdk.EVENTS.HISTORY_BACK, () => 
		{
			runtime.callFunction("back");
			
		});
	},

	async MenuEvents_Event9_Act1(runtime, localVars)
	{
		var newWindow = window.open(`https://yandex.${runtime.globalVars.domain}/games/developer?name=truelisgames&clid=2670653&utm_source=refferal_program&utm_medium=pool8`,
		          '_blank');
		if (newWindow ==  null)  alert( runtime.globalVars.error );
		
	},

	async MenuEvents_Event70(runtime, localVars)
	{
		ysdk.onEvent(ysdk.EVENTS.HISTORY_BACK, () =>
		{
			if (confirm( runtime.globalVars.back ))
				{
		
				ysdk.dispatchEvent(ysdk.EVENTS.EXIT);
		
				}
		});
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

