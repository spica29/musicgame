jQuery(document).ready(function () {

    var foundUser = false;

    $("#errorMessage").hide();

    var users = JSON.parse(localStorage.getItem("users"));
    console.log(users);
    console.log(JSON.stringify(users));
    console.log(users.data)
    jQuery.each(users.data, function (uid, user) {
        console.log(user.username);
        console.log(user.password);
    });

    $("#btn-login").click(function(event) {
        var username = $("#login-username").val();
        var password = $("#login-password").val();

        event.preventDefault();
        jQuery.each(users.data, function (uid, user) {
            if(username==user.username && password==user.password){
                foundUser=true;
                return;
            }
        });
        if(username=="admin" && password=="admin123"){
            createCookie('session','on',3);
            window.location = "indexGame.html";
        }else if(foundUser){
            createCookie('session','on',3);
            window.location = "indexGame.html";
        }
        else{
            $("#loginform").addClass("has-error");
            $("#errorMessage").show();
        }
    });
});

