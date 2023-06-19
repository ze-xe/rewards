
import { promises as fs } from "fs";
import path from "path";
import * as nearAPI from "near-api-js";
const { KeyPair } = nearAPI;



export async function setKeyStore(keyStore: nearAPI.keyStores.InMemoryKeyStore): Promise<nearAPI.keyStores.InMemoryKeyStore | null> {
    try {
        // add creator secret from env if not present;
        const creator = process.env.CREATOR;
        const privateKey = process.env.PRIVATE_KEY;
        if(!creator || !privateKey){
            console.log(`creator or private key is missing at env`);
            return null;
        }
        let getKey = JSON.parse((await (fs.readFile(path.join(__dirname + "../../getKey.json")))).toString());
        let keys = Object.keys(getKey);

        if(!getKey[creator]){
            const keyPair = KeyPair.fromString(privateKey);
            keyStore.setKey("testnet", creator, keyPair);
        }
        
        for (let key of keys) {
            let secret = `ed25519:${getKey[key]["secretKey"]}`;
            const keyPair = KeyPair.fromString(secret);
            keyStore.setKey("testnet", key, keyPair);
        }
        return keyStore;
    }
    catch (error) {
        console.log(`Error @ setKeyStore: ${error}`);
        return null
    }

};