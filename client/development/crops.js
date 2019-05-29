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