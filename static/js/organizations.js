function getOrganizations() {
    $.ajax({
        url: "rest/getOrgs",
        type: "GET",
        dataType: "json",
        complete: function(data) {
            var canvas = $("#canvas");
            canvas.empty();

            if(data.status == 403) {
                response = data.responseJSON;
                statusMessageStyle(403, response.message);
            } else {
                setUpOrgView(canvas, data.responseJSON);
            }
        }
    });
}

function addOrganization() {

}

function setUpAddForm() {
    var canvas = $("#canvas");
    canvas.empty();
    var formHolder = $(`<div class="mt-3 mr-1 ml-1 row justify-content-center"/>`);
    canvas.append(formHolder);
    var form = $(`<form id="org-add" class="col-sm-8"/>`);
    form.append(createInput("text", "name", "Name", "Name", "form-control"));
    form.append(createInput("text", "description", "Description", "Description", "form-control"));
    form.append(createInput("file", "logo", "Logo", "", "form-control-file"));
    form.append(`
        <button class="btn btn-primary float-right col-sm-auto" onclick="addOrganization()">Add organization</button>
    `);

    formHolder.append(form);
}

function setUpOrgView(canvas, organizations) {
    var div = $(`<div class="mt-sm-3 mr-sm-1 ml-sm-1 row justify-content-center"/>`);

    var table = $(`<table class="table table-hover table-dark"/>`);
    table.append(
    `
        <thead>
            <tr>
                <th>Logo</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
            </tr>
        </thead>
    `);
    var tbody = $("<tbody/>");
    table.append(tbody);
    for(let org of organizations) {
        tbody.append(createTableRow(org));
    }

    div.append(table);
    canvas.append(div);

    var addOrgButton = `<button class="mr-sm-1 float-right btn btn-primary col-sm-auto" onclick="setUpAddForm()">Add Organization</button>`;
    canvas.append(addOrgButton);
}

function createTableRow(org) {
    var row =
    `
        <tr>
            <td><img alt="..." class="img-thumbnail" src="${org.logo}"/></td>
            <td>${org.name}</td>
            <td>${org.description}</td>
            <td><a href="#" onclick=""><i class="fa fa-pencil pr-2"></i></a><a href="#" onclick=""><i class="fa fa-trash-o"></i></a></td>
        </tr>
    `;

    return row;
}

function createInput(type, name, labelText, placeholder, inputClass) {
    var input =
    `
        <div class="form-group row">
            <label for="${name}Field" class="col-sm-2 col-form-label">${labelText}</label>
            <div class="col-sm-10 pt-sm-1">
                <input type="${type}" class="${inputClass}" id="${name}Field" name="${name}" placeholder="${placeholder}">
            </div>
        </div>
    `

    return input;
}