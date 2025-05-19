import { IpAddressInfo } from "../appTypes/types";
import axios from "axios"

export const getUserIpFunc = async (ip: string): Promise<IpAddressInfo> => {
  try {
    console.log("ipInput", ip);
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    const ipdata = response.data;

    console.log("ipdata", ipdata);

    if (ipdata.status === "fail") {
      return {
        time: Date.now().toString(),
        ipAddress: "",
        location: {
          country: "",
          regionName: ""
        },
        status: ipdata.status
      };
    }

    return {
      time: Date.now().toString(),
      ipAddress: ipdata.query, // correct field for IP
      location: {
        country: ipdata.country,
        regionName: ipdata.regionName
      },
      status: ipdata.status
    };

  } catch (error: any) {
    throw new Error(error.message);
  }
};
