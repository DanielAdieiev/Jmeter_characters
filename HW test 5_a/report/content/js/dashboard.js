/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.98938273898791, "KoPercent": 0.010617261012090406};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9877503351073007, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9411201837203368, 500, 1500, "Отриати всіх героїв"], "isController": false}, {"data": [1.0, 500, 1500, "Отримати героя за id"], "isController": false}, {"data": [1.0, 500, 1500, "Створити героя"], "isController": false}, {"data": [1.0, 500, 1500, "Змінити героя"], "isController": false}, {"data": [1.0, 500, 1500, "Видалити героя "], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 75349, 8, 0.010617261012090406, 390.9490636902943, 3, 32273, 167.0, 221.0, 255.0, 29219.99, 2206.1544767816363, 2457.302196485038, 397.7483535054459], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Отриати всіх героїв", 15676, 8, 0.05103342689461597, 1293.3705664710394, 9, 32273, 156.0, 220.0, 3215.0, 29273.23, 458.9799145048896, 2050.4244389840865, 56.476044167593834], "isController": false}, {"data": ["Отримати героя за id", 15078, 0, 0.0, 157.642260246717, 9, 464, 154.0, 202.0, 221.04999999999927, 289.2099999999991, 508.20721965688085, 116.6295865423506, 63.02960634416394], "isController": false}, {"data": ["Створити героя", 14990, 0, 0.0, 150.1429619746504, 3, 411, 149.0, 182.0, 206.0, 254.0, 507.55061962483916, 116.47890196468478, 114.49628235677524], "isController": false}, {"data": ["Змінити героя", 14829, 0, 0.0, 153.88940589385663, 9, 351, 152.0, 192.0, 214.0, 254.0, 503.25799226226843, 115.49377752112603, 113.03646310578293], "isController": false}, {"data": ["Видалити героя ", 14776, 0, 0.0, 153.840349214943, 6, 350, 152.0, 192.0, 208.0, 245.0, 505.0587913590374, 122.81214750820344, 105.05617437448728], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 32,251 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 12.5, 0.0013271576265113008], "isController": false}, {"data": ["The operation lasted too long: It took 32,268 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 12.5, 0.0013271576265113008], "isController": false}, {"data": ["The operation lasted too long: It took 32,249 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 12.5, 0.0013271576265113008], "isController": false}, {"data": ["The operation lasted too long: It took 32,273 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 12.5, 0.0013271576265113008], "isController": false}, {"data": ["The operation lasted too long: It took 32,246 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 12.5, 0.0013271576265113008], "isController": false}, {"data": ["The operation lasted too long: It took 32,245 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 12.5, 0.0013271576265113008], "isController": false}, {"data": ["The operation lasted too long: It took 32,260 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 12.5, 0.0013271576265113008], "isController": false}, {"data": ["The operation lasted too long: It took 32,256 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, 12.5, 0.0013271576265113008], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 75349, 8, "The operation lasted too long: It took 32,251 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, "The operation lasted too long: It took 32,268 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, "The operation lasted too long: It took 32,249 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, "The operation lasted too long: It took 32,273 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, "The operation lasted too long: It took 32,246 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Отриати всіх героїв", 15676, 8, "The operation lasted too long: It took 32,251 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, "The operation lasted too long: It took 32,268 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, "The operation lasted too long: It took 32,249 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, "The operation lasted too long: It took 32,273 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1, "The operation lasted too long: It took 32,246 milliseconds, but should not have lasted longer than 30,000 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
