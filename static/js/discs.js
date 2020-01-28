var capacityMap = {
    "128GB": 128,
    "256GB": 256,
    "512GB": 512,
    "1TB": 1024,
    "2TB": 2048,
    "3TB": 3072,
    "4TB": 4096,
    "5TB": 5120
}

function getDiscs() {
   $.ajax({
       url: "rest/getDiscs",
       type: "GET",
       dataType: "json",
       complete: function(data) {
           var canvas = $("#canvas");
           canvas.empty();

           if(data.status === 403) {
               response = data.responseJSON;
               statusMessageStyle(403, response.message);
           } else {
               setUpDiscView(canvas, data.responseJSON);
           }
       }
   });
}

function validationDiscForm(formId) {
    var good = true;

    $(formId).find("small").remove();
    $(formId).find(".alert").remove();

    $("form" + formId + " :input").each(function(){
        var input = $(this);
        if(input.attr("name") != "virtualMachine") {
            input.removeClass("border border-danger");
            if($.trim(input.val()) == "") {
                input.addClass("border border-danger");
                var logMsg = $("<small class=\"form-text text-muted log-msg\"></small>");
                logMsg.text("This field is mandatory");
                input.parent().append(logMsg);
                good = false;
            }
        }
    });

    return good;
}

function addDisc(route) {
    var formData = getFormData($("#discAdd"));
    var jsonData = JSON.stringify(formData);

    $("#discAdd").find("small").remove();
    $("#discAdd").find(".alert").remove();

    if(validationDiscForm("#discAdd")) {
        $.ajax({
            url: route,
            type: "POST",
            data: jsonData,
            contentType: "application/json",
            dataType: "json",
            complete: function(data) {
                if(data.status === 403) {
                    response = data.responseJSON;
                    statusMessageStyle(403, response.message);
                } else {
                    response = data.responseJSON;

                    if(!response.added) {
                        var wrongCred = $("<div class=\"alert alert-danger text-center\" role=\"alert\"></div>");
                        wrongCred.text("There is already disc or VM with this name");
                        wrongCred.insertBefore("input[type=button]");
                    } else {
                        getDiscs();
                    }
                }
            }
        });
    }
}

function removeDisc(discName) {
    var jsonData = JSON.stringify({name: discName});
    $.ajax({
        url: "rest/removeDisc",
        type: "POST",
        data: jsonData,
        contentType: "application/json",
        dataType: "json",
        complete: function(data) {
            if(data.status === 403) {
                response = data.responseJSON;
                statusMessageStyle(403, response.message);
            } else {
                response = data.responseJSON;

                if(!response.deleted) {
                    var wrongCred = $("<div class=\"alert alert-danger text-center\" role=\"alert\"></div>");
                    wrongCred.text("There is already disc or VM with this name");
                    wrongCred.insertBefore("input[type=button]");
                } else {
                    getDiscs();
                }
            }
        }
    });
}

function setUpDiscView(canvas, discs) {
    var div = $(`<div class="mt-sm-3 mr-sm-1 ml-sm-1 row justify-content-center"/>`);
    var role = window.localStorage.getItem("role");

    var table = $(`<table class="table table-hover table-dark"/>`);
    table.append(
    `
        <thead>
            <tr>
                <th>Name</th>
                <th>Capacity</th>
                <th>Attached to VM</th>
                <th>Actions</th>
            </tr>
        </thead>
    `);
    var tbody = $("<tbody/>");
    table.append(tbody);
    for(let disc of discs) {
        tbody.append(createTableRowDisc(disc, role));
    }

    div.append(table);
    canvas.append(div);

    if(role != "USER") {
        var addDiscButton = `<button class="mr-sm-1 float-right btn btn-primary col-sm-auto"
            onclick="setUpAddFormDisc('Add disc', 'addDisc', 'rest/addDisc')">Add Disc</button>`;
        canvas.append(addDiscButton);
    }
}

function setUpAddFormDisc(buttonText, func, route) {
    var canvas = $("#canvas");
    canvas.empty();
    var formHolder = $(`<div class="mt-3 mr-1 ml-1 row justify-content-center"/>`);
    canvas.append(formHolder);
    var form = $(`<form id="discAdd" class="col-sm-8"/>`);
    form.append(createInput("text", "name", "Name", "Name", "form-control"));
    form.append(createSelect("virtualMachine", "Attached to VM", "form-control"));
    form.append(createSelect("discType", "Disc type", "form-control"));
    form.append(createSelect("capacity", "Capacity", "form-control"));

    fillDropDowns();

    formHolder.append(form);

    if(window.localStorage.getItem("role") == "USER") {
        $("#discAdd :input").prop("disabled", true);
    } else {
        form.append(`
            <input type="button" class="btn btn-primary float-right col-sm-auto" onclick="${func}('${route}')" value="${buttonText}"/>
        `);
    }
}

function setUpEditFormDisc(discName) {
    setUpAddFormDisc("Save changes", "addDisc", "rest/editDisc");
    fillDropDowns(function() {
        var jsonData = JSON.stringify({name: discName});
        $.ajax({
            url: "rest/getDisc",
            type: "POST",
            contentType: "application/json",
            data: jsonData,
            dataType: "json",
            complete: function(data) {
                if(data.status === 403) {
                    response = data.responseJSON;
                    statusMessageStyle(403, response.message);
                } else {
                    var disc = data.responseJSON;
                    $("#nameField").val(disc.name);
                    $("#virtualMachineField").val(disc.virtualMachine);
                    $("#discTypeField").val(disc.discType);
                    $("#capacityField").val(disc.capacity);
                }
            }
        });
  })
}

function fillDropDowns(callback=null) {
    $.ajax({
        url: "rest/getVMs",
        type: "GET",
        dataType: "json",
        complete: function(data) {
            if(data.status === 403) {
                response = data.responseJSON;
                statusMessageStyle(403, response.message);
            } else {
                var vms = $("#virtualMachineField");
                vms.find('option').remove();
                vms.append(createOption("", ""));
                for(let vm of data.responseJSON) {
                    vms.append(createOption(vm.name, vm.name));
                }

                var typeSelect = $("#discTypeField");
                typeSelect.find('option').remove();
                typeSelect.append(createOption("SSD", "SSD"));
                typeSelect.append(createOption("HDD", "HDD"));

                var capacitySelect = $("#capacityField");
                capacitySelect.find('option').remove();
                capacitySelect.append(createOption("", ""));
                for(let key in capacityMap) {
                    capacitySelect.append(createOption(capacityMap[key], key));
                }

                if(callback != null)
                    callback();
            }
        }
    });
}

function createTableRowDisc(disc, userRole) {
    var vm = disc.virtualMachine == null ? "-" : disc.virtualMachine;
    var actions_admins = `
        <td>
            <a class="pr-sm-1" href="#" onclick="setUpEditFormDisc('${disc.name}')"><i class="fa fa-pencil pr-2"></i></a>
            <a href="#" onclick="removeDisc('${disc.name}')"><i class="fa fa-trash-o"></i></a>
        </td>
    `;
    var actions_user = `
        <td>
            <a class="pr-sm-1" href="#" onclick="setUpEditFormDisc('${disc.name}')"><i class="fa fa-eye pr-2"></i></a>
        </td>;
    `;
    var row =
    `
        <tr>
            <td>${disc.name}</td>
            <td>${disc.capacity}</td>
            <td>${vm}</td>
            ${userRole != "USER" ? actions_admins : actions_user}
        </tr>
    `;

    return row;
}

function createOption(value, text) {
    return `<option value="${value}">${text}</option>`;
}