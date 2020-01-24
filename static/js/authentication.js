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

    sidebarItems.append(createSidebarItem("Virtual machines", "vms", function() {}));
    sidebarItems.append(createSidebarItem("Discs", "discs", function() {}))
    switch(user.role) {
        case "SUPER_ADMIN":
            sidebarItems.append(createSidebarItem("Organizations", "orgs", function() {}));
            sidebarItems.append(createSidebarItem("Users", "users", getUsers));
            sidebarItems.append(createSidebarItem("VM categories", "vmcats", function() {}));
        break;
        case "ADMIN":
            sidebarItems.append(createSidebarItem("Organization", "orgs", function() {}));
            sidebarItems.append(createSidebarItem("Users", "users", getUsers));
        break;
    }

    selectedItem = window.sessionStorage.getItem("selectedItem");

    if(selectedItem) {
        $("#" + selectedItem).click();
    }

    window.sessionStorage.setItem("role", user.role);
}

function createSidebarItem(text, id, clickFunc) {
    var listItem = $(`<a href="#" class="list-group-item list-group-item-action bg-light"/>`);
    listItem.click( function() {
        $(".list-group-item").removeClass("bg-dark text-white");
        $(".list-group-item").addClass("bg-light text-dark");
        $(this).removeClass("bg-light text-dark");
        $(this).addClass("bg-dark text-white");
    });
    listItem
        .text(text)
        .attr("id", id)
        .click(clickFunc);

    return listItem;
}