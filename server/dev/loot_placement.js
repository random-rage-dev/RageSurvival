var fs = require("fs")
let rawdata = fs.readFileSync('./packages/RageZombies/dev/spawns.json');
var loot_table = JSON.parse(rawdata);
console.log(loot_table);
mp.events.add("ServerAccount:Login", function(player) {
    player.call("updateLootPool", [loot_table])
});
mp.events.add("LootTable:PlaceSpot", function(player, x, y, z, type, length) {
    if (length == loot_table.length) {
        loot_table.push({
            x: x,
            y: y,
            z: z,
            type: type
        })
        mp.players.forEach(function(players, id) {
            players.call("updateLootPool", [loot_table])
        });
    } else {
        console.log("Desync Lootspots, resyncing")
        player.call("updateLootPool", [loot_table])
    }
});
mp.events.add("LootTable:RemoveSpot", function(player, index, length) {
    if (length == loot_table.length) {
        loot_table.splice(index, 1);
        mp.players.forEach(function(players, id) {
            players.call("updateLootPool", [loot_table])
        });
    } else {
        console.log("Desync Lootspots, resyncing")
        player.call("updateLootPool", [loot_table])
    }
});