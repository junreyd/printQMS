ExecuteOrDelayUntilScriptLoaded(init, 'sp.js');
var currentUser;
var targetUser;
var qms_data;





function init() {

    this.clientContext = new SP.ClientContext.get_current();
    this.oWeb = clientContext.get_web();
    currentUser = this.oWeb.get_currentUser();
    this.clientContext.load(currentUser);
    this.clientContext.executeQueryAsync(Function.createDelegate(this, this.onLoad));

}





function onLoad() {

    var account = currentUser.get_loginName();
    targetUser_temp = account.substring(account.indexOf("|") + 10);
    targetUser = targetUser_temp;

    // $("input[id='click']").click(get_global_data);


    if (targetUser == "junreyd" || targetUser == "litoa") {
        $('#click').show();
        $('#central_admin').show();
    }

}






(function () {

    $.ajax({
        url: `${_spPageContextInfo.webAbsoluteUrl}/_api/Web/Lists(guid'aa4ef5d1-2a45-4aee-8dc6-1fa297c76111')/items?$select=Id,Document_x0020_ID,FileRef,Clause/Title&$expand=Clause,ContentType&$orderby=Clause/Title asc&$top=2000`,
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose",
            "content-type": "application/json;odata=verbose"
        },
        success: function (data_all) {
            qms_data = data_all.d.results;
            get_global_data();
        },
        error: function (error) {
            console.log(error);
        }
    });

})();




function get_global_data() {

    for (var i = 0; i < qms_data.length; i++) {
        (function (i) {
            var Id = qms_data[i].Id;
            var Section_Number = qms_data[i].Clause.Title.replace(/[^\d.-]/g, '');
            var str = qms_data[i].FileRef; //convert 
            var Document_Title = str.substring(16, str.lastIndexOf("."));
            var Document_ID = qms_data[i].Document_x0020_ID;
            callback(Id, Section_Number, Document_Title, Document_ID);
        })(i);
    }
}





function callback(Id, Section_Number, Document_Title, Document_ID) {
    // console.log(Id, Section_Number, Document_Title, Document_ID);

    substring = "QM";
    var strFirstSecond = Document_ID.substring(0, 2);
    each_sub = ["BM", "OC", "FG"];

    if (strFirstSecond == substring || each_sub.some(el => Document_ID.includes(el))) {



        $.ajax({
            url: `${_spPageContextInfo.webAbsoluteUrl}/_layouts/15/versions.aspx?list={aa4ef5d1-2a45-4aee-8dc6-1fa297c76111}&ID=${Id}`,
            method: "GET",
            headers: {
                "Accept": "application/json; odata=verbose",
                "content-type": "application/json;odata=verbose"
            },
            success: function (data) {

                var entries = [];
                var versionList = $(data).find('table.ms-settingsframe');


                if (typeof (versionList) !== typeof (undefined) && versionList !== null) {
                    versionList.find('tbody > tr').each(function (i, trval) {


                        if (i > 0) {

                            try {
                                var verRow = $(this);
                                var currentRev = verRow.find("table tr > td:contains(Current Rev)").next().text();
                                var revDate = verRow.find("table tr > td:contains(Rev Date)").next().text();
                                var Revision = verRow.find("table tr > td:contains(Change Reference #)").next().text();


                                if (currentRev !== "" && (revDate !== null && revDate.length > 0)) {


                                    c_Rev = currentRev.trim();
                                    r_Date = revDate.trim();
                                    revision_result = Revision.trim();


                                    var entry = {
                                        Current_Revision: c_Rev,
                                        Revision_Date: r_Date
                                    };
                                    entries.push(entry);

                                }

                            } catch (error) {
                                console.log(error.message);
                            }
                        }
                    });
                }

                // entries.forEach((item, i) => {
                //     item.id = i + 1;
                // });

                to_print(entries, Id, Section_Number, Document_Title, Document_ID);


            },
            error: function (error) {
                console.log(error);
            }
        });
    }
}




function to_print(entries, Id, Section_Number, Document_Title, Document_ID) {

    var td_current_rev = "";
    var td_rev_date = "";

    var baseHTML = "";
    // var children = "";
    var max_rowspan = 0;
    var length_entries = entries.length;

    $.each(entries, function (key, value) {

        var value_length = Object.keys(value).length;



        if (value.Current_Revision !== "") {
            max_rowspan++;

            baseHTML = `<tr><td rowspan="2" class="tds">${Section_Number}</td>
                        <td rowspan="2" class="tds">${Document_Title}</td>
                        <td rowspan="2" class="tds">${Document_ID}</td>`


            td_current_rev += `<td class="tds" colspan="1000">${value.Current_Revision}</td>`;
            td_rev_date += `<td class="tds" colspan="1000">${value.Revision_Date}</td>`;
        }

    });

    $('#tabler').append(`
    <tr>
        <td class="tds" colspan=${max_rowspan}>
            Sample
        </td>
    </tr>
    `);

    // $('#tabler').append(`${baseHTML}${td_current_rev}</tr>
    //         <tr>${td_rev_date}</tr>
    //     `);

    console.log(max_rowspan);




}










































// var uri = 'data:application/vnd.ms-excel;base64,',
//     template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>',
//     base64 = function (s) {
//         return window.btoa(unescape(encodeURIComponent(s)))
//     },
//     format = function (s, c) {
//         return s.replace(/{(\w+)}/g, function (m, p) {
//             return c[p];
//         })
//     }
// return function (table, name) {
//     if (!table.nodeType) table = document.getElementById(table)
//     var ctx = {
//         worksheet: name || 'Worksheet',
//         table: table.innerHTML
//     }
//     window.location.href = uri + base64(format(template, ctx))
// }