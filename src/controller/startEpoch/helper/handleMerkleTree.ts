
import keccak256 from "keccak256";
import { MerkleTree } from "../../../merkleTree";
import { ErrorResponse, UserDataStorage } from "../../../types";
import { ERROR } from "../../../error";


export function createMerkleTree(usersDatas: UserDataStorage):
    string | ErrorResponse {
    try {
        const leaves: string[] = Object.keys(usersDatas)
            .map((userData: string) => {
                return "0x" + keccak256(`${userData}-${usersDatas[userData][2]}`).toString("hex");
            });
        const merkleTree = new MerkleTree(leaves);
        const root = merkleTree.getRoot();
        return root;
    }
    catch (e) {
        console.log(`Error @ handleMerkleTree : ${e}`);
        return { status: false, statusCode: 500, error: ERROR.INTERNAL_SERVER_ERROR }
    }
}
