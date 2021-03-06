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

function getKey(val) {
    for(let cap in capacityMap) {
        if(capacityMap[cap] == val)
            return cap;
    }
}

function getDiscs() {
   $.ajax({
       url: "rest/getDiscs",
       type: "GET",
       dataType: "json",
       complete: function(data) {
           var canvas = $("#canvas");
           canvas.empty();

           if(data.status == 403 || data.status == 400) {
               response = data.responseJSON;
               statusMessageStyle(data.status, response.message);
           } else {
               $("#user-name").text(window.localStorage.getItem("username"));
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
    if(formData.virtualMachine == undefined)
        formData.virtualMachine = "";
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
                if(data.status == 403 || data.status == 400) {
                    response = data.responseJSON;
                    statusMessageStyle(data.status, response.message);
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
            if(data.status == 403 || data.status == 400) {
                response = data.responseJSON;
                statusMessageStyle(data.status, response.message);
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
    canvas.append(placeSearchArea());
    setUpSearchAreaDisc();
}

function setUpSearchAreaDisc() {
    var args = $("#searchArgs");
    args.prepend(createMinMaxCompare("Capacity (GB)", "capMin", "capMax"));
    args.prepend(createInput("text", "name", "Name", "Name", "form-control"));


    $("#nameField").on("keyup", function() {
        var rows = $(".table").find("> tbody > tr");
        rows.filter(function() {
            var row = $(this).find("td");
            $(this).toggle(checkFieldsFilterDisc(row));
        })
    });

    $("#capMin").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        var rows = $(".table").find("> tbody > tr");
        rows.filter(function() {
            var row = $(this).find("td");
            $(this).toggle(checkFieldsFilterDisc(row));
        })
    });

    $("#capMax").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        var rows = $(".table").find("> tbody > tr");
        rows.filter(function() {
            var row = $(this).find("td");
            $(this).toggle(checkFieldsFilterDisc(row));
        })
    });
}

function checkFieldsFilterDisc(row) {
    var nameField = $("#nameField");
    var capMin = $("#capMin");
    var capMax = $("#capMax");
    var capVal = capacityMap[$(row[1]).text()];
    var capMinVal = parseInt(capMin.val());
    var capMaxVal = parseInt(capMax.val());
    var nameInd = $(row[0]).text().toLowerCase().indexOf(nameField.val()) > -1
    var minInd = capVal >= capMinVal || capMin.val() == "";
    var maxInd = capVal <= capMaxVal || capMax.val() == "";
    return nameInd && minInd && maxInd;
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

    var role = window.localStorage.getItem("role");

    if(role == "USER") {
        $("#discAdd :input").prop("disabled", true);
    } else {
        if(role == "SUPER_ADMIN") {
            var orgName = $(createSelect("organizationName", "Organization", "form-control"));
            orgName.insertBefore($("#virtualMachineField").closest('.row'));
            orgName.change(loadVMs);
        }
        form.append(`
            <input type="button" class="btn btn-primary float-right col-sm-auto" onclick="${func}('${route}')" value="${buttonText}"/>
        `);
    }
}

function loadVMs(event) {
    var select = $(event.target);
    jsonData = JSON.stringify({name: select.val()});
    $.ajax({
        url: "rest/getOrgVMs",
        type: "POST",
        contentType: "application/json",
        data: jsonData,
        dataType: "json",
        complete: function(data) {
            if(data.status == 403 || data.status == 400) {
                response = data.responseJSON;
                statusMessageStyle(data.status, response.message);
            } else {
                var vms = $("#virtualMachineField");
                vms.find('option').remove();
                vms.append(createOption("", ""));
                for(let vm of data.responseJSON) {
                    vms.append(createOption(vm.name, vm.name));
                }

                var defVal = window.sessionStorage.getItem("default");
                if(defVal != null) {
                    $("#virtualMachineField").val(defVal);
                    window.sessionStorage.removeItem("default");
                }
            }
        }
    });
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
                if(data.status == 403 || data.status == 400) {
                    response = data.responseJSON;
                    statusMessageStyle(data.status, response.message);
                } else {
                    var disc = data.responseJSON;
                    $("#nameField").val(disc.name);
                    $("#organizationNameField")
                    .val(disc.organizationName)
                    .trigger("change");
                    window.sessionStorage.setItem("default", disc.virtualMachine);
                    $("#virtualMachineField").val(disc.virtualMachine);
                    $("#discTypeField").val(disc.discType);
                    $("#capacityField").val(disc.capacity);
                }
            }
        });
  })
}

function fillDropDowns(callback=null) {
    var role = window.localStorage.getItem("role");
    if(role == "SUPER_ADMIN") {
        $.ajax({
            url: "rest/getOrgs",
            type: "GET",
            dataType: "json",
            complete: function(data) {
                if(data.status == 403 || data.status == 400) {
                    response = data.responseJSON;
                    statusMessageStyle(data.status, response.message);
                } else {
                    var orgs = $("#organizationNameField");
                    orgs.find('option').remove();
                    orgs.append(createOption("", ""));
                    for(let org of data.responseJSON) {
                        orgs.append(createOption(org.name, org.name));
                    }

                    var typeSelect = $("#discTypeField");
                    typeSelect.find('option').remove();
                    typeSelect.append(createOption("", ""));
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
    } else {
        $.ajax({
            url: "rest/getVMs",
            type: "GET",
            dataType: "json",
            complete: function(data) {
                if(data.status == 403 || data.status == 400) {
                    response = data.responseJSON;
                    statusMessageStyle(data.status, response.message);
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
            <td>${getKey(disc.capacity)}</td>
            <td>${vm}</td>
            ${userRole != "USER" ? actions_admins : actions_user}
        </tr>
    `;

    return row;
}

function createOption(value, text) {
    return `<option value="${value}">${text}</option>`;
}