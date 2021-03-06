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
                $("#user-name").text(window.localStorage.getItem("username"));
                setUpVMView(canvas, data.responseJSON);
            }
        }
    });
}

function placeBillFilter() {
    var canvas = $("#canvas");
    canvas.empty();

    var formHolder = $(`<div class="mt-3 mr-1 ml-1 row justify-content-center"/>`);
    canvas.append(formHolder);
    var form = $(`<form id="billForm" class="col-sm-8"/>`);
    form.append(createInput("datetime-local", "fromDate", "From", "", "form-control"));
    form.append(createInput("datetime-local", "toDate", "To", "", "form-control"));
    form.append(`
        <input type="button" class="btn btn-primary float-right col-sm-auto" onclick="getBill()" value="Show bill"/>
    `);

    formHolder.append(form);
}

function getBill() {
    var formData = getFormData($("#billForm"));
    var jsonData = JSON.stringify(formData);

    if(isInputEmptyOrWhitespaces("#billForm")) {
        $.ajax({
            url: "rest/getBill",
            type: "POST",
            contentType: "application/json",
            data: jsonData,
            dataType: "json",
            complete: function(data) {
                if(data.status == 400 || data.status == 403) {
                    var response = data.responseJSON;
                    statusMessageStyle(data.status, response.message);
                } else {
                    var canvas = $("#canvas");
                    var billing = data.responseJSON;

                    if(billing[0] != null) {
                        canvas.empty();

                        var div = $(`<div class="mt-sm-3 mr-sm-1 ml-sm-1 row justify-content-center"/>`);
                        var table = $(`<table class="table table-hover table-dark"/>`);
                        table.append(
                        `
                            <thead>
                                <tr>
                                    <th colspan=2 class="text-center">${formatDate(formData.fromDate)} - ${formatDate(formData.toDate)}</th>
                                </tr>
                                <tr>
                                    <th>Resource name</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                        `);
                        var tbody = $("<tbody/>");
                        var totalPrice = 0.0;
                        table.append(tbody);
                        for(let bill of billing) {
                            totalPrice += bill.price;
                            tbody.append(`<tr><td>${bill.resourceName}</td><td>${bill.price.toFixed(2)}€</td></tr>`);
                        }

                        tbody.append(`<tr><td>Total</td><td>${totalPrice.toFixed(2)}€</td></tr>`);
                        div.append(table);
                        canvas.append(div);
                    } else {
                        var wrongCred = $("<div class=\"alert alert-danger text-center\" role=\"alert\"></div>");
                        wrongCred.text("Not valid date interval");
                        wrongCred.insertBefore("input[type=button]");
                    }
                }
            }
        });
    }
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
            <button type="button" id="sender" onclick="addVM()" class="btn btn-primary float-right col-sm-auto">Add Virtual Machine</button>
        </form>
    `;
    formHolder.append(form);
    $("#canvas").append(formHolder);
    addVmFillCats();
    if(currentUser == "SUPER_ADMIN")
        addVmFillOrgs(addVmFillDiscs);
    else
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

function addVmFillOrgs(callback=null) {
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

                if(callback != null)
                    callback();
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
                if(data.status == 400) {
                    $("#canvas").empty();
                    $("#canvas").append('<h1>400 Bad Request</h1>');
                }
                else if(data.status == 403) {
                    $("#canvas").empty();
                    $("#canvas").append('<h1>403 Forbidden</h1>');
                } else {
                    if(data.responseJSON.added) {
                        getVMs()
                    }
                    else {
                        var wrongCred = $("<div class=\"alert alert-danger text-center\" role=\"alert\"></div>");
                        wrongCred.text("There is already disc or VM with this name");
                        wrongCred.insertBefore("#sender");
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
                <div class="table-title">
                    <div class="row col-sm-12">
                        <div class="col-sm-8"><h2>Activities</h2></div>
                        <div class="col-sm-4">
                            <button type="button" id="addNewButton" class="btn btn-info add-new float-right"><i class="fa fa-plus"></i> Add New</button>
                        </div>
                    </div>
                </div>
                <div class="pt-sm-1">
                    <table id="activities" class="table table-hover table-dark mb-0">
                        <thead>
                            <tr>
                                <th data-override="started">Started</th>
                                <th data-override="stopped">Stopped</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
            <button type="button" id="sender" onclick="editVM()" class="btn btn-primary float-right col-sm-auto">Save Changes</button>

        </form>
    `;
    formHolder.append(form);
    $("#canvas").append(formHolder);
    $('#toggleState').bootstrapToggle()
    addVmFillCats();
    if(currentUser == "SUPER_ADMIN")
        addVmFillOrgs(function() {editVmFillDiscs(name);});
    else {
        $("#addNewButton").remove();
        editVmFillDiscs(name);
    }

    if(currentUser == "USER") {
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
                setFields(vmName, response);
            }

        }
    });
}

