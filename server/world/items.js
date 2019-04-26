function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

/*
 *  types : Residential,Industrial,Farm,Military,Other,Food,...
 *  image needs to be relative to the client resources
 */
var items = {
    "Hatchet": {
        width: 2,
        height: 4,
        max_stack: 1,
        name: 'Hatchet',
        image: '../../source/img/hatchet.png',
        type: "Residential",
        model: "w_sg_pumpshotgun",
        thickness: 0.15,
        amount:1,
        offset: {
            pos: new mp.Vector3(0, 0, 0.02),
            rot: new mp.Vector3(90, 0, 0)
        }
    },
    "Pump Shotgun": {
        width: 4,
        height: 2,
        max_stack: 1,
        name: 'Pump Shotgun',
        image: '../../source/img/weapon_pumpshotgun.png',
        type: "Residential",
        model: "w_sg_pumpshotgun",
        thickness: 0.15,
        amount:1,
        offset: {
            pos: new mp.Vector3(0, 0, 0.02),
            rot: new mp.Vector3(90, 0, 0)
        }
    },
    "12 Gauge Shells": {
        width: 1,
        height: 1,
        max_stack: 32,
        name: '12 Gauge Shells',
        image: '../../source/img/12_Gauge_Shells.png',
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
    },
    "Micro SMG": {
        width: 3,
        height: 2,
        max_stack: 1,
        name: 'Micro SMG',
        image: '../../source/img/weapon_microsmg.png',
        type: "Industrial",
        model: "w_sb_microsmg",
        thickness: 0.15,
        amount:1,
        offset: {
            pos: new mp.Vector3(0, 0, 0.02),
            rot: new mp.Vector3(90, 0, 0)
        }
    },
    "9mm Bullets": {
        width: 1,
        height: 1,
        max_stack: 128,
        name: '9mm Bullets',
        image: '../../source/img/9mm_bullets.png',
        type: "Industrial",
        model: "w_sb_microsmg_mag1",
        thickness: 0.15,
        amount: function() {
            return getRandomInt(10, this.max_stack)
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0.01),
            rot: new mp.Vector3(90, 0, 0)
        }
    },
    "Assault Rifle": {
        width: 4,
        height: 2,
        max_stack: 1,
        name: 'Assault Rifle',
        image: '../../source/img/weapon_assaultrifle.png',
        type: "Military",
        model: "w_ar_assaultrifle",
        thickness: 0.15,
        amount:1,
        offset: {
            pos: new mp.Vector3(0, 0, 0.02),
            rot: new mp.Vector3(90, 0, 0)
        }
    },
    "5.56m Bullets": {
        width: 1,
        height: 1,
        max_stack: 64,
        name: '5.56m Bullets',
        image: '../../source/img/556m_Bullets.png',
        type: "Military",
        model: "w_ar_assaultrifle_mag1",
        thickness: 0.15,
        amount: function() {
            return getRandomInt(10, this.max_stack)
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0.01),
            rot: new mp.Vector3(90, 0, 0)
        }
    },
    "Drank": {
        width: 1,
        height: 1,
        max_stack: 15,
        name: 'Drank',
        image: '../../source/img/energy_drink_small.png',
        type: "Food",
        model: "bkr_prop_coke_powderbottle_02",
        thickness: 0.3,
        amount: function() {
            return getRandomInt(1, this.max_stack)
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
    "Drank Fresh": {
        width: 1,
        height: 2,
        max_stack: 14,
        name: 'Drank Fresh',
        image: '../../source/img/energy_drink_small.png',
        type: "Food",
        model: "bkr_prop_coke_powderbottle_01",
        thickness: 0.25,
        amount: function() {
            return getRandomInt(3, this.max_stack)
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
    "Gas Can": {
        width: 3,
        height: 3,
        max_stack: 1,
        name: 'Gas Can',
        image: '../../source/img/Icon_jerrycan.png',
        type: "Industrial",
        model: "prop_cs_package_01",
        thickness: 0.25,
        amount: function() {
            return 1
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
    "Wood": {
        width: 3,
        height: 3,
        max_stack: 128,
        name: 'Wood',
        image: '../../source/img/wood.png',
        type: "Craftable",
        model: "prop_fncwood_13c",
        thickness: 0.35,
        amount: function() {
            return 1
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    }
};
module.exports = items;