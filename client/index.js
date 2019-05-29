(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const absolute_path = "package://RageSurvival/cef/views/";
class CEFBrowser {
    constructor(url) {
        this._setup(url);
    }
    _setup(url) {
        let self = this;
        self.browser = mp.browsers.new(absolute_path + url);
        self.cursorState = false;
       // console.log("new instance");

    }
    call() {
        let args = Array.prototype.slice.call(arguments);
        let full = args[0];
        let callArgs = "(";
        for (let i = 1; i < args.length; i++) {
            switch (typeof args[i]) {
                case 'string':
                    {  
                        callArgs += "\'" + args[i] + "\'";
                        break;
                    }
                case 'number':
                case 'boolean':
                    {
                        callArgs += args[i];
                        break;
                    }
                case 'object':
                    {
                        callArgs += JSON.stringify(args[i]);
                        break;
                    }
            }
            if (i < (args.length - 1)) {
                callArgs += ",";
            }
        }
        callArgs += ");";
        full += callArgs;
        this.browser.execute(full);
    }
    active(toggle) {
        this.browser.active = toggle;
    }
    get isActive() {
        return this.browser.active;
    }
    cursor(state) {
        this.cursorState = state;
        mp.gui.cursor.visible = state;
    }
    clear() {
        this.load("empty.html")
    }
    load(path) {
        let self = this;
        self.browser.url = absolute_path + path;
    }
}
module.exports = {
    interface:new CEFBrowser("empty.html"),
    storage:new CEFBrowser("empty.html"),
    hud:new CEFBrowser("empty.html"),
    notification:new CEFBrowser("notifications/index.html"),
    class:CEFBrowser
};
},{}],2:[function(require,module,exports){
var Offsets = require("./object_offsets.js")
var Building = new class {
    constructor() {
        this._setup();
    }
    _setup() {
        let self = this;
        self._cObj = null;
        self._maxDist = 10;
        self._state = false;
        mp.events.add("render", e => self._render(e));
    }
    get busy() {
        return this._state;
    }
    cancel() {
        if (this.busy == true) {
            this._cObj.destroy();
            this._cObj = null;
            mp.events.callRemote("Building:Canceled");
            this._state = false;
            mp.canCrouch = true;
        }
    }
    loadObject(model) {
        let self = this;
        self._tempModel = model
        let temp_obj = mp.objects.new(mp.game.joaat(model), mp.vector(mp.players.local.position).sub(0, 0, 10), {
            alpha: 255,
            dimension: 0
        });
        temp_obj.gameObject = true;
        self._cObj = temp_obj;
        self._state = true;
    }
    _getPlaceCoords() {
        let self = this;
        let direction = mp.gameplayCam.getDirection();
        let coords = mp.gameplayCam.getCoord();
        let cam_rot = mp.gameplayCam.getRot(0);
        let farAway = new mp.Vector3((direction.x * self._maxDist) + (coords.x), (direction.y * self._maxDist) + (coords.y), (direction.z * self._maxDist) + (coords.z));
        let result = mp.raycasting.testPointToPoint(coords, farAway, self._cObj.handle, (1 | 16));
        let targetPos = farAway;
        if (result !== undefined) {
            targetPos = mp.vector(result.position);
        }
        return targetPos;
    }
    _render() {
        let self = this;
        if ((self._state) && (self._cObj)) {
            mp.game.controls.disableControlAction(0, 22, true); // SPACE
            mp.game.controls.disableControlAction(0, 16, true); //MWHEEL
            mp.game.controls.disableControlAction(0, 17, true); //MWHEEL
            mp.game.controls.disableControlAction(0, 24, true); //Left Mouse Button
            self._cObj.setCollision(false, false);
            self._cObj.setAlpha(150);
            let rot = self._cObj.getRotation(0);
            let targetPos = self._getPlaceCoords();
            let ground = mp.vector(targetPos).ground2(self._cObj);
            let space_key = mp.game.controls.isDisabledControlPressed(0, 22);
            if (space_key) {
                targetPos = ground;
            }
            if (mp.game.controls.isDisabledControlPressed(0, 16)) {
                rot.z -= 8;
            } else if (mp.game.controls.isDisabledControlPressed(0, 17)) {
                rot.z += 8;
            }
            self._cObj.setRotation(rot.x, rot.y, rot.z, 0, true);
            self._cObj.setCoords(targetPos.x, targetPos.y, targetPos.z, false, false, false, false);
            mp.game.graphics.drawText((ground.dist(targetPos) > 0.001) ? "[NOT PLACEABLE]" : "[PLACEABLE]", [targetPos.x, targetPos.y, targetPos.z], {
                font: 4,
                color: [255, 255, 255, 185],
                scale: [0.25, 0.25],
                outline: true,
                centre: true
            });
            self._renderHelp();
            mp.canCrouch = false;
            let can_place = (ground.dist(targetPos) > 0.001) ? false : true;
            if (mp.game.controls.isDisabledControlPressed(0, 24)) {
                if (can_place == true) {
                    self._place();
                }
            } else if (mp.game.controls.isDisabledControlPressed(0, 25)) {
                self.cancel();
            }
        }
    }
    _place() {
        let self = this;
        if (self._cObj) {
            let rot = self._cObj.getRotation(0);
            let pos = self._cObj.getCoords(false);
            self._cObj.destroy();
            self._cObj = null;
            let obj_data = {
                model: self._tempModel,
                pos: {
                    x: pos.x,
                    y: pos.y,
                    z: pos.z
                },
                rot: {
                    x: rot.x,
                    y: rot.y,
                    z: rot.z
                }
            }
            mp.events.callRemote("Building:Place", JSON.stringify(obj_data));
            mp.canCrouch = true;
        }
        self._state = false;
    }
    _renderHelp() {
        let self = this;
        mp.game.graphics.drawText("[MW DOWN] Rotate Left", [0.4, 0.7], {
            font: 4,
            color: (mp.game.controls.isDisabledControlPressed(0, 16) == true) ? [255, 150, 150, 200] : [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
        mp.game.graphics.drawText("[MW UP] Rotate Right", [0.6, 0.7], {
            font: 4,
            color: (mp.game.controls.isDisabledControlPressed(0, 17) == true) ? [255, 150, 150, 200] : [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
        mp.game.graphics.drawText("[LMB] Place Object", [0.5, 0.65], {
            font: 4,
            color: [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
        mp.game.graphics.drawText("[RMB] Cancel Placement", [0.5, 0.67], {
            font: 4,
            color: [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
        mp.game.graphics.drawText("[MOUSE] Change Position", [0.5, 0.7], {
            font: 4,
            color: [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
        mp.game.graphics.drawText("[SPACE] Snap to Ground", [0.5, 0.73], {
            font: 4,
            color: (mp.game.controls.isDisabledControlPressed(0, 22) == true) ? [255, 150, 150, 200] : [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
    }
}
mp.events.add("Building:Start", (model) => {
    if (Building.busy == false) {
       // console.log("loading building object", model);
        Building.loadObject(model);
    }
});
mp.events.add("Building:Cancel", () => {
    if (Building.busy == true) {
        Building.cancel();
    }
});
module.exports = Building;
},{"./object_offsets.js":22}],3:[function(require,module,exports){
var values = [];
values["father"] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 42, 43, 44];
values["mother"] = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 45];
const appearanceIndex = {
    "blemishes": 0,
    "facial_hair": 1,
    "eyebrows": 2,
    "ageing": 3,
    "makeup": 4,
    "blush": 5,
    "complexion": 6,
    "sundamage": 7,
    "lipstick": 8,
    "freckles": 9,
    "chesthair": 10
}
var CEFInterface = require("./browser.js").interface;
var CEFNotification = require("./browser.js").notification;
mp.events.add("Character:Start", (username, hash_password, salt) => {
    console.log("CHARACERT")
    mp.localPlayer.position = new mp.Vector3(1868.5804443359375, 3710.160888671875, 113.74533081054688);
    mp.localPlayer.setAlpha(255);
    mp.localPlayer.freezePosition(true);
    mp.localPlayer.setHeading(140);
    mp.defaultCam.setActive(true);
    NewCam = mp.cameras.new('default', new mp.Vector3(1867.5804443359375, 3708.160888671875, 114.14533081054688), new mp.Vector3(), 40);
    NewCam.pointAtCoord(1868.5804443359375, 3710.160888671875, 113.74533081054688);
    NewCam.setActive(true);
    mp.game.cam.renderScriptCams(true, false, 0, true, false);
    NewCam.setActiveWithInterp(mp.defaultCam.handle, 2000, 0, 0); // 2000ms = 2secs, 0, 0 - idk
    mp.defaultCam = NewCam;
    mp.game.ui.displayHud(false);
    mp.game.ui.displayRadar(false);
    //mp.gui.chat.show(false);
    setTimeout(function() {
        CEFInterface.load("character_creator/index.html");
        CEFInterface.cursor(true);
        BeginCharacterCreator();
    }, 2000)
    //mp.events.callRemote("ServerAccount:Register", username, hash_password, salt);
});
mp.events.add("Character:Update", (data) => {
    let cModel = mp.localPlayer.model == mp.game.joaat('mp_m_freemode_01') ? "Male" : "Female"
    data = JSON.parse(data);
    if (data.gender != cModel) {
        if (data.gender == "Male") {
            mp.localPlayer.model = mp.game.joaat('mp_m_freemode_01');
            mp.localPlayer.setComponentVariation(3, 0, 0, 2);
            mp.localPlayer.setComponentVariation(4, 102, 0, 2);
            mp.localPlayer.setComponentVariation(6, 34, 0, 2);
            mp.localPlayer.setComponentVariation(8, 15, 0, 2);
            mp.localPlayer.setComponentVariation(11, 34, 0, 2);
            mp.localPlayer.setComponentVariation(5, 40, 0, 2);
        } else {
            mp.localPlayer.model = mp.game.joaat('mp_f_freemode_01');
            mp.localPlayer.setComponentVariation(3, 14, 0, 2);
            mp.localPlayer.setComponentVariation(4, 110, 0, 2);
            mp.localPlayer.setComponentVariation(6, 35, 0, 2);
            mp.localPlayer.setComponentVariation(8, 15, 0, 2);
            mp.localPlayer.setComponentVariation(11, 49, 0, 2);
            mp.localPlayer.setComponentVariation(5, 40, 0, 2);
        }
    }
    /*appearanceIndex*/
    if (data.makeup) {
        let index = appearanceIndex["makeup"];
        let overlayID = (data.makeup == 0) ? 255 : data.makeup - 1;
        mp.localPlayer.setHeadOverlay(index, overlayID, /*Opacity*/ data.makeup_opacity * 0.01, 0 /*ColorOverlay*/ , 0);
    }
    if (data.ageing) {
        let index = appearanceIndex["ageing"];
        let overlayID = (data.ageing == 0) ? 255 : data.ageing - 1;
        mp.localPlayer.setHeadOverlay(index, overlayID, /*Opacity*/ data.ageing_opacity * 0.01, 0 /*ColorOverlay*/ , 0);
    }
    if (data.blemishes) {
        let index = appearanceIndex["blemishes"];
        let overlayID = (data.blemishes == 0) ? 255 : data.blemishes - 1;
        mp.localPlayer.setHeadOverlay(index, overlayID, /*Opacity*/ data.blemishes_opacity * 0.01, 0 /*ColorOverlay*/ , 0);
    }
    if (data.facial_hair) {
        let index = appearanceIndex["facial_hair"];
        let overlayID = (data.facial_hair == 0) ? 255 : data.facial_hair - 1;
        mp.localPlayer.setHeadOverlay(index, overlayID, /*Opacity*/ data.facial_hair_opacity * 0.01, data.facial_hair_color /*ColorOverlay*/ , 0);
    }
    if (data.eyebrows) {
        let index = appearanceIndex["eyebrows"];
        let overlayID = (data.eyebrows == 0) ? 255 : data.eyebrows - 1;
        mp.localPlayer.setHeadOverlay(index, overlayID, /*Opacity*/ data.eyebrows_opacity * 0.01, data.eyebrows_color /*ColorOverlay*/ , 0);
    }
    if (data.blush) {
        let index = appearanceIndex["blush"];
        let overlayID = (data.blush == 0) ? 255 : data.blush - 1;
        mp.localPlayer.setHeadOverlay(index, overlayID, /*Opacity*/ data.blush_opacity * 0.01, data.blush_color /*ColorOverlay*/ , 0);
    }
    if (data.complexion) {
        let index = appearanceIndex["complexion"];
        let overlayID = (data.complexion == 0) ? 255 : data.complexion - 1;
        mp.localPlayer.setHeadOverlay(index, overlayID, /*Opacity*/ data.complexion_opacity * 0.01, 0 /*ColorOverlay*/ , 0);
    }
    if (data.lipstick) {
        let index = appearanceIndex["lipstick"];
        let overlayID = (data.lipstick == 0) ? 255 : data.lipstick - 1;
        mp.localPlayer.setHeadOverlay(index, overlayID, /*Opacity*/ data.lipstick_opacity * 0.01, 0 /*ColorOverlay*/ , 0);
    }
    if (data.freckles) {
        let index = appearanceIndex["freckles"];
        let overlayID = (data.freckles == 0) ? 255 : data.freckles - 1;
        mp.localPlayer.setHeadOverlay(index, overlayID, /*Opacity*/ data.freckles_opacity * 0.01, 0 /*ColorOverlay*/ , 0);
    }
    if (data.chesthair) {
        let index = appearanceIndex["chesthair"];
        let overlayID = (data.chesthair == 0) ? 255 : data.chesthair - 1;
        mp.localPlayer.setHeadOverlay(index, overlayID, /*Opacity*/ data.chesthair_opacity * 0.01, data.chesthair_color /*ColorOverlay*/ , 0);
    }
    if (data.sundamage) {
        let index = appearanceIndex["sundamage"];
        let overlayID = (data.sundamage == 0) ? 255 : data.sundamage - 1;
        mp.localPlayer.setHeadOverlay(index, overlayID, /*Opacity*/ data.sundamage_opacity * 0.01, 0 /*ColorOverlay*/ , 0);
    }
    data.facial.forEach(function(feature, i) {
        mp.localPlayer.setFaceFeature(parseInt(feature.index), parseFloat(feature.val) * 0.01);
    })
    if (data.hair != undefined) {
        mp.localPlayer.setComponentVariation(2, data.hair, 0, 2);
        mp.localPlayer.setHairColor(data.hair_color, data.hair_highlight_color);
        mp.localPlayer.setEyeColor(data.eyeColor);
        mp.localPlayer.setHeadOverlayColor(1, 1, data.facial_hair_color, 0);
        mp.localPlayer.setHeadOverlayColor(2, 1, data.eyebrows_color, 0);
        mp.localPlayer.setHeadOverlayColor(5, 2, data.blush_color, 0);
        mp.localPlayer.setHeadOverlayColor(8, 2, data.lipstick, 0);
        mp.localPlayer.setHeadOverlayColor(10, 1, data.chesthair_color, 0);
    }
    if ((data.fatherIndex != undefined) && (data.motherIndex != undefined) && (data.tone != undefined) && (data.resemblance != undefined)) {
        mp.localPlayer.setHeadBlendData(
            // shape
            values["mother"][data.motherIndex], values["father"][data.fatherIndex], 0,
            // skin
            values["mother"][data.motherIndex], values["father"][data.fatherIndex], 0,
            // mixes
            data.resemblance * 0.01, data.tone * 0.01, 0.0, false);
    }
});
mp.events.add("Character:Save", (data) => {
    console.log("SAVE CHAR");
    CEFInterface.clear();
    CEFInterface.cursor(false);
    CEFInterface.active(false);
    clearTasksRender = false;
    mp.defaultCam.setActive(false);
    mp.localPlayer.freezePosition(false);
    mp.game.cam.doScreenFadeOut(500);
    setTimeout(function() {
        mp.events.callRemote("Character:Save", data);
    }, 1000)
});
var clearTasksRender = false;
mp.events.add("render", function() {
    if (clearTasksRender == true) {
        mp.localPlayer.setHeading(140);
        mp.localPlayer.taskLookAt(0, 0, 0);
        let hpos = mp.localPlayer.getBoneCoords(12844, 0, 0, 0)
        mp.defaultCam.pointAtCoord(hpos.x, hpos.y, hpos.z);
        mp.defaultCam.setActive(true);
    }
});

function BeginCharacterCreator() {
    // Set To Male ( Male : mp_m_freemode_01, female : mp_f_freemode_01)
    mp.localPlayer.model = mp.game.joaat('mp_m_freemode_01');
    mp.localPlayer.setDefaultComponentVariation();
    mp.localPlayer.setComponentVariation(3, 0, 0, 2);
    mp.localPlayer.setComponentVariation(4, 102, 0, 2);
    mp.localPlayer.setComponentVariation(6, 34, 0, 2);
    mp.localPlayer.setComponentVariation(8, 15, 0, 2);
    mp.localPlayer.setComponentVariation(11, 34, 0, 2);
    mp.localPlayer.setComponentVariation(5, 40, 0, 2);
    mp.localPlayer.setHeadBlendData(
        // shape
        values["mother"][0], values["father"][0], 0,
        // skin
        values["mother"][0], values["father"][0], 0,
        // mixes
        0.5, 0.5, 0.0, false);
    clearTasksRender = true;
}
},{"./browser.js":1}],4:[function(require,module,exports){
require("./vector.js")
var player_bones = {
	"SKEL_L_UpperArm": {
		bone_id: 45509,
		threshold: 0.08
	},
	"SKEL_R_UpperArm": {
		bone_id: 40269,
		threshold: 0.08
	},
	"SKEL_L_Forearm": {
		bone_id: 61163,
		threshold: 0.08
	},
	"SKEL_R_Forearm": {
		bone_id: 28252,
		threshold: 0.08
	},
	"SKEL_Head": {
		bone_id: 31086,
		threshold: 0.15
	},
	"SKEL_R_Hand": {
		bone_id: 57005,
		threshold: 0.06
	},
	"SKEL_L_Hand": {
		bone_id: 18905,
		threshold: 0.06
	},
	"SKEL_R_Clavicle": {
		bone_id: 10706,
		threshold: 0.1
	},
	"SKEL_L_Clavicle": {
		bone_id: 64729,
		threshold: 0.1
	},
	"SKEL_Spine0": {
		bone_id: 23553,
		threshold: 0.15
	},
	"SKEL_Spine1": {
		bone_id: 24816,
		threshold: 0.15
	},
	"SKEL_Spine2": {
		bone_id: 24817,
		threshold: 0.15
	},
	"SKEL_Spine3": {
		bone_id: 24818,
		threshold: 0.15
	},
	"SKEL_R_Calf": {
		bone_id: 36864,
		threshold: 0.08
	},
	"SKEL_L_Calf": {
		bone_id: 63931,
		threshold: 0.08
	},
	"SKEL_L_Thigh": {
		bone_id: 58271,
		threshold: 0.08
	},
	"SKEL_R_Thigh": {
		bone_id: 51826,
		threshold: 0.08
	},
	"SKEL_R_Foot": {
		bone_id: 52301,
		threshold: 0.08
	},
	"SKEL_L_Foot": {
		bone_id: 14201,
		threshold: 0.08
	}
}

function getVehiclePassangerEntityFromPosition(hPos, veh) {
	let inVehPlayers = [];
	mp.players.forEachInStreamRange((player) => {
		if (player.vehicle == veh) {
			inVehPlayers.push(player);
		}
	});
	let targetEntity = {
		dist: 9999,
		target: null
	}
	inVehPlayers.forEach(function(player) {
		let pPos = player.position;
		let dist = mp.game.system.vdist2(hPos.x, hPos.y, hPos.z, pPos.x, pPos.y, pPos.z);
		if (dist < targetEntity.dist) {
			targetEntity.dist = dist;
			targetEntity.target = player;
		}
	})
	return targetEntity
}

function getIsHitOnBone(hitPosition, target) {
	let nearest_bone = "";
	let nearest_bone_dist = 99;
	if (target != null) {
		for (let bone in player_bones) {
			let bone_id = player_bones[bone].bone_id;
			let threshold = player_bones[bone].threshold;
			let headPos = mp.players.local.getBoneCoords(12844, 0, 0, 0);
			let pos = target.getBoneCoords(bone_id, 0, 0, 0);
			let raycast = mp.raycasting.testPointToPoint(hitPosition, pos, mp.players.local, (2));
			let hit_dist = mp.game.system.vdist(hitPosition.x, hitPosition.y, hitPosition.z, pos.x, pos.y, pos.z);
			if (hit_dist < 1.6) {
				let vector = new mp.Vector3(hitPosition.x - headPos.x, hitPosition.y - headPos.y, hitPosition.z - headPos.z);
				let dist_aim = mp.game.system.vdist(hitPosition.x, hitPosition.y, hitPosition.z, headPos.x, headPos.y, headPos.z);
				let vectorNear = vector.normalize(dist_aim);
				//....
				let dist = mp.game.system.vdist(pos.x, pos.y, pos.z, headPos.x, headPos.y, headPos.z);
				let vectorAtPos = vectorNear.multiply(dist);
				let aimdist = mp.game.system.vdist(pos.x, pos.y, pos.z, headPos.x + vectorAtPos.x, headPos.y + vectorAtPos.y, headPos.z + vectorAtPos.z)
				if (nearest_bone_dist > aimdist) {
					if (aimdist <= threshold) {
						nearest_bone = bone;
						nearest_bone_dist = aimdist;
					}
				}
			}
		}
	}
	return {
		hit: (nearest_bone != "" ? true : false),
		bone: nearest_bone,
		dist: nearest_bone_dist
	};
}
var shotgunSpreadData = {
	487013001: {
		spray: 1.5,
		max_dist: 30
	}
}

function getWeaponDetails(weapon) {
	if (shotgunSpreadData[weapon]) return shotgunSpreadData[weapon]
	else return {
		spray: 1.5,
		max_dist: 30
	};
}

function isWallbugging(target_position) {
	let gun_pos = mp.players.local.getBoneCoords(40269, 0, 0, 0);
	let aim_point = target_position;
	let raycast = mp.raycasting.testPointToPoint(aim_point, gun_pos, mp.players.local, (1 | 2 | 16));
	if (raycast) {
		let hit_pos = raycast.position;
		let entry_point = new mp.Vector3(hit_pos.x - gun_pos.x, hit_pos.y - gun_pos.y, hit_pos.z - gun_pos.z);
		let entry_dist = mp.game.system.vdist(hit_pos.x, hit_pos.y, hit_pos.z, gun_pos.x, gun_pos.y, gun_pos.z);
		let entry_normalize = entry_point.normalize(entry_dist / 2);
		let entry_final_point = entry_normalize.multiply(entry_dist / 2);
		let entry_point_vector = new mp.Vector3(hit_pos.x + entry_final_point.x, hit_pos.y + entry_final_point.y, hit_pos.z + entry_final_point.z)
		let exit_point_vector = new mp.Vector3(hit_pos.x - entry_final_point.x, hit_pos.y - entry_final_point.y, hit_pos.z - entry_final_point.z)
		let entry_point_pos = mp.raycasting.testPointToPoint(entry_point_vector, exit_point_vector, mp.players.local, (1 | 2 | 16));
		let exit_point_pos = mp.raycasting.testPointToPoint(exit_point_vector, entry_point_vector, mp.players.local, (1 | 2 | 16));
		if ((entry_point_pos) && (exit_point_pos)) {
			let dist = mp.game.system.vdist(entry_point_pos.position.x, entry_point_pos.position.y, entry_point_pos.position.z, exit_point_pos.position.x, exit_point_pos.position.y, exit_point_pos.position.z)
			if (dist < 0.45) {
				return false;
			} else {
				return true;
			}
		} else {
			return true;
		}
	} else {
		return false;
	}
}

function calculateShotgunPelletsOnPlayers() {
	let hitted_entity = null;
	var gun_pos = mp.players.local.getBoneCoords(40269, 0, 0, 0);
	let aim_point = mp.players.local.aimingAt;
	let raycast = mp.raycasting.testPointToPoint(aim_point, gun_pos, mp.players.local, -1);
	if (!raycast) {
		mp.players.forEachInStreamRange((ped) => {
			if (mp.players.local != ped) {
				let pos = ped.getWorldPositionOfBone(ped.getBoneIndexByName("IK_Head"));
				let raycast1 = mp.raycasting.testPointToPoint(gun_pos, pos, mp.players.local, -1);
				if (!raycast1) {
					let headPos = mp.players.local.getBoneCoords(12844, 0, 0, 0);
					let vector = new mp.Vector3(aim_point.x - headPos.x, aim_point.y - headPos.y, aim_point.z - headPos.z);
					let dist_aim = mp.game.system.vdist(aim_point.x, aim_point.y, aim_point.z, headPos.x, headPos.y, headPos.z);
					let vectorNear = vector.normalize(dist_aim);
					//....
					let dist = mp.game.system.vdist(pos.x, pos.y, pos.z, headPos.x, headPos.y, headPos.z);
					let vectorAtPos = vectorNear.multiply(dist);
					let aim_vector = new mp.Vector3(headPos.x + vectorAtPos.x, headPos.y + vectorAtPos.y, headPos.z + vectorAtPos.z);
					let spray_dist = mp.game.system.vdist(pos.x, pos.y, pos.z, headPos.x + vectorAtPos.x, headPos.y + vectorAtPos.y, headPos.z + vectorAtPos.z)
					let ped_dist = mp.game.system.vdist(pos.x, pos.y, pos.z, gun_pos.x, gun_pos.y, gun_pos.z)
					let w_data = getWeaponDetails(Number(mp.players.local.weapon));
					if (w_data) {
						let spray_size = mp.lerp(0.5, w_data.spray, 1 / w_data.max_dist * ped_dist)
						if (spray_size > w_data.spray) spray_size = w_data.spray;
						let would_hit = false;
						if (spray_size > spray_dist) would_hit = true;
						if (would_hit == true) {
							hitted_entity = ped;
						}
					}
				}
			}
		});
	}
	return hitted_entity;
}
mp.events.add('playerWeaponShot', (targetPosition, targetEntity) => {
	let weapon_hash = mp.players.local.weapon;
	//
	let ammo = mp.players.local.getAmmoInClip(weapon_hash);
	mp.events.callRemote("Combat:FireWeapon", weapon_hash.toString(), ammo);
	if (isWallbugging(targetPosition) == false) {
		if (targetEntity) {
			if (targetEntity.isInAnyVehicle(false)) {
				let vehicle = targetEntity.vehicle;
				let result = getVehiclePassangerEntityFromPosition(targetPosition, vehicle)
				let entityHit = getIsHitOnBone(targetPosition, result.target)
				if (entityHit.hit == true) {
					mp.events.callRemote("Combat:HitEntity", result.target, weapon_hash);
				} else {
					mp.events.callRemote("Combat:HitVehicle", vehicle, weapon_hash);
				}
			} else {
				mp.events.callRemote("Combat:HitEntity", targetEntity, weapon_hash);
			}
		} else {
			if (mp.game.weapon.getWeapontypeGroup(weapon_hash) == 860033945) {
				let e = calculateShotgunPelletsOnPlayers();
				if (e != null) {
					mp.events.callRemote("Combat:HitEntity", e, weapon_hash);
				}
			}
		}
	}
});
var timerHitmarker = 0;
mp.events.add("render", () => {
	mp.game.player.resetStamina();
	if (!mp.game.graphics.hasStreamedTextureDictLoaded("hud_reticle")) {
		mp.game.graphics.requestStreamedTextureDict("hud_reticle", true);
	}
	if (mp.game.graphics.hasStreamedTextureDictLoaded("hud_reticle")) {
		if ((Date.now() / 1000 - timerHitmarker) <= 0.1) {
			mp.game.graphics.drawSprite("hud_reticle", "reticle_ar", 0.5, 0.5, 0.025, 0.040, 45, 255, 255, 255, 150);
		}
	}
});
mp.events.add("Combat:HitEntity", () => {
	timerHitmarker = Date.now() / 1000;
});
mp.events.add("Combat:Hitted", (dmg) => {});
},{"./vector.js":31}],5:[function(require,module,exports){
var Status = [
    "Crafted successfully!",
    "Crafting failed!",
    "Recipe not found...",
    "Invalid Amount!"
];

mp.events.add('Crafting:Reply', (status) => {
    console.log(Status[status]);
});
},{}],6:[function(require,module,exports){
"use strict";
var natives = require("./natives.js")
var CEFNotification = require("./browser.js").notification;
var StorageSystem = require("./storage.js");
var Notifications = require("./notifications.js");
const convertNameTypes = [];
convertNameTypes["potato"] = "Potato";
convertNameTypes["onion"] = "Onion"; // Ples
convertNameTypes["carrot"] = "Carrot";
convertNameTypes["salat"] = "Salat";
convertNameTypes["cucumber"] = "Cucumber";
const cropObjects = [];
cropObjects["potato"] = {
    obj: "prop_plant_int_04a",
    offset: -0.25,
    rotation: new mp.Vector3(0, 0, 0)
};
cropObjects["onion"] = {
    obj: "prop_plant_int_04b",
    offset: -0.25,
    rotation: new mp.Vector3(0, 0, 0)
};
cropObjects["carrot"] = {
    obj: "p_int_jewel_plant_01",
    offset: -0.25,
    rotation: new mp.Vector3(0, 0, 0)
};
cropObjects["salat"] = {
    obj: "prop_veg_crop_03_cab",
    offset: -0.1,
    rotation: new mp.Vector3(0, 0, 0)
};
cropObjects["cucumber"] = {
    obj: "p_int_jewel_plant_02",
    offset: -0.25,
    rotation: new mp.Vector3(0, 0, 0)
};

function msToTime(s) {
    let ms = s % 1000;
    s = (s - ms) / 1000;
    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    let hrs = (s - mins) / 60;
    //if (hrs < 10) hrs = "0" + hrs;
    if (mins < 10) mins = "0" + mins;
    if (secs < 10) secs = "0" + secs;
    return hrs + 'h:' + mins + 'm';
}
var streamedCrops = [];

function pointingAt(max_dist = 25) {
    let ray_dist = max_dist;
    let direction = mp.gameplayCam.getDirection();
    let coords = mp.gameplayCam.getCoord();
    let farAway = new mp.Vector3((direction.x * ray_dist) + (coords.x), (direction.y * ray_dist) + (coords.y), (direction.z * ray_dist) + (coords.z));
    let result = mp.raycasting.testPointToPoint(coords, farAway, mp.players.local, -1);
    if (result === undefined) {
        return undefined;
    }
    return result;
}
class Crop {
    constructor(data) {
        this._setup(data);
    }
    _setup(data) {
        let self = this;
        self._data = data;
       // console.log("init crop");
        self._id = data._id;
        self._cropType = data.type;
        self._planted = data.planted;
        self._yield = data.yield;
        self.loaded = false;
        self._position = mp.vector(data.position);
        self.create();
    }
    create() {
        let self = this;
        if (cropObjects[self._cropType]) {
            let cropData = cropObjects[self._cropType];
            let ground = self._position.ground();
            self.obj = mp.objects.new(mp.game.joaat(cropData.obj), ground.add(0, 0, cropData.offset), { //item.model
                rotation: cropData.rotation,
                alpha: 255,
                dimension: 0
            });
        }
    }
    render() {
        let self = this;
        let dist = mp.localPlayer.getPos().dist(self._position)
        if (dist < 20) {
            let raycast = mp.raycasting.testPointToPoint(mp.localPlayer.getPos(), self._position, mp.players.local, (1));
            if (!raycast) {
                let text_size = mp.lerp(0.3, 0.1, 1 / 30 * dist);
                if (self.obj) {
                    let pos = self.obj.getCoords(false);
                    let yield1 = mp.lerp(0, self._yield.max, 1 / self._yield.ttg * (Date.now() - self._planted)).toFixed(0);
                    if (yield1 > self._yield.max) yield1 = self._yield.max;
                    mp.game.graphics.drawText(convertNameTypes[self._cropType] + "\nYield :" + yield1 + "\nAge :" + msToTime(Date.now() - self._planted), [pos.x, pos.y, pos.z + 1], {
                        font: 4,
                        color: [255, 255, 255, 200],
                        scale: [text_size, text_size],
                        outline: true,
                        centre: true
                    });
                    let pointAt = pointingAt(15);
                    if ((pointAt) && (pointAt.entity)) {
                        if (typeof pointAt.entity == "object") {
                            if (mp.vector(mp.localPlayer.position).dist(pointAt.entity.getCoords(true)) < 2) {
                                if (pointAt.entity == self.obj) {
                                    if (yield1 > 0) {
                                        mp.game.ui.showHudComponentThisFrame(14);
                                        mp.game.graphics.drawText("[E] Harvest", [0.5, 0.55], {
                                            font: 4,
                                            color: [255, 255, 255, 200],
                                            scale: [0.3, 0.3],
                                            outline: true,
                                            centre: true
                                        });
                                        if (mp.game.controls.isDisabledControlPressed(0, 51)) { // 51 == "E"
                                            console.log("TODO: HARVEST CROPS")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    unload() {
        let self = this;
        console.log("unloade");
        if (this.obj) {
            this.obj.destroy();
        }
    }
}
mp.events.add("playerExitColshape", (colshape) => {
    if (colshape.getVariable("crop_colshape")) {
        let id = colshape.getVariable("crop_colshape_id");
        if (streamedCrops[id]) {
            console.log("unload clientside2");
            streamedCrops[id].unload()
            delete streamedCrops[id];
        }
    }
});
mp.events.add("Crops:Load", (id, poolData) => {
    if (!streamedCrops[id]) {
        streamedCrops[id] = new Crop(poolData);
    }
});
mp.events.add("Crops:Unload", (id) => {
    if (streamedCrops[id]) {
        streamedCrops[id].unload()
        delete streamedCrops[id];
    }
});
mp.events.add("render", () => {
    Object.keys(streamedCrops).forEach(function(key) {
        streamedCrops[key].render();
    })
});
},{"./browser.js":1,"./natives.js":19,"./notifications.js":20,"./storage.js":29}],7:[function(require,module,exports){
const movementClipSet = "move_ped_crouched";
const strafeClipSet = "move_ped_crouched_strafing";
const clipSetSwitchTime = 0.25;
const loadClipSet = (clipSetName) => {
    mp.game.streaming.requestClipSet(clipSetName);
    while (!mp.game.streaming.hasClipSetLoaded(clipSetName)) mp.game.wait(0);
};
loadClipSet(movementClipSet);
loadClipSet(strafeClipSet);
mp.events.add("entityStreamIn", (entity) => {
    if (entity.type === "player" && entity.getVariable("isCrouched")) {
        entity.setMovementClipset(movementClipSet, clipSetSwitchTime);
        entity.setStrafeClipset(strafeClipSet);
    }
});
mp.events.addDataHandler("isCrouched", (entity, value) => {
    if (entity.type !== "player") return;
    if (value) {
        entity.setMovementClipset(movementClipSet, clipSetSwitchTime);
        entity.setStrafeClipset(strafeClipSet);
    } else {
        entity.resetMovementClipset(clipSetSwitchTime);
        entity.resetStrafeClipset();
    }
});
mp.keys.bind(0x11, false, () => {
    if ((mp.canCrouch == true) && (mp.gui.chat.enabled == false) && (mp.ui.ready == true)) {
        mp.events.callRemote("Player:Crouch");
    }
});
},{}],8:[function(require,module,exports){
require("./vector.js")
var natives = require("./natives.js")
var materials = require("./materials.js")
var StorageSystem = require("./storage.js");

function checkResourceInFront(max_dist) {
    let nearest = {
        dist: max_dist,
        pos: null,
        resource: ""
    }
    let pos = new mp.Vector3(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z);
    let heading = mp.players.local.getHeading();
    pos = pos.findRot(heading, 0.5, 90);
    for (var i = 0; i < 180; i += 10) {
        let exit_ps = pos.findRot(heading, 5, i);
        let hitData = mp.raycasting.testCapsule(pos, exit_ps, 0.1, mp.players.local.handle, -1);
        if (hitData) {
            exit_ps = new mp.Vector3(hitData.position.x, hitData.position.y, hitData.position.z)
            let dist = pos.dist(exit_ps);
            if (dist < nearest.dist) {
                if (materials[hitData.material] == true) {
                    nearest.dist = dist;
                    nearest.pos = exit_ps;
                    nearest.resource = hitData.material;
                }
            }
        }
    }
    return nearest.resource != "" ? nearest.resource : false;
}
let addText = "";
mp.events.add("render", () => {
    if (mp.ui.ready == true) {
        if ((mp.localPlayer.getVariable('hasHatchet') == true) || (mp.localPlayer.getVariable('hasPickaxe') == true)) {
            if ((mp.localPlayer.getVariable('canGather') == true)) {
                let material = checkResourceInFront(0.5);
                if (material) {
                    if (((mp.localPlayer.getVariable('hasHatchet') == true) && (materials[material] == 1)) || ((mp.localPlayer.getVariable('hasPickaxe') == true) && (materials[material] == 2))) {
                        mp.game.controls.disableControlAction(0, 51, true);
                        mp.game.ui.showHudComponentThisFrame(14);
                        mp.game.graphics.drawText("[E] Gather Material", [0.5, 0.55], {
                            font: 4,
                            color: [255, 255, 255, 200],
                            scale: [0.3, 0.3],
                            outline: true,
                            centre: true
                        });
                        if ((addText != "")) {
                            mp.game.graphics.drawText("\n[" + addText + "]", [0.5, 0.55], {
                                font: 4,
                                color: [255, 150, 150, 200],
                                scale: [0.3, 0.3],
                                outline: true,
                                centre: true
                            });
                        }
                        if (mp.game.controls.isDisabledControlJustPressed(0, 51)) { // 51 == "E"
                            let doesFit = StorageSystem.checkFit("inventory", 2, 2)
                            doesFit.then(function(fit) {
                                if (fit != undefined) {
                                    mp.events.callRemote("Player:Gather", material.toString());
                                } else {
                                    addText = "Not enough Space"
                                }
                            });
                        }
                    } else {
                        addText = "";
                    }
                }
            } else {
                addText = "";
            }
        }
    }
});
/*mp.keys.bind(0x09, false, () => {
    console.log(JSON.stringify(checkResourceInFront(2)));
});*/
module.exports = checkResourceInFront;
},{"./materials.js":18,"./natives.js":19,"./storage.js":29,"./vector.js":31}],9:[function(require,module,exports){
"use strict";
console.log = function(...a) {
    mp.gui.chat.push("~r~D~w~:" + a.join(" "))
};

mp.lerp = function(a, b, n) {
    return (1 - n) * a + n * b;
}
require("./libs/attachments.js")
require("./libs/weapon_attachments.js")
require("./libs/animations.js")



/*Register Attachments for Player Animatiuons etc TODO*/
mp.attachmentMngr.register("mining", "prop_tool_pickaxe", 57005, new mp.Vector3(0.085, -0.3, 0), new mp.Vector3(-90, 0, 0));
mp.attachmentMngr.register("lumberjack", "w_me_hatchet", 57005, new mp.Vector3(0.085, -0.05, 0), new mp.Vector3(-90, 0, 0));


require("./vector.js")

mp.rpc = require("./libs/rage-rpc.min.js");
mp.isValid = function(val) {
    return val != null && val != undefined && val != "";
}
mp.gui.chat.enabled = false;
mp.gui.execute("const _enableChatInput = enableChatInput;enableChatInput = (enable) => { mp.trigger('chatEnabled', enable); _enableChatInput(enable) };");
mp.events.add('chatEnabled', (isEnabled) => {
    mp.gui.chat.enabled = isEnabled;
});
mp.game.graphics.setBlackout(true);
mp.canCrouch = true;
mp.gameplayCam = mp.cameras.new('gameplay');
mp.defaultCam = mp.cameras.new('default');
mp.localPlayer = mp.players.local;
mp.localPlayer.getPos = function() {
    return mp.vector(this.position);
}
mp.ui = {};
mp.ui.ready = false;
mp.gameplayCam.setAffectsAiming(true);
require("./object.js")
require("./interface.js")
require("./crops.js")
require("./player.js")
require("./scaleforms/index.js")
require("./crouch.js")
require("./items.js")
require("./crafting.js")
require("./zombies.js")
require("./gathering.js")
require("./building.js")
require("./login.js")
require("./combat.js")
require("./character_creator.js")
require("./vehicles.js")
require("./storage.js")
require("./weather.js")
var natives = require("./natives.js")
var CEFNotification = require("./browser.js").notification;
mp.events.add("Notifications:New", (notification_data) => {
    CEFNotification.call("notify", notification_data)
})
mp.events.add("Player:WanderDuration", (ms) => {
    console.log("GO WANDER");
    let p = mp.players.local.position;
    mp.players.local.taskWanderStandard(10, 10);
    setTimeout(function() {
        mp.players.local.clearTasksImmediately();
    }, ms)
});
mp.events.add('Player:ShowUI', () => {
    mp.ui.ready = true;
});
mp.events.add('Player:HideUI', () => {
    mp.ui.ready = true;
});
mp.events.add('Player:Collision', (enable) => {
    if (enable == true) {
        mp.vehicles.forEach(vehicle => {
            if (mp.players.local.vehicle) {
                mp.players.local.vehicle.setNoCollision(vehicle.handle, true);
                natives.SET_ENTITY_NO_COLLISION_ENTITY(mp.players.local.vehicle, vehicle, true)
                natives.SET_ENTITY_NO_COLLISION_ENTITY(vehicle, mp.players.local.vehicle, true)
            }
            vehicle.setAlpha(255);
        });
    } else {
        mp.vehicles.forEach(vehicle => {
            if (mp.players.local.vehicle) {
                mp.players.local.vehicle.setNoCollision(vehicle.handle, false);
                natives.SET_ENTITY_NO_COLLISION_ENTITY(vehicle, mp.players.local.vehicle, false)
                natives.SET_ENTITY_NO_COLLISION_ENTITY(mp.players.local.vehicle, vehicle, false)
            }
            vehicle.setAlpha(150);
        });
    }
});
},{"./browser.js":1,"./building.js":2,"./character_creator.js":3,"./combat.js":4,"./crafting.js":5,"./crops.js":6,"./crouch.js":7,"./gathering.js":8,"./interface.js":10,"./items.js":11,"./libs/animations.js":12,"./libs/attachments.js":13,"./libs/rage-rpc.min.js":14,"./libs/weapon_attachments.js":16,"./login.js":17,"./natives.js":19,"./object.js":21,"./player.js":23,"./scaleforms/index.js":28,"./storage.js":29,"./vector.js":31,"./vehicles.js":32,"./weather.js":33,"./zombies.js":34}],10:[function(require,module,exports){
//Interaction
},{}],11:[function(require,module,exports){
"use strict";
var natives = require("./natives.js")
var CEFNotification = require("./browser.js").notification;
var StorageSystem = require("./storage.js");
var Notifications = require("./notifications.js");
var streamedPools = [];
class LootPool {
    constructor(data) {
        this._setup(data);
    }
    _setup(data) {
        let self = this;
        self._lootData = data;
        self._pickupObjects = [];
        self.loaded = false;
        //let dist = mp.localPlayer.getPos().dist2d(new mp.Vector3(this._lootData.pos.x, this._lootData.pos.y, this._lootData.pos.z));
        //setTimeout(function() {
        self.interval = setInterval(function() {
            self.check();
        }, 1000)
        self.check();
        // }, 50*dist );
    }
    get position() {
        return new mp.Vector3(this._lootData.pos.x, this._lootData.pos.y, this._lootData.pos.z);
    }
    get id() {
        return this._lootData.id;
    }
    getLootPool() {
        return this._lootData.items;
    }
    isInRange() {
        let self = this;
        return new mp.Vector3(self._lootData.pos.x, self._lootData.pos.y, self._lootData.pos.z).dist(mp.players.local.position) < ((mp.players.local.isRunning() == true) ? 7 : 5);
    }
    reload(data) {
        let self = this;
        self.unload(self.id)
        let rot_data = [];
        self._lootData.items.forEach(function(item, index) {
            if (item != null) {
                if (rot_data[item.index] == undefined) {
                    rot_data[item.index] = item.rot;
                }
            }
        });
        self._lootData = data;
        self._lootData.items = self._lootData.items.map(function(item, index, theArray) {
            let sArr = item;
            if (sArr != null) {
                sArr.rot = rot_data[index] || undefined
            }
            return sArr;
        });
        self.check();
    }
    check() {
        let self = this;
        let center = new mp.Vector3(self._lootData.pos.x, self._lootData.pos.y, self._lootData.pos.z);
        let Angle_Item = 360 / 8;
        if ((self.loaded == false) && ((!mp.raycasting.testPointToPoint(mp.vector(mp.localPlayer.position).add(0,0,100), center, mp.players.local, (1))) || (!mp.raycasting.testPointToPoint(mp.vector(mp.localPlayer.position), center, mp.players.local, (1))))) {
            self.loaded = true;
            self._lootData.items.forEach(function(item, index) {
                if (item != null) {
                    item.index = index;
                    if (mp.game.streaming.isModelInCdimage(mp.game.joaat(item.model))) {
                        let offset_pos = center.findRot(0, 0.5, Angle_Item * index);
                        let base_rot = (Angle_Item * index) + (offset_pos.rotPoint(center) + Math.floor(Math.random() * (360 - 0)));
                        if (base_rot > 360) base_rot -= 360;
                        if (item.rot == undefined) {
                            item.rot = base_rot
                        }
                        let pos = offset_pos;
                        pos.z += 1;
                        // let obj = mp.game.object.createObject(mp.game.joaat(item.model), pos.x, pos.y, pos.z, false, true, false);
                        let obj = mp.objects.new(mp.game.joaat(item.model), pos, { //item.model
                            rotation: new mp.Vector3(0, 0, item.rot),
                            alpha: 255,
                            dimension: 0
                        });
                        obj.placeOnGroundProperly();
                        let rotobj = obj.getRotation(0);
                        let posobj = obj.getCoords(false);
                        obj.setCollision(false, true);
                        obj.freezePosition(true);
                        if ((item.offset.rot.x > 0) || (item.offset.rot.y > 0)) {
                            obj.setCoords(posobj.x + item.offset.pos.x, posobj.y + item.offset.pos.y, (posobj.z - obj.getHeightAboveGround()) + item.offset.pos.z, false, false, false, false);
                        } else {
                            obj.setCoords(posobj.x + item.offset.pos.x, posobj.y + item.offset.pos.y, posobj.z + item.offset.pos.z, false, false, false, false);
                        }
                        obj.setRotation(rotobj.x + item.offset.rot.x, rotobj.y + item.offset.rot.y, rotobj.z, 0, true);
                        self._pickupObjects.push({
                            id: self._lootData.id,
                            obj: obj
                        })
                    }
                }
            })
            console.log("mp.objects 1", mp.objects.length);
        }
    }
    unload(id) {
        let self = this;
        console.log("unload mp.objects2", mp.objects.length);
        clearInterval(self.interval);
        self._pickupObjects.forEach(function(item, i) {
            //if (item.id == id) {
                if (mp.objects.atHandle(item.obj.handle)) {
                    console.log("exists");
                    item.obj.markForDeletion();
                    item.obj.destroy();
                    delete self._pickupObjects[i];
                    console.log("removed");
                }
            //}
        })
        console.log("unload mp.objects3", mp.objects.length);
    }
}
mp.events.add("Loot:Load", (id, poolData) => {
    if (!streamedPools[id]) {
        streamedPools[id] = new LootPool(poolData);
    }
});


mp.events.add("playerExitColshape", (colshape) => {
    if (colshape.getVariable("item_colshape")) {
        let id = colshape.getVariable("item_colshape_id");
        if (streamedPools[id]) {
            console.log("unload clientside1");
            streamedPools[id].unload(id)
            delete streamedPools[id];
        }
    }
});
mp.events.add("Loot:Unload", (id) => {
    if (streamedPools[id]) {
        streamedPools[id].unload()
        delete streamedPools[id];
    }
});
mp.events.add("Loot:Reload", (id, new_data) => {
    if (streamedPools[id]) {
        streamedPools[id].reload(new_data);
    }
});

function pointingAt() {
    let ray_dist = 25;
    let direction = mp.gameplayCam.getDirection();
    let coords = mp.gameplayCam.getCoord();
    let farAway = new mp.Vector3((direction.x * ray_dist) + (coords.x), (direction.y * ray_dist) + (coords.y), (direction.z * ray_dist) + (coords.z));
    let result = mp.raycasting.testPointToPoint(coords, farAway, mp.players.local, -1);
    if (result === undefined) {
        return undefined;
    }
    return result;
}
let cStatus = "";
let cItem = 0;
let timer_anim;
let isOpening = 0;
mp.events.add("render", () => {
    /*Display Items*/
    let cur_selected = false;
    let cur_dist = 999;
    let pool_data = null;
    let pointAt = pointingAt();
    let Angle_Item = 360 / 8;
    Object.keys(streamedPools).forEach(function(key) {
        let pool = streamedPools[key]
        if (pool.isInRange() == true) {
            let pos = pool.position;
            pos.z += 1;
            pool.getLootPool().forEach(function(item, index) {
                if (item != null) {
                    let offset_pos = pos.findRot(0, 0.5, Angle_Item * index).ground();
                    let thickness = item.thickness //(mp.players.local.isRunning() == true) ? item.thickness * 2 : item.thickness;
                    mp.game.graphics.drawMarker(28, offset_pos.x, offset_pos.y, offset_pos.z, 0, 0, 0, 0, 0, 0, thickness, thickness, thickness, 255, 255, 255, 150, false, false, 2, false, "", "", false);
                    let player_pos = mp.vector(mp.localPlayer.position).ground();
                    let near_dist = thickness * 2.5;
                    let pointAtPos;
                    if ((pointAt) && (pointAt.position)) {
                        if (player_pos.dist2d(pointAt.position) < 2) {
                            pointAtPos = pointAt.position;
                        }
                    }
                    let dist;
                    if (((pointAtPos != undefined) && (offset_pos.dist(pointAtPos) <= thickness)) || (offset_pos.dist(player_pos) <= near_dist)) {
                        dist = ((pointAtPos != undefined) && (offset_pos.dist(pointAtPos) <= thickness)) ? offset_pos.dist(pointAtPos) : offset_pos.dist(player_pos);
                    }
                    if ((dist) && (cur_selected == false) && (dist < cur_dist)) {
                        item.position = offset_pos;
                        cur_selected = item;
                        cur_dist = dist //((pointAtPos != undefined) && (offset_pos.dist(pointAtPos) <= thickness)) ? offset_pos.dist(pointAtPos) : offset_pos.dist(player_pos);
                        pool_data = key;
                    }
                }
            })
        }
    });
    if ((cur_selected) && (pool_data)) {
        mp.game.controls.disableControlAction(0, 51, true);
        mp.game.ui.showHudComponentThisFrame(14);
        mp.game.graphics.drawText("[E] " + cur_selected.name, [0.5, 0.55], {
            font: 4,
            color: [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
        if ((cItem == cur_selected) && (cStatus != "")) {
            mp.game.graphics.drawText("\n[" + cStatus + "]", [0.5, 0.55], {
                font: 4,
                color: [255, 150, 150, 200],
                scale: [0.3, 0.3],
                outline: true,
                centre: true
            });
        } else {
            cStatus = "";
            cItem = cur_selected
        }
        if (mp.game.controls.isDisabledControlJustPressed(0, 51)) { // 51 == "E"
            //Loot:Pickup
            if (pool_data) {
                let name = cur_selected.name;
                let amount = cur_selected.amount;
                if (amount > 0) {
                    let doesFit = StorageSystem.checkFit("inventory", cur_selected.width, cur_selected.height)
                    doesFit.then(function(fit) {
                        if (fit != undefined) {
                            mp.events.callRemote("Loot:Pickup", pool_data, cur_selected.index, cur_selected.name, cur_selected.amount);
                            /*3d Notify*/
                            let pos = cur_selected.position;
                            Notifications.notify3D(pos.x, pos.y, pos.z, pos.x, pos.y, pos.z + 0.5, `+ ${cur_selected.name}`, [255, 255, 255]);
                            CEFNotification.call("notify", {
                                title: "Notification",
                                titleSize: "16px",
                                message: `${cur_selected.name} just got picked up`,
                                messageColor: 'rgba(50,50,50,.8)',
                                position: "topCenter",
                                backgroundColor: 'rgba(206, 206, 206, 0.9)',
                                close: false
                            })
                            if (timer_anim) {
                                clearTimeout(timer_anim);
                                mp.players.local.stopAnimTask("mp_take_money_mg", "stand_cash_in_bag_loop", 1.0);
                            }
                            mp.players.local.taskPlayAnim("mp_take_money_mg", "stand_cash_in_bag_loop", 16, 8.0, -1, 49, 0, false, false, false);
                            timer_anim = setTimeout(function() {
                                mp.players.local.stopAnimTask("mp_take_money_mg", "stand_cash_in_bag_loop", 1.0);
                            }, 250);
                        } else {
                            cStatus = "Not enough Space";
                        }
                    })
                }
            }
        }
    } else {
        cStatus = "";
        if ((pointAt) && (pointAt.entity)) {
            if (typeof pointAt.entity == "object") {
                if (mp.vector(mp.localPlayer.position).dist(pointAt.entity.getCoords(true)) < 3) {
                    if (pointAt.entity.getVariable("container") == true) {
                        if (pointAt.entity.getVariable("opened") == false) {
                            mp.game.ui.showHudComponentThisFrame(14);
                            mp.game.graphics.drawText("[E] Open", [0.5, 0.55], {
                                font: 4,
                                color: [255, 255, 255, 200],
                                scale: [0.3, 0.3],
                                outline: true,
                                centre: true
                            });
                            if (mp.game.controls.isDisabledControlJustPressed(0, 51)) { // 51 == "E"
                                let id = pointAt.entity.getVariable("id");
                                mp.events.callRemote("Building:Interact", id);
                            }
                        }
                    } else if (pointAt.entity.getVariable("interactable") == true) {
                        let openDur = pointAt.entity.getVariable("openDuration") || 2000;
                        mp.game.ui.showHudComponentThisFrame(14);
                        mp.game.graphics.drawText("[E] Open", [0.5, 0.55], {
                            font: 4,
                            color: [255, 255, 255, 200],
                            scale: [0.3, 0.3],
                            outline: true,
                            centre: true
                        });
                        if (mp.game.controls.isDisabledControlJustPressed(0, 51) && (isOpening == 0)) { // 51 == "E"
                            isOpening = Date.now();
                        }
                        if (isOpening != 0) {
                            if (mp.game.controls.isDisabledControlPressed(0, 51)) { // 51 == "E"
                                mp.game.graphics.drawRect(0.5, 0.525, 0.025, 0.0025, 0, 0, 0, 155);
                                let t = (Date.now() - isOpening);
                                t = (t < openDur) ? t : openDur;
                                let w = mp.lerp(0, 0.025, 1 / openDur * t);
                                mp.game.graphics.drawRect((0.5 - (0.025 / 2) + w / 2), 0.525, w, 0.0025, 255, 255, 255, 155);
                                if (t == openDur) {
                                    let e = pointAt.entity.getVariable("interact_event");
                                    isOpening = 0;
                                    if (e != "") {
                                        let id = pointAt.entity.getVariable("id");
                                        mp.events.callRemote(e, id);
                                    }
                                }
                            } else {
                                isOpening = 0;
                            }
                            //
                        }
                    }
                }
            } else {
                isOpening = 0;
            }
        }
    }
});
},{"./browser.js":1,"./natives.js":19,"./notifications.js":20,"./storage.js":29}],12:[function(require,module,exports){
var toLoad = ["mp_defend_base"]
var loadPromises = [];
toLoad.forEach(function(dict) {
	mp.game.streaming.requestAnimDict(dict);
	loadPromises.push(new Promise((resolve, reject) => {
		let timer = setInterval(() => {
			if (mp.game.streaming.hasAnimDictLoaded(dict)) {
				clearInterval(timer);
				resolve();
			}
		}, 100);
	}));
})
Promise.all(loadPromises).then(() => {
	//console.log("all dicts loaded")
}).catch(err => {
	console.log("all dicts err", err)
})
},{}],13:[function(require,module,exports){
mp.attachmentMngr = 
{
	attachments: {},
	
	addFor: function(entity, id)
	{
		if(this.attachments.hasOwnProperty(id))
		{
			if(!entity.__attachmentObjects.hasOwnProperty(id))
			{
				let attInfo = this.attachments[id];
				
				let object = mp.objects.new(attInfo.model, entity.position);
				
				object.attachTo(entity.handle,
					(typeof(attInfo.boneName) === 'string') ? entity.getBoneIndexByName(attInfo.boneName) : entity.getBoneIndex(attInfo.boneName),
					attInfo.offset.x, attInfo.offset.y, attInfo.offset.z, 
					attInfo.rotation.x, attInfo.rotation.y, attInfo.rotation.z, 
					false, false, false, false, 2, true);
					
				entity.__attachmentObjects[id] = object;
			}
		}
		else
		{
			mp.game.graphics.notify(`Static Attachments Error: ~r~Unknown Attachment Used: ~w~0x${id.toString(16)}`);
		}
	},
	
	removeFor: function(entity, id)
	{
		if(entity.__attachmentObjects.hasOwnProperty(id))
		{
			let obj = entity.__attachmentObjects[id];
			delete entity.__attachmentObjects[id];
			
			if(mp.objects.exists(obj))
			{
				obj.destroy();
			}
		}
	},
	
	initFor: function(entity)
	{
		for(let attachment of entity.__attachments)
		{
			mp.attachmentMngr.addFor(entity, attachment);
		}
	},
	
	shutdownFor: function(entity)
	{
		for(let attachment in entity.__attachmentObjects)
		{
			mp.attachmentMngr.removeFor(entity, attachment);
		}
	},
	
	register: function(id, model, boneName, offset, rotation)
	{
		if(typeof(id) === 'string')
		{
			id = mp.game.joaat(id);
		}
		//console.log("register attachment id",id);
		if(typeof(model) === 'string')
		{
			model = mp.game.joaat(model);
		}
		
		if(!this.attachments.hasOwnProperty(id))
		{
			if(mp.game.streaming.isModelInCdimage(model))
			{
				this.attachments[id] =
				{
					id: id,
					model: model,
					offset: offset,
					rotation: rotation,
					boneName: boneName
				};
			}
			else
			{
				mp.game.graphics.notify(`Static Attachments Error: ~r~Invalid Model (0x${model.toString(16)})`);
			}
		}
		else
		{
			mp.game.graphics.notify("Static Attachments Error: ~r~Duplicate Entry");
		}
	},
	
	unregister: function(id) 
	{
		if(typeof(id) === 'string')
		{
			id = mp.game.joaat(id);
		}
		
		if(this.attachments.hasOwnProperty(id))
		{
			this.attachments[id] = undefined;
		}
	},
	
	addLocal: function(attachmentName)
	{
		if(typeof(attachmentName) === 'string')
		{
			attachmentName = mp.game.joaat(attachmentName);
		}
		
		let entity = mp.players.local;
		
		if(!entity.__attachments || entity.__attachments.indexOf(attachmentName) === -1)
		{
			mp.events.callRemote("staticAttachments.Add", attachmentName.toString(36));
		}
	},
	
	removeLocal: function(attachmentName)
	{
		if(typeof(attachmentName) === 'string')
		{
			attachmentName = mp.game.joaat(attachmentName);
		}
		
		let entity = mp.players.local;
		
		if(entity.__attachments && entity.__attachments.indexOf(attachmentName) !== -1)
		{
			mp.events.callRemote("staticAttachments.Remove", attachmentName.toString(36));
		}
	},
	
	getAttachments: function()
	{
		return Object.assign({}, this.attachments);
	}
};

mp.events.add("entityStreamIn", (entity) =>
{
	if(entity.__attachments)
	{
		mp.attachmentMngr.initFor(entity);
	}
});

mp.events.add("entityStreamOut", (entity) =>
{
	if(entity.__attachmentObjects)
	{
		mp.attachmentMngr.shutdownFor(entity);
	}
});

mp.events.addDataHandler("attachmentsData", (entity, data) =>
{
	let newAttachments = (data.length > 0) ? data.split('|').map(att => parseInt(att, 36)) : [];
	console.log(JSON.stringify(newAttachments));
	if(entity.handle !== 0)
	{
		let oldAttachments = entity.__attachments;	
		
		if(!oldAttachments)
		{
			oldAttachments = [];
			entity.__attachmentObjects = {};
		}
		
		// process outdated first
		for(let attachment of oldAttachments)
		{
			if(newAttachments.indexOf(attachment) === -1)
			{
				mp.attachmentMngr.removeFor(entity, attachment);
			}
		}
		
		// then new attachments
		for(let attachment of newAttachments)
		{
			if(oldAttachments.indexOf(attachment) === -1)
			{
				mp.attachmentMngr.addFor(entity, attachment);
			}
		}
	}
	
	entity.__attachments = newAttachments;
});

function InitAttachmentsOnJoin()
{
	mp.players.forEach(_player =>
	{
		let data = _player.getVariable("attachmentsData");
		
		if(data && data.length > 0)
		{
			let atts = data.split('|').map(att => parseInt(att, 36));
			_player.__attachments = atts;
			_player.__attachmentObjects = {};
		}
	});
}

InitAttachmentsOnJoin();
},{}],14:[function(require,module,exports){
!function(e,r){"object"==typeof exports&&"object"==typeof module?module.exports=r():"function"==typeof define&&define.amd?define([],r):"object"==typeof exports?exports=r():e.rpc=r()}("undefined"!=typeof self?self:this,function(){return function(e){var r={};function n(t){if(r[t])return r[t].exports;var c=r[t]={i:t,l:!1,exports:{}};return e[t].call(c.exports,c,c.exports,n),c.l=!0,c.exports}return n.m=e,n.c=r,n.d=function(e,r,t){n.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:t})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,r){if(1&r&&(e=n(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(n.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var c in e)n.d(t,c,function(r){return e[r]}.bind(null,c));return t},n.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(r,"a",r),r},n.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},n.p="",n(n.s=1)}([function(e,r,n){"use strict";var t;function c(e,r){const n="client"===o();if(e&&"object"==typeof e&&void 0!==e.id){const c=(r,t,c)=>n?e.type===r&&t.at(e.id)===e:e instanceof c;switch(r){case t.Blip:return c("blip",mp.blips,mp.Blip);case t.Checkpoint:return c("checkpoint",mp.checkpoints,mp.Checkpoint);case t.Colshape:return c("colshape",mp.colshapes,mp.Colshape);case t.Label:return c("textlabel",mp.labels,mp.TextLabel);case t.Marker:return c("marker",mp.markers,mp.Marker);case t.Object:return c("object",mp.objects,mp.Object);case t.Pickup:return c("pickup",mp.pickups,mp.Pickup);case t.Player:return c("player",mp.players,mp.Player);case t.Vehicle:return c("vehicle",mp.vehicles,mp.Vehicle)}}return!1}function s(){const e=46656*Math.random()|0,r=46656*Math.random()|0;return("000"+e.toString(36)).slice(-3)+("000"+r.toString(36)).slice(-3)}function o(){return mp.joaat?"server":mp.game&&mp.game.joaat?"client":mp.trigger?"cef":void 0}function i(e){const r=o();return JSON.stringify(e,(e,n)=>{if("client"===r||"server"===r&&n&&"object"==typeof n){let e;if(c(n,t.Blip)?e=t.Blip:c(n,t.Checkpoint)?e=t.Checkpoint:c(n,t.Colshape)?e=t.Colshape:c(n,t.Marker)?e=t.Marker:c(n,t.Object)?e=t.Object:c(n,t.Pickup)?e=t.Pickup:c(n,t.Player)?e=t.Player:c(n,t.Vehicle)&&(e=t.Vehicle),e)return{__t:e,i:n.remoteId||n.id}}return n})}function a(e){const r=o();return JSON.parse(e,(e,n)=>{if(("client"===r||"server"===r)&&n&&"object"==typeof n&&"string"==typeof n.__t&&"number"==typeof n.i&&2===Object.keys(n).length){const e=n.i;let c;switch(n.__t){case t.Blip:c=mp.blips;break;case t.Checkpoint:c=mp.checkpoints;break;case t.Colshape:c=mp.colshapes;break;case t.Label:c=mp.labels;break;case t.Marker:c=mp.markers;break;case t.Object:c=mp.objects;break;case t.Pickup:c=mp.pickups;break;case t.Player:c=mp.players;break;case t.Vehicle:c=mp.vehicles}if(c)return c["client"===r?"atRemoteId":"at"](e)}return n})}function l(e){return new Promise(r=>setTimeout(()=>r(e),0))}function p(e){return new Promise((r,n)=>setTimeout(()=>n(e),0))}function u(e){try{e.url}catch(e){return!1}return!0}n.d(r,"g",function(){return s}),n.d(r,"a",function(){return o}),n.d(r,"f",function(){return i}),n.d(r,"c",function(){return a}),n.d(r,"e",function(){return l}),n.d(r,"d",function(){return p}),n.d(r,"b",function(){return u}),function(e){e.Blip="b",e.Checkpoint="cp",e.Colshape="c",e.Label="l",e.Marker="m",e.Object="o",e.Pickup="p",e.Player="pl",e.Vehicle="v"}(t||(t={}))},function(e,r,n){"use strict";n.r(r),function(e){n.d(r,"register",function(){return d}),n.d(r,"unregister",function(){return m}),n.d(r,"call",function(){return g}),n.d(r,"callServer",function(){return _}),n.d(r,"callClient",function(){return b}),n.d(r,"callBrowsers",function(){return y}),n.d(r,"callBrowser",function(){return k});var t=n(0);const c=t.a();if(!c)throw"Unknown RAGE environment";const s="PROCEDURE_NOT_FOUND",o="__rpc:id",i="__rpc:process",a="__rpc:browserRegister",l="__rpc:browserUnregister",p="cef"===c?window:e;if(!p[i])if(p.__rpcListeners={},p.__rpcPending={},p[i]=((e,r)=>{"server"!==c&&(r=e);const n=t.c(r);if(n.req){const r={id:n.id,environment:n.fenv||n.env};"server"===c&&(r.player=e);const s={ret:1,id:n.id,env:c};let o;switch(c){case"server":o=(e=>r.player.call(i,[t.f(e)]));break;case"client":if("server"===n.env)o=(e=>mp.events.callRemote(i,t.f(e)));else if("cef"===n.env){const e=n.b&&p.__rpcBrowsers[n.b];r.browser=e,o=(r=>e&&t.b(e)&&u(e,r,!0))}break;case"cef":o=(e=>mp.trigger(i,t.f(e)))}o&&f(n.name,n.args,r).then(e=>o({...s,res:e})).catch(e=>o({...s,err:e}))}else if(n.ret){const r=p.__rpcPending[n.id];if("server"===c&&r.player!==e)return;r&&(r.resolve(n.err?t.d(n.err):t.e(n.res)),delete p.__rpcPending[n.id])}}),"cef"!==c){if(mp.events.add(i,p[i]),"client"===c){d("__rpc:callServer",([e,r],n)=>h(e,r,{fenv:n.environment})),d("__rpc:callBrowsers",([e,r],n)=>w(null,e,r,{fenv:n.environment})),p.__rpcBrowsers={};const e=e=>{const r=t.g();Object.keys(p.__rpcBrowsers).forEach(r=>{const n=p.__rpcBrowsers[r];n&&t.b(n)&&n!==e||delete p.__rpcBrowsers[r]}),p.__rpcBrowsers[r]=e,e.execute(`if(typeof window['${o}'] === 'undefined'){ window['${o}'] = Promise.resolve('${r}'); }else{ window['${o}:resolve']('${r}'); }`)};mp.browsers.forEach(e),mp.events.add("browserCreated",e),p.__rpcBrowserProcedures={},mp.events.add(a,e=>{const[r,n]=JSON.parse(e);p.__rpcBrowserProcedures[n]=r}),mp.events.add(l,e=>{const[r,n]=JSON.parse(e);p.__rpcBrowserProcedures[n]===r&&delete p.__rpcBrowserProcedures[n]})}}else void 0===p[o]&&(p[o]=new Promise(e=>{p[o+":resolve"]=e}));function u(e,r,n){const c=t.f(r);e.execute(`var process = window["${i}"]; if(process){ process(${JSON.stringify(c)}); }else{ ${n?"":`mp.trigger("${i}", '{"ret":1,"id":"${r.id}","err":"${s}","env":"cef"}');`} }`)}function f(e,r,n){const c=p.__rpcListeners[e];return c?t.e(c(r,n)):t.d(s)}function d(e,r){if(2!==arguments.length)throw'register expects 2 arguments: "name" and "cb"';"cef"===c&&p[o].then(r=>mp.trigger(a,JSON.stringify([r,e]))),p.__rpcListeners[e]=r}function m(e){if(1!==arguments.length)throw'unregister expects 1 argument: "name"';"cef"===c&&p[o].then(r=>mp.trigger(l,JSON.stringify([r,e]))),p.__rpcListeners[e]=void 0}function g(e,r){return 1!==arguments.length&&2!==arguments.length?t.d('call expects 1 or 2 arguments: "name" and optional "args"'):f(e,r,{environment:c})}function h(e,r,n={}){switch(c){case"server":return g(e,r);case"client":{const s=t.g();return new Promise(o=>{p.__rpcPending[s]={resolve:o};const a={req:1,id:s,name:e,env:c,args:r,...n};mp.events.callRemote(i,t.f(a))})}case"cef":return b("__rpc:callServer",[e,r])}}function _(e,r){return 1!==arguments.length&&2!==arguments.length?t.d('callServer expects 1 or 2 arguments: "name" and optional "args"'):h(e,r,{})}function b(e,r,n){switch(c){case"client":return n=r,r=e,1!==arguments.length&&2!==arguments.length||"string"!=typeof r?t.d('callClient from the client expects 1 or 2 arguments: "name" and optional "args"'):g(r,n);case"server":{if(2!==arguments.length&&3!==arguments.length||"object"!=typeof e)return t.d('callClient from the server expects 2 or 3 arguments: "player", "name", and optional "args"');const s=t.g();return new Promise(o=>{p.__rpcPending[s]={resolve:o,player:e};const a={req:1,id:s,name:r,env:c,args:n};e.call(i,[t.f(a)])})}case"cef":{if(n=r,r=e,1!==arguments.length&&2!==arguments.length||"string"!=typeof r)return t.d('callClient from the browser expects 1 or 2 arguments: "name" and optional "args"');const s=t.g();return p[o].then(e=>new Promise(o=>{p.__rpcPending[s]={resolve:o};const a={b:e,req:1,id:s,name:r,env:c,args:n};mp.trigger(i,t.f(a))}))}}}function v(e,r,n,t,s={}){return new Promise(o=>{p.__rpcPending[e]={resolve:o},u(r,{req:1,id:e,name:n,env:c,args:t,...s},!1)})}function w(e,r,n,o={}){switch(c){case"client":const i=t.g(),a=p.__rpcBrowserProcedures[r];if(!a)return t.d(s);const l=p.__rpcBrowsers[a];return l&&t.b(l)?v(i,l,r,n,o):t.d(s);case"server":return b(e,"__rpc:callBrowsers",[r,n]);case"cef":return b("__rpc:callBrowsers",[r,n])}}function y(e,r,n){switch(c){case"client":case"cef":return 1!==arguments.length&&2!==arguments.length?t.d('callBrowsers from the client or browser expects 1 or 2 arguments: "name" and optional "args"'):w(null,e,r,{});case"server":return 2!==arguments.length&&3!==arguments.length?t.d('callBrowsers from the server expects 2 or 3 arguments: "player", "name", and optional "args"'):w(e,r,n,{})}}function k(e,r,n){if("client"!==c)return t.d("callBrowser can only be used in the client environment");if(2!==arguments.length&&3!==arguments.length)return t.d('callBrowser expects 2 or 3 arguments: "browser", "name", and optional "args"');return v(t.g(),e,r,n,{})}}.call(this,n(2))},function(e,r){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(e){"object"==typeof window&&(n=window)}e.exports=n}])});
},{}],15:[function(require,module,exports){
module.exports={
  "2725352035": {
    "HashKey": "WEAPON_UNARMED",
    "NameGXT": "WT_UNARMED",
    "DescriptionGXT": "WTD_UNARMED",
    "Name": "Unarmed",
    "Description": "",
    "Group": "GROUP_UNARMED",
    "ModelHashKey": "",
    "DefaultClipSize": 0,
    "Components": {},
    "Tints": [],
    "DLC": "core"
  },
  "2578778090": {
    "HashKey": "WEAPON_KNIFE",
    "NameGXT": "WT_KNIFE",
    "DescriptionGXT": "WTD_KNIFE",
    "Name": "Knife",
    "Description": "This carbon steel 7\" bladed knife is dual edged with a serrated spine to provide improved stabbing and thrusting capabilities.",
    "Group": "GROUP_MELEE",
    "ModelHashKey": "w_me_knife_01",
    "DefaultClipSize": 0,
    "Components": {},
    "Tints": [],
    "DLC": "core"
  },
  "1737195953": {
    "HashKey": "WEAPON_NIGHTSTICK",
    "NameGXT": "WT_NGTSTK",
    "DescriptionGXT": "WTD_NGTSTK",
    "Name": "Nightstick",
    "Description": "24\" polycarbonate side-handled nightstick.",
    "Group": "GROUP_MELEE",
    "ModelHashKey": "w_me_nightstick",
    "DefaultClipSize": 0,
    "Components": {},
    "Tints": [],
    "DLC": "core"
  },
  "1317494643": {
    "HashKey": "WEAPON_HAMMER",
    "NameGXT": "WT_HAMMER",
    "DescriptionGXT": "WTD_HAMMER",
    "Name": "Hammer",
    "Description": "A robust, multi-purpose hammer with wooden handle and curved claw, this old classic still nails the competition.",
    "Group": "GROUP_MELEE",
    "ModelHashKey": "w_me_hammer",
    "DefaultClipSize": 0,
    "Components": {},
    "Tints": [],
    "DLC": "core"
  },
  "2508868239": {
    "HashKey": "WEAPON_BAT",
    "NameGXT": "WT_BAT",
    "DescriptionGXT": "WTD_BAT",
    "Name": "Baseball Bat",
    "Description": "Aluminum baseball bat with leather grip. Lightweight yet powerful for all you big hitters out there.",
    "Group": "GROUP_MELEE",
    "ModelHashKey": "w_me_bat",
    "DefaultClipSize": 0,
    "Components": {},
    "Tints": [],
    "DLC": "core"
  },
  "1141786504": {
    "HashKey": "WEAPON_GOLFCLUB",
    "NameGXT": "WT_GOLFCLUB",
    "DescriptionGXT": "WTD_GOLFCLUB",
    "Name": "Golf Club",
    "Description": "Standard length, mid iron golf club with rubber grip for a lethal short game.",
    "Group": "GROUP_MELEE",
    "ModelHashKey": "w_me_gclub",
    "DefaultClipSize": 0,
    "Components": {},
    "Tints": [],
    "DLC": "core"
  },
  "2227010557": {
    "HashKey": "WEAPON_CROWBAR",
    "NameGXT": "WT_CROWBAR",
    "DescriptionGXT": "WTD_CROWBAR",
    "Name": "Crowbar",
    "Description": "Heavy-duty crowbar forged from high quality, tempered steel for that extra leverage you need to get the job done.",
    "Group": "GROUP_MELEE",
    "ModelHashKey": "w_me_crowbar",
    "DefaultClipSize": 0,
    "Components": {},
    "Tints": [],
    "DLC": "core"
  },
  "453432689": {
    "HashKey": "WEAPON_PISTOL",
    "NameGXT": "WT_PIST",
    "DescriptionGXT": "WT_PIST_DESC",
    "Name": "Pistol",
    "Description": "Standard handgun. A .45 caliber pistol with a magazine capacity of 12 rounds that can be extended to 16.",
    "Group": "GROUP_PISTOL",
    "ModelHashKey": "W_PI_PISTOL",
    "DefaultClipSize": 12,
    "Components": {
      "4275109233": {
        "HashKey": "COMPONENT_PISTOL_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_P_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Pistol.",
        "ModelHashKey": "w_pi_pistol_mag1",
        "IsDefault": true
      },
      "3978713628": {
        "HashKey": "COMPONENT_PISTOL_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_P_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Pistol.",
        "ModelHashKey": "w_pi_pistol_mag2",
        "IsDefault": false
      },
      "899381934": {
        "HashKey": "COMPONENT_AT_PI_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_pi_flsh",
        "IsDefault": false
      },
      "1709866683": {
        "HashKey": "COMPONENT_AT_PI_SUPP_02",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_PI_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_pi_supp_2",
        "IsDefault": false
      },
      "3610841222": {
        "HashKey": "COMPONENT_PISTOL_VARMOD_LUXE",
        "NameGXT": "WCT_VAR_GOLD",
        "DescriptionGXT": "WCD_VAR_P",
        "Name": "Yusuf Amir Luxury Finish",
        "Description": "",
        "ModelHashKey": "W_PI_Pistol_Luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "1593441988": {
    "HashKey": "WEAPON_COMBATPISTOL",
    "NameGXT": "WT_PIST_CBT",
    "DescriptionGXT": "WTD_PIST_CBT",
    "Name": "Combat Pistol",
    "Description": "A compact, lightweight, semi-automatic pistol designed for law enforcement and personal defense. 12-round magazine with option to extend to 16 rounds.",
    "Group": "GROUP_PISTOL",
    "ModelHashKey": "W_PI_COMBATPISTOL",
    "DefaultClipSize": 12,
    "Components": {
      "119648377": {
        "HashKey": "COMPONENT_COMBATPISTOL_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_CP_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Combat Pistol.",
        "ModelHashKey": "w_pi_combatpistol_mag1",
        "IsDefault": true
      },
      "3598405421": {
        "HashKey": "COMPONENT_COMBATPISTOL_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_CP_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Combat Pistol.",
        "ModelHashKey": "w_pi_combatpistol_mag2",
        "IsDefault": false
      },
      "899381934": {
        "HashKey": "COMPONENT_AT_PI_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_pi_flsh",
        "IsDefault": false
      },
      "3271853210": {
        "HashKey": "COMPONENT_AT_PI_SUPP",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_PI_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_pi_supp",
        "IsDefault": false
      },
      "3328527730": {
        "HashKey": "COMPONENT_COMBATPISTOL_VARMOD_LOWRIDER",
        "NameGXT": "WCT_VAR_GOLD",
        "DescriptionGXT": "WCD_VAR_CBP",
        "Name": "Yusuf Amir Luxury Finish",
        "Description": "",
        "ModelHashKey": "w_pi_combatpistol_luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "584646201": {
    "HashKey": "WEAPON_APPISTOL",
    "NameGXT": "WT_PIST_AP",
    "DescriptionGXT": "WTD_PIST_AP",
    "Name": "AP Pistol",
    "Description": "High-penetration, fully-automatic pistol. Holds 18 rounds in magazine with option to extend to 36 rounds.",
    "Group": "GROUP_PISTOL",
    "ModelHashKey": "W_PI_APPISTOL",
    "DefaultClipSize": 18,
    "Components": {
      "834974250": {
        "HashKey": "COMPONENT_APPISTOL_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_AP_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for AP Pistol.",
        "ModelHashKey": "w_pi_appistol_mag1",
        "IsDefault": true
      },
      "614078421": {
        "HashKey": "COMPONENT_APPISTOL_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_AP_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for AP Pistol.",
        "ModelHashKey": "w_pi_appistol_mag2",
        "IsDefault": false
      },
      "899381934": {
        "HashKey": "COMPONENT_AT_PI_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_pi_flsh",
        "IsDefault": false
      },
      "3271853210": {
        "HashKey": "COMPONENT_AT_PI_SUPP",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_PI_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_pi_supp",
        "IsDefault": false
      },
      "2608252716": {
        "HashKey": "COMPONENT_APPISTOL_VARMOD_LUXE",
        "NameGXT": "WCT_VAR_METAL",
        "DescriptionGXT": "WCD_VAR_AP",
        "Name": "Gilded Gun Metal Finish",
        "Description": "",
        "ModelHashKey": "W_PI_APPistol_Luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "2578377531": {
    "HashKey": "WEAPON_PISTOL50",
    "NameGXT": "WT_PIST_50",
    "DescriptionGXT": "WTD_PIST_50",
    "Name": "Pistol .50",
    "Description": "High-impact pistol that delivers immense power but with extremely strong recoil. Holds 9 rounds in magazine.",
    "Group": "GROUP_PISTOL",
    "ModelHashKey": "W_PI_PISTOL50",
    "DefaultClipSize": 9,
    "Components": {
      "580369945": {
        "HashKey": "COMPONENT_PISTOL50_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_P50_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Pistol .50.",
        "ModelHashKey": "W_PI_PISTOL50_Mag1",
        "IsDefault": true
      },
      "3654528146": {
        "HashKey": "COMPONENT_PISTOL50_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_P50_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Pistol .50.",
        "ModelHashKey": "W_PI_PISTOL50_Mag2",
        "IsDefault": false
      },
      "899381934": {
        "HashKey": "COMPONENT_AT_PI_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_pi_flsh",
        "IsDefault": false
      },
      "2805810788": {
        "HashKey": "COMPONENT_AT_AR_SUPP_02",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_AR_SUPP2",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_ar_supp_02",
        "IsDefault": false
      },
      "2008591151": {
        "HashKey": "COMPONENT_PISTOL50_VARMOD_LUXE",
        "NameGXT": "WCT_VAR_SIL",
        "DescriptionGXT": "WCD_VAR_P50",
        "Name": "Platinum Pearl Deluxe Finish",
        "Description": "",
        "ModelHashKey": "W_PI_Pistol50_Luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "324215364": {
    "HashKey": "WEAPON_MICROSMG",
    "NameGXT": "WT_SMG_MCR",
    "DescriptionGXT": "WTD_SMG_MCR",
    "Name": "Micro SMG",
    "Description": "Combines compact design with a high rate of fire at approximately 700-900 rounds per minute.",
    "Group": "GROUP_SMG",
    "ModelHashKey": "w_sb_microsmg",
    "DefaultClipSize": 16,
    "Components": {
      "3410538224": {
        "HashKey": "COMPONENT_MICROSMG_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCDMSMG_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Micro SMG.",
        "ModelHashKey": "w_sb_microsmg_mag1",
        "IsDefault": true
      },
      "283556395": {
        "HashKey": "COMPONENT_MICROSMG_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCDMSMG_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Micro SMG.",
        "ModelHashKey": "w_sb_microsmg_mag2",
        "IsDefault": false
      },
      "899381934": {
        "HashKey": "COMPONENT_AT_PI_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_pi_flsh",
        "IsDefault": false
      },
      "2637152041": {
        "HashKey": "COMPONENT_AT_SCOPE_MACRO",
        "NameGXT": "WCT_SCOPE_MAC",
        "DescriptionGXT": "WCD_SCOPE_MAC",
        "Name": "Scope",
        "Description": "Standard-range zoom functionality.",
        "ModelHashKey": "w_at_scope_macro",
        "IsDefault": false
      },
      "2805810788": {
        "HashKey": "COMPONENT_AT_AR_SUPP_02",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_AR_SUPP2",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_ar_supp_02",
        "IsDefault": false
      },
      "1215999497": {
        "HashKey": "COMPONENT_MICROSMG_VARMOD_LUXE",
        "NameGXT": "WCT_VAR_GOLD",
        "DescriptionGXT": "WCD_VAR_MSMG",
        "Name": "Yusuf Amir Luxury Finish",
        "Description": "",
        "ModelHashKey": "W_SB_MicroSMG_Luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "736523883": {
    "HashKey": "WEAPON_SMG",
    "NameGXT": "WT_SMG",
    "DescriptionGXT": "WTD_SMG",
    "Name": "SMG",
    "Description": "This is known as a good all-round submachine gun. Lightweight with an accurate sight and 30-round magazine capacity.",
    "Group": "GROUP_SMG",
    "ModelHashKey": "w_sb_smg",
    "DefaultClipSize": 30,
    "Components": {
      "643254679": {
        "HashKey": "COMPONENT_SMG_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_SMG_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for SMG.",
        "ModelHashKey": "w_sb_smg_mag1",
        "IsDefault": true
      },
      "889808635": {
        "HashKey": "COMPONENT_SMG_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_SMG_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for SMG.",
        "ModelHashKey": "w_sb_smg_mag2",
        "IsDefault": false
      },
      "2043113590": {
        "HashKey": "COMPONENT_SMG_CLIP_03",
        "NameGXT": "WCT_CLIP_DRM",
        "DescriptionGXT": "WCD_CLIP3",
        "Name": "Drum Magazine",
        "Description": "Expanded capacity and slower reload.",
        "ModelHashKey": "w_sb_smg_boxmag",
        "IsDefault": false
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "1019656791": {
        "HashKey": "COMPONENT_AT_SCOPE_MACRO_02",
        "NameGXT": "WCT_SCOPE_MAC",
        "DescriptionGXT": "WCD_SCOPE_MAC",
        "Name": "Scope",
        "Description": "Standard-range zoom functionality.",
        "ModelHashKey": "w_at_scope_macro_2",
        "IsDefault": false
      },
      "3271853210": {
        "HashKey": "COMPONENT_AT_PI_SUPP",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_PI_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_pi_supp",
        "IsDefault": false
      },
      "663170192": {
        "HashKey": "COMPONENT_SMG_VARMOD_LUXE",
        "NameGXT": "WCT_VAR_GOLD",
        "DescriptionGXT": "WCD_VAR_SMG",
        "Name": "Yusuf Amir Luxury Finish",
        "Description": "",
        "ModelHashKey": "W_SB_SMG_Luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "4024951519": {
    "HashKey": "WEAPON_ASSAULTSMG",
    "NameGXT": "WT_SMG_ASL",
    "DescriptionGXT": "WTD_SMG_ASL",
    "Name": "Assault SMG",
    "Description": "A high-capacity submachine gun that is both compact and lightweight. Holds up to 30 bullets in one magazine.",
    "Group": "GROUP_SMG",
    "ModelHashKey": "w_sb_assaultsmg",
    "DefaultClipSize": 30,
    "Components": {
      "2366834608": {
        "HashKey": "COMPONENT_ASSAULTSMG_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Default Clip",
        "Description": "",
        "ModelHashKey": "W_SB_ASSAULTSMG_Mag1",
        "IsDefault": true
      },
      "3141985303": {
        "HashKey": "COMPONENT_ASSAULTSMG_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Extended Clip",
        "Description": "",
        "ModelHashKey": "W_SB_ASSAULTSMG_Mag2",
        "IsDefault": false
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "2637152041": {
        "HashKey": "COMPONENT_AT_SCOPE_MACRO",
        "NameGXT": "WCT_SCOPE_MAC",
        "DescriptionGXT": "WCD_SCOPE_MAC",
        "Name": "Scope",
        "Description": "Standard-range zoom functionality.",
        "ModelHashKey": "w_at_scope_macro",
        "IsDefault": false
      },
      "2805810788": {
        "HashKey": "COMPONENT_AT_AR_SUPP_02",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_AR_SUPP2",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_ar_supp_02",
        "IsDefault": false
      },
      "663517359": {
        "HashKey": "COMPONENT_ASSAULTSMG_VARMOD_LOWRIDER",
        "NameGXT": "WCT_VAR_GOLD",
        "DescriptionGXT": "WCD_VAR_ASMG",
        "Name": "Yusuf Amir Luxury Finish",
        "Description": "",
        "ModelHashKey": "w_sb_assaultsmg_luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "3220176749": {
    "HashKey": "WEAPON_ASSAULTRIFLE",
    "NameGXT": "WT_RIFLE_ASL",
    "DescriptionGXT": "WTD_RIFLE_ASL",
    "Name": "Assault Rifle",
    "Description": "This standard assault rifle boasts a large capacity magazine and long distance accuracy.",
    "Group": "GROUP_RIFLE",
    "ModelHashKey": "W_AR_ASSAULTRIFLE",
    "DefaultClipSize": 30,
    "Components": {
      "3193891350": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_AR_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Assault Rifle.",
        "ModelHashKey": "w_ar_assaultrifle_mag1",
        "IsDefault": true
      },
      "2971750299": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_AR_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Assault Rifle.",
        "ModelHashKey": "w_ar_assaultrifle_mag2",
        "IsDefault": false
      },
      "3689981245": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_CLIP_03",
        "NameGXT": "WCT_CLIP_DRM",
        "DescriptionGXT": "WCD_CLIP3",
        "Name": "Drum Magazine",
        "Description": "Expanded capacity and slower reload.",
        "ModelHashKey": "w_ar_assaultrifle_boxmag",
        "IsDefault": false
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "2637152041": {
        "HashKey": "COMPONENT_AT_SCOPE_MACRO",
        "NameGXT": "WCT_SCOPE_MAC",
        "DescriptionGXT": "WCD_SCOPE_MAC",
        "Name": "Scope",
        "Description": "Standard-range zoom functionality.",
        "ModelHashKey": "w_at_scope_macro",
        "IsDefault": false
      },
      "2805810788": {
        "HashKey": "COMPONENT_AT_AR_SUPP_02",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_AR_SUPP2",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_ar_supp_02",
        "IsDefault": false
      },
      "202788691": {
        "HashKey": "COMPONENT_AT_AR_AFGRIP",
        "NameGXT": "WCT_GRIP",
        "DescriptionGXT": "WCD_GRIP",
        "Name": "Grip",
        "Description": "Improves weapon accuracy.",
        "ModelHashKey": "w_at_ar_afgrip",
        "IsDefault": false
      },
      "1319990579": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_VARMOD_LUXE",
        "NameGXT": "WCT_VAR_GOLD",
        "DescriptionGXT": "WCD_VAR_AR",
        "Name": "Yusuf Amir Luxury Finish",
        "Description": "",
        "ModelHashKey": "W_AR_AssaultRifle_Luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "2210333304": {
    "HashKey": "WEAPON_CARBINERIFLE",
    "NameGXT": "WT_RIFLE_CBN",
    "DescriptionGXT": "WTD_RIFLE_CBN",
    "Name": "Carbine Rifle",
    "Description": "Combining long distance accuracy with a high-capacity magazine, the carbine rifle can be relied on to make the hit.",
    "Group": "GROUP_RIFLE",
    "ModelHashKey": "W_AR_CARBINERIFLE",
    "DefaultClipSize": 30,
    "Components": {
      "2680042476": {
        "HashKey": "COMPONENT_CARBINERIFLE_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_CR_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Carbine Rifle.",
        "ModelHashKey": "w_ar_carbinerifle_mag1",
        "IsDefault": true
      },
      "2433783441": {
        "HashKey": "COMPONENT_CARBINERIFLE_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_CR_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Carbine Rifle.",
        "ModelHashKey": "w_ar_carbinerifle_mag2",
        "IsDefault": false
      },
      "3127044405": {
        "HashKey": "COMPONENT_CARBINERIFLE_CLIP_03",
        "NameGXT": "WCT_CLIP_BOX",
        "DescriptionGXT": "WCD_CLIP3",
        "Name": "Box Magazine",
        "Description": "Expanded capacity and slower reload.",
        "ModelHashKey": "w_ar_carbinerifle_boxmag",
        "IsDefault": false
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "1967214384": {
        "HashKey": "COMPONENT_AT_RAILCOVER_01",
        "NameGXT": "WCT_RAIL",
        "DescriptionGXT": "WCD_AT_RAIL",
        "Name": "",
        "Description": "",
        "ModelHashKey": "w_at_railcover_01",
        "IsDefault": false
      },
      "2698550338": {
        "HashKey": "COMPONENT_AT_SCOPE_MEDIUM",
        "NameGXT": "WCT_SCOPE_MED",
        "DescriptionGXT": "WCD_SCOPE_MED",
        "Name": "Scope",
        "Description": "Extended-range zoom functionality.",
        "ModelHashKey": "w_at_scope_medium",
        "IsDefault": false
      },
      "2205435306": {
        "HashKey": "COMPONENT_AT_AR_SUPP",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_AR_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_ar_supp",
        "IsDefault": false
      },
      "202788691": {
        "HashKey": "COMPONENT_AT_AR_AFGRIP",
        "NameGXT": "WCT_GRIP",
        "DescriptionGXT": "WCD_GRIP",
        "Name": "Grip",
        "Description": "Improves weapon accuracy.",
        "ModelHashKey": "w_at_ar_afgrip",
        "IsDefault": false
      },
      "3634075224": {
        "HashKey": "COMPONENT_CARBINERIFLE_VARMOD_LUXE",
        "NameGXT": "WCT_VAR_GOLD",
        "DescriptionGXT": "WCD_VAR_CR",
        "Name": "Yusuf Amir Luxury Finish",
        "Description": "",
        "ModelHashKey": "W_AR_CarbineRifle_Luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "2937143193": {
    "HashKey": "WEAPON_ADVANCEDRIFLE",
    "NameGXT": "WT_RIFLE_ADV",
    "DescriptionGXT": "WTD_RIFLE_ADV",
    "Name": "Advanced Rifle",
    "Description": "The most lightweight and compact of all assault rifles, without compromising accuracy and rate of fire.",
    "Group": "GROUP_RIFLE",
    "ModelHashKey": "W_AR_ADVANCEDRIFLE",
    "DefaultClipSize": 30,
    "Components": {
      "4203716879": {
        "HashKey": "COMPONENT_ADVANCEDRIFLE_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_AR_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Assault Rifle.",
        "ModelHashKey": "w_ar_advancedrifle_mag1",
        "IsDefault": true
      },
      "2395064697": {
        "HashKey": "COMPONENT_ADVANCEDRIFLE_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_AR_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Assault Rifle.",
        "ModelHashKey": "w_ar_advancedrifle_mag2",
        "IsDefault": false
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "2855028148": {
        "HashKey": "COMPONENT_AT_SCOPE_SMALL",
        "NameGXT": "WCT_SCOPE_SML",
        "DescriptionGXT": "WCD_SCOPE_SML",
        "Name": "Scope",
        "Description": "Medium-range zoom functionality.",
        "ModelHashKey": "w_at_scope_small",
        "IsDefault": false
      },
      "2205435306": {
        "HashKey": "COMPONENT_AT_AR_SUPP",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_AR_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_ar_supp",
        "IsDefault": false
      },
      "930927479": {
        "HashKey": "COMPONENT_ADVANCEDRIFLE_VARMOD_LUXE",
        "NameGXT": "WCT_VAR_METAL",
        "DescriptionGXT": "WCD_VAR_ADR",
        "Name": "Gilded Gun Metal Finish",
        "Description": "",
        "ModelHashKey": "W_AR_AdvancedRifle_Luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "2634544996": {
    "HashKey": "WEAPON_MG",
    "NameGXT": "WT_MG",
    "DescriptionGXT": "WTD_MG",
    "Name": "MG",
    "Description": "General purpose machine gun that combines rugged design with dependable performance. Long range penetrative power. Very effective against large groups.",
    "Group": "GROUP_MG",
    "ModelHashKey": "w_mg_mg",
    "DefaultClipSize": 54,
    "Components": {
      "4097109892": {
        "HashKey": "COMPONENT_MG_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_MG_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for MG.",
        "ModelHashKey": "w_mg_mg_mag1",
        "IsDefault": true
      },
      "2182449991": {
        "HashKey": "COMPONENT_MG_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_MG_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for MG.",
        "ModelHashKey": "w_mg_mg_mag2",
        "IsDefault": false
      },
      "1006677997": {
        "HashKey": "COMPONENT_AT_SCOPE_SMALL_02",
        "NameGXT": "WCT_SCOPE_SML",
        "DescriptionGXT": "WCD_SCOPE_SML",
        "Name": "Scope",
        "Description": "Medium-range zoom functionality.",
        "ModelHashKey": "w_at_scope_small_2",
        "IsDefault": false
      },
      "3604658878": {
        "HashKey": "COMPONENT_MG_VARMOD_LOWRIDER",
        "NameGXT": "WCT_VAR_GOLD",
        "DescriptionGXT": "WCD_VAR_MG",
        "Name": "Yusuf Amir Luxury Finish",
        "Description": "",
        "ModelHashKey": "w_mg_mg_luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "2144741730": {
    "HashKey": "WEAPON_COMBATMG",
    "NameGXT": "WT_MG_CBT",
    "DescriptionGXT": "WTD_MG_CBT",
    "Name": "Combat MG",
    "Description": "Lightweight, compact machine gun that combines excellent maneuverability with a high rate of fire to devastating effect.",
    "Group": "GROUP_MG",
    "ModelHashKey": "w_mg_combatmg",
    "DefaultClipSize": 100,
    "Components": {
      "3791631178": {
        "HashKey": "COMPONENT_COMBATMG_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCDCMG_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Combat MG.",
        "ModelHashKey": "w_mg_combatmg_mag1",
        "IsDefault": true
      },
      "3603274966": {
        "HashKey": "COMPONENT_COMBATMG_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCDCMG_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Combat MG.",
        "ModelHashKey": "w_mg_combatmg_mag2",
        "IsDefault": false
      },
      "2698550338": {
        "HashKey": "COMPONENT_AT_SCOPE_MEDIUM",
        "NameGXT": "WCT_SCOPE_MED",
        "DescriptionGXT": "WCD_SCOPE_MED",
        "Name": "Scope",
        "Description": "Extended-range zoom functionality.",
        "ModelHashKey": "w_at_scope_medium",
        "IsDefault": false
      },
      "202788691": {
        "HashKey": "COMPONENT_AT_AR_AFGRIP",
        "NameGXT": "WCT_GRIP",
        "DescriptionGXT": "WCD_GRIP",
        "Name": "Grip",
        "Description": "Improves weapon accuracy.",
        "ModelHashKey": "w_at_ar_afgrip",
        "IsDefault": false
      },
      "2466172125": {
        "HashKey": "COMPONENT_COMBATMG_VARMOD_LOWRIDER",
        "NameGXT": "WCT_VAR_ETCHM",
        "DescriptionGXT": "WCD_VAR_CBMG",
        "Name": "Etched Gun Metal Finish",
        "Description": "",
        "ModelHashKey": "w_mg_combatmg_luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "487013001": {
    "HashKey": "WEAPON_PUMPSHOTGUN",
    "NameGXT": "WT_SG_PMP",
    "DescriptionGXT": "WTD_SG_PMP",
    "Name": "Pump Shotgun",
    "Description": "Standard shotgun ideal for short-range combat. A high-projectile spread makes up for its lower accuracy at long range.",
    "Group": "GROUP_SHOTGUN",
    "ModelHashKey": "w_sg_pumpshotgun",
    "DefaultClipSize": 8,
    "Components": {
      "3513717816": {
        "HashKey": "COMPONENT_PUMPSHOTGUN_CLIP_01",
        "NameGXT": "WCT_INVALID",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "",
        "Description": "",
        "ModelHashKey": "",
        "IsDefault": true
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "3859329886": {
        "HashKey": "COMPONENT_AT_SR_SUPP",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_SR_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_sr_supp_2",
        "IsDefault": false
      },
      "2732039643": {
        "HashKey": "COMPONENT_PUMPSHOTGUN_VARMOD_LOWRIDER",
        "NameGXT": "WCT_VAR_GOLD",
        "DescriptionGXT": "WCD_VAR_PSHT",
        "Name": "Yusuf Amir Luxury Finish",
        "Description": "",
        "ModelHashKey": "w_sg_pumpshotgun_luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "2017895192": {
    "HashKey": "WEAPON_SAWNOFFSHOTGUN",
    "NameGXT": "WT_SG_SOF",
    "DescriptionGXT": "WTD_SG_SOF",
    "Name": "Sawed-Off Shotgun",
    "Description": "This single-barrel, sawed-off shotgun compensates for its low range and ammo capacity with devastating efficiency in close combat.",
    "Group": "GROUP_SHOTGUN",
    "ModelHashKey": "w_sg_sawnoff",
    "DefaultClipSize": 8,
    "Components": {
      "3352699429": {
        "HashKey": "COMPONENT_SAWNOFFSHOTGUN_CLIP_01",
        "NameGXT": "WCT_INVALID",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "",
        "Description": "",
        "ModelHashKey": "",
        "IsDefault": true
      },
      "2242268665": {
        "HashKey": "COMPONENT_SAWNOFFSHOTGUN_VARMOD_LUXE",
        "NameGXT": "WCT_VAR_METAL",
        "DescriptionGXT": "WCD_VAR_SOF",
        "Name": "Gilded Gun Metal Finish",
        "Description": "",
        "ModelHashKey": "W_SG_Sawnoff_Luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "3800352039": {
    "HashKey": "WEAPON_ASSAULTSHOTGUN",
    "NameGXT": "WT_SG_ASL",
    "DescriptionGXT": "WTD_SG_ASL",
    "Name": "Assault Shotgun",
    "Description": "Fully automatic shotgun with 8 round magazine and high rate of fire.",
    "Group": "GROUP_SHOTGUN",
    "ModelHashKey": "w_sg_assaultshotgun",
    "DefaultClipSize": 8,
    "Components": {
      "2498239431": {
        "HashKey": "COMPONENT_ASSAULTSHOTGUN_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_AS_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Assault Shotgun.",
        "ModelHashKey": "w_sg_assaultshotgun_mag1",
        "IsDefault": true
      },
      "2260565874": {
        "HashKey": "COMPONENT_ASSAULTSHOTGUN_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_AS_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Assault Shotgun.",
        "ModelHashKey": "w_sg_assaultshotgun_mag2",
        "IsDefault": false
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "2205435306": {
        "HashKey": "COMPONENT_AT_AR_SUPP",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_AR_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_ar_supp",
        "IsDefault": false
      },
      "202788691": {
        "HashKey": "COMPONENT_AT_AR_AFGRIP",
        "NameGXT": "WCT_GRIP",
        "DescriptionGXT": "WCD_GRIP",
        "Name": "Grip",
        "Description": "Improves weapon accuracy.",
        "ModelHashKey": "w_at_ar_afgrip",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "2640438543": {
    "HashKey": "WEAPON_BULLPUPSHOTGUN",
    "NameGXT": "WT_SG_BLP",
    "DescriptionGXT": "WTD_SG_BLP",
    "Name": "Bullpup Shotgun",
    "Description": "More than makes up for its slow, pump-action rate of fire with its range and spread.  Decimates anything in its projectile path.",
    "Group": "GROUP_SHOTGUN",
    "ModelHashKey": "w_sg_bullpupshotgun",
    "DefaultClipSize": 14,
    "Components": {
      "3377353998": {
        "HashKey": "COMPONENT_BULLPUPSHOTGUN_CLIP_01",
        "NameGXT": "WCT_INVALID",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "",
        "Description": "",
        "ModelHashKey": "",
        "IsDefault": true
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "2805810788": {
        "HashKey": "COMPONENT_AT_AR_SUPP_02",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_AR_SUPP2",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_ar_supp_02",
        "IsDefault": false
      },
      "202788691": {
        "HashKey": "COMPONENT_AT_AR_AFGRIP",
        "NameGXT": "WCT_GRIP",
        "DescriptionGXT": "WCD_GRIP",
        "Name": "Grip",
        "Description": "Improves weapon accuracy.",
        "ModelHashKey": "w_at_ar_afgrip",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "911657153": {
    "HashKey": "WEAPON_STUNGUN",
    "NameGXT": "WT_STUN",
    "DescriptionGXT": "WTD_STUN",
    "Name": "Stun Gun",
    "Description": "Fires a projectile that administers a voltage capable of temporarily stunning an assailant. Takes approximately 4 seconds to recharge after firing.",
    "Group": "GROUP_STUNGUN",
    "ModelHashKey": "w_pi_stungun",
    "DefaultClipSize": 2104529083,
    "Components": {},
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "100416529": {
    "HashKey": "WEAPON_SNIPERRIFLE",
    "NameGXT": "WT_SNIP_RIF",
    "DescriptionGXT": "WTD_SNIP_RIF",
    "Name": "Sniper Rifle",
    "Description": "Standard sniper rifle. Ideal for situations that require accuracy at long range. Limitations include slow reload speed and very low rate of fire.",
    "Group": "GROUP_SNIPER",
    "ModelHashKey": "w_sr_sniperrifle",
    "DefaultClipSize": 10,
    "Components": {
      "2613461129": {
        "HashKey": "COMPONENT_SNIPERRIFLE_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_SR_CLIP1",
        "Name": "Default Clip",
        "Description": "",
        "ModelHashKey": "w_sr_sniperrifle_mag1",
        "IsDefault": true
      },
      "2805810788": {
        "HashKey": "COMPONENT_AT_AR_SUPP_02",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_AR_SUPP2",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_ar_supp_02",
        "IsDefault": false
      },
      "3527687644": {
        "HashKey": "COMPONENT_AT_SCOPE_LARGE",
        "NameGXT": "WCT_SCOPE_LRG",
        "DescriptionGXT": "WCD_SCOPE_LRG",
        "Name": "Scope",
        "Description": "Long-range zoom functionality.",
        "ModelHashKey": "w_at_scope_large",
        "IsDefault": true
      },
      "3159677559": {
        "HashKey": "COMPONENT_AT_SCOPE_MAX",
        "NameGXT": "WCT_SCOPE_MAX",
        "DescriptionGXT": "WCD_SCOPE_MAX",
        "Name": "Advanced Scope",
        "Description": "Maximum zoom functionality.",
        "ModelHashKey": "w_at_scope_max",
        "IsDefault": true
      },
      "1077065191": {
        "HashKey": "COMPONENT_SNIPERRIFLE_VARMOD_LUXE",
        "NameGXT": "WCT_VAR_WOOD",
        "DescriptionGXT": "WCD_VAR_SNP",
        "Name": "Etched Wood Grip Finish",
        "Description": "",
        "ModelHashKey": "W_SR_SniperRifle_Luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "205991906": {
    "HashKey": "WEAPON_HEAVYSNIPER",
    "NameGXT": "WT_SNIP_HVY",
    "DescriptionGXT": "WTD_SNIP_HVY",
    "Name": "Heavy Sniper",
    "Description": "Features armor-piercing rounds for heavy damage. Comes with laser scope as standard.",
    "Group": "GROUP_SNIPER",
    "ModelHashKey": "w_sr_heavysniper",
    "DefaultClipSize": 6,
    "Components": {
      "1198478068": {
        "HashKey": "COMPONENT_HEAVYSNIPER_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_HS_CLIP1",
        "Name": "Default Clip",
        "Description": "",
        "ModelHashKey": "w_sr_heavysniper_mag1",
        "IsDefault": true
      },
      "3527687644": {
        "HashKey": "COMPONENT_AT_SCOPE_LARGE",
        "NameGXT": "WCT_SCOPE_LRG",
        "DescriptionGXT": "WCD_SCOPE_LRG",
        "Name": "Scope",
        "Description": "Long-range zoom functionality.",
        "ModelHashKey": "w_at_scope_large",
        "IsDefault": true
      },
      "3159677559": {
        "HashKey": "COMPONENT_AT_SCOPE_MAX",
        "NameGXT": "WCT_SCOPE_MAX",
        "DescriptionGXT": "WCD_SCOPE_MAX",
        "Name": "Advanced Scope",
        "Description": "Maximum zoom functionality.",
        "ModelHashKey": "w_at_scope_max",
        "IsDefault": true
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "2726580491": {
    "HashKey": "WEAPON_GRENADELAUNCHER",
    "NameGXT": "WT_GL",
    "DescriptionGXT": "WTD_GL",
    "Name": "Grenade Launcher",
    "Description": "A compact, lightweight grenade launcher with semi-automatic functionality. Holds up to 10 rounds.",
    "Group": "GROUP_HEAVY",
    "ModelHashKey": "w_lr_grenadelauncher",
    "DefaultClipSize": 10,
    "Components": {
      "296639639": {
        "HashKey": "COMPONENT_GRENADELAUNCHER_CLIP_01",
        "NameGXT": "WCT_INVALID",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "",
        "Description": "",
        "ModelHashKey": "w_lr_40mm",
        "IsDefault": true
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "202788691": {
        "HashKey": "COMPONENT_AT_AR_AFGRIP",
        "NameGXT": "WCT_GRIP",
        "DescriptionGXT": "WCD_GRIP",
        "Name": "Grip",
        "Description": "Improves weapon accuracy.",
        "ModelHashKey": "w_at_ar_afgrip",
        "IsDefault": false
      },
      "2855028148": {
        "HashKey": "COMPONENT_AT_SCOPE_SMALL",
        "NameGXT": "WCT_SCOPE_SML",
        "DescriptionGXT": "WCD_SCOPE_SML",
        "Name": "Scope",
        "Description": "Medium-range zoom functionality.",
        "ModelHashKey": "w_at_scope_small",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "2982836145": {
    "HashKey": "WEAPON_RPG",
    "NameGXT": "WT_RPG",
    "DescriptionGXT": "WTD_RPG",
    "Name": "RPG",
    "Description": "A portable, shoulder-launched, anti-tank weapon that fires explosive warheads. Very effective for taking down vehicles or large groups of assailants.",
    "Group": "GROUP_HEAVY",
    "ModelHashKey": "w_lr_rpg",
    "DefaultClipSize": 1,
    "Components": {
      "1319465907": {
        "HashKey": "COMPONENT_RPG_CLIP_01",
        "NameGXT": "WCT_INVALID",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "",
        "Description": "",
        "ModelHashKey": "",
        "IsDefault": true
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "1119849093": {
    "HashKey": "WEAPON_MINIGUN",
    "NameGXT": "WT_MINIGUN",
    "DescriptionGXT": "WTD_MINIGUN",
    "Name": "Minigun",
    "Description": "A devastating 6-barrel machine gun that features Gatling-style rotating barrels. Very high rate of fire (2000 to 6000 rounds per minute).",
    "Group": "GROUP_HEAVY",
    "ModelHashKey": "w_mg_minigun",
    "DefaultClipSize": 15000,
    "Components": {
      "3370020614": {
        "HashKey": "COMPONENT_MINIGUN_CLIP_01",
        "NameGXT": "WCT_INVALID",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "",
        "Description": "",
        "ModelHashKey": "",
        "IsDefault": true
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "2481070269": {
    "HashKey": "WEAPON_GRENADE",
    "NameGXT": "WT_GNADE",
    "DescriptionGXT": "WTD_GNADE",
    "Name": "Grenade",
    "Description": "Standard fragmentation grenade. Pull pin, throw, then find cover. Ideal for eliminating clustered assailants.",
    "Group": "GROUP_THROWN",
    "ModelHashKey": "w_ex_grenadefrag",
    "DefaultClipSize": 1,
    "Components": {},
    "Tints": [],
    "DLC": "core"
  },
  "741814745": {
    "HashKey": "WEAPON_STICKYBOMB",
    "NameGXT": "WT_GNADE_STK",
    "DescriptionGXT": "WTD_GNADE_STK",
    "Name": "Sticky Bomb",
    "Description": "A plastic explosive charge fitted with a remote detonator. Can be thrown and then detonated or attached to a vehicle then detonated.",
    "Group": "GROUP_THROWN",
    "ModelHashKey": "w_ex_pe",
    "DefaultClipSize": 1,
    "Components": {},
    "Tints": [],
    "DLC": "core"
  },
  "4256991824": {
    "HashKey": "WEAPON_SMOKEGRENADE",
    "NameGXT": "WT_GNADE_SMK",
    "DescriptionGXT": "WTD_GNADE_SMK",
    "Name": "Tear Gas",
    "Description": "Tear gas grenade, particularly effective at incapacitating multiple assailants. Sustained exposure can be lethal.",
    "Group": "GROUP_THROWN",
    "ModelHashKey": "w_ex_grenadesmoke",
    "DefaultClipSize": 1,
    "Components": {},
    "Tints": [],
    "DLC": "core"
  },
  "2694266206": {
    "HashKey": "WEAPON_BZGAS",
    "NameGXT": "WT_BZGAS",
    "DescriptionGXT": "WTD_BZGAS",
    "Name": "BZ Gas",
    "Description": "",
    "Group": "GROUP_THROWN",
    "ModelHashKey": "w_ex_grenadesmoke",
    "DefaultClipSize": 1,
    "Components": {},
    "Tints": [],
    "DLC": "core"
  },
  "615608432": {
    "HashKey": "WEAPON_MOLOTOV",
    "NameGXT": "WT_MOLOTOV",
    "DescriptionGXT": "WTD_MOLOTOV",
    "Name": "Molotov",
    "Description": "Crude yet highly effective incendiary weapon. No happy hour with this cocktail.",
    "Group": "GROUP_THROWN",
    "ModelHashKey": "w_ex_molotov",
    "DefaultClipSize": 1,
    "Components": {},
    "Tints": [],
    "DLC": "core"
  },
  "101631238": {
    "HashKey": "WEAPON_FIREEXTINGUISHER",
    "NameGXT": "WT_FIRE",
    "DescriptionGXT": "WTD_FIRE",
    "Name": "Fire Extinguisher",
    "Description": "",
    "Group": "GROUP_FIREEXTINGUISHER",
    "ModelHashKey": "w_am_fire_exting",
    "DefaultClipSize": 2000,
    "Components": {},
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "883325847": {
    "HashKey": "WEAPON_PETROLCAN",
    "NameGXT": "WT_PETROL",
    "DescriptionGXT": "WTD_PETROL",
    "Name": "Jerry Can",
    "Description": "Leaves a trail of gasoline that can be ignited.",
    "Group": "GROUP_PETROLCAN",
    "ModelHashKey": "w_am_jerrycan",
    "DefaultClipSize": 4500,
    "Components": {},
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "core"
  },
  "600439132": {
    "HashKey": "WEAPON_BALL",
    "NameGXT": "WT_BALL",
    "DescriptionGXT": "WTD_BALL",
    "Name": "Ball",
    "Description": "",
    "Group": "GROUP_THROWN",
    "ModelHashKey": "w_am_baseball",
    "DefaultClipSize": 1,
    "Components": {},
    "Tints": [],
    "DLC": "core"
  },
  "1233104067": {
    "HashKey": "WEAPON_FLARE",
    "NameGXT": "WT_FLARE",
    "DescriptionGXT": "WTD_FLARE",
    "Name": "Flare",
    "Description": "",
    "Group": "GROUP_THROWN",
    "ModelHashKey": "w_am_flare",
    "DefaultClipSize": 1,
    "Components": {},
    "Tints": [],
    "DLC": "core"
  },
  "3249783761": {
    "HashKey": "WEAPON_REVOLVER",
    "NameGXT": "WT_REVOLVER",
    "DescriptionGXT": "WTD_REVOLVER",
    "Name": "Heavy Revolver",
    "Description": "A handgun with enough stopping power to drop a crazed rhino, and heavy enough to beat it to death if you're out of ammo. Part of Executives and Other Criminals.",
    "Group": "GROUP_PISTOL",
    "ModelHashKey": "w_pi_revolver",
    "DefaultClipSize": 6,
    "Components": {
      "384708672": {
        "HashKey": "COMPONENT_REVOLVER_VARMOD_BOSS",
        "NameGXT": "WCT_REV_VARB",
        "DescriptionGXT": "WCD_REV_VARB",
        "Name": "VIP Variant",
        "Description": "",
        "ModelHashKey": "w_pi_revolver_b",
        "IsDefault": false
      },
      "2492708877": {
        "HashKey": "COMPONENT_REVOLVER_VARMOD_GOON",
        "NameGXT": "WCT_REV_VARG",
        "DescriptionGXT": "WCD_REV_VARG",
        "Name": "Bodyguard Variant",
        "Description": "",
        "ModelHashKey": "w_pi_revolver_g",
        "IsDefault": false
      },
      "3917905123": {
        "HashKey": "COMPONENT_REVOLVER_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_REV_CLIP1",
        "Name": "Default Clip",
        "Description": "",
        "ModelHashKey": "w_pi_revolver_Mag1",
        "IsDefault": true
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mpapartment"
  },
  "3756226112": {
    "HashKey": "WEAPON_SWITCHBLADE",
    "NameGXT": "WT_SWBLADE",
    "DescriptionGXT": "WTD_SWBLADE",
    "Name": "Switchblade",
    "Description": "From your pocket to hilt-deep in the other guy's ribs in under a second: folding knives will never go out of style. Part of Executives and Other Criminals.",
    "Group": "GROUP_MELEE",
    "ModelHashKey": "w_me_switchblade",
    "DefaultClipSize": 0,
    "Components": {
      "2436343040": {
        "HashKey": "COMPONENT_SWITCHBLADE_VARMOD_BASE",
        "NameGXT": "WCT_SB_BASE",
        "DescriptionGXT": "WCD_VAR_DESC",
        "Name": "Default Handle",
        "Description": "",
        "ModelHashKey": "w_me_switchblade",
        "IsDefault": false
      },
      "1530822070": {
        "HashKey": "COMPONENT_SWITCHBLADE_VARMOD_VAR1",
        "NameGXT": "WCT_SB_VAR1",
        "DescriptionGXT": "WCD_VAR_DESC",
        "Name": "VIP Variant",
        "Description": "",
        "ModelHashKey": "w_me_switchblade_b",
        "IsDefault": false
      },
      "3885209186": {
        "HashKey": "COMPONENT_SWITCHBLADE_VARMOD_VAR2",
        "NameGXT": "WCT_SB_VAR2",
        "DescriptionGXT": "WCD_VAR_DESC",
        "Name": "Bodyguard Variant",
        "Description": "",
        "ModelHashKey": "w_me_switchblade_g",
        "IsDefault": false
      }
    },
    "Tints": [],
    "DLC": "mpapartment"
  },
  "940833800": {
    "HashKey": "WEAPON_STONE_HATCHET",
    "NameGXT": "WT_SHATCHET",
    "DescriptionGXT": "WTD_SHATCHET",
    "Name": "Stone Hatchet",
    "Description": "There's retro, there's vintage, and there's this. After 500 years of technological development and spiritual apocalypse, pre-Colombian chic is back.",
    "Group": "GROUP_MELEE",
    "ModelHashKey": "w_me_stonehatchet",
    "DefaultClipSize": 0,
    "Components": {},
    "Tints": [],
    "DLC": "mpbattle"
  },
  "4192643659": {
    "HashKey": "WEAPON_BOTTLE",
    "NameGXT": "WT_BOTTLE",
    "DescriptionGXT": "WTD_BOTTLE",
    "Name": "Bottle",
    "Description": "It's not clever and it's not pretty but, most of the time, neither is the guy coming at you with a knife. When all else fails, this gets the job done. Part of the Beach Bum Pack.",
    "Group": "GROUP_MELEE",
    "ModelHashKey": "w_me_bottle",
    "DefaultClipSize": 0,
    "Components": {},
    "Tints": [],
    "DLC": "mpbeach"
  },
  "3218215474": {
    "HashKey": "WEAPON_SNSPISTOL",
    "NameGXT": "WT_SNSPISTOL",
    "DescriptionGXT": "WTD_SNSPISTOL",
    "Name": "SNS Pistol",
    "Description": "Like condoms or hairspray, this fits in your pocket for a night out in a Vinewood club. It's half as accurate as a champagne cork but twice as deadly. Part of the Beach Bum Pack.",
    "Group": "GROUP_PISTOL",
    "ModelHashKey": "w_pi_sns_pistol",
    "DefaultClipSize": 6,
    "Components": {
      "4169150169": {
        "HashKey": "COMPONENT_SNSPISTOL_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_SNSP_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for SNS Pistol.",
        "ModelHashKey": "w_pi_sns_pistol_mag1",
        "IsDefault": true
      },
      "2063610803": {
        "HashKey": "COMPONENT_SNSPISTOL_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_SNSP_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for SNS Pistol.",
        "ModelHashKey": "w_pi_sns_pistol_mag2",
        "IsDefault": false
      },
      "2150886575": {
        "HashKey": "COMPONENT_SNSPISTOL_VARMOD_LOWRIDER",
        "NameGXT": "WCT_VAR_WOOD",
        "DescriptionGXT": "WCD_VAR_SNS",
        "Name": "Etched Wood Grip Finish",
        "Description": "",
        "ModelHashKey": "w_pi_sns_pistol_luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mpbeach"
  },
  "317205821": {
    "HashKey": "WEAPON_AUTOSHOTGUN",
    "NameGXT": "WT_AUTOSHGN",
    "DescriptionGXT": "WTD_AUTOSHGN",
    "Name": "Sweeper Shotgun",
    "Description": "How many effective tools for riot control can you tuck into your pants? OK, two. But this is the other one. Part of Bikers.",
    "Group": "GROUP_SHOTGUN",
    "ModelHashKey": "w_sg_sweeper",
    "DefaultClipSize": 10,
    "Components": {
      "169463950": {
        "HashKey": "COMPONENT_AUTOSHOTGUN_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "",
        "Name": "Default Clip",
        "Description": "",
        "ModelHashKey": "w_sg_sweeper_mag1",
        "IsDefault": true
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mpbiker"
  },
  "3441901897": {
    "HashKey": "WEAPON_BATTLEAXE",
    "NameGXT": "WT_BATTLEAXE",
    "DescriptionGXT": "WTD_BATTLEAXE",
    "Name": "Battle Axe",
    "Description": "If it's good enough for medieval foot soldiers, modern border guards and pushy soccer moms, it's good enough for you. Part of Bikers.",
    "Group": "GROUP_MELEE",
    "ModelHashKey": "w_me_battleaxe",
    "DefaultClipSize": 0,
    "Components": {},
    "Tints": [],
    "DLC": "mpbiker"
  },
  "125959754": {
    "HashKey": "WEAPON_COMPACTLAUNCHER",
    "NameGXT": "WT_CMPGL",
    "DescriptionGXT": "WTD_CMPGL",
    "Name": "Compact Grenade Launcher",
    "Description": "Focus groups using the regular model suggested it was too accurate and found it awkward to use with one hand on the throttle. Easy fix. Part of Bikers.",
    "Group": "GROUP_HEAVY",
    "ModelHashKey": "w_lr_compactgl",
    "DefaultClipSize": 1,
    "Components": {
      "1235472140": {
        "HashKey": "COMPONENT_COMPACTLAUNCHER_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "",
        "Name": "Default Clip",
        "Description": "",
        "ModelHashKey": "w_lr_compactgl_mag1",
        "IsDefault": true
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mpbiker"
  },
  "3173288789": {
    "HashKey": "WEAPON_MINISMG",
    "NameGXT": "WT_MINISMG",
    "DescriptionGXT": "WTD_MINISMG",
    "Name": "Mini SMG",
    "Description": "Increasingly popular since the marketing team looked beyond spec ops units and started caring about the little guys in low income areas. Part of Bikers.",
    "Group": "GROUP_SMG",
    "ModelHashKey": "w_sb_minismg",
    "DefaultClipSize": 20,
    "Components": {
      "2227745491": {
        "HashKey": "COMPONENT_MINISMG_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_MIMG_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Mini SMG.",
        "ModelHashKey": "w_sb_minismg_mag1",
        "IsDefault": true
      },
      "2474561719": {
        "HashKey": "COMPONENT_MINISMG_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_MIMG_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Mini SMG.",
        "ModelHashKey": "w_sb_minismg_mag2",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mpbiker"
  },
  "3125143736": {
    "HashKey": "WEAPON_PIPEBOMB",
    "NameGXT": "WT_PIPEBOMB",
    "DescriptionGXT": "WTD_PIPEBOMB",
    "Name": "Pipe Bomb",
    "Description": "Remember, it doesn't count as an IED when you buy it in a store and use it in a first world country. Part of Bikers.",
    "Group": "GROUP_THROWN",
    "ModelHashKey": "w_ex_pipebomb",
    "DefaultClipSize": 1,
    "Components": {},
    "Tints": [],
    "DLC": "mpbiker"
  },
  "2484171525": {
    "HashKey": "WEAPON_POOLCUE",
    "NameGXT": "WT_POOLCUE",
    "DescriptionGXT": "WTD_POOLCUE",
    "Name": "Pool Cue",
    "Description": "Ah, there's no sound as satisfying as the crack of a perfect break, especially when it's the other guy's spine. Part of Bikers.",
    "Group": "GROUP_MELEE",
    "ModelHashKey": "w_me_poolcue",
    "DefaultClipSize": 0,
    "Components": {},
    "Tints": [],
    "DLC": "mpbiker"
  },
  "419712736": {
    "HashKey": "WEAPON_WRENCH",
    "NameGXT": "WT_WRENCH",
    "DescriptionGXT": "WTD_WRENCH",
    "Name": "Pipe Wrench",
    "Description": "Perennial favourite of apocalyptic survivalists and violent fathers the world over, apparently it also doubles as some kind of tool. Part of Bikers.",
    "Group": "GROUP_MELEE",
    "ModelHashKey": "w_me_wrench",
    "DefaultClipSize": 0,
    "Components": {},
    "Tints": [],
    "DLC": "mpbiker"
  },
  "3523564046": {
    "HashKey": "WEAPON_HEAVYPISTOL",
    "NameGXT": "WT_HVYPISTOL",
    "DescriptionGXT": "WTD_HVYPISTOL",
    "Name": "Heavy Pistol",
    "Description": "The heavyweight champion of the magazine fed, semi-automatic handgun world. Delivers a serious forearm workout every time. Part of The Business Update.",
    "Group": "GROUP_PISTOL",
    "ModelHashKey": "w_pi_heavypistol",
    "DefaultClipSize": 18,
    "Components": {
      "222992026": {
        "HashKey": "COMPONENT_HEAVYPISTOL_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_HPST_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Heavy Pistol.",
        "ModelHashKey": "w_pi_heavypistol_mag1",
        "IsDefault": true
      },
      "1694090795": {
        "HashKey": "COMPONENT_HEAVYPISTOL_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_HPST_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Heavy Pistol.",
        "ModelHashKey": "w_pi_heavypistol_mag2",
        "IsDefault": false
      },
      "899381934": {
        "HashKey": "COMPONENT_AT_PI_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_pi_flsh",
        "IsDefault": false
      },
      "3271853210": {
        "HashKey": "COMPONENT_AT_PI_SUPP",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_PI_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_pi_supp",
        "IsDefault": false
      },
      "2053798779": {
        "HashKey": "COMPONENT_HEAVYPISTOL_VARMOD_LUXE",
        "NameGXT": "WCT_VAR_WOOD",
        "DescriptionGXT": "WCD_VAR_HPST",
        "Name": "Etched Wood Grip Finish",
        "Description": "",
        "ModelHashKey": "W_PI_HeavyPistol_Luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mpbusiness"
  },
  "3231910285": {
    "HashKey": "WEAPON_SPECIALCARBINE",
    "NameGXT": "WT_SPCARBINE",
    "DescriptionGXT": "WTD_SPCARBINE",
    "Name": "Special Carbine",
    "Description": "Combining accuracy, maneuverability and low recoil, this is an extremely versatile assault rifle for any combat situation. Part of The Business Update.",
    "Group": "GROUP_RIFLE",
    "ModelHashKey": "w_ar_specialcarbine",
    "DefaultClipSize": 30,
    "Components": {
      "3334989185": {
        "HashKey": "COMPONENT_SPECIALCARBINE_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_SCRB_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Special Carbine.",
        "ModelHashKey": "w_ar_specialcarbine_mag1",
        "IsDefault": true
      },
      "2089537806": {
        "HashKey": "COMPONENT_SPECIALCARBINE_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_SCRB_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Special Carbine.",
        "ModelHashKey": "w_ar_specialcarbine_mag2",
        "IsDefault": false
      },
      "1801039530": {
        "HashKey": "COMPONENT_SPECIALCARBINE_CLIP_03",
        "NameGXT": "WCT_CLIP_DRM",
        "DescriptionGXT": "WCD_CLIP3",
        "Name": "Drum Magazine",
        "Description": "Expanded capacity and slower reload.",
        "ModelHashKey": "w_ar_specialcarbine_boxmag",
        "IsDefault": false
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "2698550338": {
        "HashKey": "COMPONENT_AT_SCOPE_MEDIUM",
        "NameGXT": "WCT_SCOPE_MED",
        "DescriptionGXT": "WCD_SCOPE_MED",
        "Name": "Scope",
        "Description": "Extended-range zoom functionality.",
        "ModelHashKey": "w_at_scope_medium",
        "IsDefault": false
      },
      "2805810788": {
        "HashKey": "COMPONENT_AT_AR_SUPP_02",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_AR_SUPP2",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_ar_supp_02",
        "IsDefault": false
      },
      "202788691": {
        "HashKey": "COMPONENT_AT_AR_AFGRIP",
        "NameGXT": "WCT_GRIP",
        "DescriptionGXT": "WCD_GRIP",
        "Name": "Grip",
        "Description": "Improves weapon accuracy.",
        "ModelHashKey": "w_at_ar_afgrip",
        "IsDefault": false
      },
      "1929467122": {
        "HashKey": "COMPONENT_SPECIALCARBINE_VARMOD_LOWRIDER",
        "NameGXT": "WCT_VAR_ETCHM",
        "DescriptionGXT": "WCD_VAR_SCAR",
        "Name": "Etched Gun Metal Finish",
        "Description": "",
        "ModelHashKey": "w_ar_specialcarbine_luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mpbusiness"
  },
  "2132975508": {
    "HashKey": "WEAPON_BULLPUPRIFLE",
    "NameGXT": "WT_BULLRIFLE",
    "DescriptionGXT": "WTD_BULLRIFLE",
    "Name": "Bullpup Rifle",
    "Description": "The latest Chinese import taking America by storm, this rifle is known for its balanced handling. Lightweight and very controllable in automatic fire. Part of The High Life Update.",
    "Group": "GROUP_RIFLE",
    "ModelHashKey": "w_ar_bullpuprifle",
    "DefaultClipSize": 30,
    "Components": {
      "3315675008": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_BRIF_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Bullpup Rifle.",
        "ModelHashKey": "w_ar_bullpuprifle_mag1",
        "IsDefault": true
      },
      "3009973007": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_BRIF_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Bullpup Rifle.",
        "ModelHashKey": "w_ar_bullpuprifle_mag2",
        "IsDefault": false
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "2855028148": {
        "HashKey": "COMPONENT_AT_SCOPE_SMALL",
        "NameGXT": "WCT_SCOPE_SML",
        "DescriptionGXT": "WCD_SCOPE_SML",
        "Name": "Scope",
        "Description": "Medium-range zoom functionality.",
        "ModelHashKey": "w_at_scope_small",
        "IsDefault": false
      },
      "2205435306": {
        "HashKey": "COMPONENT_AT_AR_SUPP",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_AR_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_ar_supp",
        "IsDefault": false
      },
      "202788691": {
        "HashKey": "COMPONENT_AT_AR_AFGRIP",
        "NameGXT": "WCT_GRIP",
        "DescriptionGXT": "WCD_GRIP",
        "Name": "Grip",
        "Description": "Improves weapon accuracy.",
        "ModelHashKey": "w_at_ar_afgrip",
        "IsDefault": false
      },
      "2824322168": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_VARMOD_LOW",
        "NameGXT": "WCT_VAR_METAL",
        "DescriptionGXT": "WCD_VAR_BPR",
        "Name": "Gilded Gun Metal Finish",
        "Description": "",
        "ModelHashKey": "w_ar_bullpuprifle_luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mpbusiness2"
  },
  "1672152130": {
    "HashKey": "WEAPON_HOMINGLAUNCHER",
    "NameGXT": "WT_HOMLNCH",
    "DescriptionGXT": "WTD_HOMLNCH",
    "Name": "Homing Launcher",
    "Description": "Infrared guided fire-and-forget missile launcher. For all your moving target needs. Part of the Festive Surprise.",
    "Group": "GROUP_HEAVY",
    "ModelHashKey": "w_lr_homing",
    "DefaultClipSize": 1,
    "Components": {
      "4162006335": {
        "HashKey": "COMPONENT_HOMINGLAUNCHER_CLIP_01",
        "NameGXT": "WCT_INVALID",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "",
        "Description": "",
        "ModelHashKey": "",
        "IsDefault": true
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mpchristmas2"
  },
  "2874559379": {
    "HashKey": "WEAPON_PROXMINE",
    "NameGXT": "WT_PRXMINE",
    "DescriptionGXT": "WTD_PRXMINE",
    "Name": "Proximity Mine",
    "Description": "Leave a present for your friends with these motion sensor landmines. Short delay after activation. Part of the Festive Surprise.",
    "Group": "GROUP_THROWN",
    "ModelHashKey": "w_ex_apmine",
    "DefaultClipSize": 1,
    "Components": {},
    "Tints": [],
    "DLC": "mpchristmas2"
  },
  "126349499": {
    "HashKey": "WEAPON_SNOWBALL",
    "NameGXT": "WT_SNWBALL",
    "DescriptionGXT": "WTD_SNWBALL",
    "Name": "Snowball",
    "Description": "",
    "Group": "GROUP_THROWN",
    "ModelHashKey": "w_ex_snowball",
    "DefaultClipSize": 1,
    "Components": {},
    "Tints": [],
    "DLC": "mpchristmas2"
  },
  "2228681469": {
    "HashKey": "WEAPON_BULLPUPRIFLE_MK2",
    "NameGXT": "WT_BULLRIFLE2",
    "DescriptionGXT": "WTD_BULLRIFLE2",
    "Name": "Bullpup Rifle Mk II",
    "Description": "So precise, so exquisite, it's not so much a hail of bullets as a symphony.",
    "Group": "GROUP_RIFLE",
    "ModelHashKey": "w_ar_bullpupriflemk2",
    "DefaultClipSize": 30,
    "Components": {
      "25766362": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_MK2_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for regular ammo.",
        "ModelHashKey": "w_ar_bullpupriflemk2_mag1",
        "IsDefault": true
      },
      "4021290536": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_MK2_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for regular ammo.",
        "ModelHashKey": "w_ar_bullpupriflemk2_mag2",
        "IsDefault": false
      },
      "2183159977": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_MK2_CLIP_TRACER",
        "NameGXT": "WCT_CLIP_TR",
        "DescriptionGXT": "WCD_CLIP_TR",
        "Name": "Tracer Rounds",
        "Description": "Bullets with bright visible markers that match the tint of the gun. Standard capacity.",
        "ModelHashKey": "W_AR_BullpupRifleMK2_Mag_TR",
        "IsDefault": false
      },
      "2845636954": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_MK2_CLIP_INCENDIARY",
        "NameGXT": "WCT_CLIP_INC",
        "DescriptionGXT": "WCD_CLIP_INC",
        "Name": "Incendiary Rounds",
        "Description": "Bullets which include a chance to set targets on fire when shot. Reduced capacity.",
        "ModelHashKey": "W_AR_BullpupRifleMK2_Mag_INC",
        "IsDefault": false
      },
      "4205311469": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_MK2_CLIP_ARMORPIERCING",
        "NameGXT": "WCT_CLIP_AP",
        "DescriptionGXT": "WCD_CLIP_AP",
        "Name": "Armor Piercing Rounds",
        "Description": "Increased penetration of Body Armor. Reduced capacity.",
        "ModelHashKey": "W_AR_BullpupRifleMK2_Mag_AP",
        "IsDefault": false
      },
      "1130501904": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_MK2_CLIP_FMJ",
        "NameGXT": "WCT_CLIP_FMJ",
        "DescriptionGXT": "WCD_CLIP_FMJ",
        "Name": "Full Metal Jacket Rounds",
        "Description": "Increased damage to vehicles. Also penetrates bullet resistant and bulletproof vehicle glass. Reduced capacity.",
        "ModelHashKey": "W_AR_BullpupRifleMK2_Mag_FMJ",
        "IsDefault": false
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "1108334355": {
        "HashKey": "COMPONENT_AT_SIGHTS",
        "NameGXT": "WCT_HOLO",
        "DescriptionGXT": "WCD_HOLO",
        "Name": "Holographic Sight",
        "Description": "Accurate sight for close quarters combat.",
        "ModelHashKey": "w_at_sights_1",
        "IsDefault": false
      },
      "3350057221": {
        "HashKey": "COMPONENT_AT_SCOPE_MACRO_02_MK2",
        "NameGXT": "WCT_SCOPE_MAC2",
        "DescriptionGXT": "WCD_SCOPE_MAC",
        "Name": "Small Scope",
        "Description": "Standard-range zoom functionality.",
        "ModelHashKey": "w_at_scope_macro_2",
        "IsDefault": false
      },
      "1060929921": {
        "HashKey": "COMPONENT_AT_SCOPE_SMALL_MK2",
        "NameGXT": "WCT_SCOPE_SML2",
        "DescriptionGXT": "WCD_SCOPE_SML",
        "Name": "Medium Scope",
        "Description": "Medium-range zoom functionality.",
        "ModelHashKey": "w_at_scope_small",
        "IsDefault": false
      },
      "1704640795": {
        "HashKey": "COMPONENT_AT_BP_BARREL_01",
        "NameGXT": "WCT_BARR",
        "DescriptionGXT": "WCD_BARR",
        "Name": "Default Barrel",
        "Description": "Stock barrel attachment.",
        "ModelHashKey": "W_AR_BP_MK2_Barrel1",
        "IsDefault": true
      },
      "1005743559": {
        "HashKey": "COMPONENT_AT_BP_BARREL_02",
        "NameGXT": "WCT_BARR2",
        "DescriptionGXT": "WCD_BARR2",
        "Name": "Heavy Barrel",
        "Description": "Increases damage dealt to long-range targets.",
        "ModelHashKey": "W_AR_BP_MK2_Barrel2",
        "IsDefault": false
      },
      "2205435306": {
        "HashKey": "COMPONENT_AT_AR_SUPP",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_AR_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_ar_supp",
        "IsDefault": false
      },
      "3113485012": {
        "HashKey": "COMPONENT_AT_MUZZLE_01",
        "NameGXT": "WCT_MUZZ1",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Flat Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_1",
        "IsDefault": false
      },
      "3362234491": {
        "HashKey": "COMPONENT_AT_MUZZLE_02",
        "NameGXT": "WCT_MUZZ2",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Tactical Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_2",
        "IsDefault": false
      },
      "3725708239": {
        "HashKey": "COMPONENT_AT_MUZZLE_03",
        "NameGXT": "WCT_MUZZ3",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Fat-End Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_3",
        "IsDefault": false
      },
      "3968886988": {
        "HashKey": "COMPONENT_AT_MUZZLE_04",
        "NameGXT": "WCT_MUZZ4",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Precision Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_4",
        "IsDefault": false
      },
      "48731514": {
        "HashKey": "COMPONENT_AT_MUZZLE_05",
        "NameGXT": "WCT_MUZZ5",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Heavy Duty Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_5",
        "IsDefault": false
      },
      "880736428": {
        "HashKey": "COMPONENT_AT_MUZZLE_06",
        "NameGXT": "WCT_MUZZ6",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Slanted Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_6",
        "IsDefault": false
      },
      "1303784126": {
        "HashKey": "COMPONENT_AT_MUZZLE_07",
        "NameGXT": "WCT_MUZZ7",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Split-End Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_7",
        "IsDefault": false
      },
      "2640679034": {
        "HashKey": "COMPONENT_AT_AR_AFGRIP_02",
        "NameGXT": "WCT_GRIP",
        "DescriptionGXT": "WCD_GRIP",
        "Name": "Grip",
        "Description": "Improves weapon accuracy.",
        "ModelHashKey": "w_at_afgrip_2",
        "IsDefault": false
      },
      "2923451831": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_MK2_CAMO",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "w_ar_bullpupriflemk2_camo1",
        "IsDefault": false
      },
      "3104173419": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_MK2_CAMO_02",
        "NameGXT": "WCT_CAMO_2",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Brushstroke Camo",
        "Description": "",
        "ModelHashKey": "w_ar_bullpupriflemk2_camo2",
        "IsDefault": false
      },
      "2797881576": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_MK2_CAMO_03",
        "NameGXT": "WCT_CAMO_3",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Woodland Camo",
        "Description": "",
        "ModelHashKey": "w_ar_bullpupriflemk2_camo3",
        "IsDefault": false
      },
      "2491819116": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_MK2_CAMO_04",
        "NameGXT": "WCT_CAMO_4",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Skull",
        "Description": "",
        "ModelHashKey": "w_ar_bullpupriflemk2_camo4",
        "IsDefault": false
      },
      "2318995410": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_MK2_CAMO_05",
        "NameGXT": "WCT_CAMO_5",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Sessanta Nove",
        "Description": "",
        "ModelHashKey": "w_ar_bullpupriflemk2_camo5",
        "IsDefault": false
      },
      "36929477": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_MK2_CAMO_06",
        "NameGXT": "WCT_CAMO_6",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Perseus",
        "Description": "",
        "ModelHashKey": "w_ar_bullpupriflemk2_camo6",
        "IsDefault": false
      },
      "4026522462": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_MK2_CAMO_07",
        "NameGXT": "WCT_CAMO_7",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Leopard",
        "Description": "",
        "ModelHashKey": "w_ar_bullpupriflemk2_camo7",
        "IsDefault": false
      },
      "3720197850": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_MK2_CAMO_08",
        "NameGXT": "WCT_CAMO_8",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Zebra",
        "Description": "",
        "ModelHashKey": "w_ar_bullpupriflemk2_camo8",
        "IsDefault": false
      },
      "3412267557": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_MK2_CAMO_09",
        "NameGXT": "WCT_CAMO_9",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Geometric",
        "Description": "",
        "ModelHashKey": "w_ar_bullpupriflemk2_camo9",
        "IsDefault": false
      },
      "2826785822": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_MK2_CAMO_10",
        "NameGXT": "WCT_CAMO_10",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Boom!",
        "Description": "",
        "ModelHashKey": "w_ar_bullpupriflemk2_camo10",
        "IsDefault": false
      },
      "3320426066": {
        "HashKey": "COMPONENT_BULLPUPRIFLE_MK2_CAMO_IND_01",
        "NameGXT": "WCT_CAMO_IND",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Patriotic",
        "Description": "",
        "ModelHashKey": "w_ar_bullpupriflemk2_camo_ind1",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WCT_TINT_0",
        "Name": "Classic Black"
      },
      {
        "NameGXT": "WCT_TINT_1",
        "Name": "Classic Gray"
      },
      {
        "NameGXT": "WCT_TINT_2",
        "Name": "Classic Two-Tone"
      },
      {
        "NameGXT": "WCT_TINT_3",
        "Name": "Classic White"
      },
      {
        "NameGXT": "WCT_TINT_4",
        "Name": "Classic Beige"
      },
      {
        "NameGXT": "WCT_TINT_5",
        "Name": "Classic Green"
      },
      {
        "NameGXT": "WCT_TINT_6",
        "Name": "Classic Blue"
      },
      {
        "NameGXT": "WCT_TINT_7",
        "Name": "Classic Earth"
      },
      {
        "NameGXT": "WCT_TINT_8",
        "Name": "Classic Brown & Black"
      },
      {
        "NameGXT": "WCT_TINT_9",
        "Name": "Red Contrast"
      },
      {
        "NameGXT": "WCT_TINT_10",
        "Name": "Blue Contrast"
      },
      {
        "NameGXT": "WCT_TINT_11",
        "Name": "Yellow Contrast"
      },
      {
        "NameGXT": "WCT_TINT_12",
        "Name": "Orange Contrast"
      },
      {
        "NameGXT": "WCT_TINT_13",
        "Name": "Bold Pink"
      },
      {
        "NameGXT": "WCT_TINT_14",
        "Name": "Bold Purple & Yellow"
      },
      {
        "NameGXT": "WCT_TINT_15",
        "Name": "Bold Orange"
      },
      {
        "NameGXT": "WCT_TINT_16",
        "Name": "Bold Green & Purple"
      },
      {
        "NameGXT": "WCT_TINT_17",
        "Name": "Bold Red Features"
      },
      {
        "NameGXT": "WCT_TINT_18",
        "Name": "Bold Green Features"
      },
      {
        "NameGXT": "WCT_TINT_19",
        "Name": "Bold Cyan Features"
      },
      {
        "NameGXT": "WCT_TINT_20",
        "Name": "Bold Yellow Features"
      },
      {
        "NameGXT": "WCT_TINT_21",
        "Name": "Bold Red & White"
      },
      {
        "NameGXT": "WCT_TINT_22",
        "Name": "Bold Blue & White"
      },
      {
        "NameGXT": "WCT_TINT_23",
        "Name": "Metallic Gold"
      },
      {
        "NameGXT": "WCT_TINT_24",
        "Name": "Metallic Platinum"
      },
      {
        "NameGXT": "WCT_TINT_25",
        "Name": "Metallic Gray & Lilac"
      },
      {
        "NameGXT": "WCT_TINT_26",
        "Name": "Metallic Purple & Lime"
      },
      {
        "NameGXT": "WCT_TINT_27",
        "Name": "Metallic Red"
      },
      {
        "NameGXT": "WCT_TINT_28",
        "Name": "Metallic Green"
      },
      {
        "NameGXT": "WCT_TINT_29",
        "Name": "Metallic Blue"
      },
      {
        "NameGXT": "WCT_TINT_30",
        "Name": "Metallic White & Aqua"
      },
      {
        "NameGXT": "WCT_TINT_31",
        "Name": "Metallic Red & Yellow"
      }
    ],
    "DLC": "mpchristmas2017"
  },
  "2548703416": {
    "HashKey": "WEAPON_DOUBLEACTION",
    "NameGXT": "WT_REV_DA",
    "DescriptionGXT": "WTD_REV_DA",
    "Name": "Double-Action Revolver",
    "Description": "Because sometimes revenge is a dish best served six times, in quick succession, right between the eyes. Part of The Doomsday Heist.",
    "Group": "GROUP_PISTOL",
    "ModelHashKey": "w_pi_wep1_gun",
    "DefaultClipSize": 6,
    "Components": {
      "1328622785": {
        "HashKey": "COMPONENT_DOUBLEACTION_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_REV_DA_CLIP",
        "Name": "Default Clip",
        "Description": "Standard ammo capacity.",
        "ModelHashKey": "w_pi_wep1_mag1",
        "IsDefault": true
      }
    },
    "Tints": [],
    "DLC": "mpchristmas2017"
  },
  "1785463520": {
    "HashKey": "WEAPON_MARKSMANRIFLE_MK2",
    "NameGXT": "WT_MKRIFLE2",
    "DescriptionGXT": "WTD_MKRIFLE2",
    "Name": "Marksman Rifle Mk II",
    "Description": "Known in military circles as The Dislocator, this mod set will destroy both the target and your shoulder, in that order.",
    "Group": "GROUP_SNIPER",
    "ModelHashKey": "w_sr_marksmanriflemk2",
    "DefaultClipSize": 8,
    "Components": {
      "2497785294": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_MK2_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for regular ammo.",
        "ModelHashKey": "w_sr_marksmanriflemk2_mag1",
        "IsDefault": true
      },
      "3872379306": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_MK2_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for regular ammo.",
        "ModelHashKey": "w_sr_marksmanriflemk2_mag2",
        "IsDefault": false
      },
      "3615105746": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_MK2_CLIP_TRACER",
        "NameGXT": "WCT_CLIP_TR",
        "DescriptionGXT": "WCD_CLIP_TR",
        "Name": "Tracer Rounds",
        "Description": "Bullets with bright visible markers that match the tint of the gun. Standard capacity.",
        "ModelHashKey": "w_sr_marksmanriflemk2_mag_tr",
        "IsDefault": false
      },
      "1842849902": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_MK2_CLIP_INCENDIARY",
        "NameGXT": "WCT_CLIP_INC",
        "DescriptionGXT": "WCD_CLIP_INC",
        "Name": "Incendiary Rounds",
        "Description": "Bullets which include a chance to set targets on fire when shot. Reduced capacity.",
        "ModelHashKey": "w_sr_marksmanriflemk2_mag_inc",
        "IsDefault": false
      },
      "4100968569": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_MK2_CLIP_ARMORPIERCING",
        "NameGXT": "WCT_CLIP_AP",
        "DescriptionGXT": "WCD_CLIP_AP",
        "Name": "Armor Piercing Rounds",
        "Description": "Increased penetration of Body Armor. Reduced capacity.",
        "ModelHashKey": "w_sr_marksmanriflemk2_mag_ap",
        "IsDefault": false
      },
      "3779763923": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_MK2_CLIP_FMJ",
        "NameGXT": "WCT_CLIP_FMJ",
        "DescriptionGXT": "WCD_CLIP_FMJ",
        "Name": "Full Metal Jacket Rounds",
        "Description": "Increased damage to vehicles. Also penetrates bullet resistant and bulletproof vehicle glass. Reduced capacity.",
        "ModelHashKey": "w_sr_marksmanriflemk2_mag_fmj",
        "IsDefault": false
      },
      "1108334355": {
        "HashKey": "COMPONENT_AT_SIGHTS",
        "NameGXT": "WCT_HOLO",
        "DescriptionGXT": "WCD_HOLO",
        "Name": "Holographic Sight",
        "Description": "Accurate sight for close quarters combat.",
        "ModelHashKey": "w_at_sights_1",
        "IsDefault": false
      },
      "3328927042": {
        "HashKey": "COMPONENT_AT_SCOPE_MEDIUM_MK2",
        "NameGXT": "WCT_SCOPE_MED2",
        "DescriptionGXT": "WCD_SCOPE_MED",
        "Name": "Large Scope",
        "Description": "Extended-range zoom functionality.",
        "ModelHashKey": "w_at_scope_medium_2",
        "IsDefault": false
      },
      "1528590652": {
        "HashKey": "COMPONENT_AT_SCOPE_LARGE_FIXED_ZOOM_MK2",
        "NameGXT": "WCT_SCOPE_LRG2",
        "DescriptionGXT": "WCD_SCOPE_LRF",
        "Name": "Zoom Scope",
        "Description": "Long-range fixed zoom functionality.",
        "ModelHashKey": "w_at_scope_large",
        "IsDefault": true
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "2205435306": {
        "HashKey": "COMPONENT_AT_AR_SUPP",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_AR_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_ar_supp",
        "IsDefault": false
      },
      "3113485012": {
        "HashKey": "COMPONENT_AT_MUZZLE_01",
        "NameGXT": "WCT_MUZZ1",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Flat Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_1",
        "IsDefault": false
      },
      "3362234491": {
        "HashKey": "COMPONENT_AT_MUZZLE_02",
        "NameGXT": "WCT_MUZZ2",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Tactical Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_2",
        "IsDefault": false
      },
      "3725708239": {
        "HashKey": "COMPONENT_AT_MUZZLE_03",
        "NameGXT": "WCT_MUZZ3",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Fat-End Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_3",
        "IsDefault": false
      },
      "3968886988": {
        "HashKey": "COMPONENT_AT_MUZZLE_04",
        "NameGXT": "WCT_MUZZ4",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Precision Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_4",
        "IsDefault": false
      },
      "48731514": {
        "HashKey": "COMPONENT_AT_MUZZLE_05",
        "NameGXT": "WCT_MUZZ5",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Heavy Duty Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_5",
        "IsDefault": false
      },
      "880736428": {
        "HashKey": "COMPONENT_AT_MUZZLE_06",
        "NameGXT": "WCT_MUZZ6",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Slanted Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_6",
        "IsDefault": false
      },
      "1303784126": {
        "HashKey": "COMPONENT_AT_MUZZLE_07",
        "NameGXT": "WCT_MUZZ7",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Split-End Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_7",
        "IsDefault": false
      },
      "941317513": {
        "HashKey": "COMPONENT_AT_MRFL_BARREL_01",
        "NameGXT": "WCT_BARR",
        "DescriptionGXT": "WCD_BARR",
        "Name": "Default Barrel",
        "Description": "Stock barrel attachment.",
        "ModelHashKey": "w_sr_mr_mk2_barrel_1",
        "IsDefault": true
      },
      "1748450780": {
        "HashKey": "COMPONENT_AT_MRFL_BARREL_02",
        "NameGXT": "WCT_BARR2",
        "DescriptionGXT": "WCD_BARR2",
        "Name": "Heavy Barrel",
        "Description": "Increases damage dealt to long-range targets.",
        "ModelHashKey": "w_sr_mr_mk2_barrel_2",
        "IsDefault": false
      },
      "2640679034": {
        "HashKey": "COMPONENT_AT_AR_AFGRIP_02",
        "NameGXT": "WCT_GRIP",
        "DescriptionGXT": "WCD_GRIP",
        "Name": "Grip",
        "Description": "Improves weapon accuracy.",
        "ModelHashKey": "w_at_afgrip_2",
        "IsDefault": false
      },
      "2425682848": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_MK2_CAMO",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "w_sr_marksmanriflemk2_camo1",
        "IsDefault": false
      },
      "1931539634": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_MK2_CAMO_02",
        "NameGXT": "WCT_CAMO_2",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Brushstroke Camo",
        "Description": "",
        "ModelHashKey": "w_sr_marksmanriflemk2_camo2",
        "IsDefault": false
      },
      "1624199183": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_MK2_CAMO_03",
        "NameGXT": "WCT_CAMO_3",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Woodland Camo",
        "Description": "",
        "ModelHashKey": "w_sr_marksmanriflemk2_camo3",
        "IsDefault": false
      },
      "4268133183": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_MK2_CAMO_04",
        "NameGXT": "WCT_CAMO_4",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Skull",
        "Description": "",
        "ModelHashKey": "w_sr_marksmanriflemk2_camo4",
        "IsDefault": false
      },
      "4084561241": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_MK2_CAMO_05",
        "NameGXT": "WCT_CAMO_5",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Sessanta Nove",
        "Description": "",
        "ModelHashKey": "w_sr_marksmanriflemk2_camo5",
        "IsDefault": false
      },
      "423313640": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_MK2_CAMO_06",
        "NameGXT": "WCT_CAMO_6",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Perseus",
        "Description": "",
        "ModelHashKey": "w_sr_marksmanriflemk2_camo6",
        "IsDefault": false
      },
      "276639596": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_MK2_CAMO_07",
        "NameGXT": "WCT_CAMO_7",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Leopard",
        "Description": "",
        "ModelHashKey": "w_sr_marksmanriflemk2_camo7",
        "IsDefault": false
      },
      "3303610433": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_MK2_CAMO_08",
        "NameGXT": "WCT_CAMO_8",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Zebra",
        "Description": "",
        "ModelHashKey": "w_sr_marksmanriflemk2_camo8",
        "IsDefault": false
      },
      "2612118995": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_MK2_CAMO_09",
        "NameGXT": "WCT_CAMO_9",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Geometric",
        "Description": "",
        "ModelHashKey": "w_sr_marksmanriflemk2_camo9",
        "IsDefault": false
      },
      "996213771": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_MK2_CAMO_10",
        "NameGXT": "WCT_CAMO_10",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Boom!",
        "Description": "",
        "ModelHashKey": "w_sr_marksmanriflemk2_camo10",
        "IsDefault": false
      },
      "3080918746": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_MK2_CAMO_IND_01",
        "NameGXT": "WCT_CAMO_10",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Boom!",
        "Description": "",
        "ModelHashKey": "w_sr_marksmanriflemk2_camo_ind",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WCT_TINT_0",
        "Name": "Classic Black"
      },
      {
        "NameGXT": "WCT_TINT_1",
        "Name": "Classic Gray"
      },
      {
        "NameGXT": "WCT_TINT_2",
        "Name": "Classic Two-Tone"
      },
      {
        "NameGXT": "WCT_TINT_3",
        "Name": "Classic White"
      },
      {
        "NameGXT": "WCT_TINT_4",
        "Name": "Classic Beige"
      },
      {
        "NameGXT": "WCT_TINT_5",
        "Name": "Classic Green"
      },
      {
        "NameGXT": "WCT_TINT_6",
        "Name": "Classic Blue"
      },
      {
        "NameGXT": "WCT_TINT_7",
        "Name": "Classic Earth"
      },
      {
        "NameGXT": "WCT_TINT_8",
        "Name": "Classic Brown & Black"
      },
      {
        "NameGXT": "WCT_TINT_9",
        "Name": "Red Contrast"
      },
      {
        "NameGXT": "WCT_TINT_10",
        "Name": "Blue Contrast"
      },
      {
        "NameGXT": "WCT_TINT_11",
        "Name": "Yellow Contrast"
      },
      {
        "NameGXT": "WCT_TINT_12",
        "Name": "Orange Contrast"
      },
      {
        "NameGXT": "WCT_TINT_13",
        "Name": "Bold Pink"
      },
      {
        "NameGXT": "WCT_TINT_14",
        "Name": "Bold Purple & Yellow"
      },
      {
        "NameGXT": "WCT_TINT_15",
        "Name": "Bold Orange"
      },
      {
        "NameGXT": "WCT_TINT_16",
        "Name": "Bold Green & Purple"
      },
      {
        "NameGXT": "WCT_TINT_17",
        "Name": "Bold Red Features"
      },
      {
        "NameGXT": "WCT_TINT_18",
        "Name": "Bold Green Features"
      },
      {
        "NameGXT": "WCT_TINT_19",
        "Name": "Bold Cyan Features"
      },
      {
        "NameGXT": "WCT_TINT_20",
        "Name": "Bold Yellow Features"
      },
      {
        "NameGXT": "WCT_TINT_21",
        "Name": "Bold Red & White"
      },
      {
        "NameGXT": "WCT_TINT_22",
        "Name": "Bold Blue & White"
      },
      {
        "NameGXT": "WCT_TINT_23",
        "Name": "Metallic Gold"
      },
      {
        "NameGXT": "WCT_TINT_24",
        "Name": "Metallic Platinum"
      },
      {
        "NameGXT": "WCT_TINT_25",
        "Name": "Metallic Gray & Lilac"
      },
      {
        "NameGXT": "WCT_TINT_26",
        "Name": "Metallic Purple & Lime"
      },
      {
        "NameGXT": "WCT_TINT_27",
        "Name": "Metallic Red"
      },
      {
        "NameGXT": "WCT_TINT_28",
        "Name": "Metallic Green"
      },
      {
        "NameGXT": "WCT_TINT_29",
        "Name": "Metallic Blue"
      },
      {
        "NameGXT": "WCT_TINT_30",
        "Name": "Metallic White & Aqua"
      },
      {
        "NameGXT": "WCT_TINT_31",
        "Name": "Metallic Red & Yellow"
      }
    ],
    "DLC": "mpchristmas2017"
  },
  "1432025498": {
    "HashKey": "WEAPON_PUMPSHOTGUN_MK2",
    "NameGXT": "WT_SG_PMP2",
    "DescriptionGXT": "WTD_SG_PMP2",
    "Name": "Pump Shotgun Mk II",
    "Description": "Only one thing pumps more action than a pump action: watch out, the recoil is almost as deadly as the shot.",
    "Group": "GROUP_SHOTGUN",
    "ModelHashKey": "w_sg_pumpshotgunmk2",
    "DefaultClipSize": 8,
    "Components": {
      "3449028929": {
        "HashKey": "COMPONENT_PUMPSHOTGUN_MK2_CLIP_01",
        "NameGXT": "WCT_SHELL",
        "DescriptionGXT": "WCD_SHELL",
        "Name": "Default Shells",
        "Description": "Standard shotgun ammunition.",
        "ModelHashKey": "w_sg_pumpshotgunmk2_mag1",
        "IsDefault": true
      },
      "2676628469": {
        "HashKey": "COMPONENT_PUMPSHOTGUN_MK2_CLIP_INCENDIARY",
        "NameGXT": "WCT_SHELL_INC",
        "DescriptionGXT": "WCD_SHELL_INC",
        "Name": "Dragon's Breath Shells",
        "Description": "Has a chance to set targets on fire when shot.",
        "ModelHashKey": "w_sg_pumpshotgunmk2_mag_inc",
        "IsDefault": false
      },
      "1315288101": {
        "HashKey": "COMPONENT_PUMPSHOTGUN_MK2_CLIP_ARMORPIERCING",
        "NameGXT": "WCT_SHELL_AP",
        "DescriptionGXT": "WCD_SHELL_AP",
        "Name": "Steel Buckshot Shells",
        "Description": "Increased penetration of Body Armor.",
        "ModelHashKey": "w_sg_pumpshotgunmk2_mag_ap",
        "IsDefault": false
      },
      "3914869031": {
        "HashKey": "COMPONENT_PUMPSHOTGUN_MK2_CLIP_HOLLOWPOINT",
        "NameGXT": "WCT_SHELL_HP",
        "DescriptionGXT": "WCD_SHELL_HP",
        "Name": "Flechette Shells",
        "Description": "Increased damage to targets without Body Armor.",
        "ModelHashKey": "w_sg_pumpshotgunmk2_mag_hp",
        "IsDefault": false
      },
      "1004815965": {
        "HashKey": "COMPONENT_PUMPSHOTGUN_MK2_CLIP_EXPLOSIVE",
        "NameGXT": "WCT_SHELL_EX",
        "DescriptionGXT": "WCD_SHELL_EX",
        "Name": "Explosive Slugs",
        "Description": "Projectile which explodes on impact.",
        "ModelHashKey": "w_sg_pumpshotgunmk2_mag_exp",
        "IsDefault": false
      },
      "1108334355": {
        "HashKey": "COMPONENT_AT_SIGHTS",
        "NameGXT": "WCT_HOLO",
        "DescriptionGXT": "WCD_HOLO",
        "Name": "Holographic Sight",
        "Description": "Accurate sight for close quarters combat.",
        "ModelHashKey": "w_at_sights_1",
        "IsDefault": false
      },
      "77277509": {
        "HashKey": "COMPONENT_AT_SCOPE_MACRO_MK2",
        "NameGXT": "WCT_SCOPE_MAC2",
        "DescriptionGXT": "WCD_SCOPE_MAC",
        "Name": "Small Scope",
        "Description": "Standard-range zoom functionality.",
        "ModelHashKey": "w_at_scope_macro",
        "IsDefault": false
      },
      "1060929921": {
        "HashKey": "COMPONENT_AT_SCOPE_SMALL_MK2",
        "NameGXT": "WCT_SCOPE_SML2",
        "DescriptionGXT": "WCD_SCOPE_SML",
        "Name": "Medium Scope",
        "Description": "Medium-range zoom functionality.",
        "ModelHashKey": "w_at_scope_small",
        "IsDefault": false
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "2890063729": {
        "HashKey": "COMPONENT_AT_SR_SUPP_03",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_SR_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_sr_supp3",
        "IsDefault": false
      },
      "1602080333": {
        "HashKey": "COMPONENT_AT_MUZZLE_08",
        "NameGXT": "WCT_MUZZ8",
        "DescriptionGXT": "WCD_MUZZ_SR",
        "Name": "Squared Muzzle Brake",
        "Description": "Reduces recoil when firing.",
        "ModelHashKey": "w_at_muzzle_8_xm17",
        "IsDefault": false
      },
      "3820854852": {
        "HashKey": "COMPONENT_PUMPSHOTGUN_MK2_CAMO",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "w_sg_pumpshotgunmk2_camo1",
        "IsDefault": false
      },
      "387223451": {
        "HashKey": "COMPONENT_PUMPSHOTGUN_MK2_CAMO_02",
        "NameGXT": "WCT_CAMO_2",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Brushstroke Camo",
        "Description": "",
        "ModelHashKey": "w_sg_pumpshotgunmk2_camo2",
        "IsDefault": false
      },
      "617753366": {
        "HashKey": "COMPONENT_PUMPSHOTGUN_MK2_CAMO_03",
        "NameGXT": "WCT_CAMO_3",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Woodland Camo",
        "Description": "",
        "ModelHashKey": "w_sg_pumpshotgunmk2_camo3",
        "IsDefault": false
      },
      "4072589040": {
        "HashKey": "COMPONENT_PUMPSHOTGUN_MK2_CAMO_04",
        "NameGXT": "WCT_CAMO_4",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Skull",
        "Description": "",
        "ModelHashKey": "w_sg_pumpshotgunmk2_camo4",
        "IsDefault": false
      },
      "8741501": {
        "HashKey": "COMPONENT_PUMPSHOTGUN_MK2_CAMO_05",
        "NameGXT": "WCT_CAMO_5",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Sessanta Nove",
        "Description": "",
        "ModelHashKey": "w_sg_pumpshotgunmk2_camo5",
        "IsDefault": false
      },
      "3693681093": {
        "HashKey": "COMPONENT_PUMPSHOTGUN_MK2_CAMO_06",
        "NameGXT": "WCT_CAMO_6",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Perseus",
        "Description": "",
        "ModelHashKey": "w_sg_pumpshotgunmk2_camo6",
        "IsDefault": false
      },
      "3783533691": {
        "HashKey": "COMPONENT_PUMPSHOTGUN_MK2_CAMO_07",
        "NameGXT": "WCT_CAMO_7",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Leopard",
        "Description": "",
        "ModelHashKey": "w_sg_pumpshotgunmk2_camo7",
        "IsDefault": false
      },
      "3639579478": {
        "HashKey": "COMPONENT_PUMPSHOTGUN_MK2_CAMO_08",
        "NameGXT": "WCT_CAMO_8",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Zebra",
        "Description": "",
        "ModelHashKey": "w_sg_pumpshotgunmk2_camo8",
        "IsDefault": false
      },
      "4012490698": {
        "HashKey": "COMPONENT_PUMPSHOTGUN_MK2_CAMO_09",
        "NameGXT": "WCT_CAMO_9",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Geometric",
        "Description": "",
        "ModelHashKey": "w_sg_pumpshotgunmk2_camo9",
        "IsDefault": false
      },
      "1739501925": {
        "HashKey": "COMPONENT_PUMPSHOTGUN_MK2_CAMO_10",
        "NameGXT": "WCT_CAMO_10",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Boom!",
        "Description": "",
        "ModelHashKey": "w_sg_pumpshotgunmk2_camo10",
        "IsDefault": false
      },
      "1178671645": {
        "HashKey": "COMPONENT_PUMPSHOTGUN_MK2_CAMO_IND_01",
        "NameGXT": "WCT_CAMO_IND",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Patriotic",
        "Description": "",
        "ModelHashKey": "w_sg_pumpshotgunmk2_camo_ind1",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WCT_TINT_0",
        "Name": "Classic Black"
      },
      {
        "NameGXT": "WCT_TINT_1",
        "Name": "Classic Gray"
      },
      {
        "NameGXT": "WCT_TINT_2",
        "Name": "Classic Two-Tone"
      },
      {
        "NameGXT": "WCT_TINT_3",
        "Name": "Classic White"
      },
      {
        "NameGXT": "WCT_TINT_4",
        "Name": "Classic Beige"
      },
      {
        "NameGXT": "WCT_TINT_5",
        "Name": "Classic Green"
      },
      {
        "NameGXT": "WCT_TINT_6",
        "Name": "Classic Blue"
      },
      {
        "NameGXT": "WCT_TINT_7",
        "Name": "Classic Earth"
      },
      {
        "NameGXT": "WCT_TINT_8",
        "Name": "Classic Brown & Black"
      },
      {
        "NameGXT": "WCT_TINT_9",
        "Name": "Red Contrast"
      },
      {
        "NameGXT": "WCT_TINT_10",
        "Name": "Blue Contrast"
      },
      {
        "NameGXT": "WCT_TINT_11",
        "Name": "Yellow Contrast"
      },
      {
        "NameGXT": "WCT_TINT_12",
        "Name": "Orange Contrast"
      },
      {
        "NameGXT": "WCT_TINT_13",
        "Name": "Bold Pink"
      },
      {
        "NameGXT": "WCT_TINT_14",
        "Name": "Bold Purple & Yellow"
      },
      {
        "NameGXT": "WCT_TINT_15",
        "Name": "Bold Orange"
      },
      {
        "NameGXT": "WCT_TINT_16",
        "Name": "Bold Green & Purple"
      },
      {
        "NameGXT": "WCT_TINT_17",
        "Name": "Bold Red Features"
      },
      {
        "NameGXT": "WCT_TINT_18",
        "Name": "Bold Green Features"
      },
      {
        "NameGXT": "WCT_TINT_19",
        "Name": "Bold Cyan Features"
      },
      {
        "NameGXT": "WCT_TINT_20",
        "Name": "Bold Yellow Features"
      },
      {
        "NameGXT": "WCT_TINT_21",
        "Name": "Bold Red & White"
      },
      {
        "NameGXT": "WCT_TINT_22",
        "Name": "Bold Blue & White"
      },
      {
        "NameGXT": "WCT_TINT_23",
        "Name": "Metallic Gold"
      },
      {
        "NameGXT": "WCT_TINT_24",
        "Name": "Metallic Platinum"
      },
      {
        "NameGXT": "WCT_TINT_25",
        "Name": "Metallic Gray & Lilac"
      },
      {
        "NameGXT": "WCT_TINT_26",
        "Name": "Metallic Purple & Lime"
      },
      {
        "NameGXT": "WCT_TINT_27",
        "Name": "Metallic Red"
      },
      {
        "NameGXT": "WCT_TINT_28",
        "Name": "Metallic Green"
      },
      {
        "NameGXT": "WCT_TINT_29",
        "Name": "Metallic Blue"
      },
      {
        "NameGXT": "WCT_TINT_30",
        "Name": "Metallic White & Aqua"
      },
      {
        "NameGXT": "WCT_TINT_31",
        "Name": "Metallic Red & Yellow"
      }
    ],
    "DLC": "mpchristmas2017"
  },
  "3415619887": {
    "HashKey": "WEAPON_REVOLVER_MK2",
    "NameGXT": "WT_REVOLVER2",
    "DescriptionGXT": "WTD_REVOLVER2",
    "Name": "Heavy Revolver Mk II",
    "Description": "If you can lift it, this is the closest you'll get to shooting someone with a freight train.",
    "Group": "GROUP_PISTOL",
    "ModelHashKey": "w_pi_revolvermk2",
    "DefaultClipSize": 6,
    "Components": {
      "3122911422": {
        "HashKey": "COMPONENT_REVOLVER_MK2_CLIP_01",
        "NameGXT": "WCT_CLIP1_RV",
        "DescriptionGXT": "WCD_CLIP1_RV",
        "Name": "Default Rounds",
        "Description": "Standard revolver ammunition.",
        "ModelHashKey": "w_pi_revolvermk2_mag1",
        "IsDefault": true
      },
      "3336103030": {
        "HashKey": "COMPONENT_REVOLVER_MK2_CLIP_TRACER",
        "NameGXT": "WCT_CLIP_TR",
        "DescriptionGXT": "WCD_CLIP_TR_RV",
        "Name": "Tracer Rounds",
        "Description": "Bullets with bright visible markers that match the tint of the gun.",
        "ModelHashKey": "w_pi_revolvermk2_mag4",
        "IsDefault": false
      },
      "15712037": {
        "HashKey": "COMPONENT_REVOLVER_MK2_CLIP_INCENDIARY",
        "NameGXT": "WCT_CLIP_INC",
        "DescriptionGXT": "WCD_CLIP_INC_RV",
        "Name": "Incendiary Rounds",
        "Description": "Bullets which set targets on fire when shot.",
        "ModelHashKey": "w_pi_revolvermk2_mag3",
        "IsDefault": false
      },
      "284438159": {
        "HashKey": "COMPONENT_REVOLVER_MK2_CLIP_HOLLOWPOINT",
        "NameGXT": "WCT_CLIP_HP",
        "DescriptionGXT": "WCD_CLIP_HP_RV",
        "Name": "Hollow Point Rounds",
        "Description": "Increased damage to targets without Body Armor.",
        "ModelHashKey": "w_pi_revolvermk2_mag2",
        "IsDefault": false
      },
      "231258687": {
        "HashKey": "COMPONENT_REVOLVER_MK2_CLIP_FMJ",
        "NameGXT": "WCT_CLIP_FMJ",
        "DescriptionGXT": "WCD_CLIP_FMJ_RV",
        "Name": "Full Metal Jacket Rounds",
        "Description": "Increased damage to vehicles. Also penetrates bullet resistant and bulletproof vehicle glass.",
        "ModelHashKey": "w_pi_revolvermk2_mag5",
        "IsDefault": false
      },
      "1108334355": {
        "HashKey": "COMPONENT_AT_SIGHTS",
        "NameGXT": "WCT_HOLO",
        "DescriptionGXT": "WCD_HOLO",
        "Name": "Holographic Sight",
        "Description": "Accurate sight for close quarters combat.",
        "ModelHashKey": "w_at_sights_1",
        "IsDefault": false
      },
      "77277509": {
        "HashKey": "COMPONENT_AT_SCOPE_MACRO_MK2",
        "NameGXT": "WCT_SCOPE_MAC2",
        "DescriptionGXT": "WCD_SCOPE_MAC",
        "Name": "Small Scope",
        "Description": "Standard-range zoom functionality.",
        "ModelHashKey": "w_at_scope_macro",
        "IsDefault": false
      },
      "899381934": {
        "HashKey": "COMPONENT_AT_PI_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_pi_flsh",
        "IsDefault": false
      },
      "654802123": {
        "HashKey": "COMPONENT_AT_PI_COMP_03",
        "NameGXT": "WCT_COMP",
        "DescriptionGXT": "WCD_COMP",
        "Name": "Compensator",
        "Description": "Reduces recoil for rapid fire.",
        "ModelHashKey": "w_at_pi_comp_3",
        "IsDefault": false
      },
      "3225415071": {
        "HashKey": "COMPONENT_REVOLVER_MK2_CAMO",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "w_pi_revolvermk2_camo1",
        "IsDefault": false
      },
      "11918884": {
        "HashKey": "COMPONENT_REVOLVER_MK2_CAMO_02",
        "NameGXT": "WCT_CAMO_2",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Brushstroke Camo",
        "Description": "",
        "ModelHashKey": "w_pi_revolvermk2_camo2",
        "IsDefault": false
      },
      "176157112": {
        "HashKey": "COMPONENT_REVOLVER_MK2_CAMO_03",
        "NameGXT": "WCT_CAMO_3",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Woodland Camo",
        "Description": "",
        "ModelHashKey": "w_pi_revolvermk2_camo3",
        "IsDefault": false
      },
      "4074914441": {
        "HashKey": "COMPONENT_REVOLVER_MK2_CAMO_04",
        "NameGXT": "WCT_CAMO_4",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Skull",
        "Description": "",
        "ModelHashKey": "w_pi_revolvermk2_camo4",
        "IsDefault": false
      },
      "288456487": {
        "HashKey": "COMPONENT_REVOLVER_MK2_CAMO_05",
        "NameGXT": "WCT_CAMO_5",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Sessanta Nove",
        "Description": "",
        "ModelHashKey": "w_pi_revolvermk2_camo5",
        "IsDefault": false
      },
      "398658626": {
        "HashKey": "COMPONENT_REVOLVER_MK2_CAMO_06",
        "NameGXT": "WCT_CAMO_6",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Perseus",
        "Description": "",
        "ModelHashKey": "w_pi_revolvermk2_camo6",
        "IsDefault": false
      },
      "628697006": {
        "HashKey": "COMPONENT_REVOLVER_MK2_CAMO_07",
        "NameGXT": "WCT_CAMO_7",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Leopard",
        "Description": "",
        "ModelHashKey": "w_pi_revolvermk2_camo7",
        "IsDefault": false
      },
      "925911836": {
        "HashKey": "COMPONENT_REVOLVER_MK2_CAMO_08",
        "NameGXT": "WCT_CAMO_8",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Zebra",
        "Description": "",
        "ModelHashKey": "w_pi_revolvermk2_camo8",
        "IsDefault": false
      },
      "1222307441": {
        "HashKey": "COMPONENT_REVOLVER_MK2_CAMO_09",
        "NameGXT": "WCT_CAMO_9",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Geometric",
        "Description": "",
        "ModelHashKey": "w_pi_revolvermk2_camo9",
        "IsDefault": false
      },
      "552442715": {
        "HashKey": "COMPONENT_REVOLVER_MK2_CAMO_10",
        "NameGXT": "WCT_CAMO_10",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Boom!",
        "Description": "",
        "ModelHashKey": "w_pi_revolvermk2_camo10",
        "IsDefault": false
      },
      "3646023783": {
        "HashKey": "COMPONENT_REVOLVER_MK2_CAMO_IND_01",
        "NameGXT": "WCT_CAMO_IND",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Patriotic",
        "Description": "",
        "ModelHashKey": "w_pi_revolvermk2_camo_ind",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WCT_TINT_0",
        "Name": "Classic Black"
      },
      {
        "NameGXT": "WCT_TINT_1",
        "Name": "Classic Gray"
      },
      {
        "NameGXT": "WCT_TINT_2",
        "Name": "Classic Two-Tone"
      },
      {
        "NameGXT": "WCT_TINT_3",
        "Name": "Classic White"
      },
      {
        "NameGXT": "WCT_TINT_4",
        "Name": "Classic Beige"
      },
      {
        "NameGXT": "WCT_TINT_5",
        "Name": "Classic Green"
      },
      {
        "NameGXT": "WCT_TINT_6",
        "Name": "Classic Blue"
      },
      {
        "NameGXT": "WCT_TINT_7",
        "Name": "Classic Earth"
      },
      {
        "NameGXT": "WCT_TINT_8",
        "Name": "Classic Brown & Black"
      },
      {
        "NameGXT": "WCT_TINT_9",
        "Name": "Red Contrast"
      },
      {
        "NameGXT": "WCT_TINT_10",
        "Name": "Blue Contrast"
      },
      {
        "NameGXT": "WCT_TINT_11",
        "Name": "Yellow Contrast"
      },
      {
        "NameGXT": "WCT_TINT_12",
        "Name": "Orange Contrast"
      },
      {
        "NameGXT": "WCT_TINT_13",
        "Name": "Bold Pink"
      },
      {
        "NameGXT": "WCT_TINT_14",
        "Name": "Bold Purple & Yellow"
      },
      {
        "NameGXT": "WCT_TINT_15",
        "Name": "Bold Orange"
      },
      {
        "NameGXT": "WCT_TINT_16",
        "Name": "Bold Green & Purple"
      },
      {
        "NameGXT": "WCT_TINT_17",
        "Name": "Bold Red Features"
      },
      {
        "NameGXT": "WCT_TINT_18",
        "Name": "Bold Green Features"
      },
      {
        "NameGXT": "WCT_TINT_19",
        "Name": "Bold Cyan Features"
      },
      {
        "NameGXT": "WCT_TINT_20",
        "Name": "Bold Yellow Features"
      },
      {
        "NameGXT": "WCT_TINT_21",
        "Name": "Bold Red & White"
      },
      {
        "NameGXT": "WCT_TINT_22",
        "Name": "Bold Blue & White"
      },
      {
        "NameGXT": "WCT_TINT_23",
        "Name": "Metallic Gold"
      },
      {
        "NameGXT": "WCT_TINT_24",
        "Name": "Metallic Platinum"
      },
      {
        "NameGXT": "WCT_TINT_25",
        "Name": "Metallic Gray & Lilac"
      },
      {
        "NameGXT": "WCT_TINT_26",
        "Name": "Metallic Purple & Lime"
      },
      {
        "NameGXT": "WCT_TINT_27",
        "Name": "Metallic Red"
      },
      {
        "NameGXT": "WCT_TINT_28",
        "Name": "Metallic Green"
      },
      {
        "NameGXT": "WCT_TINT_29",
        "Name": "Metallic Blue"
      },
      {
        "NameGXT": "WCT_TINT_30",
        "Name": "Metallic White & Aqua"
      },
      {
        "NameGXT": "WCT_TINT_31",
        "Name": "Metallic Red & Yellow"
      }
    ],
    "DLC": "mpchristmas2017"
  },
  "2285322324": {
    "HashKey": "WEAPON_SNSPISTOL_MK2",
    "NameGXT": "WT_SNSPISTOL2",
    "DescriptionGXT": "WTD_SNSPISTOL2",
    "Name": "SNS Pistol Mk II",
    "Description": "The ultimate purse-filler: if you want to make Saturday Night really special, this is your ticket.",
    "Group": "GROUP_PISTOL",
    "ModelHashKey": "w_pi_sns_pistolmk2",
    "DefaultClipSize": 6,
    "Components": {
      "21392614": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for regular ammo.",
        "ModelHashKey": "w_pi_sns_pistolmk2_mag1",
        "IsDefault": true
      },
      "3465283442": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for regular ammo.",
        "ModelHashKey": "w_pi_sns_pistolmk2_mag2",
        "IsDefault": false
      },
      "2418909806": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CLIP_TRACER",
        "NameGXT": "WCT_CLIP_TR",
        "DescriptionGXT": "WCD_CLIP_TR_RV",
        "Name": "Tracer Rounds",
        "Description": "Bullets with bright visible markers that match the tint of the gun.",
        "ModelHashKey": "W_PI_SNS_PistolMK2_Mag_TR",
        "IsDefault": false
      },
      "3870121849": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CLIP_INCENDIARY",
        "NameGXT": "WCT_CLIP_INC",
        "DescriptionGXT": "WCD_CLIP_INC_NS",
        "Name": "Incendiary Rounds",
        "Description": "Bullets which include a chance to set targets on fire when shot.",
        "ModelHashKey": "W_PI_SNS_PistolMK2_Mag_INC",
        "IsDefault": false
      },
      "2366665730": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CLIP_HOLLOWPOINT",
        "NameGXT": "WCT_CLIP_HP",
        "DescriptionGXT": "WCD_CLIP_HP_RV",
        "Name": "Hollow Point Rounds",
        "Description": "Increased damage to targets without Body Armor.",
        "ModelHashKey": "W_PI_SNS_PistolMK2_Mag_HP",
        "IsDefault": false
      },
      "3239176998": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CLIP_FMJ",
        "NameGXT": "WCT_CLIP_FMJ",
        "DescriptionGXT": "WCD_CLIP_FMJ_RV",
        "Name": "Full Metal Jacket Rounds",
        "Description": "Increased damage to vehicles. Also penetrates bullet resistant and bulletproof vehicle glass.",
        "ModelHashKey": "W_PI_SNS_PistolMK2_Mag_FMJ",
        "IsDefault": false
      },
      "1246324211": {
        "HashKey": "COMPONENT_AT_PI_FLSH_03",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_pi_snsmk2_flsh_1",
        "IsDefault": false
      },
      "1205768792": {
        "HashKey": "COMPONENT_AT_PI_RAIL_02",
        "NameGXT": "WCT_SCOPE_PI",
        "DescriptionGXT": "WCD_SCOPE_PI",
        "Name": "Mounted Scope",
        "Description": "Standard-range zoom functionality.",
        "ModelHashKey": "w_at_pi_rail_2",
        "IsDefault": false
      },
      "1709866683": {
        "HashKey": "COMPONENT_AT_PI_SUPP_02",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_PI_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_pi_supp_2",
        "IsDefault": false
      },
      "2860680127": {
        "HashKey": "COMPONENT_AT_PI_COMP_02",
        "NameGXT": "WCT_COMP",
        "DescriptionGXT": "WCD_COMP",
        "Name": "Compensator",
        "Description": "Reduces recoil for rapid fire.",
        "ModelHashKey": "w_at_pi_comp_2",
        "IsDefault": false
      },
      "259780317": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_Camo1",
        "IsDefault": false
      },
      "2321624822": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_02",
        "NameGXT": "WCT_CAMO_2",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Brushstroke Camo",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_Camo2",
        "IsDefault": false
      },
      "1996130345": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_03",
        "NameGXT": "WCT_CAMO_3",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Woodland Camo",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_Camo3",
        "IsDefault": false
      },
      "2839309484": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_04",
        "NameGXT": "WCT_CAMO_4",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Skull",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_Camo4",
        "IsDefault": false
      },
      "2626704212": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_05",
        "NameGXT": "WCT_CAMO_5",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Sessanta Nove",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_Camo5",
        "IsDefault": false
      },
      "1308243489": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_06",
        "NameGXT": "WCT_CAMO_6",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Perseus",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_Camo6",
        "IsDefault": false
      },
      "1122574335": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_07",
        "NameGXT": "WCT_CAMO_7",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Leopard",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_Camo7",
        "IsDefault": false
      },
      "1420313469": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_08",
        "NameGXT": "WCT_CAMO_8",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Zebra",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_Camo8",
        "IsDefault": false
      },
      "109848390": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_09",
        "NameGXT": "WCT_CAMO_9",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Geometric",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_Camo9",
        "IsDefault": false
      },
      "593945703": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_10",
        "NameGXT": "WCT_CAMO_10",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Boom!",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_Camo10",
        "IsDefault": false
      },
      "1142457062": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_IND_01",
        "NameGXT": "WCT_CAMO_10",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Boom!",
        "Description": "",
        "ModelHashKey": "w_pi_sns_pistolmk2_camo_ind1",
        "IsDefault": false
      },
      "3891161322": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_SLIDE",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_SL_Camo1",
        "IsDefault": false
      },
      "691432737": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_02_SLIDE",
        "NameGXT": "WCT_CAMO_2",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Brushstroke Camo",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_SL_Camo2",
        "IsDefault": false
      },
      "987648331": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_03_SLIDE",
        "NameGXT": "WCT_CAMO_3",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Woodland Camo",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_SL_Camo3",
        "IsDefault": false
      },
      "3863286761": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_04_SLIDE",
        "NameGXT": "WCT_CAMO_4",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Skull",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_SL_Camo4",
        "IsDefault": false
      },
      "3447384986": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_05_SLIDE",
        "NameGXT": "WCT_CAMO_5",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Sessanta Nove",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_SL_Camo5",
        "IsDefault": false
      },
      "4202375078": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_06_SLIDE",
        "NameGXT": "WCT_CAMO_6",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Perseus",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_SL_Camo6",
        "IsDefault": false
      },
      "3800418970": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_07_SLIDE",
        "NameGXT": "WCT_CAMO_7",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Leopard",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_SL_Camo7",
        "IsDefault": false
      },
      "730876697": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_08_SLIDE",
        "NameGXT": "WCT_CAMO_8",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Zebra",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_SL_Camo8",
        "IsDefault": false
      },
      "583159708": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_09_SLIDE",
        "NameGXT": "WCT_CAMO_9",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Geometric",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_SL_Camo9",
        "IsDefault": false
      },
      "2366463693": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_10_SLIDE",
        "NameGXT": "WCT_CAMO_10",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Boom!",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMk2_SL_Camo10",
        "IsDefault": false
      },
      "520557834": {
        "HashKey": "COMPONENT_SNSPISTOL_MK2_CAMO_IND_01_SLIDE",
        "NameGXT": "WCT_CAMO_IND",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Patriotic",
        "Description": "",
        "ModelHashKey": "W_PI_SNS_PistolMK2_SL_Camo_Ind1",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WCT_TINT_0",
        "Name": "Classic Black"
      },
      {
        "NameGXT": "WCT_TINT_1",
        "Name": "Classic Gray"
      },
      {
        "NameGXT": "WCT_TINT_2",
        "Name": "Classic Two-Tone"
      },
      {
        "NameGXT": "WCT_TINT_3",
        "Name": "Classic White"
      },
      {
        "NameGXT": "WCT_TINT_4",
        "Name": "Classic Beige"
      },
      {
        "NameGXT": "WCT_TINT_5",
        "Name": "Classic Green"
      },
      {
        "NameGXT": "WCT_TINT_6",
        "Name": "Classic Blue"
      },
      {
        "NameGXT": "WCT_TINT_7",
        "Name": "Classic Earth"
      },
      {
        "NameGXT": "WCT_TINT_8",
        "Name": "Classic Brown & Black"
      },
      {
        "NameGXT": "WCT_TINT_9",
        "Name": "Red Contrast"
      },
      {
        "NameGXT": "WCT_TINT_10",
        "Name": "Blue Contrast"
      },
      {
        "NameGXT": "WCT_TINT_11",
        "Name": "Yellow Contrast"
      },
      {
        "NameGXT": "WCT_TINT_12",
        "Name": "Orange Contrast"
      },
      {
        "NameGXT": "WCT_TINT_13",
        "Name": "Bold Pink"
      },
      {
        "NameGXT": "WCT_TINT_14",
        "Name": "Bold Purple & Yellow"
      },
      {
        "NameGXT": "WCT_TINT_15",
        "Name": "Bold Orange"
      },
      {
        "NameGXT": "WCT_TINT_16",
        "Name": "Bold Green & Purple"
      },
      {
        "NameGXT": "WCT_TINT_17",
        "Name": "Bold Red Features"
      },
      {
        "NameGXT": "WCT_TINT_18",
        "Name": "Bold Green Features"
      },
      {
        "NameGXT": "WCT_TINT_19",
        "Name": "Bold Cyan Features"
      },
      {
        "NameGXT": "WCT_TINT_20",
        "Name": "Bold Yellow Features"
      },
      {
        "NameGXT": "WCT_TINT_21",
        "Name": "Bold Red & White"
      },
      {
        "NameGXT": "WCT_TINT_22",
        "Name": "Bold Blue & White"
      },
      {
        "NameGXT": "WCT_TINT_23",
        "Name": "Metallic Gold"
      },
      {
        "NameGXT": "WCT_TINT_24",
        "Name": "Metallic Platinum"
      },
      {
        "NameGXT": "WCT_TINT_25",
        "Name": "Metallic Gray & Lilac"
      },
      {
        "NameGXT": "WCT_TINT_26",
        "Name": "Metallic Purple & Lime"
      },
      {
        "NameGXT": "WCT_TINT_27",
        "Name": "Metallic Red"
      },
      {
        "NameGXT": "WCT_TINT_28",
        "Name": "Metallic Green"
      },
      {
        "NameGXT": "WCT_TINT_29",
        "Name": "Metallic Blue"
      },
      {
        "NameGXT": "WCT_TINT_30",
        "Name": "Metallic White & Aqua"
      },
      {
        "NameGXT": "WCT_TINT_31",
        "Name": "Metallic Red & Yellow"
      }
    ],
    "DLC": "mpchristmas2017"
  },
  "2526821735": {
    "HashKey": "WEAPON_SPECIALCARBINE_MK2",
    "NameGXT": "WT_SPCARBINE2",
    "DescriptionGXT": "WTD_SPCARBINE2",
    "Name": "Special Carbine Mk II",
    "Description": "The jack of all trades just got a serious upgrade: bow to the master.",
    "Group": "GROUP_RIFLE",
    "ModelHashKey": "w_ar_specialcarbinemk2",
    "DefaultClipSize": 30,
    "Components": {
      "382112385": {
        "HashKey": "COMPONENT_SPECIALCARBINE_MK2_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for regular ammo.",
        "ModelHashKey": "w_ar_specialcarbinemk2_mag1",
        "IsDefault": true
      },
      "3726614828": {
        "HashKey": "COMPONENT_SPECIALCARBINE_MK2_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for regular ammo.",
        "ModelHashKey": "w_ar_specialcarbinemk2_mag2",
        "IsDefault": false
      },
      "2271594122": {
        "HashKey": "COMPONENT_SPECIALCARBINE_MK2_CLIP_TRACER",
        "NameGXT": "WCT_CLIP_TR",
        "DescriptionGXT": "WCD_CLIP_TR",
        "Name": "Tracer Rounds",
        "Description": "Bullets with bright visible markers that match the tint of the gun. Standard capacity.",
        "ModelHashKey": "w_ar_specialcarbinemk2_mag_tr",
        "IsDefault": false
      },
      "3724612230": {
        "HashKey": "COMPONENT_SPECIALCARBINE_MK2_CLIP_INCENDIARY",
        "NameGXT": "WCT_CLIP_INC",
        "DescriptionGXT": "WCD_CLIP_INC",
        "Name": "Incendiary Rounds",
        "Description": "Bullets which include a chance to set targets on fire when shot. Reduced capacity.",
        "ModelHashKey": "w_ar_specialcarbinemk2_mag_inc",
        "IsDefault": false
      },
      "1362433589": {
        "HashKey": "COMPONENT_SPECIALCARBINE_MK2_CLIP_ARMORPIERCING",
        "NameGXT": "WCT_CLIP_AP",
        "DescriptionGXT": "WCD_CLIP_AP",
        "Name": "Armor Piercing Rounds",
        "Description": "Increased penetration of Body Armor. Reduced capacity.",
        "ModelHashKey": "w_ar_specialcarbinemk2_mag_ap",
        "IsDefault": false
      },
      "1346235024": {
        "HashKey": "COMPONENT_SPECIALCARBINE_MK2_CLIP_FMJ",
        "NameGXT": "WCT_CLIP_FMJ",
        "DescriptionGXT": "WCD_CLIP_FMJ",
        "Name": "Full Metal Jacket Rounds",
        "Description": "Increased damage to vehicles. Also penetrates bullet resistant and bulletproof vehicle glass. Reduced capacity.",
        "ModelHashKey": "w_ar_specialcarbinemk2_mag_fmj",
        "IsDefault": false
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "1108334355": {
        "HashKey": "COMPONENT_AT_SIGHTS",
        "NameGXT": "WCT_HOLO",
        "DescriptionGXT": "WCD_HOLO",
        "Name": "Holographic Sight",
        "Description": "Accurate sight for close quarters combat.",
        "ModelHashKey": "w_at_sights_1",
        "IsDefault": false
      },
      "77277509": {
        "HashKey": "COMPONENT_AT_SCOPE_MACRO_MK2",
        "NameGXT": "WCT_SCOPE_MAC2",
        "DescriptionGXT": "WCD_SCOPE_MAC",
        "Name": "Small Scope",
        "Description": "Standard-range zoom functionality.",
        "ModelHashKey": "w_at_scope_macro",
        "IsDefault": false
      },
      "3328927042": {
        "HashKey": "COMPONENT_AT_SCOPE_MEDIUM_MK2",
        "NameGXT": "WCT_SCOPE_MED2",
        "DescriptionGXT": "WCD_SCOPE_MED",
        "Name": "Large Scope",
        "Description": "Extended-range zoom functionality.",
        "ModelHashKey": "w_at_scope_medium_2",
        "IsDefault": false
      },
      "2805810788": {
        "HashKey": "COMPONENT_AT_AR_SUPP_02",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_AR_SUPP2",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_ar_supp_02",
        "IsDefault": false
      },
      "3113485012": {
        "HashKey": "COMPONENT_AT_MUZZLE_01",
        "NameGXT": "WCT_MUZZ1",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Flat Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_1",
        "IsDefault": false
      },
      "3362234491": {
        "HashKey": "COMPONENT_AT_MUZZLE_02",
        "NameGXT": "WCT_MUZZ2",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Tactical Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_2",
        "IsDefault": false
      },
      "3725708239": {
        "HashKey": "COMPONENT_AT_MUZZLE_03",
        "NameGXT": "WCT_MUZZ3",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Fat-End Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_3",
        "IsDefault": false
      },
      "3968886988": {
        "HashKey": "COMPONENT_AT_MUZZLE_04",
        "NameGXT": "WCT_MUZZ4",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Precision Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_4",
        "IsDefault": false
      },
      "48731514": {
        "HashKey": "COMPONENT_AT_MUZZLE_05",
        "NameGXT": "WCT_MUZZ5",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Heavy Duty Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_5",
        "IsDefault": false
      },
      "880736428": {
        "HashKey": "COMPONENT_AT_MUZZLE_06",
        "NameGXT": "WCT_MUZZ6",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Slanted Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_6",
        "IsDefault": false
      },
      "1303784126": {
        "HashKey": "COMPONENT_AT_MUZZLE_07",
        "NameGXT": "WCT_MUZZ7",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Split-End Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_7",
        "IsDefault": false
      },
      "2640679034": {
        "HashKey": "COMPONENT_AT_AR_AFGRIP_02",
        "NameGXT": "WCT_GRIP",
        "DescriptionGXT": "WCD_GRIP",
        "Name": "Grip",
        "Description": "Improves weapon accuracy.",
        "ModelHashKey": "w_at_afgrip_2",
        "IsDefault": false
      },
      "3879097257": {
        "HashKey": "COMPONENT_AT_SC_BARREL_01",
        "NameGXT": "WCT_BARR",
        "DescriptionGXT": "WCD_BARR",
        "Name": "Default Barrel",
        "Description": "Stock barrel attachment.",
        "ModelHashKey": "w_ar_sc_barrel_1",
        "IsDefault": true
      },
      "4185880635": {
        "HashKey": "COMPONENT_AT_SC_BARREL_02",
        "NameGXT": "WCT_BARR2",
        "DescriptionGXT": "WCD_BARR2",
        "Name": "Heavy Barrel",
        "Description": "Increases damage dealt to long-range targets.",
        "ModelHashKey": "w_ar_sc_barrel_2",
        "IsDefault": false
      },
      "3557537083": {
        "HashKey": "COMPONENT_SPECIALCARBINE_MK2_CAMO",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "w_ar_specialcarbinemk2_camo1",
        "IsDefault": false
      },
      "1125852043": {
        "HashKey": "COMPONENT_SPECIALCARBINE_MK2_CAMO_02",
        "NameGXT": "WCT_CAMO_2",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Brushstroke Camo",
        "Description": "",
        "ModelHashKey": "w_ar_specialcarbinemk2_camo2",
        "IsDefault": false
      },
      "886015732": {
        "HashKey": "COMPONENT_SPECIALCARBINE_MK2_CAMO_03",
        "NameGXT": "WCT_CAMO_3",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Woodland Camo",
        "Description": "",
        "ModelHashKey": "w_ar_specialcarbinemk2_camo3",
        "IsDefault": false
      },
      "3032680157": {
        "HashKey": "COMPONENT_SPECIALCARBINE_MK2_CAMO_04",
        "NameGXT": "WCT_CAMO_4",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Skull",
        "Description": "",
        "ModelHashKey": "w_ar_specialcarbinemk2_camo4",
        "IsDefault": false
      },
      "3999758885": {
        "HashKey": "COMPONENT_SPECIALCARBINE_MK2_CAMO_05",
        "NameGXT": "WCT_CAMO_5",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Sessanta Nove",
        "Description": "",
        "ModelHashKey": "w_ar_specialcarbinemk2_camo5",
        "IsDefault": false
      },
      "3750812792": {
        "HashKey": "COMPONENT_SPECIALCARBINE_MK2_CAMO_06",
        "NameGXT": "WCT_CAMO_6",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Perseus",
        "Description": "",
        "ModelHashKey": "w_ar_specialcarbinemk2_camo6",
        "IsDefault": false
      },
      "172765678": {
        "HashKey": "COMPONENT_SPECIALCARBINE_MK2_CAMO_07",
        "NameGXT": "WCT_CAMO_7",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Leopard",
        "Description": "",
        "ModelHashKey": "w_ar_specialcarbinemk2_camo7",
        "IsDefault": false
      },
      "2312089847": {
        "HashKey": "COMPONENT_SPECIALCARBINE_MK2_CAMO_08",
        "NameGXT": "WCT_CAMO_8",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Zebra",
        "Description": "",
        "ModelHashKey": "w_ar_specialcarbinemk2_camo8",
        "IsDefault": false
      },
      "2072122460": {
        "HashKey": "COMPONENT_SPECIALCARBINE_MK2_CAMO_09",
        "NameGXT": "WCT_CAMO_9",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Geometric",
        "Description": "",
        "ModelHashKey": "w_ar_specialcarbinemk2_camo9",
        "IsDefault": false
      },
      "2308747125": {
        "HashKey": "COMPONENT_SPECIALCARBINE_MK2_CAMO_10",
        "NameGXT": "WCT_CAMO_10",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Boom!",
        "Description": "",
        "ModelHashKey": "w_ar_specialcarbinemk2_camo10",
        "IsDefault": false
      },
      "1377355801": {
        "HashKey": "COMPONENT_SPECIALCARBINE_MK2_CAMO_IND_01",
        "NameGXT": "WCT_CAMO_IND",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Patriotic",
        "Description": "",
        "ModelHashKey": "w_ar_specialcarbinemk2_camo_ind",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WCT_TINT_0",
        "Name": "Classic Black"
      },
      {
        "NameGXT": "WCT_TINT_1",
        "Name": "Classic Gray"
      },
      {
        "NameGXT": "WCT_TINT_2",
        "Name": "Classic Two-Tone"
      },
      {
        "NameGXT": "WCT_TINT_3",
        "Name": "Classic White"
      },
      {
        "NameGXT": "WCT_TINT_4",
        "Name": "Classic Beige"
      },
      {
        "NameGXT": "WCT_TINT_5",
        "Name": "Classic Green"
      },
      {
        "NameGXT": "WCT_TINT_6",
        "Name": "Classic Blue"
      },
      {
        "NameGXT": "WCT_TINT_7",
        "Name": "Classic Earth"
      },
      {
        "NameGXT": "WCT_TINT_8",
        "Name": "Classic Brown & Black"
      },
      {
        "NameGXT": "WCT_TINT_9",
        "Name": "Red Contrast"
      },
      {
        "NameGXT": "WCT_TINT_10",
        "Name": "Blue Contrast"
      },
      {
        "NameGXT": "WCT_TINT_11",
        "Name": "Yellow Contrast"
      },
      {
        "NameGXT": "WCT_TINT_12",
        "Name": "Orange Contrast"
      },
      {
        "NameGXT": "WCT_TINT_13",
        "Name": "Bold Pink"
      },
      {
        "NameGXT": "WCT_TINT_14",
        "Name": "Bold Purple & Yellow"
      },
      {
        "NameGXT": "WCT_TINT_15",
        "Name": "Bold Orange"
      },
      {
        "NameGXT": "WCT_TINT_16",
        "Name": "Bold Green & Purple"
      },
      {
        "NameGXT": "WCT_TINT_17",
        "Name": "Bold Red Features"
      },
      {
        "NameGXT": "WCT_TINT_18",
        "Name": "Bold Green Features"
      },
      {
        "NameGXT": "WCT_TINT_19",
        "Name": "Bold Cyan Features"
      },
      {
        "NameGXT": "WCT_TINT_20",
        "Name": "Bold Yellow Features"
      },
      {
        "NameGXT": "WCT_TINT_21",
        "Name": "Bold Red & White"
      },
      {
        "NameGXT": "WCT_TINT_22",
        "Name": "Bold Blue & White"
      },
      {
        "NameGXT": "WCT_TINT_23",
        "Name": "Metallic Gold"
      },
      {
        "NameGXT": "WCT_TINT_24",
        "Name": "Metallic Platinum"
      },
      {
        "NameGXT": "WCT_TINT_25",
        "Name": "Metallic Gray & Lilac"
      },
      {
        "NameGXT": "WCT_TINT_26",
        "Name": "Metallic Purple & Lime"
      },
      {
        "NameGXT": "WCT_TINT_27",
        "Name": "Metallic Red"
      },
      {
        "NameGXT": "WCT_TINT_28",
        "Name": "Metallic Green"
      },
      {
        "NameGXT": "WCT_TINT_29",
        "Name": "Metallic Blue"
      },
      {
        "NameGXT": "WCT_TINT_30",
        "Name": "Metallic White & Aqua"
      },
      {
        "NameGXT": "WCT_TINT_31",
        "Name": "Metallic Red & Yellow"
      }
    ],
    "DLC": "mpchristmas2017"
  },
  "2939590305": {
    "HashKey": "WEAPON_RAYPISTOL",
    "NameGXT": "WT_RAYPISTOL",
    "DescriptionGXT": "WTD_RAYPISTOL",
    "Name": "Up-n-Atomizer",
    "Description": "Republican Space Ranger Special, fresh from the galactic war on socialism: no ammo, no mag, just one brutal energy pulse after another.",
    "Group": "GROUP_PISTOL",
    "ModelHashKey": "w_pi_raygun",
    "DefaultClipSize": 1,
    "Components": {
      "3621517063": {
        "HashKey": "COMPONENT_RAYPISTOL_VARMOD_XMAS18",
        "NameGXT": "WCT_VAR_RAY18",
        "DescriptionGXT": "WCD_VAR_RAY18",
        "Name": "Festive tint",
        "Description": "The Festive tint for the Up-n-Atomizer.",
        "ModelHashKey": "w_pi_raygun_ev",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "RWT_TINT0",
        "Name": "Blue tint"
      },
      {
        "NameGXT": "RWT_TINT1",
        "Name": "Purple tint"
      },
      {
        "NameGXT": "RWT_TINT2",
        "Name": "Green tint"
      },
      {
        "NameGXT": "RWT_TINT3",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "RWT_TINT4",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "RWT_TINT5",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "RWT_TINT6",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mpchristmas2018"
  },
  "1198256469": {
    "HashKey": "WEAPON_RAYCARBINE",
    "NameGXT": "WT_RAYCARBINE",
    "DescriptionGXT": "WTD_RAYCARBINE",
    "Name": "Unholy Hellbringer",
    "Description": "Republican Space Ranger Special. If you want to turn a little green man into little green goo, this is the only American way to do it.",
    "Group": "GROUP_MG",
    "ModelHashKey": "w_ar_srifle",
    "DefaultClipSize": 9999,
    "Components": {},
    "Tints": [
      {
        "NameGXT": "RWT_TINT7",
        "Name": "Space Ranger tint"
      },
      {
        "NameGXT": "RWT_TINT1",
        "Name": "Purple tint"
      },
      {
        "NameGXT": "RWT_TINT2",
        "Name": "Green tint"
      },
      {
        "NameGXT": "RWT_TINT3",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "RWT_TINT4",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "RWT_TINT5",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "RWT_TINT6",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mpchristmas2018"
  },
  "3056410471": {
    "HashKey": "WEAPON_RAYMINIGUN",
    "NameGXT": "WT_RAYMINIGUN",
    "DescriptionGXT": "WTD_RAYMINIGUN",
    "Name": "Widowmaker",
    "Description": "Republican Space Ranger Special. GO AHEAD, SAY I'M COMPENSATING FOR SOMETHING. I DARE YOU.",
    "Group": "GROUP_HEAVY",
    "ModelHashKey": "w_mg_sminigun",
    "DefaultClipSize": 15000,
    "Components": {
      "3370020614": {
        "HashKey": "COMPONENT_MINIGUN_CLIP_01",
        "NameGXT": "WCT_INVALID",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "",
        "Description": "",
        "ModelHashKey": "",
        "IsDefault": true
      }
    },
    "Tints": [
      {
        "NameGXT": "RWT_TINT7",
        "Name": "Space Ranger tint"
      },
      {
        "NameGXT": "RWT_TINT1",
        "Name": "Purple tint"
      },
      {
        "NameGXT": "RWT_TINT2",
        "Name": "Green tint"
      },
      {
        "NameGXT": "RWT_TINT3",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "RWT_TINT4",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "RWT_TINT5",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "RWT_TINT6",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mpchristmas2018"
  },
  "961495388": {
    "HashKey": "WEAPON_ASSAULTRIFLE_MK2",
    "NameGXT": "WT_RIFLE_ASL2",
    "DescriptionGXT": "WTD_RIFLE_ASL2",
    "Name": "Assault Rifle Mk II",
    "Description": "The definitive revision of an all-time classic: all it takes is a little work, and looks can kill after all.",
    "Group": "GROUP_RIFLE",
    "ModelHashKey": "w_ar_assaultriflemk2",
    "DefaultClipSize": 30,
    "Components": {
      "2249208895": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_MK2_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for regular ammo.",
        "ModelHashKey": "w_ar_assaultriflemk2_mag1",
        "IsDefault": true
      },
      "3509242479": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_MK2_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for regular ammo.",
        "ModelHashKey": "w_ar_assaultriflemk2_mag2",
        "IsDefault": false
      },
      "4012669121": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_MK2_CLIP_TRACER",
        "NameGXT": "WCT_CLIP_TR",
        "DescriptionGXT": "WCD_CLIP_TR",
        "Name": "Tracer Rounds",
        "Description": "Bullets with bright visible markers that match the tint of the gun. Standard capacity.",
        "ModelHashKey": "w_ar_assaultriflemk2_mag_tr",
        "IsDefault": false
      },
      "4218476627": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_MK2_CLIP_INCENDIARY",
        "NameGXT": "WCT_CLIP_INC",
        "DescriptionGXT": "WCD_CLIP_INC",
        "Name": "Incendiary Rounds",
        "Description": "Bullets which include a chance to set targets on fire when shot. Reduced capacity.",
        "ModelHashKey": "w_ar_assaultriflemk2_mag_inc",
        "IsDefault": false
      },
      "2816286296": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_MK2_CLIP_ARMORPIERCING",
        "NameGXT": "WCT_CLIP_AP",
        "DescriptionGXT": "WCD_CLIP_AP",
        "Name": "Armor Piercing Rounds",
        "Description": "Increased penetration of Body Armor. Reduced capacity.",
        "ModelHashKey": "w_ar_assaultriflemk2_mag_ap",
        "IsDefault": false
      },
      "1675665560": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_MK2_CLIP_FMJ",
        "NameGXT": "WCT_CLIP_FMJ",
        "DescriptionGXT": "WCD_CLIP_FMJ",
        "Name": "Full Metal Jacket Rounds",
        "Description": "Increased damage to vehicles. Also penetrates bullet resistant and bulletproof vehicle glass. Reduced capacity.",
        "ModelHashKey": "w_ar_assaultriflemk2_mag_fmj",
        "IsDefault": false
      },
      "2640679034": {
        "HashKey": "COMPONENT_AT_AR_AFGRIP_02",
        "NameGXT": "WCT_GRIP",
        "DescriptionGXT": "WCD_GRIP",
        "Name": "Grip",
        "Description": "Improves weapon accuracy.",
        "ModelHashKey": "w_at_afgrip_2",
        "IsDefault": false
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "1108334355": {
        "HashKey": "COMPONENT_AT_SIGHTS",
        "NameGXT": "WCT_HOLO",
        "DescriptionGXT": "WCD_HOLO",
        "Name": "Holographic Sight",
        "Description": "Accurate sight for close quarters combat.",
        "ModelHashKey": "w_at_sights_1",
        "IsDefault": false
      },
      "77277509": {
        "HashKey": "COMPONENT_AT_SCOPE_MACRO_MK2",
        "NameGXT": "WCT_SCOPE_MAC2",
        "DescriptionGXT": "WCD_SCOPE_MAC",
        "Name": "Small Scope",
        "Description": "Standard-range zoom functionality.",
        "ModelHashKey": "w_at_scope_macro",
        "IsDefault": false
      },
      "3328927042": {
        "HashKey": "COMPONENT_AT_SCOPE_MEDIUM_MK2",
        "NameGXT": "WCT_SCOPE_MED2",
        "DescriptionGXT": "WCD_SCOPE_MED",
        "Name": "Large Scope",
        "Description": "Extended-range zoom functionality.",
        "ModelHashKey": "w_at_scope_medium_2",
        "IsDefault": false
      },
      "2805810788": {
        "HashKey": "COMPONENT_AT_AR_SUPP_02",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_AR_SUPP2",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_ar_supp_02",
        "IsDefault": false
      },
      "3113485012": {
        "HashKey": "COMPONENT_AT_MUZZLE_01",
        "NameGXT": "WCT_MUZZ1",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Flat Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_1",
        "IsDefault": false
      },
      "3362234491": {
        "HashKey": "COMPONENT_AT_MUZZLE_02",
        "NameGXT": "WCT_MUZZ2",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Tactical Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_2",
        "IsDefault": false
      },
      "3725708239": {
        "HashKey": "COMPONENT_AT_MUZZLE_03",
        "NameGXT": "WCT_MUZZ3",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Fat-End Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_3",
        "IsDefault": false
      },
      "3968886988": {
        "HashKey": "COMPONENT_AT_MUZZLE_04",
        "NameGXT": "WCT_MUZZ4",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Precision Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_4",
        "IsDefault": false
      },
      "48731514": {
        "HashKey": "COMPONENT_AT_MUZZLE_05",
        "NameGXT": "WCT_MUZZ5",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Heavy Duty Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_5",
        "IsDefault": false
      },
      "880736428": {
        "HashKey": "COMPONENT_AT_MUZZLE_06",
        "NameGXT": "WCT_MUZZ6",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Slanted Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_6",
        "IsDefault": false
      },
      "1303784126": {
        "HashKey": "COMPONENT_AT_MUZZLE_07",
        "NameGXT": "WCT_MUZZ7",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Split-End Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_7",
        "IsDefault": false
      },
      "1134861606": {
        "HashKey": "COMPONENT_AT_AR_BARREL_01",
        "NameGXT": "WCT_BARR",
        "DescriptionGXT": "WCD_BARR",
        "Name": "Default Barrel",
        "Description": "Stock barrel attachment.",
        "ModelHashKey": "w_at_ar_barrel_1",
        "IsDefault": true
      },
      "1447477866": {
        "HashKey": "COMPONENT_AT_AR_BARREL_02",
        "NameGXT": "WCT_BARR2",
        "DescriptionGXT": "WCD_BARR2",
        "Name": "Heavy Barrel",
        "Description": "Increases damage dealt to long-range targets.",
        "ModelHashKey": "w_at_ar_barrel_2",
        "IsDefault": false
      },
      "2434475183": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_MK2_CAMO",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "w_at_armk2_camo1",
        "IsDefault": false
      },
      "937772107": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_MK2_CAMO_02",
        "NameGXT": "WCT_CAMO_2",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Brushstroke Camo",
        "Description": "",
        "ModelHashKey": "w_at_armk2_camo2",
        "IsDefault": false
      },
      "1401650071": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_MK2_CAMO_03",
        "NameGXT": "WCT_CAMO_3",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Woodland Camo",
        "Description": "",
        "ModelHashKey": "w_at_armk2_camo3",
        "IsDefault": false
      },
      "628662130": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_MK2_CAMO_04",
        "NameGXT": "WCT_CAMO_4",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Skull",
        "Description": "",
        "ModelHashKey": "w_at_armk2_camo4",
        "IsDefault": false
      },
      "3309920045": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_MK2_CAMO_05",
        "NameGXT": "WCT_CAMO_5",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Sessanta Nove",
        "Description": "",
        "ModelHashKey": "w_at_armk2_camo5",
        "IsDefault": false
      },
      "3482022833": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_MK2_CAMO_06",
        "NameGXT": "WCT_CAMO_6",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Perseus",
        "Description": "",
        "ModelHashKey": "w_at_armk2_camo6",
        "IsDefault": false
      },
      "2847614993": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_MK2_CAMO_07",
        "NameGXT": "WCT_CAMO_7",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Leopard",
        "Description": "",
        "ModelHashKey": "w_at_armk2_camo7",
        "IsDefault": false
      },
      "4234628436": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_MK2_CAMO_08",
        "NameGXT": "WCT_CAMO_8",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Zebra",
        "Description": "",
        "ModelHashKey": "w_at_armk2_camo8",
        "IsDefault": false
      },
      "2088750491": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_MK2_CAMO_09",
        "NameGXT": "WCT_CAMO_9",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Geometric",
        "Description": "",
        "ModelHashKey": "w_at_armk2_camo9",
        "IsDefault": false
      },
      "2781053842": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_MK2_CAMO_10",
        "NameGXT": "WCT_CAMO_10",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Boom!",
        "Description": "",
        "ModelHashKey": "w_at_armk2_camo10",
        "IsDefault": false
      },
      "3115408816": {
        "HashKey": "COMPONENT_ASSAULTRIFLE_MK2_CAMO_IND_01",
        "NameGXT": "WCT_CAMO_IND",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Patriotic",
        "Description": "",
        "ModelHashKey": "w_at_armk2_camo_ind1",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WCT_TINT_0",
        "Name": "Classic Black"
      },
      {
        "NameGXT": "WCT_TINT_1",
        "Name": "Classic Gray"
      },
      {
        "NameGXT": "WCT_TINT_2",
        "Name": "Classic Two-Tone"
      },
      {
        "NameGXT": "WCT_TINT_3",
        "Name": "Classic White"
      },
      {
        "NameGXT": "WCT_TINT_4",
        "Name": "Classic Beige"
      },
      {
        "NameGXT": "WCT_TINT_5",
        "Name": "Classic Green"
      },
      {
        "NameGXT": "WCT_TINT_6",
        "Name": "Classic Blue"
      },
      {
        "NameGXT": "WCT_TINT_7",
        "Name": "Classic Earth"
      },
      {
        "NameGXT": "WCT_TINT_8",
        "Name": "Classic Brown & Black"
      },
      {
        "NameGXT": "WCT_TINT_9",
        "Name": "Red Contrast"
      },
      {
        "NameGXT": "WCT_TINT_10",
        "Name": "Blue Contrast"
      },
      {
        "NameGXT": "WCT_TINT_11",
        "Name": "Yellow Contrast"
      },
      {
        "NameGXT": "WCT_TINT_12",
        "Name": "Orange Contrast"
      },
      {
        "NameGXT": "WCT_TINT_13",
        "Name": "Bold Pink"
      },
      {
        "NameGXT": "WCT_TINT_14",
        "Name": "Bold Purple & Yellow"
      },
      {
        "NameGXT": "WCT_TINT_15",
        "Name": "Bold Orange"
      },
      {
        "NameGXT": "WCT_TINT_16",
        "Name": "Bold Green & Purple"
      },
      {
        "NameGXT": "WCT_TINT_17",
        "Name": "Bold Red Features"
      },
      {
        "NameGXT": "WCT_TINT_18",
        "Name": "Bold Green Features"
      },
      {
        "NameGXT": "WCT_TINT_19",
        "Name": "Bold Cyan Features"
      },
      {
        "NameGXT": "WCT_TINT_20",
        "Name": "Bold Yellow Features"
      },
      {
        "NameGXT": "WCT_TINT_21",
        "Name": "Bold Red & White"
      },
      {
        "NameGXT": "WCT_TINT_22",
        "Name": "Bold Blue & White"
      },
      {
        "NameGXT": "WCT_TINT_23",
        "Name": "Metallic Gold"
      },
      {
        "NameGXT": "WCT_TINT_24",
        "Name": "Metallic Platinum"
      },
      {
        "NameGXT": "WCT_TINT_25",
        "Name": "Metallic Gray & Lilac"
      },
      {
        "NameGXT": "WCT_TINT_26",
        "Name": "Metallic Purple & Lime"
      },
      {
        "NameGXT": "WCT_TINT_27",
        "Name": "Metallic Red"
      },
      {
        "NameGXT": "WCT_TINT_28",
        "Name": "Metallic Green"
      },
      {
        "NameGXT": "WCT_TINT_29",
        "Name": "Metallic Blue"
      },
      {
        "NameGXT": "WCT_TINT_30",
        "Name": "Metallic White & Aqua"
      },
      {
        "NameGXT": "WCT_TINT_31",
        "Name": "Metallic Red & Yellow"
      }
    ],
    "DLC": "mpgunrunning"
  },
  "4208062921": {
    "HashKey": "WEAPON_CARBINERIFLE_MK2",
    "NameGXT": "WT_RIFLE_CBN2",
    "DescriptionGXT": "WTD_RIFLE_CBN2",
    "Name": "Carbine Rifle Mk II",
    "Description": "This is bespoke, artisan firepower: you couldn't deliver a hail of bullets with more love and care if you inserted them by hand.",
    "Group": "GROUP_RIFLE",
    "ModelHashKey": "w_ar_carbineriflemk2",
    "DefaultClipSize": 30,
    "Components": {
      "1283078430": {
        "HashKey": "COMPONENT_CARBINERIFLE_MK2_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for regular ammo.",
        "ModelHashKey": "w_ar_carbineriflemk2_mag1",
        "IsDefault": true
      },
      "1574296533": {
        "HashKey": "COMPONENT_CARBINERIFLE_MK2_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for regular ammo.",
        "ModelHashKey": "w_ar_carbineriflemk2_mag2",
        "IsDefault": false
      },
      "391640422": {
        "HashKey": "COMPONENT_CARBINERIFLE_MK2_CLIP_TRACER",
        "NameGXT": "WCT_CLIP_TR",
        "DescriptionGXT": "WCD_CLIP_TR",
        "Name": "Tracer Rounds",
        "Description": "Bullets with bright visible markers that match the tint of the gun. Standard capacity.",
        "ModelHashKey": "w_ar_carbineriflemk2_mag_tr",
        "IsDefault": false
      },
      "1025884839": {
        "HashKey": "COMPONENT_CARBINERIFLE_MK2_CLIP_INCENDIARY",
        "NameGXT": "WCT_CLIP_INC",
        "DescriptionGXT": "WCD_CLIP_INC",
        "Name": "Incendiary Rounds",
        "Description": "Bullets which include a chance to set targets on fire when shot. Reduced capacity.",
        "ModelHashKey": "w_ar_carbineriflemk2_mag_inc",
        "IsDefault": false
      },
      "626875735": {
        "HashKey": "COMPONENT_CARBINERIFLE_MK2_CLIP_ARMORPIERCING",
        "NameGXT": "WCT_CLIP_AP",
        "DescriptionGXT": "WCD_CLIP_AP",
        "Name": "Armor Piercing Rounds",
        "Description": "Increased penetration of Body Armor. Reduced capacity.",
        "ModelHashKey": "w_ar_carbineriflemk2_mag_ap",
        "IsDefault": false
      },
      "1141059345": {
        "HashKey": "COMPONENT_CARBINERIFLE_MK2_CLIP_FMJ",
        "NameGXT": "WCT_CLIP_FMJ",
        "DescriptionGXT": "WCD_CLIP_FMJ",
        "Name": "Full Metal Jacket Rounds",
        "Description": "Increased damage to vehicles. Also penetrates bullet resistant and bulletproof vehicle glass. Reduced capacity.",
        "ModelHashKey": "w_ar_carbineriflemk2_mag_fmj",
        "IsDefault": false
      },
      "2640679034": {
        "HashKey": "COMPONENT_AT_AR_AFGRIP_02",
        "NameGXT": "WCT_GRIP",
        "DescriptionGXT": "WCD_GRIP",
        "Name": "Grip",
        "Description": "Improves weapon accuracy.",
        "ModelHashKey": "w_at_afgrip_2",
        "IsDefault": false
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "1108334355": {
        "HashKey": "COMPONENT_AT_SIGHTS",
        "NameGXT": "WCT_HOLO",
        "DescriptionGXT": "WCD_HOLO",
        "Name": "Holographic Sight",
        "Description": "Accurate sight for close quarters combat.",
        "ModelHashKey": "w_at_sights_1",
        "IsDefault": false
      },
      "77277509": {
        "HashKey": "COMPONENT_AT_SCOPE_MACRO_MK2",
        "NameGXT": "WCT_SCOPE_MAC2",
        "DescriptionGXT": "WCD_SCOPE_MAC",
        "Name": "Small Scope",
        "Description": "Standard-range zoom functionality.",
        "ModelHashKey": "w_at_scope_macro",
        "IsDefault": false
      },
      "3328927042": {
        "HashKey": "COMPONENT_AT_SCOPE_MEDIUM_MK2",
        "NameGXT": "WCT_SCOPE_MED2",
        "DescriptionGXT": "WCD_SCOPE_MED",
        "Name": "Large Scope",
        "Description": "Extended-range zoom functionality.",
        "ModelHashKey": "w_at_scope_medium_2",
        "IsDefault": false
      },
      "2205435306": {
        "HashKey": "COMPONENT_AT_AR_SUPP",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_AR_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_ar_supp",
        "IsDefault": false
      },
      "3113485012": {
        "HashKey": "COMPONENT_AT_MUZZLE_01",
        "NameGXT": "WCT_MUZZ1",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Flat Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_1",
        "IsDefault": false
      },
      "3362234491": {
        "HashKey": "COMPONENT_AT_MUZZLE_02",
        "NameGXT": "WCT_MUZZ2",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Tactical Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_2",
        "IsDefault": false
      },
      "3725708239": {
        "HashKey": "COMPONENT_AT_MUZZLE_03",
        "NameGXT": "WCT_MUZZ3",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Fat-End Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_3",
        "IsDefault": false
      },
      "3968886988": {
        "HashKey": "COMPONENT_AT_MUZZLE_04",
        "NameGXT": "WCT_MUZZ4",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Precision Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_4",
        "IsDefault": false
      },
      "48731514": {
        "HashKey": "COMPONENT_AT_MUZZLE_05",
        "NameGXT": "WCT_MUZZ5",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Heavy Duty Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_5",
        "IsDefault": false
      },
      "880736428": {
        "HashKey": "COMPONENT_AT_MUZZLE_06",
        "NameGXT": "WCT_MUZZ6",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Slanted Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_6",
        "IsDefault": false
      },
      "1303784126": {
        "HashKey": "COMPONENT_AT_MUZZLE_07",
        "NameGXT": "WCT_MUZZ7",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Split-End Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_7",
        "IsDefault": false
      },
      "2201368575": {
        "HashKey": "COMPONENT_AT_CR_BARREL_01",
        "NameGXT": "WCT_BARR",
        "DescriptionGXT": "WCD_BARR",
        "Name": "Default Barrel",
        "Description": "Stock barrel attachment.",
        "ModelHashKey": "w_at_cr_barrel_1",
        "IsDefault": true
      },
      "2335983627": {
        "HashKey": "COMPONENT_AT_CR_BARREL_02",
        "NameGXT": "WCT_BARR2",
        "DescriptionGXT": "WCD_BARR2",
        "Name": "Heavy Barrel",
        "Description": "Increases damage dealt to long-range targets.",
        "ModelHashKey": "w_at_cr_barrel_2",
        "IsDefault": false
      },
      "1272803094": {
        "HashKey": "COMPONENT_CARBINERIFLE_MK2_CAMO",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "w_ar_carbineriflemk2_camo1",
        "IsDefault": false
      },
      "1080719624": {
        "HashKey": "COMPONENT_CARBINERIFLE_MK2_CAMO_02",
        "NameGXT": "WCT_CAMO_2",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Brushstroke Camo",
        "Description": "",
        "ModelHashKey": "w_ar_carbineriflemk2_camo2",
        "IsDefault": false
      },
      "792221348": {
        "HashKey": "COMPONENT_CARBINERIFLE_MK2_CAMO_03",
        "NameGXT": "WCT_CAMO_3",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Woodland Camo",
        "Description": "",
        "ModelHashKey": "w_ar_carbineriflemk2_camo3",
        "IsDefault": false
      },
      "3842785869": {
        "HashKey": "COMPONENT_CARBINERIFLE_MK2_CAMO_04",
        "NameGXT": "WCT_CAMO_4",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Skull",
        "Description": "",
        "ModelHashKey": "w_ar_carbineriflemk2_camo4",
        "IsDefault": false
      },
      "3548192559": {
        "HashKey": "COMPONENT_CARBINERIFLE_MK2_CAMO_05",
        "NameGXT": "WCT_CAMO_5",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Sessanta Nove",
        "Description": "",
        "ModelHashKey": "w_ar_carbineriflemk2_camo5",
        "IsDefault": false
      },
      "2250671235": {
        "HashKey": "COMPONENT_CARBINERIFLE_MK2_CAMO_06",
        "NameGXT": "WCT_CAMO_6",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Perseus",
        "Description": "",
        "ModelHashKey": "w_ar_carbineriflemk2_camo6",
        "IsDefault": false
      },
      "4095795318": {
        "HashKey": "COMPONENT_CARBINERIFLE_MK2_CAMO_07",
        "NameGXT": "WCT_CAMO_7",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Leopard",
        "Description": "",
        "ModelHashKey": "w_ar_carbineriflemk2_camo7",
        "IsDefault": false
      },
      "2866892280": {
        "HashKey": "COMPONENT_CARBINERIFLE_MK2_CAMO_08",
        "NameGXT": "WCT_CAMO_8",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Zebra",
        "Description": "",
        "ModelHashKey": "w_ar_carbineriflemk2_camo8",
        "IsDefault": false
      },
      "2559813981": {
        "HashKey": "COMPONENT_CARBINERIFLE_MK2_CAMO_09",
        "NameGXT": "WCT_CAMO_9",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Geometric",
        "Description": "",
        "ModelHashKey": "w_ar_carbineriflemk2_camo9",
        "IsDefault": false
      },
      "1796459838": {
        "HashKey": "COMPONENT_CARBINERIFLE_MK2_CAMO_10",
        "NameGXT": "WCT_CAMO_10",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Boom!",
        "Description": "",
        "ModelHashKey": "w_ar_carbineriflemk2_camo10",
        "IsDefault": false
      },
      "3663056191": {
        "HashKey": "COMPONENT_CARBINERIFLE_MK2_CAMO_IND_01",
        "NameGXT": "WCT_CAMO_IND",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Patriotic",
        "Description": "",
        "ModelHashKey": "w_ar_carbineriflemk2_camo_ind1",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WCT_TINT_0",
        "Name": "Classic Black"
      },
      {
        "NameGXT": "WCT_TINT_1",
        "Name": "Classic Gray"
      },
      {
        "NameGXT": "WCT_TINT_2",
        "Name": "Classic Two-Tone"
      },
      {
        "NameGXT": "WCT_TINT_3",
        "Name": "Classic White"
      },
      {
        "NameGXT": "WCT_TINT_4",
        "Name": "Classic Beige"
      },
      {
        "NameGXT": "WCT_TINT_5",
        "Name": "Classic Green"
      },
      {
        "NameGXT": "WCT_TINT_6",
        "Name": "Classic Blue"
      },
      {
        "NameGXT": "WCT_TINT_7",
        "Name": "Classic Earth"
      },
      {
        "NameGXT": "WCT_TINT_8",
        "Name": "Classic Brown & Black"
      },
      {
        "NameGXT": "WCT_TINT_9",
        "Name": "Red Contrast"
      },
      {
        "NameGXT": "WCT_TINT_10",
        "Name": "Blue Contrast"
      },
      {
        "NameGXT": "WCT_TINT_11",
        "Name": "Yellow Contrast"
      },
      {
        "NameGXT": "WCT_TINT_12",
        "Name": "Orange Contrast"
      },
      {
        "NameGXT": "WCT_TINT_13",
        "Name": "Bold Pink"
      },
      {
        "NameGXT": "WCT_TINT_14",
        "Name": "Bold Purple & Yellow"
      },
      {
        "NameGXT": "WCT_TINT_15",
        "Name": "Bold Orange"
      },
      {
        "NameGXT": "WCT_TINT_16",
        "Name": "Bold Green & Purple"
      },
      {
        "NameGXT": "WCT_TINT_17",
        "Name": "Bold Red Features"
      },
      {
        "NameGXT": "WCT_TINT_18",
        "Name": "Bold Green Features"
      },
      {
        "NameGXT": "WCT_TINT_19",
        "Name": "Bold Cyan Features"
      },
      {
        "NameGXT": "WCT_TINT_20",
        "Name": "Bold Yellow Features"
      },
      {
        "NameGXT": "WCT_TINT_21",
        "Name": "Bold Red & White"
      },
      {
        "NameGXT": "WCT_TINT_22",
        "Name": "Bold Blue & White"
      },
      {
        "NameGXT": "WCT_TINT_23",
        "Name": "Metallic Gold"
      },
      {
        "NameGXT": "WCT_TINT_24",
        "Name": "Metallic Platinum"
      },
      {
        "NameGXT": "WCT_TINT_25",
        "Name": "Metallic Gray & Lilac"
      },
      {
        "NameGXT": "WCT_TINT_26",
        "Name": "Metallic Purple & Lime"
      },
      {
        "NameGXT": "WCT_TINT_27",
        "Name": "Metallic Red"
      },
      {
        "NameGXT": "WCT_TINT_28",
        "Name": "Metallic Green"
      },
      {
        "NameGXT": "WCT_TINT_29",
        "Name": "Metallic Blue"
      },
      {
        "NameGXT": "WCT_TINT_30",
        "Name": "Metallic White & Aqua"
      },
      {
        "NameGXT": "WCT_TINT_31",
        "Name": "Metallic Red & Yellow"
      }
    ],
    "DLC": "mpgunrunning"
  },
  "3686625920": {
    "HashKey": "WEAPON_COMBATMG_MK2",
    "NameGXT": "WT_MG_CBT2",
    "DescriptionGXT": "WTD_MG_CBT2",
    "Name": "Combat MG Mk II",
    "Description": "You can never have too much of a good thing: after all, if the first shot counts, then the next hundred or so must count for double.",
    "Group": "GROUP_MG",
    "ModelHashKey": "w_mg_combatmgmk2",
    "DefaultClipSize": 100,
    "Components": {
      "1227564412": {
        "HashKey": "COMPONENT_COMBATMG_MK2_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for regular ammo.",
        "ModelHashKey": "w_mg_combatmgmk2_mag1",
        "IsDefault": true
      },
      "400507625": {
        "HashKey": "COMPONENT_COMBATMG_MK2_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for regular ammo.",
        "ModelHashKey": "w_mg_combatmgmk2_mag2",
        "IsDefault": false
      },
      "4133787461": {
        "HashKey": "COMPONENT_COMBATMG_MK2_CLIP_TRACER",
        "NameGXT": "WCT_CLIP_TR",
        "DescriptionGXT": "WCD_CLIP_TR",
        "Name": "Tracer Rounds",
        "Description": "Bullets with bright visible markers that match the tint of the gun. Standard capacity.",
        "ModelHashKey": "w_mg_combatmgmk2_mag_tr",
        "IsDefault": false
      },
      "3274096058": {
        "HashKey": "COMPONENT_COMBATMG_MK2_CLIP_INCENDIARY",
        "NameGXT": "WCT_CLIP_INC",
        "DescriptionGXT": "WCD_CLIP_INC",
        "Name": "Incendiary Rounds",
        "Description": "Bullets which include a chance to set targets on fire when shot. Reduced capacity.",
        "ModelHashKey": "w_mg_combatmgmk2_mag_inc",
        "IsDefault": false
      },
      "696788003": {
        "HashKey": "COMPONENT_COMBATMG_MK2_CLIP_ARMORPIERCING",
        "NameGXT": "WCT_CLIP_AP",
        "DescriptionGXT": "WCD_CLIP_AP",
        "Name": "Armor Piercing Rounds",
        "Description": "Increased penetration of Body Armor. Reduced capacity.",
        "ModelHashKey": "w_mg_combatmgmk2_mag_ap",
        "IsDefault": false
      },
      "1475288264": {
        "HashKey": "COMPONENT_COMBATMG_MK2_CLIP_FMJ",
        "NameGXT": "WCT_CLIP_FMJ",
        "DescriptionGXT": "WCD_CLIP_FMJ",
        "Name": "Full Metal Jacket Rounds",
        "Description": "Increased damage to vehicles. Also penetrates bullet resistant and bulletproof vehicle glass. Reduced capacity.",
        "ModelHashKey": "w_mg_combatmgmk2_mag_fmj",
        "IsDefault": false
      },
      "2640679034": {
        "HashKey": "COMPONENT_AT_AR_AFGRIP_02",
        "NameGXT": "WCT_GRIP",
        "DescriptionGXT": "WCD_GRIP",
        "Name": "Grip",
        "Description": "Improves weapon accuracy.",
        "ModelHashKey": "w_at_afgrip_2",
        "IsDefault": false
      },
      "1108334355": {
        "HashKey": "COMPONENT_AT_SIGHTS",
        "NameGXT": "WCT_HOLO",
        "DescriptionGXT": "WCD_HOLO",
        "Name": "Holographic Sight",
        "Description": "Accurate sight for close quarters combat.",
        "ModelHashKey": "w_at_sights_1",
        "IsDefault": false
      },
      "1060929921": {
        "HashKey": "COMPONENT_AT_SCOPE_SMALL_MK2",
        "NameGXT": "WCT_SCOPE_SML2",
        "DescriptionGXT": "WCD_SCOPE_SML",
        "Name": "Medium Scope",
        "Description": "Medium-range zoom functionality.",
        "ModelHashKey": "w_at_scope_small",
        "IsDefault": false
      },
      "3328927042": {
        "HashKey": "COMPONENT_AT_SCOPE_MEDIUM_MK2",
        "NameGXT": "WCT_SCOPE_MED2",
        "DescriptionGXT": "WCD_SCOPE_MED",
        "Name": "Large Scope",
        "Description": "Extended-range zoom functionality.",
        "ModelHashKey": "w_at_scope_medium_2",
        "IsDefault": false
      },
      "3113485012": {
        "HashKey": "COMPONENT_AT_MUZZLE_01",
        "NameGXT": "WCT_MUZZ1",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Flat Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_1",
        "IsDefault": false
      },
      "3362234491": {
        "HashKey": "COMPONENT_AT_MUZZLE_02",
        "NameGXT": "WCT_MUZZ2",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Tactical Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_2",
        "IsDefault": false
      },
      "3725708239": {
        "HashKey": "COMPONENT_AT_MUZZLE_03",
        "NameGXT": "WCT_MUZZ3",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Fat-End Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_3",
        "IsDefault": false
      },
      "3968886988": {
        "HashKey": "COMPONENT_AT_MUZZLE_04",
        "NameGXT": "WCT_MUZZ4",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Precision Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_4",
        "IsDefault": false
      },
      "48731514": {
        "HashKey": "COMPONENT_AT_MUZZLE_05",
        "NameGXT": "WCT_MUZZ5",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Heavy Duty Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_5",
        "IsDefault": false
      },
      "880736428": {
        "HashKey": "COMPONENT_AT_MUZZLE_06",
        "NameGXT": "WCT_MUZZ6",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Slanted Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_6",
        "IsDefault": false
      },
      "1303784126": {
        "HashKey": "COMPONENT_AT_MUZZLE_07",
        "NameGXT": "WCT_MUZZ7",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Split-End Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_7",
        "IsDefault": false
      },
      "3276730932": {
        "HashKey": "COMPONENT_AT_MG_BARREL_01",
        "NameGXT": "WCT_BARR",
        "DescriptionGXT": "WCD_BARR",
        "Name": "Default Barrel",
        "Description": "Stock barrel attachment.",
        "ModelHashKey": "w_at_mg_barrel_1",
        "IsDefault": true
      },
      "3051509595": {
        "HashKey": "COMPONENT_AT_MG_BARREL_02",
        "NameGXT": "WCT_BARR2",
        "DescriptionGXT": "WCD_BARR2",
        "Name": "Heavy Barrel",
        "Description": "Increases damage dealt to long-range targets.",
        "ModelHashKey": "w_at_mg_barrel_2",
        "IsDefault": false
      },
      "1249283253": {
        "HashKey": "COMPONENT_COMBATMG_MK2_CAMO",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "w_mg_combatmgmk2_camo1",
        "IsDefault": false
      },
      "3437259709": {
        "HashKey": "COMPONENT_COMBATMG_MK2_CAMO_02",
        "NameGXT": "WCT_CAMO_2",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Brushstroke Camo",
        "Description": "",
        "ModelHashKey": "w_mg_combatmgmk2_camo2",
        "IsDefault": false
      },
      "3197423398": {
        "HashKey": "COMPONENT_COMBATMG_MK2_CAMO_03",
        "NameGXT": "WCT_CAMO_3",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Woodland Camo",
        "Description": "",
        "ModelHashKey": "w_mg_combatmgmk2_camo3",
        "IsDefault": false
      },
      "1980349969": {
        "HashKey": "COMPONENT_COMBATMG_MK2_CAMO_04",
        "NameGXT": "WCT_CAMO_4",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Skull",
        "Description": "",
        "ModelHashKey": "w_mg_combatmgmk2_camo4",
        "IsDefault": false
      },
      "1219453777": {
        "HashKey": "COMPONENT_COMBATMG_MK2_CAMO_05",
        "NameGXT": "WCT_CAMO_5",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Sessanta Nove",
        "Description": "",
        "ModelHashKey": "w_mg_combatmgmk2_camo5",
        "IsDefault": false
      },
      "2441508106": {
        "HashKey": "COMPONENT_COMBATMG_MK2_CAMO_06",
        "NameGXT": "WCT_CAMO_6",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Perseus",
        "Description": "",
        "ModelHashKey": "w_mg_combatmgmk2_camo6",
        "IsDefault": false
      },
      "2220186280": {
        "HashKey": "COMPONENT_COMBATMG_MK2_CAMO_07",
        "NameGXT": "WCT_CAMO_7",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Leopard",
        "Description": "",
        "ModelHashKey": "w_mg_combatmgmk2_camo7",
        "IsDefault": false
      },
      "457967755": {
        "HashKey": "COMPONENT_COMBATMG_MK2_CAMO_08",
        "NameGXT": "WCT_CAMO_8",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Zebra",
        "Description": "",
        "ModelHashKey": "w_mg_combatmgmk2_camo8",
        "IsDefault": false
      },
      "235171324": {
        "HashKey": "COMPONENT_COMBATMG_MK2_CAMO_09",
        "NameGXT": "WCT_CAMO_9",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Geometric",
        "Description": "",
        "ModelHashKey": "w_mg_combatmgmk2_camo9",
        "IsDefault": false
      },
      "42685294": {
        "HashKey": "COMPONENT_COMBATMG_MK2_CAMO_10",
        "NameGXT": "WCT_CAMO_10",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Boom!",
        "Description": "",
        "ModelHashKey": "w_mg_combatmgmk2_camo10",
        "IsDefault": false
      },
      "3607349581": {
        "HashKey": "COMPONENT_COMBATMG_MK2_CAMO_IND_01",
        "NameGXT": "WCT_CAMO_IND",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Patriotic",
        "Description": "",
        "ModelHashKey": "w_mg_combatmgmk2_camo_ind1",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WCT_TINT_0",
        "Name": "Classic Black"
      },
      {
        "NameGXT": "WCT_TINT_1",
        "Name": "Classic Gray"
      },
      {
        "NameGXT": "WCT_TINT_2",
        "Name": "Classic Two-Tone"
      },
      {
        "NameGXT": "WCT_TINT_3",
        "Name": "Classic White"
      },
      {
        "NameGXT": "WCT_TINT_4",
        "Name": "Classic Beige"
      },
      {
        "NameGXT": "WCT_TINT_5",
        "Name": "Classic Green"
      },
      {
        "NameGXT": "WCT_TINT_6",
        "Name": "Classic Blue"
      },
      {
        "NameGXT": "WCT_TINT_7",
        "Name": "Classic Earth"
      },
      {
        "NameGXT": "WCT_TINT_8",
        "Name": "Classic Brown & Black"
      },
      {
        "NameGXT": "WCT_TINT_9",
        "Name": "Red Contrast"
      },
      {
        "NameGXT": "WCT_TINT_10",
        "Name": "Blue Contrast"
      },
      {
        "NameGXT": "WCT_TINT_11",
        "Name": "Yellow Contrast"
      },
      {
        "NameGXT": "WCT_TINT_12",
        "Name": "Orange Contrast"
      },
      {
        "NameGXT": "WCT_TINT_13",
        "Name": "Bold Pink"
      },
      {
        "NameGXT": "WCT_TINT_14",
        "Name": "Bold Purple & Yellow"
      },
      {
        "NameGXT": "WCT_TINT_15",
        "Name": "Bold Orange"
      },
      {
        "NameGXT": "WCT_TINT_16",
        "Name": "Bold Green & Purple"
      },
      {
        "NameGXT": "WCT_TINT_17",
        "Name": "Bold Red Features"
      },
      {
        "NameGXT": "WCT_TINT_18",
        "Name": "Bold Green Features"
      },
      {
        "NameGXT": "WCT_TINT_19",
        "Name": "Bold Cyan Features"
      },
      {
        "NameGXT": "WCT_TINT_20",
        "Name": "Bold Yellow Features"
      },
      {
        "NameGXT": "WCT_TINT_21",
        "Name": "Bold Red & White"
      },
      {
        "NameGXT": "WCT_TINT_22",
        "Name": "Bold Blue & White"
      },
      {
        "NameGXT": "WCT_TINT_23",
        "Name": "Metallic Gold"
      },
      {
        "NameGXT": "WCT_TINT_24",
        "Name": "Metallic Platinum"
      },
      {
        "NameGXT": "WCT_TINT_25",
        "Name": "Metallic Gray & Lilac"
      },
      {
        "NameGXT": "WCT_TINT_26",
        "Name": "Metallic Purple & Lime"
      },
      {
        "NameGXT": "WCT_TINT_27",
        "Name": "Metallic Red"
      },
      {
        "NameGXT": "WCT_TINT_28",
        "Name": "Metallic Green"
      },
      {
        "NameGXT": "WCT_TINT_29",
        "Name": "Metallic Blue"
      },
      {
        "NameGXT": "WCT_TINT_30",
        "Name": "Metallic White & Aqua"
      },
      {
        "NameGXT": "WCT_TINT_31",
        "Name": "Metallic Red & Yellow"
      }
    ],
    "DLC": "mpgunrunning"
  },
  "177293209": {
    "HashKey": "WEAPON_HEAVYSNIPER_MK2",
    "NameGXT": "WT_SNIP_HVY2",
    "DescriptionGXT": "WTD_SNIP_HVY2",
    "Name": "Heavy Sniper Mk II",
    "Description": "Far away, yet always intimate: if you're looking for a secure foundation for that long-distance relationship, this is it.",
    "Group": "GROUP_SNIPER",
    "ModelHashKey": "w_sr_heavysnipermk2",
    "DefaultClipSize": 6,
    "Components": {
      "4196276776": {
        "HashKey": "COMPONENT_HEAVYSNIPER_MK2_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for regular ammo.",
        "ModelHashKey": "w_sr_heavysnipermk2_mag1",
        "IsDefault": true
      },
      "752418717": {
        "HashKey": "COMPONENT_HEAVYSNIPER_MK2_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for regular ammo.",
        "ModelHashKey": "w_sr_heavysnipermk2_mag2",
        "IsDefault": false
      },
      "247526935": {
        "HashKey": "COMPONENT_HEAVYSNIPER_MK2_CLIP_INCENDIARY",
        "NameGXT": "WCT_CLIP_INC",
        "DescriptionGXT": "WCD_CLIP_INC_SN",
        "Name": "Incendiary Rounds",
        "Description": "Bullets which set targets on fire when shot. Reduced capacity.",
        "ModelHashKey": "w_sr_heavysnipermk2_mag_inc",
        "IsDefault": false
      },
      "4164277972": {
        "HashKey": "COMPONENT_HEAVYSNIPER_MK2_CLIP_ARMORPIERCING",
        "NameGXT": "WCT_CLIP_AP",
        "DescriptionGXT": "WCD_CLIP_AP",
        "Name": "Armor Piercing Rounds",
        "Description": "Increased penetration of Body Armor. Reduced capacity.",
        "ModelHashKey": "w_sr_heavysnipermk2_mag_ap",
        "IsDefault": false
      },
      "1005144310": {
        "HashKey": "COMPONENT_HEAVYSNIPER_MK2_CLIP_FMJ",
        "NameGXT": "WCT_CLIP_FMJ",
        "DescriptionGXT": "WCD_CLIP_FMJ",
        "Name": "Full Metal Jacket Rounds",
        "Description": "Increased damage to vehicles. Also penetrates bullet resistant and bulletproof vehicle glass. Reduced capacity.",
        "ModelHashKey": "w_sr_heavysnipermk2_mag_fmj",
        "IsDefault": false
      },
      "2313935527": {
        "HashKey": "COMPONENT_HEAVYSNIPER_MK2_CLIP_EXPLOSIVE",
        "NameGXT": "WCT_CLIP_EX",
        "DescriptionGXT": "WCD_CLIP_EX",
        "Name": "Explosive Rounds",
        "Description": "Bullets which explode on impact. Reduced capacity.",
        "ModelHashKey": "w_sr_heavysnipermk2_mag_ap2",
        "IsDefault": false
      },
      "2193687427": {
        "HashKey": "COMPONENT_AT_SCOPE_LARGE_MK2",
        "NameGXT": "WCT_SCOPE_LRG2",
        "DescriptionGXT": "WCD_SCOPE_LRG",
        "Name": "Zoom Scope",
        "Description": "Long-range zoom functionality.",
        "ModelHashKey": "w_at_scope_large",
        "IsDefault": false
      },
      "3159677559": {
        "HashKey": "COMPONENT_AT_SCOPE_MAX",
        "NameGXT": "WCT_SCOPE_MAX",
        "DescriptionGXT": "WCD_SCOPE_MAX",
        "Name": "Advanced Scope",
        "Description": "Maximum zoom functionality.",
        "ModelHashKey": "w_at_scope_max",
        "IsDefault": true
      },
      "3061846192": {
        "HashKey": "COMPONENT_AT_SCOPE_NV",
        "NameGXT": "WCT_SCOPE_NV",
        "DescriptionGXT": "WCD_SCOPE_NV",
        "Name": "Night Vision Scope",
        "Description": "Long-range zoom with toggleable night vision.",
        "ModelHashKey": "w_at_scope_nv",
        "IsDefault": false
      },
      "776198721": {
        "HashKey": "COMPONENT_AT_SCOPE_THERMAL",
        "NameGXT": "WCT_SCOPE_TH",
        "DescriptionGXT": "WCD_SCOPE_TH",
        "Name": "Thermal Scope",
        "Description": "Long-range zoom with toggleable thermal vision.",
        "ModelHashKey": "w_at_scope_nv",
        "IsDefault": false
      },
      "2890063729": {
        "HashKey": "COMPONENT_AT_SR_SUPP_03",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_SR_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_sr_supp3",
        "IsDefault": false
      },
      "1602080333": {
        "HashKey": "COMPONENT_AT_MUZZLE_08",
        "NameGXT": "WCT_MUZZ8",
        "DescriptionGXT": "WCD_MUZZ_SR",
        "Name": "Squared Muzzle Brake",
        "Description": "Reduces recoil when firing.",
        "ModelHashKey": "w_at_muzzle_8_xm17",
        "IsDefault": false
      },
      "1764221345": {
        "HashKey": "COMPONENT_AT_MUZZLE_09",
        "NameGXT": "WCT_MUZZ9",
        "DescriptionGXT": "WCD_MUZZ_SR",
        "Name": "Bell-End Muzzle Brake",
        "Description": "Reduces recoil when firing.",
        "ModelHashKey": "w_at_muzzle_9",
        "IsDefault": false
      },
      "2425761975": {
        "HashKey": "COMPONENT_AT_SR_BARREL_01",
        "NameGXT": "WCT_BARR",
        "DescriptionGXT": "WCD_BARR",
        "Name": "Default Barrel",
        "Description": "Stock barrel attachment.",
        "ModelHashKey": "w_at_sr_barrel_1",
        "IsDefault": true
      },
      "277524638": {
        "HashKey": "COMPONENT_AT_SR_BARREL_02",
        "NameGXT": "WCT_BARR2",
        "DescriptionGXT": "WCD_BARR2",
        "Name": "Heavy Barrel",
        "Description": "Increases damage dealt to long-range targets.",
        "ModelHashKey": "w_at_sr_barrel_2",
        "IsDefault": false
      },
      "4164123906": {
        "HashKey": "COMPONENT_HEAVYSNIPER_MK2_CAMO",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "w_at_heavysnipermk2_camo1",
        "IsDefault": false
      },
      "3317620069": {
        "HashKey": "COMPONENT_HEAVYSNIPER_MK2_CAMO_02",
        "NameGXT": "WCT_CAMO_2",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Brushstroke Camo",
        "Description": "",
        "ModelHashKey": "w_at_heavysnipermk2_camo2",
        "IsDefault": false
      },
      "3916506229": {
        "HashKey": "COMPONENT_HEAVYSNIPER_MK2_CAMO_03",
        "NameGXT": "WCT_CAMO_3",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Woodland Camo",
        "Description": "",
        "ModelHashKey": "w_at_heavysnipermk2_camo3",
        "IsDefault": false
      },
      "329939175": {
        "HashKey": "COMPONENT_HEAVYSNIPER_MK2_CAMO_04",
        "NameGXT": "WCT_CAMO_4",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Skull",
        "Description": "",
        "ModelHashKey": "w_at_heavysnipermk2_camo4",
        "IsDefault": false
      },
      "643374672": {
        "HashKey": "COMPONENT_HEAVYSNIPER_MK2_CAMO_05",
        "NameGXT": "WCT_CAMO_5",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Sessanta Nove",
        "Description": "",
        "ModelHashKey": "w_at_heavysnipermk2_camo5",
        "IsDefault": false
      },
      "807875052": {
        "HashKey": "COMPONENT_HEAVYSNIPER_MK2_CAMO_06",
        "NameGXT": "WCT_CAMO_6",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Perseus",
        "Description": "",
        "ModelHashKey": "w_at_heavysnipermk2_camo6",
        "IsDefault": false
      },
      "2893163128": {
        "HashKey": "COMPONENT_HEAVYSNIPER_MK2_CAMO_07",
        "NameGXT": "WCT_CAMO_7",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Leopard",
        "Description": "",
        "ModelHashKey": "w_at_heavysnipermk2_camo7",
        "IsDefault": false
      },
      "3198471901": {
        "HashKey": "COMPONENT_HEAVYSNIPER_MK2_CAMO_08",
        "NameGXT": "WCT_CAMO_8",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Zebra",
        "Description": "",
        "ModelHashKey": "w_at_heavysnipermk2_camo8",
        "IsDefault": false
      },
      "3447155842": {
        "HashKey": "COMPONENT_HEAVYSNIPER_MK2_CAMO_09",
        "NameGXT": "WCT_CAMO_9",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Geometric",
        "Description": "",
        "ModelHashKey": "w_at_heavysnipermk2_camo9",
        "IsDefault": false
      },
      "2881858759": {
        "HashKey": "COMPONENT_HEAVYSNIPER_MK2_CAMO_10",
        "NameGXT": "WCT_CAMO_10",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Boom!",
        "Description": "",
        "ModelHashKey": "w_at_heavysnipermk2_camo10",
        "IsDefault": false
      },
      "1815270123": {
        "HashKey": "COMPONENT_HEAVYSNIPER_MK2_CAMO_IND_01",
        "NameGXT": "WCT_CAMO_IND",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Patriotic",
        "Description": "",
        "ModelHashKey": "w_at_heavysnipermk2_camo_ind1",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WCT_TINT_0",
        "Name": "Classic Black"
      },
      {
        "NameGXT": "WCT_TINT_1",
        "Name": "Classic Gray"
      },
      {
        "NameGXT": "WCT_TINT_2",
        "Name": "Classic Two-Tone"
      },
      {
        "NameGXT": "WCT_TINT_3",
        "Name": "Classic White"
      },
      {
        "NameGXT": "WCT_TINT_4",
        "Name": "Classic Beige"
      },
      {
        "NameGXT": "WCT_TINT_5",
        "Name": "Classic Green"
      },
      {
        "NameGXT": "WCT_TINT_6",
        "Name": "Classic Blue"
      },
      {
        "NameGXT": "WCT_TINT_7",
        "Name": "Classic Earth"
      },
      {
        "NameGXT": "WCT_TINT_8",
        "Name": "Classic Brown & Black"
      },
      {
        "NameGXT": "WCT_TINT_9",
        "Name": "Red Contrast"
      },
      {
        "NameGXT": "WCT_TINT_10",
        "Name": "Blue Contrast"
      },
      {
        "NameGXT": "WCT_TINT_11",
        "Name": "Yellow Contrast"
      },
      {
        "NameGXT": "WCT_TINT_12",
        "Name": "Orange Contrast"
      },
      {
        "NameGXT": "WCT_TINT_13",
        "Name": "Bold Pink"
      },
      {
        "NameGXT": "WCT_TINT_14",
        "Name": "Bold Purple & Yellow"
      },
      {
        "NameGXT": "WCT_TINT_15",
        "Name": "Bold Orange"
      },
      {
        "NameGXT": "WCT_TINT_16",
        "Name": "Bold Green & Purple"
      },
      {
        "NameGXT": "WCT_TINT_17",
        "Name": "Bold Red Features"
      },
      {
        "NameGXT": "WCT_TINT_18",
        "Name": "Bold Green Features"
      },
      {
        "NameGXT": "WCT_TINT_19",
        "Name": "Bold Cyan Features"
      },
      {
        "NameGXT": "WCT_TINT_20",
        "Name": "Bold Yellow Features"
      },
      {
        "NameGXT": "WCT_TINT_21",
        "Name": "Bold Red & White"
      },
      {
        "NameGXT": "WCT_TINT_22",
        "Name": "Bold Blue & White"
      },
      {
        "NameGXT": "WCT_TINT_23",
        "Name": "Metallic Gold"
      },
      {
        "NameGXT": "WCT_TINT_24",
        "Name": "Metallic Platinum"
      },
      {
        "NameGXT": "WCT_TINT_25",
        "Name": "Metallic Gray & Lilac"
      },
      {
        "NameGXT": "WCT_TINT_26",
        "Name": "Metallic Purple & Lime"
      },
      {
        "NameGXT": "WCT_TINT_27",
        "Name": "Metallic Red"
      },
      {
        "NameGXT": "WCT_TINT_28",
        "Name": "Metallic Green"
      },
      {
        "NameGXT": "WCT_TINT_29",
        "Name": "Metallic Blue"
      },
      {
        "NameGXT": "WCT_TINT_30",
        "Name": "Metallic White & Aqua"
      },
      {
        "NameGXT": "WCT_TINT_31",
        "Name": "Metallic Red & Yellow"
      }
    ],
    "DLC": "mpgunrunning"
  },
  "3219281620": {
    "HashKey": "WEAPON_PISTOL_MK2",
    "NameGXT": "WT_PIST2",
    "DescriptionGXT": "WTD_PIST2",
    "Name": "Pistol Mk II",
    "Description": "Balance, simplicity, precision: nothing keeps the peace like an extended barrel in the other guy's mouth.",
    "Group": "GROUP_PISTOL",
    "ModelHashKey": "w_pi_pistolmk2",
    "DefaultClipSize": 12,
    "Components": {
      "2499030370": {
        "HashKey": "COMPONENT_PISTOL_MK2_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for regular ammo.",
        "ModelHashKey": "w_pi_pistolmk2_mag1",
        "IsDefault": true
      },
      "1591132456": {
        "HashKey": "COMPONENT_PISTOL_MK2_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for regular ammo.",
        "ModelHashKey": "w_pi_pistolmk2_mag2",
        "IsDefault": false
      },
      "634039983": {
        "HashKey": "COMPONENT_PISTOL_MK2_CLIP_TRACER",
        "NameGXT": "WCT_CLIP_TR",
        "DescriptionGXT": "WCD_CLIP_TR",
        "Name": "Tracer Rounds",
        "Description": "Bullets with bright visible markers that match the tint of the gun. Standard capacity.",
        "ModelHashKey": "w_pi_pistolmk2_mag_tr",
        "IsDefault": false
      },
      "733837882": {
        "HashKey": "COMPONENT_PISTOL_MK2_CLIP_INCENDIARY",
        "NameGXT": "WCT_CLIP_INC",
        "DescriptionGXT": "WCD_CLIP_INC",
        "Name": "Incendiary Rounds",
        "Description": "Bullets which include a chance to set targets on fire when shot. Reduced capacity.",
        "ModelHashKey": "w_pi_pistolmk2_mag_inc",
        "IsDefault": false
      },
      "2248057097": {
        "HashKey": "COMPONENT_PISTOL_MK2_CLIP_HOLLOWPOINT",
        "NameGXT": "WCT_CLIP_HP",
        "DescriptionGXT": "WCD_CLIP_HP",
        "Name": "Hollow Point Rounds",
        "Description": "Increased damage to targets without Body Armor. Reduced capacity.",
        "ModelHashKey": "w_pi_pistolmk2_mag_hp",
        "IsDefault": false
      },
      "1329061674": {
        "HashKey": "COMPONENT_PISTOL_MK2_CLIP_FMJ",
        "NameGXT": "WCT_CLIP_FMJ",
        "DescriptionGXT": "WCD_CLIP_FMJ",
        "Name": "Full Metal Jacket Rounds",
        "Description": "Increased damage to vehicles. Also penetrates bullet resistant and bulletproof vehicle glass. Reduced capacity.",
        "ModelHashKey": "w_pi_pistolmk2_mag_fmj",
        "IsDefault": false
      },
      "2396306288": {
        "HashKey": "COMPONENT_AT_PI_RAIL",
        "NameGXT": "WCT_SCOPE_PI",
        "DescriptionGXT": "WCD_SCOPE_PI",
        "Name": "Mounted Scope",
        "Description": "Standard-range zoom functionality.",
        "ModelHashKey": "w_at_pi_rail_1",
        "IsDefault": false
      },
      "1140676955": {
        "HashKey": "COMPONENT_AT_PI_FLSH_02",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_pi_flsh_2",
        "IsDefault": false
      },
      "1709866683": {
        "HashKey": "COMPONENT_AT_PI_SUPP_02",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_PI_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_pi_supp_2",
        "IsDefault": false
      },
      "568543123": {
        "HashKey": "COMPONENT_AT_PI_COMP",
        "NameGXT": "WCT_COMP",
        "DescriptionGXT": "WCD_COMP",
        "Name": "Compensator",
        "Description": "Reduces recoil for rapid fire.",
        "ModelHashKey": "w_at_pi_comp_1",
        "IsDefault": false
      },
      "1550611612": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "w_pi_pistolmk2_camo1",
        "IsDefault": false
      },
      "368550800": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_02",
        "NameGXT": "WCT_CAMO_2",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Brushstroke Camo",
        "Description": "",
        "ModelHashKey": "w_pi_pistolmk2_camo2",
        "IsDefault": false
      },
      "2525897947": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_03",
        "NameGXT": "WCT_CAMO_3",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Woodland Camo",
        "Description": "",
        "ModelHashKey": "w_pi_pistolmk2_camo3",
        "IsDefault": false
      },
      "24902297": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_04",
        "NameGXT": "WCT_CAMO_4",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Skull",
        "Description": "",
        "ModelHashKey": "w_pi_pistolmk2_camo4",
        "IsDefault": false
      },
      "4066925682": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_05",
        "NameGXT": "WCT_CAMO_5",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Sessanta Nove",
        "Description": "",
        "ModelHashKey": "w_pi_pistolmk2_camo5",
        "IsDefault": false
      },
      "3710005734": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_06",
        "NameGXT": "WCT_CAMO_6",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Perseus",
        "Description": "",
        "ModelHashKey": "w_pi_pistolmk2_camo6",
        "IsDefault": false
      },
      "3141791350": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_07",
        "NameGXT": "WCT_CAMO_7",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Leopard",
        "Description": "",
        "ModelHashKey": "w_pi_pistolmk2_camo7",
        "IsDefault": false
      },
      "1301287696": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_08",
        "NameGXT": "WCT_CAMO_8",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Zebra",
        "Description": "",
        "ModelHashKey": "w_pi_pistolmk2_camo8",
        "IsDefault": false
      },
      "1597093459": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_09",
        "NameGXT": "WCT_CAMO_9",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Geometric",
        "Description": "",
        "ModelHashKey": "w_pi_pistolmk2_camo9",
        "IsDefault": false
      },
      "1769871776": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_10",
        "NameGXT": "WCT_CAMO_10",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Boom!",
        "Description": "",
        "ModelHashKey": "w_pi_pistolmk2_camo10",
        "IsDefault": false
      },
      "2467084625": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_IND_01",
        "NameGXT": "WCT_CAMO_IND",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Patriotic",
        "Description": "",
        "ModelHashKey": "w_pi_pistolmk2_camo_ind1",
        "IsDefault": false
      },
      "3036451504": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_SLIDE",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "W_PI_PistolMK2_Slide_Camo1",
        "IsDefault": false
      },
      "438243936": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_02_SLIDE",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "W_PI_PistolMK2_Slide_Camo2",
        "IsDefault": false
      },
      "3839888240": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_03_SLIDE",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "W_PI_PistolMK2_Slide_Camo3",
        "IsDefault": false
      },
      "740920107": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_04_SLIDE",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "W_PI_PistolMK2_Slide_Camo4",
        "IsDefault": false
      },
      "3753350949": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_05_SLIDE",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "W_PI_PistolMK2_Slide_Camo5",
        "IsDefault": false
      },
      "1809261196": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_06_SLIDE",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "W_PI_PistolMK2_Slide_Camo6",
        "IsDefault": false
      },
      "2648428428": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_07_SLIDE",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "W_PI_PistolMK2_Slide_Camo7",
        "IsDefault": false
      },
      "3004802348": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_08_SLIDE",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "W_PI_PistolMK2_Slide_Camo8",
        "IsDefault": false
      },
      "3330502162": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_09_SLIDE",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "W_PI_PistolMK2_Slide_Camo9",
        "IsDefault": false
      },
      "1135718771": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_10_SLIDE",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "W_PI_PistolMK2_Slide_Camo10",
        "IsDefault": false
      },
      "1253942266": {
        "HashKey": "COMPONENT_PISTOL_MK2_CAMO_IND_01_SLIDE",
        "NameGXT": "WCT_CAMO_IND",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Patriotic",
        "Description": "",
        "ModelHashKey": "W_PI_PistolMK2_Camo_Sl_Ind1",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WCT_TINT_0",
        "Name": "Classic Black"
      },
      {
        "NameGXT": "WCT_TINT_1",
        "Name": "Classic Gray"
      },
      {
        "NameGXT": "WCT_TINT_2",
        "Name": "Classic Two-Tone"
      },
      {
        "NameGXT": "WCT_TINT_3",
        "Name": "Classic White"
      },
      {
        "NameGXT": "WCT_TINT_4",
        "Name": "Classic Beige"
      },
      {
        "NameGXT": "WCT_TINT_5",
        "Name": "Classic Green"
      },
      {
        "NameGXT": "WCT_TINT_6",
        "Name": "Classic Blue"
      },
      {
        "NameGXT": "WCT_TINT_7",
        "Name": "Classic Earth"
      },
      {
        "NameGXT": "WCT_TINT_8",
        "Name": "Classic Brown & Black"
      },
      {
        "NameGXT": "WCT_TINT_9",
        "Name": "Red Contrast"
      },
      {
        "NameGXT": "WCT_TINT_10",
        "Name": "Blue Contrast"
      },
      {
        "NameGXT": "WCT_TINT_11",
        "Name": "Yellow Contrast"
      },
      {
        "NameGXT": "WCT_TINT_12",
        "Name": "Orange Contrast"
      },
      {
        "NameGXT": "WCT_TINT_13",
        "Name": "Bold Pink"
      },
      {
        "NameGXT": "WCT_TINT_14",
        "Name": "Bold Purple & Yellow"
      },
      {
        "NameGXT": "WCT_TINT_15",
        "Name": "Bold Orange"
      },
      {
        "NameGXT": "WCT_TINT_16",
        "Name": "Bold Green & Purple"
      },
      {
        "NameGXT": "WCT_TINT_17",
        "Name": "Bold Red Features"
      },
      {
        "NameGXT": "WCT_TINT_18",
        "Name": "Bold Green Features"
      },
      {
        "NameGXT": "WCT_TINT_19",
        "Name": "Bold Cyan Features"
      },
      {
        "NameGXT": "WCT_TINT_20",
        "Name": "Bold Yellow Features"
      },
      {
        "NameGXT": "WCT_TINT_21",
        "Name": "Bold Red & White"
      },
      {
        "NameGXT": "WCT_TINT_22",
        "Name": "Bold Blue & White"
      },
      {
        "NameGXT": "WCT_TINT_23",
        "Name": "Metallic Gold"
      },
      {
        "NameGXT": "WCT_TINT_24",
        "Name": "Metallic Platinum"
      },
      {
        "NameGXT": "WCT_TINT_25",
        "Name": "Metallic Gray & Lilac"
      },
      {
        "NameGXT": "WCT_TINT_26",
        "Name": "Metallic Purple & Lime"
      },
      {
        "NameGXT": "WCT_TINT_27",
        "Name": "Metallic Red"
      },
      {
        "NameGXT": "WCT_TINT_28",
        "Name": "Metallic Green"
      },
      {
        "NameGXT": "WCT_TINT_29",
        "Name": "Metallic Blue"
      },
      {
        "NameGXT": "WCT_TINT_30",
        "Name": "Metallic White & Aqua"
      },
      {
        "NameGXT": "WCT_TINT_31",
        "Name": "Metallic Red & Yellow"
      }
    ],
    "DLC": "mpgunrunning"
  },
  "2024373456": {
    "HashKey": "WEAPON_SMG_MK2",
    "NameGXT": "WT_SMG2",
    "DescriptionGXT": "WTD_SMG2",
    "Name": "SMG Mk II",
    "Description": "Lightweight, compact, with a rate of fire to die very messily for: turn any confined space into a kill box at the click of a well-oiled trigger.",
    "Group": "GROUP_SMG",
    "ModelHashKey": "w_sb_smgmk2",
    "DefaultClipSize": 30,
    "Components": {
      "1277460590": {
        "HashKey": "COMPONENT_SMG_MK2_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for regular ammo.",
        "ModelHashKey": "w_sb_smgmk2_mag1",
        "IsDefault": true
      },
      "3112393518": {
        "HashKey": "COMPONENT_SMG_MK2_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for regular ammo.",
        "ModelHashKey": "w_sb_smgmk2_mag2",
        "IsDefault": false
      },
      "2146055916": {
        "HashKey": "COMPONENT_SMG_MK2_CLIP_TRACER",
        "NameGXT": "WCT_CLIP_TR",
        "DescriptionGXT": "WCD_CLIP_TR",
        "Name": "Tracer Rounds",
        "Description": "Bullets with bright visible markers that match the tint of the gun. Standard capacity.",
        "ModelHashKey": "w_sb_smgmk2_mag_tr",
        "IsDefault": false
      },
      "3650233061": {
        "HashKey": "COMPONENT_SMG_MK2_CLIP_INCENDIARY",
        "NameGXT": "WCT_CLIP_INC",
        "DescriptionGXT": "WCD_CLIP_INC",
        "Name": "Incendiary Rounds",
        "Description": "Bullets which include a chance to set targets on fire when shot. Reduced capacity.",
        "ModelHashKey": "w_sb_smgmk2_mag_inc",
        "IsDefault": false
      },
      "974903034": {
        "HashKey": "COMPONENT_SMG_MK2_CLIP_HOLLOWPOINT",
        "NameGXT": "WCT_CLIP_HP",
        "DescriptionGXT": "WCD_CLIP_HP",
        "Name": "Hollow Point Rounds",
        "Description": "Increased damage to targets without Body Armor. Reduced capacity.",
        "ModelHashKey": "w_sb_smgmk2_mag_hp",
        "IsDefault": false
      },
      "190476639": {
        "HashKey": "COMPONENT_SMG_MK2_CLIP_FMJ",
        "NameGXT": "WCT_CLIP_FMJ",
        "DescriptionGXT": "WCD_CLIP_FMJ",
        "Name": "Full Metal Jacket Rounds",
        "Description": "Increased damage to vehicles. Also penetrates bullet resistant and bulletproof vehicle glass. Reduced capacity.",
        "ModelHashKey": "w_sb_smgmk2_mag_fmj",
        "IsDefault": false
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "2681951826": {
        "HashKey": "COMPONENT_AT_SIGHTS_SMG",
        "NameGXT": "WCT_HOLO",
        "DescriptionGXT": "WCD_HOLO",
        "Name": "Holographic Sight",
        "Description": "Accurate sight for close quarters combat.",
        "ModelHashKey": "w_at_sights_smg",
        "IsDefault": false
      },
      "3842157419": {
        "HashKey": "COMPONENT_AT_SCOPE_MACRO_02_SMG_MK2",
        "NameGXT": "WCT_SCOPE_MAC2",
        "DescriptionGXT": "WCD_SCOPE_MAC",
        "Name": "Small Scope",
        "Description": "Standard-range zoom functionality.",
        "ModelHashKey": "w_at_scope_macro_2_mk2",
        "IsDefault": false
      },
      "1038927834": {
        "HashKey": "COMPONENT_AT_SCOPE_SMALL_SMG_MK2",
        "NameGXT": "WCT_SCOPE_SML2",
        "DescriptionGXT": "WCD_SCOPE_SML",
        "Name": "Medium Scope",
        "Description": "Medium-range zoom functionality.",
        "ModelHashKey": "w_at_scope_small_mk2",
        "IsDefault": false
      },
      "3271853210": {
        "HashKey": "COMPONENT_AT_PI_SUPP",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_PI_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_pi_supp",
        "IsDefault": false
      },
      "3113485012": {
        "HashKey": "COMPONENT_AT_MUZZLE_01",
        "NameGXT": "WCT_MUZZ1",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Flat Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_1",
        "IsDefault": false
      },
      "3362234491": {
        "HashKey": "COMPONENT_AT_MUZZLE_02",
        "NameGXT": "WCT_MUZZ2",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Tactical Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_2",
        "IsDefault": false
      },
      "3725708239": {
        "HashKey": "COMPONENT_AT_MUZZLE_03",
        "NameGXT": "WCT_MUZZ3",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Fat-End Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_3",
        "IsDefault": false
      },
      "3968886988": {
        "HashKey": "COMPONENT_AT_MUZZLE_04",
        "NameGXT": "WCT_MUZZ4",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Precision Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_4",
        "IsDefault": false
      },
      "48731514": {
        "HashKey": "COMPONENT_AT_MUZZLE_05",
        "NameGXT": "WCT_MUZZ5",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Heavy Duty Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_5",
        "IsDefault": false
      },
      "880736428": {
        "HashKey": "COMPONENT_AT_MUZZLE_06",
        "NameGXT": "WCT_MUZZ6",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Slanted Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_6",
        "IsDefault": false
      },
      "1303784126": {
        "HashKey": "COMPONENT_AT_MUZZLE_07",
        "NameGXT": "WCT_MUZZ7",
        "DescriptionGXT": "WCD_MUZZ",
        "Name": "Split-End Muzzle Brake",
        "Description": "Reduces recoil during rapid fire.",
        "ModelHashKey": "w_at_muzzle_7",
        "IsDefault": false
      },
      "3641720545": {
        "HashKey": "COMPONENT_AT_SB_BARREL_01",
        "NameGXT": "WCT_BARR",
        "DescriptionGXT": "WCD_BARR",
        "Name": "Default Barrel",
        "Description": "Stock barrel attachment.",
        "ModelHashKey": "w_at_sb_barrel_1",
        "IsDefault": true
      },
      "2774849419": {
        "HashKey": "COMPONENT_AT_SB_BARREL_02",
        "NameGXT": "WCT_BARR2",
        "DescriptionGXT": "WCD_BARR2",
        "Name": "Heavy Barrel",
        "Description": "Increases damage dealt to long-range targets.",
        "ModelHashKey": "w_at_sb_barrel_2",
        "IsDefault": false
      },
      "3298267239": {
        "HashKey": "COMPONENT_SMG_MK2_CAMO",
        "NameGXT": "WCT_CAMO_1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Digital Camo",
        "Description": "",
        "ModelHashKey": "w_at_smgmk2_camo1",
        "IsDefault": false
      },
      "940943685": {
        "HashKey": "COMPONENT_SMG_MK2_CAMO_02",
        "NameGXT": "WCT_CAMO_2",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Brushstroke Camo",
        "Description": "",
        "ModelHashKey": "w_at_smgmk2_camo2",
        "IsDefault": false
      },
      "1263226800": {
        "HashKey": "COMPONENT_SMG_MK2_CAMO_03",
        "NameGXT": "WCT_CAMO_3",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Woodland Camo",
        "Description": "",
        "ModelHashKey": "w_at_smgmk2_camo3",
        "IsDefault": false
      },
      "3966931456": {
        "HashKey": "COMPONENT_SMG_MK2_CAMO_04",
        "NameGXT": "WCT_CAMO_4",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Skull",
        "Description": "",
        "ModelHashKey": "w_at_smgmk2_camo4",
        "IsDefault": false
      },
      "1224100642": {
        "HashKey": "COMPONENT_SMG_MK2_CAMO_05",
        "NameGXT": "WCT_CAMO_5",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Sessanta Nove",
        "Description": "",
        "ModelHashKey": "w_at_smgmk2_camo5",
        "IsDefault": false
      },
      "899228776": {
        "HashKey": "COMPONENT_SMG_MK2_CAMO_06",
        "NameGXT": "WCT_CAMO_6",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Perseus",
        "Description": "",
        "ModelHashKey": "w_at_smgmk2_camo6",
        "IsDefault": false
      },
      "616006309": {
        "HashKey": "COMPONENT_SMG_MK2_CAMO_07",
        "NameGXT": "WCT_CAMO_7",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Leopard",
        "Description": "",
        "ModelHashKey": "w_at_smgmk2_camo7",
        "IsDefault": false
      },
      "2733014785": {
        "HashKey": "COMPONENT_SMG_MK2_CAMO_08",
        "NameGXT": "WCT_CAMO_8",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Zebra",
        "Description": "",
        "ModelHashKey": "w_at_smgmk2_camo8",
        "IsDefault": false
      },
      "572063080": {
        "HashKey": "COMPONENT_SMG_MK2_CAMO_09",
        "NameGXT": "WCT_CAMO_9",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Geometric",
        "Description": "",
        "ModelHashKey": "w_at_smgmk2_camo9",
        "IsDefault": false
      },
      "1170588613": {
        "HashKey": "COMPONENT_SMG_MK2_CAMO_10",
        "NameGXT": "WCT_CAMO_10",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Boom!",
        "Description": "",
        "ModelHashKey": "w_at_smgmk2_camo10",
        "IsDefault": false
      },
      "966612367": {
        "HashKey": "COMPONENT_SMG_MK2_CAMO_IND_01",
        "NameGXT": "WCT_CAMO_IND",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Patriotic",
        "Description": "",
        "ModelHashKey": "w_at_smgmk2_camo_ind1",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WCT_TINT_0",
        "Name": "Classic Black"
      },
      {
        "NameGXT": "WCT_TINT_1",
        "Name": "Classic Gray"
      },
      {
        "NameGXT": "WCT_TINT_2",
        "Name": "Classic Two-Tone"
      },
      {
        "NameGXT": "WCT_TINT_3",
        "Name": "Classic White"
      },
      {
        "NameGXT": "WCT_TINT_4",
        "Name": "Classic Beige"
      },
      {
        "NameGXT": "WCT_TINT_5",
        "Name": "Classic Green"
      },
      {
        "NameGXT": "WCT_TINT_6",
        "Name": "Classic Blue"
      },
      {
        "NameGXT": "WCT_TINT_7",
        "Name": "Classic Earth"
      },
      {
        "NameGXT": "WCT_TINT_8",
        "Name": "Classic Brown & Black"
      },
      {
        "NameGXT": "WCT_TINT_9",
        "Name": "Red Contrast"
      },
      {
        "NameGXT": "WCT_TINT_10",
        "Name": "Blue Contrast"
      },
      {
        "NameGXT": "WCT_TINT_11",
        "Name": "Yellow Contrast"
      },
      {
        "NameGXT": "WCT_TINT_12",
        "Name": "Orange Contrast"
      },
      {
        "NameGXT": "WCT_TINT_13",
        "Name": "Bold Pink"
      },
      {
        "NameGXT": "WCT_TINT_14",
        "Name": "Bold Purple & Yellow"
      },
      {
        "NameGXT": "WCT_TINT_15",
        "Name": "Bold Orange"
      },
      {
        "NameGXT": "WCT_TINT_16",
        "Name": "Bold Green & Purple"
      },
      {
        "NameGXT": "WCT_TINT_17",
        "Name": "Bold Red Features"
      },
      {
        "NameGXT": "WCT_TINT_18",
        "Name": "Bold Green Features"
      },
      {
        "NameGXT": "WCT_TINT_19",
        "Name": "Bold Cyan Features"
      },
      {
        "NameGXT": "WCT_TINT_20",
        "Name": "Bold Yellow Features"
      },
      {
        "NameGXT": "WCT_TINT_21",
        "Name": "Bold Red & White"
      },
      {
        "NameGXT": "WCT_TINT_22",
        "Name": "Bold Blue & White"
      },
      {
        "NameGXT": "WCT_TINT_23",
        "Name": "Metallic Gold"
      },
      {
        "NameGXT": "WCT_TINT_24",
        "Name": "Metallic Platinum"
      },
      {
        "NameGXT": "WCT_TINT_25",
        "Name": "Metallic Gray & Lilac"
      },
      {
        "NameGXT": "WCT_TINT_26",
        "Name": "Metallic Purple & Lime"
      },
      {
        "NameGXT": "WCT_TINT_27",
        "Name": "Metallic Red"
      },
      {
        "NameGXT": "WCT_TINT_28",
        "Name": "Metallic Green"
      },
      {
        "NameGXT": "WCT_TINT_29",
        "Name": "Metallic Blue"
      },
      {
        "NameGXT": "WCT_TINT_30",
        "Name": "Metallic White & Aqua"
      },
      {
        "NameGXT": "WCT_TINT_31",
        "Name": "Metallic Red & Yellow"
      }
    ],
    "DLC": "mpgunrunning"
  },
  "2343591895": {
    "HashKey": "WEAPON_FLASHLIGHT",
    "NameGXT": "WT_FLASHLIGHT",
    "DescriptionGXT": "WTD_FLASHLIGHT",
    "Name": "Flashlight",
    "Description": "Intensify your fear of the dark with this short range, battery-powered light source. Handy for blunt force trauma. Part of The Halloween Surprise.",
    "Group": "GROUP_MELEE",
    "ModelHashKey": "w_me_flashlight",
    "DefaultClipSize": 0,
    "Components": {
      "3719772431": {
        "HashKey": "COMPONENT_FLASHLIGHT_LIGHT",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_me_flashlight_flash",
        "IsDefault": true
      }
    },
    "Tints": [],
    "DLC": "mphalloween"
  },
  "1198879012": {
    "HashKey": "WEAPON_FLAREGUN",
    "NameGXT": "WT_FLAREGUN",
    "DescriptionGXT": "WTD_FLAREGUN",
    "Name": "Flare Gun",
    "Description": "Use to signal distress or drunken excitement. Warning: pointing directly at individuals may cause spontaneous combustion. Part of The Heists Update.",
    "Group": "GROUP_PISTOL",
    "ModelHashKey": "w_pi_flaregun",
    "DefaultClipSize": 1,
    "Components": {
      "2481569177": {
        "HashKey": "COMPONENT_FLAREGUN_CLIP_01",
        "NameGXT": "WCT_INVALID",
        "DescriptionGXT": "WCT_INVALID",
        "Name": "",
        "Description": "",
        "ModelHashKey": "w_pi_flaregun_mag1",
        "IsDefault": true
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINTDF",
        "Name": "Default tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mpheist"
  },
  "2460120199": {
    "HashKey": "WEAPON_DAGGER",
    "NameGXT": "WT_DAGGER",
    "DescriptionGXT": "WTD_DAGGER",
    "Name": "Antique Cavalry Dagger",
    "Description": "You've been rocking the pirate-chic look for a while, but no vicious weapon to complete the look? Get this dagger with guarded hilt. Part of The \"I'm Not a Hipster\" Update.",
    "Group": "GROUP_MELEE",
    "ModelHashKey": "w_me_dagger",
    "DefaultClipSize": 0,
    "Components": {},
    "Tints": [],
    "DLC": "mphipster"
  },
  "137902532": {
    "HashKey": "WEAPON_VINTAGEPISTOL",
    "NameGXT": "WT_VPISTOL",
    "DescriptionGXT": "WTD_VPISTOL",
    "Name": "Vintage Pistol",
    "Description": "What you really need is a more recognizable gun. Stand out from the crowd at an armed robbery with this engraved pistol. Part of The \"I'm Not a Hipster\" Update.",
    "Group": "GROUP_PISTOL",
    "ModelHashKey": "w_pi_vintage_pistol",
    "DefaultClipSize": 7,
    "Components": {
      "1168357051": {
        "HashKey": "COMPONENT_VINTAGEPISTOL_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_VPST_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Vintage Pistol.",
        "ModelHashKey": "w_pi_vintage_pistol_mag1",
        "IsDefault": true
      },
      "867832552": {
        "HashKey": "COMPONENT_VINTAGEPISTOL_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_VPST_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Vintage Pistol.",
        "ModelHashKey": "w_pi_vintage_pistol_mag2",
        "IsDefault": false
      },
      "3271853210": {
        "HashKey": "COMPONENT_AT_PI_SUPP",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_PI_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_pi_supp",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mphipster"
  },
  "2138347493": {
    "HashKey": "WEAPON_FIREWORK",
    "NameGXT": "WT_FIREWRK",
    "DescriptionGXT": "WTD_FIREWRK",
    "Name": "Firework Launcher",
    "Description": "Put the flair back in flare with this firework launcher, guaranteed to raise some oohs and aahs from the crowd. Part of the Independence Day Special.",
    "Group": "GROUP_HEAVY",
    "ModelHashKey": "w_lr_firework",
    "DefaultClipSize": 1,
    "Components": {
      "3840197261": {
        "HashKey": "COMPONENT_FIREWORK_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_FWRK_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Firework Launcher.",
        "ModelHashKey": "",
        "IsDefault": true
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINTDF",
        "Name": "Default tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mpindependence"
  },
  "2828843422": {
    "HashKey": "WEAPON_MUSKET",
    "NameGXT": "WT_MUSKET",
    "DescriptionGXT": "WTD_MUSKET",
    "Name": "Musket",
    "Description": "Armed with nothing but muskets and a superiority complex, the Brits took over half the world. Own the gun that built an empire. Part of the Independence Day Special.",
    "Group": "GROUP_SNIPER",
    "ModelHashKey": "w_ar_musket",
    "DefaultClipSize": 1,
    "Components": {
      "1322387263": {
        "HashKey": "COMPONENT_MUSKET_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_MSKT_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Musket.",
        "ModelHashKey": "p_w_ar_musket_chrg",
        "IsDefault": true
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINTDF",
        "Name": "Default tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mpindependence"
  },
  "3713923289": {
    "HashKey": "WEAPON_MACHETE",
    "NameGXT": "WT_MACHETE",
    "DescriptionGXT": "WTD_MACHETE",
    "Name": "Machete",
    "Description": "America's West African arms trade isn't just about giving. Rediscover the simple life with this rusty cleaver. Part of Lowriders.",
    "Group": "GROUP_MELEE",
    "ModelHashKey": "w_me_machette_lr",
    "DefaultClipSize": 0,
    "Components": {},
    "Tints": [],
    "DLC": "mplowrider"
  },
  "3675956304": {
    "HashKey": "WEAPON_MACHINEPISTOL",
    "NameGXT": "WT_MCHPIST",
    "DescriptionGXT": "WTD_MCHPIST",
    "Name": "Machine Pistol",
    "Description": "This fully automatic is the snare drum to your twin-engine V8 bass: no drive-by sounds quite right without it. Part of Lowriders.",
    "Group": "GROUP_SMG",
    "ModelHashKey": "w_sb_compactsmg",
    "DefaultClipSize": 12,
    "Components": {
      "1198425599": {
        "HashKey": "COMPONENT_MACHINEPISTOL_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_MCHP_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Machine Pistol.",
        "ModelHashKey": "w_sb_compactsmg_mag1",
        "IsDefault": true
      },
      "3106695545": {
        "HashKey": "COMPONENT_MACHINEPISTOL_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_MCHP_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Machine Pistol.",
        "ModelHashKey": "w_sb_compactsmg_mag2",
        "IsDefault": false
      },
      "2850671348": {
        "HashKey": "COMPONENT_MACHINEPISTOL_CLIP_03",
        "NameGXT": "WCT_CLIP_DRM",
        "DescriptionGXT": "WCD_CLIP3",
        "Name": "Drum Magazine",
        "Description": "Expanded capacity and slower reload.",
        "ModelHashKey": "w_sb_compactsmg_boxmag",
        "IsDefault": false
      },
      "3271853210": {
        "HashKey": "COMPONENT_AT_PI_SUPP",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_PI_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_pi_supp",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mplowrider"
  },
  "1649403952": {
    "HashKey": "WEAPON_COMPACTRIFLE",
    "NameGXT": "WT_CMPRIFLE",
    "DescriptionGXT": "WTD_CMPRIFLE",
    "Name": "Compact Rifle",
    "Description": "Half the size, all the power, double the recoil: there's no riskier way to say \"I'm compensating for something\". Part of Lowriders: Custom Classics.",
    "Group": "GROUP_RIFLE",
    "ModelHashKey": "w_ar_assaultrifle_smg",
    "DefaultClipSize": 30,
    "Components": {
      "1363085923": {
        "HashKey": "COMPONENT_COMPACTRIFLE_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_CMPR_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Compact Rifle.",
        "ModelHashKey": "w_ar_assaultrifle_smg_mag1",
        "IsDefault": true
      },
      "1509923832": {
        "HashKey": "COMPONENT_COMPACTRIFLE_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_CMPR_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Compact Rifle.",
        "ModelHashKey": "w_ar_assaultrifle_smg_mag2",
        "IsDefault": false
      },
      "3322377230": {
        "HashKey": "COMPONENT_COMPACTRIFLE_CLIP_03",
        "NameGXT": "WCT_CLIP_DRM",
        "DescriptionGXT": "WCD_CLIP3",
        "Name": "Drum Magazine",
        "Description": "Expanded capacity and slower reload.",
        "ModelHashKey": "w_ar_assaultrifle_boxmag",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mplowrider2"
  },
  "4019527611": {
    "HashKey": "WEAPON_DBSHOTGUN",
    "NameGXT": "WT_DBSHGN",
    "DescriptionGXT": "WTD_DBSHGN",
    "Name": "Double Barrel Shotgun",
    "Description": "Do one thing, do it well. Who needs a high rate of fire when your first shot turns the other guy into a fine mist? Part of Lowriders: Custom Classics.",
    "Group": "GROUP_SHOTGUN",
    "ModelHashKey": "w_sg_doublebarrel",
    "DefaultClipSize": 2,
    "Components": {
      "703231006": {
        "HashKey": "COMPONENT_DBSHOTGUN_CLIP_01",
        "NameGXT": "WCT_INVALID",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "",
        "Description": "",
        "ModelHashKey": "w_sg_doublebarrel_mag1",
        "IsDefault": true
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINTDF",
        "Name": "Default tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mplowrider2"
  },
  "984333226": {
    "HashKey": "WEAPON_HEAVYSHOTGUN",
    "NameGXT": "WT_HVYSHGN",
    "DescriptionGXT": "WTD_HVYSHGN",
    "Name": "Heavy Shotgun",
    "Description": "The weapon to reach for when you absolutely need to make a horrible mess of the room. Best used near easy-wipe surfaces only. Part of the Last Team Standing Update.",
    "Group": "GROUP_SHOTGUN",
    "ModelHashKey": "w_sg_heavyshotgun",
    "DefaultClipSize": 6,
    "Components": {
      "844049759": {
        "HashKey": "COMPONENT_HEAVYSHOTGUN_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_HVSG_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Heavy Shotgun.",
        "ModelHashKey": "w_sg_heavyshotgun_mag1",
        "IsDefault": true
      },
      "2535257853": {
        "HashKey": "COMPONENT_HEAVYSHOTGUN_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_HVSG_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Heavy Shotgun.",
        "ModelHashKey": "w_sg_heavyshotgun_mag2",
        "IsDefault": false
      },
      "2294798931": {
        "HashKey": "COMPONENT_HEAVYSHOTGUN_CLIP_03",
        "NameGXT": "WCT_CLIP_DRM",
        "DescriptionGXT": "WCD_CLIP3",
        "Name": "Drum Magazine",
        "Description": "Expanded capacity and slower reload.",
        "ModelHashKey": "w_sg_heavyshotgun_boxmag",
        "IsDefault": false
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "2805810788": {
        "HashKey": "COMPONENT_AT_AR_SUPP_02",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_AR_SUPP2",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_ar_supp_02",
        "IsDefault": false
      },
      "202788691": {
        "HashKey": "COMPONENT_AT_AR_AFGRIP",
        "NameGXT": "WCT_GRIP",
        "DescriptionGXT": "WCD_GRIP",
        "Name": "Grip",
        "Description": "Improves weapon accuracy.",
        "ModelHashKey": "w_at_ar_afgrip",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mplts"
  },
  "3342088282": {
    "HashKey": "WEAPON_MARKSMANRIFLE",
    "NameGXT": "WT_MKRIFLE",
    "DescriptionGXT": "WTD_MKRIFLE",
    "Name": "Marksman Rifle",
    "Description": "Whether you're up close or a disconcertingly long way away, this weapon will get the job done. A multi-range tool for tools. Part of the Last Team Standing Update.",
    "Group": "GROUP_SNIPER",
    "ModelHashKey": "w_sr_marksmanrifle",
    "DefaultClipSize": 8,
    "Components": {
      "3627761985": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_MKRF_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Marksman Rifle.",
        "ModelHashKey": "w_sr_marksmanrifle_mag1",
        "IsDefault": true
      },
      "3439143621": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_MKRF_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Marksman Rifle.",
        "ModelHashKey": "w_sr_marksmanrifle_mag2",
        "IsDefault": false
      },
      "471997210": {
        "HashKey": "COMPONENT_AT_SCOPE_LARGE_FIXED_ZOOM",
        "NameGXT": "WCT_SCOPE_LRG",
        "DescriptionGXT": "WCD_SCOPE_LRF",
        "Name": "Scope",
        "Description": "Long-range fixed zoom functionality.",
        "ModelHashKey": "w_at_scope_large",
        "IsDefault": true
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "2205435306": {
        "HashKey": "COMPONENT_AT_AR_SUPP",
        "NameGXT": "WCT_SUPP",
        "DescriptionGXT": "WCD_AR_SUPP",
        "Name": "Suppressor",
        "Description": "Reduces noise and muzzle flash.",
        "ModelHashKey": "w_at_ar_supp",
        "IsDefault": false
      },
      "202788691": {
        "HashKey": "COMPONENT_AT_AR_AFGRIP",
        "NameGXT": "WCT_GRIP",
        "DescriptionGXT": "WCD_GRIP",
        "Name": "Grip",
        "Description": "Improves weapon accuracy.",
        "ModelHashKey": "w_at_ar_afgrip",
        "IsDefault": false
      },
      "371102273": {
        "HashKey": "COMPONENT_MARKSMANRIFLE_VARMOD_LUXE",
        "NameGXT": "WCT_VAR_GOLD",
        "DescriptionGXT": "WCD_VAR_MKRF",
        "Name": "Yusuf Amir Luxury Finish",
        "Description": "",
        "ModelHashKey": "W_SR_MarksmanRifle_Luxe",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mplts"
  },
  "171789620": {
    "HashKey": "WEAPON_COMBATPDW",
    "NameGXT": "WT_COMBATPDW",
    "DescriptionGXT": "WTD_COMBATPDW",
    "Name": "Combat PDW",
    "Description": "Who said personal weaponry couldn't be worthy of military personnel? Thanks to our lobbyists, not Congress. Integral suppressor. Part of the Ill-Gotten Gains Update Part 1.",
    "Group": "GROUP_SMG",
    "ModelHashKey": "W_SB_PDW",
    "DefaultClipSize": 30,
    "Components": {
      "1125642654": {
        "HashKey": "COMPONENT_COMBATPDW_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_PDW_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Combat PDW.",
        "ModelHashKey": "W_SB_PDW_Mag1",
        "IsDefault": true
      },
      "860508675": {
        "HashKey": "COMPONENT_COMBATPDW_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_PDW_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Combat PDW.",
        "ModelHashKey": "W_SB_PDW_Mag2",
        "IsDefault": false
      },
      "1857603803": {
        "HashKey": "COMPONENT_COMBATPDW_CLIP_03",
        "NameGXT": "WCT_CLIP_DRM",
        "DescriptionGXT": "WCD_CLIP3",
        "Name": "Drum Magazine",
        "Description": "Expanded capacity and slower reload.",
        "ModelHashKey": "w_sb_pdw_boxmag",
        "IsDefault": false
      },
      "2076495324": {
        "HashKey": "COMPONENT_AT_AR_FLSH",
        "NameGXT": "WCT_FLASH",
        "DescriptionGXT": "WCD_FLASH",
        "Name": "Flashlight",
        "Description": "Aids low light target acquisition.",
        "ModelHashKey": "w_at_ar_flsh",
        "IsDefault": false
      },
      "202788691": {
        "HashKey": "COMPONENT_AT_AR_AFGRIP",
        "NameGXT": "WCT_GRIP",
        "DescriptionGXT": "WCD_GRIP",
        "Name": "Grip",
        "Description": "Improves weapon accuracy.",
        "ModelHashKey": "w_at_ar_afgrip",
        "IsDefault": false
      },
      "2855028148": {
        "HashKey": "COMPONENT_AT_SCOPE_SMALL",
        "NameGXT": "WCT_SCOPE_SML",
        "DescriptionGXT": "WCD_SCOPE_SML",
        "Name": "Scope",
        "Description": "Medium-range zoom functionality.",
        "ModelHashKey": "w_at_scope_small",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mpluxe"
  },
  "3638508604": {
    "HashKey": "WEAPON_KNUCKLE",
    "NameGXT": "WT_KNUCKLE",
    "DescriptionGXT": "WTD_KNUCKLE",
    "Name": "Knuckle Duster",
    "Description": "Perfect for knocking out gold teeth, or as a gift to the trophy partner who has everything. Part of The Ill-Gotten Gains Update Part 2.",
    "Group": "GROUP_UNARMED",
    "ModelHashKey": "W_ME_Knuckle",
    "DefaultClipSize": 0,
    "Components": {
      "4081463091": {
        "HashKey": "COMPONENT_KNUCKLE_VARMOD_BASE",
        "NameGXT": "WCT_KNUCK_01",
        "DescriptionGXT": "WCD_VAR_DESC",
        "Name": "Base Model",
        "Description": "",
        "ModelHashKey": "W_ME_Knuckle",
        "IsDefault": false
      },
      "3323197061": {
        "HashKey": "COMPONENT_KNUCKLE_VARMOD_PIMP",
        "NameGXT": "WCT_KNUCK_02",
        "DescriptionGXT": "WCD_VAR_DESC",
        "Name": "The Pimp",
        "Description": "",
        "ModelHashKey": "W_ME_Knuckle_02",
        "IsDefault": false
      },
      "4007263587": {
        "HashKey": "COMPONENT_KNUCKLE_VARMOD_BALLAS",
        "NameGXT": "WCT_KNUCK_BG",
        "DescriptionGXT": "WCD_VAR_DESC",
        "Name": "The Ballas",
        "Description": "",
        "ModelHashKey": "W_ME_Knuckle_BG",
        "IsDefault": false
      },
      "1351683121": {
        "HashKey": "COMPONENT_KNUCKLE_VARMOD_DOLLAR",
        "NameGXT": "WCT_KNUCK_DLR",
        "DescriptionGXT": "WCD_VAR_DESC",
        "Name": "The Hustler",
        "Description": "",
        "ModelHashKey": "W_ME_Knuckle_DLR",
        "IsDefault": false
      },
      "2539772380": {
        "HashKey": "COMPONENT_KNUCKLE_VARMOD_DIAMOND",
        "NameGXT": "WCT_KNUCK_DMD",
        "DescriptionGXT": "WCD_VAR_DESC",
        "Name": "The Rock",
        "Description": "",
        "ModelHashKey": "W_ME_Knuckle_DMD",
        "IsDefault": false
      },
      "2112683568": {
        "HashKey": "COMPONENT_KNUCKLE_VARMOD_HATE",
        "NameGXT": "WCT_KNUCK_HT",
        "DescriptionGXT": "WCD_VAR_DESC",
        "Name": "The Hater",
        "Description": "",
        "ModelHashKey": "W_ME_Knuckle_HT",
        "IsDefault": false
      },
      "1062111910": {
        "HashKey": "COMPONENT_KNUCKLE_VARMOD_LOVE",
        "NameGXT": "WCT_KNUCK_LV",
        "DescriptionGXT": "WCD_VAR_DESC",
        "Name": "The Lover",
        "Description": "",
        "ModelHashKey": "W_ME_Knuckle_LV",
        "IsDefault": false
      },
      "146278587": {
        "HashKey": "COMPONENT_KNUCKLE_VARMOD_PLAYER",
        "NameGXT": "WCT_KNUCK_PC",
        "DescriptionGXT": "WCD_VAR_DESC",
        "Name": "The Player",
        "Description": "",
        "ModelHashKey": "W_ME_Knuckle_PC",
        "IsDefault": false
      },
      "3800804335": {
        "HashKey": "COMPONENT_KNUCKLE_VARMOD_KING",
        "NameGXT": "WCT_KNUCK_SLG",
        "DescriptionGXT": "WCD_VAR_DESC",
        "Name": "The King",
        "Description": "",
        "ModelHashKey": "W_ME_Knuckle_SLG",
        "IsDefault": false
      },
      "2062808965": {
        "HashKey": "COMPONENT_KNUCKLE_VARMOD_VAGOS",
        "NameGXT": "WCT_KNUCK_VG",
        "DescriptionGXT": "WCD_VAR_DESC",
        "Name": "The Vagos",
        "Description": "",
        "ModelHashKey": "W_ME_Knuckle_VG",
        "IsDefault": false
      }
    },
    "Tints": [],
    "DLC": "mpluxe2"
  },
  "3696079510": {
    "HashKey": "WEAPON_MARKSMANPISTOL",
    "NameGXT": "WT_MKPISTOL",
    "DescriptionGXT": "WTD_MKPISTOL",
    "Name": "Marksman Pistol",
    "Description": "Not for the risk averse. Make it count as you'll be reloading as much as you shoot. Part of The Ill-Gotten Gains Update Part 2.",
    "Group": "GROUP_PISTOL",
    "ModelHashKey": "W_PI_SingleShot",
    "DefaultClipSize": 1,
    "Components": {
      "3416146413": {
        "HashKey": "COMPONENT_MARKSMANPISTOL_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_INVALID",
        "Name": "Default Clip",
        "Description": "",
        "ModelHashKey": "W_PI_SingleShot_Shell",
        "IsDefault": true
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINTDF",
        "Name": "Default tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mpluxe2"
  },
  "1627465347": {
    "HashKey": "WEAPON_GUSENBERG",
    "NameGXT": "WT_GUSNBRG",
    "DescriptionGXT": "WTD_GUSNBRG",
    "Name": "Gusenberg Sweeper",
    "Description": "Complete your look with a Prohibition gun. Looks great being fired from an Albany Roosevelt or paired with a pinstripe suit. Part of the Valentine's Day Massacre Special.",
    "Group": "GROUP_MG",
    "ModelHashKey": "w_sb_gusenberg",
    "DefaultClipSize": 30,
    "Components": {
      "484812453": {
        "HashKey": "COMPONENT_GUSENBERG_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_GSNB_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Gusenberg Sweeper.",
        "ModelHashKey": "w_sb_gusenberg_mag1",
        "IsDefault": true
      },
      "3939025520": {
        "HashKey": "COMPONENT_GUSENBERG_CLIP_02",
        "NameGXT": "WCT_CLIP2",
        "DescriptionGXT": "WCD_GSNB_CLIP2",
        "Name": "Extended Clip",
        "Description": "Extended capacity for Gusenberg Sweeper.",
        "ModelHashKey": "w_sb_gusenberg_mag2",
        "IsDefault": false
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "mpvalentines"
  },
  "4191993645": {
    "HashKey": "WEAPON_HATCHET",
    "NameGXT": "WT_HATCHET",
    "DescriptionGXT": "WTD_HATCHET",
    "Name": "Hatchet",
    "Description": "Make kindling... of your pals with this easy to wield, easy to hide hatchet. Exclusive content for returning players.",
    "Group": "GROUP_MELEE",
    "ModelHashKey": "w_me_hatchet",
    "DefaultClipSize": 0,
    "Components": {},
    "Tints": [],
    "DLC": "spupgrade"
  },
  "1834241177": {
    "HashKey": "WEAPON_RAILGUN",
    "NameGXT": "WT_RAILGUN",
    "DescriptionGXT": "WTD_RAILGUN",
    "Name": "Railgun",
    "Description": "All you need to know is - magnets, and it does horrible things to the things it's pointed at. Exclusive content for returning players.",
    "Group": "GROUP_HEAVY",
    "ModelHashKey": "w_ar_railgun",
    "DefaultClipSize": 1,
    "Components": {
      "59044840": {
        "HashKey": "COMPONENT_RAILGUN_CLIP_01",
        "NameGXT": "WCT_CLIP1",
        "DescriptionGXT": "WCD_RLGN_CLIP1",
        "Name": "Default Clip",
        "Description": "Standard capacity for Railgun.",
        "ModelHashKey": "w_ar_railgun_mag1",
        "IsDefault": true
      }
    },
    "Tints": [
      {
        "NameGXT": "WM_TINT0",
        "Name": "Black tint"
      },
      {
        "NameGXT": "WM_TINT1",
        "Name": "Green tint"
      },
      {
        "NameGXT": "WM_TINT2",
        "Name": "Gold tint"
      },
      {
        "NameGXT": "WM_TINT3",
        "Name": "Pink tint"
      },
      {
        "NameGXT": "WM_TINT4",
        "Name": "Army tint"
      },
      {
        "NameGXT": "WM_TINT5",
        "Name": "LSPD tint"
      },
      {
        "NameGXT": "WM_TINT6",
        "Name": "Orange tint"
      },
      {
        "NameGXT": "WM_TINT7",
        "Name": "Platinum tint"
      }
    ],
    "DLC": "spupgrade"
  }
}
},{}],16:[function(require,module,exports){
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


},{"./weaponData":15}],17:[function(require,module,exports){
//1868.765869140625, 3710.90283203125, 113.74462127685547
var natives = require("./natives.js")
var CEFInterface = require("./browser.js").interface;
var CEFNotification = require("./browser.js").notification;
CEFInterface.load("login/index.html");

function clearBlips() {
    natives.SET_THIS_SCRIPT_CAN_REMOVE_BLIPS_CREATED_BY_ANY_SCRIPT(true);
    let last_blip = natives.GET_FIRST_BLIP_INFO_ID(5);
    while (natives.DOES_BLIP_EXIST(last_blip)) {
        mp.game.ui.removeBlip(last_blip);
        last_blip = natives.GET_NEXT_BLIP_INFO_ID(5);
    }
    mp.game.wait(50);
}
// Account Stuff
mp.gui.chat.show(false);
mp.events.callRemote("ServerAccount:Ready");
mp.game.graphics.transitionToBlurred(1);
var LastCam;
mp.events.add("Server:RequestLogin", () => {
    clearBlips();
    mp.players.local.position = new mp.Vector3(2927.993408203125, 5618.33544921875, 244.45285034179688);
    mp.players.local.setAlpha(0);
    mp.defaultCam = mp.cameras.new('default', new mp.Vector3(2927.993408203125, 5618.33544921875, 244.45285034179688), new mp.Vector3(), 70);
    mp.defaultCam.pointAtCoord(2906.989501953125, 5563.49267578125, 245.226806640625);
    mp.defaultCam.setActive(true);
    mp.game.cam.renderScriptCams(true, false, 0, true, false);
    mp.game.ui.displayHud(false);
    mp.game.ui.displayRadar(false);
    mp.game.graphics.transitionToBlurred(1);
    CEFInterface.cursor(true);
    setTimeout(function() {
        CEFInterface.call("cef_loadlogin", mp.players.local.name)
    }, 100);
});
mp.events.add("Account:Alert", function(...args) {
    CEFInterface.call("alert_login", args[0])
});
mp.events.add("Account:HideLogin", () => {
    mp.game.graphics.transitionFromBlurred(500);
    CEFInterface.cursor(false);
    CEFInterface.call("cef_hidelogin")
});
mp.events.add("Account:LoginDone", () => {
    mp.game.player.setTargetingMode(1);
    mp.game.player.setLockon(false);
    mp.game.player.setLockonRangeOverride(0.0);
    mp.players.local.setOnlyDamagedByPlayer(false);
    mp.players.local.setProofs(true, false, false, false, false, false, false, false);
    mp.game.player.setHealthRechargeMultiplier(0.0);
    mp.game.ui.displayRadar(true);
    mp.game.ui.displayHud(true);
    mp.game.ui.setMinimapVisible(false);
    mp.gui.chat.show(true);
    //startMakingItems();
})
mp.events.add("Cam:Hide", () => {
    mp.game.graphics.transitionFromBlurred(100);
    mp.game.ui.displayRadar(true);
    mp.game.ui.displayHud(true);
    mp.game.ui.setMinimapVisible(false)
    mp.game.player.setTargetingMode(1);
    mp.game.player.setLockon(false);
    mp.game.player.setLockonRangeOverride(0.0);
    mp.players.local.setOnlyDamagedByPlayer(false);
    mp.players.local.setProofs(true, false, false, false, false, false, false, false);
    mp.game.player.setHealthRechargeMultiplier(0.0);
    mp.players.local.freezePosition(false);
    mp.game.cam.renderScriptCams(false, false, 0, true, false);
    mp.game.cam.doScreenFadeIn(1000);
})
mp.events.add("entityStreamIn", (entity) => {
    if (entity.type !== "player") return;
    mp.game.player.setTargetingMode(1);
    mp.game.player.setLockon(false);
    mp.game.player.setLockonRangeOverride(0.0);
    mp.players.local.setOnlyDamagedByPlayer(false);
    mp.players.local.setProofs(true, false, false, false, false, false, false, false);
    mp.game.player.setLockonRangeOverride(0.0);
});
mp.events.add("Account:Login", (username, password) => {
    mp.events.callRemote("ServerAccount:Login", username, password);
});
mp.events.add("Account:Register", (username, hash_password, salt) => {
    mp.events.callRemote("ServerAccount:Register", username, hash_password, salt);
});
/*
function startMakingItems() {
    mp.objects.new(mp.game.joaat("v_res_fa_bread01"), new mp.Vector3(1001, 620, 850), {
        rotation: new mp.Vector3(0, 0, 90),
        alpha: 255,
        dimension: 0
    });
    mp.events.add('render', () => {
        mp.players.local.freezePosition(true);
        mp.players.local.position = new mp.Vector3(1045, 620, 850);
        mp.players.local.setAlpha(0);
        mp.defaultCam.setFov(30);
        mp.defaultCam.setCoord(1004, 620, 850);
        mp.defaultCam.pointAtCoord(1000, 620, 850);
        mp.defaultCam.setActive(true);
        mp.game.cam.renderScriptCams(true, false, 0, true, false);
        mp.game.graphics.drawBox(1000, 500, 550, 1000, 1500, 1550, 0, 255, 0, 255);
    });
}*/
},{"./browser.js":1,"./natives.js":19}],18:[function(require,module,exports){
var materials = {};

materials[2379541433] = 1;
materials[127813971] = 2;
materials[3454750755] = 2;
//materials[581794674] = true;

module.exports = materials;
},{}],19:[function(require,module,exports){
var natives = {};
mp.game.vehicle.getVehicleSeats = (veh) => mp.game.invoke("0xA7C4F2C6E744A550", veh.handle);
mp.game.graphics.clearDrawOrigin = () => mp.game.invoke('0xFF0B610F6BE0D7AF'); // 26.07.2018 // GTA 1.44 
natives.START_PLAYER_TELEPORT = (player, x, y, z, heading, p5, p6, p7) => mp.game.invoke("0xAD15F075A4DA0FDE", player, x, y, z, heading, p5, p6, p7);
natives.CHANGE_PLAYER_PED = (ped, p1, p2) => mp.game.invoke("0x048189FAC643DEEE", ped, p1, p2);
natives.SET_PED_CURRENT_WEAPON_VISIBLE = (ped, visible, deselectWeapon, p3, p4) => mp.game.invoke("0x0725A4CCFDED9A70", ped, visible, deselectWeapon, p3, p4);
natives.SET_BLIP_SPRITE = (blip, sprite) => mp.game.invoke("0xDF735600A4696DAF", blip, sprite); // SET_BLIP_SPRITE
natives.SET_BLIP_ALPHA = (blip, a) => mp.game.invoke("0x45FF974EEE1C8734", blip, a); // SET_BLIP_ALPHA
natives.SET_BLIP_COLOUR = (blip, c) => mp.game.invoke("0x03D7FB09E75D6B7E", blip, c); // SET_BLIP_COLOUR
natives.SET_BLIP_ROTATION = (blip, r) => mp.game.invoke("0xF87683CDF73C3F6E", blip, r); // SET_BLIP_ROTATION
natives.SET_BLIP_FLASHES = (blip, f) => mp.game.invoke("0xB14552383D39CE3E", blip, f); // SET_BLIP_FLASHES
natives.SET_BLIP_FLASH_TIMER = (blip, t) => mp.game.invoke("0xD3CD6FD297AE87CC", blip, t); // SET_BLIP_FLASH_TIMER
natives.SET_BLIP_COORDS = (blip, x, y, z) => mp.game.invoke("0xAE2AF67E9D9AF65D", blip, x, y, z); // SET_BLIP_COORDS
natives.SET_CURSOR_LOCATION = (x, y) => mp.game.invoke("0xFC695459D4D0E219", x, y); // SET_CURSOR_LOCATION 
natives.SET_THIS_SCRIPT_CAN_REMOVE_BLIPS_CREATED_BY_ANY_SCRIPT = (toggle) => mp.game.invoke("0xB98236CAAECEF897", toggle); // SET_THIS_SCRIPT_CAN_REMOVE_BLIPS_CREATED_BY_ANY_SCRIPT
natives.GET_FIRST_BLIP_INFO_ID = (i) => mp.game.invoke("0x1BEDE233E6CD2A1F", i); // GET_FIRST_BLIP_INFO_ID
natives.GET_NEXT_BLIP_INFO_ID = (i) => mp.game.invoke("0x14F96AA50D6FBEA7", i); // GET_NEXT_BLIP_INFO_ID
natives.DOES_BLIP_EXIST = (blip) => mp.game.invoke("0xA6DB27D19ECBB7DA", blip); // DOES_BLIP_EXIST
natives.GET_NUMBER_OF_ACTIVE_BLIPS = () => mp.game.invoke("0x9A3FF3DE163034E8"); // GET_NUMBER_OF_ACTIVE_BLIPS
natives.SET_BLIP_SCALE = (blip, scale) => mp.game.invoke("0xD38744167B2FA257", blip, scale); // SET_BLIP_SCALE
natives.SET_ENTITY_NO_COLLISION_ENTITY = (entity1, entity2, collision) => mp.game.invoke("0xA53ED5520C07654A", entity1.handle, entity2.handle, collision); // SET_ENTITY_NO_COLLISION_ENTITY
natives.GET_CLOSEST_OBJECT_OF_TYPE = (x, y, z, radius, modelHash, isMission, p6, p7) => mp.game.invoke("0xE143FA2249364369", x, y, z, radius, modelHash, isMission, p6, p7); // GET_CLOSEST_OBJECT_OF_TYPE
natives.DOES_OBJECT_OF_TYPE_EXIST_AT_COORDS = (x, y, z, radius, hash, p5) => mp.game.invoke("0xBFA48E2FF417213F", x, y, z, radius, hash, p5); // DOES_OBJECT_OF_TYPE_EXIST_AT_COORDS
natives.PLACE_OBJECT_ON_GROUND_PROPERLY = (obj) => mp.game.invoke("0x58A850EAEE20FAA3", obj); // PLACE_OBJECT_ON_GROUND_PROPERLY
natives.GET_ENTITY_ROTATION = (ent,order) => mp.game.invoke("0xAFBD61CC738D9EB9", ent,order); // GET_ENTITY_ROTATION
natives.GET_ENTITY_COORDS = (ent,alive) => mp.game.invoke("0x3FEF770D40960D5A", ent,alive); // GET_ENTITY_COORDS
natives.SET_ENTITY_COLLISION = (ent,toggle,physics) => mp.game.invoke("0x1A9205C1B9EE827F", ent,toggle,physics); // SET_ENTITY_COLLISION
natives.FREEZE_ENTITY_POSITION = (ent,toggle) => mp.game.invoke("0x428CA6DBD1094446", ent,toggle); // FREEZE_ENTITY_POSITION
natives.SET_ENTITY_COORDS = ( entity,  xPos,  yPos,  zPos,  xAxis,  yAxis,  zAxis,  clearArea) => mp.game.invoke("0x06843DA7060A026B",entity,  xPos,  yPos,  zPos,  xAxis,  yAxis,  zAxis,  clearArea); // SET_ENTITY_COORDS
natives.SET_ENTITY_ROTATION = (  entity,  pitch,  roll,  yaw,  rotationOrder,  p5) => mp.game.invoke("0x8524A8B0171D5E07", entity,  pitch,  roll,  yaw,  rotationOrder,  p5); // SET_ENTITY_ROTATION
natives.GET_ENTITY_HEIGHT_ABOVE_GROUND = (  entity) => mp.game.invoke("0x1DD55701034110E5", entity); // GET_ENTITY_HEIGHT_ABOVE_GROUND
module.exports = natives;
},{}],20:[function(require,module,exports){
var Notifications = new class {
    constructor() {
        let self = this;
        this._renderObjects = [];
        this._smoothing = 1 / 120;
        mp.events.add("render", () => {
            self.render();
        });
    }
    render() {
        let self = this;
        self._renderObjects.forEach(function(frame, i) {
            let sVector = mp.vector(frame.start);
            let eVector = mp.vector(frame.end);
            let new_TargetPos = sVector.lerp(eVector, frame.t);


            frame.color[3] = 200 * (1 - (frame.t/1.4))

            mp.game.graphics.drawText(frame.text, [new_TargetPos.x, new_TargetPos.y, new_TargetPos.z], {
                font: 4,
                color: frame.color,
                scale: [0.3, 0.3],
                outline: true,
                centre: true
            });
            frame.t += self._smoothing;
            if ((frame.t >= 1) || (frame.color[3] < 0)){
                self._renderObjects.splice(i, 1);
            }
        })
    }
    notify3D(x,y,z,tx,ty,tz, text = "NO", color = [255, 255, 255]) {
        this._renderObjects.push({
            start:new mp.Vector3(x,y,z),
            end:new mp.Vector3(tx,ty,tz),
            t:0,
            text:text,
            color:color
        })
    }
}
module.exports = Notifications;

},{}],21:[function(require,module,exports){
//object.js
},{}],22:[function(require,module,exports){
var offsets = {
	"sr_prop_sr_boxwood_01": {
		pos: new mp.Vector3(0, 0, 0),
		rot: new mp.Vector3(0, 0, 0)
	},
	"prop_box_wood04a": {
		pos: new mp.Vector3(0, 0, 0),
		rot: new mp.Vector3(0, 0, 0)
	}
}
module.exports = offsets;
},{}],23:[function(require,module,exports){
let utils = require("./utils.js");
var CEFHud = require("./browser.js").hud;
var initDone = false;
var toShow = false;
var cachedData = {
	show: false,
	thirst: 0,
	hunger: 0,
	energy: {
		show: false,
		val: 0
	}
};
/*Load Hud*/
mp.events.add('Player:ShowUI', () => {
	CEFHud.load("hud/index.html");
	toShow = true;
});
mp.events.add('Player:HideUI', () => {
	toShow = false;
});
mp.events.add("HUD:Ready", () => {
	let anchor = utils.minimap_anchor();
	CEFHud.call("init", anchor);
	initDone = true;
});
const statNames = ["SP0_STAMINA﻿", "SP0_STRENGTH", "SP0_LUNG_CAPACITY", "SP0_WHEELIE_ABILITY", "SP0_FLYING_ABILITY", "SP0_SHOOTING_ABILITY", "SP0_STEALTH_ABILITY"];
// maybe playerReady can be used instead, haven't tested
mp.events.add("playerSpawn", () => {
	for (const stat of statNames) mp.game.stats.statSetInt(mp.game.joaat(stat), 100, false);
});
//CEFHud
let opos = undefined;
mp.events.add("render", () => {
	if (mp.localPlayer.getVariable("spawned") == true) {
		if (initDone == true) {
			let hunger = mp.localPlayer.getVariable("hunger")
			let thirst = mp.localPlayer.getVariable("thirst")
			if (hunger != cachedData.hunger) {
				cachedData.hunger = hunger;
				CEFHud.call("setHunger", cachedData.hunger);
			}
			if (thirst != cachedData.thirst) {
				cachedData.thirst = thirst;
				CEFHud.call("setThirst", cachedData.thirst);
			}
			mp.game.player.setRunSprintMultiplierFor(1 + ((0.49 / 400) * thirst));
			if (thirst < 30) {
				mp.game.controls.disableControlAction(2, 21, true);
			}
		}
	}
	if (toShow != cachedData.show) {
		if (toShow == true) {
			cachedData.show = true;
			CEFHud.call("show")
		} else {
			cachedData.show = false;
			CEFHud.call("hide")
		}
	}
});
},{"./browser.js":1,"./utils.js":30}],24:[function(require,module,exports){
var messageScaleform = require("./Scaleform.js");
let bigMessageScaleform = null;
let bigMsgInit = 0;
let bigMsgDuration = 5000;
let bigMsgAnimatedOut = false;
 
mp.events.add("ShowWeaponPurchasedMessage", (title, weaponName, weaponHash, time = 5000) => {
    if (bigMessageScaleform == null) bigMessageScaleform = new messageScaleform("mp_big_message_freemode");
    bigMessageScaleform.callFunction("SHOW_WEAPON_PURCHASED", title, weaponName, weaponHash);

    bigMsgInit = Date.now();
    bigMsgDuration = time;
    bigMsgAnimatedOut = false;
});

mp.events.add("ShowPlaneMessage", (title, planeName, planeHash, time = 5000) => {
    if (bigMessageScaleform == null) bigMessageScaleform = new messageScaleform("mp_big_message_freemode");
    bigMessageScaleform.callFunction("SHOW_PLANE_MESSAGE", title, planeName, planeHash);

    bigMsgInit = Date.now();
    bigMsgDuration = time;
    bigMsgAnimatedOut = false;
});

mp.events.add("ShowShardMessage", (title, message, titleColor, bgColor, time = 5000) => {
    if (bigMessageScaleform == null) bigMessageScaleform = new messageScaleform("mp_big_message_freemode");
    bigMessageScaleform.callFunction("SHOW_SHARD_CENTERED_MP_MESSAGE", title, message, titleColor, bgColor);

    bigMsgInit = Date.now();
    bigMsgDuration = time;
    bigMsgAnimatedOut = false;
});

mp.events.add("render", () => {
    if (bigMessageScaleform != null) {
        bigMessageScaleform.renderFullscreen();

        if (bigMsgInit > 0 && Date.now() - bigMsgInit > bigMsgDuration) {
            if (!bigMsgAnimatedOut) {
                bigMessageScaleform.callFunction("TRANSITION_OUT");
                bigMsgAnimatedOut = true;
                bigMsgDuration += 750;
            } else {
                bigMsgInit = 0;
                bigMessageScaleform.dispose();
                bigMessageScaleform = null;
            }
        }
    }
});
},{"./Scaleform.js":27}],25:[function(require,module,exports){
class InstructionButtons {
    constructor() {
        this.handle = mp.game.graphics.requestScaleformMovie("instructional_buttons");
        this.ScIndex = 0;
        while (!mp.game.graphics.hasScaleformMovieLoaded(this.handle)) mp.game.wait(0);
    }
    InitButtons(x,y,z) {
        this.ScIndex = 0;
        mp.game.graphics.drawScaleformMovieFullscreen(this.handle, 255, 255, 255, 0, false);
        mp.game.graphics.pushScaleformMovieFunction(this.handle, "CLEAR_ALL");
        mp.game.graphics.popScaleformMovieFunctionVoid();
        mp.game.graphics.pushScaleformMovieFunction(this.handle, "SET_CLEAR_SPACE");
        mp.game.graphics.pushScaleformMovieFunctionParameterInt(200);
        mp.game.graphics.popScaleformMovieFunctionVoid();
    }
    AddButton(text, button) {
        if (typeof button == "number") {
            mp.game.graphics.pushScaleformMovieFunction(this.handle, "SET_DATA_SLOT");
            mp.game.graphics.pushScaleformMovieFunctionParameterInt(this.ScIndex);
            mp.game.graphics.pushScaleformMovieFunctionParameterInt(button);
            mp.game.graphics.pushScaleformMovieFunctionParameterString(text);
            mp.game.graphics.popScaleformMovieFunctionVoid();
            this.ScIndex++;
        } else {
            mp.game.graphics.pushScaleformMovieFunction(this.handle, "SET_DATA_SLOT");
            mp.game.graphics.pushScaleformMovieFunctionParameterInt(this.ScIndex);
            mp.game.graphics.pushScaleformMovieFunctionParameterString(button);
            mp.game.graphics.pushScaleformMovieFunctionParameterString(text);
            mp.game.graphics.popScaleformMovieFunctionVoid();
            this.ScIndex++;
        }
    }
    finalizeButtons(type = 1,r,g,b,a) {
        mp.game.graphics.pushScaleformMovieFunction(this.handle, "DRAW_INSTRUCTIONAL_BUTTONS");
        mp.game.graphics.pushScaleformMovieFunctionParameterInt(type);
        mp.game.graphics.popScaleformMovieFunctionVoid();
        mp.game.graphics.pushScaleformMovieFunction(this.handle, "SET_BACKGROUND_COLOUR");
        mp.game.graphics.pushScaleformMovieFunctionParameterInt(r);
        mp.game.graphics.pushScaleformMovieFunctionParameterInt(g);
        mp.game.graphics.pushScaleformMovieFunctionParameterInt(b);
        mp.game.graphics.pushScaleformMovieFunctionParameterInt(a);
        mp.game.graphics.popScaleformMovieFunctionVoid();
    }
}
module.exports = new InstructionButtons();
},{}],26:[function(require,module,exports){
var messageScaleform = require("./Scaleform.js");
let midsizedMessageScaleform = null;
let msgInit = 0;
let msgDuration = 5000;
let msgAnimatedOut = false;
let msgBgColor = 0;

mp.events.add("ShowMidsizedMessage", (title, message, time = 5000) => {
    if (midsizedMessageScaleform == null) midsizedMessageScaleform = new messageScaleform("midsized_message");
    midsizedMessageScaleform.callFunction("SHOW_MIDSIZED_MESSAGE", title, message);

    msgInit = Date.now();
    msgDuration = time;
    msgAnimatedOut = false;
});

mp.events.add("ShowMidsizedShardMessage", (title, message, bgColor, useDarkerShard, condensed, time = 5000) => {
    if (midsizedMessageScaleform == null) midsizedMessageScaleform = new messageScaleform("midsized_message");
    midsizedMessageScaleform.callFunction("SHOW_SHARD_MIDSIZED_MESSAGE", title, message, bgColor, useDarkerShard, condensed);

    msgInit = Date.now();
    msgDuration = time;
    msgAnimatedOut = false;
    msgBgColor = bgColor;
});

mp.events.add("render", () => {
    if (midsizedMessageScaleform != null) {
        midsizedMessageScaleform.renderFullscreen();

        if (msgInit > 0 && Date.now() - msgInit > msgDuration) {
            if (!msgAnimatedOut) {
                midsizedMessageScaleform.callFunction("SHARD_ANIM_OUT", msgBgColor);
                msgAnimatedOut = true;
                msgDuration += 750;
            } else {
                msgInit = 0;
                midsizedMessageScaleform.dispose();
                midsizedMessageScaleform = null;
            }
        }
    }
});
},{"./Scaleform.js":27}],27:[function(require,module,exports){
class BasicScaleform {
    constructor(scaleformName) {
        this.handle = mp.game.graphics.requestScaleformMovie(scaleformName);
        while (!mp.game.graphics.hasScaleformMovieLoaded(this.handle)) mp.game.wait(0);
    }

    // thanks kemperrr
    callFunction(functionName, ...args) {
        mp.game.graphics.pushScaleformMovieFunction(this.handle, functionName);

        args.forEach(arg => {
            switch(typeof arg) {
                case "string": {
                    mp.game.graphics.pushScaleformMovieFunctionParameterString(arg);
                    break;
                }

                case "boolean": {
                    mp.game.graphics.pushScaleformMovieFunctionParameterBool(arg);
                    break;
                }

                case "number": {
                    if(Number(arg) === arg && arg % 1 !== 0) {
                        mp.game.graphics.pushScaleformMovieFunctionParameterFloat(arg);
                    } else {
                        mp.game.graphics.pushScaleformMovieFunctionParameterInt(arg);
                    }
                }
            }
        });

        mp.game.graphics.popScaleformMovieFunctionVoid();
    }

    renderFullscreen() {
        mp.game.graphics.drawScaleformMovieFullscreen(this.handle, 255, 255, 255, 255, false);
    }

    dispose() {
        mp.game.graphics.setScaleformMovieAsNoLongerNeeded(this.handle);
    }
}

module.exports = BasicScaleform;
},{}],28:[function(require,module,exports){
var messageScaleform = require("./Scaleform.js");
require("./BigMessage.js");
require("./MidsizedMessage.js");

mp.game.ui.instructionalButtons = require("./InstructionButtons.js");
mp.game.ui.messages = {
    showShard: (title, message, titleColor, bgColor, time = 5000) => mp.events.call("ShowShardMessage", title, message, titleColor, bgColor, time),
    showWeaponPurchased: (title, weaponName, weaponHash, time = 5000) => mp.events.call("ShowWeaponPurchasedMessage", title, weaponName, weaponHash, time),
    showPlane: (title, planeName, planeHash, time = 5000) => mp.events.call("ShowPlaneMessage", title, planeName, planeHash, time),
    showMidsized: (title, message, time = 5000) => mp.events.call("ShowMidsizedMessage", title, message, time),
    showMidsizedShard: (title, message, bgColor, useDarkerShard, condensed, time = 5000) => mp.events.call("ShowMidsizedShardMessage", title, message, bgColor, useDarkerShard, condensed, time),
};


},{"./BigMessage.js":24,"./InstructionButtons.js":25,"./MidsizedMessage.js":26,"./Scaleform.js":27}],29:[function(require,module,exports){
var cell_size = 40;
var padding = 5;
var inv_cells = 6;
var inv_rows = 5;
var TempStorage = [];
var CEFStorage = require("./browser.js").storage;
var CEFNotification = require("./browser.js").notification;
var ScreenResolution = mp.game.graphics.getScreenActiveResolution(0, 0);
CEFStorage.load("storage/index.html");
let clientWidth = cell_size * inv_cells + (padding * 2)
let clientHeight = cell_size * inv_rows + 37 + (padding * 2)
var Inventory_Order = {
	positions: {
		"inventory": {
			top: `calc(50% - ${clientHeight/2}px)`,
			left: `calc(50% - ${clientWidth/2}px)`
		},
		"equipment": {
			top: `20%`,
			left: `15%`
		}
	},
	items: {}
};
if (mp.storage.data.inventory_order) {
	let storageData = mp.storage.data.inventory_order;
	Inventory_Order.positions = storageData.positions || {
		"inventory": {
			top: `calc(50% - ${clientHeight/2}px)`,
			left: `calc(50% - ${clientWidth/2}px)`
		},
		"equipment": {
			top: `20%`,
			left: `15%`
		}
	};
	Inventory_Order.items = storageData.items || {};
} else {
	mp.storage.data.inventory_order = Inventory_Order;
}
mp.events.add("Inventory:Resize", (cell_count, row_count) => {
	inv_cells = cell_count;
	inv_rows = row_count;
	CEFStorage.call("resize", "inventory", inv_cells, inv_rows);
});
mp.events.add("Inventory:Ready", (data) => {
	CEFStorage.call("initialize", "inventory", inv_cells, inv_rows, {
		top: Inventory_Order.positions["inventory"].top,
		left: Inventory_Order.positions["inventory"].left
	})
});
var windowsOpen = [];

function toggleInventory() {
	console.log("toggle inventory", JSON.stringify(windowsOpen));
	console.log("mp.gui.chat.enabled", mp.gui.chat.enabled);
	console.log("mp.ui.ready", mp.ui.ready);
	if (windowsOpen.indexOf("inventory") == -1) {
		if ((mp.gui.chat.enabled == false) && (mp.ui.ready == true)) {
			CEFStorage.call("setPos", "inventory", Inventory_Order.positions["inventory"].top, Inventory_Order.positions["inventory"].left);
			CEFStorage.call("show");
			CEFStorage.cursor(true);
			windowsOpen.push("inventory");
			mp.canCrouch = false;
			mp.gui.chat.activate(false)
		}
	} else {
		mp.rpc.callBrowser(CEFStorage.browser, 'isBusy').then(value => {
			if (value == false) {
				CEFStorage.call("hide");
				windowsOpen.splice(windowsOpen.indexOf("inventory"), 1);
				if (windowsOpen.length == 0) {
					mp.gui.chat.activate(true)
					CEFStorage.cursor(false);
					mp.canCrouch = true;
				}
			} else {
				CEFNotification.call("notify", {
					title: "Inventory",
					titleSize: "16px",
					message: `Please finish your action before closing..`,
					messageColor: 'rgba(50,50,50,.8)',
					position: "bottomCenter",
					backgroundColor: 'rgba(206, 206, 206, 0.9)',
					close: false
				})
			}
		}).catch(err => {
			console.log("error", err);
			CEFStorage.call("hide");
			windowsOpen.splice(windowsOpen.indexOf("inventory"), 1);
			if (windowsOpen.length == 0) {
				mp.gui.chat.activate(true)
				CEFStorage.cursor(false);
				mp.canCrouch = true;
			}
		});
	}
}

function toggleEquipment() {
	console.log("toggle inventory", JSON.stringify(windowsOpen));
	console.log("mp.gui.chat.enabled", mp.gui.chat.enabled);
	console.log("mp.ui.ready", mp.ui.ready);
	if (windowsOpen.indexOf("equipment") == -1) {
		if ((mp.gui.chat.enabled == false) && (mp.ui.ready == true)) {
			console.log("x");
			//console.log("setPos", "equipment", Inventory_Order.positions["equipment"].top || 0, Inventory_Order.positions["equipment"].left || 0);
			CEFStorage.call("setPos", "equipment", Inventory_Order.positions["equipment"].top || 0, Inventory_Order.positions["equipment"].left || 0);
			CEFStorage.call("show", "equipment");
			CEFStorage.cursor(true);
			toggleInvState = true;
			mp.canCrouch = false;
			mp.gui.chat.activate(false)
			windowsOpen.push("equipment");
		}
	} else {
		mp.rpc.callBrowser(CEFStorage.browser, 'isBusy').then(value => {
			if (value == false) {
				CEFStorage.call("hide", "equipment");
				windowsOpen.splice(windowsOpen.indexOf("equipment"), 1);
				if (windowsOpen.length == 0) {
					mp.gui.chat.activate(true)
					CEFStorage.cursor(false);
					mp.canCrouch = true;
				}
			} else {
				CEFNotification.call("notify", {
					title: "Inventory",
					titleSize: "16px",
					message: `Please finish your action before closing..`,
					messageColor: 'rgba(50,50,50,.8)',
					position: "bottomCenter",
					backgroundColor: 'rgba(206, 206, 206, 0.9)',
					close: false
				})
			}
		}).catch(err => {
			console.log("error", err);
			CEFStorage.call("hide");
			windowsOpen.splice(windowsOpen.indexOf("equipment"), 1);
			if (windowsOpen.length == 0) {
				mp.gui.chat.activate(true)
				CEFStorage.cursor(false);
				mp.canCrouch = true;
			}
		});
	}
}
let toggleInvState = false;
mp.keys.bind(0x55, false, () => {
	toggleEquipment();
});
mp.keys.bind(0x49, false, () => {
	toggleInventory();
});
mp.events.add("Inventory:Update", (inventory) => {
	if (!TempStorage["inventory"]) {
		TempStorage["inventory"] = [];
	}
	CEFStorage.call("clear", "inventory");
	TempStorage["inventory"] = [];
	inventory = inventory.sort(function(a, b) {
		return b.height - a.height || b.width - a.width;
	})
	inventory.forEach(function(citem) {
		let tempSettings = StorageSystem.getTempSettings(citem.id, "inventory");
		let gData = {
			id: citem.id,
			name: citem.name,
			image: citem.image,
			scale: tempSettings.scale || {},
			amount: citem.amount,
			max_stack: citem.max_stack,
			mask: citem.mask,
			usable: citem.usable || false
		}
		let width = citem.width;
		let height = citem.height;
		if (tempSettings.flipped == true) {
			citem.width = height;
			citem.height = width;
		}
		TempStorage["inventory"].push({
			id: gData.id,
			name: gData.name,
			image: gData.image,
			scale: gData.scale,
			amount: gData.amount,
			max_stack: gData.max_stack,
			width: width,
			height: height,
			cell: tempSettings.cell || 0,
			row: tempSettings.row || 0
		})
		CEFStorage.call("addItem", "inventory", tempSettings.cell || 0, tempSettings.row || 0, citem.width, citem.height, JSON.stringify(gData), tempSettings.flipped || false)
	})
});
mp.events.add("Inventory:EditItem", (citem) => {
	console.log("Inventory:EditItem item", citem);
});
mp.events.add("Inventory:RemoveItem", (id) => {
	if (TempStorage["inventory"]) {
		let index = TempStorage["inventory"].findIndex((e) => {
			return e.id == id;
		})
		console.log("index in temp inv",index);
		if (index > -1) {
			//CEFStorage.call("removeItemByID", "inventory", id);
			mp.rpc.callBrowser(CEFStorage.browser, 'removeItemByID', {
				selector: "inventory",
				id: id
			}).then(value => {
				console.log("removeItemByID", value);
			}).catch(err => {
				console.log("error", err);
			});
			TempStorage["inventory"][index] = null;
			delete TempStorage["inventory"][index];
            TempStorage["inventory"].splice(index,1)
		}
	}
});
mp.events.add("Inventory:AddItem", (citem) => {
	if (!TempStorage["inventory"]) {
		TempStorage["inventory"] = [];
	}
	let tempSettings = StorageSystem.getTempSettings(citem.id, "inventory");
	let gData = {
		id: citem.id,
		name: citem.name,
		image: citem.image,
		scale: tempSettings.scale || {},
		amount: citem.amount,
		max_stack: citem.max_stack,
		mask: citem.mask,
		usable: citem.usable || false
	}
	let width = citem.width;
	let height = citem.height;
	if (tempSettings.flipped == true) {
		citem.width = height;
		citem.height = width;
	}
	TempStorage["inventory"].push({
		id: gData.id,
		name: gData.name,
		image: gData.image,
		scale: gData.scale,
		amount: gData.amount,
		max_stack: gData.max_stack,
		width: width,
		height: height,
		cell: tempSettings.cell || 0,
		row: tempSettings.row || 0,
		mask: citem.mask
	})
	CEFStorage.call("addItem", "inventory", tempSettings.cell || 0, tempSettings.row || 0, citem.width, citem.height, JSON.stringify(gData), tempSettings.flipped || false)
});
mp.events.add("Storage:Interact", (item) => {
	console.log("Item use", item);
	mp.events.callRemote("Storage:Interact", item);
});
mp.events.add("Storage:Drag", (positions) => {
	positions = JSON.parse(positions);
	if (!Inventory_Order.positions[positions.id]) {
		Inventory_Order.positions[positions.id] = {
			top: "40%",
			left: "25%"
		}
	}
	Inventory_Order.positions[positions.id] = {
		top: positions.top + "px",
		left: positions.left + "px"
	};
	mp.storage.data.inventory_order = Inventory_Order;
	mp.storage.flush();
});
mp.events.add("Storage:Close", (id) => {
	mp.events.callRemote("Storage:Close", id.replace("#", ""));
});
mp.events.add("Storage:Transfer", (source, target) => {
	source = JSON.parse(source);
	target = JSON.parse(target);
	Inventory_Order = {
		positions: Inventory_Order.positions,
		items: Inventory_Order.items
	};
	target.items.forEach(function(item) {
		Inventory_Order.items[item.item.id + "_" + target.id] = {
			cell: item.cell,
			row: item.row,
			scale: item.scale,
			flipped: item.flipped
		}
	})
	source.items.forEach(function(item) {
		Inventory_Order.items[item.item.id + "_" + source.id] = {
			cell: item.cell,
			row: item.row,
			scale: item.scale,
			flipped: item.flipped
		}
	})
	mp.storage.data.inventory_order = Inventory_Order;
	mp.storage.flush();
	/*Manage Server Sync*/
	source.items = source.items.map((item) => StorageSystem.minify(item));
	target.items = target.items.map((item) => StorageSystem.minify(item));
	if (StorageSystem.needsUpdate(source, target) == true) {
		TempStorage[source.id] = source.items;
		TempStorage[target.id] = target.items;
		mp.events.callRemote("Storage:Transfer", JSON.stringify(source), JSON.stringify(target));
	}
});
mp.events.add("Storage:TransferSlots", (storage, slots) => {
	storage = JSON.parse(storage);
	slots = JSON.parse(slots);
	Inventory_Order = {
		positions: Inventory_Order.positions,
		items: Inventory_Order.items
	};
	storage.items.forEach(function(item) {
		Inventory_Order.items[item.item.id + "_" + storage.id] = {
			cell: item.cell,
			row: item.row,
			scale: item.scale,
			flipped: item.flipped
		}
	})
	mp.storage.data.inventory_order = Inventory_Order;
	mp.storage.flush();
	/*Manage Server Sync*/
	storage.items = storage.items.map((item) => StorageSystem.minify(item));
	slots.items = slots.items.map((item) => Object.assign(StorageSystem.minify(item.item), {
		slot_id: item.id
	}));
	mp.events.callRemote("Storage:TransferSlots", JSON.stringify(storage), JSON.stringify(slots));
});
mp.events.add("Storage:UpdateSlots", (target, items) => {
	items.forEach(function(item, index) {
		setTimeout(() => {
			CEFStorage.call("addItemSlot", target, item);
		}, 1 * index)
	})
	//console.log(target, JSON.stringify(items));
});
mp.events.add("Storage:AddContainer", (headline, selector, cells, rows, items) => {
	console.log("add container");
	items = JSON.parse(items);
	if (!TempStorage[selector]) {
		TempStorage[selector] = [];
	}
	let gItems = items.map(function(citem) {
		let tempSettings = StorageSystem.getTempSettings(citem.id, selector);
		let width = citem.width;
		let height = citem.height;
		if (tempSettings.flipped == true) {
			citem.width = height;
			citem.height = width;
		}
		let gData = {
			id: citem.id,
			name: citem.name,
			image: citem.image,
			scale: tempSettings.scale || {},
			amount: citem.amount,
			max_stack: citem.max_stack,
			mask: citem.mask,
			usable: citem.usable || false
		}
		let gItem = {
			width: citem.width,
			height: citem.height,
			cell: tempSettings.cell || 0,
			row: tempSettings.row || 0,
			item: gData
		}
		return gItem;
	})
	CEFStorage.call("show");
	CEFStorage.call("setPos", "inventory", Inventory_Order.positions["inventory"].top, Inventory_Order.positions["inventory"].left);
	let clientWidth = cell_size * cells + (padding * 2)
	let clientHeight = cell_size * rows + 37 + (padding * 2)
	let config = {
		top: Inventory_Order.positions[selector] ? Inventory_Order.positions[selector].top : `calc(50% - ${clientHeight/2}px)`,
		left: Inventory_Order.positions[selector] ? Inventory_Order.positions[selector].left : `calc(50% - ${clientWidth/2}px)`
	};
	CEFStorage.call("addStorageContainer", headline, selector, config, cells, rows, gItems);
	TempStorage[selector] = gItems.map(e => e.item);
	CEFStorage.call("focus", selector);
	CEFStorage.cursor(true);
	toggleInvState = true;
});
var itemIdentity = require("../../server/world/items.js");
var StorageSystem = new class {
	constructor() {
		this._openContainer = [];
	}
	closeOpenContainer() {}
	minify(item) {
		return {
			id: item.item.id,
			name: item.item.name,
			amount: item.item.amount,
			max_stack: item.item.max_stack,
			data: item.item.data
		}
	}
	needsUpdate(source, target) {
		let sourceTempOld = [];
		let targetTempOld = [];
		if (TempStorage[source.id]) {
			sourceTempOld = TempStorage[source.id]
		}
		sourceTempOld = sourceTempOld.map(function(e) {
			return Object.assign(e, {
				origin: source.id
			});
		})
		if (TempStorage[target.id]) {
			targetTempOld = TempStorage[target.id]
		}
		targetTempOld = targetTempOld.map(function(e) {
			return Object.assign(e, {
				origin: target.id
			});
		})
		source.items = source.items.map(function(e) {
			return Object.assign(e, {
				origin: source.id
			});
		})
		target.items = target.items.map(function(e) {
			return Object.assign(e, {
				origin: target.id
			});
		})
		let all_items_temp = (source.id == target.id) ? sourceTempOld : sourceTempOld.concat(targetTempOld); // merge the two temp arrays;
		let all_items_new = (source.id == target.id) ? source.items : source.items.concat(target.items); // merge the two temp arrays;
		all_items_temp = all_items_temp.map(function(e) {
			return {
				id: e.id,
				name: e.name,
				amount: e.amount,
				origin: e.origin
			}
		})
		all_items_new = all_items_new.map(function(e) {
			return {
				id: e.id,
				name: e.name,
				amount: e.amount,
				origin: e.origin
			}
		})
		var toUpdate = false;
		let temp_Amount = all_items_temp.reduce(function(total, current) {
			return total + parseInt(current.amount);
		}, 0);
		let new_Amount = all_items_new.reduce(function(total, current) {
			return total + parseInt(current.amount);
		}, 0);
		let toCreate = all_items_new.filter(e => {
			return e.id == "NEW"
		});
		if (toCreate.length > 0) {
			toUpdate = true;
		}
		let moved = all_items_new.filter(e => {
			let fItem = all_items_temp.findIndex(function(cItem) {
				return (cItem.id == e.id) && ((e.origin != cItem.origin) || (e.amount != cItem.amount));
			})
			return (fItem != -1) && (e.id != "NEW");
		})
		let removed = all_items_temp.filter(e => {
			let fItem = all_items_new.findIndex(function(cItem) {
				return (cItem.id == e.id);
			})
			return (fItem == -1) && (e.id != "NEW");
		})
		if (removed.length > 0) {
			toUpdate = true;
		}
		moved.forEach(e => {
			console.log(e.id)
			let sDoesExist = source.items.findIndex(x => {
				return x.id == e.id;
			})
			let tDoesExist = target.items.findIndex(x => {
				return x.id == e.id;
			})
			if (e.origin != source.id) {
				if (sDoesExist == -1) {
					toUpdate = true;
				}
			} else if (e.origin != target.id) {
				if (tDoesExist == -1) {
					toUpdate = true;
				}
			}
		})
		console.log("Items Changed target ?", temp_Amount, new_Amount);
		if (parseInt(temp_Amount) != parseInt(new_Amount)) {
			toUpdate = true;
		}
		console.log("toUpdate", toUpdate);
		/*TODO LOOK OVER needsUpdate*/
		return toUpdate;
	}
	checkFit(where, w, h) {
		return new Promise(function(fulfill, reject) {
			mp.rpc.callBrowser(CEFStorage.browser, 'doesFitInto', {
				what: where,
				w: w,
				h: h
			}).then(value => {
				console.log("checkFit", value);
				return fulfill(value);
			}).catch(err => {
				console.log("error", err);
				return reject(err);
			});
		});
	}
	getTempSettings(id, container) {
		if (Inventory_Order.items != undefined) {
			if (Inventory_Order.items[id + "_" + container] != undefined) {
				/*FIX´ITEM FLIPPING*/
				return {
					cell: Inventory_Order.items[id + "_" + container].cell,
					row: Inventory_Order.items[id + "_" + container].row,
					scale: Inventory_Order.items[id + "_" + container].scale,
					flipped: Inventory_Order.items[id + "_" + container].flipped,
				}
			}
		}
		return false;
	}
}
module.exports = StorageSystem;
},{"../../server/world/items.js":35,"./browser.js":1}],30:[function(require,module,exports){
// https://github.com/glitchdetector/fivem-minimap-anchor
function getMinimapAnchor() {
    let sfX = 1.0 / 20.0;
    let sfY = 1.0 / 20.0;
    let safeZone = mp.game.graphics.getSafeZoneSize();
    let aspectRatio = mp.game.graphics.getScreenAspectRatio(false);
    let resolution = mp.game.graphics.getScreenActiveResolution(0, 0);
    let scaleX = 1.0 / resolution.x;
    let scaleY = 1.0 / resolution.y;
    let minimap = {
        width: scaleX * (resolution.x / (4 * aspectRatio)),
        height: scaleY * (resolution.y / 5.674),
        scaleX: scaleX,
        scaleY: scaleY,
        leftX: scaleX * (resolution.x * (sfX * (Math.abs(safeZone - 1.0) * 10))),
        bottomY: 1.0 - scaleY * (resolution.y * (sfY * (Math.abs(safeZone - 1.0) * 10))),
    };
    minimap.rightX = minimap.leftX + minimap.width;
    minimap.topY = minimap.bottomY - minimap.height;
    return minimap;
}
module.exports = {
    minimap_anchor: getMinimapAnchor
}
},{}],31:[function(require,module,exports){
mp.Vector3.prototype.findRot = function(rz, dist, rot) {
    let nVector = new mp.Vector3(this.x, this.y, this.z);
    var degrees = (rz + rot) * (Math.PI / 180);
    nVector.x = this.x + dist * Math.cos(degrees);
    nVector.y = this.y + dist * Math.sin(degrees);
    return nVector;
}
mp.Vector3.prototype.rotPoint = function(pos) {
    var temp = new mp.Vector3(this.x, this.y, this.z);
    var temp1 = new mp.Vector3(pos.x, pos.y, pos.z);
    var gegenkathete = temp1.z - temp.z
    var a = temp.x - temp1.x;
    var b = temp.y - temp1.y;
    var ankathete = Math.sqrt(a * a + b * b);
    var winkel = Math.atan2(gegenkathete, ankathete) * 180 / Math.PI
    return winkel;
}
mp.Vector3.prototype.toPixels = function() {
    let clientScreen = mp.game.graphics.getScreenActiveResolution(0, 0);
    let toScreen = mp.game.graphics.world3dToScreen2d(new mp.Vector3(pos.x, pos.y, pos.z)) || {
        x: 0,
        y: 0
    };
    return {
        x: Math.floor(clientScreen.x * toScreen.x) + "px",
        y: Math.floor(clientScreen.y * toScreen.y) + "px"
    };
}
/*mp.Vector3.prototype.normalize = function(n) {
    let nVector = new mp.Vector3(this.x, this.y, this.z);
    nVector.x = this.x / n;
    nVector.y = this.y / n;
    nVector.z = this.z / n;
    return this;
}*/
mp.Vector3.prototype.lerp = function(vector2, deltaTime) {
    let nVector = new mp.Vector3(this.x, this.y, this.z);
    nVector.x = this.x + (vector2.x - this.x) * deltaTime
    nVector.y = this.y + (vector2.y - this.y) * deltaTime
    nVector.z = this.z + (vector2.z - this.z) * deltaTime
    return nVector;
}
mp.Vector3.prototype.multiply = function(n) {
    let nVector = new mp.Vector3(this.x, this.y, this.z);
    nVector.x = this.x * n;
    nVector.y = this.y * n;
    nVector.z = this.z * n;
    return nVector;
}
mp.Vector3.prototype.dist = function(to) {
    let a = this.x - to.x;
    let b = this.y - to.y;
    let c = this.z - to.z;
    return Math.sqrt(a * a + b * b + c * c);;
}
mp.Vector3.prototype.dist2d = function(to) {
    let a = this.x - to.x;
    let b = this.y - to.y;
    return Math.sqrt(a * a + b * b);
}
mp.Vector3.prototype.getOffset = function(to) {
    let x = this.x - to.x;
    let y = this.y - to.y;
    let z = this.z - to.z;
    return new mp.Vector3(x, y, z);
}
mp.Vector3.prototype.cross = function(to) {
    let vector = new mp.Vector3(0, 0, 0);
    vector.x = this.y * to.z - this.z * to.y;
    vector.y = this.z * to.x - this.x * to.z;
    vector.z = this.x * to.y - this.y * to.x;
    return vector;
}
mp.Vector3.prototype.normalize = function() {
    let vector = new mp.Vector3(0, 0, 0);
    let mag = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    vector.x = this.x / mag;
    vector.y = this.y / mag;
    vector.z = this.z / mag;
    return vector;
}
mp.Vector3.prototype.dot = function(to) {
    return this.x * to.x + this.y * to.y + this.z * to.z;
}
mp.Vector3.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
}
mp.Vector3.prototype.angle = function(to) {
    return Math.acos(this.normalize().dot(to.normalize()));
}
mp.Vector3.prototype.ground = function() {
    let nVector = new mp.Vector3(this.x, this.y, this.z);
    let z = mp.game.gameplay.getGroundZFor3dCoord(nVector.x, nVector.y, nVector.z, 0, false)
    let z1 = mp.game.gameplay.getGroundZFor3dCoord(nVector.x + 0.01, nVector.y + 0.01, nVector.z, 0, false)
    let z2 = mp.game.gameplay.getGroundZFor3dCoord(nVector.x - 0.01, nVector.y - 0.01, nVector.z, 0, false)
    nVector.z = z;
    if ((z + 0.1 < z1) || (z + 0.1 < z2)) {
        if (z1 < z2) {
            nVector.z = z2;
        } else {
            nVector.z = z1;
        }
    }
    return nVector;
}
mp.Vector3.prototype.ground2 = function(ignore) {
    let nVector = new mp.Vector3(this.x, this.y, this.z);
    let r = mp.raycasting.testPointToPoint(nVector.add(0, 0, 1), nVector.sub(0, 0, 100), ignore.handle, (1 | 16));
    if ((r) && (r.position)) {
        nVector = mp.vector(r.position);
    }
    return nVector;
}
mp.Vector3.prototype.sub = function(x, y, z) {
    return new mp.Vector3(this.x - x, this.y - y, this.z - z);
};
mp.Vector3.prototype.add = function(x, y, z) {
    return new mp.Vector3(this.x + x, this.y + y, this.z + z);
};
mp.vector = function(vec) {
    return new mp.Vector3(vec.x, vec.y, vec.z);
}
mp.Vector3.prototype.insidePolygon = function(polygon) {
    var x = this.x,
        y = this.y;
    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        var xi = polygon[i][0],
            yi = polygon[i][1];
        var xj = polygon[j][0],
            yj = polygon[j][1];
        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};
Array.prototype.shuffle = function() {
    var i = this.length;
    while (i) {
        var j = Math.floor(Math.random() * i);
        var t = this[--i];
        this[i] = this[j];
        this[j] = t;
    }
    return this;
}
},{}],32:[function(require,module,exports){
const toSync = ["health", "running", "engine", "wheel_fl", "wheel_fr", "wheel_rl", "wheel_rr", "fuel", "spark_plugs", "battery"]

function syncVehicle(type, vehicle, value) {
    if (type == "running") {
        //console.log("Set Engine to", value);
        vehicle.setEngineOn(value, true, true);
    }
    if (type == "health") {
        vehicle.setPetrolTankHealth(value);
        vehicle.setBodyHealth(value);
        //vehicle.setEngineHealth(value);
    }
    if (type == "engine") {
        vehicle.setEngineHealth((value == 1 || value == true) ? 1000 : 0);
    }
    let tyres_burst = 0;
    if (type == "wheel_fl") {
        if (value == false) {
            vehicle.setTyreBurst(0, true, 1000);
            tyres_burst += 1;
        } else {
            vehicle.setTyreFixed(0);
        }
    }
    if (type == "wheel_fr") {
        if (value == false) {
            vehicle.setTyreBurst(1, true, 1000);
            tyres_burst += 1;
        } else {
            vehicle.setTyreFixed(1);
        }
    }
    if (type == "wheel_rl") {
        if (value == false) {
            vehicle.setTyreBurst(4, true, 1000);
            tyres_burst += 1;
        } else {
            vehicle.setTyreFixed(4);
        }
    }
    if (type == "wheel_rr") {
        if (value == false) {
            vehicle.setTyreBurst(5, true, 1000);
            tyres_burst += 1;
        } else {
            vehicle.setTyreFixed(5);
        }
    }
    if (tyres_burst >= 3) {
        vehicle.setReduceGrip(true);
    } else {
        vehicle.setReduceGrip(false);
    }
}
toSync.forEach(function(data) {
    mp.events.addDataHandler(data, (entity, value) => {
        if (entity.type === "vehicle") {
            syncVehicle(data, entity, value);
            //console.log(`${data} changed to ${value} on entity ${entity.handle}.`);
        }
    });
})
mp.events.add('entityStreamIn', (entity) => {
    if (entity.type === "vehicle") {
        let components = entity.getVariable("components");
        if (components != undefined) {
            Object.keys(components).forEach(function(key, i) {
                syncVehicle(key, entity, components[key]);
            })
        }
    }
});
var drivenDist = 0;
var drivenOldPos = null;
mp.events.add('playerEnterVehicle', (vehicle, seat) => {
    if (vehicle != null) {
        let running = vehicle.getVariable("running");
        if (running != null) {
            vehicle.freezePosition(false);
            drivenDist = 0;
            if (running == true) {
                vehicle.setEngineOn(true, true, true);
            } else {
                vehicle.setEngineOn(false, true, true);
            }
        }
    }
});
mp.events.add("render", () => {
    let pPos = mp.localPlayer.position;
    /*Draw Vehicle Details*/
    if (mp.localPlayer.vehicle) {
        if (mp.localPlayer.isInAnyVehicle(false)) {
            let veh = mp.localPlayer.vehicle;
            if (veh.getPedInSeat(-1) == mp.localPlayer.handle) {
                if (drivenOldPos != null) {
                    let cPos = mp.localPlayer.vehicle.position;
                    let dist = mp.game.system.vdist(drivenOldPos.x, drivenOldPos.y, drivenOldPos.z, cPos.x, cPos.y, cPos.z);
                    if (dist < 7500 && dist > 0) {
                        drivenDist += dist;
                        if (drivenDist > 100) {
                            mp.events.callRemote("Vehicles:UpdateFuel",drivenDist);
                            drivenDist = 0;
                        }
                    }
                }
                drivenOldPos = mp.localPlayer.vehicle.position;
                if (veh.getVariable("running")) {
                    mp.game.graphics.drawText("Engine:" + (veh.getVariable("running") ? "~g~On" : "~r~Off"), [0.4, 0.8], {
                        font: 4,
                        color: [255, 255, 255, 185],
                        scale: [0.4, 0.4],
                        outline: true,
                        centre: true
                    });
                    let v = Math.ceil(veh.getSpeed() * (veh.getSpeed() / 20) * 2);
                    mp.game.graphics.drawText(v + " KM/H", [0.6, 0.8], {
                        font: 4,
                        color: [255, 255, 255, 185],
                        scale: [0.4, 0.4],
                        outline: true,
                        centre: true
                    });
                    if (veh.getVariable("components").fuel) {
                        mp.game.graphics.drawText("Fuel:" + (veh.getVariable("components").fuel > 0 ? (veh.getVariable("components").fuel.toFixed(2)) : "0") + "L", [0.5, 0.8], {
                            font: 4,
                            color: [255, 255, 255, 185],
                            scale: [0.4, 0.4],
                            outline: true,
                            centre: true
                        });
                    }
                }
            }
        }
    }
    if (mp.players.local.isInAnyVehicle(false)) {
        if (mp.players.local.vehicle != null) {
            if (mp.players.local.vehicle.getVariable("running") != true) {
                mp.game.controls.disableControlAction(0, 278, true);
                mp.game.controls.disableControlAction(0, 279, true);
                mp.game.controls.disableControlAction(0, 280, true);
                mp.game.controls.disableControlAction(0, 281, true);
                mp.game.controls.disableControlAction(2, 278, true);
                mp.game.controls.disableControlAction(2, 279, true);
                mp.game.controls.disableControlAction(2, 280, true);
                mp.game.controls.disableControlAction(2, 281, true);
                mp.players.local.vehicle.setEngineOn(false, true, true);
            }
        }
    }
});
mp.keys.bind(0x58, true, function() {
    mp.events.callRemote("Vehicles:ToggleEngine");
    mp.events.callRemote("Vehicles:RequestInventory");
});
var seats = {
    0: "seat_pside_f", // passanger side front
    1: "seat_dside_r", // driver side rear
    2: "seat_pside_r", // passanger side rear
    3: "seat_dside_r1", // driver side rear1
    4: "seat_pside_r1", // passanger side rear1
    5: "seat_dside_r2", // driver side rear2
    6: "seat_pside_r2", // passanger side rear2
    7: "seat_dside_r3", // driver side rear3
    8: "seat_pside_r3", // passanger side rear3
    9: "seat_dside_r4", // driver side rear4
    10: "seat_pside_r4", // passanger side rear4
    11: "seat_dside_r5", // driver side rear5
    12: "seat_pside_r5", // passanger side rear5
    13: "seat_dside_r6", // driver side rear6
    14: "seat_pside_r6", // passanger side rear6
    15: "seat_dside_r7", // driver side rear7
    16: "seat_pside_r7", // passanger side rear7
}
mp.game.controls.useDefaultVehicleEntering = false;
mp.keys.bind(0x47, false, () => {
    console.log("G");
    if (mp.players.local.vehicle === null) {
        if (mp.gui.cursor.visible) return;
        let pos = mp.players.local.position;
        let targetVeh = {
            veh: null,
            dist: 900
        }
        // get closest veh + police cars
        mp.vehicles.forEachInStreamRange((veh) => {
            let vp = veh.position;
            let dist = mp.game.system.vdist2(pos.x, pos.y, pos.z, vp.x, vp.y, vp.z);
            if (dist < targetVeh.dist) {
                targetVeh.dist = dist;
                targetVeh.veh = veh;
            }
        });
        let veh = targetVeh.veh;
        if (veh !== null) {
            if (veh.isAnySeatEmpty()) {
                let toEnter = {
                    seat: 0,
                    dist: 99999,
                    pos: new mp.Vector3(0, 0, 0)
                }
                let insideSeatsFree = false;
                let ground;
                let seats_count = mp.game.vehicle.getVehicleSeats(veh);
                for (var i = 0; i <= seats_count; i++) {
                    if (veh.isSeatFree(i)) {
                        if (i <= 2) {
                            insideSeatsFree = true;
                        }
                        let seat = seats[i];
                        let seat_pos = veh.getWorldPositionOfBone(veh.getBoneIndexByName(seat))
                        let ground_pos = mp.game.gameplay.getGroundZFor3dCoord(seat_pos.x, seat_pos.y, seat_pos.z, 0, false);
                        let seat_dist = mp.game.system.vdist2(pos.x, pos.y, pos.z, seat_pos.x, seat_pos.y, seat_pos.z);
                        if ((i > 2) && (insideSeatsFree == true)) {} else {
                            if (veh.model == 1917016601 && i > 0) {
                                if ((toEnter.dist > 30)) {
                                    toEnter.dist = 30;
                                    toEnter.seat = i;
                                }
                            }
                            if ((seat_dist < toEnter.dist)) {
                                toEnter.dist = seat_dist;
                                toEnter.seat = i;
                            }
                        }
                    }
                }
                if ((veh.model == 1475773103) && (toEnter.seat > 0)) { // if rumpo3
                    mp.players.local.taskEnterVehicle(veh.handle, 5000, toEnter.seat, 2.0, 16, 0);
                } else {
                    mp.players.local.taskEnterVehicle(veh.handle, 5000, toEnter.seat, 2.0, 1, 0);
                }
            }
        }
    }
});
},{}],33:[function(require,module,exports){
require("./vector.js");
mp.game.audio.startAudioScene("FBI_HEIST_H5_MUTE_AMBIENCE_SCENE");
mp.game.audio.startAudioScene("MIC1_RADIO_DISABLE");
var Weather = new class {
    constructor() {
        let self = this;
        self._areas = [];
        self._inside = undefined;
        mp.events.add("Weather:LoadAreas", (weathers) => {
            self.loadWeather(JSON.parse(weathers));
        });
        setInterval(function() {
            self._check();
        }, 1000);
    }
    loadWeather(arr) {
        let self = this;
        self._areas = arr;
        self._areas.forEach(function(area, index) {
            area.polygon.forEach(function(coords, index1) {
                self._areas[index].polygon[index1] = [coords.x, coords.y];
            })
        });
    }
    enter(key) {
        this._inside = key;
        let weather = this._areas[key];
        mp.game.gameplay.setWind(weather.wind.speed);
        mp.game.gameplay.setWindDirection(weather.wind.dir);
        mp.game.gameplay.setWeatherTypeOverTime(weather.name, 1);
        mp.game.gameplay.setRainFxIntensity(weather.rain);
        mp.events.callRemote("Weather:TransitionTo", this._inside);
    }
    exit() {

        this._inside = undefined;
        mp.events.callRemote("Weather:Exit");
        mp.game.gameplay.setWeatherTypeOverTime("CLEAR", 1);
        mp.game.gameplay.setWind(0);
        mp.game.gameplay.setWindDirection(0);
        mp.game.gameplay.setRainFxIntensity(0);
    }
    _check() {
        let self = this;
        if (self._areas.length > 0) {
            let lp = mp.vector(mp.players.local.position);
            let inside = self._areas.findIndex(function(area, key) {
                let inside1 = lp.insidePolygon(area.polygon);
                return (inside1 == true)
            })
            if (self._inside != inside) {
                if (inside > -1) {
                    self.enter(inside);
                } else {
                    self.exit();
                }
            }
        }
    }
}
module.exports = Weather;
},{"./vector.js":31}],34:[function(require,module,exports){
var Zombie = class {
    constructor() {
        this._setup();
    }
    _setup() {
        var self = this;
        self._pos = {
            x: mp.players.local.position.x,
            y: mp.players.local.position.y,
            z: mp.players.local.position.z
        };
        self.movementTimer;
        self.syncTimer;
        self._ped = mp.peds.new(mp.game.joaat("ig_abigail"), new mp.Vector3(self._pos.x, self._pos.y, self._pos.z), Math.random(0, 360), function(ped) {}, 0);
        self.init();
        self.blip = mp.blips.new(9, new mp.Vector3(self._pos.x, self._pos.y, self._pos.z), {
            color: 3,
            scale: 0.2,
            alpha: 100,
            drawDistance: 0
        });
        self._task = {};
        self._target = mp.players.local;
    }
    get ped() {
        return this._ped
    }
    get pos() {
        return this._ped.getCoords(true)
    }
    init() {
        var self = this;
        let style = "move_heist_lester";
        self.loadPedAttributes();
        if (!mp.game.streaming.hasClipSetLoaded(style)) {
            mp.game.streaming.requestClipSet(style);
            while (!mp.game.streaming.hasClipSetLoaded(style)) mp.game.wait(0);
        }
        self._ped.setMovementClipset(style, 0.0);
        self.syncTimer = setInterval(function() {
            self.move()
        }, 5000)
    }
    loadPedAttributes() {
        var self = this;
        self._ped.freezePosition(false);
        self._ped.setCanRagdoll(true);
        self._ped.setRagdollOnCollision(true);
        self._ped.setCanRagdollFromPlayerImpact(true);
        self._ped.setCombatAbility(100);
        self._ped.setCombatMovement(3);
        for (var i = 1; i < 64; i += 2) {
            self._ped.setFleeAttributes(i, false);
        }
        self._ped.setFleeAttributes(0, false);
        self._ped.setCombatAttributes(17, true);
        self._ped.setCombatAttributes(16, true);
        self._ped.setInvincible(false);
        self._ped.setCanBeDamaged(true);
        self._ped.setOnlyDamagedByPlayer(false);
        self._ped.setBlockingOfNonTemporaryEvents(true);
    }
    move() {
        var self = this;
        let tPos = self._target.position;
/*        if (self._syncer != mp.players.local) {
            if (self._task.cPos.x != 0) {
                self._ped.setCoords(self._task.cPos.x, self._task.cPos.y, self._task.cPos.z, true, true, true, false);
            }
        }*/
        self._ped.resetRagdollTimer();
        self.blip.setCoords(self._ped.getCoords(true));
        self._ped.clearTasksImmediately();
        self._ped.taskGoToCoordAnyMeans(tPos.x, tPos.y, tPos.z, 5, 0, false, 786603, 0);
        self._ped.taskPutDirectlyIntoMelee(self._target.handle, 0.0, -1.0, 1.0, false);
    }
}
var Zombies = [];
/*
mp.events.add("render", e => {
    if (mp.game.controls.isControlJustPressed(0, 23)) {
        Zombies.push(new Zombie());
    }
    Zombies.forEach(function(zom) {
        mp.game.graphics.drawText("Zombie", [zom.pos.x,zom.pos.y,zom.pos.z], {
            font: 4,
            color: [255, 255, 255, 200],
            scale: [0.3, 0.3],
            outline: true,
            centre: true
        });
    })
});


*/

/*mp.keys.bind(0x09, false, () => {
    new Zombie();
});
*/
},{}],35:[function(require,module,exports){
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
        mask: "Food",
        usable:true,
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
        mask: "Food",
        model: "prop_cs_beer_bot_03",
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
        mask: "Food",
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
        width: 3,
        height: 3,
        max_stack: 1,
        name: 'Light Armor',
        image: 'https://via.placeholder.com/160x160',
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
        }
    }
};
module.exports = items;
},{}]},{},[9]);
