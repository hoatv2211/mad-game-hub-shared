window.screenOrientation = "portrait";

loadLib("libs/min/laya.core.min.js");
loadLib("libs/min/laya.d3.min.js");
loadLib("libs/min/laya.ui.min.js");
// loadLib("libs/min/laya.physics3D.runtime.min.js");
loadLib("libs/min/laya.physics3D.min.js");

loadLib("libs/min/fairygui.min.js"),
loadLib("libs/min/utils.min.js"),
loadLib("libs/min/W.js")
loadLib("libs/min/ad.min.js")

window.langManager = {
    langType: "RU",
    langs: {
        EN: {
            clear: "Empty the grid",
            clear2: "There is no empty position,\nempty all grids",
            get_time: "Get unlimited time",
            resort_balloon: "Disrupt unused balloons",
            get_time2: "Get unlimited time for the current level",
            clear_group: "Eliminate 1 set of balloons",
            back_last_step: "Back to the previous step",
            guide_hand1: "Click on 3 balloons to match",
            guide_rotate: "Slide the screen to rotate the balloon",
            guide_ball3: "Combine balloons, click to\nrelease the internal balloons",
            guide_ballran: "Random balloons, click to\nshow the original appearance",
            energy_is_enough: "Plenty of energy, please try again later"
        },
        RU: {
            clear: "Очистите сетку",
            clear2: "Нет пустой позиции,\nочистите все решетки",
            get_time: "Получите неограниченное время",
            resort_balloon: "Разорвать воздушный шар",
            get_time2: "Получите неограниченное время\nдля прохождения текущего уровня",
            clear_group: "Уничтожьте 1 комплект\nвоздушных шаров",
            back_last_step: "Вернемся к предыдущему шагу",
            guide_hand1: "Нажмите на 3 воздушных шарика,\nчтобы они совпали",
            guide_rotate: "Сдвиньте экран, чтобы повернуть\nвоздушный шар",
            guide_ball3: "Объедините воздушные шары, \nнажмите, чтобы освободить\nвнутренние воздушные шары",
            guide_ballran: "Случайные воздушные шары,\nнажмите, чтобы показать\nоригинальный внешний вид",
            energy_is_enough: "У вас много энергии, пожалуйста, повторите попытку позже"
        },
        TR: {
            clear: "Izgarayı boşaltın",
            clear2: "Boş pozisyon yok,\ntüm kafesleri boşaltın",
            get_time: "Sınırsız zaman kazanın",
            resort_balloon: "Balonu bozmak",
            get_time2: "Mevcut seviye için sınırsız zaman kazanın",
            clear_group: "1 Set balonu ortadan kaldırın",
            back_last_step: "Önceki adıma geri dön",
            guide_hand1: "Eşleştirmek için 3 balona tıklayın",
            guide_rotate: "Balonu döndürmek için ekranı kaydırın",
            guide_ball3: "Balonları birleştirin,iç balonları\nserbest bırakmak için tıklayın",
            guide_ballran: "Rastgele balonlar, orijinal\ngörünümünü göstermek için tıklayın",
            energy_is_enough: "Bol enerji, lütfen daha sonra tekrar deneyin"
        },
        ZH: {
            clear: "清除格子",
            clear2: "没有格子可以放置了\n清除所有格子的元素",
            get_time: "观看完整视频获得无限时间",
            resort_balloon: "自动打乱所有未使用气球",
            get_time2: "当前关卡获得无限时间",
            clear_group: "立即消除一组气球",
            back_last_step: "帮助你回到上一步",
            guide_hand1: "点击三个气球进行匹配",
            guide_rotate: "手指滑动屏幕旋转气球堆",
            guide_ball3: "组合气球，点击收集到格子中\n并释放内部气球",
            guide_ballran: "随机气球，收集后\n会在收集槽内显示原始样子",
            energy_is_enough: "能量充足，请稍后再试"
        }
    },
    imageMap: [],
    getLangStr(key, number) {
        let str = this.langs[this.langType][key];
        if (!str) return key;
        number && (str = str.replace("{x}", number));
        return str ? str : key;
    },
    getLangImage(url) {
        let res = url;
        for (let index = 0; index < this.imageMap.length; index++) {
            let key = this.imageMap[index];
            let name = `/${key}.png`;
            if (url.indexOf(name) > 0) {
                let langEnd = this.langType == "RU" ? "_ru" : (this.langType == "TR" ? "_tr" : (this.langType == "EN" ? "_en" : ""));
                let replaceName = `/${key}${langEnd}.png`
                res = url.replace(name, replaceName);
                break;
            }
        }
        return res;
    },
    getTopUrl() {
        let domain = this.langType == "RU" ? "yandex.ru" : (this.langType == "TR" ? "yandex.ru" : "yandex.com");
        return "https://" + domain;
    }
}
if (window.YaGames) {
    window.boardName = "board234957"
    window.maxScore = 0;
    YaGames.init().then(ysdk => {
        console.log('Yandex SDK initialized');
        window.ysdk = ysdk;
        var i18n = ysdk.environment.i18n;
        if (i18n.lang == "ru") {
            window.langManager.langType = "RU";
        } else if (i18n.lang == "tr") {
            window.langManager.langType = "TR";
        } else {
            window.langManager.langType = "EN";
        }
        window.ysdk.getStorage()
            .then(storage => {
                var useAgent = window.navigator.userAgent.toLowerCase();
                if (useAgent.indexOf("iphone") > 0) {
                    window.ystorage = storage;
                }
            })
        loadLib("js/bundle.js");
    }).catch(err => { })
} else {
    loadLib("js/bundle.js");
}