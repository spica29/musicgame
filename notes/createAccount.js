jQuery(document).ready(function () {
    $("#successCreateAccountMsg").hide();
    if(!RegExp.escape) {
        RegExp.escape = function(s) {
            return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
        };
    }

    var users = JSON.parse(localStorage.getItem("users"));
    console.log(users);
    $("#btn-create-account").click(function (event) {
        if(!$('#createAccountForm')[0].checkValidity()){
            return;
        }
        event.preventDefault();
        var username = $("#eMail").val();
        var password = $("#inputPassword").val();
        var year = $("#year").val();
        users.data.push({"username":username,"password":password, "year": year});
        console.log(users);
        localStorage.setItem("users",JSON.stringify(users));
        $("#createAccountForm")[0].reset();
        $("#successCreateAccountMsg").show();
        setTimeout(function(){ window.location = "login.html"; }, 1000);
    });

});