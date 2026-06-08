


const scriptsInEvents = {

	async GameEs_Event202_Act1(runtime, localVars)
	{
		
	},

	async Yandex_Event4_Act1(runtime, localVars)
	{
if (localVars.BaseLink.startsWith("/helpers/fake-page")) {
  const url = `${localVars.BaseLink}?clid=2670653&utm_source=refferal_program&utm_medium=${localVars.GameUTMName}`;
  // const newWindow = window.open(url, "_blank");
  // if (!newWindow) {
  //   alert(localVars.ErrorMessage);
  // }
  return;
}

const url = new URL(localVars.BaseLink);
url.searchParams.set("clid", "2670653");
url.searchParams.set("utm_source", "refferal_program");
url.searchParams.set("utm_medium", localVars.GameUTMName);
// const newWindow = window.open(url.toString(), "_blank");
// if (!newWindow) {
//   alert(localVars.ErrorMessage);
// }

	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

