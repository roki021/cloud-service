function getOrganizations() {
    $.ajax({
        url: "rest/getOrgs",
        type: "GET",
        dataType: "json",
        complete: function(data) {
            var canvas = $("#canvas");
            canvas.empty();

            if(data.status == 403 || data.status == 400) {
                response = data.responseJSON;
                statusMessageStyle(data.status, response.message);
            } else {
                $("#user-name").text(window.localStorage.getItem("username"));
                setUpOrgView(canvas, data.responseJSON);
            }
        }
    });
}

function addOrganization(route) {
    var formData = getFormData($("#orgAdd"));

    $("#orgAdd").find("small").remove();
    $("#orgAdd").find(".alert").remove();

    var nameInput = $("#nameField");

    if($.trim(nameInput.val()) == "") {
        nameInput.addClass("border border-danger");
        var logMsg = $("<small class=\"form-text text-muted log-msg\"></small>");
        logMsg.text("This field is mandatory");
        nameInput.parent().append(logMsg);
    } else {
        getImgBytes(function(jsonData) {
            $.ajax({
                url: route,
                type: "POST",
                data: jsonData,
                contentType: "application/json",
                dataType: "json",
                complete: function(data) {
                    if(data.status == 403 || data.status == 400) {
                        response = data.responseJSON;
                        statusMessageStyle(data.status, response.message);
                    } else {
                        response = data.responseJSON;

                        if(!response.added) {
                            var wrongCred = $("<div class=\"alert alert-danger text-center\" role=\"alert\"></div>");
                            wrongCred.text("There is already organization with this name");
                            wrongCred.insertBefore("input[type=button]");
                        } else {
                            getOrganizations();
                            location.reload();
                        }
                    }
                }
            });
        }, formData);
    }
}

function editOwnOrganization(route) {
    var formData = getFormData($("#orgAdd"));
    var jsonData = JSON.stringify(formData);

    $("#orgAdd").find("small").remove();
    $("#orgAdd").find(".alert").remove();

    var nameInput = $("#nameField");

    if($.trim(nameInput.val()) == "") {
        nameInput.addClass("border border-danger");
        var logMsg = $("<small class=\"form-text text-muted log-msg\"></small>");
        logMsg.text("This field is mandatory");
        nameInput.parent().append(logMsg);
    } else {
        getImgBytes(function(jsonData) {
            $.ajax({
                url: route,
                type: "POST",
                data: jsonData,
                contentType: "application/json",
                dataType: "json",
                complete: function(data) {
                    if(data.status == 403 || data.status == 400) {
                        response = data.responseJSON;
                        statusMessageStyle(data.status, response.message);
                    } else {
                        response = data.responseJSON;

                        if(!response.added) {
                            var wrongCred = $("<div class=\"alert alert-danger text-center\" role=\"alert\"></div>");
                            wrongCred.text("Something went wrong with data editing");
                            wrongCred.insertBefore("input[type=button]");
                        } else {
                            var rightCred = $("<div class=\"alert alert-success text-center\" role=\"alert\"></div>");
                            rightCred.text("Successful editing");
                            rightCred.insertBefore("input[type=button]");
                            setTimeout(function() { location.reload();}, 3000);
                        }
                    }
                }
            });
        }, formData);
    }
}

function getUserOrganization() {
    $.ajax({
        url: "rest/getUserOrg",
        type: "GET",
        dataType: "json",
        complete: function(data) {
            if(data.status == 403 || data.status == 400) {
                response = data.responseJSON;
                statusMessageStyle(data.status, response.message);
            } else {
                org = data.responseJSON;
                if(org != null) {
                    setUpAddForm("Save changes", "editOwnOrganization", "rest/editOrg");
                    $("#nameField").val(org.name);
                    $("#descriptionField").val(org.description);
                    $(`<img class="img-fluid img pb-sm-2 rounded" style="width: 200px;" src="${org.logoUrl}">`).insertBefore("input[type=file]");
                }
            }
        }
    });
}

