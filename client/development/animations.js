mp.events.add("Sync:StopAnimSync", (tID, dict, name) => {
	var player = mp.players.atRemoteId(tID);
	if (player) {
		player.stopAnimTask(dict, name, 1);
	}
});
mp.events.add("Sync:PrepareAnim", (anims) => {
	anims.forEach(function(anim) {
		console.log(JSON.stringify(anim));
		if (mp.game.streaming.doesAnimDictExist(anims.dict)) {
			mp.game.streaming.requestAnimDict(anims.dict);
			while (mp.game.streaming.hasAnimDictLoaded(anims.dict)) {
				mp.game.wait(10);
			}
			console.log("Loaded anim lib.", JSON.stringify(anim))
		}
	})
});
mp.events.add("Sync:PlayAnimation", (tID, dict, name, speed, speedMultiplier, duration, flag, playbackRate, lockX, lockY, lockZ, timeout) => {
	var player = mp.players.atRemoteId(tID);
	if (player) {
		if (mp.game.streaming.doesAnimDictExist(dict)) {
			mp.game.streaming.requestAnimDict(dict);
			while (mp.game.streaming.hasAnimDictLoaded(dict)) {
				break;
			}
			console.log("sync play started for", player.name, dict, name, timeout);
			player.taskPlayAnim(dict, name, speed, speedMultiplier, duration, flag, playbackRate, lockX, lockY, lockZ);
			if (timeout != 0) {
				setTimeout(function() {
					player.stopAnimTask(dict, name, 1);
				}, timeout)
			}
		}
	}
});