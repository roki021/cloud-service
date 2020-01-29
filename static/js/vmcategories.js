function getVMCats() {
    $.ajax({
        url: "rest/getVMCats",
        type: "GET",
        dataType: "json",
        complete: function(data) {
            var canvas = $("#canvas");
            canvas.empty();

            if(data.status === 403) {
                response = data.responseJSON;
                statusMessageStyle(403, response.message);
            } else {
                setUpVMCatsView(canvas, data.responseJSON);
            }
        }
    });
}

function setUpVMCatsView(canvas, cats) {

    var div = $(`<div class="mt-sm-3 mr-sm-1 ml-sm-1 row justify-content-center"/>`);

    var extra = "";
    if(getUserRole() == "SUPER_ADMIN")
        extra = "<th>Organization</th>";

    var table = $(`<table class="table table-hover table-dark"/>`);
    table.append(
    `
        <thead>
            <tr>
                <th>Name</th>
                <th>Cores</th>
                <th>RAM</th>
                <th>GPU</th>
                <th>Actions</th>
            </tr>
        </thead>
    `);
    var tbody = $("<tbody/>");
    table.append(tbody);
    for(let cat of cats) {
        var row =
        `
            <tr>
                <td>${cat.name}</td>
                <td>${cat.cores}</td>
                <td>${cat.ram}</td>
                <td>${cat.gpuCores}</td>
                <td><a href="#" onclick="editVmCatClick('${cat.name}')"><i class="fa fa-pencil pr-2"></i></a><a href="#" onclick="removeCategory('${cat.name}')"><i class="fa fa-trash-o"></i></a></td>
            </tr>
        `;
        tbody.append(row);
    }

    div.append(table);
    canvas.append(div);

    var addVmCatButton = `<button id="dugme" class="mr-sm-1 float-right btn btn-primary col-sm-auto"
     onclick="addVmCatClick()">Add VM Category</button>`;
    canvas.append(addVmCatButton);
}

function addVmCatClick() {
    $("#canvas").empty();
    $.ajax({
            url: "rest/getUserRole",
            type: "GET",
            dataType: "json",
            complete: function(data) {
                response = data.responseJSON;
                var extra = "";
                if(response.currentUser == "SUPER_ADMIN") {
                    var formHolder = $(`<div class="mt-3 mr-1 ml-1 row justify-content-center"/>`);
                    var form =
                    `
                        <form id="addVmCatForm" class="col-sm-8">
                            <div class="form-group row">
                                <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">Name</label>
                                <div class="col-sm-10 pt-sm-1">
                                    <input type="text" name="name" class="form-control" id="nameField">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">Cores</label>
                                <div class="col-sm-10 pt-sm-1">
                                    <input type="number" name="cores" class="form-control" id="coresField">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">RAM</label>
                                <div class="col-sm-10 pt-sm-1">
                                    <input type="number" name="ram" class="form-control" id="ramField">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">GPU Cores</label>
                                <div class="col-sm-10 pt-sm-1">
                                    <input type="number" name="gpuCores" class="form-control" id="gpuCoresField">
                                </div>
                            </div>
                            <input type="button" onclick="addCategory()" class="btn btn-primary float-right col-sm-auto" value="Add Category"/>
                        </form>
                    `;
                    formHolder.append(form);
                    $("#canvas").append(formHolder);
                }
                else {
                    $("#canvas").empty();
                    $("#canvas").append('<h1>403 Forbidden</h1>');
                }
            }
    });
}


function checkFields(data) {
    var correct = true;
    if(data.cores <= 0) {
        $("#coresField").addClass("border border-danger");
        var logMsg = $("<small class=\"form-text text-muted log-msg\"></small>");
        logMsg.text("Value must be bigger than 0");
        $("#coresField").parent().append(logMsg);
        correct = false;
    }
    if(data.ram <= 0) {
        $("#ramField").addClass("border border-danger");
        var logMsg = $("<small class=\"form-text text-muted log-msg\"></small>");
        logMsg.text("Value must be bigger than 0");
        $("#ramField").parent().append(logMsg);
        correct = false;
    }
    if(data.gpuCores < 0) {
        $("#gpuCoresField").addClass("border border-danger");
        var logMsg = $("<small class=\"form-text text-muted log-msg\"></small>");
        logMsg.text("Value must be equals or bigger than 0");
        $("#gpuCoresField").parent().append(logMsg);
        correct = false;
    }
    return correct;
}


