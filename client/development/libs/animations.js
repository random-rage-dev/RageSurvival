var toLoad = ["mp_defend_base","anim@heists@money_grab@duffel"]
var loadPromises = [];
toLoad.forEach(function(dict) {
	mp.game.streaming.requestAnimDict(dict);
	loadPromises.push(new Promise((resolve, reject) => {
		let timer = setInterval(() => {
			if (mp.game.streaming.hasAnimDictLoaded(dict)) {
				clearInterval(timer);
				resolve();
			}
		}, 100);
	}));
})
Promise.all(loadPromises).then(() => {
	console.log("all dicts loaded")
}).catch(err => {
	console.log("all dicts err", err)
})