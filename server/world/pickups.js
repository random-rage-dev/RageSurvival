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
    }
    generatePickups() {
    	let self = this;
    	let total_spawns = loot_spawns.length;
    	console.log(`generatePickupsSpawns [0/${total_spawns}]`)

        loot_spawns.forEach(function(spawn) {
             let count = LootTable.getItemCountForSpawn(spawn.tier);
             let items = LootTable.getItemsForSpawn(spawn.tier,count);
             console.log(count);
             self._pickups.push({
                 id:spawn.id,
                 pos:spawn.pos,
                 items:items
             })

            console.log(`generatePickupsSpawns [${self._pickups.length}/${total_spawns}]`)
        })
    	

    }
}
module.exports = new Pickups();