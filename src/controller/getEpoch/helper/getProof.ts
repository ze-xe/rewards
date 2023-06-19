import keccak256 from "keccak256";
import { MerkleTree } from "../../../merkleTree";
import { ErrorResponse, Proof } from "../../../types";
import { ERROR } from "../../../error";









export function getProof(usersDatas: any, userData: string[]): string[] | ErrorResponse {
    try {

        const leaves: string[] = Object.keys(usersDatas)
            .map((userData: string) => {
                return "0x" + keccak256(`${userData}-${usersDatas[userData][2]}`).toString("hex");
            });

        const merkleTree = new MerkleTree(leaves);
        const userHash = "0x" + keccak256(`${userData[3]}-${userData[2]}`).toString("hex");
        const proof: string[] = merkleTree.getProof(userHash, leaves);
        return proof;
    }
    catch (error) {
        console.log(`Error @ getProof: ${error}`);
        return { status: false, statusCode: 500, error: ERROR.INTERNAL_SERVER_ERROR };
    }
}