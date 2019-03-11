var fs = require('fs');
var async = require('async');
var mongoose = require('mongoose');
var schema = require('./schema');
mongoose.Promise = Promise;
class mongodb {
    constructor() {
        this._setup();
    }
    _setup() {
        var self = this;
        self._conncted = false;
        mongoose.connect('mongodb://localhost/ragezombies?authSource=admin', {
            useCreateIndex: true,
            useNewUrlParser: true/*,
            user: 'RootGangwar',
            pass: 'S§F_yJ5nQpaTw#SS'*/
        });
        self._db = mongoose.connection;
        self._db.on('error', console.error.bind(console, 'connection error:'));
        self._dbUserModel = mongoose.model('User', schema.user);

        self._db.once('open', function() {
            self._conncted = true;
            console.log("- MongoDB Instance successfully initialized");
            require("./mongodb_warmup.js")
        });
    }
    getUserModel() {
        return this._dbUserModel;
    }
}
module.exports = new mongodb();
/*
 db.getUser("RootGangwar");
    use gangwar
    db.createUser(
   {
       user: "RootGangwar", 
       pwd: "S§F_yJ5nQpaTw#SS", 
       roles:["root"]
   })

    db.updateUser( "RootGangwar",
               {
                 roles : ["root"]
                }
             );



db.grantRolesToUser(
    "RootGangwar",
    [
      { role: "readWrite", db: "gangwar" }
    ]
)



    db.createUser(
   {
       user: "feris", 
       pwd: "Lappen123!", 
       roles:["root"]
   })
   db.auth("z8pn", "hashtag99%" )*/