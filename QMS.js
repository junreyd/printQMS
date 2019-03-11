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
}






(function () {

    $.ajax({
        url: `${_spPageContextInfo.webAbsoluteUrl}/_api/Web/Lists(guid'aa4ef5d1-2a45-4aee-8dc6-1fa297c76111')/items?$select=Id,Document_x0020_ID,FileRef,New_x0020_Entry,Clause/Title,Document_x0020_Approver/Title&$expand=Clause,Document_x0020_Approver,ContentType&$top=1000`,
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose",
            "content-type": "application/json;odata=verbose"
        },
        success: function (data_all) {
            qms_data = data_all.d.results;

            // get_global_data();  
            $("input[id='quality_manual']").click(function (e) {
                e.preventDefault();
                quality_manual();
            });

            $("input[id='forms_checklist']").click(function (e) {
                e.preventDefault();
                forms_checklist();
            });

            $("input[id='pm_or_wi']").click(function (e) {
                e.preventDefault();
                pm_or_wi();
            });


            $("input[id='printData']").on("click", function () {
                alert("UNDER CONSTRUCTION PA!!!");
                // var divContents = $("#result").html();
                // var printWindow = window.open('', '', 'height=400,width=800');
                // printWindow.document.write('<html><head><title>DIV Contents</title>');
                // printWindow.document.write('</head><body >');
                // printWindow.document.write(divContents);
                // printWindow.document.write('</body></html>');
                // printWindow.document.close();
                // printWindow.print();
            });

            $('#notfound').show();
        },
        error: function (error) {
            console.log(error);
        }
    });

})();






function quality_manual() {
    $('#loader_show_hide').show();
    var all_data = [];


    $.when.apply($, qms_data.map(function (datas) {


        var Id = datas.Id;
        var Section_Number = datas.Clause.Title.replace(/[^\d.-]/g, '');
        var str = datas.FileRef; //convert 
        var Document_Title = str.substring(16, str.lastIndexOf("."));
        var Document_ID = datas.Document_x0020_ID;
        var Document_Approver = datas.Document_x0020_Approver.Title;

        substring = "QM";
        var strFirstSecond = Document_ID.substring(0, 2);
        each_sub = ["BM", "OC", "FG"];

        if (strFirstSecond == substring || each_sub.some(el => Document_ID.includes(el))) {

            var obj = {};
            obj['ID'] = Id;
            obj['Section_No'] = Section_Number;
            obj['Document_Title'] = Document_Title;
            obj['Document_ID'] = Document_ID;
            obj['Signature'] = Document_Approver;




            return $.ajax({
                url: `${_spPageContextInfo.webAbsoluteUrl}/_layouts/15/versions.aspx?list={aa4ef5d1-2a45-4aee-8dc6-1fa297c76111}&ID=${Id}`,
                method: "GET",
                headers: {
                    "Accept": "application/json; odata=verbose",
                    "content-type": "application/json;odata=verbose"
                },
                success: function (data) {
                    var entries = [];
                    var entries1 = [];
                    var versionList = $(data).find('table.ms-settingsframe');

                    if (typeof (versionList) !== typeof (undefined) && versionList !== null) {
                        versionList.find('tbody > tr').each(function (i, trval) {


                            if (i > 0) {

                                try {
                                    var verRow = $(this);
                                    var currentRev = verRow.find("table tr > td:contains(Current Rev)").next().text();
                                    var revDate = verRow.find("table tr > td:contains(Rev Date)").next().text();
                                    var Revision = verRow.find("table tr > td:contains(Change Reference #)").next().text();
                                    revision_result = Revision.trim();

                                    if (revision_result !== "") {
                                        entries1.push(revision_result);
                                    }

                                    if (currentRev !== "" && (revDate !== null && revDate.length > 0)) {

                                        c_Rev = currentRev.trim();
                                        r_Date = revDate.trim();

                                        if (c_Rev !== "" && r_Date !== "") {
                                            var entry = {
                                                No: c_Rev,
                                                Approval_Date: r_Date
                                            };
                                            entries.push(entry);
                                        }

                                    }

                                } catch (error) {
                                    console.log(error.message);
                                }
                            }
                        });
                    }

                    // console.log(entries);

                    obj['Revisions'] = entries;
                    obj['remarks'] = entries1;
                    all_data.push(obj);


                }
            });

        }

    })).done(function () {
        console.log(all_data);

        $('#notfound').hide();
        $('#loader_show_hide').hide();
        var APIData = [{
                Section_No: "Section_No",
                Document_Title: "Document_Title",
                Document_ID: "Document_ID",
                Revisions: [{
                        No: '01',
                        Approval_Date: '8/23/2017'
                    },
                    {
                        No: '02',
                        Approval_Date: '3/12/2018'
                    },
                ],
                remarks: ['OK', 'OK', 'OK'],
                Signature: 'Signature'
            },
            {
                Section_No: "Section_No",
                Document_Title: "Document_Title",
                Document_ID: "Document_ID",
                Revisions: [{
                        No: '01',
                        Approval_Date: '8/23/2017'
                    },
                    {
                        No: '02',
                        Approval_Date: '3/12/2018'
                    },
                ],
                remarks: ['OK', 'OK', 'OK'],
                Signature: 'Signature'
            }
        ];
        // console.log(APIData);


        $.views.helpers({
            getNumberWithOrdinal: function (n) {
                var s = ["th", "st", "nd", "rd"],
                    v = n % 100;
                return n + (s[(v - 20) % 10] || s[v] || s[0]);
            },
            makeArray: function (count) {
                var array = [];
                if (count) {
                    array[count - 1] = {};
                }
                return array;
            }
        });



        var template = $.templates("#theTmpl");

        var data = {
            maxVersions: 1,
            maxRemarks: 1,
            rows: all_data
        };

        all_data.forEach(function (row) {
            var versions = row.Revisions.length;
            if (versions > data.maxVersions) {
                data.maxVersions = versions;
            }
            var remarks = row.remarks.length;
            if (remarks > data.maxRemarks) {
                data.maxRemarks = remarks;
            }
            // console.log(row.Revisions.length);
        });


        template.link("#result", data);



        var value = "https://intranet.houseofit.com.au/SiteAssets/Logo/hoit logo.png";
        var result = $.views.converters.url(value);

        var myTmpl = $.templates("#personTmpl");
        var person = {
            Date: "August 30, 1996",
            image: result

        };
        var html = myTmpl.link("#person", person);


    });
}





