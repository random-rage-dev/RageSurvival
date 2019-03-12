var fs = require("fs");
var ncp = require('ncp').ncp;
var watch = require('node-watch');
let source_server = "Q:/RageMP/RageZombies/server"
let dest_server = "A:/RAGEMP/server-files/packages/RageZombies"
ncp(source_server, dest_server, function(err) {
    if (err) {
        return console.error(err);
    }
    console.log('done!');
});
watch('./server', {
    recursive: true,
    persistent: true
}, function(evt, name) {
    console.log('%s changed.', name);
    let file = name.split("server")[1];
    console.log("file", file);
    console.log(source_server + file, dest_server + file);
    ncp(source_server + file, dest_server + file, function(err) {
        if (err) {
            return console.error(err);
        }
        console.log('done!');
    });
});
let source_client = "Q:/RageMP/RageZombies/client"
let dest_client = "A:/RAGEMP/server-files/client_packages/RageZombies"
let exclude = "development"
ncp(source_client, dest_client, function(err) {
    if (err) {
        return console.error(err);
    }
    console.log('done!');
});
watch('./client', {
    recursive: true,
    persistent: true
}, function(evt, name) {
    console.log('%s changed.', name);
    let file = name.split("client")[1];
    if (name.indexOf(exclude) == -1) {
    console.log("file", file);
    console.log(source_client + file, dest_client + file);
        ncp(source_client + file, dest_client + file, function(err) {
            if (err) {
                return console.error(err);
            }
            console.log('done!');
        });
    }
});