import axios, { Axios, AxiosError } from "axios";
import Big from "big.js"
import { ErrorResponse, User, UserDataStorage } from "../../../types";
import { parseEther } from "ethers";
import { ERROR } from "../../../error";

require("dotenv").config();
export async function calculateUserToken(startDate: string, endDate: string, token: string)
    : Promise<{ userTokenData: UserDataStorage, totalVolume: string, weightedVolume: string } | ErrorResponse> {
    try {

        const userMap: Map<string, any> = new Map();
        let userData: User[] = [];

        try {
            userData = (await axios.get(`https://api.zexe.io/orderly/user_data?start_date=${startDate}&end_date=${endDate}&broker_id=zexe_dex`)).data.data;
        }
        catch (e) {
            const error = e as AxiosError;
            console.log(error.response?.data);
            return { status: false, statusCode: error.response?.status ?? 500, error: ERROR.ERROR_FROM_ORDERLY }

        }

        let totalVolume: string = "0";
        let weightedVolume: string = "0";
        const perpVsSpotFrac = 0.6 //Number(process.env.PERP_VS_SPOT_FRAC);

        if (isNaN(perpVsSpotFrac)) {

            return { status: false, statusCode: 400, error: ERROR.PERP_VS_SPOT_FRAC_NOT_FOUND }
        }
        const userTokenData: UserDataStorage = {}
        for (let user of userData) {

            if (userMap.has(user.account_id)) {

                const userSpot = Big(userMap.get(user.account_id)[0]).plus(user.spot_volume).toString();
                const userPerp = Big(userMap.get(user.account_id)[1]).plus(user.perp_volume).toString();
                userMap.set(user.account_id, [userSpot, userPerp]);
            }
            else if (!userMap.has(user.account_id)) {

                userMap
                    .set(user.account_id,
                        [user.spot_volume, user.perp_volume]
                    );
            }

            totalVolume = Big(totalVolume).plus(user.spot_volume)
                .plus(user.perp_volume).toString();

            weightedVolume = Big(weightedVolume).plus(user.spot_volume).plus(Big(user.perp_volume).times(perpVsSpotFrac)).toString();

        }

        const usersTokens: [string, string[]][] = [...userMap.entries()]

        let totalAllotedToken = "0"
        usersTokens.forEach((user: [string, string[]], index: number) => {

            const userPercentage = Big(user[1][0]).plus(Big(user[1][1])
                .times(perpVsSpotFrac)).div(weightedVolume);

            // converting in into 1e24 , 18 decimals by parse ether
            const tokenAlloted =
                parseEther
                    (Big(token).times(userPercentage).times(1e6).toString())
                    .toString();

            userTokenData[`${user[0]}`] = [user[1][0], user[1][1], tokenAlloted];

            totalAllotedToken = Big(totalAllotedToken).plus(tokenAlloted).toString();
        })

        console.log("token not alloted", +token * 1e24 - +totalAllotedToken);
       
        return { userTokenData, totalVolume, weightedVolume }
    }
    catch (error) {
        console.log(`Error @ calculateUserToken : ${error}`);
        return { status: false, statusCode: 500, error: ERROR.INTERNAL_SERVER_ERROR }
    }
}
