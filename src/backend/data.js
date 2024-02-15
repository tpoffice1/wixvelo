// Hugo - This file is used to do modifications to data after it was retrieved from the database

// Hugo - Adds the thumbnail
export function cars$copart_afterQuery(item, context) {
  const hmtlImgTagStart = '<img class="thumbnail" src="https://';
  const htmlImgTagEnd = '">';
  item.Picture = hmtlImgTagStart + item.Image_Thumbnail + htmlImgTagEnd;
  item.Starred = false;

  return item;
}

// Tim - Gets the fisrt name of the garage sale form
export function GarageSaleForm_afterQuery(item, context) {
    const matches = item.name.match(/\((.*?)\)/); // Using regular expression to match text within parenthesis
    if (matches && matches.length > 1) {
      console.log('Has some content in parenthesis');
      item.name = matches[1]; // Return text within the parenthesis
    } else {
      console.log('Has NO content in parenthesis');
      const nameArray = item.name.split(" ");
      // Return the first word (if available)
      if (nameArray.length > 0) {
        item.name = nameArray[0];
      } else {
        // Return an empty string if no words are found
        return "";
      }
    }
    return item;

  // const nameArray = item.name.split(" ");

  // // Return the first word (if available)
  // if (nameArray.length > 0) {
  //   item.name = nameArray[0];
  // } else {
  //   // Return an empty string if no words are found
  //   return "";
  // }

  // return item;
}
