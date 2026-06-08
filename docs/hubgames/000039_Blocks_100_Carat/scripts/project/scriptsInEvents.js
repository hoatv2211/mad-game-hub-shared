import {scene} from "./Main.js";

function getScene(){
	return scene;
}



const scriptsInEvents = {

	async Egame_Event18_Act1(runtime, localVars)
	{
		var newWindow = window.open(`https://yandex.${runtime.globalVars.domain}/games/developer?name=truelisgames&clid=2670653&utm_source=refferal_program&utm_medium=jewelblockpuzzle`,
		          '_blank');
		if (newWindow ==  null)  alert( runtime.globalVars.error );
		parent.location.reload();
	},

	async Egame_Event30_Act2(runtime, localVars)
	{
		scene.playSound('click');
	},

	async Egame_Event37_Act1(runtime, localVars)
	{
		scene.playSound('click');
	},

	async Egame_Event40_Act2(runtime, localVars)
	{
		scene.playSound('click');
	},

	async Egame_Event41_Act3(runtime, localVars)
	{
		scene.playSound('click');
	},

	async Egame_Event43_Act1(runtime, localVars)
	{
		scene.playSound('click');
	},

	async Egame_Event46_Act4(runtime, localVars)
	{
		const shape = runtime.getInstanceByUid(+runtime.globalVars.Temp);
		const x = +runtime.globalVars.Temp1;
		const y = +runtime.globalVars.Temp2;
		getScene().onTouchShape(shape,x,y);
		
	},

	async Egame_Event47_Act1(runtime, localVars)
	{
		if(scene.dragShape)
		{
		
			scene.onTouchUp();
		}
	},

	async Egame_Event48_Act3(runtime, localVars)
	{
		if(scene.dragShape)
		{
		const x = +runtime.globalVars.Temp1;
		const y = +runtime.globalVars.Temp2;
			getScene().onDragShape(x,y);
		}
	},

	async Egame_Event51_Act2(runtime, localVars)
	{
		scene.playSound('click');
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

