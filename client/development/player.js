let utils = require("./utils.js");
var CEFHud = require("./browser.js").hud;
var initDone = false;
var toShow = false;
var cachedData = {
	show: false,
	thirst: 0,
	hunger: 0
};
/*Load Hud*/
mp.events.add('Player:ShowUI', () => {
	CEFHud.load("hud/index.html");
	toShow = true;
});
mp.events.add('Player:HideUI', () => {
	toShow = false;
});
mp.events.add("HUD:Ready", () => {
	let anchor = utils.minimap_anchor();
	CEFHud.call("init", anchor);
	initDone = true;
});
//CEFHud
mp.events.add("render", () => {
	if (mp.localPlayer.getVariable("spawned") == true) {
		if (initDone == true) {
			let hunger = mp.localPlayer.getVariable("hunger")
			let thirst = mp.localPlayer.getVariable("thirst")
			if (hunger != cachedData.hunger) {
				cachedData.hunger = hunger;
				CEFHud.call("setHunger", cachedData.hunger);
			}
			if (thirst != cachedData.thirst) {
				cachedData.thirst = thirst;
				CEFHud.call("setThirst", cachedData.thirst);
			}
		}
	}
	if (toShow != cachedData.show) {
		if (toShow == true) {
			cachedData.show = true;
			CEFHud.call("show")
		} else {
			cachedData.show = false;
			CEFHud.call("hide")
		}
	}
});