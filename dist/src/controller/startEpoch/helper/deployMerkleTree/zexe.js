"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployZexe = void 0;
const nearAPI = __importStar(require("near-api-js"));
const bn_js_1 = __importDefault(require("bn.js"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const { connect, keyStores, KeyPair, Contract } = nearAPI;
require("dotenv").config();
const myKeyStore = new keyStores.InMemoryKeyStore();
const PRIVATE_KEY = (_a = process.env.PRIVATE_KEY) !== null && _a !== void 0 ? _a : "ed25519:z4VKwa5mr4pWG3wAjtBMdntBMSTgSPUNEXdQRimuErjpCJv6vJQAGRZcCHFS7mBsTjiJA8q2kpEYQziWcohH1Wp";
// creates a public / private key pair using the provided private key
const keyPair = KeyPair.fromString(PRIVATE_KEY);
// setKeyStore(myKeyStore);
function getConfig() {
    return {
        networkId: "testnet",
        keyStore: myKeyStore,
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://explorer.testnet.near.org",
    };
}
// (contract, "init_with_default_meta", { owner_id: user.accountId, total_supply: supply });
function deployZexe(epoch) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield myKeyStore.setKey("testnet", "mubashshir.testnet", keyPair);
            const nearConnection = yield connect(getConfig());
            const account = yield nearConnection.account("mubashshir.testnet");
            const creator = "mubashshir.testnet";
            const contracAccount = `zexetestnet-test-${epoch}.testnet`;
            const amount = new bn_js_1.default("8000000000000000000000000");
            yield createAccount(creator, contracAccount, amount);
            const newAccount = yield nearConnection.account(contracAccount);
            const transactionOutcome = yield newAccount.deployContract(yield fs_1.promises.readFile(path_1.default.join(__dirname + "/contractBuild/zexe.wasm")));
            console.log(transactionOutcome);
            // calling init 
            const contract = new Contract(newAccount, newAccount.accountId, {
                changeMethods: ["init_with_default_meta"],
                viewMethods: []
            });
            // @ts-ignore
            const txn = yield contract.init_with_default_meta({
                owner_id: account.accountId,
                total_supply: "1000000000000000000000000000000000",
            }, "300000000000000", // attached GAS (optional)
            "1000000000000000000000000" // attached deposit in yoctoNEAR (optional)
            );
            console.log(txn);
        }
        catch (e) {
            console.log(`Error @ deployMerkleTree: ${e}`);
        }
    });
}
exports.deployZexe = deployZexe;
// deployZexe(2)
function createAccount(creatorAccountId, newAccountId, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const near = yield connect(Object.assign(Object.assign({}, getConfig()), { keyStore: myKeyStore }));
        const creatorAccount = yield near.account(creatorAccountId);
        const keyPair = KeyPair.fromRandom("ed25519");
        let getKey = JSON.parse((yield (fs_1.promises.readFile(__dirname + "/getKey.json"))).toString());
        console.log(getKey);
        if (!getKey[newAccountId]) {
            getKey[newAccountId] = keyPair;
        }
        // let geyKey[`${newAccountId}`] = JSON.stringify(keyPair)
        yield fs_1.promises.writeFile(__dirname + "/getKey.json", JSON.stringify(getKey));
        console.log("keyPair", newAccountId, keyPair);
        const publicKey = keyPair.getPublicKey().toString();
        yield myKeyStore.setKey(getConfig().networkId, newAccountId, keyPair);
        return yield creatorAccount.functionCall({
            contractId: "testnet",
            methodName: "create_account",
            args: {
                new_account_id: newAccountId,
                new_public_key: publicKey,
            },
            gas: new bn_js_1.default("300000000000000"),
            attachedDeposit: amount,
        });
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
