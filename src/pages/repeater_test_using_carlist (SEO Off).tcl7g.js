// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixData from 'wix-data';
$w.onReady(function () {



 $w("#text67").onClick(() => {
console.log('Text 67 Clicked');
console.log('Before: ' +  $w("#text67").text);
 $w("#text67").text = 'Changed';
   
});

    console.log("On ready function")
    $w("#button7").onClick(() => {
        const currentOrder = $w("#button7").label;
        const nextOrder = currentOrder === "asc" ? "desc" : "asc";
        $w("#button7").label = nextOrder;
        sortTableData("Yard_number", nextOrder);
    });
    $w("#button8").onClick(() => {
        const currentOrder = $w("#button8").label;
        const nextOrder = currentOrder === "asc" ? "desc" : "asc";
        $w("#button8").label = nextOrder;
        sortTableData("old_id", nextOrder);
    });
    loadTableData();

    function loadTableData() {
        wixData.query("copart")
            .find()
            .then(results => {
                $w("#table1").rows = results.items;
                console.log("called this function inside the laod table data");
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }

    function sortTableData(columnId, sortOrder) {
        let tableData = $w("#table1").rows
        tableData.sort((a, b) => {
        const valueA = a[columnId];
        const valueB = b[columnId];

        if (sortOrder === "asc") {
            return valueA - valueB;
        } else {
            return valueB - valueA;
        }
    });
        $w("#table1").rows = tableData;
    }

});

/**
*	Adds an event handler that runs when the element is clicked.
	[Read more](https://www.wix.com/corvid/reference/$w.ClickableMixin.html#onClick)
*	 @param {$w.MouseEvent} event
*/
