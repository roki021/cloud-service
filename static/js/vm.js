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
        var actions = "";
        if(currentUser == "SUPER_ADMIN")
            extra = "<td>"+vm.organization+"</td>";
        if(currentUser == "SUPER_ADMIN" || currentUser == "ADMIN")
            actions = `<td><a href="#" onclick="editVmClick('${vm.name}')"><i class="fa fa-pencil pr-2"></i></a><a href="#" onclick="removeVm('${vm.name}')"><i class="fa fa-trash-o"></i></a></td>`;
        else
            actions = `<td><a href="#" onclick="editVmClick('${vm.name}')"><i class="fa fa-eye pr-2"></i></a</td>`;
        var row =
        `
            <tr>
                <td>${vm.name}</td>
                <td>${vm.cores}</td>
                <td>${vm.ram}</td>
                <td>${vm.gpu}</td>
                ${extra}
                ${actions}
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
    canvas.append(placeSearchArea());
    setUpSearchAreaVm();
}

function setUpSearchAreaVm() {
    var args = $("#searchArgs");

    args.prepend(createMinMaxCompare("GPU", "gpuCoresMin", "gpuCoresMax"));
    args.prepend(createMinMaxCompare("RAM", "ramMin", "ramMax"));
    args.prepend(createMinMaxCompare("Cores", "coresMin", "coresMax"));
    args.prepend(createInput("text", "name", "Name", "Name", "form-control"));

    $("#nameField").on("keyup", function() {
        var rows = $(".table").find("> tbody > tr");
        rows.filter(function() {
            var row = $(this).find("td");
            $(this).toggle(checkFieldsFilterVm(row));
        })
    });

    $("#coresMin").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        var rows = $(".table").find("> tbody > tr");
        rows.filter(function() {
            var row = $(this).find("td");
            $(this).toggle(checkFieldsFilterVm(row));
        })
    });

    $("#coresMax").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        var rows = $(".table").find("> tbody > tr");
        rows.filter(function() {
            var row = $(this).find("td");
            $(this).toggle(checkFieldsFilterVm(row));
        })
    });

    $("#ramMin").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        var rows = $(".table").find("> tbody > tr");
        rows.filter(function() {
            var row = $(this).find("td");
            $(this).toggle(checkFieldsFilterVm(row));
        })
    });

    $("#ramMax").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        var rows = $(".table").find("> tbody > tr");
        rows.filter(function() {
            var row = $(this).find("td");
            $(this).toggle(checkFieldsFilterVm(row));
        })
    });

    $("#gpuCoresMin").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        var rows = $(".table").find("> tbody > tr");
        rows.filter(function() {
            var row = $(this).find("td");
            $(this).toggle(checkFieldsFilterVm(row));
        })
    });

    $("#gpuCoresMax").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        var rows = $(".table").find("> tbody > tr");
        rows.filter(function() {
            var row = $(this).find("td");
            $(this).toggle(checkFieldsFilterVm(row));
        })
    });
}

function checkFieldsFilterVm(row) {
    var nameField = $("#nameField");
    var coresVal = parseInt($(row[1]).text());
    var coresMinVal = parseInt($("#coresMin").val());
    var coresMaxVal = parseInt($("#coresMax").val());
    var ramVal = parseInt($(row[2]).text().replace(" GB", ""));
    var ramMinVal = parseInt($("#ramMin").val());
    var ramMaxVal = parseInt($("#ramMax").val());
    var gpuCoresVal = parseInt($(row[3]).text());
    var gpuCoresMinVal = parseInt($("#gpuCoresMin").val());
    var gpuCoresMaxVal = parseInt($("#gpuCoresMax").val());


    var nameInd = $(row[0]).text().toLowerCase().indexOf(nameField.val()) > -1
    var minInd = coresVal >= coresMinVal || $("#coresMin").val() == "";
    var maxInd = coresVal <= coresMaxVal || $("#coresMax").val() == "";
    var minInd2 = ramVal >= ramMinVal || $("#ramMin").val() == "";
    var maxInd2 = ramVal <= ramMaxVal || $("#ramMax").val() == "";
    var minInd3 = gpuCoresVal >= gpuCoresMinVal || $("#gpuCoresMin").val() == "";
    var maxInd3 = gpuCoresVal <= gpuCoresMaxVal || $("#gpuCoresMax").val() == "";

    return nameInd && minInd && maxInd && minInd2 && maxInd2 && minInd3 && maxInd3;
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
                    <select onchange="addVmFillDiscs()" class="form-control" id="organizationSelect" name="organizationName">
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
    if(currentUser == "SUPER_ADMIN")
        addVmFillOrgs();
    addVmFillDiscs();
}

function loadFields() {
    var catName = $("#categorySelect").val();
    var s = JSON.stringify({name: catName});
    $.ajax({
        url: "rest/getVMCat2",
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
        async: false,
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
                $('#attachedDiscs').empty();
                for(let disc of response) {
                    var conf1 = "";
                    var role = window.localStorage.getItem("role");
                    if(role != "SUPER_ADMIN" || disc.organizationName == $("#organizationSelect").val()) {
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
                }
                $('#attachedDiscs').selectpicker();
                $('#attachedDiscs').selectpicker('refresh');
            }
        }
    });
}

function addVmFillDiscsSuperAdmin(orgName) {
    var s = JSON.stringify({name: orgName});
    $.ajax({
        url: "rest/getDiscsOrg",
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

function editVmClick(name) {
    $("#canvas").empty();
    var currentUser = window.localStorage.getItem("role");
    var extra = "";
    if(currentUser == "SUPER_ADMIN") {
        extra =
        `
            <div class="form-group row">
                <label for="exampleFormControlSelect1" class="col-sm-2 col-form-label">Organization</label>
                <div class="col-sm-10 pt-sm-1">
                    <select disabled onchange="loadFields()" class="form-control" id="organizationSelect" name="organizationName">
                    </select>
                </div>
            </div>
        `;
    }

    var formHolder = $(`<div class="mt-3 mr-1 ml-1 row justify-content-center"/>`);
    var form =
    `
        <form id="editVmForm" class="col-sm-8">
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
            <div class="form-group row">
                <label for="exampleFormControlInput1" class="col-sm-2 col-form-label">State</label>
                <div class="col-sm-10 pt-sm-1">
                    <input type="checkbox" data-size="sm" id="toggleState" onchange="toggleStateVM();" data-onstyle="success" data-offstyle="danger">
                </div>
            </div>
            <div class="form-group">
                <div class="pt-sm-1 table-wrapper-scroll-y my-custom-scrollbar">
                <table id="activities" class="table table-hover table-dark mb-0">
                <thead>
                    <tr>
                        <th>Started</th>
                        <th>Stopped</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
                </table>
                </div>
            </div>
            <button type="button" onclick="editVM()" class="btn btn-primary float-right col-sm-auto">Save Changes</button>

        </form>
    `;
    formHolder.append(form);
    $("#canvas").append(formHolder);
    $('#toggleState').bootstrapToggle()
    addVmFillCats();
    editVmFillDiscs(name);
    if(currentUser == "SUPER_ADMIN")
        addVmFillOrgs();
    if(currentUser == "USER") {
        //$("#editVmForm :input").prop("disabled", true);
        $("#editVmForm :button").hide();
    }
}

function editVmFillDiscs(vmName) {
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
                    var role = window.localStorage.getItem("role");
                    if(role != "SUPER_ADMIN" || disc.organizationName == $("#organizationSelect").val()) {
                        if(!disc.virtualMachine == "")
                        {
                            conf1 = "disabled";
                        }
                        if(disc.virtualMachine == vmName)
                        {
                            conf1 = "";
                        }
                        var row =
                        `
                            <option value="${disc.name}" ${conf1}>${disc.name}</option>
                        `;
                        $("#attachedDiscs").append(row);
                    }
                }
                setFields(vmName);
            }

        }
    });
}

function setFields(vmName) {
    var s = JSON.stringify({name: vmName});
    $.ajax({
        url: "rest/getVM",
        type: "POST",
        data: s,
        contentType: "application/json",
        dataType: "json",
        complete: function(data) {
            response = data.responseJSON;
            $("#nameField").val(response.name);
            $("#categorySelect").val(response.categoryName);
            $("#organizationSelect").val(response.organizationName);
            $("#categorySelect").selectpicker('refresh')
            $("#organizationSelect").selectpicker('refresh')
            for(let disc of response.attachedDiscs) {
                $("option[value='" + disc + "']").prop("selected", true);
            }
            $('#attachedDiscs').selectpicker();

            if(response.activities.length > 0)
                if(response.activities[response.activities.length-1].stopped == undefined)
                    $("#toggleState").bootstrapToggle('on', true);
            var role = window.localStorage.getItem("role");
            if(role == "USER")
                $("#editVmForm :input").prop("disabled", true);
            else if(role == "SUPER_ADMIN") {
                $("#activities thead tr").append("<th>Actions</th>");
            }
            for(var activity of response.activities) {
                var extra = `<td><a href="#" onclick=""><i class="fa fa-pencil pr-2"></i></a><a href="#" onclick=""><i class="fa fa-trash-o"></i></a></td>`;
                var row =
                `
                    <tr>
                        <td>${activity.started}</td>
                        <td>${activity.stopped == undefined ? "-" : activity.stopped}</td>
                        ${role == "SUPER_ADMIN" ? extra : ""}
                    </tr>
                `;
                $("#activities tbody").append(row);
            }
        }
    });
}

function editVM() {
    var data = getFormData($("#editVmForm"));
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
            url: "rest/editVM",
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

function removeVm(vmName) {
    var s = JSON.stringify({name: vmName});
    $.ajax({
        url: "rest/removeVM",
        type: "POST",
        data: s,
        contentType: "application/json",
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
                if(response.deleted == true) {
                    getVMs();
                }
            }
        }
    });
}

function toggleStateVM() {
    $.ajax({
        url: "rest/toggleState",
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
                editVmClick(response.vm);
            }
        }
    });
}