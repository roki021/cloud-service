function getUsers() {
    $.ajax({
        url: "rest/getUsers",
        type: "GET",
        dataType: "json",
        complete: function(data) {
            if(data.status == 403) {
                $("#canvas").append('<h1>403 Forbidden</h1>');
            } else {
                response = data.responseJSON;
                var table = $("<table/>");
                table.append("<thead><tr><th>1</th><th>2</th></tr></thead>")
                table.addClass("table table-hover table-dark");




                table.append("<td>test</td>")
                $("#canvas").append(table);
                /*var header =
                `

                `
                for(let user in response) {
                    var row =
                    `
                        <tr>
                            <td></td>
                        </tr>
                    `
                }*/
            }

            console.log(data)
            console.log(response);
        }
    });
}