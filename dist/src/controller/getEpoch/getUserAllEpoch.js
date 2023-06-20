"use strict";
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
exports.getUserAllEpochData = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const getProof_1 = require("./helper/getProof");
const error_1 = require("../../error");
function getUserAllEpochData(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            let getALLEpochFile;
            try {
                getALLEpochFile = (yield fs_1.promises.readdir(path_1.default.join(__dirname + `../../../deployments`), { withFileTypes: true }))
                    .filter(item => !item.isDirectory())
                    .map(item => item.name);
            }
            catch (error) {
                console.log(`Error while readind dir: ${error}`);
                return res.status(500).send({ status: false, error: error_1.ERROR.INTERNAL_SERVER_ERROR });
            }
            let userDatas = [];
            for (let file of getALLEpochFile) {
                let getData;
                try {
                    getData = JSON.parse((yield fs_1.promises.readFile(path_1.default.join(__dirname + `../../../deployments/${file}`))).toString());
                }
                catch (error) {
                    console.log("Epoch not found");
                    continue;
                }
                if (!getData["users"][userId]) {
                    continue;
                }
                const userData = getData["users"][userId];
                userData.push(userId);
                const proof = (0, getProof_1.getProof)(getData["users"], userData);
                if ("status" in proof) {
                    continue;
                }
                const data = {
                    spotVolume: userData[0],
                    perpVolume: userData[1],
                    tokenAlloted: userData[2],
                    merkleContractId: getData.merkleTreeId,
                    proof: proof,
                    epoch: getData.epoch
                };
                userDatas.push(data);
            }
            return res.status(200).send({ status: true, data: userDatas });
        }
        catch (e) {
            console.log(`Error @ get Epoch: ${e}`);
            return res.status(500).send({ status: false, error: error_1.ERROR.INTERNAL_SERVER_ERROR });
        }
    });
}
exports.getUserAllEpochData = getUserAllEpochData;
