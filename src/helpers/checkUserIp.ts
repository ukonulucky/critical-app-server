import { Response, NextFunction } from "express"
import axios from "axios"
import { IpAddressInfo } from "../appTypes/types";





export const getUserIpFunc = async (ip:string): Promise<IpAddressInfo> => { 
    try {
      const response = await axios.get(`http://ip-api.com/json/${ip}`);
           const ipdata = response.data;
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