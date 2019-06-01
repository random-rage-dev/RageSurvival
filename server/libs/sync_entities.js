var PEDS = [];


/**
 *  Behaviour Group : Animal
 */
class Animal {


}



/**
 *  Controls syncing for NPCs
 */
class SyncedPed {

    model = null; // ped model hash
    tasks = [];
    moodList = [];
    dimension = 0;
    _active = true;
    group = undefined;
    streamedIn = [];

    constructor(model, pos, group) {
        this.id = PEDS.length;
        this.model = mp.joaat(model);
        this.position = pos;
        this.addTaskTimer();
        this.group = new group();
        mp.players.call('Ped:Create', [this.id,this.model, this.position]);
    }
    /**
     *
     * @returns boolean : are we active? if false, stop doing things to clear processing power, i.e. if no one is streamed in to this ped
     */
    get active() {
        return this._active;
    }
    /*
    * Player streamed in to NPC
    */
    streamIn(player) {
        if (this.streamedIn.indexOf(player.id) == -1) {
            this.streamedIn.push(player.id);
        }
    }

    set active(state) {
        if(typeof state === 'boolean') {
            this._active = state;
            if(this._active) {
                this._continueTasks();
            } else {
                this._pauseTasks();
            }
        }
        return false;
    }

    get mood() {
        return this._mood;
    }

    set mood(mood) {
        if(typeof mood !== 'object') return false;
        if(typeof mood.onCheck !== 'function') return false;
        this._mood = mood;
    }

    addMood(mood) {
        if(typeof mood !== 'object') return false;
        if(typeof mood.onCheck !== 'function') return false;
        this.moodList.push(mood);
    }

    /**
     * Adds a task to the list
     * type: taskType
     * onComplete: function, on completed task
     * onFailed: function, on failed task
     * @private
     */
    _addTask(type, onComplete, onFailed) {
        let task = {
            type: type,
            onComplete: onComplete,
            onFailed: onFailed
        };
        this.tasks.push(task);
    }

    /**
     * End next task
     * @private
     */
    _completeTask() {
        if(!this.task) return false;
        this.task.onComplete();
        return true;
    }

    /**
     * Fail next task
     * @private
     */
    _failTask() {
        if(!this.tasks.length) return false;
        let task = this.tasks[0];
        task.onFailed();
        this.tasks.shift();
        return true;
    }

    /**
     * Resumes tasks, i.e. after becoming active again
     * @private
     */
    _continueTasks() {
        if(this.tasks.length) {
            this.task = this.tasks[0];
            this.tasks.shift();
        } else {
            this.findTask();
        }
    }


    /**
     * Pauses tasks, i.e. after becoming inactive
     * @private
     */
    _pauseTasks() {

    }

    /**
     * Starts timer to add tasks randomly if none present
     * Also checks best mood to be in
     */
    addTaskTimer() {
        var that = this;
        this.taskTimer = setInterval(function() {
            if(!that) return clearInterval(this);
            if(this._active) {
                // Still the best mood to be in?
                let bestMood = that.checkMoodHandlers();
                if(bestMood && that.mood !== bestMood) {
                    that.mood = bestMood;
                }

                // Check if we have no current task, and if so, start the next one
                if(!that.task && that.tasks.length) {
                    that.task = that.tasks[0];
                    that.tasks.shift();
                }

                // Check if the tasks bucket is empty
                if(!that.tasks.length && !that.task) {
                    // Tasks bucket is empty, lets add find a new task
                    that.findTask();
                }
            }
        }, 5000);
    }

    /**
     * Are any of our moods able to be triggered?
     */
    checkMoodHandlers() {
        let bestMood_onCheckValue = 0;
        let bestMoodId = false;
        this.moods.forEach((mood, id) => {
            let checkValue = mood.onCheck(0);
            if(checkValue > bestMood_onCheckValue) {
                bestMood_onCheckValue = checkValue;
                bestMoodId = id;
            }
        });
        return bestMoodId;
    }

    findTask() {

    }
}
new SyncedPed("a_c_deer", new mp.Vector3(0,0,0), Animal)
mp.events.addCommand("addped", (player, args, model = "a_c_deer") => {
    let ped = new SyncedPed(model, player.position);
    player.outputChatBox("adding ped: " + ped.id);
});

mp.events.addCommand("pedtask", (player, args, id, task) => {
    let ped = Ped.getPed(parseeInt(id));
    if(ped) {

    } else {
        return player.outputChatBox('Ped not found');
    }
});