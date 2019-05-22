var Group = class {
    constructor(name,members) {
        this._setup(name,members);
    }
    _setup(name,members) {
        var self = this;
        self._name = name;
        self._members = members;
    }
}