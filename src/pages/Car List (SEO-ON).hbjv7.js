import wixData from "wix-data";
import wixWindowFrontend from "wix-window-frontend";
import {local, memory} from 'wix-storage-frontend';
import { proGallery } from "wix-pro-gallery-backend";
import { getGreetings } from "backend/dataFetcher.web.js";
import { comments } from "wix-comments.v2";

// CARLIST PAGE - https://tptxdev.com/carlist
// WHATSAPP CHAT - https://chat.whatsapp.com/KQeXmIV3IRaDDzJjH8rT0o 

// @author Hugo Chavar hechavar@gmail.com

const STARRED_CARS = "starredCars";
const ALL_CARS = "all_cars";
const SAVED_CARS = "saved_cars";
// pagination of the table needs to be changed when a search is made because the behavoior was erratic
// when we clear the search pagination is restored to this default
const DEFAULT_PAGINATION = {"type": "pagination", "rowsPerPage": 50};
// NUMBER_TO_FIX is a weird value used because a bug of wix
// the issue was: if in the table we are in page X > 1 (Ex: 3) and we perform a search. Next when we click in the Star 
// to give that car the Starred status.. the number of row we get is wrong because it depends on the page we were
// we put a number higher enough to be able to get the modulus
const NUMBER_TO_FIX = 10000;

var tableCount = 0;
var lastSearch = "";
var currentSearch = "";
var waitingFinishWord = false;
var performingSearch = false;

// variable to keep in memory all the cars and make searchs faster
var memoryData;

$w.onReady(function () {
    
    populateTable();

    $w("#table1").onCellSelect(async (event) => {
        
        const tableData = $w("#table1").rows;
        
        let currentRowIndex = event.cellRowIndex;

        // Patch to fix issue with NUMBER_TO_FIX 
        if ($w("#table1").pagination.type == "normal") {
            currentRowIndex = currentRowIndex % NUMBER_TO_FIX;
        }

        const currentRow = tableData[currentRowIndex];
        

        if (!currentRow) {
            console.log("Something was wrong");
            return;
        }

        if (event.cellColumnId == "PICTURES") {
            const imagesCar = local.getItem("images_" + currentRow.old_id);
            if (imagesCar) {
                const imagesList = JSON.parse(imagesCar);
                let lightboxParams = [
                    imagesList,
                    currentRow.Year,
                    currentRow.Make,
                    currentRow.Model_Detail,
                    currentRow.CGLow,
                    currentRow.CGHigh
                ];
                wixWindowFrontend.openLightbox("Carlist Lightbox", lightboxParams);

            } else {
                const url = currentRow.Image_URL.replace("http://", "https://");
                
                getGreetings(url).then((fetchedData) => {
                    const newList = []
                    if (fetchedData.lotImages && fetchedData.lotImages.length != 0) {
                        fetchedData.lotImages.forEach((item) => {
                            if (item.link && item.link.length > 0) {
                                newList.push(item.link[0].url);
                            }
                        });
                    }
                    if (newList.length == 0) {
                        newList.push('https://' + currentRow.Image_Thumbnail.slice(0, -7) + 'ful.jpg');
                    }
                    local.setItem("images_" + currentRow.old_id, JSON.stringify(newList));
                    return newList;
                }).then((imagesList) => {
                    let lightboxParams = [
                        imagesList,
                        currentRow.Year,
                        currentRow.Make,
                        currentRow.Model_Detail,
                        currentRow.CGLow,
                        currentRow.CGHigh
                    ];
                    wixWindowFrontend.openLightbox("Carlist Lightbox", lightboxParams);
                });
                
            }

        } else if (event.cellColumnId == "STAR") {
            
            const currentCarId = currentRow.old_id;
            setStarred(currentCarId);

        }

    
    });


    $w("#input1").onInput((event) => {
        if (waitingFinishWord) {
            return;
        }
        currentSearch = $w("#input1").value.toUpperCase().trim();
        setTimeout(smartSearch, 100);

    })

    $w("#dropdown1").onChange((event) => {
        const value = $w("#dropdown1").value;
        // console.log("Filter by: " + value)
        performingSearch = true;
        waitingFinishWord = true;
        $w("#input1").value = "";
        $w("#input1").resetValidityIndication();
        currentSearch = "";
        lastSearch = "";
        if (value == "RESET_ALL") {
            restoreTable();
        } else {
            filterTable((car) => {
                return car.Make == value
            })
        }
        performingSearch = false;
        waitingFinishWord = false;

    })

});


