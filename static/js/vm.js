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
    var currentUser = window.localStorage.getItem("role");
    if(currentUser == "SUPER_ADMIN")
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
                ${extra}
                <th>Actions</th>
            </tr>
        </thead>
    `);
    var tbody = $("<tbody/>");
    table.append(tbody);
    extra = "";
    for(let vm of vms) {
        if(currentUser == "SUPER_ADMIN")
            extra = "<td>" + vm.organization + "</td>"
        var row =
        `
            <tr>
                <td>${vm.name}</td>
                <td>${vm.cores}</td>
                <td>${vm.ram}</td>
                <td>${vm.gpu}</td>
                ${extra}
                <td><a href="#" onclick="setUpEditForm('${vm.name}')"><i class="fa fa-pencil pr-2"></i></a><a href="#" onclick="removeVm('${vm.name}')"><i class="fa fa-trash-o"></i></a></td>
            </tr>
        `;
        tbody.append(row);
    }

    div.append(table);
    canvas.append(div);

    if(currentUser != "USER") {
        var addVmButton = `<button class="mr-sm-1 float-right btn btn-primary col-sm-auto"
             onclick="addVmClick()">Add Virtual Machine</button>`;
        canvas.append(addVmButton);
    }
}

function addVmClick() {
    $("#canvas").empty();
    var currentUser = window.localStorage.getItem("role");
    var extra = "";
    if(currentUser == "SUPER_ADMIN") {
        extra =
        `
            <div class="form-group row">
                <label for="exampleFormControlSelect1" class="col-sm-2 col-form-label">Organization</label>
                <div class="col-sm-10 pt-sm-1">
                    <select onchange="loadFields()" class="form-control" id="organizationSelect" name="organization">
                    </select>
                </div>
            </div>
        `;
    }

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
                    <select onchange="loadFields()" data-live-search="true" class="form-control" id="categorySelect" name="categoryName">
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
            ${extra}
            <div class="form-group row">
                <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">Attached Discs</label>
                <div class="col-sm-10 pt-sm-1">
                    <select id="attachedDiscs" name="attachedDiscs" data-live-search="true" multiple>
                    </select>
                </div>
            </div>
            <button type="button" onclick="addVM()" class="btn btn-primary float-right col-sm-auto">Add Virtual Machine</button>
        </form>
    `;
    formHolder.append(form);
    $("#canvas").append(formHolder);
    addVmFillCats();
    addVmFillDiscs();
    if(currentUser == "SUPER_ADMIN")
        addVmFillOrgs();

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
                $('#categorySelect').selectpicker();
            }
        }
    });
}

function addVmFillOrgs() {
    $.ajax({
        url: "rest/getOrgs",
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
                for(let org of response) {
                    var row =
                    `
                        <option value="${org.name}">${org.name}</option>
                    `;
                    $("#organizationSelect").append(row);
                }
                $('#organizationSelect').selectpicker();
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
                    if(!disc.virtualMachine == "")
                    {
                        conf1 = "disabled style=\"\"";
                    }
                    var row =
                    `
                        <option ${conf1}>${disc.name}</option>
                    `;
                    $("#attachedDiscs").append(row);
                }
                $('#attachedDiscs').selectpicker();
            }
        }
    });
}

function addVM() {
    var data = getFormData($("#addVmForm"));
    console.log(data);
    if(data.attachedDiscs != null)
    if(!$.isArray(data.attachedDiscs))
    {
        var list = [];
        list.push(data.attachedDiscs);
        data.attachedDiscs = list;
    }
    var s = JSON.stringify(data);
    var input = $("#nameField");
    input.removeClass("border border-danger");
    $("#msg").remove();
    if($.trim(input.val()) == "") {
        input.addClass("border border-danger");
        var logMsg = $("<small id=\"msg\" class=\"form-text text-muted log-msg\"></small>");
        logMsg.text("This field is mandatory");
        input.parent().append(logMsg);
    }
    else {
        $.ajax({
            url: "rest/addVM",
            type: "POST",
            data: s,
            contentType: "application/json",
            dataType: "json",
            complete: function(data) {
                $("#canvas").empty();
                if(data.status == 403) {
                    $("#canvas").append('<h1>403 Forbidden</h1>');
                } else {
                    if(data.responseJSON.added) {
                        getVMs()
                    }
                }
            }
        });
    }
}

function removeVm(name) {
    $.ajax({
        url: "rest/removeVm?name=" + name,
        type: "GET",
        dataType: "json",
        complete: function(data) {
            response = data.responseJSON;
            console.log(response);
        }
    });
}