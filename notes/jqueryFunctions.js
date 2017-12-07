// jQuery.noConflict();

var usersList = {"data":[
    {"username":"amra@omanovic.com","password":"pass123"}
]};

jQuery(document).ready(function(){

	var sessionCookie = readCookie('session');

    if(localStorage.getItem("users")===null) {
        saveUsersToLocalStorage();
    };

    $("#logutBtn").click(function (event) {
        event.preventDefault();
        eraseCookie('session');
        window.location = "index.html";
    });
});

function createCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        expires = "; expires="+date.toGMTString();
    }
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1,c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length,c.length);
        }
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name,"",-1);
}

function saveUsersToLocalStorage() {
    localStorage.setItem("users",JSON.stringify(usersList));
}

