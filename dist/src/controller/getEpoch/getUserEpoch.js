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
exports.getEpochUserData = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const getProof_1 = require("./helper/getProof");
const error_1 = require("../../error");
function getEpochUserData(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const epoch = Number(req.params.epoch);
            const userId = req.params.userId;
            if (isNaN(epoch) || !userId) {
                return res.status(400).send({ status: false, error: error_1.ERROR.INPUT_MISSING });
            }
            let getData;
            try {
                getData = JSON.parse((yield fs_1.promises.readFile(path_1.default.join(__dirname + `../../../deployments/epoch-${epoch}.json`))).toString());
            }
            catch (error) {
                console.log("Epoch not found");
                res.status(400).send({ status: false, error: error_1.ERROR.EPOCH_NOT_INITIALIZE });
                return;
            }
            if (!getData["users"][userId]) {
                console.log(`User not found : ${userId}`);
                return res.status(400).send({ status: false, error: error_1.ERROR.USER_NOT_FOUND });
            }
            const userData = getData["users"][userId];
            userData.push(userId);
            const proof = (0, getProof_1.getProof)(getData["users"], userData);
            if ("status" in proof) {
                res.status(400).send({ status: false, error: error_1.ERROR.RE_TRY_AGAIN });
                return;
            }
            const data = {
                spotVolume: userData[0],
                perpVolume: userData[1],
                tokenAlloted: userData[2],
                merkleContractId: getData.merkleTreeId,
                proof: proof,
                epoch: getData.epoch
            };
            return res.status(200).send({ status: true, data: data });
        }
        catch (e) {
            console.log(`Error @ get Epoch: ${e}`);
            return res.status(500).send({ status: false, error: error_1.ERROR.INTERNAL_SERVER_ERROR });
        }
    });
}
exports.getEpochUserData = getEpochUserData;
