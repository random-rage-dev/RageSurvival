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
        model: "prop_w_me_hatchet",
        thickness: 0.15,
        amount: 1,
        mask:"Meele",
        offset: {
            pos: new mp.Vector3(0, 0, 0.02),
            rot: new mp.Vector3(90, 0, 0)
        },
        modifiers:{
            spread:function() {
                return Math.random()
            }
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
        amount: 1,
        mask:"Primary",
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
        mask:"Ammo",
        thickness: 0.15,
        amount: function() {
            return getRandomInt(1, Math.floor(this.max_stack/4))
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0.02),
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
        amount: 1,
        mask:"Primary|Secondary",
        offset: {
            pos: new mp.Vector3(0, 0, 0.02),
            rot: new mp.Vector3(90, 0, 0)
        },
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
        mask:"Ammo",
        amount: function() {
            return getRandomInt(1, Math.floor(this.max_stack/4))
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
        amount: 1,
        mask:"Primary",
        offset: {
            pos: new mp.Vector3(0, 0, 0.02),
            rot: new mp.Vector3(90, 0, 0)
        },
        mask:"Primary",
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
        mask:"Ammo",
        amount: function() {
            return getRandomInt(1, Math.floor(this.max_stack/4))
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0.01),
            rot: new mp.Vector3(90, 0, 0)
        }
    },
    "Sprunk Can": {
        width: 1,
        height: 1,
        max_stack: 15,
        name: 'Sprunk Can',
        image: '../../source/img/energy_drink_small.png',
        type: "Food",
        model: "ng_proc_sodacan_01a",
        thickness: 0.25,
        mask:"Food",
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
    "Sprunk 2 Can": {
        width: 1,
        height: 2,
        max_stack: 14,
        name: 'Sprunk 2 Can',
        image: 'https://via.placeholder.com/40x80',
        type: "Food",
        model: "ng_proc_sodacan_01a",
        thickness: 0.15,
        mask:"Food",
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
    "Beer": {
        width: 1,
        height: 2,
        max_stack: 15, 
        name: 'Beer',
        image: 'https://via.placeholder.com/40x80',
        type: "Food",
        mask:"Food",
        model: "prop_cs_beer_bot_03",
        thickness: 0.15,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
    "Drank Bottle": {
        width: 1,
        height: 2,
        max_stack: 14,
        name: 'Drank Fresh',
        image: 'https://via.placeholder.com/40x80',
        type: "Food",
        model: "ng_proc_ojbot_01a",
        mask:"Food",
        thickness: 0.2,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
    "Banana": {
        width: 2,
        height: 1,
        max_stack: 24,
        name: 'Banana',
        image: 'https://via.placeholder.com/80x40',
        type: "Food",
        model: "ng_proc_food_nana1a",
        mask:"Food",
        thickness: 0.15,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
    "Orange": {
        width: 1,
        height: 1,
        max_stack: 24,
        name: 'Orange',
        image: 'https://via.placeholder.com/40x40',
        type: "Food",
        model: "ng_proc_food_ornge1a",
        mask:"Food",
        thickness: 0.15,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
    "Crackles O`Dawn": {
        width: 1,
        height: 2,
        max_stack: 24,
        name: "Crackles O`Dawn",
        image: 'https://via.placeholder.com/40x80',
        type: "Food",
        model: "v_res_tt_cereal02",
        mask:"Food",
        thickness: 0.2,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0.0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
    "Strawberry Rails": {
        width: 1,
        height: 2,
        max_stack: 24,
        name: "Strawberry Rails",
        image: 'https://via.placeholder.com/40x80',
        type: "Food",
        model: "v_res_fa_cereal01",
        mask:"Food",
        thickness: 0.2,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
    "Chicken Noodles": {
        width: 1,
        height: 2,
        max_stack: 24,
        name: "Chicken Noodles",
        image: 'https://via.placeholder.com/40x80',
        type: "Food",
        mask:"Food",
        model: "v_res_fa_potnoodle",
        thickness: 0.15,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
    "Bread": {
        width: 1,
        height: 2,
        max_stack: 24,
        name: "Bread",
        image: 'https://via.placeholder.com/40x80',
        type: "Food",
        mask:"Food",
        model: "v_res_fa_bread01",
        thickness: 0.25,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0.03),
            rot: new mp.Vector3(90, 0, 0)
        }
    },
    "Gas Can": {
        width: 3,
        height: 3,
        max_stack: 1,
        name: 'Gas Can',
        image: '../../source/img/Icon_jerrycan.png',
        type: "Industrial",
        model: "prop_oilcan_01a",
        thickness: 0.25,
        mask:"Tool",
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
        mask:"Material",
        thickness: 0.35,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
    "Tire": {
        width: 4,
        height: 4,
        max_stack: 1,
        name: 'Tire',
        image: 'https://via.placeholder.com/160x160',
        type: "Industrial",
        model: "ng_proc_tyre_01",
        mask:"Wheels",
        thickness: 0.35,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
    "Morphine": {
        width: 2,
        height: 1,
        max_stack: 4,
        name: 'Wood',
        image: 'https://via.placeholder.com/40x80',
        type: "Hospital",
        model: "ng_proc_syrnige01a",
        mask:"Heal",
        thickness: 0.15,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    }
};
module.exports = items;