function smartSearch() {
    // we need to do a smart search because when user type fast the search was performed 
    // several times within the same second causing a browser crash
    // so, we avoid doing the search in trivial cases and some others
    // all this is because of the need of storing starred cars locally. 
    
    if (currentSearch && ( currentSearch.length == 1 || currentSearch.length == 2)) {
        // console.log("exit len 1 2")
        return;
    }

    if (lastSearch === currentSearch) {
        // console.log("exit equal. Last: " + lastSearch + ". Current: " + currentSearch)
        return;
    }

    if ((tableCount < 4) && (currentSearch.length > lastSearch.length) && currentSearch.startsWith(lastSearch)) {
        // console.log("exit search complete")
        return;
    }

    if ((currentSearch.length == lastSearch.length - 1) && currentSearch.length > 3) {
        // console.log("exit useless search")
        return;
    }

    // console.log("waiting .. ")

    waitingFinishWord = true;

    performSearchWhenStopsTyping();

}

function performSearchWhenStopsTyping() {
    setTimeout(() => {
        if (currentSearch.length == $w("#input1").value.length && !performingSearch) {
            // console.log("Indeed search: " + currentSearch)
            performingSearch = true;
            waitingFinishWord = false;
            setTimeout(performSearch, 500);
        } else {
            // console.log("Will wait a little longer .. performingSearch: " + performingSearch )
            // console.log("current search: " + currentSearch)
            // console.log("Input search: " + $w("#input1").value)
            currentSearch = $w("#input1").value.toUpperCase().trim();
            performSearchWhenStopsTyping();
        }
    }, 500)
}

function performSearch() {
    let input = $w("#input1").value.toUpperCase();
    
    if (input.length == 1 || input.length == 2) {
        performingSearch = false;
        return;
    }

    if (!input || !input.trim()) {
        restoreTable();
    } else {
        filterTable((car) => {
            return (
                car.Color.includes(input) || car.Model_Detail.includes(input) || car.Year.toString().includes(input) ||
                car.BODY_STYLE.includes(input) || car.Make.includes(input) || car.Drive.toUpperCase().includes(input) ||
                car.old_id.toString().includes(input) || car.Fuel_Type.includes(input) || car.Engine.includes(input)
            );
        });
    }

    setTimeout(() => {
        performingSearch = false;
    }, 1500);
    lastSearch = currentSearch;
}

function restoreSavedCars() {
    const items = local.getItem(SAVED_CARS);
    if (items) {
        let tableData = JSON.parse(items);
        $w("#table1").rows = tableData;
    }
}

function restoreTable() {
    getAllCars(() => {
        sortByStar(memoryData);
        if ($w("#table1").pagination.type == "normal") {
            $w("#table1").pagination = DEFAULT_PAGINATION;
        }
    
        $w("#table1").rows = memoryData;
        tableCount = memoryData.length;
        memory.setItem(ALL_CARS, JSON.stringify(memoryData))
    });

}

function getAllCars(callback) {
    if (memoryData) {
        callback();
    } else {
        let stringifiedData = memory.getItem(ALL_CARS);
        if (stringifiedData) {
            memoryData = JSON.parse(memory.getItem(ALL_CARS));
            callback();
        } else {
            queryAllCars().then(() => {

                callback();
            });
        }
        
    }
}

function filterTable(func) {
    getAllCars(() => {
        let newData = memoryData.filter(func);

        // We avoid to show an empty table
        if (newData.length == 0) return;
    
        sortByStar(newData);
    
        tableCount = newData.length;
    
    
        // issue with NUMBER_TO_FIX 
        if ($w("#table1").pagination.type == "pagination") {
            $w("#table1").pagination = {"type": "normal", "rowsPerPage": NUMBER_TO_FIX};
        }
    
        $w("#table1").rows = newData;
    });
    

}

