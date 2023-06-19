"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerkleTree = void 0;
const keccak256_1 = __importDefault(require("keccak256"));
class MerkleTree {
    constructor(leaves = []) {
        this.root = "";
        this.buildTree(leaves);
    }
    buildTree(leaves) {
        let nodes = leaves;
        const layers = [nodes];
        while (nodes.length > 1) {
            const layerIndex = layers.length;
            layers.push([]);
            for (let i = 0; i < nodes.length; i += 2) {
                if (i + 1 === nodes.length) {
                    layers[layerIndex].push(nodes[i]);
                    continue;
                }
                const hashArray = (0, keccak256_1.default)(Number(nodes[i]) + Number(nodes[i + 1])).toString("hex");
                const hash = '0x' + hashArray;
                layers[layerIndex].push(hash);
            }
            nodes = layers[layerIndex];
            this.root = layers[layers.length - 1][0];
        }
        return layers;
    }
    ;
    getRoot() {
        return this.root;
    }
    getProof(leaf, leaves) {
        let index = leaves.indexOf(leaf);
        const layers = this.buildTree(leaves);
        if (index === -1)
            return [];
        let proof = [];
        for (let i = 0; i < layers.length - 1; i++) {
            const layer = layers[i];
            const isRightNode = index % 2;
            const pairIndex = isRightNode ? index - 1 : index + 1;
            if (pairIndex < layer.length) {
                proof.push(layer[pairIndex]);
            }
            index = Math.floor(index / 2);
        }
        return proof;
    }
    verify(leaf, proof) {
        let hash = leaf;
        const root = this.getRoot();
        for (let i = 0; i < proof.length; i++) {
            const node = proof[i];
            const isRightNode = hash < node;
            const left = isRightNode ? hash : node;
            const right = isRightNode ? node : hash;
            const hashArray = (0, keccak256_1.default)(Number(left) + Number(right)).toString("hex");
            hash = '0x' + hashArray;
        }
        return hash === root;
    }
    ;
}
exports.MerkleTree = MerkleTree;
const leaves = ["string6", "string7", "string8", "string10", "str", "stt", "abb", "ifbdifbw", "sidfbidbwd", "sdifbaiabc", "csdhbibcadivb"].map(e => "0x" + (0, keccak256_1.default)(e).toString("hex")); //.sort((a: any, b: any) => Number(a) - Number(b));
const a = new MerkleTree(leaves);
console.log(leaves);
console.log(a);
for (let e of leaves) {
    const proof = a.getProof(e, leaves);
    const veri = a.verify(e, proof);
    console.log("ele", e);
    console.log(proof);
    console.log(veri);
    console.log('-----------------');
}