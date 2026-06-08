


window.onmessage = function (e) {
  e = e || event;
  let tempData = e.data + "";
  if (tempData == "open" || tempData == "showInterstitial") {
    showInterstitial(() => {
      document.getElementById("iframe_game").contentWindow.postMessage("close", "*");
    });
  } else if (tempData == "showReward") {
    showReward(() => {
      document.getElementById("iframe_game").contentWindow.postMessage("close", "*");
    }, () => {
      document.getElementById("iframe_game").contentWindow.postMessage("fail", "*");
    });
  }
}
window._ShowAd = null;
window._success = null;
window._failure = null;
window.untilLog = (msg) => {
  console.log('%c' + msg, 'color: #43bb88;font-size: 24px;font-weight: bold;text-decoration: underline;');
}
window.showLoadAd = (success) => {
 // window.h5sdk.show();
  // console.log("requesting loading AD");
  // let typename = "preroll";
  // window.h5sdk.adBreak({
  //   type: typename,
  //   name: "game",
  //   adBreakDone: () => {
  //     success && success();
  //     success = null;
  //   }
  // });
  // return true;
}
window.showInterstitial = (success) => {

  console.log("requesting Interstitial AD");
  let typename = "next";
  window.h5sdk.adBreak({
    type: typename,
    name: "game",
    adBreakDone: () => {
      success && success();
      success = null;
    }
  });
  return true;
}
window.showReward = (success, failure) => {
  if (window._ShowAd) {
    window.untilLog("requesting Reward AD");
    window._success = success;
    window._failure = failure;
    window._ShowAd();
    window._ShowAd = null;
    return true;
  } else {
    checkReward();
    failure && failure();
    return false;
  }
}

var isShow = false;

window.checkReward = () => {
 

	  
	
  if (window._ShowAd)
    return;

  if(!window.checkRewardFlag){
      return;
  }

  console.log("%c Preload Reward AD", 'color: #00FF00;font-size: 18px;');
  window.h5sdk.adBreak({
    type: "reward",
    name: "reward",
    beforeAd: () => {
      console.log("%c Reward AD BeforeAd", 'color: #0000FF;font-size: 18px;');
    },
    afterAd: () => {
      console.log("%c Reward AD AfterAd", 'color: #FFA500;font-size: 18px;');
      window._ShowAd = null;
      checkReward()
    },
    beforeReward: (showAdFn) => {
      window.untilLog("load Reward AD Successful");
      window._ShowAd = showAdFn;
    },
    adDismissed: () => {
      window._failure && window._failure();
      window._failure = null;
    },
    adViewed: () => {
      window._success && window._success();
      window._success = null;
    },
    adBreakDone: (placementInfo) => {
      console.log(placementInfo);
    }
  });
}


var checkRewardInterval = setInterval(() => {
  window.checkReward()
}, 1e3);


// function gtag() {
//   try {
//     ga(arguments[0], arguments[1], arguments[2]);
//   } catch (e) {
//     console.log(e)
//   }
// }

// '/games/000049/space_attack/index.htm'
var gameId = window.location.pathname.split('/')[2];
var xhr = new XMLHttpRequest();
xhr.open("POST", "https://api.cocaji.com/game-count/" + gameId, true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify({
  count: 1
}));
xhr.onload = function () {
  console.log(this.responseText);
  var data = JSON.parse(this.responseText);
  console.log(data);
}

