import { timeStamp } from "console";
import moment from "moment";

export const timeFormaterFunc = (): string => {
    return moment(Date.now()).format("MMMM Do, h:mm A"); // e.g., "May 19th, 2:07 PM"
  };