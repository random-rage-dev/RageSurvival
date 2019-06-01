var Peds = [];
class Ped {
    constructor(id, model, pos) {
        let self = this;
        this._id = id;
        this._ped = mp.peds.new(model, pos, 0, 0);
        this._ped.streamInHandler = function(streamed_ped) {
            console.log("ped streamed in",self._id);
            mp.events.callRemote('Ped:Stream', id);
            self.streamIn(streamed_ped);
        };
    }
    streamIn(ped) {

        ped.freezePosition(false);
        ped.setCanRagdoll(true);
        ped.setRagdollOnCollision(true);
        ped.setCanRagdollFromPlayerImpact(true);
        ped.setCombatAbility(100);
        ped.setCombatMovement(3);
        for (var i = 1; i < 64; i += 2) {
            ped.setFleeAttributes(i, false);
        }
        ped.setFleeAttributes(0, false);
        ped.setCombatAttributes(17, true);
        ped.setCombatAttributes(16, true);
        ped.setInvincible(false);
        ped.setCanBeDamaged(true);
        ped.setOnlyDamagedByPlayer(false);
        ped.setBlockingOfNonTemporaryEvents(true);



        let style = "move_heist_lester";
        if (!mp.game.streaming.hasClipSetLoaded(style)) {
            mp.game.streaming.requestClipSet(style);
            while (!mp.game.streaming.hasClipSetLoaded(style)) mp.game.wait(0);
        }
        ped.setMovementClipset(style, 0.0);
    }
    set pos(pos) {
        this._ped.setPosition(pos);
        this._pos = pos;
    }
    set target(pos) {
        if (typeof this.speed === 'undefined') this.speed = 1.0;
        if (typeof this.walkingStyle === 'undefined') this.walkingStyle = 0;
        this._ped.taskGoToCoordAnyMeans(pos.x, pos.y, pos.z, this.speed, 0, 0, this.walkingStyle, true);
    }
    set setPosition(pos) {
        this._ped.setCoords(pos.x, pos.y, pos.z, true, true, true, false);
    }
    set attack(id) {
        let player = mp.players.at(id);
        if (!player) return;
        //this._ped.taskCombat(player.handle, 0, 16);
        this._ped.taskPutDirectlyIntoMelee(player.handle, 0.0, -1.0, 1.0, false)
    }
    playAnimation(dict, anim) {
        this._ped.taskPlayAnim(dict, anim, 8.0, 1.0, 0, 0, 1.0, false, false, false);
    }
    doTask(task, param) {
        switch (task) {
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
                //this._ped.taskWanderStandard(10.0, 10);
                console.log("do wander only with coords");
                break;
        }
    }
}
mp.events.add("Ped:Create", (id,model, pos) => {
    console.log("Ped:Create",id,model, pos);
    Peds[id] = new Ped(id, model, pos);
});
mp.events.add("Ped:DoTask", (id, task, param = null) => {
    mp.gui.chat.push("Ped:DoTask " + id + " " + task + " " + param);
    if (Peds[id]) {
        Peds[id].doTask(task, param);
    }
});