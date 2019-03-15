function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
/*
 *  types : Residential,Industrial,Farm,Military,Other,Food,...
 */
var items = [{
    name: "Pump Shotgun",
    type: "Residential",
    model: "w_sg_pumpshotgun",
    thickness: 0.15,
    offset: {
        pos: new mp.Vector3(0, 0, 0.02),
        rot: new mp.Vector3(90, 0, 0)
    }
}, {
    name: "12 Gauge Shells",
    type: "Residential",
    model: "w_sg_assaultshotgun_mag1",
    thickness: 0.15,
    amount: function() {
        return getRandomInt(5, 15)
    },
    offset: {
        pos: new mp.Vector3(0, 0, 0.01),
        rot: new mp.Vector3(90, 0, 0)
    }
}, {
    name: "Micro SMG",
    type: "Industrial",
    model: "w_sb_microsmg",
    thickness: 0.15,
    offset: {
        pos: new mp.Vector3(0, 0, 0.02),
        rot: new mp.Vector3(90, 0, 0)
    }
}, {
    name: "9mm Bullets",
    type: "Industrial",
    model: "w_sb_microsmg_mag1",
    thickness: 0.15,
    amount: function() {
        return getRandomInt(10, 25)
    },
    offset: {
        pos: new mp.Vector3(0, 0, 0.01),
        rot: new mp.Vector3(90, 0, 0)
    }
}, {
    name: "Assault Rifle",
    type: "Military",
    model: "w_ar_assaultrifle",
    thickness: 0.15,
    offset: {
        pos: new mp.Vector3(0, 0, 0.02),
        rot: new mp.Vector3(90, 0, 0)
    }
}, {
    name: "5.56m Bullets",
    type: "Military",
    model: "w_ar_assaultrifle_mag1",
    thickness: 0.15,
    amount: function() {
        return getRandomInt(10, 25)
    },
    offset: {
        pos: new mp.Vector3(0, 0, 0.01),
        rot: new mp.Vector3(90, 0, 0)
    }
}, {
    name: "Drank",
    type: "Food",
    model: "bkr_prop_coke_powderbottle_02",
    thickness: 0.3,
    amount: function() {
        return getRandomInt(1, 150)
    },
    offset: {
        pos: new mp.Vector3(0, 0, 0),
        rot: new mp.Vector3(0, 0, 0)
    }
}, {
    name: "Drank Fresh",
    type: "Food",
    model: "bkr_prop_coke_powderbottle_01",
    thickness: 0.35,
    amount: function() {
        return getRandomInt(3, 15)
    },
    offset: {
        pos: new mp.Vector3(0, 0, 0),
        rot: new mp.Vector3(0, 0, 0)
    }
}]
module.exports = items;