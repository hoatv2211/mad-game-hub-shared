window.checkRewardFlag = false;
window.options = {
        "ga": {
                "id": "UA-120043346-101"
        },
        "adsence": {
                "client": "ca-pub-2270136017335510",
                "data-ad-frequency-hint": "45s",
//                 "data-adbreak-test":"on",
                "callback": () => {
                        window.checkRewardFlag = true;
                        window.h5sdk.adConfig({
                                preloadAdBreaks: "auto",
                                
                                onReady: () => {
                                        window.h5sdk.adBreak({
                                                type: "preroll",
                                                name: "mypreroll",
                                                adBreakDone: () => {},
                                        });
                                        
                                },
                        });
                },
        }
}
