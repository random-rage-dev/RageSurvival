var rpc = require('rage-rpc');
var itemIdentity = require("./items.js");
var MongoDB = require("../libs/mongodb.js")
var Inventory = MongoDB.getInventoryModel();
var Storage = new class {
	constructor() {
		this._tempStorage = [];
	}
	log(...msg) {}
	async validate(player, sStorage, tStorage) {
		let self = this;
		console.log("IDS", sStorage.id, tStorage.id);
		let sStorage_Type = sStorage.id.indexOf("inventory") > -1 ? 'player' : sStorage.id.indexOf("vehicle") > -1 ? "vehicle" : "storage"
		let tStorage_Type = tStorage.id.indexOf("inventory") > -1 ? 'player' : tStorage.id.indexOf("vehicle") > -1 ? "vehicle" : "storage"
		let sStorage_ID = sStorage.id.indexOf("inventory") > -1 ? player.class.id : sStorage.id.replace(sStorage_Type, "");
		let tStorage_ID = tStorage.id.indexOf("inventory") > -1 ? player.class.id : tStorage.id.replace(tStorage_Type, "");
		let TempStorage_sStorage = (sStorage.id == "inventory") ? player.class.getInventory() : (this._tempStorage[sStorage.id] || []);
		let TempStorage_tStorage = (tStorage.id == "inventory") ? player.class.getInventory() : (this._tempStorage[tStorage.id] || []);
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
		console.log(sStorage_Amount, tStorage_Amount, TempStorage_sAmount, TempStorage_tAmount);
		if ((sStorage_Amount + tStorage_Amount) <= (TempStorage_sAmount + TempStorage_tAmount)) {
			console.log("Amount check done")
			/* Validate tStorage*/
			let items_sStorage = sStorage.items.filter(function(item) {
				let fItem = TempStorage_sStorage.findIndex(function(cItem) {
					return (cItem.id == item.id) && (cItem.amount == item.amount);
				})
				return fItem == -1;
			})
			let items_sStorage_missing = TempStorage_sStorage.filter(function(item) {
				let fItem = sStorage.items.findIndex(function(cItem) {
					return (cItem.id == item.id);
				})
				return fItem == -1;
			})
			console.log("removed Items", JSON.stringify(items_sStorage_missing));
			console.log("edited Items", JSON.stringify(items_sStorage));
			try {
				items_sStorage_missing.forEach(async function(item) {
					let dStatus = await Inventory.deleteOne({
						_id: item.id
					});
				});
				items_sStorage.forEach(async function(item) {
					if (item.id != "NEW") {
						let inv_update = await Inventory.updateOne({
							_id: item.id
						}, {
							amount: parseInt(item.amount)
						})
					} else {
						let nItem = await new Inventory({
							owner_type: sStorage_Type,
							owner_id: sStorage_ID,
							name: item.name,
							amount: item.amount,
							data: item.data
						}).save();
						rpc.callBrowsers(player, 'editItemID', {
							selector: sStorage.id,
							id: item.id,
							name: nItem.name,
							amount: nItem.amount,
							overwrite_data: {
								id: nItem._id
							}
						}).then((success) => {
							self.log("Editing Item", nItem._id, "success:", success)
						});
					}
				})
			} catch (err) {
				console.log("err", err);
			}
			if (sStorage.id != tStorage.id) {
				/* Validate sStorage*/
				console.log("validate sStorage");
				let items_tStorage = tStorage.items.filter(function(item) {
					let fItem = TempStorage_tStorage.findIndex(function(cItem) {
						return (cItem.id == item.id) && (cItem.amount == item.amount);
					})
					return fItem == -1;
				})
				let items_tStorage_missing = TempStorage_tStorage.filter(function(item) {
					let fItem = tStorage.items.findIndex(function(cItem) {
						return (cItem.id == item.id);
					})
					return fItem == -1;
				})
				console.log("removed Items", JSON.stringify(items_tStorage_missing));
				console.log("edited Items", JSON.stringify(items_tStorage));
				try {
					items_tStorage_missing.forEach(async function(item) {
						let dStatus = await Inventory.deleteOne({
							_id: item.id
						});
					});
					items_tStorage.forEach(async function(item) {
						if (item.id != "NEW") {
							let inv_update = await Inventory.updateOne({
								_id: item.id
							}, {
								amount: parseInt(item.amount)
							})
						} else {
							let nItem = await new Inventory({
								owner_type: tStorage_Type,
								owner_id: tStorage_ID,
								name: item.name,
								amount: item.amount,
								data: item.data
							}).save();
							rpc.callBrowsers(player, 'editItemID', {
								selector: tStorage.id,
								id: item.id,
								name: nItem.name,
								amount: nItem.amount,
								overwrite_data: {
									id: nItem._id
								}
							}).then((success) => {
								self.log("Editing Item", nItem._id, "success:", success)
							}).catch((err) => {
								console.log("err",err);
							})
						}
					})
				} catch (err) {
					console.log("err", err);
				}
			}
			self._tempStorage[sStorage.id] = sStorage.items;
			self._tempStorage[tStorage.id] = tStorage.items;

			if ((sStorage_ID == "inventory") || (tStorage_ID == "inventory")) {
				let storage = (sStorage_ID == "inventory") ? sStorage.items : tStorage.items;
				player.class.setInventory(storage);
			}
		} else {
			console.log("Amount misleading, please reload UI");
			if ((sStorage_ID == "inventory") || (tStorage_ID == "inventory")) {
				player.class.reloadInventory();
			}
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