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
	mp.canCrouch = !mp.canCrouch;
	if (toggleInvState == false) {
		CEFInventory.call("setPos", "inventory", Inventory_Order.top, Inventory_Order.left);
		CEFInventory.call("show");
		CEFInventory.call("addStorageContainer", "Container", "storage", {
			top: 450,
			left: 600
		}, 4, 8, [{
			cell: 0,
			row: 0,
			width: 4,
			height: 2,
			item: {
				amount:1,
				name: "CompactRifle",
				image: "../../source/img/weapon_compactrifle.png"
			}
		}, {
			cell: 0,
			row: 0,
			width: 4,
			height: 2,
			item: {
				amount:1,
				name: "CompactRifle",
				image: "../../source/img/weapon_compactrifle.png"
			}
		}]);
		CEFInventory.cursor(true);
		toggleInvState = true;
	} else {
		mp.rpc.callBrowser(CEFInventory.browser, 'isBusy').then(value => {
			console.log("isBusy", value);
			if (value == false) {
				CEFInventory.call("hide");
				CEFInventory.cursor(false);
				toggleInvState = false;
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
		});
	}
}
let toggleInvState = false;
mp.keys.bind(0x49, false, function() {
	console.log("press bind key");
	toggleInventory() ;
	
});
mp.events.add("Inventory:Update", (inventory) => {
	console.log("Inventory:Update");
	CEFInventory.call("clear", "inventory");
	inventory.forEach(function(citem) {
		let details = StorageSystem.mapItem(citem.name);
		citem = Object.assign(citem, details);
		let tempSettings = StorageSystem.getTempSettings(citem.id, "inventory");
		let gData = {
			id: citem.id,
			name: details.name,
			image: details.image,
			scale: tempSettings.scale || {},
			amount:citem.amount,
			max_stack:details.max_stack
		}
		let width = citem.width;
		let height = citem.height;
		if (tempSettings.flipped == true) {
			citem.width = height;
			citem.height = width;
		}
		console.log("tempSettings", JSON.stringify(tempSettings));
		CEFInventory.call("addItem", "inventory", tempSettings.cell || 0, tempSettings.row || 0, citem.width, citem.height, JSON.stringify(gData), tempSettings.flipped || false)
	})
});
mp.events.add("Inventory:AddItem", (citem) => {
	console.log("Inventory:AddItem", JSON.stringify(citem));
	let details = StorageSystem.mapItem(citem.name);
	citem = Object.assign(citem, details);
	let tempSettings = StorageSystem.getTempSettings(citem.id, "inventory");
	let gData = {
		id: citem.id,
		name: details.name,
		image: details.image,
		scale: tempSettings.scale || {},
		amount:citem.amount
	}
	let width = citem.width;
	let height = citem.height;
	if (tempSettings.flipped == true) {
		citem.width = height;
		citem.height = width;
	}
	console.log("tempSettings", JSON.stringify(tempSettings));
	CEFInventory.call("addItem", "inventory", tempSettings.cell || 0, tempSettings.row || 0, citem.width, citem.height, JSON.stringify(gData), tempSettings.flipped || false)
});
mp.events.add("Inventory:Transfer", (source, target) => {
	console.log("Inventory:Transfer", source);
	console.log("Inventory:Transfer", target);
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
var StorageSystem = new class {
	constructor() {
		this._template = {
			"Pump Shotgun": {
				width: 4,
				height: 2,
				max_stack:1,
				name: 'Pump Shotgun',
				image: '../../source/img/weapon_pumpshotgun.png'
			},
			"Hatchet": {
				width: 2,
				height: 4,
				max_stack:1,
				name: 'Hatchet',
				image: '../../source/img/hatchet.png'
			},
			"12 Gauge Shells": {
				width: 1,
				height: 1,
				max_stack:32,
				name: '12 Gauge Shells',
				image: '../../source/img/12_Gauge_Shells.png'
			},
			"Micro SMG": {
				width: 3,
				height: 2,
				max_stack:1,
				name: 'Micro SMG',
				image: '../../source/img/weapon_microsmg.png'
			},
			"9mm Bullets": {
				width: 1,
				height: 1,
				max_stack:128,
				name: '9mm Bullets',
				image: '../../source/img/9mm_bullets.png'
			},
			"Assault Rifle": {
				width: 4,
				height: 2,
				max_stack:1,
				name: 'Assault Rifle',
				image: '../../source/img/weapon_assaultrifle.png'
			},
			"5.56m Bullets": {
				width: 1,
				height: 1,
				max_stack:64,
				name: '5.56m Bullets',
				image: '../../source/img/556m_Bullets.png'
			},
			"Drank": {
				width: 1,
				height:1,
				max_stack:15,
				name: 'Drank',
				image: '../../source/img/energy_drink_small.png'
			},
			"Drank Fresh": {
				width: 1,
				height: 2,
				max_stack:14,
				name: 'Drank Fresh',
				image: '../../source/img/energy_drink_small.png'
			},
			"Gas Can": {
				width: 3,
				height: 3,
				max_stack:1,
				name: 'Gas Can',
				image: '../../source/img/Icon_jerrycan.png'
			}
		}
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
	mapItem(name) {
		if (this._template[name]) {
			return this._template[name];
		}
		return false;
	}
}
module.exports = StorageSystem;