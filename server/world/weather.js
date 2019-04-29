
//vector.insidePolygon(polygon)
var WeatherManager = new class {
    constructor() {
        this._weathers = [{
			name:"HALLOWEEN",
			wind:{
				speed:0,
				dir:0
			},
			rain:0,
			polygon:[
				{x:1830.005615234375, y:2304.627685546875, z:59.465003967285156},
				{x:2495.33349609375, y:2780.03173828125, z:58.52008819580078},
				{x:2972.216552734375, y:4728.8759765625, z:138.31849670410156},
				{x:2409.1240234375, y:5163.08154296875, z:112.46800231933594},
				{x:2074.1650390625, y:5225.42578125, z:126.00337982177734},
				{x:1693.992431640625, y:5004.43017578125, z:158.6930389404297},
				{x:1243.2454833984375, y:4682.306640625, z:186.73049926757812},
				{x:564.419189453125, y:4505.4248046875, z:202.14212036132812},
				{x:-287.1321716308594, y:4513.5, z:196.2624969482422},
				{x:-82.02429962158203, y:3179.771240234375, z:230.50894165039062},
				{x:1049.180419921875, y:2059.069091796875, z:97.63768005371094},
				{x:1429.7305908203125, y:2212.03271484375, z:116.07293701171875},
				{x:1569.124755859375, y:2307.7666015625, z:99.6394271850586}
			]
		}];
    }
    call(player) {
    	player.call("Weather:LoadAreas",[JSON.stringify(this._weathers)]);
    }
}

module.exports = WeatherManager;