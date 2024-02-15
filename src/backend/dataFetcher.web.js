// Created by someone other than Tim or Hugo

import {Permissions, webMethod} from "wix-web-module";
import { getJSON } from 'wix-fetch';

// GET call using getJSON
// Used to retrieve the list of images of a particular car

export const getGreetings = webMethod(Permissions.Anyone, async (cellDataHttps) => {
  const response = await getJSON(cellDataHttps);
  return response;
});