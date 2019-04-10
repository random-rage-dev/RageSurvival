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
    position:{
    	type:Object,
    	default:{x:0,y:0,z:0}
    },
    hwid: String,
    social_club: String,
    password: String,
    salt: String,
    warns: {
        type: Number,
        default: 0
    },
    playtime: {
        type: Number,
        default: 0
    },
    character: {
        type:Array,
        default:[]
    }
}, {
    autoIndex: true
});
var inventory = mongoose.Schema({
    owner_type: {
        type: String,
        default: "player"
    },
    owner_id: Number,
    name: String,
    amount: Number
}, {
    autoIndex: true
});

var buildings = mongoose.Schema({
    prop_id:{
        type:Number,
        unique:true
    },
    health:{
        type:Number,
        default:100
    },
    model:String,
    x:Number,
    y:Number,
    z:Number,
    rot_x:Number,
    rot_y:Number,
    rot_z:Number,
    placed:{
        type:Number,
        default:Date.now()
    },
    last_repair:{
        type:Number,
        default:Date.now()
    },
    owner_id:Number
}, {
    autoIndex: true
})

buildings.index({
    prop_id: 1,
    placed: 1,
    owner_id: 1
});
user.index({
    user_id: 1,
    name: 1
});
inventory.index({
    owner_type: 1,
    owner_id: 1
});
module.exports = {
    user: user,
    inventory: inventory,
    buildings: buildings
};