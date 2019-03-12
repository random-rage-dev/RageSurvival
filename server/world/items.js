function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
/*
 *  Tiers : Residential,Industrial,Farm,Military,Other,Food,...
 */
var items = [{
    name: "Pump Shotgun",
    tier: "Residential",
    model: "w_sg_pumpshotgun",
    offset: {
        pos: new mp.Vector3(0, 0, 0.02),
        rot: new mp.Vector3(90, 0, 0)
    }
}, {
    name: "12 Gauge Shells",
    tier: "Residential",
    model: "w_sg_assaultshotgun_mag1",
    amount: function() {return getRandomInt(5, 15)},
    offset: {
        pos: new mp.Vector3(0, 0, 0.01),
        rot: new mp.Vector3(90, 0, 0)
    }
}, {
    name: "Micro SMG",
    tier: "Industrial",
    model: "w_sb_microsmg",
    offset: {
        pos: new mp.Vector3(0, 0, 0.02),
        rot: new mp.Vector3(90, 0, 0)
    }
},{
    name: "9mm Bullets",
    tier: "Industrial",
    model: "w_sb_microsmg_mag1",
    amount: function() {return getRandomInt(10, 25)},
    offset: {
        pos: new mp.Vector3(0, 0, 0.01),
        rot: new mp.Vector3(90, 0, 0)
    }
}, {
    name: "Assault Rifle",
    tier: "Military",
    model: "w_ar_assaultrifle",
    offset: {
        pos: new mp.Vector3(0, 0, 0.02),
        rot: new mp.Vector3(90, 0, 0)
    }
},{
    name: "5.56m Bullets",
    tier: "Military",
    model: "w_ar_assaultrifle_mag1",
    amount: function() {return getRandomInt(10, 25)},
    offset: {
        pos: new mp.Vector3(0, 0, 0.01),
        rot: new mp.Vector3(90, 0, 0)
    }
}, {
    name: "Drank",
    tier: "Food",
    model: "bkr_prop_coke_powderbottle_02",
    amount: function() {return getRandomInt(1, 4)},
    offset: {
        pos: new mp.Vector3(0, 0, 0),
        rot: new mp.Vector3(0, 0, 0)
    }
}, {
    name: "Drank Fresh",
    tier: "Food",
    model: "bkr_prop_coke_powderbottle_01",
    amount: function() {
        return getRandomInt(3, 15)
    },
    offset: {
        pos: new mp.Vector3(0, 0, 0),
        rot: new mp.Vector3(0, 0, 0)
    }
}]
module.exports = items;