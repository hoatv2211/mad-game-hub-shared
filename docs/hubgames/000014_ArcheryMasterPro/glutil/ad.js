var appName = document.title;
//gtag
function GASend(event, event_param) {
    window.gtag(event, appName, event_param);
}

function ShowRewardAD(callback) {
    var timeout = setTimeout(() => {
        if (callback && callback["onError"]) callback["onError"]();
    }, 5000);
    console.log("ShowRewardAD")
    // 展示激励广告
    if (callback && callback["onRewarded"]) callback["onRewarded"]();
   
}
var interTimes = 0;
var limitTime = 1703918337000;
function ShowInterstitialAD(callback) {
    interTimes++;
    console.log("interTimes", interTimes);
    if (interTimes < 2) {
        if (callback && callback["onError"]) callback["onError"]();
        return;
    }
    function showad() {
        var timeout = setTimeout(() => {
            if (callback && callback["onError"]) callback["onError"]();
        }, 5000);
        if (callback && callback["onClose"]) callback["onClose"]();
        console.log("ShowInterstitialAD")
     
    }
    // setTimeout(() => {
    showad();
    // }, 1000);
}

var isfirst = true;
//游戏加载完成上报时间
function onGameReadyForPlay() {
    if (!isfirst) return;
    console.log("onGameReadyForPlay");
    isfirst = false;

    // let now_time = Date.now();
    // if (now_time > limitTime)
    //     setInterval(() => {
    //         ShowInterstitialAD();
    //     }, 300 * 1000);
}


// 全屏
function doFullScreen() {
    var docElm = document.documentElement;
    //W3C 
    if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
    }
    //FireFox 
    else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
    }
    //Chrome等 
    else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
    }
    //IE11 
    else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}
