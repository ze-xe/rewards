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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployMerkleTree = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const setKeyStore_1 = require("./helper/setKeyStore");
const nearAPI = __importStar(require("near-api-js"));
const createAccount_1 = require("./helper/createAccount");
const ethers_1 = require("ethers");
const big_js_1 = __importDefault(require("big.js"));
const error_1 = require("../../../../error");
const { connect, keyStores, Contract } = nearAPI;
require("dotenv").config();
let myKeyStore = new keyStores.InMemoryKeyStore();
function getConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        const keyStore = yield (0, setKeyStore_1.setKeyStore)(myKeyStore);
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
    });
}
function deployMerkleTree(epoch, root, zexe, tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tokens = (0, ethers_1.parseEther)((0, big_js_1.default)(tokens).times(1e6).toString()).toString();
            const contracAccount = `merkletreetest-${epoch}-${Date.now()}.testnet`;
            const config = yield getConfig();
            if (!config) {
                return { status: false, statusCode: 500, error: error_1.ERROR.KEY_STORE_NOT_VALID };
            }
            let nearConnection = yield connect(config);
            const creator = process.env.CREATOR;
            if (!creator) {
                return { status: false, statusCode: 400, error: error_1.ERROR.CREATOR_NOT_VALID };
            }
            const admin = yield nearConnection.account(creator);
            const amount = new bn_js_1.default("8000000000000000000000000"); //10 Near
            const createAccountData = yield (0, createAccount_1.createAccount)(creator, contracAccount, amount, config);
            if ("satus" in createAccountData && "error" in createAccountData) {
                console.log(`Error new account not created`);
                return { status: false, statusCode: createAccountData.statusCode, error: createAccountData.error };
                ;
            }
            console.log(`New Account created for MerkleTree`);
            // nearConnection = await connect(createAccountData.config);
            const newAccount = yield nearConnection.account(contracAccount);
            yield newAccount
                .deployContract(yield fs_1.promises.readFile(path_1.default.join(__dirname + "/contractBuild/merkle_proof.wasm")));
            console.log(`MerkleTree Deployed`, contracAccount);
            // calling init 
            const merkleTree = new Contract(newAccount, newAccount.accountId, {
                changeMethods: ["init"],
                viewMethods: []
            });
            //@ts-ignore
            const merkleTreeInit = yield merkleTree.init({
                args: {
                    root: root,
                    zexe: zexe,
                    epoch: epoch
                },
            });
            console.log("MerkleTree init", merkleTreeInit);
            // for storage;
            const zexeStorage = new Contract(newAccount, zexe, {
                changeMethods: ["storage_deposit"],
                viewMethods: []
            });
            //@ts-ignore
            const txn = yield zexeStorage.storage_deposit({
                args: {
                    account_id: newAccount.accountId,
                    registration_only: true
                },
                gas: "300000000000000",
                amount: "2000000000000000000000"
            });
            console.log(`create storage for MerkleTree in zexe`, txn);
            const zexeTranfer = new Contract(admin, zexe, {
                changeMethods: ["ft_transfer"],
                viewMethods: []
            });
            //@ts-ignore
            const txn2 = yield zexeTranfer.ft_transfer({
                args: {
                    receiver_id: newAccount.accountId,
                    amount: tokens
                },
                gas: "300000000000000",
                amount: "1" // attached deposit in 1 yoctoNEAR  required 
            });
            console.log(`zexe token transfer successfully`);
            return newAccount.accountId;
        }
        catch (e) {
            console.log(`Error @ deployMerkleTree: ${e}`);
            return { status: false, statusCode: 500, error: error_1.ERROR.INTERNAL_SERVER_ERROR };
        }
    });
}
exports.deployMerkleTree = deployMerkleTree;
// deployMerkleTree(3, "0x42cf2b1f71a6aa3cada941e26cfbe9523779297e87f6cda939f38b076202fc6c", "zexetestnet-test-2.testnet", "1000000")
