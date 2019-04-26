var rpc = require('rage-rpc');
var itemIdentity = require("./items.js");
var MongoDB = require("../libs/mongodb.js")
var Inventory = MongoDB.getInventoryModel();
var Storage = new class {
	constructor() {
		let self = this;
		this._tempStorage = [];
		this._interactionOpen = [];
		console.log("New Storage Class");
		mp.events.add("Storage:Transfer", function(player, source, target) {
			self.validate(player, JSON.parse(source), JSON.parse(target))
		});
		mp.events.add("Storage:Close", (player, id) => {
			console.log("STORAGE CLOSE AND ENABLE", id)
			if (self._interactionOpen[id]) {
				self._interactionOpen[id].setVariable("opened", false);
				self._interactionOpen[id] = false;
			}
		});
	}
	get tempStorage() {
		return this._tempStorage;
	}
	set tempStorage(data) {
		this._tempStorage = data;
	}
	log(...msg) {}
	async canInteract(player, data) {
		console.log("check can interact");
		if (!this._interactionOpen[data.id]) {
			return true;
		}
		return false;
	}
	async Interact(player, storData, obj) {
		if (!this._interactionOpen[storData.id]) {
			this._interactionOpen[storData.id] = obj;
			try {
				let storageData = storData.data.container;
				let dbItems = await Inventory.find({
					owner_id: storData.id,
					owner_type: "storage"
				});
				dbItems = dbItems.map(function(item, i) {
					let itemData = Storage.map({
						id: item._id,
						name: item.name,
						amount: item.amount,
						data: item.data
					});
					return itemData;   
				});
				console.log("OUTPUT CONTAINER ITEMS");
				console.log("dbItems", dbItems);
				console.log("storData", storData);
				this._tempStorage[storData.id] = dbItems;
				player.call("Storage:AddContainer", ["Container", storData.id, storageData.cells || 9, storageData.rows || 9, JSON.stringify(dbItems)])
			} catch (err) {
				console.log("interact async err", err);
			}
		}
	}
	async isOpen(id) {
		return this._interactionOpen[id] != undefined || id == "inventory"
	}
	async validate(player, sStorage, tStorage) {
		let self = this;
		if (self.isOpen(sStorage.id) && self.isOpen(tStorage.id)) {
			console.log("Storage is Open");
			let sStorage_Type = sStorage.id.indexOf("inventory") > -1 ? 'player' : "storage"
			let tStorage_Type = tStorage.id.indexOf("inventory") > -1 ? 'player' : "storage"
			let sStorage_ID = sStorage.id.indexOf("inventory") > -1 ? player.class.id : sStorage.id;
			let tStorage_ID = tStorage.id.indexOf("inventory") > -1 ? player.class.id : tStorage.id;
			let TempStorage_sStorage = (sStorage.id == "inventory") ? player.class.getInventory() : (this._tempStorage[sStorage.id] || []);
			let TempStorage_tStorage = (tStorage.id == "inventory") ? player.class.getInventory() : (this._tempStorage[tStorage.id] || []);
			console.log("sStorage_Type", sStorage_Type)
			console.log("sStorage_ID", sStorage_ID)
			console.log("tStorage_Type", tStorage_Type)
			console.log("tStorage_ID", tStorage_ID)
			let sStorage_Amount = sStorage.items.reduce(function(total, current) {
				return total + parseInt(current.amount) || 0;
			}, 0)
			let TempStorage_sAmount = TempStorage_sStorage.reduce(function(total, current) {
				return total + parseInt(current.amount) || 0;
			}, 0)
			let tStorage_Amount = tStorage.items.reduce(function(total, current) {
				return total + parseInt(current.amount) || 0;
			}, 0)
			let TempStorage_tAmount = TempStorage_tStorage.reduce(function(total, current) {
				return total + parseInt(current.amount) || 0;
			}, 0)
			console.log("SENT", sStorage_Amount + tStorage_Amount, "TEMP", TempStorage_sAmount + TempStorage_tAmount);
			if ((sStorage_Amount + tStorage_Amount) <= (TempStorage_sAmount + TempStorage_tAmount)) {
				console.log("Amount check done")
				/* Validate tStorage*/
				TempStorage_sStorage = TempStorage_sStorage.map(function(e) {
					return Object.assign(e,{origin:sStorage_ID});
				})
				TempStorage_tStorage = TempStorage_tStorage.map(function(e) {
					return Object.assign(e,{origin:tStorage_ID});
				})
				sStorage.items = sStorage.items.map(function(e) {
					return Object.assign(e,{origin:sStorage_ID});
				})
				tStorage.items = tStorage.items.map(function(e) {
					return Object.assign(e,{origin:tStorage_ID});
				})
				let all_items_temp = (sStorage_ID == tStorage_ID) ? TempStorage_sStorage : TempStorage_sStorage.concat(TempStorage_tStorage); // merge the two temp arrays;
				let all_items_new = (sStorage_ID == tStorage_ID) ? sStorage.items : sStorage.items.concat(tStorage.items); // merge the two temp arrays;
				let toCreate = all_items_new.filter(e => e.id == "NEW");
				let moved = all_items_new.filter(e => {
					let fItem = all_items_temp.findIndex(function(cItem) {
						return (cItem.id == e.id) && ((e.origin != cItem.origin) || (e.amount != cItem.amount));
					})
					return (fItem != -1) && (e.id != "NEW");
				}).map(e => {
					let t = {};
					let sDoesExist = sStorage.items.findIndex(x => {
						return x.id == e.id;
					})
					let tDoesExist = tStorage.items.findIndex(x => {
						return x.id == e.id;
					})
					console.log("tDoesExist", tDoesExist)
					console.log("sDoesExist", sDoesExist)
					if (e.origin != sStorage_ID) {
						t.target = {
							id: (tDoesExist > -1) ? tStorage_ID : sStorage_ID,
							type: (tDoesExist > -1) ? tStorage_Type : sStorage_Type
						};
					} else if (e.origin != tStorage_ID) {
						t.target = {
							id: (tDoesExist > -1) ? tStorage_ID : sStorage_ID,
							type: (tDoesExist > -1) ? tStorage_Type : sStorage_Type
						};
					} else {
						if (e.origin == tStorage_ID) {
							t.target = {
								id: tStorage_ID,
								type: tStorage_Type
							};
						}
					}
					console.log("t.target", t.target);
					return Object.assign(e, t);
				})
				console.log("toCreate", toCreate)
				console.log("moved", moved)
				try {
					toCreate.forEach(async item => {
						let dbItem = await new Inventory({
							owner_type: ((item.origin == tStorage_ID) ? tStorage_Type : sStorage_Type),
							owner_id: item.origin,
							name: item.name,
							amount: item.amount,
							data: item.data
						}).save();
					})
					moved.forEach(async (item) => {
						console.log("udpate item sStorage");
						let inv_update = await Inventory.updateOne({
							_id: item.id
						}, {
							amount: parseInt(item.amount),
							owner_type: item.target.type,
							owner_id: item.target.id
						})
					})
				} catch (err) {
					console.log("err", err);
				}
				self._tempStorage[sStorage.id] = sStorage.items;
				self._tempStorage[tStorage.id] = tStorage.items;
				self.tempStorage = self._tempStorage;
				if ((sStorage_Type == "player") || (tStorage_Type == "player")) {
					console.log("is inventory");
					let storage = (sStorage_Type == "player") ? sStorage.items : tStorage.items;
					console.log("set inventory");
					player.class.setInventory(storage);
				}
			} else {
				console.log("Amount misleading, please reload UI");
				if ((sStorage_Type == "player") || (tStorage_Type == "player")) {
					console.log("reloadInventory");
					player.class.reloadInventory();
				}
			}
		}
	}
	async save(player, storage) {}
	map(object) {
		if (itemIdentity[object.name]) {
			let masked = {
				name: itemIdentity[object.name].name,
				width: itemIdentity[object.name].width,
				height: itemIdentity[object.name].height,
				max_stack: itemIdentity[object.name].max_stack,
				image: itemIdentity[object.name].image,
				thickness: itemIdentity[object.name].thickness,
				offset: itemIdentity[object.name].offset
			}
			return Object.assign(object, masked);
		}
		return false;
	}
}
module.exports = Storage;