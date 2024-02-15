import wixData from "wix-data";
// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/hello-world

$w.onReady(function () {
  // Write your JavaScript here

  $w("#wixForms2").onWixFormSubmit((event) => {
    console.log(event);
    // console.log(event.fields[8].fieldValue);
    let name = event.fields[3].fieldValue;
    let title = event.fields[0].fieldValue;
    let description = event.fields[1].fieldValue;
    let phone = event.fields[2].fieldValue;
    let image = event.fields[5].fieldValue[0].url;
    let email = event.fields[4].fieldValue;
    console.log('ImageURL: ');
    console.log(image);
    let toInsert = {
        'name': name,
        'title': title,
        'description': description,
        'phone': phone,
        'email': email,
        'image': image
    }
    console.log('To Insert:');
    console.log(toInsert);
    wixData.insert('GarageSaleForm', toInsert)
        .then((item) => {
            console.log('A form was submitted. Thank you ' + name);
            console.log(item)
        })
        .catch((err) => {
            console.log(err);
        })
});


  // To select an element by ID use: $w('#elementID')

  // Click 'Preview' to run your code
});
