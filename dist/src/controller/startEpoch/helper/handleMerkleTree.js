"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMerkleTree = void 0;
const keccak256_1 = __importDefault(require("keccak256"));
const merkleTree_1 = require("../../../merkleTree");
const error_1 = require("../../../error");
function createMerkleTree(usersDatas) {
    try {
        const leaves = Object.keys(usersDatas)
            .map((userData) => {
            return "0x" + (0, keccak256_1.default)(`${userData}-${usersDatas[userData][2]}`).toString("hex");
        });
        const merkleTree = new merkleTree_1.MerkleTree(leaves);
        const root = merkleTree.getRoot();
        return root;
    }
    catch (e) {
        console.log(`Error @ handleMerkleTree : ${e}`);
        return { status: false, statusCode: 500, error: error_1.ERROR.INTERNAL_SERVER_ERROR };
    }
}
exports.createMerkleTree = createMerkleTree;
