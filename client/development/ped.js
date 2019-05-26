var Peds = [];
class Ped {

    constructor(id, model, pos) {
        this._ped = mp.peds.new(model, pos, 0, (streamPed) => {
            // Ped Streamed
            mp.events.callRemote('Ped:Stream', id);
        }, 0);
        this._id = id;
    }

    set pos(pos) {
        this._ped.setPosition(pos);
        this._pos = pos;
    }

    set target(pos) {
        if(typeof this.speed === 'undefined') this.speed = 1.0;
        if(typeof this.walkingStyle === 'undefined') this.walkingStyle = 0;
        this._ped.taskGoToCoordAnyMeans(pos.x, pos.y, pos.z, this.speed, 0, 0, this.walkingStyle, true);
    }

    set attack(id) {
        let player = mp.players.at(id);
        if(!player) return;

        this._ped.taskCombat(player.handle, 0, 16);
    }

    playAnimation(dict, anim) {
        this._ped.taskPlayAnim(dict, anim, 8.0, 1.0, 0, 0, 1.0, false, false, false);
    }

    doTask(task, param) {
        switch(task) {
            case 'attack':
                this.attack(param);
                break;
            case 'move':
                this.target(param);
                break;
            case 'animate':
                this.playAnimation(param[0], param[1]);
                break;
            case 'wander':
                this._ped.taskWanderStandard(10.0, 10);
                break;
        }
    }

}

mp.events.add("Ped:Create", (model, pos) => {
    mp.gui.chat.push("Ped:Create");
    let id = Peds.length;
    Peds[id] = new Ped(id, model, pos);
});

mp.events.add("Ped:DoTask", (id, task, param = null) => {
    mp.gui.chat.push("Ped:DoTask " + id + " " + task + " " + param);
    if(Peds[id]) {
        Peds[id].doTask(task, param);
    }
});