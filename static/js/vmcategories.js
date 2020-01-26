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

                console.log(data.responseJSON);
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
        console.log(cat);
        var row =
        `
            <tr>
                <td>${cat.name}</td>
                <td>${cat.cores}</td>
                <td>${cat.ram}</td>
                <td>${cat.gpuCores}</td>
                <td><a href="#" onclick="setUpEditForm('${cat.name}')"><i class="fa fa-pencil pr-2"></i></a><a href="#" onclick="removeCategory(${cat.name})"><i class="fa fa-trash-o"></i></a></td>
            </tr>
        `;
        tbody.append(row);
    }

    div.append(table);
    canvas.append(div);

    var addVmCatButton = `<button class="mr-sm-1 float-right btn btn-primary col-sm-auto"
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
                                    <input type="text" name="name" class="form-control" id="exampleFormControlInput1">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">Cores</label>
                                <div class="col-sm-10 pt-sm-1">
                                    <input type="number" name="cores" class="form-control" id="exampleFormControlInput2">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">RAM</label>
                                <div class="col-sm-10 pt-sm-1">
                                    <input type="number" name="ram" class="form-control" id="exampleFormControlInput3">
                                </div>
                            </div>
                            <div class="form-group row">
                                <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">GPU Cores</label>
                                <div class="col-sm-10 pt-sm-1">
                                    <input type="number" name="gpuCores" class="form-control" id="exampleFormControlInput4">
                                </div>
                            </div>
                            <button type="button" onclick="addCategory()" class="btn btn-primary float-right col-sm-auto">Add Category</button>
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

function addCategory() {
    var data = getFormData($("#addVmCatForm"));
    var s = JSON.stringify(data);
    console.log(data);

    $.ajax({
        url: "rest/addVMCat",
        type: "POST",
        data: s,
        contentType: "application/json",
        dataType: "json",
        complete: function(data) {
            $("#canvas").empty();
            if(data.status == 403) {
                $("#canvas").append('<h1>403 Forbidden</h1>');
            } else {
                getVMCats();
            }
        }
    });
}

function removeCategory(name) {
    $.ajax({
        url: "rest/removeCategory?name=" + name,
        type: "GET",
        dataType: "json",
        complete: function(data) {
            response = data.responseJSON;
            console.log(response);
            if(response.removed == true) {
                getVMCats();
            }
            else
            {
                console.log("greska");
            }
        }
    });
}