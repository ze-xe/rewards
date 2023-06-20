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
exports.setKeyStore = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const nearAPI = __importStar(require("near-api-js"));
const { KeyPair } = nearAPI;
function setKeyStore(keyStore) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // add creator secret from env if not present;
            const creator = process.env.CREATOR;
            const privateKey = process.env.PRIVATE_KEY;
            if (!creator || !privateKey) {
                console.log(`creator or private key is missing at env`);
                return null;
            }
            let getKey = JSON.parse((yield (fs_1.promises.readFile(path_1.default.join(__dirname + "../../getKey.json")))).toString());
            let keys = Object.keys(getKey);
            if (!getKey[creator]) {
                const keyPair = KeyPair.fromString(privateKey);
                keyStore.setKey("testnet", creator, keyPair);
            }
            for (let key of keys) {
                let secret = `ed25519:${getKey[key]["secretKey"]}`;
                const keyPair = KeyPair.fromString(secret);
                keyStore.setKey("testnet", key, keyPair);
            }
            return keyStore;
        }
        catch (error) {
            console.log(`Error @ setKeyStore: ${error}`);
            return null;
        }
    });
}
exports.setKeyStore = setKeyStore;
;
