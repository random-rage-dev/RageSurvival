var cell_size = 40;
var padding = 5;
var inv_cells = 6;
var inv_rows = 5;
var TempStorage = [];
var CEFStorage = require("./browser.js").storage;
var CEFNotification = require("./browser.js").notification;
var ScreenResolution = mp.game.graphics.getScreenActiveResolution(0, 0);
CEFStorage.load("storage/index.html");
let clientWidth = cell_size * inv_cells + (padding * 2)
let clientHeight = cell_size * inv_rows + 37 + (padding * 2)
var Inventory_Order = {
	positions: {
		"inventory": {
			top: `calc(50% - ${clientHeight/2}px)`,
			left: `calc(50% - ${clientWidth/2}px)`
		},
		"equipment": {
			top: `20%`,
			left: `15%`
		}
	},
	items: {}
};
if (mp.storage.data.inventory_order) {
	let storageData = mp.storage.data.inventory_order;
	Inventory_Order.positions = storageData.positions || {
		"inventory": {
			top: `calc(50% - ${clientHeight/2}px)`,
			left: `calc(50% - ${clientWidth/2}px)`
		},
		"equipment": {
			top: `20%`,
			left: `15%`
		}
	};
	Inventory_Order.items = storageData.items || {};
} else {
	mp.storage.data.inventory_order = Inventory_Order;
}
mp.events.add("Inventory:Resize", (cell_count, row_count) => {
	inv_cells = cell_count;
	inv_rows = row_count;
	CEFStorage.call("resize", "inventory", inv_cells, inv_rows);
});
mp.events.add("Inventory:Ready", (data) => {
	CEFStorage.call("initialize", "inventory", inv_cells, inv_rows, {
		top: Inventory_Order.positions["inventory"].top,
		left: Inventory_Order.positions["inventory"].left
	})
});
var windowsOpen = [];

