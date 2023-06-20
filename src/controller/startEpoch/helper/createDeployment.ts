import { error } from "console";
import { DeploymentData, ErrorResponse, UserDataStorage } from "../../../types";
import { promises as fs } from "fs";
import path from "path";
import { ERROR } from "../../../error";




export async function createDeployment(dep: DeploymentData): Promise<boolean | ErrorResponse> {

    const data = {
        epoch: dep.epoch,
        root: dep.root,
        timestamp: Date().toLocaleString(),
        merkleTreeId: dep.merkleTreeId,
        weightedVolume: dep.weightedVolume,
        startDate: dep.startDate,
        endDate: dep.endDate,
        totalVolume: dep.totalVolume,
        totalReward: dep.totalReward,
        rewardDecimals: 24,
        users: dep.users
    }
    try {
        await fs.writeFile(path.join(__dirname + `../../../../deployments/epoch-${dep.epoch}.json`), JSON.stringify(data));
    }
    catch (e) {
        console.log(`Error @ handleMerkleTree in fs : ${e}`);
        return { status: false, statusCode: 500, error: ERROR.INTERNAL_SERVER_ERROR };
    }
    return true
}