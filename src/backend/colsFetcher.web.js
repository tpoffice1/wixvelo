
// File created by someone other than Tim or Hugo as of 2/4/2024

import wixData from "wix-data";

//velo code to fetch data from the copart database
export const getCols =  async () => {
    const carsData = await wixData.query("cars/copart").find();
    const tableData = carsData.items;
    const firstItem = tableData[0];
    const fields = Object.keys(firstItem)
    return fields;
};