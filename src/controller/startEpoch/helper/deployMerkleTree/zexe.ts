
import * as nearAPI from "near-api-js";
import BN from "bn.js";
import { promises as fs } from "fs";
import path from "path";
import { getConfigFileParsingDiagnostics } from "typescript";

const { connect, keyStores, KeyPair, Contract } = nearAPI;

require("dotenv").config();

const myKeyStore = new keyStores.InMemoryKeyStore();

const PRIVATE_KEY = process.env.PRIVATE_KEY! ?? "ed25519:z4VKwa5mr4pWG3wAjtBMdntBMSTgSPUNEXdQRimuErjpCJv6vJQAGRZcCHFS7mBsTjiJA8q2kpEYQziWcohH1Wp";


// creates a public / private key pair using the provided private key
const keyPair = KeyPair.fromString(PRIVATE_KEY);



// setKeyStore(myKeyStore);

function getConfig() {

    return {
        networkId: "testnet",
        keyStore: myKeyStore, // first create a key store 
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://explorer.testnet.near.org",
    };
}


// (contract, "init_with_default_meta", { owner_id: user.accountId, total_supply: supply });

export async function deployZexe(epoch: number) {
    try {

        await myKeyStore.setKey("testnet", "mubashshir.testnet", keyPair);

        const nearConnection = await connect(getConfig());
        const account = await nearConnection.account("mubashshir.testnet");
        const creator = "mubashshir.testnet";
        const contracAccount = `zexetestnet-test-${epoch}.testnet`;
        const amount = new BN("8000000000000000000000000");
        await createAccount(creator, contracAccount, amount);
        const newAccount = await nearConnection.account(contracAccount);
        
       
        const transactionOutcome = await newAccount.deployContract(await fs.readFile(path.join(__dirname + "/contractBuild/zexe.wasm")));
        console.log(transactionOutcome);
        // calling init 
        const contract = new Contract(
            newAccount,
            newAccount.accountId,
            {
                changeMethods: ["init_with_default_meta"],
                viewMethods: []
            }
        );
        // @ts-ignore
        const txn = await contract.init_with_default_meta(
            {
                owner_id: account.accountId , // argument name and value - pass empty object if no args required
                total_supply:"1000000000000000000000000000000000",
              
            },
            "300000000000000", // attached GAS (optional)
            "1000000000000000000000000" // attached deposit in yoctoNEAR (optional)
            
        );

        console.log(txn)


    }
    catch (e) {
        console.log(`Error @ deployMerkleTree: ${e}`);
    }
}

// deployZexe(2)

async function createAccount(creatorAccountId: string, newAccountId: string, amount: BN) {

    const near = await connect({ ...getConfig(), keyStore: myKeyStore });
    const creatorAccount = await near.account(creatorAccountId);

    const keyPair = KeyPair.fromRandom("ed25519");

    let getKey = JSON.parse((await (fs.readFile(__dirname + "/getKey.json"))).toString());
    console.log(getKey);

    if (!getKey[newAccountId]) {
        getKey[newAccountId] = keyPair;
    }
    // let geyKey[`${newAccountId}`] = JSON.stringify(keyPair)
    await fs.writeFile(__dirname + "/getKey.json", JSON.stringify(getKey))

    console.log("keyPair", newAccountId, keyPair);

    const publicKey = keyPair.getPublicKey().toString();

    await myKeyStore.setKey(getConfig().networkId, newAccountId, keyPair);

    return await creatorAccount.functionCall({
        contractId: "testnet",
        methodName: "create_account",
        args: {
            new_account_id: newAccountId,
            new_public_key: publicKey,
        },
        gas: new BN("300000000000000"),
        attachedDeposit: amount,
    });
}


// keyPair merkletreetest-1.testnet KeyPairEd25519 {
//     publicKey: PublicKey {
//       keyType: 0,
//       data: Uint8Array(32) [
//         230,  47, 110, 228,  76, 102, 173,  90,
//         223,  76,  25, 210,  94,  47, 175,  14,
//         129,  76, 117, 176, 200, 226,  42, 156,
//         154, 106,  37, 200, 225,  52,  91,  74
//       ]
//     },
//     secretKey: 'TabWcLMoPieQjDEwiNfasQcy5CwZizuVtdnB2x2uaMihfiRzndE3C51ozxBnxaVYWu2dkNHavR6sVFeRReLBZT7'
//   }