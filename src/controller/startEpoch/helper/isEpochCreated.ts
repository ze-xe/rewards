import {promises as fs} from "fs";
import path from "path";




export async function isEpochCreated(epoch: number)
:Promise<boolean>{
    try{

       const getALLEpochFile = (await fs.readdir(path.join(__dirname + `../../../../deployments`), { withFileTypes: true }))
        .filter(item => !item.isDirectory())
        .map(item => item.name);

        if(getALLEpochFile.includes(`epoch-${epoch}.json`)){
            return true;
        }
        return false;
    }
    catch(error){
        console.log(`Error @ isEpochCreated: ${error}`);
        return true
    }
}