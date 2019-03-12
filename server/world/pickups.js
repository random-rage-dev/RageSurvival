var LootTable = require("./loottable.js");
var loot_spawns = require("./lootspawns.js");
var Pickups = class {
    constructor() {
        this._setup();
    }
    _setup() {
        var self = this;
        self._pickups = [];
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
            player.call("Loot:Load",[pickup_id,self._pickups[pickup_id]])
        }
    }
    pickupStreamOut(player, colshape) {
        let self = this;
        let pickup_id = colshape.getVariable("item_colshape_id");
        console.log("pickup_id", pickup_id);
        if (self._pickups[pickup_id]) {
            player.call("Loot:Unload",[pickup_id])
        }
    }
    generatePickups() {
        let self = this;
        let total_spawns = loot_spawns.length;
        console.log(`generatePickupsSpawns [0/${total_spawns}]`)
        loot_spawns.forEach(function(spawn) {
            let count = LootTable.getItemCountForSpawn(spawn.tier);
            let items = LootTable.getItemsForSpawn(spawn.tier, count);
            let colshape = mp.colshapes.newSphere(spawn.pos.x, spawn.pos.y, spawn.pos.z, 15, 0);
            colshape.setVariable("item_colshape", true),
                colshape.setVariable("item_colshape_id", spawn.id),
                console.log(count);
            self._pickups[spawn.id] = {
                id: spawn.id,
                pos: spawn.pos,
                items: items,
                colshape: colshape
            }
            console.log(`generatePickupsSpawns [${self._pickups.length-1}/${total_spawns}]`)
        })
    }
}
module.exports = new Pickups();