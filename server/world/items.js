/*
 *  Tiers : low,medium,high,...
 */
var items = [{
    name: "Shotgun",
    tier: "low",
    model: "w_sg_pumpshotgun",
    offset: {
        pos: new mp.Vector3(0, 0, 0.02),
        rot: new mp.Vector3(90, 0, 0)
    }
},{
    name: "Drank",
    tier: "low",
    model: "bkr_prop_coke_powderbottle_02",
    offset: {
        pos: new mp.Vector3(0, 0, 0),
        rot: new mp.Vector3(0, 0, 0)
    }
}, {
    name: "Drank Fresh",
    tier: "medium",
    model: "bkr_prop_coke_powderbottle_01",
    offset: {
        pos: new mp.Vector3(0, 0, 0),
        rot: new mp.Vector3(0, 0, 0)
    }
}, {
    name: "SMG",
    tier: "medium",
    model: "w_sb_smg",
    offset: {
        pos: new mp.Vector3(0, 0, 0.01),
        rot: new mp.Vector3(90, 0, 0)
    }
}]
module.exports = items;