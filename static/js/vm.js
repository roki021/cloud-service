function getVMs() {
    $.ajax({
        url: "rest/getVMs",
        type: "GET",
        dataType: "json",
        complete: function(data) {
            var canvas = $("#canvas");
            canvas.empty();

            if(data.status === 403) {
                response = data.responseJSON;
                statusMessageStyle(403, response.message);
            } else {
                setUpVMView(canvas, data.responseJSON);
            }
        }
    });
}

function setUpVMView(canvas, vms) {

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
                <th>Organization</th>
                <th>Actions</th>
            </tr>
        </thead>
    `);
    var tbody = $("<tbody/>");
    table.append(tbody);
    for(let vm of vms) {
        var row =
        `
            <tr>
                <td>${vm.name}</td>
                <td>${vm.cores}</td>
                <td>${vm.ram}</td>
                <td>${vm.gpu}</td>
                <td>${vm.organization}</td>
                <td><a href="#" onclick="setUpEditForm('${vm.name}')"><i class="fa fa-pencil pr-2"></i></a><a href="#" onclick=""><i class="fa fa-trash-o"></i></a></td>
            </tr>
        `;
        tbody.append(row);
    }

    div.append(table);
    canvas.append(div);

    var addVmButton = `<button class="mr-sm-1 float-right btn btn-primary col-sm-auto"
         onclick="addVmClick()">Add Virtual Machine</button>`;
    canvas.append(addVmButton);
}

function addVmClick() {
    $("#canvas").empty();
    var currentUser = window.localStorage.getItem("role");
    if(currentUser == "SUPER_ADMIN") {
        var formHolder = $(`<div class="mt-3 mr-1 ml-1 row justify-content-center"/>`);
        var form =
        `
            <form id="addVmForm" class="col-sm-8">
                <div class="form-group row">
                    <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">Name</label>
                    <div class="col-sm-10 pt-sm-1">
                        <input type="text" name="name" class="form-control" id="nameField">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="exampleFormControlSelect1" class="col-sm-2 col-form-label">Category</label>
                    <div class="col-sm-10 pt-sm-1">
                        <select onchange="loadFields()" class="form-control" id="categorySelect" name="category">
                        </select>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">Cores</label>
                    <div class="col-sm-10 pt-sm-1">
                        <input disabled type="text" name="cores" class="form-control" id="coresField">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">RAM</label>
                    <div class="col-sm-10 pt-sm-1">
                        <input disabled type="text" name="ram" class="form-control" id="ramField">
                    </div>
                </div>
                <div class="form-group row">
                    <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">GPU Cores</label>
                    <div class="col-sm-10 pt-sm-1">
                        <input disabled type="text" name="gpuCores" class="form-control" id="gpuCoresField">
                    </div>
                </div>
                <fieldset class="form-group">
                    <div class="row">
                        <legend class="col-form-label col-sm-2 pt-0">Attached Discs</legend>
                        <div class="col-sm-10" id="discsCheckBoxes">

                        </div>
                    </div>
                </fieldset>



                <button type="button" onclick="addVM()" class="btn btn-primary float-right col-sm-auto">Add Virtual Machine</button>
            </form>
        `;
        formHolder.append(form);
        $("#canvas").append(formHolder);
        addVmFillCats();
        addVmFillDiscs();
    }
    else {
        $("#canvas").append('<h1>403 Forbidden</h1>');
    }
}

function loadFields() {
    var name = $("#categorySelect").val();
    $.ajax({
        url: "rest/getVMCat2?name=" + name,
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
                $("#coresField").val(response.cores);
                $("#ramField").val(response.ram);
                $("#gpuCoresField").val(response.gpuCores);
            }
        }
    });

}

function addVmFillCats() {
    $.ajax({
        url: "rest/getVMCats",
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
                for(let cat of response) {
                    var row =
                    `
                        <option value="${cat.name}">${cat.name}</option>
                    `;
                    $("#categorySelect").append(row);
                }
                $("#coresField").val(response[0].cores);
                $("#ramField").val(response[0].ram);
                $("#gpuCoresField").val(response[0].gpuCores);
            }
        }
    });
}

function addVmFillDiscs() {
    $.ajax({
        url: "rest/getDiscs",
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
                for(let disc of response) {
                    var conf1 = "";
                    var conf2 = "";
                    if(!disc.virtualMachine == "")
                    {
                        conf1 = "disabled";
                        conf2 = " (used)";
                    }
                    var row =
                    `
                    <div class="form-check">
                      <input class="form-check-input" name="${disc.name}" type="checkbox" value="true" ${conf1}>
                      <label class="form-check-label" for="inlineCheckbox1">${disc.name}${conf2}</label>
                    </div>
                    `;
                    $("#discsCheckBoxes").append(row);
                }
            }
        }
    });
}

function addVM() {
    var data = getFormData($("#addVmForm"));
    var s = JSON.stringify(data);
    console.log(data);

    /*$.ajax({
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
                getVMs();
            }
        }
    });*/
}