function getFormData($form) {
    var unindexedArray = $form.serializeArray();
    var indexedArray = {};

    $.map(unindexedArray, function(n, i) {
        indexedArray[n['name']] = n['value'];
    });

    return indexedArray;
}

function isInputEmptyOrWhitespaces(formId) {
    var good = true;

    $(formId).find("small").remove();
    $(formId).find(".alert").remove();
    if(!$(formId)[0].reportValidity())
        good = false;

    $("form" + formId + " :input").each(function(){
        var input = $(this);
        input.removeClass("border border-danger");
        if($.trim(input.val()) == "") {
            input.addClass("border border-danger");
            var logMsg = $("<small class=\"form-text text-muted log-msg\"></small>");
            logMsg.text("This field is mandatory");
            input.parent().append(logMsg);
            good = false;
        }
    });

    return good;
}

function logIn() {
    var formData = getFormData($("#login"));
    var jsonData = JSON.stringify(formData);

    if(isInputEmptyOrWhitespaces("#login")) {
        $.ajax({
            url: "rest/logIn",
            type: "POST",
            contentType: "application/json",
            data: jsonData,
            dataType: "json",
            complete: function(data) {
                response = data.responseJSON;

                if(response.loggedIn) {
                    window.location.replace("/");
                } else {
                    var wrongCred = $("<div class=\"alert alert-danger text-center\" role=\"alert\"></div>");
                    wrongCred.text("Wrong email address or password!");
                    wrongCred.insertBefore(".btn");
                    $("input[type=\"password\"]").val("");
                }
            }
        });
    }
}

function logOut() {
    $.ajax({
        url: "rest/logOut",
        type: "GET",
        dataType: "json",
        complete: function(data) {
            response = data.responseJSON;

            if(response.loggedOut) {
                window.location.replace("login.html");
            } else {
                alert("Something went wrong with logging out...\nPlease try again.");
            }
        }
    });
}

function loggedIn() {
     $.ajax({
         url: "rest/isLogged",
         type: "GET",
         dataType: "json",
         complete: function(data) {
             response = data.responseJSON;

             if(response.isLogged) {
                 window.location.replace("/");
             } else {
                 $('body').removeClass("hidden");
             }
         }
     });
 }

 function loggedOut() {
     $.ajax({
         url: "rest/isLogged",
         type: "GET",
         dataType: "json",
         complete: function(data) {
             response = data.responseJSON;

             if(!response.isLogged) {
                 window.location.replace("login.html");
             } else {
                 $('body').removeClass("hidden");
             }
         }
     });
 }