const weaponData = require("./weaponData");

const PistolAttachmentPos = new mp.Vector3(0.02, 0.06, 0.1);
const PistolAttachmentRot = new mp.Vector3(-100.0, 0.0, 0.0);

const SMGAttachmentPos = new mp.Vector3(0.08, 0.03, -0.1);
const SMGAttachmentRot = new mp.Vector3(-80.77, 0.0, 0.0);

const ShotgunAttachmentPos = new mp.Vector3(-0.1, -0.12, 0.11);
const ShotgunAttachmentRot = new mp.Vector3(-180.0, 0.0, 0.0);

const RifleAttachmentPos = new mp.Vector3(-0.1, -0.15, -0.13);
const RifleAttachmentRot = new mp.Vector3(0.0, 0.0, 3.5);

/*
    Weapon names have to be uppercase!
    You can get attachment bone IDs from https://wiki.rage.mp/index.php?title=Bones
 */
const weaponAttachmentData = {
    // Pistols
    "weapon_hatchet": { Slot: "RIGHT_THIGH", AttachBone: 51826, AttachPosition: PistolAttachmentPos, AttachRotation: new mp.Vector3(-100.0, 110.0, 0.0) },

    "WEAPON_PISTOL": { Slot: "RIGHT_THIGH", AttachBone: 51826, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_PISTOL_MK2": { Slot: "RIGHT_THIGH", AttachBone: 51826, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_COMBATPISTOL": { Slot: "RIGHT_THIGH", AttachBone: 51826, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_APPISTOL": { Slot: "RIGHT_THIGH", AttachBone: 51826, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_STUNGUN": { Slot: "RIGHT_THIGH", AttachBone: 51826, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_PISTOL50": { Slot: "RIGHT_THIGH", AttachBone: 51826, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_SNSPISTOL": { Slot: "RIGHT_THIGH", AttachBone: 51826, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_SNSPISTOL_MK2": { Slot: "RIGHT_THIGH", AttachBone: 51826, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_HEAVYPISTOL": { Slot: "RIGHT_THIGH", AttachBone: 51826, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_VINTAGEPISTOL": { Slot: "RIGHT_THIGH", AttachBone: 51826, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_REVOLVER": { Slot: "RIGHT_THIGH", AttachBone: 51826, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_REVOLVER_MK2": { Slot: "RIGHT_THIGH", AttachBone: 51826, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_DOUBLEACTION": { Slot: "RIGHT_THIGH", AttachBone: 51826, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_RAYPISTOL": { Slot: "RIGHT_THIGH", AttachBone: 51826, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },

    // Submachine Guns
    "WEAPON_MICROSMG": { Slot: "LEFT_THIGH", AttachBone: 58271, AttachPosition: SMGAttachmentPos, AttachRotation: SMGAttachmentRot },
    "WEAPON_SMG": { Slot: "LEFT_THIGH", AttachBone: 58271, AttachPosition: SMGAttachmentPos, AttachRotation: SMGAttachmentRot },
    "WEAPON_SMG_MK2": { Slot: "LEFT_THIGH", AttachBone: 58271, AttachPosition: SMGAttachmentPos, AttachRotation: SMGAttachmentRot },
    "WEAPON_ASSAULTSMG": { Slot: "LEFT_THIGH", AttachBone: 58271, AttachPosition: SMGAttachmentPos, AttachRotation: SMGAttachmentRot },
    "WEAPON_COMBATPDW": { Slot: "LEFT_THIGH", AttachBone: 58271, AttachPosition: SMGAttachmentPos, AttachRotation: SMGAttachmentRot },
    "WEAPON_MACHINEPISTOL": { Slot: "LEFT_THIGH", AttachBone: 58271, AttachPosition: SMGAttachmentPos, AttachRotation: SMGAttachmentRot },
    "WEAPON_MINISMG": { Slot: "LEFT_THIGH", AttachBone: 58271, AttachPosition: SMGAttachmentPos, AttachRotation: SMGAttachmentRot },

    // Shotguns
    "WEAPON_PUMPSHOTGUN": { Slot: "LEFT_BACK", AttachBone: 24818, AttachPosition: ShotgunAttachmentPos, AttachRotation: ShotgunAttachmentRot },
    "WEAPON_PUMPSHOTGUN_MK2": { Slot: "LEFT_BACK", AttachBone: 24818, AttachPosition: ShotgunAttachmentPos, AttachRotation: ShotgunAttachmentRot },
    "WEAPON_SAWNOFFSHOTGUN": { Slot: "LEFT_BACK", AttachBone: 24818, AttachPosition: ShotgunAttachmentPos, AttachRotation: ShotgunAttachmentRot },
    "WEAPON_ASSAULTSHOTGUN": { Slot: "LEFT_BACK", AttachBone: 24818, AttachPosition: ShotgunAttachmentPos, AttachRotation: ShotgunAttachmentRot },
    "WEAPON_BULLPUPSHOTGUN": { Slot: "LEFT_BACK", AttachBone: 24818, AttachPosition: ShotgunAttachmentPos, AttachRotation: ShotgunAttachmentRot },
    "WEAPON_HEAVYSHOTGUN": { Slot: "LEFT_BACK", AttachBone: 24818, AttachPosition: ShotgunAttachmentPos, AttachRotation: ShotgunAttachmentRot },

    // Rifles
    "WEAPON_ASSAULTRIFLE": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: RifleAttachmentPos, AttachRotation: RifleAttachmentRot },
    "WEAPON_ASSAULTRIFLE_MK2": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: RifleAttachmentPos, AttachRotation: RifleAttachmentRot },
    "WEAPON_CARBINERIFLE": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: RifleAttachmentPos, AttachRotation: RifleAttachmentRot },
    "WEAPON_CARBINERIFLE_MK2": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: RifleAttachmentPos, AttachRotation: RifleAttachmentRot },
    "WEAPON_SPECIALCARBINE": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: RifleAttachmentPos, AttachRotation: RifleAttachmentRot },
    "WEAPON_SPECIALCARBINE_MK2": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: RifleAttachmentPos, AttachRotation: RifleAttachmentRot },
    "WEAPON_MARKSMANRIFLE": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: RifleAttachmentPos, AttachRotation: RifleAttachmentRot },
    "WEAPON_MARKSMANRIFLE_MK2": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: RifleAttachmentPos, AttachRotation: RifleAttachmentRot }
};

// Update weaponAttachmentData with attachment name and model
for (let weapon in weaponAttachmentData) {
    let hash = mp.game.joaat(weapon);

    if (weaponData[hash]) {
        weaponAttachmentData[weapon].AttachName = weaponData[hash].HashKey;
        weaponAttachmentData[weapon].AttachModel = weaponData[hash].ModelHashKey;
    } else {
        console.log(`[!] ${weapon} not found in weapon data file and will cause issues, remove it from weaponAttachmentData.`);
    }
}



for (let weapon in weaponAttachmentData) {
    mp.attachmentMngr.register(weaponAttachmentData[weapon].AttachName, weaponAttachmentData[weapon].AttachModel, weaponAttachmentData[weapon].AttachBone, weaponAttachmentData[weapon].AttachPosition, weaponAttachmentData[weapon].AttachRotation);
}

