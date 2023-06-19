import keccak256 from "keccak256";



// leaves must be hashed
export  class MerkleTree {

    root: string
    constructor(leaves: string[] = []) {
        this.root = "";
        this.buildTree(leaves);
    }

    buildTree(leaves: string[]): string[][] {
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
                const hashArray = keccak256((Number(nodes[i]) + Number(nodes[i + 1])).toString()).toString("hex");
                const hash = '0x' + hashArray;
                layers[layerIndex].push(hash);
            }
            nodes = layers[layerIndex];
        }
        this.root = layers[layers.length - 1][0];
        return layers
    };

    getRoot(): string {
        return this.root;
    }

    getProof(leaf: string, leaves: string[]): string[] {
        let index = leaves.indexOf(leaf);
        const layers = this.buildTree(leaves);
        if (index === -1) return [];

        let proof: string[] = [];

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

    verify(leaf: string, proof: string[]): boolean {
        let hash = leaf;
        const root = this.getRoot();
        for (let i = 0; i < proof.length; i++) {
            const node = proof[i];
            const isRightNode = hash < node;
            const left = isRightNode ? hash : node;
            const right = isRightNode ? node : hash;
            const add = Number(left) + Number(right);

            const hashArray = keccak256(add.toString()).toString("hex");
            hash = '0x' + hashArray;
        }
        return hash === root;

    };
}



