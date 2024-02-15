// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import { lightbox } from "wix-window-frontend";

$w.onReady(function () {
  console.log("I'm available");
  let contentFrompage = lightbox.getContext();

  function formatNumberWithCommas(number) {
    // Convert the number to a string
    let numberString = number.toString();

    // Split the integer and decimal parts
    let parts = numberString.split(".");
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? "." + parts[1] : "";

    // Add commas to the integer part
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Concatenate the formatted integer and decimal parts
    let formattedNumber = integerPart + decimalPart;

    return formattedNumber;
  }

  var year = "";
  var make = "";
  var model = "";
  var trade = "";
  var market = "";
  var receivedData = contentFrompage[0];

  if (contentFrompage[1] != null) {
    year = contentFrompage[1].toString();
  }
  if (contentFrompage[2] != null) {
    make = contentFrompage[2].toString();
  }
  if (contentFrompage[3] != null) {
    model = contentFrompage[3].toString();
  }
  if (contentFrompage[4] != null) {
    trade = formatNumberWithCommas(contentFrompage[4]).toString();
  }
  if (contentFrompage[5] != null) {
    market = formatNumberWithCommas(contentFrompage[5]).toString();
  }
  $w("#firstLine").text = "" + year + " " + make + " " + model + "";
  $w("#firstLineMobile").text = "" + year + " " + make + " " + model + "";
  if (trade != '' && market != '') {
    $w("#secondLine").text = "$" + trade + " - " + "$" + market;
    $w("#secondLineMobile").text = "$" + trade + " - " + "$" + market;
  } else {
    $w("#secondLine").text = '';
    $w("#secondLineMobile").text = '';
  }

  console.log("recieved data in light box..", receivedData);
  // let isRendered1 = $w("#page1").rendered;

  // let isRendered2 = $w("#lightbox1").rendered;
  // let isRendered3 = $w("#box32").rendered;
  // let isRendered4 = $w("#gallery1").rendered;

  // console.log('Year: ' + contentFrompage[1]);
  // console.log('Make: ' + contentFrompage[1]);
  // console.log('Model: ' + contentFrompage[1]);
  // console.log('Trade: ' + contentFrompage[1]);
  // console.log('Market: ' + contentFrompage[1]);

  // console.log("isrendered 1 ...", isRendered1);
  // console.log("isrendered 1 ...", isRendered2);
  // console.log("isrendered 3 ...", isRendered3);
  // console.log("isrendered 4 ...", isRendered4);
  // let items = $w("#gallery1").items;
  let items = $w("#gallery1").items;
  console.log("Items:")
  console.log(items)
  receivedData.forEach((dataItem, index) => {
    items.push({
      src: dataItem,
      // "description": "Description",
      // "title": "Title"
    });
  });
  // console.log("READY!!!!!: " + $w("#firstLine").text);
  // console.log(year);
  $w("#gallery1").items = items;
});
