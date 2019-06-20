let utils = require("./utils.js");
var CEFHud = require("./browser.js").hud;
var initDone = false;
var toShow = false;
var cachedData = {
	show: false,
	thirst: 0,
	hunger: 0,
	energy: {
		show: false,
		val: 0
	}
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
mp.events.add("Sync:StopAnimSync", (tID, dict, name) => {
	var player = mp.players.atRemoteId(tID);
	if (player) {
		player.stopAnimTask(dict, name, 1);
	}
});
mp.events.add("Sync:PlayAnimation", (tID, dict, name, speed, speedMultiplier, duration, flag, playbackRate, lockX, lockY, lockZ, timeout) => {
	var player = mp.players.atRemoteId(tID);
	if (player) {
		if (mp.game.streaming.doesAnimDictExist(dict)) {
			mp.game.streaming.requestAnimDict(dict);
			while (mp.game.streaming.hasAnimDictLoaded(dict)) {
				break;
			}
			console.log("sync play started for", player.name, dict, name);
			console.log(dict, name, speed, speedMultiplier, duration, flag, playbackRate, lockX, lockY, lockZ,timeout);
			player.taskPlayAnim(dict, name, speed, speedMultiplier, duration, flag, playbackRate, lockX, lockY, lockZ);
			if (timeout != 0) {
				setTimeout(function() {
					player.stopAnimTask(dict, name, 1);
				}, timeout)
			}
		}
	}
});
const statNames = ["SP0_STAMINA﻿", "SP0_STRENGTH", "SP0_LUNG_CAPACITY", "SP0_WHEELIE_ABILITY", "SP0_FLYING_ABILITY", "SP0_SHOOTING_ABILITY", "SP0_STEALTH_ABILITY"];
// maybe playerReady can be used instead, haven't tested
mp.events.add("playerSpawn", () => {
	for (const stat of statNames) mp.game.stats.statSetInt(mp.game.joaat(stat), 100, false);
});
//CEFHud
let opos = undefined;
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
			mp.game.player.setRunSprintMultiplierFor(1 + ((0.49 / 400) * thirst));
			if (thirst < 30) {
				mp.game.controls.disableControlAction(2, 21, true);
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