function forms_checklist() {
    $('#loader_show_hide').show();
    var all_data = [];


    $.when.apply($, qms_data.map(function (datas) {


        var Id = datas.Id;
        var Section_Number = datas.Clause.Title.replace(/[^\d.-]/g, '');
        var str = datas.FileRef; //convert 
        var Document_Title = str.substring(16, str.lastIndexOf("."));
        var Document_ID = datas.Document_x0020_ID;
        var Document_Approver = datas.Document_x0020_Approver.Title;

        // substring = "QM";
        // var strFirstSecond = Document_ID.substring(0, 2);
        each_sub = ["FM", "LS", "FG"];

        if (each_sub.some(el => Document_ID.includes(el))) {

            var obj = {};
            obj['ID'] = Id;
            obj['Section_No'] = Section_Number;
            obj['Document_Title'] = Document_Title;
            obj['Document_ID'] = Document_ID;
            obj['Signature'] = Document_Approver;




            return $.ajax({
                url: `${_spPageContextInfo.webAbsoluteUrl}/_layouts/15/versions.aspx?list={aa4ef5d1-2a45-4aee-8dc6-1fa297c76111}&ID=${Id}`,
                method: "GET",
                headers: {
                    "Accept": "application/json; odata=verbose",
                    "content-type": "application/json;odata=verbose"
                },
                success: function (data) {
                    var entries = [];
                    var entries1 = [];

                    // for (q = 0; q < data.length; q++) {

                    //     //     obj_rev.push({
                    //     //         'No': '01',
                    //     //         "Approval Date": "3/12/2018"
                    //     //     })

                    //     if (data.length - 1 === q) {
                    //         console.log("true");

                    //         //         obj['Revisions'] = entries;
                    //         //         all_data.push(obj);
                    //     }

                    // }



                    var versionList = $(data).find('table.ms-settingsframe');


                    if (typeof (versionList) !== typeof (undefined) && versionList !== null) {
                        versionList.find('tbody > tr').each(function (i, trval) {


                            if (i > 0) {

                                try {
                                    var verRow = $(this);
                                    var currentRev = verRow.find("table tr > td:contains(Current Rev)").next().text();
                                    var revDate = verRow.find("table tr > td:contains(Rev Date)").next().text();
                                    var Revision = verRow.find("table tr > td:contains(Change Reference #)").next().text();
                                    revision_result = Revision.trim();

                                    if (revision_result !== "") {
                                        entries1.push(revision_result);
                                    }

                                    if (currentRev !== "" && (revDate !== null && revDate.length > 0)) {

                                        c_Rev = currentRev.trim();
                                        r_Date = revDate.trim();

                                        if (c_Rev !== "" && r_Date !== "") {
                                            var entry = {
                                                No: c_Rev,
                                                Approval_Date: r_Date
                                            };
                                            entries.push(entry);
                                        }

                                    }

                                } catch (error) {
                                    console.log(error.message);
                                }
                            }
                        });
                    }

                    // console.log(entries);

                    obj['Revisions'] = entries;
                    obj['remarks'] = entries1;
                    all_data.push(obj);


                }
            });

        }

    })).done(function () {
        $('#notfound').hide();
        $('#loader_show_hide').hide();
        var APIData = [{
                Section_No: "Section_No",
                Document_Title: "Document_Title",
                Document_ID: "Document_ID",
                Revisions: [{
                        No: '01',
                        Approval_Date: '8/23/2017'
                    },
                    {
                        No: '02',
                        Approval_Date: '3/12/2018'
                    },
                ],
                remarks: ['OK', 'OK', 'OK'],
                Signature: 'Signature'
            },
            {
                Section_No: "Section_No",
                Document_Title: "Document_Title",
                Document_ID: "Document_ID",
                Revisions: [{
                        No: '01',
                        Approval_Date: '8/23/2017'
                    },
                    {
                        No: '02',
                        Approval_Date: '3/12/2018'
                    },
                ],
                remarks: ['OK', 'OK', 'OK'],
                Signature: 'Signature'
            }
        ];
        // console.log(APIData);


        $.views.helpers({
            getNumberWithOrdinal: function (n) {
                var s = ["th", "st", "nd", "rd"],
                    v = n % 100;
                return n + (s[(v - 20) % 10] || s[v] || s[0]);
            },
            makeArray: function (count) {
                var array = [];
                if (count) {
                    array[count - 1] = {};
                }
                return array;
            }
        });

        var template = $.templates("#theTmpl");

        var data = {
            maxVersions: 1,
            maxRemarks: 1,
            rows: all_data
        };

        all_data.forEach(function (row) {
            var versions = row.Revisions.length;
            if (versions > data.maxVersions) {
                data.maxVersions = versions;
            }
            var remarks = row.remarks.length;
            if (remarks > data.maxRemarks) {
                data.maxRemarks = remarks;
            }
            // console.log(row.Revisions.length);
        });


        template.link("#result", data);



        var value = "https://intranet.houseofit.com.au/SiteAssets/Logo/hoit logo.png";
        var result = $.views.converters.url(value);

        var myTmpl = $.templates("#personTmpl");
        var person = {
            Date: "August 30, 1996",
            image: result

        };
        var html = myTmpl.link("#person", person);


    });
}




