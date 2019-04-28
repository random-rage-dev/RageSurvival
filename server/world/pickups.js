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
        }, 1000)
    }
    _check() {
        let self = this;
        let pickup_ = Pickups.getAllPickups();
        Object.keys(pickup_).forEach(function(id) {
            if (pickup_[id].tier != "PlayerDropped") {
                let c = pickup_[id].created;
                let x = pickup_[id].pos.x;
                let y = pickup_[id].pos.y;
                let z = pickup_[id].pos.z;
                let tier = pickup_[id].tier;
                let resapwn_time = LootTable.getRespawnTimeForTier(pickup_[id].tier);
                let should_respawn = (c + resapwn_time) < Date.now();
                if (should_respawn == true) {
                    if (Pickups.unloadPickup(id, false) == true) {
                        console.log("Reloading Item Spot #" + id, "reason:inactivity");
                        Pickups.generatePickup(id, tier, x, y, z);
                    }
                }
            }
        })
        self._respawningPickups.forEach(function(pickup, index) {
            let resapwn_time = LootTable.getRespawnTimeForTier(pickup.tier);
            let can_respawn = (pickup.added + resapwn_time) < Date.now();
            if (can_respawn == true) {
                console.log("Respawning Item Spot", pickup.id, "reason:empty");
                Pickups.generatePickup(pickup.id, pickup.tier, pickup.x, pickup.y, pickup.z);
                self._respawningPickups.splice(index, 1);
            }
        });
    }
    add(id, tier, x, y, z) {
        let self = this;
        self._respawningPickups.push({
            id: id,
            tier: tier,
            x: x,
            y: y,
            z: z,
            added: Date.now()
        })
    }
}
var Pickups = new class {
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
    isUnique(id) {
        return (this._pickups[id] == undefined) ? true : false;
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
    generatePickup(id, tier, x, y, z) {
        let self = this;
        console.log("respawn pickup");
        let count = LootTable.getItemCountForSpawn(tier);
        let items = LootTable.getItemsForSpawn(tier, count);
        items = items.map(function(a, i) {
            if (typeof a.amount === "function") {
                a.amount = a.amount();
            } else if (typeof a.amount !== "number") {
                a.amount = 1;
            }
            return a;
        })
        let colshape = mp.colshapes.newSphere(x, y, z, self._streamRadius, 0);
        let blip = mp.blips.new(1, new mp.Vector3(x, y, z), {
            name: tier,
            color: 3,
            shortRange: true,
            scale: 0.2
        });
        colshape.setVariable("item_colshape", true);
        colshape.setVariable("item_colshape_id", id);
        self._pickups[id] = {
            id: id,
            tier: tier,
            pos: {
                x: x,
                y: y,
                z: z
            },
            items: items,
            colshape: colshape,
            world: true,
            blip: blip,
            created: Date.now()
        }
    }
    dropItem(item_data, x, y, z) {
        let self = this;
        //let item_offsets = LootTable.getItemData(item_data.name).offset;
        if (item_data != undefined) {
            let id = (item_data.amount + "." + item_data.name + "." + x + "." + y + "." + z).substr(0, 4) + (Date.now() + Math.random()).toString().replace('.', '').substr(-6);
            if (self.isUnique(id) == true) {
                let temp_item = [{
                    type: item_data.type,
                    model: item_data.model,
                    thickness: item_data.thickness,
                    amount: item_data.amount,
                    offset: item_data.offset,
                    name: item_data.name,
                    data: item_data.data
                }]
                console.log("item_data", item_data);
                let colshape = mp.colshapes.newSphere(x, y, z, self._streamRadius, 0);
                let blip = mp.blips.new(1, new mp.Vector3(x, y, z), {
                    name: item,
                    color: 4,
                    shortRange: true,
                    scale: 0.3
                });
                colshape.setVariable("item_colshape", true);
                colshape.setVariable("item_colshape_id", id);
                self._pickups[id] = {
                    id: id,
                    tier: "PlayerDropped",
                    pos: {
                        x: x,
                        y: y,
                        z: z
                    },
                    items: temp_item,
                    colshape: colshape,
                    world: false,
                    blip: blip,
                    created: Date.now()
                }
            }
        }
    }
    generatePickups() {
        let self = this;
        let total_spawns = loot_spawns.length;
        loot_spawns.forEach(function(spawn) {
            let count = LootTable.getItemCountForSpawn(spawn.type);
            let items = LootTable.getItemsForSpawn(spawn.type, count);
            /*items = items.map(function(a, i) {
                if (typeof a.amount === "function") {
                    a.amount = a.amount();
                } else if (typeof a.amount !== "number") {
                    a.amount = 1;
                }
                return a;
            })*/
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
                tier: spawn.type,
                pos: {
                    x: spawn.x,
                    y: spawn.y,
                    z: spawn.z
                },
                items: items,
                colshape: colshape,
                world: true,
                blip: blip,
                created: Date.now()
            }
        })
        console.log(`generatePickupsSpawns [${self._pickups.length}/${total_spawns}]`)
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
    unloadPickup(id, reload = true) {
        let self = this;
        console.log("unloadPickup");
        let pickup = self._pickups[id];
        let pos = pickup.pos;
        mp.players.forEachInRange(new mp.Vector3(pos.x, pos.y, pos.z), self._streamRadius, function(player) {
            if (pickup.colshape.isPointWithin(player.position)) {
                player.call("Loot:Unload", [id])
            }
        });
        if ((pickup.world == true) && (reload == true)) {
            console.log("RESPAWN");
            PickupManager.add(pickup.id, pickup.tier, pos.x, pos.y, pos.z)
        }
        pickup.colshape.destroy();
        delete self._pickups[id];
        return self._pickups[id] == undefined;
    }
    pickItem(playerInstance, id, index, item, amount) {
        let self = this;
        if ((self._pickups[id]) && (self._pickups[id].items.length > 0)) {
            let doesExist = self._pickups[id].items.findIndex(function(e, i) {
                return ((e != null) && (e.name == item) && (e.amount == amount) && (i == index));
            })
            if (doesExist > -1) {
                let item_data = self._pickups[id].items[doesExist];
                self._pickups[id].items[doesExist] = null;
                /*Add Item to Inventory*/
                console.log("pick item up", id, item_data.name, item_data.amount);
                playerInstance.giveItem(item_data);
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
/*

/drop Assault_Rifle 1
/drop 5.56m_Bullets 128
/drop 9mm_Bullets 256

*/
mp.events.addCommand("drop", (player, fulltext) => {
    //player.call("Building:Start", [model])
    let pos = mp.players.local.position;
    let item = player.class.getInventoryItemByIndex();
    console.log("f",item);
    Pickups.dropItem(item, pos.x, pos.y, pos.z)
    //Pickups.dropItem(name, amount, pos.x, pos.y, pos.z)
});
module.exports = Pickups;