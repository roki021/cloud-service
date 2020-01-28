function getUsers() {
    $.ajax({
        url: "rest/getUsers",
        type: "GET",
        dataType: "json",
        complete: function(data) {
            $("#canvas").empty();
            if(data.status == 403) {
                $("#canvas").append('<h1>403 Forbidden</h1>');
            } else {
                response = data.responseJSON;
                var div = $(`<div class="mt-sm-3 mr-sm-1 ml-sm-1 row justify-content-center"/>`);
                var table = $("<table/>");
                table.append("<thead><tr><th>Email</th><th>First Name</th><th>Last Name</th><th>Organization</th><th>Actions</th></tr></thead>")
                table.addClass("table table-hover table-dark");
                var tbody = $("<tbody/>");
                table.append(tbody);

                for(let user of response) {
                    if(user.organization == undefined)
                        user.organization = "-";
                    var row =
                    `
                        <tr>
                            <td>${user.email}</td>
                            <td>${user.firstName}</td>
                            <td>${user.lastName}</td>
                            <td>${user.organization}</td>
                            <td><a href="#" onclick="editUserClick('${user.email}')"><i class="fa fa-pencil pr-2"></i></a><a href="#" onclick="removeUser('${user.email}')"><i class="fa fa-trash-o"></i></a></td>
                        </tr>
                    `;
                    tbody.append(row);
                }
                div.append(table);
                $("#canvas").append(div);



                var addUserButton = `<button class="mr-sm-1 float-right btn btn-primary col-sm-auto" onclick="addUserClick()">Add User</button>`;
                $("#canvas").append(addUserButton);
            }
        }
    });
}


function getUserRole() {
    $.ajax({
        url: "rest/getUserRole",
        type: "GET",
        dataType: "json",
        complete: function(data) {
            response = data.responseJSON;
            if(response.currentUser == "SUPER_ADMIN")
                return "SUPER_ADMIN";
            else if(response.currentUser == "ADMIN")
                return "ADMIN";
            else if(response.currentUser == "USER")
                return "USER";
            else
                return "null";
        }
    });
}


function fillOrgList() {
    $.ajax({
            url: "rest/getOrgs",
            type: "GET",
            dataType: "json",
            complete: function(data) {
                response = data.responseJSON;
                for(let org of response) {
                    var row =
                    `
                        <option value="${org.name}">${org.name}</option>
                    `;
                    $("#organizationSelect").append(row);
                }
            }
        });
}


function addUserClick() {
    $("#canvas").empty();
    $.ajax({
            url: "rest/getUserRole",
            type: "GET",
            dataType: "json",
            complete: function(data) {
                response = data.responseJSON;
                var extra = "";
                if(response.currentUser == "SUPER_ADMIN") {

                    var extra =
                    `
                        <div class="form-group row">
                            <label for="exampleFormControlSelect1" class="col-sm-2 col-form-label">Organization</label>
                            <div class="col-sm-10 pt-sm-1">
                                <select class="form-control" id="organizationSelect" name="organization">
                                </select>
                            </div>
                         </div>
                    `;
                }
                var formHolder = $(`<div class="mt-3 mr-1 ml-1 row justify-content-center"/>`);
                var form =
                `
                    <form id="addUserForm" class="col-sm-8">
                        <div class="form-group row">
                            <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">Email address</label>
                            <div class="col-sm-10 pt-sm-1">
                                <input type="email" name="email" class="form-control" id="emailField" placeholder="name@example.com">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">First Name</label>
                            <div class="col-sm-10 pt-sm-1">
                                <input type="text" name="firstName" class="form-control" id="firstNameField">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">Last Name</label>
                            <div class="col-sm-10 pt-sm-1">
                                <input type="text" name="lastName" class="form-control" id="lastNameField">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">Password</label>
                            <div class="col-sm-10 pt-sm-1">
                                <input type="password" name="password" autocomplete="new-password" class="form-control" id="passwordField">
                            </div>
                        </div>
                        ${extra}
                        <div class="form-group row">
                            <label for="exampleFormControlSelect1" class="col-sm-2 col-form-label">Type</label>
                            <div class="col-sm-10 pt-sm-1">
                                <select class="form-control" id="roleField" name="role">
                                    <option value="ADMIN">Admin</option>
                                    <option value="USER">User</option>
                                </select>
                            </div>
                        </div>
                        <input type="button" onclick="addUser()" class="btn btn-primary float-right col-sm-auto" value="Add User"/>
                    </form>
                `;
                formHolder.append(form);
                $("#canvas").append(formHolder);
                if(response.currentUser == "SUPER_ADMIN")
                    fillOrgList();
            }
    });
}

