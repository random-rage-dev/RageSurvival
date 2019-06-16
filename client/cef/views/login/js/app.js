$(function() {
    $("body").width($(window).width())
    $("body").height($(window).height())
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
            if ($("#join_password").hasClass("wrong") == false) {
                $("#join_password").addClass("wrong");
            }
        } else {
            $("#join_password").removeClass("wrong");
        }
        if ($("#join_password").hasClass("wrong") == false) {
            console.log("username", this.username);
            console.log("password", this.password);
            mp.trigger("Account:Login", this.username, this.password);
        } else {
            this.alert({
                title: "Password",
                titleSize: "16px",
                message: "Please check your password (Min. length 4)   ",
                messageColor: 'rgba(0,0,0,.8)',
                position: "bottomCenter",
                close: false
            })
        }
    }
    register() {
        this.salt = this.generateSalt();
        let vals = this.getFieldValues();
        this.username = vals.username;
        this.password = md5(vals.password + "|" + this.salt);
        if (vals.password.length < 3) {
            if ($("#join_password").hasClass("wrong") == false) {
                $("#join_password").addClass("wrong");
            }
        } else {
            $("#join_password").removeClass("wrong");
        }
        if ($("#join_password").hasClass("wrong") == false) {
            console.log("username", this.username);
            console.log("password", this.password);
            mp.trigger("Account:Register", this.username, this.password, this.salt);
        } else {
            this.alert({
                title: "Password",
                titleSize: "16px",
                message: "Please check your password (Min. length 4)   ",
                messageColor: 'rgba(0,0,0,.8)',
                position: "bottomCenter",
                close: false
            })
        }
    }
    alert(text) {
        /* notify({
             title: "Save",
             titleSize: "16px",
             message: "Succesfully saved your Account Data",
             messageColor: 'rgba(0,0,0,.8)',
             position: "bottomRight",
             close: false
         })*/
        iziToast.show(text);
    }
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