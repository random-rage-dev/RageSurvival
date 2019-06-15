"use strict";
var rpc = require('rage-rpc');
require("./libs/vector.js")
require("./libs/array.js")
require("./libs/attachments.js")
var PlayerClass = require("./users/player.js")
var ItemPickups = require("./world/pickups.js")
var EntitySync = require("./libs/sync_entities.js")
var Building = require("./world/building.js")
var Vehicles = require("./world/vehicles.js")
var Crops = require("./world/crops.js")
var Storage = require("./world/storage.js")
require("./world/crafting.js")


var tickRate = 1000 / 1;
setInterval(function() {
    mp.events.call("Server:Tick");
},tickRate);


var players = [];
mp.events.add("ServerAccount:Ready", function(player) {
    player.setVariable("loggedIn", false);
    players[player.socialClub] = new PlayerClass(player);
    player.class = players[player.socialClub];
    player.call("Server:RequestLogin");
    player.position.x = 9000;
    player.position.y = 9000;
});
mp.events.add("playerWeaponChange", (player, oldWeapon, newWeapon) => {
    console.log("weaponChange", oldWeapon, newWeapon)
    if (players[player.socialClub]) {
        player.class.manageAttachments(oldWeapon,newWeapon);
    }
});
mp.events.add("Combat:FireWeapon", (player, weapon, ammo) => {
    console.log("Combat:FireWeapon", weapon, ammo)
    if (players[player.socialClub]) {
        player.class.fireWeapon(weapon, ammo);
    }
});
mp.events.add("playerQuit", function(player, exitType, reason) {
    console.log("disconnect")
    let player_id = player.socialClub;
    if (players[player_id]) {
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
mp.events.add('playerJoin', player => {
    console.log(`[SERVER]: ${player.name} SC:${player.socialClub} HWID:${player.serial} joined`);
});
mp.events.add("ServerAccount:Login", function(player, username, password) {
    if (players[player.socialClub]) {
        players[player.socialClub].login(username, password)
    }
});
mp.events.add("ServerAccount:Register", function(player, username, hash_password, salt) {
    if (players[player.socialClub]) {
        players[player.socialClub].register(username, hash_password, salt)
    }
});
mp.events.add("Player:Loaded", function(player) {
    console.log("Player Loaded " + player.name)
});
mp.events.add("Character:Save", function(player, data) {
    if (players[player.socialClub]) {
        players[player.socialClub].saveChar(data)
    }
});
mp.events.add('playerChat', (player, message) => {
    if (players[player.socialClub]) {
        mp.players.broadcast(`${player.name}!{#FFF}: ${message}`);
    }
});
mp.events.add("Player:Crouch", (player) => {
    if (players[player.socialClub]) {

        player.class.crouch = !player.class.crouch;

    }
});
/* Pickup, Inventory */
mp.events.add("Loot:Pickup", (player, lootpile_id, item_index, item_name, item_amount) => {
    if (players[player.socialClub]) {
        console.log("Loot:Pickup", "lootpile_id",lootpile_id, "item_index",item_index,"item_name", item_name, "item_amount",item_amount);
        ItemPickups.pickItem(players[player.socialClub], lootpile_id, item_index, item_name, item_amount)
    }
});
/* Pickup, Inventory */
mp.events.add("playerDeath", function(player, reason, killer) {
    player.setVariable("isCrouched",false);
    if (players[player.socialClub]) {
        players[player.socialClub].death(false);
    }
});

mp.events.add("Player:Gather", function(player, resource) {
    console.log("resource", resource);
    if (players[player.socialClub]) {
        players[player.socialClub].gather(resource);
    }
});
mp.events.addCommand("suicide", (player, f) => {
    if (players[player.socialClub]) {
        players[player.socialClub].death(false)
    }
});
mp.events.addCommand("kick", (player, f) => {
    player.kick("lol")
});
mp.events.addCommand("save", (player, f) => {
    if (players[player.socialClub]) {
        players[player.socialClub].save().then(function() {
            console.log("Data Saved")
        }).catch(function(err) {
            console.log("Data Error", err)
        })
    }
});
mp.events.addCommand("h", (player, f,val) => {
    player.class.hunger = parseInt(val);
});
mp.events.addCommand("t", (player, f,val) => {
    player.class.thirst = parseInt(val);
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
    fs.appendFile(saveFile, `x:${pos.x}, y:${pos.y}, z:${pos.z}\r\n`, (err) => {
        if (err) {
            player.notify(`~r~SavePos Error: ~w~${err.message}`);
        } else {
            player.notify(`~g~Position saved. ~w~(${name})`);
        }
    });
});
mp.events.addCommand("c", (player, full, index, drawable, texture) => {
    player.setClothes(parseInt(index), parseInt(drawable), parseInt(texture), 2);
});
/*

[SERVER]: CarloGambino SC:CarloGambin0 HWID:D8903A045BEE1530F710ABB8CCE085B075E2D2945D9CB2B057F018C8DD22A360C6DEB8A4226870B8E312E388CD5EB6A072AE08A056B6E958AB5CC5609DAC67C0 joined
[SERVER]: RiiVu SC:RiiVu385 HWID:DECCAF8442F8B7B88B0A3404E130A3B0414EA2007114AA78F9245CDC5B7A1F808BEA78543746297000E24A88416E06C001FE6934CC12F3C005BE4B043EBA5700 joined
[SERVER]: Vequtex SC:Vequtex HWID:D8903A045B9A2308F760C174CC3449B0750657D42FDE84A8DAF018C8DD22F1A041DED0EC3B685A18E31239BC9D2A434057B408A056B6E9481D7AC540171A6340 joined
[SERVER]: Z8pn SC:zero0two HWID:D8903A045B1277887AAA8FC4D9B6B3B0EC8415882F0A6DA80CF018C8DD225D20519453D4478EFB88E3386674322AA110571808A056B6E9A8C91AAEFC194E1880 joined

*/