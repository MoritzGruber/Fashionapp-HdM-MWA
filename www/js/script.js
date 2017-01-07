$(document).on("scroll", function () {

    if ($(document).scrollTop() > 150) {
        $(".banner").addClass("shrink");
        alert('added');
    } else {
        $(".banner").removeClass("shrink");
        alert('removed');
    }

});