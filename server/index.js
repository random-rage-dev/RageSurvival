require("./libs/vector.js")
require("./libs/array.js")
var PlayerClass = require("./users/player.js")
var ItemPickups = require("./world/pickups.js")
var Zombies = require("./world/zombies.js")
require("./dev/loot_placement.js")
var players = [];
mp.events.add("ServerAccount:Ready", function(player) {
    player.setVariable("loggedIn", false);
    players[player.id] = new PlayerClass(player);
    player.call("Server:RequestLogin");
    player.position.x = 9000;
    player.position.y = 9000;
});
mp.events.add("playerQuit", function(player, exitType, reason) {
    console.log("disconnect")
    if (players[player.id]) {
        let player_id = player.id;
        console.log("Data Saving")
        players[player_id].save().then(function() {
            console.log("Data Saved")
            players[player_id].logout();
            players[player_id] = null;
            delete players[player_id];
        }).catch(function(err) {
            console.log("Data Error", err)
            players[player_id].logout();
            players[player_id] = null;
            delete players[player_id];
        })
    }
});
mp.events.add("ServerAccount:Login", function(player, username, password) {
    if (players[player.id]) {
        players[player.id].login(username, password)
    }
});
mp.events.add("ServerAccount:Register", function(player, username, hash_password, salt) {
    if (players[player.id]) {
        players[player.id].register(username, hash_password, salt)
    }
});
mp.events.add("Player:Loaded", function(player) {
    console.log("Player Loaded " + player.name)
});
mp.events.add('playerChat', (player, message) => {
    if (players[player.id]) {
        let color = player.getVariable("team_rgb_color");
        color = "!{" + color[0] + ", " + color[1] + ", " + color[2] + ", 1}";
        mp.players.broadcast(`${color}${player.name}!{#FFF}: ${message}`);
    }
});
mp.events.add("Player:Crouch", (player) => {
    if (player.data.isCrouched === undefined) {
        player.data.isCrouched = true;
    } else {
        player.data.isCrouched = !player.data.isCrouched;
    }
});
/* Pickup, Inventory */
mp.events.add("Loot:Pickup", (player, lootpile_id, item_id, item_name, item_amount) => {
    if (players[player.id]) {
        console.log("Loot:Pickup", lootpile_id, item_id, item_name, item_amount);
        ItemPickups.pickItem(players[player.id], lootpile_id, item_id, item_name, item_amount)
    }
});
/* Pickup, Inventory */
mp.events.add("playerDeath", function(player, reason, killer) {
    player.data.isCrouched = false;
    if (players[player.id]) {
        players[player.id].death(false);
    }
});
mp.events.addCommand("suicide", (player, f) => {
    if (players[player.id]) {
        players[player.id].death(false)
    }
});
mp.events.addCommand("kick", (player, f) => {
    player.kick("lol")
});
mp.events.addCommand("save", (player, f) => {
    if (players[player.id]) {
        players[player.id].save().then(function() {
            console.log("Data Saved")
        }).catch(function(err) {
            console.log("Data Error", err)
        })
    }
});
mp.events.addCommand("pos", (player, f) => {
    let pos = player.position;
    player.outputChatBox(`${pos.x}, ${pos.y}, ${pos.z}`);
});
var fs = require("fs");
var saveFile = "savedpos.txt";
mp.events.addCommand("savepos", (player, name = "No name") => {
    let pos = (player.vehicle) ? player.vehicle.position : player.position;
    let rot = (player.vehicle) ? player.vehicle.rotation : player.heading;
    rot = (player.vehicle) ? `${rot.x}, ${rot.y}, ${rot.z}` : player.heading
    fs.appendFile(saveFile, `${pos.x}, ${pos.y}, ${pos.z}, ${rot}\r\n`, (err) => {
        if (err) {
            player.notify(`~r~SavePos Error: ~w~${err.message}`);
        } else {
            player.notify(`~g~Position saved. ~w~(${name})`);
        }
    });
});