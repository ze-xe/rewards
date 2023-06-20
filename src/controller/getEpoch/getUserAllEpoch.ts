




import path from "path";
import { promises as fs } from "fs";
import { DeploymentData, ErrorResponse, Proof, UserData } from "../../types";
import { getProof } from "./helper/getProof";
import { ERROR } from "../../error";
import { Request, Response } from "express";










export async function getUserAllEpochData(req: Request, res: Response) {

    try {


        const userId = req.params.userId;

        let getALLEpochFile: string[];

        try {
            getALLEpochFile = (await fs.readdir(path.join(__dirname + `../../../deployments`), { withFileTypes: true }))
                .filter(item => !item.isDirectory())
                .map(item => item.name)
        }
        catch (error) {
            console.log(`Error while readind dir: ${error}`);
            return res.status(500).send({ status: false, error: ERROR.INTERNAL_SERVER_ERROR });
        }

        let userDatas: UserData[] = [];

        for (let file of getALLEpochFile) {
            let getData: DeploymentData;

            try {
                getData = JSON.parse((await fs.readFile(path.join(__dirname + `../../../deployments/${file}`))).toString());
            }
            catch (error) {
                console.log("Epoch not found");

                continue;
            }

            if (!getData["users"][userId]) {
                continue;

            }
            const userData = getData["users"][userId];
            userData.push(userId);

            const proof: string[] | ErrorResponse = getProof(getData["users"], userData);
            if ("status" in proof) {
                continue;
            }
            const data: UserData = {
                spotVolume: userData[0],
                perpVolume: userData[1],
                tokenAlloted: userData[2],
                merkleContractId: getData.merkleTreeId,
                proof: proof,
                epoch: getData.epoch
            }
            userDatas.push(data);
        }

        return res.status(200).send({ status: true, data: userDatas });
    }
    catch (e) {
        console.log(`Error @ get Epoch: ${e}`);
        return res.status(500).send({ status: false, error: ERROR.INTERNAL_SERVER_ERROR });

    }
}