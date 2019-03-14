var LootTable = require("./loottable.js");
var loot_spawns = require("./lootspawns.js");
var Pickups = class {
    constructor() {
        this._setup();
    }
    _setup() {
        var self = this;
        self._pickups = [];
        self._streamRadius = 50;
        self.generatePickups();
        mp.events.add("playerEnterColshape", function(player, colshape) {
            if (colshape.getVariable("item_colshape")) {
                self.pickupStreamIn(player, colshape);
            }
        });
        mp.events.add("playerExitColshape", function(player, colshape) {
            if (colshape.getVariable("item_colshape")) {
                self.pickupStreamOut(player, colshape);
            }
        });
    }
    pickupStreamIn(player, colshape) {
        let self = this;
        let pickup_id = colshape.getVariable("item_colshape_id");
        console.log("pickup_id", pickup_id);
        if (self._pickups[pickup_id]) {
            console.log(self._pickups[pickup_id])
            player.call("Loot:Load", [pickup_id, self._pickups[pickup_id]])
        }
    }
    pickupStreamOut(player, colshape) {
        let self = this; 
        let pickup_id = colshape.getVariable("item_colshape_id");
        if (self._pickups[pickup_id]) {
            player.call("Loot:Unload", [pickup_id])
        }
    }
    generatePickups() {
        let self = this;
        let total_spawns = loot_spawns.length;
        console.log(`generatePickupsSpawns [0/${total_spawns}]`)
        loot_spawns.forEach(function(spawn) {
            let count = LootTable.getItemCountForSpawn(spawn.tier);
            let items = LootTable.getItemsForSpawn(spawn.tier, count);
            items = items.map(function(a) {
                if (typeof a.amount === "function") {
                    a.amount = a.amount();
                } else if (typeof a.amount !== "number") {
                    a.amount = 1;
                }
                return a;
            })
            let colshape = mp.colshapes.newSphere(spawn.pos.x, spawn.pos.y, spawn.pos.z, self._streamRadius, 0);
            colshape.setVariable("item_colshape", true),
            colshape.setVariable("item_colshape_id", spawn.id);
            self._pickups[spawn.id] = {
                id: spawn.id,
                pos: spawn.pos,
                items: items,
                colshape: colshape
            }
            console.log(`generatePickupsSpawns [${self._pickups.length-1}/${total_spawns}]`)
        })
    }
    updatePickup(id) {
        let self = this;
        let pickup = self._pickups[id];
        let pos = pickup.pos;
        mp.players.forEachInRange(new mp.Vector3(pos.x,pos.y,pos.z), self._streamRadius,function(player) {
            if (pickup.colshape.isPointWithin(player.position)) {
                player.call("Loot:Reload", [pickup_id,self._pickups[id]])
            }
        });
    }
    unloadPickup(id) {
        let self = this;
        let pickup = self._pickups[id];
        let pos = pickup.pos;
        mp.players.forEachInRange(new mp.Vector3(pos.x,pos.y,pos.z), self._streamRadius,function(player) {
            if (pickup.colshape.isPointWithin(player.position)) {
                player.call("Loot:Unload", [id])
            }
        });
        pickup.colshape.destroy();
        delete self._pickups[id];
    }
    pickItemUp(id, item) {
        let self = this;
        if ((self._pickups[id]) && (self._pickups[id].items.length > 0)) {
            let doesExist = self._pickups[id].items.findIndex(function(e) {
                return e.name == item;
            })
            if (doesExist > -1) {
                let item_data = self._pickups[id].items[doesExist];
                self._pickups[id].items.splice(doesExist,1);

                /*Add Item to Inventory*/


                /*Add Item to Inventory*/
                if (self._pickups[id].items.length == 0) {
                    self.unloadPickup(id);
                } else {
                    self.updatePickup(id)
                }
            }
        }
    }

}
module.exports = new Pickups();