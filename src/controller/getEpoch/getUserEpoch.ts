import path from "path";
import { promises as fs } from "fs";
import { DeploymentData, ErrorResponse, Proof, UserData } from "../../types";
import { getProof } from "./helper/getProof";
import { ERROR } from "../../error";
import { Request, Response } from "express";












export async function getEpochUserData(req: Request, res: Response) {

    try {

        const epoch = Number(req.params.epoch);
        const userId = req.params.userId;

        if(isNaN(epoch) || !userId){
            return  res.status(400).send({ status: false, error: ERROR.INPUT_MISSING })
        }

        let getData: DeploymentData;
        try {
            getData = JSON.parse((await fs.readFile(path.join(__dirname + `../../../../deployments/epoch-${epoch}.json`))).toString());
        }
        catch (error) {
            console.log("Epoch not found");
            res.status(400).send({ status: false, error: ERROR.EPOCH_NOT_INITIALIZE })
            return
        }

        if (!getData["users"][userId]) {
            console.log(`User not found : ${userId}`);
            return res.status(400).send({ status: false, error: ERROR.USER_NOT_FOUND })
        }
        const userData = getData["users"][userId];
        userData.push(userId);

        const proof: string[] | ErrorResponse = getProof(getData["users"], userData);
        if ("status" in proof) {
            res.status(400).send({ status: false, error: ERROR.RE_TRY_AGAIN });
            return
        }
        
        const data : UserData= {
            spotVolume: userData[0],
            perpVolume: userData[1],
            tokenAlloted: userData[2],
            merkleContractId: getData.merkleTreeId,
            proof: proof,
            epoch: getData.epoch
        }

        return res.status(200).send({ status: true, data: data });
    }
    catch (e) {
        console.log(`Error @ get Epoch: ${e}`);
        return res.status(500).send({ status: false, error: ERROR.INTERNAL_SERVER_ERROR });

    }
}