function setUpEditForm(orgName) {
    setUpAddForm("Save changes", "addOrganization", "rest/editOrg");
    var jsonData = JSON.stringify({name: orgName});
    $.ajax({
        url: "rest/getOrg",
        type: "POST",
        contentType: "application/json",
        data: jsonData,
        dataType: "json",
        complete: function(data) {
            if(data.status == 403 || data.status == 400) {
                response = data.responseJSON;
                statusMessageStyle(data.status, response.message);
            } else {
                org = data.responseJSON;
                $("#nameField").val(org.name);
                $("#descriptionField").val(org.description);
                $(`<img class="img-fluid img pb-sm-2 rounded" style="width: 200px;" src="${org.logoUrl}">`).insertBefore("input[type=file]");
            }
        }
    });
}

function setUpAddForm(buttonText, func, route) {
    var canvas = $("#canvas");
    canvas.empty();
    var formHolder = $(`<div class="mt-3 mr-1 ml-1 row justify-content-center"/>`);
    canvas.append(formHolder);
    var form = $(`<form id="orgAdd" class="col-sm-8"/>`);
    form.append(createInput("text", "name", "Name", "Name", "form-control"));
    form.append(createTextArea("text", "description", "Description", "Description", "form-control"));
    form.append(createInput("file", "logoUrl", "Logo", "", "form-control-file"));
    form.append(`
        <input type="button" class="btn btn-primary float-right col-sm-auto" onclick="${func}('${route}')" value="${buttonText}"/>
    `);

    formHolder.append(form);
}

function setUpOrgView(canvas, organizations) {
    var div = $(`<div class="mt-sm-3 mr-sm-1 ml-sm-1 row justify-content-center"/>`);

    var table = $(`<table class="table table-hover table-dark"/>`);
    table.append(
    `
        <thead>
            <tr>
                <th class="action-th">Logo</th>
                <th>Name</th>
                <th>Description</th>
                <th class="action-th">Actions</th>
            </tr>
        </thead>
    `);
    var tbody = $("<tbody/>");
    table.append(tbody);
    for(let org of organizations) {
        tbody.append(createTableRowOrg(org));
    }

    div.append(table);
    canvas.append(div);

    var addOrgButton = `<button class="mr-sm-1 float-right btn btn-primary col-sm-auto"
     onclick="setUpAddForm('Add organization', 'addOrganization', 'rest/addOrg')">Add Organization</button>`;
    canvas.append(addOrgButton);
}

function createTableRowOrg(org) {
    var desc = $.trim(org.description) == "" ? "-" : org.description;
    var row =
    `
        <tr>
            <td>
                <div class="logo-size">
                    <img alt="..." class="img-fluid img-responsive" src="${org.logoUrl}"/>
                </div>
            </td>
            <td>${org.name}</td>
            <td>${desc}</td>
            <td><a class="pr-sm-1" href="#" onclick="setUpEditForm('${org.name}')"><i class="fa fa-pencil pr-2"></i></a></td>
        </tr>
    `;

    return row;
}

function getImgBytes(callback, data) {
    logoImg = $("#logoUrlField")[0];
    if(logoImg.files.length != 0) {
        if(logoImg.files[0].type.includes("image") && (logoImg.files[0].size / 1048576.0) < 1.0) {
            var reader = new FileReader();
            reader.onload = function(evt) {
                data.logoUrl = evt.target.result;
                callback(JSON.stringify(data));
            };

            reader.readAsBinaryString(logoImg.files[0]);
            return;
        } else {
            var wrongCred = $("<div class=\"alert alert-danger text-center\" role=\"alert\"></div>");
            wrongCred.text("Please select image that is lower then 1MB");
            wrongCred.insertBefore("input[type=button]");
            return;
        }
    }

    callback(JSON.stringify(data));
}