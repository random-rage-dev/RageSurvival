var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var user = mongoose.Schema({
    user_id: {
        type: Number,
        unique: true
    },
    name: {
        type: String,
        unique: true
    },
    position: {
        type: Object,
        default: {
            x: 0,
            y: 0,
            z: 0
        }
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
        type: Array,
        default: []
    },
    equipment: {
        type: Object,
        default: {}
    }
}, {
    autoIndex: true
});
var vehicles = mongoose.Schema({
    veh_id: {
        type: String,
        unique: true
    },
    model: {
        type: String
    },
    position: {
        type: Object,
        default: {
            x: 0,
            y: 0,
            z: 0
        }
    },
    rotation: {
        type: Object,
        default: {
            x: 0,
            y: 0,
            z: 0
        }
    },
    storage_id: {
        type: String,
        unique: true
    },
    key: {
        type: String,
        unqiue: true
    },
    health: {
        type: Number,
        default: 1000
    },
    running: {
        type: Boolean,
        default: false
    },
    components: {
        type: Object,
        default: {}
    }
}, {
    autoIndex: true
});
var inventory = mongoose.Schema({
    owner_type: {
        type: String,
        default: "player"
    },
    owner_id: String,
    name: String,
    amount: Number,
    data: {
        type: Object,
        default: {}
    }
}, {
    autoIndex: true
});
var groups = mongoose.Schema({
    gid: {
        type: Number,
        unique: true
    },
    name: String,
    members: {
        type:Array,
        default:[]
    }
}, {
    autoIndex: true
});
var crops = mongoose.Schema({
    cropType:{
        type:String,
        default:"None"
    },
    planted:{
        type:Number,
        default:Date.now()
    },
    lastWatered:{
        type:Number,
        default:Date.now() 
    },
    yield_mul: {
        type:Number,
        default:1
    },
    planter:{
        type:Number,
        default:0
    }
}, {
    autoIndex: true
});

var buildings = mongoose.Schema({
    health: {
        type: Number,
        default: 100
    },
    model: String,
    x: Number,
    y: Number,
    z: Number,
    rot_x: Number,
    rot_y: Number,
    rot_z: Number,
    placed: {
        type: Number,
        default: Date.now()
    },
    last_repair: {
        type: Number,
        default: Date.now()
    },
    data: {
        type: Object,
        default: {}
    },
    owner_id: Number
}, {
    autoIndex: true
})
groups.index({
    gid: 1
});
crops.index({
    planted: 1
});
buildings.index({
    placed: 1,
    owner_id: 1
});
user.index({
    user_id: 1,
    name: 1
});
vehicles.index({
    veh_id: 1,
    model: 1
});
inventory.index({
    owner_type: 1,
    owner_id: 1
});
module.exports = {
    user: user,
    inventory: inventory,
    buildings: buildings,
    vehicles: vehicles,
    groups: groups,
    crops: crops,
};