var TempStorage = [];
var Inventory_Order = {
	top: 0,
	left: 0,
	items: {}
};
if (mp.storage.data.inventory_order) {
	let storageData = mp.storage.data.inventory_order;
	Inventory_Order.top = storageData.top || 0;
	Inventory_Order.left = storageData.left || 0;
	Inventory_Order.items = storageData.items || {};
} else {
	mp.storage.data.inventory_order = Inventory_Order;
}
var CEFInventory = require("./browser.js").inventory;
var CEFNotification = require("./browser.js").notification;
CEFInventory.load("interface/index.html");
mp.events.add("Inventory:Ready", (data) => {
	CEFInventory.call("initialize", {
		"inventory": {
			top: Inventory_Order.top,
			left: Inventory_Order.left
		}
	})
});

function toggleInventory() {
	if (toggleInvState == false) {
		CEFInventory.call("setPos", "inventory", Inventory_Order.top, Inventory_Order.left);
		CEFInventory.call("show");
		CEFInventory.cursor(true);
		toggleInvState = true;
		mp.canCrouch = false;
	} else {
		mp.rpc.callBrowser(CEFInventory.browser, 'isBusy').then(value => {
			console.log("isBusy", value);
			if (value == false) {
				CEFInventory.call("hide");
				CEFInventory.cursor(false);
				toggleInvState = false;
				mp.canCrouch = true;
			} else {
				CEFNotification.call("notify", {
					title: "Inventory",
					titleSize: "16px",
					message: `Please finish your action before closing..`,
					messageColor: 'rgba(50,50,50,.8)',
					position: "bottomCenter",
					backgroundColor: 'rgba(206, 206, 206, 0.9)',
					close: false
				})
			}
		}).catch(err => {
			console.log("error", err);
			CEFInventory.call("hide");
			CEFInventory.cursor(false);
			toggleInvState = false;
			mp.canCrouch = true;
		});
	}
}
let toggleInvState = false;
mp.keys.bind(0x49, false, function() {
	console.log("press bind key");
	toggleInventory();
});
mp.events.add("Inventory:Update", (inventory) => {
	if (!TempStorage["inventory"]) {
		TempStorage["inventory"] = [];
	}
	console.log("Inventory:Update");
	CEFInventory.call("clear", "inventory");
	TempStorage["inventory"] = [];
	inventory.forEach(function(citem) {
		let tempSettings = StorageSystem.getTempSettings(citem.id, "inventory");
		let gData = {
			id: citem.id,
			name: citem.name,
			image: citem.image,
			scale: tempSettings.scale || {},
			amount: citem.amount,
			max_stack: citem.max_stack
		}
		let width = citem.width;
		let height = citem.height;
		if (tempSettings.flipped == true) {
			citem.width = height;
			citem.height = width;
		}
		console.log("tempSettings", JSON.stringify(tempSettings));
		TempStorage["inventory"].push({
			id: gData.id,
			name: gData.name,
			image: gData.image,
			scale: gData.scale,
			amount: gData.amount,
			max_stack: gData.max_stack,
			width: width,
			height: height,
			cell: tempSettings.cell || 0,
			row: tempSettings.row || 0
		})
		CEFInventory.call("addItem", "inventory", tempSettings.cell || 0, tempSettings.row || 0, citem.width, citem.height, JSON.stringify(gData), tempSettings.flipped || false)
	})
});
mp.events.add("Inventory:AddItem", (citem) => {
	if (!TempStorage["inventory"]) {
		TempStorage["inventory"] = [];
	}
	console.log("Inventory:AddItem", JSON.stringify(citem));
	let tempSettings = StorageSystem.getTempSettings(citem.id, "inventory");
	let gData = {
		id: citem.id,
		name: citem.name,
		image: citem.image,
		scale: tempSettings.scale || {},
		amount: citem.amount
	}
	let width = citem.width;
	let height = citem.height;
	if (tempSettings.flipped == true) {
		citem.width = height;
		citem.height = width;
	}
	console.log("tempSettings", JSON.stringify(tempSettings));
	TempStorage["inventory"].push({
		id: gData.id,
		name: gData.name,
		image: gData.image,
		scale: gData.scale,
		amount: gData.amount,
		max_stack: gData.max_stack,
		width: width,
		height: height,
		cell: tempSettings.cell || 0,
		row: tempSettings.row || 0
	})
	CEFInventory.call("addItem", "inventory", tempSettings.cell || 0, tempSettings.row || 0, citem.width, citem.height, JSON.stringify(gData), tempSettings.flipped || false)
});
mp.events.add("Inventory:Transfer", (source, target) => {
	console.log("Inventory:Transfer", source.id);
	console.log("Inventory:Transfer", target.id);
	source = JSON.parse(source);
	target = JSON.parse(target);
	Inventory_Order = {
		top: Inventory_Order.top,
		left: Inventory_Order.left,
		items: Inventory_Order.items
	};
	target.items.forEach(function(item) {
		Inventory_Order.items[item.item.id + "_" + target.id] = {
			cell: item.cell,
			row: item.row,
			scale: item.scale,
			flipped: item.flipped
		}
	})
	source.items.forEach(function(item) {
		Inventory_Order.items[item.item.id + "_" + source.id] = {
			cell: item.cell,
			row: item.row,
			scale: item.scale,
			flipped: item.flipped
		}
	})
	mp.storage.data.inventory_order = Inventory_Order;
	mp.storage.flush();
	/*Manage Server Sync*/
	source.items = source.items.map((item) => StorageSystem.minify(item));
	target.items = target.items.map((item) => StorageSystem.minify(item));

	mp.events.callRemote("Inventory:Transfer", JSON.stringify(source), JSON.stringify(target));
});
mp.events.add("Inventory:Drag", (positions) => {
	positions = JSON.parse(positions);
	Inventory_Order = {
		top: positions.top,
		left: positions.left,
		items: Inventory_Order.items
	};
	mp.storage.data.inventory_order = Inventory_Order;
	mp.storage.flush();
});
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
var StorageSystem = new class {
	constructor() {}
	minify(item) {
		return {
			id: item.item.id,
			name: item.item.name,
			amount: item.item.amount,
			max_stack: item.item.max_stack
		}
	}
	validate(source,target) {

	}
	checkFit(where, w, h) {
		return new Promise(function(fulfill, reject) {
			mp.rpc.callBrowser(CEFInventory.browser, 'doesFitInto', {
				what: where,
				w: w,
				h: h
			}).then(value => {
				console.log("checkFit", value);
				return fulfill(value);
			}).catch(err => {
				console.log("error", err);
				return reject(err);
			});
		});
	}
	getTempSettings(id, container) {
		if (Inventory_Order.items != undefined) {
			if (Inventory_Order.items[id + "_" + container] != undefined) {
				/*FIX´ITEM FLIPPING*/
				return {
					cell: Inventory_Order.items[id + "_" + container].cell,
					row: Inventory_Order.items[id + "_" + container].row,
					scale: Inventory_Order.items[id + "_" + container].scale,
					flipped: Inventory_Order.items[id + "_" + container].flipped,
				}
			}
		}
		return false;
	}
	map(object) {
		if (itemIdentity[object.name]) {
			return Object.assign(object, itemIdentity[object.name]);
		}
		return false;
	}
}
module.exports = StorageSystem;