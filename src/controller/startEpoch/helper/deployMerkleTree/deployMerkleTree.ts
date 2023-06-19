
import BN from "bn.js";
import { promises as fs } from "fs";
import path from "path";
import { setKeyStore } from "./helper/setKeyStore";
import * as nearAPI from "near-api-js";
import { createAccount } from "./helper/createAccount";
import { parseEther } from "ethers";
import Big from "big.js";
import { ConfigConnecton, ErrorResponse } from "../../../../types";
import { ERROR } from "../../../../error";


const { connect, keyStores, Contract } = nearAPI;

require("dotenv").config();

let myKeyStore = new keyStores.InMemoryKeyStore();


async function getConfig() {

    const keyStore = await setKeyStore(myKeyStore);
    if (!keyStore) {
        console.log(`Error: keyStor not set`);
        return null;
    }
    return {
        networkId: "testnet",
        keyStore: keyStore,
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://explorer.testnet.near.org",
    };
}

export async function deployMerkleTree(epoch: number, root: string, zexe: string, tokens: string):
    Promise<string | ErrorResponse> {
    try {

        tokens = parseEther(Big(tokens).times(1e6).toString()).toString();

        const contracAccount = `merkletreetest-${epoch}-${Date.now()}.testnet`;

        const config = await getConfig();
        if (!config) {
            return { status: false, statusCode: 500, error: ERROR.KEY_STORE_NOT_VALID };
        }

        let nearConnection = await connect(config);

        const creator = process.env.CREATOR;
        
        if(! creator) {
            return {status: false, statusCode: 400, error: ERROR.CREATOR_NOT_VALID}
        }

        const admin = await nearConnection.account(creator);
        const amount = new BN("8000000000000000000000000"); //10 Near

        const createAccountData: ErrorResponse | {
            contract: nearAPI.providers.FinalExecutionOutcome;
            config: ConfigConnecton;
        } = await createAccount(creator, contracAccount, amount, config);

        if ("satus" in createAccountData && "error" in createAccountData) {
            console.log(`Error new account not created`);
            return { status: false, statusCode: createAccountData.statusCode, error: createAccountData.error };;
        }
        console.log(`New Account created for MerkleTree`);
        // nearConnection = await connect(createAccountData.config);
        const newAccount = await nearConnection.account(contracAccount);

        await newAccount
            .deployContract(await fs.readFile(
                path.join(__dirname + "/contractBuild/merkle_proof.wasm")
            ));

        console.log(`MerkleTree Deployed`, contracAccount)

        // calling init 
        const merkleTree = new Contract(
            newAccount,
            newAccount.accountId,
            {
                changeMethods: ["init"],
                viewMethods: []
            }
        );
        //@ts-ignore
        const merkleTreeInit = await merkleTree.init(
            {
                args: {
                    root: root,
                    zexe: zexe,
                    epoch: epoch
                },
            }
        );
        console.log("MerkleTree init", merkleTreeInit);

        // for storage;
        const zexeStorage = new Contract(
            newAccount,
            zexe,
            {
                changeMethods: ["storage_deposit"],
                viewMethods: []
            }
        );

        //@ts-ignore
        const txn = await zexeStorage.storage_deposit(
            {
                args: {
                    account_id: newAccount.accountId,
                    registration_only: true
                },
                gas: "300000000000000",
                amount: "2000000000000000000000"
            }

        );

        console.log(`create storage for MerkleTree in zexe`, txn);

        const zexeTranfer = new Contract(
            admin,
            zexe,
            {
                changeMethods: ["ft_transfer"],
                viewMethods: []
            }
        );

        //@ts-ignore
        const txn2 = await zexeTranfer.ft_transfer(
            {
                args: {
                    receiver_id: newAccount.accountId,
                    amount: tokens
                },
                gas: "300000000000000",
                amount: "1" // attached deposit in 1 yoctoNEAR  required 
            }

        );
        console.log(`zexe token transfer successfully`)

        return newAccount.accountId;
    }
    catch (e) {
        console.log(`Error @ deployMerkleTree: ${e}`);
        return { status: false, statusCode: 500, error: ERROR.INTERNAL_SERVER_ERROR };
    }
}

// deployMerkleTree(3, "0x42cf2b1f71a6aa3cada941e26cfbe9523779297e87f6cda939f38b076202fc6c", "zexetestnet-test-2.testnet", "1000000")

