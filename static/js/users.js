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
                var table = $("<table/>");
                table.append("<thead><tr><th>Email</th><th>First Name</th><th>Last Name</th><th>Organization</th></tr></thead>")
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
                        </tr>
                    `
                    tbody.append(row);
                }
                $("#canvas").append(table);
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