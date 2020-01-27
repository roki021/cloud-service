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

function setUpDiscView(canvas, discs) {
    var div = $(`<div class="mt-sm-3 mr-sm-1 ml-sm-1 row justify-content-center"/>`);

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
        tbody.append(createTableRowDisc(disc));
    }

    div.append(table);
    canvas.append(div);

    if(window.localStorage.getItem("role") != "USER") {
        var addOrgButton = `<button class="mr-sm-1 float-right btn btn-primary col-sm-auto"
         onclick="setUpAddFormDisc('Add disc', 'addDisc', 'rest/addDisc')">Add Disc</button>`;
        canvas.append(addOrgButton);
    }
}

function setUpAddFormDisc(buttonText, func, route) {
    if(window.localStorage.getItem("role") != "USER") {
        var canvas = $("#canvas");
        canvas.empty();
        var formHolder = $(`<div class="mt-3 mr-1 ml-1 row justify-content-center"/>`);
        canvas.append(formHolder);
        var form = $(`<form id="discAdd" class="col-sm-8"/>`);
        form.append(createInput("text", "name", "Name", "Name", "form-control"));
        form.append(createSelect("virtualMachine", "Attached to VM", "form-control"));
        form.append(createSelect("discType", "Disc type", "form-control"));
        form.append(createInput("number", "capacity", "Capacity", "", "form-control"));
        form.append(`
            <input type="button" class="btn btn-primary float-right col-sm-auto" onclick="${func}('${route}')" value="${buttonText}"/>
        `);

        fillDropDowns();

        formHolder.append(form);
    }
}

function fillDropDowns() {
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

                vms.append(createOption(""));
                for(let vm of data.responseJSON) {
                    vms.append(createOption(vm.name));
                }

                var typeSelect = $("#discTypeField");
                typeSelect.append(createOption("SSD"));
                typeSelect.append(createOption("HDD"));
            }
        }
    });
}

function createTableRowDisc(disc) {
    var vm = disc.virtualMachine == null ? "-" : disc.virtualMachine;
    var row =
    `
        <tr>
            <td>${disc.name}</td>
            <td>${disc.capacity}</td>
            <td>${vm}</td>
            <td><a class="pr-sm-1" href="#" onclick=""><i class="fa fa-pencil pr-2"></i></a><a href="#" onclick=""><i class="fa fa-trash-o"></i></a></td>
        </tr>
    `;

    return row;
}

function createOption(value) {
    return `<option value="${value}">${value}</option>`;
}