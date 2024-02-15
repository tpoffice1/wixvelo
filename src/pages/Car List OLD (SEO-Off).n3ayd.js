import wixData from "wix-data";
import wixWindowFrontend from "wix-window-frontend";
import { proGallery } from "wix-pro-gallery-backend";
import { getGreetings } from "backend/dataFetcher.web.js";

// CARLIST PAGE - https://tptxdev.com/carlist
// WHATSAPP CHAT - https://chat.whatsapp.com/KQeXmIV3IRaDDzJjH8rT0o 

// @author Unknown

let thumbUrl = '';

$w.onReady(function () {
    // ...
    let table = $w('#table1');

    $w("#table1").onCellSelect(async (event) => {
        let cellData = event.cellData;
        thumbUrl = cellData;
        wixData.query("cars/copart")
            .eq("Image_Thumbnail", cellData)
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    var url = results.items[0].Image_URL;
                    var year = results.items[0].Year;
                    var make = results.items[0].Make;
                    var model = results.items[0].Model_Detail;
                    var trade = results.items[0].CGLow;
                    var market = results.items[0].CGHigh;
                    var urlYearMakeModelTradeMarket = [url, year, make, model, trade, market]
                    displayLightbox(urlYearMakeModelTradeMarket)
                } else {
                    // handle case where no matching items found
                    console.log('Didnt find one');
                }
            })
            .catch((err) => {
                console.log('Didnt find');
                console.log(err);
            });
    });

    // @author Jaay - Search code

    $w("#input1").onInput((event) => {
        let input = $w("#input1");

        let search_query = event.target.value;
        if (input.value === "") {
            console.log("Empty22: ....");
            // $w("#table1").refresh()
        } else {
            wixData
                .query("cars/copart")
                .contains("Make", search_query)
                .or(wixData.query("cars/copart").contains("Model_Detail", search_query))
                .or(wixData.query("cars/copart").contains("Transmission", search_query))
                .or(wixData.query("cars/copart").contains("Fuel_Type", search_query))
                .or(wixData.query("cars/copart").contains("BODY_STYLE", search_query))
                .or(wixData.query("cars/copart").contains("Color", search_query))
                .or(wixData.query("cars/copart").contains("Drive", search_query))
                .find()
                .then((results) => {
                    $w("#table1").rows = results.items;
                    console.log("results are ..", results);
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                });
        }
    })

});

// @author Ahsan - Pictures come up in lightbox when the thumbnail is clicked

async function displayLightbox(urlYear) {
    var url = urlYear[0];
    var year = urlYear[1];
    var make = urlYear[2];
    var model = urlYear[3];
    var trade = urlYear[4];
    var market = urlYear[5];
    console.log('Something was clicked!');
    let cellData = url
    console.log(cellData);
    const cellDataHttps = cellData.replace("http://", "https://");
    const fetchedData = await getGreetings(cellDataHttps);
    const contentToPassToLightbox = []
    const imageUrls = [];
    if (fetchedData.lotImages && fetchedData.lotImages.length != 0) {
        fetchedData.lotImages.forEach((item) => {
            if (item.link && item.link.length > 0) {
                imageUrls.push(item.link[0].url);
            }
        });
        var urlYearMakeModelTradeMarket = [imageUrls, year, make, model, trade, market];
        wixWindowFrontend.openLightbox("Carlist Lightbox", urlYearMakeModelTradeMarket);
    } else {
        imageUrls.push('https://' + thumbUrl.toString().slice(0, -7) + 'ful.jpg')
        var urlYearMakeModelTradeMarket = [imageUrls, year, make, model, trade, market];
        wixWindowFrontend.openLightbox("Carlist Lightbox", urlYearMakeModelTradeMarket);
    }
};