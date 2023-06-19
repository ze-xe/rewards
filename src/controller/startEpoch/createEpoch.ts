import { PocketProvider, parseEther } from "ethers";
import { DeploymentData, ErrorResponse, StartEndDate, UserDataStorage } from "../../types";
import { calculateUserToken } from "./helper/calculateUserToken";
import { createMerkleTree } from "./helper/handleMerkleTree";
import { createDeployment } from "./helper/createDeployment";
import { getStartEndDates } from "./helper/handleDate";
import Big from "big.js";
import { Request, Response, request, response } from "express";
import { ERROR } from "../../error";
import { deployMerkleTree } from "./helper/deployMerkleTree/deployMerkleTree";
import { isEpochCreated } from "./helper/isEpochCreated";











export async function createEpoch(req: Request, res: Response) {
    try {

        const epoch = req.body.epoch;
        const tokens = req.body.tokens;  // tokens in the form of near;
        const rewardDecimals = 24;
        const secret = req.body.secret;
        const zexe = process.env.ZEXE_TOKEN_ID;
        const _secret = process.env.SECRET;

        if (!zexe) {
            return res.status(400).send({ status: false, error: ERROR.ZEXE_TOKEN_ID_NOT_VALID });
        }

        if(!_secret) {
            return res.status(400).send({ status: false, error: ERROR._SECRET_NOT_FOUND_IN_ENV });
        }

        if(isNaN(epoch) || !tokens || !secret){
            return res.status(400).send({ status: false, error: ERROR.INPUT_MISSING });
        }

        if(secret !== _secret){
            return res.status(400).send({ status: false, error: ERROR.SECRET_NOT_MATCHED });
        }

        // check is epoch is already generated;
        if(await isEpochCreated(epoch)){
            return res.status(400).send({ status: false, error: ERROR.EPOCH_IS_ALREADY_CREATED });
        }

        const dates: StartEndDate | ErrorResponse = getStartEndDates(epoch);

        if ('status' in dates && 'statusCode' in dates) {
            return res.status(dates.statusCode).send({ status: dates.status, error: dates.error });
        }

        const { startDate, endDate } = dates;

        const userTokens: { userTokenData: UserDataStorage, totalVolume: string, weightedVolume: string } | ErrorResponse = await calculateUserToken(startDate, endDate, tokens);

        if ('status' in userTokens && 'statusCode' in userTokens) {
            return res.status(userTokens.statusCode).send({ status: userTokens.status, error: userTokens.error });
        };

        const root: string | ErrorResponse = createMerkleTree(userTokens.userTokenData);

        if (typeof root == 'object' && 'status' in root && 'statusCode' in root) {
            return res.status(root.statusCode).send({ status: root.status, error: root.error });
        }

        const merkleTree: string | ErrorResponse = await deployMerkleTree(epoch, root, zexe, tokens);

        if (typeof merkleTree == 'object' && 'status' in merkleTree && 'statusCode' in merkleTree) {
            return res.status(merkleTree.statusCode).send({ status: merkleTree.status, error: merkleTree.error });
        }


        const createDeployement = await createDeployment({
            epoch,
            startDate,
            endDate,
            users: userTokens.userTokenData,
            totalVolume: userTokens.totalVolume,
            totalReward: parseEther(Big(tokens).times(1e6).toString()).toString(),
            rewardDecimals,
            root,
            merkleTreeId:merkleTree,
            weightedVolume: userTokens.weightedVolume 
        });

        if (typeof createDeployement == 'object' && 'status' in createDeployement && 'statusCode' in createDeployement) {
            return res.status(createDeployement.statusCode).send({ status: createDeployement.status, error: createDeployement.error });
        }

        console.log(`epoch: ${epoch}, root: ${root}`);
        const data = {
            epoch : epoch,
            merkleTreeContractId: merkleTree
        }
        return res.status(201).send({status: true, data: data})

    }
    catch (error) {
        console.log(`Error @ startEpoch: ${error}`);
    }
}