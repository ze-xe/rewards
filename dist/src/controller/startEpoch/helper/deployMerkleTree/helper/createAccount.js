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
exports.createAccount = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const nearAPI = __importStar(require("near-api-js"));
const bn_js_1 = __importDefault(require("bn.js"));
const error_1 = require("../../../../../error");
const { KeyPair } = nearAPI;
function createAccount(creatorAccountId, newAccountId, amount, config) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const near = yield nearAPI.connect(Object.assign(Object.assign({}, config), { keyStore: config.keyStore }));
            const creatorAccount = yield near.account(creatorAccountId);
            const keyPair = KeyPair.fromRandom("ed25519");
            let getKey = JSON.parse((yield (fs_1.promises.readFile(path_1.default.join(__dirname + "../../getKey.json")))).toString());
            if (!getKey[newAccountId]) {
                getKey[newAccountId] = keyPair;
            }
            yield fs_1.promises.writeFile(path_1.default.join(__dirname + "../../getKey.json"), JSON.stringify(getKey));
            const publicKey = keyPair.getPublicKey().toString();
            yield config.keyStore.setKey(config.networkId, newAccountId, keyPair);
            return {
                contract: yield creatorAccount.functionCall({
                    contractId: "testnet",
                    methodName: "create_account",
                    args: {
                        new_account_id: newAccountId,
                        new_public_key: publicKey,
                    },
                    gas: new bn_js_1.default("300000000000000"),
                    attachedDeposit: amount,
                }),
                config: config
            };
        }
        catch (error) {
            console.log(`Error @ createAccount: ${error}`);
            return { status: false, statusCode: 500, error: error_1.ERROR.INTERNAL_SERVER_ERROR };
        }
    });
}
exports.createAccount = createAccount;