function addCategory() {
    var data = getFormData($("#addVmCatForm"));
    var s = JSON.stringify(data);

    if(isInputEmptyOrWhitespaces("#addVmCatForm")) {
        if(checkFields(data)) {
            $.ajax({
                url: "rest/addVMCat",
                type: "POST",
                data: s,
                contentType: "application/json",
                dataType: "json",
                complete: function(data) {
                    if(data.status == 403) {
                        $("#canvas").empty();
                        $("#canvas").append('<h1>403 Forbidden</h1>');
                    } else {
                        response = data.responseJSON;
                        if(response.added) {
                            getVMCats();
                        } else {
                            var wrongCred = $("<div class=\"alert alert-danger text-center\" role=\"alert\"></div>");
                            wrongCred.text("There is already VM Category with this name");
                            wrongCred.insertBefore("input[type=button]");
                        }
                    }
                }
            });
        }
    } else {
        checkFields(data);
    }
}

function editVMCat() {
    var data = getFormData($("#editVmCatForm"));
    var s = JSON.stringify(data);

    if(isInputEmptyOrWhitespaces("#editVmCatForm")) {
        if(checkFields(data)) {
            $.ajax({
                url: "rest/editVMCat",
                type: "POST",
                data: s,
                contentType: "application/json",
                dataType: "json",
                complete: function(data) {
                    if(data.status == 403) {
                        $("#canvas").empty();
                        $("#canvas").append('<h1>403 Forbidden</h1>');
                    } else {
                        response = data.responseJSON;
                        if(response.success) {
                            getVMCats();
                        } else {
                            var wrongCred = $("<div class=\"alert alert-danger text-center\" role=\"alert\"></div>");
                            wrongCred.text("There is already VM Category with this name");
                            wrongCred.insertBefore("input[type=button]");
                        }
                    }
                }
            });
        }
    } else {
        checkFields(data);
    }
}

function editVmCatFill(vmCatName) {
    var s = JSON.stringify({name: vmCatName});
    $.ajax({
            url: "rest/getVMCat",
            type: "POST",
            data: s,
            contentType: "application/json",
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
                    $("#nameField").val(response.name);
                    $("#coresField").val(response.cores);
                    $("#ramField").val(response.ram);
                    $("#gpuCoresField").val(response.gpuCores);
                    $("#lastNameField").val(response.lastName);
                }
            }
        });
}

function editVmCatClick(name) {
    $("#canvas").empty();
    var currentUser = window.localStorage.getItem("role");
    if(currentUser == "SUPER_ADMIN") {
        var formHolder = $(`<div class="mt-3 mr-1 ml-1 row justify-content-center"/>`);
        var form =
        `
            <form id="editVmCatForm" class="col-sm-8">
                <div class="form-group row">
                    <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">Name</label>
                    <div class="col-sm-10 pt-sm-1">
                        <input type="text" name="name" class="form-control" id="nameField">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">Cores</label>
                    <div class="col-sm-10 pt-sm-1">
                        <input type="number" name="cores" class="form-control" id="coresField">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">RAM</label>
                    <div class="col-sm-10 pt-sm-1">
                        <input type="number" name="ram" class="form-control" id="ramField">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">GPU Cores</label>
                    <div class="col-sm-10 pt-sm-1">
                        <input type="number" name="gpuCores" class="form-control" id="gpuCoresField">
                    </div>
                </div>
                <input type="button" onclick="editVMCat()" class="btn btn-primary float-right col-sm-auto" value="Save Changes"/>
            </form>
        `;
        formHolder.append(form);
        $("#canvas").append(formHolder);
        editVmCatFill(name);
    }
    else {
        $("#canvas").append('<h1>403 Forbidden</h1>');
    }


}

function removeCategory(vmCatName) {
    var s = JSON.stringify({name: vmCatName});
    $.ajax({
        url: "rest/removeCategory",
        type: "POST",
        data: s,
        contentType: "application/json",
        dataType: "json",
        complete: function(data) {
            response = data.responseJSON;
            $("#poruka").remove();
            if(response.removed == true) {
                getVMCats();
            }
            else
            {
                var wrongCred = $("<div id=\"poruka\" class=\"alert alert-danger text-center w-50\" role=\"alert\"></div>");
                wrongCred.text("VM Category have attached VMs");
                wrongCred.insertAfter("#dugme");
            }
        }
    });
}