function sortByStar(newData) {
    for (let i = 0; i < newData.length; i++) {

        const currentRow = newData[i];

        currentRow.Starred = isStarred(currentRow.old_id);
        currentRow.Star = getHTMLStar(currentRow.old_id, currentRow.Starred);
    }

    newData.sort((a, b) => { return b.Starred - a.Starred; });
}

function setStarred(currentCarId) {
    // saves in local storage all cars the user starred 
    const values = local.getItem(STARRED_CARS)
    let starredCars = [];
    if (values) {
        starredCars = JSON.parse(values);
    }
    
    if (starredCars.includes(currentCarId)) {
        starredCars = starredCars.filter(carId => carId != currentCarId);
    } else {
        starredCars.push(currentCarId);
    }
    local.setItem(STARRED_CARS, JSON.stringify(starredCars) );
}

function isStarred(carId) {
    // before rendering every row of the table we check if the star should be on/off
    const values = local.getItem(STARRED_CARS)
    if (!values)
        return false;

    const starredCars = JSON.parse(values)

    return starredCars.includes(carId)
}

function getHTMLStar(carId, starred) {
    // replaces the content of the column star 
    // starStatusClass defines if the star is on/off
    const starStatusClass = starred ? "starredcar" : "normalcar";

    const id = 'star_' + carId;
    const newEl = 'el_' + id

    const elementScript = '<script>\n' +
        'var ' + id + ' = "' + id + '";\n' +
        'var ' + newEl + ' = document.getElementById("' + id + '");\n' +
        newEl + '.onclick = function() {\n' +
        // '  console.log("click on star: " + this.id)\n' +
        // '  console.log("className before(" + this.id + "): " + this.className)\n' +
        // '  console.log("click on star")\n' +
        '  this.className = this.className === "normalcar" ? "starredcar" : "normalcar";\n' +
        // '  console.log("className after(" + this.id + "): " + this.className)\n' +
        '}\n' +
        '</script>';
    
    // black star sets an black outline
    const blackStar = '<path fill="black" d="M 12 17.5 L 18.8 21.6 L 18.8 21.6 l -1.9 -7.6 L 22.6 9.02 L 22.6 9.02 l -7.4 -0.7 L 12 1.5 L 12 1.5 L 9 8.3 L 1.5 9.02 L 1.5 9.02 l 5.4 5 L 5.2 21.6 L 5.2 21.6 L 12 17.5 z"></path>';
    const frontStar = '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"></path>';

    const starImage = '<svg width="24" height="24" viewBox="0 0 24 24" focusable="false" class="TYVfy NMm5M">' + blackStar + frontStar +'</svg>';

    const innerHtml = elementScript + starImage;

    return '<span name="star" class="' + starStatusClass + '" aria-hidden="true" id="'+ id +  '">' + 
            innerHtml + '</span>'

}

async function queryAllCars() {
    // Query the database and store the results. We only query once the data per session 
    await wixData.query("cars/copart").limit(1000).find().then((result) => {
        memoryData = result.items;
        memory.setItem(ALL_CARS, JSON.stringify(result.items))

        const savedCars = result.items.slice(0,10);
        local.setItem(SAVED_CARS, JSON.stringify(savedCars))

    });
}

