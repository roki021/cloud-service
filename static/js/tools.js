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
                if(data.status == 403 || data.status == 400) {
                    response = data.responseJSON;
                    statusMessageStyle(data.status, response.message);
                } else {
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
            if(data.status == 403 || data.status == 400) {
                response = data.responseJSON;
                statusMessageStyle(data.status, response.message);
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

                if(data.status == 403 || data.status == 400) {
                    response = data.responseJSON;
                    statusMessageStyle(data.status, response.message);
                } else {
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
    window.localStorage.setItem("username", user.firstName);
    var sidebarItems = $("#sidebar-items");

    sidebarItems.append(createSidebarItem("Virtual machines", "vms", getVMs));
    $("#homeBtn").click(function() {
        $("#vms").trigger('click');
    });
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
            sidebarItems.append(createSidebarItem("Monthly bill", "bill", placeBillFilter))
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

function createTextArea(type, name, labelText, placeholder, inputClass) {
    var textArea =
    `
        <div class="form-group row">
            <label for="${name}Field" class="col-sm-2 col-form-label">${labelText}</label>
            <div class="col-sm-10 pt-sm-1">
                <textarea rows="10" class="${inputClass}" id="${name}Field" name="${name}" placeholder="${placeholder}"></textarea>
            </div>
        </div>
    `

    return textArea;
}

function createInput(type, name, labelText, placeholder, inputClass) {
    var input =
    `
        <div class="form-group row">
            <label for="${name}Field" class="col-sm-2 col-form-label">${labelText}</label>
            <div class="col-sm-10 pt-sm-1">
                <input type="${type}" class="${inputClass}" id="${name}Field" name="${name}" placeholder="${placeholder}">
            </div>
        </div>
    `

    return input;
}

function createSelect(name, labelText, inputClass) {
    var select =
    `
        <div class="form-group row">
            <label for="${name}Field" class="col-sm-2 col-form-label">${labelText}</label>
            <div class="col-sm-10 pt-sm-1">
                <select class="${inputClass}" id="${name}Field" name="${name}"></select>
            </div>
        </div>
    `

    return select;
}

function statusMessageStyle(statusCode, message) {
    var canvas = $("#canvas");
    canvas.empty();
    var div = $(`<div class="container-fluid"/>`);
    div.append(`<div><h1>Error ${statusCode}</h1></div>`);
    div.append(`<div><h2>${message}</h2></div>`)
    canvas.append(div);
}

function placeSearchArea() {
    var searchArea  = `
    <div class="ml-sm-1">
        <p>
            <button class="btn btn-primary col-sm-auto" type="button" data-toggle="collapse" data-target="#collapseArea" aria-expanded="false" aria-controls="collapseExample">
                Data filter
            </button>
        </p>
        <div class="collapse" id="collapseArea">
            <div class="card card-body col-sm-6" id="searchArgs">
            <button class="btn btn-secondary" type="button" onclick="resetSearchFields()">Reset</button>
            </div>

        </div>
    </div>`;

    return searchArea;
}

function resetSearchFields() {
    $("#searchArgs").find("input").prop("value", "");
    $(".table").find("> tbody > tr").show();
}

function createMinMaxCompare(label, minName, maxName) {
    return `<div class="form-group row">
                <label class="col-sm-2 col-form-label">${label}</label>
                <div class="col-sm-4 pt-sm-1">
                    <input type="number" class="form-control" id="${minName}">
                </div>
                <label class="col-sm-2 text-center col-form-label">to</label>
                <div class="col-sm-4 pt-sm-1">
                    <input type="number" class="form-control" id="${maxName}">
                </div>
            </div>`;
}

function formatDate(stringDate) {
    var date = new Date(stringDate);
    return date.getFullYear() + "-" +
        placeZero((date.getMonth() + 1)) + "-" +
        placeZero(date.getDate()) + " " +
        placeZero(date.getHours()) + ":" +
        placeZero(date.getMinutes());
}

function placeZero(number) {
    return number < 10 ? "0" + number.toString() : number.toString();
}