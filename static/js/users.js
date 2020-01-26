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
                                <input type="text" name="organization" class="form-control" id="exampleFormControlInput5">
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
                                <input type="email" name="email" class="form-control" id="exampleFormControlInput1" placeholder="name@example.com">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">First Name</label>
                            <div class="col-sm-10 pt-sm-1">
                                <input type="text" name="firstName" class="form-control" id="exampleFormControlInput2">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">Last Name</label>
                            <div class="col-sm-10 pt-sm-1">
                                <input type="text" name="lastName" class="form-control" id="exampleFormControlInput3">
                            </div>
                        </div>
                        <div class="form-group row">
                            <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">Password</label>
                            <div class="col-sm-10 pt-sm-1">
                                <input type="password" name="password" autocomplete="new-password" class="form-control" id="exampleFormControlInput4">
                            </div>
                        </div>
                        ${extra}
                        <div class="form-group row">
                            <label for="exampleFormControlSelect1" class="col-sm-2 col-form-label">Type</label>
                            <div class="col-sm-10 pt-sm-1">
                                <select class="form-control" id="exampleFormControlSelect1" name="role">
                                    <option value="ADMIN">Admin</option>
                                    <option value="USER">User</option>
                                </select>
                            </div>
                        </div>
                        <button type="button" onclick="addUser()" class="btn btn-primary float-right col-sm-auto">Add User</button>
                    </form>
                `;
                formHolder.append(form);
                $("#canvas").append(formHolder);
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
                                <input type="text" name="organization" class="form-control" id="organizationField">
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
                        <button type="button" onclick="editUser()" class="btn btn-primary float-right col-sm-auto">Save Changes</button>
                    </form>
                `;
                formHolder.append(form);
                $("#canvas").append(formHolder);
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
            console.log(response);
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
                $("#organizationField").val(response.organization);
                $("#organizationField").prop('readonly', true);
                $("#roleField").val(response.role);
            }
        }
    });
}

function editUser() {
    var data = getFormData($("#editUserForm"));
    var s = JSON.stringify(data);
    console.log(data);

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
            } else {
                getUsers();
            }
        }
    });
}

function addUser() {
    var data = getFormData($("#addUserForm"));
    var s = JSON.stringify(data);
    console.log(data);

    $.ajax({
        url: "rest/addUser",
        type: "POST",
        data: s,
        contentType: "application/json",
        dataType: "json",
        complete: function(data) {
            $("#canvas").empty();
            if(data.status == 403) {
                $("#canvas").append('<h1>403 Forbidden</h1>');
            } else {
                getUsers();
            }
        }
    });
}

function removeUser(email) {
    $.ajax({
        url: "rest/removeUser?email=" + email,
        type: "GET",
        dataType: "json",
        complete: function(data) {
            response = data.responseJSON;
            if(response.success == true) {
                getUsers();
            }
            else
            {
                console.log("greska");
            }
        }
    });
}