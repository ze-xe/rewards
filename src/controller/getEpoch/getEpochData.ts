




import path from "path";
import { promises as fs } from "fs";
import { DeploymentData, ErrorResponse, Proof, UserData, epochData } from "../../types";
import { getProof } from "./helper/getProof";
import { ERROR } from "../../error";
import { Request, Response } from "express";










export async function getEpochData(req: Request, res: Response) {

    try {


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

        let epochsDatas: epochData[] = [];

        for (let file of getALLEpochFile) {
            let getData: DeploymentData;

            try {
                getData = JSON.parse((await fs.readFile(path.join(__dirname + `../../../deployments/${file}`))).toString());
            }
            catch (error) {
                console.log("Epoch not found");

                continue;
            }

            const data: epochData = {
                epoch: getData.epoch,
                startDate: getData.startDate,
                endDate: getData.endDate,
                totalVolume: getData.totalVolume,
                totalRewards: getData.totalReward,
                rewardsDecimals: getData.rewardDecimals,
                wightedVolume: getData.weightedVolume,
                merkleContractId: getData.merkleTreeId
            }
            epochsDatas.push(data);
        }

        return res.status(200).send({ status: true, data: epochsDatas });
    }
    catch (e) {
        console.log(`Error @ get Epoch: ${e}`);
        return res.status(500).send({ status: false, error: ERROR.INTERNAL_SERVER_ERROR });

    }
}