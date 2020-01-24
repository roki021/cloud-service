function getUsers() {
    window.sessionStorage.setItem("selectedItem", "users");
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
                            <td><a href="#" onclick="editUser('${user.email}')"<i class="fa fa-pencil pr-2"></i></a><a href="#" onclick="removeUser('${user.email}')"><i class="fa fa-trash-o"></i></a></td>
                        </tr>
                    `;
                    tbody.append(row);
                }
                $("#canvas").append(table);



                var addUserButton = `<button class="btn btn-primary" onclick="addUserClick()">Add User</button>`;
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
                        <div class="form-group">
                            <label for="exampleFormControlSelect1">Organization</label>
                            <select class="form-control" id="exampleFormControlSelect2">
                                <option>1</option>
                                <option>2</option>
                            </select>
                         </div>
                    `;
                }

                var form =
                `
                    <form id="addUserForm">
                        <div class="form-group">
                            <label for="exampleFormControlInput1">Email address</label>
                            <input type="email" name="email" class="form-control" id="exampleFormControlInput1" placeholder="name@example.com">
                        </div>
                        <div class="form-group">
                            <label for="exampleFormControlInput1">First Name</label>
                            <input type="text" name="firstName" class="form-control" id="exampleFormControlInput2">
                        </div>
                        <div class="form-group">
                            <label for="exampleFormControlInput1">Last Name</label>
                            <input type="text" name="lastName" class="form-control" id="exampleFormControlInput3">
                        </div>
                        <div class="form-group">
                            <label for="exampleFormControlInput1">Password</label>
                            <input type="password" name="password" autocomplete="new-password" class="form-control" id="exampleFormControlInput4">
                        </div>
                        ${extra}
                        <div class="form-group">
                            <label for="exampleFormControlSelect1">Type</label>
                            <select class="form-control" id="exampleFormControlSelect1">
                                <option>Admin</option>
                                <option>User</option>
                            </select>
                        </div>
                        <button type="button" onclick="AddUser()" class="btn btn-primary">Add User</button>
                    </form>
                `;

                console.log(form);
                $("#canvas").append(form);
            }
    });


}

function addUser() {
    var data = getFormData($("#addUserForm"));
    var s = JSON.stringify(data);

    $.ajax({
        url: "rest/addUser",
        type: "POST",
        data: s,
        contentType: "application/json",
        dataType: "json",
        complete: function(data) {

        }
    })
}

function removeUser(email) {
    $.ajax({
        url: "rest/removeUser?email=" + email,
        type: "GET",
        dataType: "json",
        complete: function(data) {
            response = data.responseJSON;
            if(response.success == true) {
                console.log("obrisano");
            }
            else
            {
                console.log("nije obrisano");
            }
        }
    });
}

function editUser(email) {

}

