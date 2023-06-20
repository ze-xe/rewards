"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProof = void 0;
const keccak256_1 = __importDefault(require("keccak256"));
const merkleTree_1 = require("../../../merkleTree");
const error_1 = require("../../../error");
function getProof(usersDatas, userData) {
    try {
        const leaves = Object.keys(usersDatas)
            .map((userData) => {
            return "0x" + (0, keccak256_1.default)(`${userData}-${usersDatas[userData][2]}`).toString("hex");
        });
        const merkleTree = new merkleTree_1.MerkleTree(leaves);
        const userHash = "0x" + (0, keccak256_1.default)(`${userData[3]}-${userData[2]}`).toString("hex");
        const proof = merkleTree.getProof(userHash, leaves);
        return proof;
    }
    catch (error) {
        console.log(`Error @ getProof: ${error}`);
        return { status: false, statusCode: 500, error: error_1.ERROR.INTERNAL_SERVER_ERROR };
    }
}
exports.getProof = getProof;
