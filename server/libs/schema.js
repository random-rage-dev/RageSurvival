var mongoose = require('mongoose');
var user = mongoose.Schema({
    user_id: {
        type: Number,
        unique: true
    },
    name: {
        type: String,
        unique: true
    },
    hwid: String,
    social_club: String,
    password: String,
    salt: String,
    exp: {
        type: Number,
        default: 1
    },
    warns: {
        type: Number,
        default: 0
    },
    money: {
        type: Number,
        default: 10000
    },
    rank: {
        type: Number,
        default: 0
    },
    playtime: {
        type: Number,
        default: 0
    }
}, {
    autoIndex: true
});
var kills = mongoose.Schema({
    timestamp: Date,
    killer_id: Number,
    victim_id: Number,
    weapon_id: Number,
    damage_given: Array
});
var weapon_exp = mongoose.Schema({
    user_id: {
        type: Number,
        index: true
    },
    weapon: {
        type: String,
        index: true
    },
    exp: {
        type: Number,
        default: 0
    }
})
var weapon_inventory = mongoose.Schema({
    user_id: Number,
    weapon: String,
    duration: Number,
    equiped: {
        type: Boolean,
        default: true
    }
})
var turfs = mongoose.Schema({
    turf_id: {
        type: Number,
        unique: true
    },
    name: String,
    x: Number,
    y: Number,
    rotation: Number,
    range: Number,
    color: Number,
    owner: Number
})
weapon_exp.index({
    user_id: 1,
    weapon: 1
}, {
    unique: true
});
user.index({
    user_id: 1,
    name: 1
});
weapon_inventory.index({
    user_id: 1
});
kills.index({
    timestamp: 1
});
module.exports = {
    user: user,
    kills: kills,
    weapon_exp: weapon_exp,
    weapon_inventory: weapon_inventory,
    turfs: turfs
};