function setFields(vmName, discList) {
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

            for(let disc of discList) {
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
                var extra = `<td><a href="#" class="add" style="display: none" title="Add" data-toggle="tooltip"><i class="fa fa-plus pr-2"></i></a>
                                 <a href="#" class="edit" title="Edit" data-toggle="tooltip"><i class="fa fa-pencil pr-2"></i></a>
                                 <a href="#" class="delete" title="Delete" data-toggle="tooltip"><i class="fa fa-trash-o"></i></a>
                             </td>`;
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

$(document).ready(function(){
	$('[data-toggle="tooltip"]').tooltip();
	var actions =
	`<a href="#" class="add" style="display: none" title="Add" data-toggle="tooltip"><i class="fa fa-plus pr-2"></i></a>
        <a href="#" class="edit" title="Edit" data-toggle="tooltip"><i class="fa fa-pencil pr-2"></i></a>
        <a href="#" class="delete" title="Delete" data-toggle="tooltip"><i class="fa fa-trash-o"></i></a>
    `;
	// Append table with add row form on add new button click
    $(document).on("click", ".add-new", function(){
		$(this).attr("disabled", "disabled");
		var index = $("table tbody tr:last-child").index();
        var row = '<tr>' +
            '<td><input type="datetime-local" class="form-control" name="started" id="started"></td>' +
            '<td><input type="datetime-local" class="form-control" name="stopped" id="stopped"></td>' +
			'<td>' + actions + '</td>' +
        '</tr>';
    	$("table").append(row);
		$("table tbody tr").eq(index + 1).find(".add, .edit").toggle();
        //$('[data-toggle="tooltip"]').tooltip();
    });
	// Add row on add button click
	$(document).on("click", ".add", function(){
		var empty = false;
		var input = $(this).parents("tr").find('input[type="datetime-local"]');
        input.each(function() {
            if($(this).attr("id") == "started") {
                if(!$(this).val()){
                    $(this).addClass("error");
                    empty = true;
                } else{
                    $(this).removeClass("error");
                }
            }
		});
		$(this).parents("tr").find(".error").first().focus();
		if(!empty){
			input.each(function(){
			    if($(this).attr("id") == "stopped" && !$(this).val()){
                    $(this).parent("td").html("-");
                } else {
				    $(this).parent("td").html($(this).val());
				}
			});
			$(this).parents("tr").find(".add, .edit").toggle();
			$(".add-new").removeAttr("disabled");
		}
    });
	// Edit row on edit button click
	$(document).on("click", ".edit", function(){
        $(this).parents("tr").find("td:not(:last-child)").each(function(){
            var val = $(this).text() == "-" ? "" : $(this).text();
			$(this).html('<input type="datetime-local" class="form-control" value="' + val + '">');
		});
		$($(this).parents("tr").find('input[type="datetime-local"]')[0]).attr("id", "started");
		$($(this).parents("tr").find('input[type="datetime-local"]')[1]).attr("id", "stopped");
		$(this).parents("tr").find(".add, .edit").toggle();
		$(".add-new").attr("disabled", "disabled");
    });
	// Delete row on delete button click
	$(document).on("click", ".delete", function(){
        $(this).parents("tr").remove();
		$(".add-new").removeAttr("disabled");
    });
});

function editVM() {
    var data = getFormData($("#editVmForm"));
    var table = $("#activities").tableToJSON({
            ignoreColumns: [2]
        });
    if(table.length > 0) {
        if(table[table.length - 1].stopped == "-")
            table[table.length - 1].stopped = undefined;
        data.activities = table;
    }
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
    $("#editVmForm").find(".alert").remove();
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
                if(data.status == 403) {
                    $("#canvas").empty();
                    $("#canvas").append('<h1>403 Forbidden</h1>');
                }
                else if(data.status == 400) {
                    $("#canvas").empty();
                    $("#canvas").append('<h1>400 Bad Request</h1>');
                } else {
                    if(data.responseJSON.added == 0) {
                        getVMs()
                    } else if(data.responseJSON.added == 1){
                        var wrongCred = $("<div class=\"alert alert-danger text-center\" role=\"alert\"></div>");
                        wrongCred.text("There is already disc or VM with this name");
                        wrongCred.insertBefore("#sender");
                    } else {
                        var wrongCred = $("<div class=\"alert alert-danger text-center\" role=\"alert\"></div>");
                        wrongCred.text("Activities contains invalid data.");
                        wrongCred.insertBefore("#sender");
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