function editUserClick(email) {
    $("#canvas").empty();
    $.ajax({
            url: "rest/getUserRole",
            type: "GET",
            dataType: "json",
            complete: function(data) {
                response = data.responseJSON;
                var extra = "";
                if(response.currentUser == "SUPER_ADMIN") {

                    var extra =
                    `
                        <div class="form-group row">
                            <label for="exampleFormControlSelect1" class="col-sm-2 col-form-label">Organization</label>
                            <div class="col-sm-10 pt-sm-1">
                                <select class="form-control" id="organizationSelect" name="organization">
                                </select>
                            </div>
                         </div>
                    `;
                }
                var formHolder = $(`<div class="mt-3 mr-1 ml-1 row justify-content-center"/>`);
                var form =
                `
                    <form id="editUserForm" class="col-sm-8">
                        <div class="form-group row">
                            <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">Email address</label>
                            <div class="col-sm-10 pt-sm-1">
                                <input type="email" name="email" class="form-control" id="emailField" placeholder="name@example.com">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">First Name</label>
                            <div class="col-sm-10 pt-sm-1">
                                <input type="text" name="firstName" class="form-control" id="firstNameField">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">Last Name</label>
                            <div class="col-sm-10 pt-sm-1">
                                <input type="text" name="lastName" class="form-control" id="lastNameField">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">Password</label>
                            <div class="col-sm-10 pt-sm-1">
                                <input type="password" name="password" autocomplete="new-password" class="form-control" id="passwordField">
                            </div>
                        </div>
                        ${extra}
                        <div class="form-group row">
                            <label for="exampleFormControlSelect1" class="col-sm-2 col-form-label">Type</label>
                            <div class="col-sm-10 pt-sm-1">
                                <select class="form-control" id="roleField" name="role">
                                    <option value="ADMIN">Admin</option>
                                    <option value="USER">User</option>
                                </select>
                            </div>
                        </div>
                        <input type="button" onclick="editUser()" class="btn btn-primary float-right col-sm-auto" value="Save Changes"/>
                    </form>
                `;
                formHolder.append(form);
                $("#canvas").append(formHolder);
                if(response.currentUser == "SUPER_ADMIN")
                    fillOrgList();
                editUserFill(email);
            }
    });
}

function editUserFill(email) {
    $.ajax({
        url: "rest/getUser?email=" + email,
        type: "GET",
        dataType: "json",
        complete: function(data) {
            response = data.responseJSON;
            if(data.status == 403) {
                $("#canvas").empty();
                $("#canvas").append('<h1>403 Forbidden</h1>');
            }
            else if(data.status == 404) {
                $("#canvas").empty();
                $("#canvas").append('<h1>404 Not Found</h1>');
            }
            else {
                $("#emailField").val(response.email);
                $("#emailField").prop('readonly', true);
                $("#passwordField").val(response.password);
                $("#firstNameField").val(response.firstName);
                $("#lastNameField").val(response.lastName);
                if(response.organization == undefined)
                    response.organization = "-";
                var org =
                `
                <input readonly type="text" name="organization" class="form-control" value="${response.organization}" id="orgField">
                `;
                $("#organizationSelect").replaceWith(org);
                $("#roleField").val(response.role);
            }
        }
    });
}

function editUser() {
    var data = getFormData($("#editUserForm"));
    var s = JSON.stringify(data);

    if(isInputEmptyOrWhitespaces("#editUserForm"))
    $.ajax({
     url: "rest/editUser",
     type: "POST",
     data: s,
     contentType: "application/json",
     dataType: "json",
     complete: function(data) {
         $("#canvas").empty();
         if(data.status == 403) {
             $("#canvas").append('<h1>403 Forbidden</h1>');
         } else if(data.status == 400) {
             $("#canvas").append('<h1>400 Bad Request</h1>');
         } else {
             response = data.responseJSON;
             if(response.success)
                 getUsers();
             else {
                 var wrongCred = $("<div class=\"alert alert-danger text-center\" role=\"alert\"></div>");
                 wrongCred.text("There is already User with this email.");
                 wrongCred.insertBefore("input[type=button]");
             }
         }
     }
    });
 }

function addUser() {
    var data = getFormData($("#addUserForm"));
    var s = JSON.stringify(data);

    if(isInputEmptyOrWhitespaces("#addUserForm")) {
        $.ajax({
            url: "rest/addUser",
            type: "POST",
            data: s,
            contentType: "application/json",
            dataType: "json",
            complete: function(data) {
                if(data.status == 403) {
                    $("#canvas").empty();
                    $("#canvas").append('<h1>403 Forbidden</h1>');
                }
                else if (data.status == 400) {
                    $("#canvas").empty();
                    $("#canvas").append('<h1>400 Bad Request</h1>');
                }
                else {
                    response = data.responseJSON;
                    if(response.added)
                        getUsers();
                    else {
                        var wrongCred = $("<div class=\"alert alert-danger text-center\" role=\"alert\"></div>");
                        wrongCred.text("There is already User with this email.");
                        wrongCred.insertBefore("input[type=button]");
                    }
                }
            }
        });
    }
}

function removeUser(email) {
    $.ajax({
        url: "rest/removeUser?email=" + email,
        type: "GET",
        dataType: "json",
        complete: function(data) {
            response = data.responseJSON;
            if(data.status == 403) {
                $("#canvas").empty();
                $("#canvas").append('<h1>403 Forbidden</h1>');
            } else if(data.status == 400) {
                $("#canvas").empty();
                $("#canvas").append('<h1>400 Bad Request</h1>');
            } else {
                if(response.success == true) {
                    getUsers();
                }
            }
        }
    });
}