async function populateTable(params) {

    $w("#table1").pagination = DEFAULT_PAGINATION;

    const columns = [
        {
            "id": "Selection_Box",
            "dataPath": "Selection_Box",
            "label": "SELECT",
            "type": "bool",
            "width": 90,
            "visible": true
        },
        {
            "id": "_owner",
            "dataPath": "_owner",
            "label": "_owner",
            "type": "string",
            "width": 100,
            "visible": false
        },
        {
            "id": "Star",
            "dataPath": "Star",
            "label": "STAR",
            "type": "richText",
            "width": 100,
            "visible": true
        },
        {
            "id": "Starred",
            "dataPath": "Starred",
            "label": "Starred",
            "type": "bool",
            "width": 50,
            "visible": false
        },
        {
            "id": "Picture",
            "dataPath": "Picture",
            "label": "PICTURES",
            "type": "richText",
            "width": 120,
            "visible": true
        },
        {
            "id": "Image_Thumbnail",
            "dataPath": "Image_Thumbnail",
            "label": "Image_Thumbnail",
            "type": "string",
            "width": 120,
            "visible": false
        },
        {
            "id": "old_id",
            "dataPath": "old_id",
            "label": "ID",
            "type": "number",
            "width": 100,
            "visible": true
        },
        {
            "id": "Year",
            "dataPath": "Year",
            "label": "YEAR",
            "type": "number",
            "width": 74,
            "visible": true
        },
        {
            "id": "Make",
            "dataPath": "Make",
            "label": "MAKE",
            "type": "string",
            "width": 125,
            "visible": true
        },
        {
            "id": "Model",
            "dataPath": "Model",
            "label": "Model_Only",
            "type": "string",
            "width": 100,
            "visible": false
        },
        {
            "id": "Model_Detail",
            "dataPath": "Model_Detail",
            "label": "MODEL",
            "type": "string",
            "width": 140,
            "visible": true
        },
        {
            "id": "Color",
            "dataPath": "Color",
            "label": "COLOR",
            "type": "string",
            "width": 100,
            "visible": true
        },
        {
            "id": "Odometer",
            "dataPath": "Odometer",
            "label": "ODOMETER",
            "type": "number",
            "width": 100,
            "visible": true
        },
        {
            "id": "CGLow",
            "dataPath": "CGLow",
            "label": "TRADE-IN",
            "type": "string",
            "width": 100,
            "visible": true
        },
        {
            "id": "CGHigh",
            "dataPath": "CGHigh",
            "label": "MARKET VALUE",
            "type": "string",
            "width": 100,
            "visible": true
        },
        {
            "id": "STATE",
            "dataPath": "STATE",
            "label": "STATE",
            "type": "string",
            "width": 60,
            "visible": true
        },
        {
            "id": "Sale_Date",
            "dataPath": "Sale_Date",
            "label": "SALE DATE",
            "type": "string",
            "width": 100,
            "visible": true
        },
        {
            "id": "Has_Keys",
            "dataPath": "Has_Keys",
            "label": "HAS KEYS",
            "type": "string",
            "width": 74,
            "visible": true
        },
        {
            "id": "Engine",
            "dataPath": "Engine",
            "label": "ENGINE",
            "type": "string",
            "width": 80,
            "visible": true
        },
        {
            "id": "Drive",
            "dataPath": "Drive",
            "label": "DRIVE TYPE",
            "type": "string",
            "width": 100,
            "visible": true
        },
        {
            "id": "Transmission",
            "dataPath": "Transmission",
            "label": "TRANSMISSION",
            "type": "string",
            "width": 120,
            "visible": true
        },
        {
            "id": "Image_URL",
            "dataPath": "Image_URL",
            "label": "Image_URL",
            "type": "string",
            "width": 100,
            "visible": false
        },
        {
            "id": "Fuel_Type",
            "dataPath": "Fuel_Type",
            "label": "FUEL TYPE",
            "type": "string",
            "width": 100,
            "visible": true
        },
        {
            "id": "Cylinders",
            "dataPath": "Cylinders",
            "label": "CYLINDERS",
            "type": "string",
            "width": 95,
            "visible": true
        },
        {
            "id": "BODY_STYLE",
            "dataPath": "BODY_STYLE",
            "label": "BODY STYLE",
            "type": "string",
            "width": 95,
            "visible": false
        },
        {
            "id": "_createdDate",
            "dataPath": "_createdDate",
            "label": "_createdDate",
            "type": "date",
            "width": 100,
            "visible": false
        },
        {
            "id": "_updatedDate",
            "dataPath": "_updatedDate",
            "label": "_updatedDate",
            "type": "date",
            "width": 100,
            "visible": false
        },
        {
            "id": "_id",
            "dataPath": "_id",
            "label": "_id",
            "type": "string",
            "width": 100,
            "visible": false
        },
        {
            "id": "link-copart-old_id",
            "dataPath": "link-copart-old_id",
            "label": "link-copart-old_id",
            "type": "number",
            "width": 100,
            "visible": false
        }
    ];

    $w("#table1").columns = columns;

    // we keep 10 cars stored in the browser, so the next time user visit the site
    // 10 cars are displayed before all data is retrieved with the query
    restoreSavedCars();

    queryAllCars().then(() => {
        // console.log('restoring table');
        // once the query finish populate the table and show to the user
        restoreTable();
        // console.log('RESTORED table');
    });
    
    
}
