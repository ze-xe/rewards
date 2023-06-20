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
exports.createDeployment = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const error_1 = require("../../../error");
function createDeployment(dep) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = {
            epoch: dep.epoch,
            root: dep.root,
            timestamp: Date().toLocaleString(),
            merkleTreeId: dep.merkleTreeId,
            weightedVolume: dep.weightedVolume,
            startDate: dep.startDate,
            endDate: dep.endDate,
            totalVolume: dep.totalVolume,
            totalReward: dep.totalReward,
            rewardDecimals: 24,
            users: dep.users
        };
        try {
            yield fs_1.promises.writeFile(path_1.default.join(__dirname + `../../../../deployments/epoch-${dep.epoch}.json`), JSON.stringify(data));
        }
        catch (e) {
            console.log(`Error @ handleMerkleTree in fs : ${e}`);
            return { status: false, statusCode: 500, error: error_1.ERROR.INTERNAL_SERVER_ERROR };
        }
        return true;
    });
}
exports.createDeployment = createDeployment;
