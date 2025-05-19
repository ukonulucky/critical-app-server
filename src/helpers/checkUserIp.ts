import { Response, NextFunction } from "express"
import axios from "axios"
import { IpAddressInfo } from "../appTypes/types";





export const getUserIpFunc = async (ip:string): Promise<IpAddressInfo> => { 
    try {
        console.log("ipInput", ip)
      const response = await axios.get(`http://ip-api.com/json/${ip}`);
        const ipdata = response.data;
        console.log("ipdata", ipdata)
        if (ipdata.status === "fail") { 
            return {
                time: Date.now().toString(),
                ipAddress: "",
                location: {
                    country: "",
                    regionName: ""
                   },
                status: ipdata.status
              }
        }
           return {
            time: Date.now().toString(),
            ipAddress: ipdata.Ip,
            location: {
                country: ipdata.location.country,
                regionName: ipdata.location.regionName
               },
            status: ipdata.location.status
          }
      
    
    } catch (error: any) {
        throw new Error(error.message)
    }


}