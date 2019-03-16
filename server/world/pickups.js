var LootTable = require("./loottable.js");
var loot_spawns = require("./lootspawns.js");
var PickupManager = new class {
    constructor() {
        this._setup();
    }
    _setup() {
        let self = this;
        self._respawningPickups = [];
        self._respawnLoop = setInterval(function() {
            self._check();
        })
    }
    _check() {}
    add(x, y, z) {}
}
var Pickups = class {
    constructor() {
        this._setup();
    }
    _setup() {
        var self = this;
        self._pickups = [];
        self._streamRadius = 100;
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
    isEmpty(id) {
        let self = this;
        let arr = self._pickups[id].items.filter(function(item) {
            return item != null;
        })
        return arr.length == 0;
    }
    getAllPickups() {
        return this._pickups;
    }
    pickupStreamIn(player, colshape) {
        let self = this;
        let pickup_id = colshape.getVariable("item_colshape_id");
        console.log("pickup_id", pickup_id);
        if (self._pickups[pickup_id]) {
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
            let count = LootTable.getItemCountForSpawn(spawn.type);
            let items = LootTable.getItemsForSpawn(spawn.type, count);
            items = items.map(function(a, i) {
                if (typeof a.amount === "function") {
                    a.amount = a.amount();
                } else if (typeof a.amount !== "number") {
                    a.amount = 1;
                }
                return a;
            })
            let colshape = mp.colshapes.newSphere(spawn.x, spawn.y, spawn.z, self._streamRadius, 0);
            let blip = mp.blips.new(1, new mp.Vector3(spawn.x, spawn.y, spawn.z), {
                name: spawn.type,
                color: 3,
                shortRange: true,
                scale: 0.2
            });
            colshape.setVariable("item_colshape", true);
            colshape.setVariable("item_colshape_id", spawn.id);
            self._pickups[spawn.id] = {
                id: spawn.id,
                pos: {
                    x: spawn.x,
                    y: spawn.y,
                    z: spawn.z
                },
                items: items,
                colshape: colshape,
                world: true,
                blip: blip
            }
            console.log(`generatePickupsSpawns [${self._pickups.length}/${total_spawns}]`)
        })
    }
    updatePickup(id) {
        let self = this;
        let pickup = self._pickups[id];
        if (pickup) {
            let pos = pickup.pos;
            mp.players.forEachInRange(new mp.Vector3(pos.x, pos.y, pos.z), self._streamRadius, function(player) {
                if (pickup.colshape.isPointWithin(player.position)) {
                    player.call("Loot:Reload", [id, self._pickups[id]])
                }
            });
        }
    }
    unloadPickup(id) {
        let self = this;
        let pickup = self._pickups[id];
        let pos = pickup.pos;
        mp.players.forEachInRange(new mp.Vector3(pos.x, pos.y, pos.z), self._streamRadius, function(player) {
            if (pickup.colshape.isPointWithin(player.position)) {
                player.call("Loot:Unload", [id])
            }
        });
        if (pickup.world == true) {
            PickupManager.add(pos.x, pos.y, pos.z)
        }
        pickup.colshape.destroy();
        delete self._pickups[id];
    }
    pickItem(playerInstance, id, index, item, amount) {
        let self = this;
        if ((self._pickups[id]) && (self._pickups[id].items.length > 0)) {
            let doesExist = self._pickups[id].items.findIndex(function(e, i) {
                return ((e != null) && (e.name == item) && (e.amount == amount) && (i == index));
            })
            if (doesExist > -1) {
                self._pickups[id].items[doesExist] = null;
                /*Add Item to Inventory*/
                console.log("pick item up", id, item, amount);

                /*Add Item to Inventory*/
                if (self.isEmpty(id) == true) {
                    self.unloadPickup(id);
                } else {
                    self.updatePickup(id)
                }
            }
        }
    }
}
module.exports = new Pickups();