function pm_or_wi() {
    $('#loader_show_hide').show();

    var all_data = [];


    $.when.apply($, qms_data.map(function (datas) {

        var new_entry = datas.New_x0020_Entry;
        var Id = datas.Id;
        var Section_Number = datas.Clause.Title.replace(/[^\d.-]/g, '');
        var str = datas.FileRef; //convert 
        var Document_Title = str.substring(16, str.lastIndexOf("."));
        var Document_ID = datas.Document_x0020_ID;
        var Document_Approver = datas.Document_x0020_Approver.Title;

        // substring = "QM";
        // var strFirstSecond = Document_ID.substring(0, 2);
        each_sub = ["PM", "WI"];

        if (each_sub.some(el => Document_ID.includes(el))) {

            var obj = {};
            obj['New_Entry'] = new_entry;
            obj['ID'] = Id;
            obj['Section_No'] = Section_Number;
            obj['Document_Title'] = Document_Title;
            obj['Document_ID'] = Document_ID;
            obj['Signature'] = Document_Approver;




            return $.ajax({
                url: `${_spPageContextInfo.webAbsoluteUrl}/_layouts/15/versions.aspx?list={aa4ef5d1-2a45-4aee-8dc6-1fa297c76111}&ID=${Id}`,
                method: "GET",
                headers: {
                    "Accept": "application/json; odata=verbose",
                    "content-type": "application/json;odata=verbose"
                },
                success: function (data) {
                    var entries = [];
                    var entries1 = [];

                    // for (q = 0; q < data.length; q++) {

                    //     //     obj_rev.push({
                    //     //         'No': '01',
                    //     //         "Approval Date": "3/12/2018"
                    //     //     })

                    //     if (data.length - 1 === q) {
                    //         console.log("true");

                    //         //         obj['Revisions'] = entries;
                    //         //         all_data.push(obj);
                    //     }

                    // }



                    var versionList = $(data).find('table.ms-settingsframe');


                    if (typeof (versionList) !== typeof (undefined) && versionList !== null) {
                        versionList.find('tbody > tr').each(function (i, trval) {


                            if (i > 0) {

                                try {
                                    var verRow = $(this);
                                    var currentRev = verRow.find("table tr > td:contains(Current Rev)").next().text();
                                    var revDate = verRow.find("table tr > td:contains(Rev Date)").next().text();
                                    var Revision = verRow.find("table tr > td:contains(Change Reference #)").next().text();
                                    revision_result = Revision.trim();

                                    if (revision_result !== "") {
                                        entries1.push(revision_result);
                                    }

                                    if (currentRev !== "" && (revDate !== null && revDate.length > 0)) {

                                        c_Rev = currentRev.trim();
                                        r_Date = revDate.trim();

                                        if (c_Rev !== "" && r_Date !== "") {
                                            var entry = {
                                                No: c_Rev,
                                                Approval_Date: r_Date
                                            };
                                            entries.push(entry);
                                        }

                                    }

                                } catch (error) {
                                    console.log(error.message);
                                }
                            }
                        });
                    }

                    // console.log(entries);

                    obj['Revisions'] = entries;
                    obj['remarks'] = entries1;
                    all_data.push(obj);


                }
            });

        }

    })).done(function () {


        $('#notfound').hide();
        $('#loader_show_hide').hide();
        var APIData = [{
                Section_No: "Section_No",
                Document_Title: "Document_Title",
                Document_ID: "Document_ID",
                Revisions: [{
                        No: '01',
                        Approval_Date: '8/23/2017'
                    },
                    {
                        No: '02',
                        Approval_Date: '3/12/2018'
                    },
                ],
                remarks: ['OK', 'OK', 'OK'],
                Signature: 'Signature'
            },
            {
                Section_No: "Section_No",
                Document_Title: "Document_Title",
                Document_ID: "Document_ID",
                Revisions: [{
                        No: '01',
                        Approval_Date: '8/23/2017'
                    },
                    {
                        No: '02',
                        Approval_Date: '3/12/2018'
                    },
                ],
                remarks: ['OK', 'OK', 'OK'],
                Signature: 'Signature'
            }
        ];
        // console.log(APIData);


        $.views.helpers({
            getNumberWithOrdinal: function (n) {
                var s = ["th", "st", "nd", "rd"],
                    v = n % 100;
                return n + (s[(v - 20) % 10] || s[v] || s[0]);
            },
            makeArray: function (count) {
                var array = [];
                if (count) {
                    array[count - 1] = {};
                }
                return array;
            }
        });

        var template = $.templates("#theTmpl");

        var data = {
            maxVersions: 1,
            maxRemarks: 1,
            rows: all_data
        };

        all_data.forEach(function (row) {
            var versions = row.Revisions.length;
            if (versions > data.maxVersions) {
                data.maxVersions = versions;
            }
            var remarks = row.remarks.length;
            if (remarks > data.maxRemarks) {
                data.maxRemarks = remarks;
            }
            // console.log(row.Revisions.length);
        });

        template.link("#result", data);






        var value = "https://intranet.houseofit.com.au/SiteAssets/Logo/hoit logo.png";
        var result = $.views.converters.url(value);

        var myTmpl = $.templates("#personTmpl");
        var person = {
            Date: "August 30, 1996",
            image: result

        };
        var html = myTmpl.link("#person", person);


    });
}