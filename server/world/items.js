"use strict";
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
        image: '../../source/img/equipment/hatchet.png',
        type: "Residential",
        model: "prop_w_me_hatchet",
        thickness: 0.15,
        amount: 1,
        mask: "melee",
        offset: {
            pos: new mp.Vector3(0, 0, 0.02),
            rot: new mp.Vector3(90, 0, 0)
        },
        modifiers: {
            spread: function() {
                return getRandomInt(1, 3)
            },
            durability: function() {
                return 100
            }
        }
    },
    "Pickaxe": {
        width: 3,
        height: 3,
        max_stack: 1,
        name: 'Pickaxe',
        image: '../../source/img/equipment/pickaxe.png',
        type: "Residential",
        model: "prop_tool_pickaxe",
        thickness: 0.15,
        amount: 1,
        mask: "melee",
        offset: {
            pos: new mp.Vector3(0, 0, 0.02),
            rot: new mp.Vector3(90, 0, 0)
        },
        modifiers: {
            reward: function() {
                return getRandomInt(1, 3)
            },
            durability: function() {
                return 100
            }
        }
    },
    "Pump Shotgun": {
        width: 4,
        height: 2,
        max_stack: 1,
        name: 'Pump Shotgun',
        image: '../../source/img/equipment/weapon_pumpshotgun.png',
        type: "Residential",
        model: "w_sg_pumpshotgun",
        thickness: 0.15,
        amount: 1,
        mask: "Primary",
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
        image: '../../source/img/ammo/12_Gauge_Shells.png',
        type: "Residential",
        model: "w_sg_assaultshotgun_mag1",
        mask: "Ammo",
        thickness: 0.15,
        amount: function() {
            return getRandomInt(1, Math.floor(this.max_stack / 4))
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
        image: '../../source/img/equipment/weapon_microsmg.png',
        type: "Industrial",
        model: "w_sb_microsmg",
        thickness: 0.15,
        amount: 1,
        mask: "Primary|Secondary",
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
        image: '../../source/img/ammo/9mm_bullets.png',
        type: "Industrial",
        model: "w_sb_microsmg_mag1",
        thickness: 0.15,
        mask: "Ammo",
        amount: function() {
            return getRandomInt(1, Math.floor(this.max_stack / 4))
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
        image: '../../source/img/equipment/weapon_assaultrifle.png',
        type: "Residential",//"Military",
        model: "w_ar_assaultrifle",
        thickness: 0.15,
        amount: 1,
        mask: "Primary",
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
        image: '../../source/img/ammo/556m_Bullets.png',
        type: "Residential",//"Military",
        model: "w_ar_assaultrifle_mag1",
        thickness: 0.15,
        mask: "Ammo",
        amount: function() {
            return getRandomInt(1, Math.floor(this.max_stack / 4))
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0.01),
            rot: new mp.Vector3(90, 0, 0)
        }
    },
    "Sprunk Can": {
        width: 1,
        height: 2,
        max_stack: 14,
        name: 'Sprunk Can',
        image: '../../source/img/consumable/energy_drink_small.png',
        type: "Food",
        model: "ng_proc_sodacan_01a",
        thickness: 0.25,
        mask: "Drink",
        usable:true,
        thirst:20,
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
        mask: "Drink",
        model: "prop_cs_beer_bot_03",
        thirst:20,
        usable:true,
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
        usable:true,
        mask: "Drink",
        thirst:20,
        animation:"testanim",
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
        usable:true,
        mask: "Food",
        hunger:20,
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
        mask: "Food",
        hunger:20,
        usable:true,
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
        mask: "Food",
        hunger:20,
        usable:true,
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
        mask: "Food",
        hunger:20,
        usable:true,
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
        hunger:20,
        mask: "Food",
        usable:true,
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
        mask: "Food",
        hunger:20,
        usable:true,
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
        image: '../../source/img/tools/jerrycan.png',
        type: "Industrial",
        model: "prop_oilcan_01a",
        thickness: 0.25,
        mask: "Tool",
        usable:true,
        amount: function() {
            return 1
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
    /*Resources*/
    "Wood": {
        width: 2,
        height: 2,
        max_stack: 128,
        name: 'Wood',
        image: '../../source/img/resource/wood.png',
        type: "Craftable",
        model: "prop_fncwood_13c",
        mask: "Material",
        thickness: 0.35,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 90)
        }
    },
    "Stone": {
        width: 2,
        height: 2,
        max_stack: 128,
        name: 'Stone',
        image: '../../source/img/resource/stone.png',
        type: "Craftable",
        model: "proc_sml_stones01",
        mask: "Material",
        thickness: 0.35,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
    "Leaf": {
        width: 2,
        height: 1,
        max_stack: 128,
        name: 'Leaf',
        image: 'https://via.placeholder.com/80x40',
        type: "Craftable",
        model: "ng_proc_leaves05",
        mask: "Material",
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
        mask: "Wheels",
        thickness: 0.35,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(90, 0, 0)
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
        mask: "Heal",
        usable:true,
        thickness: 0.15,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
    "Furnace": {
        width: 2,
        height: 2,
        max_stack: 1,
        name: 'Furnace',
        image: 'https://via.placeholder.com/40x80',
        type: "Craftable",
        model: "prop_paper_bag_01",
        mask: "Building",
        thickness: 0.15,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
    /*Clothing*/
    "Light Armor": {
        width: 2,
        height: 3,
        max_stack: 1,
        name: 'Light Armor',
        image: '../../source/img/equipment/light_vest.png',
        type: "Clothing",
        model: "prop_bodyarmour_04",
        mask: "bodyarmor",
        thickness: 0.15,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        },
        modifiers: {
            durability: function() {
                return 100
            }
        }
    },
    "Medium Armor": {
        width: 3,
        height: 3,
        max_stack: 1,
        name: 'Medium Armor',
        image: 'https://via.placeholder.com/160x160',
        type: "Clothing",
        model: "prop_bodyarmour_06",
        mask: "bodyarmor",
        thickness: 0.15,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        },
        modifiers: {
            durability: function() {
                return 100
            }
        }
    },
    "Heavy Armor": {
        width: 3,
        height: 3,
        max_stack: 1,
        name: 'Heavy Armor',
        image: 'https://via.placeholder.com/160x160',
        type: "Clothing",
        model: "prop_bodyarmour_03",
        mask: "bodyarmor",
        thickness: 0.15,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        },
        modifiers: {
            durability: function() {
                return 100
            }
        }
    },
    /*Light backpack*/
    "Small Backpack": {
        width: 3,
        height: 3,
        max_stack: 1,
        name: 'Small Backpack',
        image: '../../source/img/equipment/backpack_small.png',
        type: "Clothing",
        model: "bkr_prop_duffel_bag_01a",
        mask: "bag",
        thickness: 0.15,
        amount: function() {
            return 1;
        },
        offset: {
            pos: new mp.Vector3(0, 0, 0),
            rot: new mp.Vector3(0, 0, 0)
        }
    },
};
module.exports = items;