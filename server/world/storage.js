const itemIdentity = {
	"Pump Shotgun": {
		width: 4,
		height: 2,
		max_stack: 1,
		name: 'Pump Shotgun',
		image: '../../source/img/weapon_pumpshotgun.png'
	},
	"Hatchet": {
		width: 2,
		height: 4,
		max_stack: 1,
		name: 'Hatchet',
		image: '../../source/img/hatchet.png'
	},
	"12 Gauge Shells": {
		width: 1,
		height: 1,
		max_stack: 32,
		name: '12 Gauge Shells',
		image: '../../source/img/12_Gauge_Shells.png'
	},
	"Micro SMG": {
		width: 3,
		height: 2,
		max_stack: 1,
		name: 'Micro SMG',
		image: '../../source/img/weapon_microsmg.png'
	},
	"9mm Bullets": {
		width: 1,
		height: 1,
		max_stack: 128,
		name: '9mm Bullets',
		image: '../../source/img/9mm_bullets.png'
	},
	"Assault Rifle": {
		width: 4,
		height: 2,
		max_stack: 1,
		name: 'Assault Rifle',
		image: '../../source/img/weapon_assaultrifle.png'
	},
	"5.56m Bullets": {
		width: 1,
		height: 1,
		max_stack: 64,
		name: '5.56m Bullets',
		image: '../../source/img/556m_Bullets.png'
	},
	"Drank": {
		width: 1,
		height: 1,
		max_stack: 15,
		name: 'Drank',
		image: '../../source/img/energy_drink_small.png'
	},
	"Drank Fresh": {
		width: 1,
		height: 2,
		max_stack: 14,
		name: 'Drank Fresh',
		image: '../../source/img/energy_drink_small.png'
	},
	"Gas Can": {
		width: 3,
		height: 3,
		max_stack: 1,
		name: 'Gas Can',
		image: '../../source/img/Icon_jerrycan.png'
	},
	"Wood": {
		width: 3,
		height: 3,
		max_stack: 128,
		name: 'Wood',
		image: '../../source/img/wood.png'
	}
}
var MongoDB = require("../libs/mongodb.js")
var Inventory = MongoDB.getInventoryModel();
var Storage = new class {
	constructor() {
		this._tempStorage = [];
	}
	async validate(player, sStorage, tStorage) {
		console.log("IDS", sStorage.id, tStorage.id);
		let TempStorage_sStorage = (sStorage.id == "inventory") ? player.class.getInventory() : (this._tempStorage[sStorage.id] || [])
		/* Validate tStorage*/
		console.log("TempStorage_sStorage", TempStorage_sStorage);
		if (sStorage.id != tStorage.id) {
			/* Validate sStorage*/
			console.log("validate sStorage");
		}
	}
	async save(player, storage) {}
	map(object) {
		if (itemIdentity[object.name]) {
			return Object.assign(object, itemIdentity[object.name]);
		}
		return false;
	}
}
mp.events.add("Inventory:Transfer", function(player, source, target) {
	//console.log("Inventory.Transfer",player.class,source,target)
	Storage.validate(player, JSON.parse(source), JSON.parse(target))
});
module.exports = Storage;