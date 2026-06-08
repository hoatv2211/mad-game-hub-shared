


const scriptsInEvents = {

	async Gamesheet_Event212_Act1(runtime, localVars)
	{
		var newWindow = window.open(`https://yandex.${runtime.globalVars.domain}/games/developer?name=truelisgames&clid=2670653&utm_source=refferal_program&utm_medium=tet-ris3-0`,
		          '_blank');
		if (newWindow ==  null)  alert( runtime.globalVars.error );
		parent.location.reload();
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