function toggleInventory() {
	
	console.log("toggle inventory", JSON.stringify(windowsOpen));
	console.log("mp.gui.chat.enabled", mp.gui.chat.enabled);
	console.log("mp.ui.ready", mp.ui.ready);
	if (windowsOpen.indexOf("inventory") == -1) {
		if ((mp.gui.chat.enabled == false) && (mp.ui.ready == true)) {
			CEFStorage.call("setPos", "inventory", Inventory_Order.positions["inventory"].top, Inventory_Order.positions["inventory"].left);
			CEFStorage.call("show");
			CEFStorage.cursor(true);
			windowsOpen.push("inventory");
			mp.canCrouch = false;
			mp.gui.chat.activate(false)
		}
	} else {
		mp.rpc.callBrowser(CEFStorage.browser, 'isBusy').then(value => {
			if (value == false) {
				CEFStorage.call("hide");
				windowsOpen.splice(windowsOpen.indexOf("inventory"), 1);
				if (windowsOpen.length == 0) {
					mp.gui.chat.activate(true)
					CEFStorage.cursor(false);
					mp.canCrouch = true;
				}
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
			CEFStorage.call("hide");
			windowsOpen.splice(windowsOpen.indexOf("inventory"), 1);
			if (windowsOpen.length == 0) {
				mp.gui.chat.activate(true)
				CEFStorage.cursor(false);
				mp.canCrouch = true;
			}
		});
	}
}

function toggleEquipment() {
	console.log("toggle inventory", JSON.stringify(windowsOpen));
	console.log("mp.gui.chat.enabled", mp.gui.chat.enabled);
	console.log("mp.ui.ready", mp.ui.ready);
	if (windowsOpen.indexOf("equipment") == -1) {
		if ((mp.gui.chat.enabled == false) && (mp.ui.ready == true)) {
			console.log("x");
			//console.log("setPos", "equipment", Inventory_Order.positions["equipment"].top || 0, Inventory_Order.positions["equipment"].left || 0);
			CEFStorage.call("setPos", "equipment", Inventory_Order.positions["equipment"].top || 0, Inventory_Order.positions["equipment"].left || 0);
			CEFStorage.call("show", "equipment");
			CEFStorage.cursor(true);
			toggleInvState = true;
			mp.canCrouch = false;
			mp.gui.chat.activate(false)
			windowsOpen.push("equipment");
		}
	} else {
		mp.rpc.callBrowser(CEFStorage.browser, 'isBusy').then(value => {
			if (value == false) {
				CEFStorage.call("hide", "equipment");
				windowsOpen.splice(windowsOpen.indexOf("equipment"), 1);
				if (windowsOpen.length == 0) {
					mp.gui.chat.activate(true)
					CEFStorage.cursor(false);
					mp.canCrouch = true;
				}
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
			CEFStorage.call("hide");
			windowsOpen.splice(windowsOpen.indexOf("equipment"), 1);
			if (windowsOpen.length == 0) {
				mp.gui.chat.activate(true)
				CEFStorage.cursor(false);
				mp.canCrouch = true;
			}
		});
	}
}
let toggleInvState = false;
mp.keys.bind(0x55, false, () => {
	toggleEquipment();
});
mp.keys.bind(0x49, false, () => {
	toggleInventory();
});
mp.events.add("Inventory:Update", (inventory) => {
	if (!TempStorage["inventory"]) {
		TempStorage["inventory"] = [];
	}
	CEFStorage.call("clear", "inventory");
	TempStorage["inventory"] = [];
	inventory = inventory.sort(function(a, b) {
		return b.height - a.height || b.width - a.width;
	})
	inventory.forEach(function(citem) {
		let tempSettings = StorageSystem.getTempSettings(citem.id, "inventory");
		let gData = {
			id: citem.id,
			name: citem.name,
			image: citem.image,
			scale: tempSettings.scale || {},
			amount: citem.amount,
			max_stack: citem.max_stack,
			mask: citem.mask,
			usable: citem.usable || false
		}
		let width = citem.width;
		let height = citem.height;
		if (tempSettings.flipped == true) {
			citem.width = height;
			citem.height = width;
		}
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
		CEFStorage.call("addItem", "inventory", tempSettings.cell || 0, tempSettings.row || 0, citem.width, citem.height, JSON.stringify(gData), tempSettings.flipped || false)
	})
});
mp.events.add("Inventory:EditItem", (citem) => {
	console.log("Inventory:EditItem item", citem);
});
mp.events.add("Inventory:RemoveItem", (id) => {
	if (TempStorage["inventory"]) {
		let index = TempStorage["inventory"].findIndex((e) => {
			return e.id == id;
		})
		console.log("index in temp inv",index);
		if (index > -1) {
			//CEFStorage.call("removeItemByID", "inventory", id);
			mp.rpc.callBrowser(CEFStorage.browser, 'removeItemByID', {
				selector: "inventory",
				id: id
			}).then(value => {
				console.log("removeItemByID", value);
			}).catch(err => {
				console.log("error", err);
			});
			TempStorage["inventory"][index] = null;
			delete TempStorage["inventory"][index];
            TempStorage["inventory"].splice(index,1)
		}
	}
});
mp.events.add("Inventory:AddItem", (citem) => {
	if (!TempStorage["inventory"]) {
		TempStorage["inventory"] = [];
	}
	let tempSettings = StorageSystem.getTempSettings(citem.id, "inventory");
	let gData = {
		id: citem.id,
		name: citem.name,
		image: citem.image,
		scale: tempSettings.scale || {},
		amount: citem.amount,
		max_stack: citem.max_stack,
		mask: citem.mask,
		usable: citem.usable || false
	}
	let width = citem.width;
	let height = citem.height;
	if (tempSettings.flipped == true) {
		citem.width = height;
		citem.height = width;
	}
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
		row: tempSettings.row || 0,
		mask: citem.mask
	})
	CEFStorage.call("addItem", "inventory", tempSettings.cell || 0, tempSettings.row || 0, citem.width, citem.height, JSON.stringify(gData), tempSettings.flipped || false)
});
mp.events.add("Storage:Interact", (item) => {
	console.log("Item use", item);
	mp.events.callRemote("Storage:Interact", item);
});
mp.events.add("Storage:Action", (action,source,item_id) => {
	console.log("Action on Item", action,source,item_id);
	mp.events.callRemote("Storage:Action", source.replace("#",""),action,item_id);
});
mp.events.add("Storage:Drag", (positions) => {
	positions = JSON.parse(positions);
	if (!Inventory_Order.positions[positions.id]) {
		Inventory_Order.positions[positions.id] = {
			top: "40%",
			left: "25%"
		}
	}
	Inventory_Order.positions[positions.id] = {
		top: positions.top + "px",
		left: positions.left + "px"
	};
	mp.storage.data.inventory_order = Inventory_Order;
	mp.storage.flush();
});
mp.events.add("Storage:Close", (id) => {
	mp.events.callRemote("Storage:Close", id.replace("#", ""));
});
mp.events.add("Storage:Transfer", (source, target) => {
	source = JSON.parse(source);
	target = JSON.parse(target);
	Inventory_Order = {
		positions: Inventory_Order.positions,
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
	if (StorageSystem.needsUpdate(source, target) == true) {
		TempStorage[source.id] = source.items;
		TempStorage[target.id] = target.items;
		mp.events.callRemote("Storage:Transfer", JSON.stringify(source), JSON.stringify(target));
	}
});
mp.events.add("Storage:TransferSlots", (storage, slots) => {
	storage = JSON.parse(storage);
	slots = JSON.parse(slots);
	Inventory_Order = {
		positions: Inventory_Order.positions,
		items: Inventory_Order.items
	};
	storage.items.forEach(function(item) {
		Inventory_Order.items[item.item.id + "_" + storage.id] = {
			cell: item.cell,
			row: item.row,
			scale: item.scale,
			flipped: item.flipped
		}
	})
	mp.storage.data.inventory_order = Inventory_Order;
	mp.storage.flush();
	/*Manage Server Sync*/
	storage.items = storage.items.map((item) => StorageSystem.minify(item));
	slots.items = slots.items.map((item) => Object.assign(StorageSystem.minify(item.item), {
		slot_id: item.id
	}));
	mp.events.callRemote("Storage:TransferSlots", JSON.stringify(storage), JSON.stringify(slots));
});
mp.events.add("Storage:UpdateSlots", (target, items) => {
	items.forEach(function(item, index) {
		setTimeout(() => {
			CEFStorage.call("addItemSlot", target, item);
		}, 1 * index)
	})
	//console.log(target, JSON.stringify(items));
});
mp.events.add("Storage:AddContainer", (headline, selector, cells, rows, items) => {
	console.log("add container");
	items = JSON.parse(items);
	if (!TempStorage[selector]) {
		TempStorage[selector] = [];
	}
	let gItems = items.map(function(citem) {
		let tempSettings = StorageSystem.getTempSettings(citem.id, selector);
		let width = citem.width;
		let height = citem.height;
		if (tempSettings.flipped == true) {
			citem.width = height;
			citem.height = width;
		}
		let gData = {
			id: citem.id,
			name: citem.name,
			image: citem.image,
			scale: tempSettings.scale || {},
			amount: citem.amount,
			max_stack: citem.max_stack,
			mask: citem.mask,
			usable: citem.usable || false
		}
		let gItem = {
			width: citem.width,
			height: citem.height,
			cell: tempSettings.cell || 0,
			row: tempSettings.row || 0,
			item: gData
		}
		return gItem;
	})
	CEFStorage.call("show");
	CEFStorage.call("setPos", "inventory", Inventory_Order.positions["inventory"].top, Inventory_Order.positions["inventory"].left);
	let clientWidth = cell_size * cells + (padding * 2)
	let clientHeight = cell_size * rows + 37 + (padding * 2)
	let config = {
		top: Inventory_Order.positions[selector] ? Inventory_Order.positions[selector].top : `calc(50% - ${clientHeight/2}px)`,
		left: Inventory_Order.positions[selector] ? Inventory_Order.positions[selector].left : `calc(50% - ${clientWidth/2}px)`
	};
	CEFStorage.call("addStorageContainer", headline, selector, config, cells, rows, gItems);
	TempStorage[selector] = gItems.map(e => e.item);
	CEFStorage.call("focus", selector);
	CEFStorage.cursor(true);
	toggleInvState = true;
});
var itemIdentity = require("../../server/world/items.js");
var StorageSystem = new class {
	constructor() {
		this._openContainer = [];
	}
	closeOpenContainer() {}
	minify(item) {
		return {
			id: item.item.id,
			name: item.item.name,
			amount: item.item.amount,
			max_stack: item.item.max_stack,
			data: item.item.data
		}
	}
	needsUpdate(source, target) {
		let sourceTempOld = [];
		let targetTempOld = [];
		if (TempStorage[source.id]) {
			sourceTempOld = TempStorage[source.id]
		}
		sourceTempOld = sourceTempOld.map(function(e) {
			return Object.assign(e, {
				origin: source.id
			});
		})
		if (TempStorage[target.id]) {
			targetTempOld = TempStorage[target.id]
		}
		targetTempOld = targetTempOld.map(function(e) {
			return Object.assign(e, {
				origin: target.id
			});
		})
		source.items = source.items.map(function(e) {
			return Object.assign(e, {
				origin: source.id
			});
		})
		target.items = target.items.map(function(e) {
			return Object.assign(e, {
				origin: target.id
			});
		})
		let all_items_temp = (source.id == target.id) ? sourceTempOld : sourceTempOld.concat(targetTempOld); // merge the two temp arrays;
		let all_items_new = (source.id == target.id) ? source.items : source.items.concat(target.items); // merge the two temp arrays;
		all_items_temp = all_items_temp.map(function(e) {
			return {
				id: e.id,
				name: e.name,
				amount: e.amount,
				origin: e.origin
			}
		})
		all_items_new = all_items_new.map(function(e) {
			return {
				id: e.id,
				name: e.name,
				amount: e.amount,
				origin: e.origin
			}
		})
		var toUpdate = false;
		let temp_Amount = all_items_temp.reduce(function(total, current) {
			return total + parseInt(current.amount);
		}, 0);
		let new_Amount = all_items_new.reduce(function(total, current) {
			return total + parseInt(current.amount);
		}, 0);
		let toCreate = all_items_new.filter(e => {
			return e.id == "NEW"
		});
		if (toCreate.length > 0) {
			toUpdate = true;
		}
		let moved = all_items_new.filter(e => {
			let fItem = all_items_temp.findIndex(function(cItem) {
				return (cItem.id == e.id) && ((e.origin != cItem.origin) || (e.amount != cItem.amount));
			})
			return (fItem != -1) && (e.id != "NEW");
		})
		let removed = all_items_temp.filter(e => {
			let fItem = all_items_new.findIndex(function(cItem) {
				return (cItem.id == e.id);
			})
			return (fItem == -1) && (e.id != "NEW");
		})
		if (removed.length > 0) {
			toUpdate = true;
		}
		moved.forEach(e => {
			console.log(e.id)
			let sDoesExist = source.items.findIndex(x => {
				return x.id == e.id;
			})
			let tDoesExist = target.items.findIndex(x => {
				return x.id == e.id;
			})
			if (e.origin != source.id) {
				if (sDoesExist == -1) {
					toUpdate = true;
				}
			} else if (e.origin != target.id) {
				if (tDoesExist == -1) {
					toUpdate = true;
				}
			}
		})
		console.log("Items Changed target ?", temp_Amount, new_Amount);
		if (parseInt(temp_Amount) != parseInt(new_Amount)) {
			toUpdate = true;
		}
		console.log("toUpdate", toUpdate);
		/*TODO LOOK OVER needsUpdate*/
		return toUpdate;
	}
	checkFit(where, w, h) {
		return new Promise(function(fulfill, reject) {
			mp.rpc.callBrowser(CEFStorage.browser, 'doesFitInto', {
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
}
module.exports = StorageSystem;