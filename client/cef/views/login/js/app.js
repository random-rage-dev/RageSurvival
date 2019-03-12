$(function() {
    $("body").width($(window).width())
    $("body").height($(window).height())
    $(document).ready(function() {
        $('select').formSelect();
        $('select').on('contentChanged', function() {
            console.log("change")
            $(this).formSelect()
        });
    });
});
var Account = new class {
    constructor() {
        this._setup();
    }
    _setup() {
        this.username = "";
        this.password = "";
        this.salt = "";
    }
    generateSalt() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 15; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
    getFieldValues() {
        return {
            username: $("#join_username").val(),
            password: $("#join_password").val()
        }
    }
    login() {
        console.log("login");
        let vals = this.getFieldValues();
        this.username = vals.username;
        this.password = vals.password;
        if (this.password.length < 3) {
            if ($("#join_password").hasClass("invalid") == false) {
                $("#join_password").remove("valid");
                $("#join_password").addClass("invalid");
            }
        }
        if ($("#join_password").hasClass("invalid") == false) {
            console.log("username", this.username);
            console.log("password", this.password);
            mp.trigger("Account:Login", this.username, this.password);
        } else {
            this.alert("Please Check your Password again")
        }
    }
    register() {
        this.salt = this.generateSalt();
        let vals = this.getFieldValues();
        this.username = vals.username;
        this.password = md5(vals.password + "|" + this.salt);
        if (vals.password.length < 3) {
            if ($("#join_password").hasClass("invalid") == false) {
                $("#join_password").remove("valid");
                $("#join_password").addClass("invalid");
            }
        }
        if ($("#join_password").hasClass("invalid") == false) {
            console.log("username", this.username);
            console.log("password", this.password);
            mp.trigger("Account:Register", this.username, this.password, this.salt);
        } else {
            this.alert("Please Check your Password again")
        }
    }
    alert(text) {
        $("#alert").show();
        $("#alert_text").addClass("shake");
        $("#alert_text").text(text);
        setTimeout(function() {
            $("#alert_text").removeClass("shake");
        }, 500)
    }
}

var Notifications = new class {
    constructor() {
        this._setup();
    }
    _setup() {
        this._current = [];
    }
    notify(notification) {
        iziToast.show(notification);
    }
}



function notify(n) {
    Notifications.notify(n)
}

function cef_loadlogin(name) {
    $("#join_username").val(name)
    $("#loading").animate({
        opacity: 0
    }, 100, function() {
        $("#login").show();
        $("#login").addClass("show");
    });
}

function cef_hidelogin() {
    $("#login").removeClass("show");
    $("#login").animate({
        opacity: 0,
        height: "0px"
    }, 300, function() {
        $("#login").hide();
    });
}

function alert_login(text) {
    Account.alert(text)
}