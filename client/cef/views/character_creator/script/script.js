var CharacterCreator = new class {
    constructor() {
        this.parents = {
            father:0,
            mother:21,
            resemalance:0
        }
    }
}
$("#father_slider").slider({
    max: 44,
    min: 0,
    value: 12,
    animate: 400
}).slider("pips", {
    first: "pip",
    last: "pip"
});
$("#mother_slider").slider({
    max: 44,
    min: 0,
    value: 12,
    animate: 400
}).slider("pips", {
    first: "pip",
    last: "pip"
});

function change_resemblance() {
    CharacterCreator.parents.resamblance = $("#resemblence_slider").val();
}
$("#resemblence_slider").on('input', function (e) {
    console.log(e);
});
$("#resemblence_slider").on("change",function(e) {
    console.log(e);
});






/*SLIDER END*/
$(".group").on("click", function() {
    let f = $(this).attr("for");
    console.log(f);
    console.log($("#" + f));
    $("#" + f).show();
    console.log($("#" + f).children().length * 70)
    if ($("#" + f).height() != 0) {
        //$("#" + f).hide();
        $("#" + f).animate({
            height: 0
        }, {
            duration: 100,
            specialEasing: {
                width: "linear",
                height: "linear"
            }
        })
    } else {
        console.log($("#" + f).children().length * 70)
        $("#" + f).animate({
            height: $("#" + f).children().length * 70
        }, {
            duration: 100,
            specialEasing: {
                width: "linear",
                height: "linear"
            }
        })
    }
})