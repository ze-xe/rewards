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
exports.createEpoch = void 0;
const ethers_1 = require("ethers");
const calculateUserToken_1 = require("./helper/calculateUserToken");
const handleMerkleTree_1 = require("./helper/handleMerkleTree");
const createDeployment_1 = require("./helper/createDeployment");
const handleDate_1 = require("./helper/handleDate");
const big_js_1 = __importDefault(require("big.js"));
const error_1 = require("../../error");
const deployMerkleTree_1 = require("./helper/deployMerkleTree/deployMerkleTree");
const isEpochCreated_1 = require("./helper/isEpochCreated");
function createEpoch(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const epoch = req.body.epoch;
            const tokens = req.body.tokens; // tokens in the form of near;
            const rewardDecimals = 24;
            const secret = req.body.secret;
            const zexe = process.env.ZEXE_TOKEN_ID;
            const _secret = process.env.SECRET;
            if (!zexe) {
                return res.status(400).send({ status: false, error: error_1.ERROR.ZEXE_TOKEN_ID_NOT_VALID });
            }
            if (!_secret) {
                return res.status(400).send({ status: false, error: error_1.ERROR._SECRET_NOT_FOUND_IN_ENV });
            }
            if (isNaN(epoch) || !tokens || !secret) {
                return res.status(400).send({ status: false, error: error_1.ERROR.INPUT_MISSING });
            }
            if (secret !== _secret) {
                return res.status(400).send({ status: false, error: error_1.ERROR.SECRET_NOT_MATCHED });
            }
            // check is epoch is already generated;
            if (yield (0, isEpochCreated_1.isEpochCreated)(epoch)) {
                return res.status(400).send({ status: false, error: error_1.ERROR.EPOCH_IS_ALREADY_CREATED });
            }
            const dates = (0, handleDate_1.getStartEndDates)(epoch);
            if ('status' in dates && 'statusCode' in dates) {
                return res.status(dates.statusCode).send({ status: dates.status, error: dates.error });
            }
            const { startDate, endDate } = dates;
            const userTokens = yield (0, calculateUserToken_1.calculateUserToken)(startDate, endDate, tokens);
            if ('status' in userTokens && 'statusCode' in userTokens) {
                return res.status(userTokens.statusCode).send({ status: userTokens.status, error: userTokens.error });
            }
            ;
            const root = (0, handleMerkleTree_1.createMerkleTree)(userTokens.userTokenData);
            if (typeof root == 'object' && 'status' in root && 'statusCode' in root) {
                return res.status(root.statusCode).send({ status: root.status, error: root.error });
            }
            const merkleTree = yield (0, deployMerkleTree_1.deployMerkleTree)(epoch, root, zexe, tokens);
            if (typeof merkleTree == 'object' && 'status' in merkleTree && 'statusCode' in merkleTree) {
                return res.status(merkleTree.statusCode).send({ status: merkleTree.status, error: merkleTree.error });
            }
            const createDeployement = yield (0, createDeployment_1.createDeployment)({
                epoch,
                startDate,
                endDate,
                users: userTokens.userTokenData,
                totalVolume: userTokens.totalVolume,
                totalReward: (0, ethers_1.parseEther)((0, big_js_1.default)(tokens).times(1e6).toString()).toString(),
                rewardDecimals,
                root,
                merkleTreeId: merkleTree,
                weightedVolume: userTokens.weightedVolume
            });
            if (typeof createDeployement == 'object' && 'status' in createDeployement && 'statusCode' in createDeployement) {
                return res.status(createDeployement.statusCode).send({ status: createDeployement.status, error: createDeployement.error });
            }
            console.log(`epoch: ${epoch}, root: ${root}`);
            const data = {
                epoch: epoch,
                merkleTreeContractId: merkleTree
            };
            return res.status(201).send({ status: true, data: data });
        }
        catch (error) {
            console.log(`Error @ startEpoch: ${error}`);
        }
    });
}
exports.createEpoch = createEpoch;
