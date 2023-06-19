
import { promises as fs } from "fs";
import path from "path";
import * as nearAPI from "near-api-js";
import BN from "bn.js";
import { ConfigConnecton, ErrorResponse } from "../../../../../types";
import { ERROR } from "../../../../../error";
const { KeyPair } = nearAPI;




export async function createAccount(creatorAccountId: string, newAccountId: string, amount: BN, config: ConfigConnecton):
Promise<{
    contract: nearAPI.providers.FinalExecutionOutcome;
    config: ConfigConnecton;
} | ErrorResponse> {
    try {
        const near = await nearAPI.connect({ ...config, keyStore: config.keyStore });
        const creatorAccount = await near.account(creatorAccountId);

        const keyPair = KeyPair.fromRandom("ed25519");

        let getKey = JSON.parse((await (fs.readFile(path.join(__dirname + "../../getKey.json")))).toString());
        
        if (!getKey[newAccountId]) {
            getKey[newAccountId] = keyPair;
        }
        await fs.writeFile(path.join(__dirname + "../../getKey.json"), JSON.stringify(getKey))

        const publicKey = keyPair.getPublicKey().toString();

        await config.keyStore.setKey(config.networkId, newAccountId, keyPair);

        return {
            contract: await creatorAccount.functionCall({
                contractId: "testnet",
                methodName: "create_account",
                args: {
                    new_account_id: newAccountId,
                    new_public_key: publicKey,
                },
                gas: new BN("300000000000000"),
                attachedDeposit: amount,
            }),
            config: config
        };
    }
    catch (error) {
        console.log(`Error @ createAccount: ${error}`);
        return {status: false, statusCode: 500, error: ERROR.INTERNAL_SERVER_ERROR}
    }

}