


const scriptsInEvents = {

	async MenuEs_Event1_Act4(runtime, localVars)
	{
		if (localStorage.adProgress == undefined) {
			localStorage.adProgress = 1;
		}
		
		const payload = window.environment.payload;
		
		if (payload != undefined) {
			if (payload == 'resume') {
				runtime.globalVars.inADMode = true;
		
				const randAdder = Math.floor(Math.random()*3) + 1;
				let nextLvl = Number(localStorage.adProgress) + randAdder;
		
				if (nextLvl > 30) {
					nextLvl = 1;
				}
		
				runtime.globalVars.ADLevel = nextLvl;
			} else if (payload.startsWith('lvl')) {
				const lvlNum = Number(payload.slice(3));
		
				if (!isNaN(lvlNum) && lvlNum >= 1 && lvlNum <= 30) {
					runtime.globalVars.inADMode = true;
					runtime.globalVars.ADLevel = lvlNum;
				}
			}
		}
	},

	async Yandex_Event4_Act1(runtime, localVars)
	{
		if (localVars.BaseLink.startsWith("/helpers/fake-page")) {
		  if (!window.open(localVars.BaseLink, "_blank")) {
		    alert(localVars.ErrorMessage);
		  }
		  return;
		}
		
		const url = new URL(localVars.BaseLink);
		
		if (url.hostname.includes(["p", "l", "a", "y", "h", "o", "p"].join(""))) {
		  url.searchParams.set("clid", "8416381");
		  url.searchParams.set("utm_source", "refferal_program");
		  url.searchParams.set("utm_medium", localVars.GameUTMName);
		} else if (url.hostname.includes(["y", "a", "n", "d", "e", "x"].join(""))) {
		  url.searchParams.set("clid", "2670653");
		  url.searchParams.set("utm_source", "refferal_program");
		  url.searchParams.set("utm_medium", localVars.GameUTMName);
		}
		
		// if (!window.open(url.toString(), "_blank")) {
		//   alert(localVars.ErrorMessage);
		// }
		
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

