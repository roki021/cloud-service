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

                console.log(data.responseJSON);
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
        console.log(vm);
        var row =
        `
            <tr>
                <td>${vm.name}</td>
                <td>${vm.cores}</td>
                <td>${vm.ram}</td>
                <td>${vm.gpu}</td>
                <td>-</td>
                <td><a href="#" onclick="setUpEditForm('${vm.name}')"><i class="fa fa-pencil pr-2"></i></a><a href="#" onclick=""><i class="fa fa-trash-o"></i></a></td>
            </tr>
        `;
        tbody.append(row);
    }

    div.append(table);
    canvas.append(div);

    var addVmButton = `<button class="mr-sm-1 float-right btn btn-primary col-sm-auto"
     onclick="setUpAddForm('Add organization', 'addVM', 'rest/addVM')">Add Virtual Machine</button>`;
    //canvas.append(addOrgButton);
}

function createTableRowVM(vm) {
    $.ajax({
            url: "rest/getVMCat?categoryName=" + vm.categoryName,
            type: "GET",
            dataType: "json",
            complete: function(data) {
                var canvas = $("#canvas");
                //canvas.empty();


                if(data.status === 403) {
                    response = data.responseJSON;
                    statusMessageStyle(403, response.message);
                } else {
                    response = data.responseJSON;
                    console.log(response);
                    var row =
                        `
                            <tr>
                                <td>${vm.name}</td>
                                <td>${vm.cores}</td>
                                <td>${vm.ram}</td>
                                <td>${vm.gpu}</td>
                                <td>-</td>
                                <td><a href="#" onclick="setUpEditForm('${vm.name}')"><i class="fa fa-pencil pr-2"></i></a><a href="#" onclick=""><i class="fa fa-trash-o"></i></a></td>
                            </tr>
                        `;
                    console.log(row);
                    return row;
                }
            }
        });


}