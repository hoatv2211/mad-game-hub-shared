!function () {

    class YPlatform {
        constructor() {
            this.gameList = [{id: '275538', name: 'MakeupSalon'},{id: '277224', name: 'AngelOrDemon'},{id: '253957', name: 'Nail Master'},{id: '275290', name: 'Long Skirt Rise'},{id: '274782', name: 'Girls wardrobe: Storage master'},{id: '273343', name: 'Lipstick Maker'},{id: '273609', name: 'Doll Maker'},{id: '244910', name: 'Teeth Rush'},{id: '243462', name: 'Baking Cake'},{id: '243096', name: 'Cake Dress'},{id: '242377', name: 'Dress Designer'},{id: '193057', name: 'Army Commander'},{id: '196254', name: 'Stack Defence'},{id: '240952', name: 'Couple Runner'},{id: '239150', name: 'Smile Rush'},{id: '239147', name: 'Hand Evolution'},{id: '234404', name: 'Makeup Contest'},{id: '223509', name: 'Gun Evolution'},{id: '194301', name: 'Hair Collector'},{id: '241695', name: 'Bridal Rush'},{id: '193497', name: 'Moon Pioneer'},{id: '194297', name: 'Tug of war'},{id: '195907', name: 'Fire line:Merge defense'},{id: '199163', name: 'Mini Farm'},{id: '203906', name: 'Clash of Jurassic'},{id: '224788', name: 'Happy Beach'},{id: '198452', name: 'Factory Builder'},{id: '216568', name: 'Tap away'},{id: '198454', name: 'Mini Bar'},{id: '266004', name: 'Merge Snake War'},{id: '268553', name: 'Mask Evolution'},{id: '271884', name: 'Idle Sheep'},{id: '191572', name: 'The Hamster Island'},{id: '258310', name: 'Monster Card Battle'},{id: '258795', name: 'Hair Collect Arena'},{id: '258796', name: 'Pimple Popper'},{id: '244424', name: 'Ear Cleaner'},{id: '257870', name: 'High heels'},{id: '263821', name: 'Healthy Rush'},{id: '250411', name: 'Pizzalo'},{id: '247701', name: 'Save Princess'},{id: '246977', name: 'Cake Art'},{id: '246478', name: 'Gem Stack'}]

            this.reviveList = [{id: '230077', name: 'Pole Dance'},{id: '238991', name: 'Hula hoops'},{id: '234957', name: 'High Pizza'},{id: '263821', name: 'Healthy Runner'},{id: '248784', name: 'Pancake Stack'},{id: '250411', name: 'Pizza Chef'},{id: '240952', name: 'Couple Runner'},{id: '192704', name: 'Crowd Runner'},{id: '247701', name: 'Save the Princess'},{id: '258796', name: 'Pimple Popper'},{id: '232567', name: 'Super hero'},{id: '227720', name: 'Plugman'},{id: '230612', name: 'Skateboard Race'},{id: '193493', name: 'Lawn Mover'},{id: '199162', name: 'Stone Miner'},{id: '204565', name: 'Clash of Sky'},{id: '253550', name: 'Draw fighter'},{id: '197054', name: 'Fruit Slice'},{id: '193497', name: 'Moon Pioneer'},{id: '271884', name: 'Idle Sheep'},{id: '191572', name: 'Hamster Island'},{id: '248252', name: 'Knife bounce'},{id: '233309', name: 'Crowd Shooter'}]
            this.prompt_ = null;
            this.fullAdTime = 0;
            this.isMusicPause = false;
            this.morePanel = null;
        }
        static getInstance() {
            if (!this._instance) {
                this._instance = new YPlatform();
            }
            return this._instance;
        }
        getStorageSync(key) {
            let value = null;
            try {
                let v = Laya.LocalStorage.getItem(key);
                value = JSON.parse(v);
            } catch (error) {

            }

            return value
        }
        setStorageSync(key, value) {
            return Laya.LocalStorage.setItem(key, JSON.stringify(value));
        }
        //复活
        showReward(success, failure) {
            console.log("---showReward---");
            if (window.ysdk) {
                let isReward = false;
                window.ysdk.adv.showRewardedVideo({
                    callbacks: {
                        onOpen: () => {
                            console.warn('Video ad open.');
                            Laya.SoundManager.muted = true;
                        },
                        onRewarded: () => {
                            isReward = true;
                            console.warn('Rewarded!');
                        },
                        onClose: () => {
                            if (isReward) {
                                success && success();
                                success = null;
                            } else {
                                failure && failure();
                                failure = null;
                            }
                            Laya.SoundManager.muted = this.isMusicPause;
                            console.warn('Video ad closed.');
                        },
                        onError: (e) => {
                            failure && failure();
                            failure = null;
                            Laya.SoundManager.muted = this.isMusicPause;
                            console.warn('Error while open video ad:', e);
                        }
                    }
                })
            } else {
                success && success();
                success = null;
            }
        }
        showFullScreenAd(call, force) {
            console.log("---showFullScreen---");
            let currentTime = Math.round(new Date().getTime() / 1000);
            if (window.ysdk && (force || !isDraft) && currentTime - this.fullAdTime >= 60) {
                window.ysdk.adv.showFullscreenAdv({
                    callbacks: {
                        onOpen: () => {
                            this.fullAdTime = Math.round(new Date().getTime() / 1000);
                            Laya.SoundManager.muted = true;
                            console.warn(`fullscreen open`)
                        },
                        onClose: (wasShown) => {
                            if (wasShown) {
                                this.fullAdTime = Math.round(new Date().getTime() / 1000);
                            }
                            call && call();
                            Laya.SoundManager.muted = this.isMusicPause;
                            console.warn(`fullscreen close`, wasShown)
                            // some action after close
                        },
                        onError: (error) => {
                            call && call();
                            Laya.SoundManager.muted = this.isMusicPause;
                            console.warn(`fullscreen error`, error)
                            // some action on error
                        }
                    }
                })
            } else {
                call && call();
            }
        }
        showCountDown(prev, call) {

        }
        prompt(msg, duration) {
            if (!this.prompt_) {
                this.prompt_ = document.createElement('div');
                this.prompt_.style.cssText =
                    "font-family:siyuan;max-width:80%;min-width:320px;padding:10px 10px 10px 10px;min-height:40px;color: rgb(255, 255, 255);line-height: 20px;text-align:center;border-radius: 4px;position: fixed;top: 40%;left: 50%;transform: translate(-50%, -50%);z-index: 999999;background: rgba(0, 0, 0,.7);font-size: 16px;";
                document.body.appendChild(this.prompt_);
            }
            this.prompt_.innerHTML = msg;
            duration = isNaN(duration) ? 2000 : duration;
            this.prompt_.style.display = "inline";
            this.prompt_.style.opacity = '1';
            setTimeout(function () {
                var d = 0.5;
                this.prompt_.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d +
                    's ease-in';
                this.prompt_.style.opacity = '0';
                this.prompt_.style.display = "none";
            }.bind(this), duration);
        }
        createMoreGame(parent) {
            // if (!window.btnMore) {
            var btnMore = new Laya.Image()
            btnMore.skin = "res/logo_128.png";
            btnMore.zOrder = 999;
            btnMore.left = 10;
            btnMore.centerY = 0;
            btnMore.width = 100;
            btnMore.height = 100;
            btnMore.on(Laya.Event.CLICK, btnMore, () => {
                if (window.location.ancestorOrigins && window.location.ancestorOrigins[0]) {
                    window.open(window.location.ancestorOrigins[0] + '/games/developer?name=Linder')
                } else {
                    window.open('https://yandex.ru/games/developer?name=Linder')
                }
            })
            if (parent) {
                parent.addChild(btnMore);
            } else {
                Laya.stage.addChild(btnMore);
            }
            window.btnMore = btnMore;
            // }
        }
        toggleBtnMore(visible = true) {
            window.btnMore && (window.btnMore.visible = visible);
        }
        showMoreGamePanel() {
            if (!this.morePanel) {
                var panel = document.createElement('div')
                panel.id = 'morePanel'
                var container = document.createElement('div')
                container.id = 'moreContainer'
                panel.append(container)
                var content = document.createElement('div')
                content.id = 'moreContent'
                var btnClose = document.createElement('img')
                btnClose.id = 'btnClose'
                btnClose.src = './moreGame/btnClose.png'
                btnClose.addEventListener('click', () => {
                    panel.style.display = 'none'
                })
                container.append(content)
                container.append(btnClose)
                var listNode = document.createElement('div')
                listNode.id = 'moreList'
                content.append(listNode)
                
                var firstItem = document.createElement('a'), img = document.createElement('img')
                firstItem.className = 'list-item'
                firstItem.target = '_blank'
                firstItem.href = `${window.langManager.getTopUrl()}/games/developer?name=Linder`
                img.className = 'game-icon'
                img.src = `./moreGame/icon_more2.png`
                firstItem.append(img)
                listNode.append(firstItem)

                for (let index = 0; index < this.gameList.length; index++) {
                    var item = document.createElement('a'), img = document.createElement('img')
                    item.className = 'list-item'
                    item.target = '_blank'
                    item.href = `${window.langManager.getTopUrl()}/games/app/${this.gameList[index].id}`
                    img.className = 'game-icon'
                    img.src = `./moreGame/${this.gameList[index].id}.png`
                    item.append(img)
                    listNode.append(item)
                }
                
                for (let index = 0; index < this.reviveList.length; index++) {
                    var item = document.createElement('a'), img = document.createElement('img')
                    item.className = 'list-item'
                    item.target = '_blank'
                    item.href = `${window.langManager.getTopUrl()}/games/app/${this.reviveList[index].id}`
                    img.className = 'game-icon'
                    img.src = `./moreGame/revive/${this.reviveList[index].id}.png`
                    item.append(img)
                    listNode.append(item)
                }
                this.morePanel = panel
                document.body.append(panel)
            }
            this.morePanel.style.display = 'block'
        }
    }
    YPlatform._instance = null;
    window["YPlatform"] = YPlatform;
}()
