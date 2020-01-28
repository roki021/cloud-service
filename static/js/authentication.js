function getFormData($form) {
    var unindexedArray = $form.serializeArray();
    var indexedArray = {};

    $.map(unindexedArray, function(n, i) {
        if(indexedArray[n['name']] == undefined)
            indexedArray[n['name']] = n['value'];
        else {
            var field = [];
            if($.isArray(indexedArray[n['name']])) {
                for(let item of indexedArray[n['name']])
                    field.push(item);
            }
            else {
                field.push(indexedArray[n['name']]);
            }
            field.push(n['value']);
            indexedArray[n['name']] = field;
        }
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

function validPasswordChange() {
    var good = true;

    $("#passChange").find("small").remove();
    $("#passChange").find(".alert").remove();

    $("form#passChange :input").each(function(){
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

function setUpPasswordChange() {
    var canvas = $("#canvas");
    canvas.empty();
    var formHolder = $(`<div class="mt-3 mr-1 ml-1 row justify-content-center"/>`);
    canvas.append(formHolder);
    var form = $(`<form id="passChange" class="col-sm-8"/>`);
    form.append(createInput("password", "oldPassword", "Current", "", "form-control"));
    form.append(createInput("password", "newPassword", "New", "", "form-control"));
    form.append(createInput("password", "repeatPassword", "Repeat new", "", "form-control"));
    form.append(`
        <input type="button" class="btn btn-primary float-right col-sm-auto" onclick="changePassword()" value="Change password"/>
    `);

    formHolder.append(form);
}

function changePassword() {
    var formData = getFormData($("#passChange"));
    var jsonData = JSON.stringify(formData);

    if(validPasswordChange()) {
        $.ajax({
            url: "rest/changePassword",
            type: "POST",
            contentType: "application/json",
            data: jsonData,
            dataType: "json",
            complete: function(data) {
                response = data.responseJSON;
                console.log(response);
                if(response.changed == 1) {
                    var wrongCred = $("<div class=\"alert alert-danger text-center\" role=\"alert\"></div>");
                    wrongCred.text("You entered wrong password");
                    wrongCred.insertBefore("input[type=button]");
                } else if (response.changed == 2) {
                    var wrongCred = $("<div class=\"alert alert-danger text-center\" role=\"alert\"></div>");
                    wrongCred.text("New password does not match the repeated password");
                    wrongCred.insertBefore("input[type=button]");
                } else {
                    var rightCred = $("<div class=\"alert alert-success text-center\" role=\"alert\"></div>");
                    rightCred.text("Successful editing");
                    rightCred.insertBefore("input[type=button]");
                }
            }
        });
    }
}

function placeEditFormValues() {
    setUpProfileEdit();
    $.ajax({
        url: "rest/getProfile",
        type: "GET",
        dataType: "json",
        complete: function(data) {
            if(data.status === 403) {
                response = data.responseJSON;
                statusMessageStyle(403, response.message);
            } else {
                profile = data.responseJSON;

                $("#emailField").val(profile.email);
                $("#firstNameField").val(profile.firstName);
                $("#lastNameField").val(profile.lastName);
            }
        }
    });
}

function setUpProfileEdit() {
    var canvas = $("#canvas");
    canvas.empty();
    var formHolder = $(`<div class="mt-3 mr-1 ml-1 row justify-content-center"/>`);
    canvas.append(formHolder);
    var form = $(`<form id="editProfile" class="col-sm-8"/>`);
    form.append(createInput("email", "email", "Email Address", "Email Address", "form-control"));
    form.append(createInput("text", "firstName", "First Name", "First Name", "form-control"));
    form.append(createInput("text", "lastName", "Last Name", "Last Name", "form-control"));
    form.append(`
        <input type="button" class="btn btn-primary float-right col-sm-auto" onclick="editProfile()" value="Save change"/>
    `);

    formHolder.append(form);
}

function editProfile() {
    var formData = getFormData($("#editProfile"));
    var jsonData = JSON.stringify(formData);

    if(isInputEmptyOrWhitespaces("#editProfile")) {
        $.ajax({
            url: "rest/editProfile",
            type: "POST",
            contentType: "application/json",
            data: jsonData,
            dataType: "json",
            complete: function(data) {
                response = data.responseJSON;

                if(!response.changed) {
                    var wrongCred = $("<div class=\"alert alert-danger text-center\" role=\"alert\"></div>");
                    wrongCred.text("There is user with given email");
                    wrongCred.insertBefore("input[type=button]");
                } else {
                    var rightCred = $("<div class=\"alert alert-success text-center\" role=\"alert\"></div>");
                    rightCred.text("Successful editing");
                    rightCred.insertBefore("input[type=button]");
                }
            }
        });
    }
}

function logIn() {
    window.sessionStorage.clear();
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
                window.sessionStorage.clear();
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

            if(response) {
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

            if(!response) {
                window.location.replace("login.html");
            } else {
                $('body').removeClass("hidden");
                setUpPageByUser(response);
            }
        }
     });
 }

function setUpPageByUser(user) {
    $("#user-name").text(user.firstName);
    var sidebarItems = $("#sidebar-items");

    sidebarItems.append(createSidebarItem("Virtual machines", "vms", getVMs));
    sidebarItems.append(createSidebarItem("Discs", "discs", getDiscs));
    switch(user.role) {
        case "SUPER_ADMIN":
            sidebarItems.append(createSidebarItem("Organizations", "orgs", getOrganizations));
            sidebarItems.append(createSidebarItem("Users", "users", getUsers));
            sidebarItems.append(createSidebarItem("VM categories", "vmcats", getVMCats));
        break;
        case "ADMIN":
            sidebarItems.append(createSidebarItem("Organization", "orgs", getUserOrganization));
            sidebarItems.append(createSidebarItem("Users", "users", getUsers));
        break;
    }

    selectedItem = window.sessionStorage.getItem("selectedItem");

    if(selectedItem) {
        $("#" + selectedItem).click();
    } else {
        $("#vms").click();
    }

    window.localStorage.setItem("role", user.role);
}

function createSidebarItem(text, id, clickFunc) {
    var listItem = $(`<a href="#" class="list-group-item list-group-item-action bg-light"/>`);
    listItem
        .text(text)
        .attr("id", id)
        .click(clickFunc);

    listItem.click( function() {
            $(".list-group-item").removeClass("bg-dark text-white");
            $(".list-group-item").addClass("bg-light text-dark");
            $(this).removeClass("bg-light text-dark");
            $(this).addClass("bg-dark text-white");

            window.sessionStorage.setItem("selectedItem", id);
        });

    return listItem;
}

function statusMessageStyle(statusCode, message) {
    var div = $(`<div class="row justify-content-center"/>`);
    div.append(`<h2>Error ${statusCode}</h3>`);
    div.append(`<h5>${message}</h5>`)

    return div;
}