import * as nearAPI from "near-api-js";




export interface User {
    date: string;
    account_id: string;
    spot_volume: number;
    perp_volume: number;
}

export interface UserDataStorage {
    [account_id: string]: string[];
}

export interface StartEndDate {
    startDate: string;
    endDate: string;
}

export interface ConfigConnecton {
    networkId: string;
    keyStore: nearAPI.keyStores.InMemoryKeyStore;
    nodeUrl: string;
    walletUrl: string;
    helperUrl: string;
    explorerUrl: string;
}

export interface DeploymentData {
    epoch: number,
    root: string,
    merkleTreeId: string,
    startDate: string,
    endDate: string,
    totalVolume: string,
    weightedVolume: string,
    totalReward: string,
    rewardDecimals: number,
    users: UserDataStorage,
    timestamp?: string
}

export interface ErrorResponse {
    status: boolean,
    error: string,
    statusCode: number
}

export interface Proof {
    proof: string[];
    userHash: string;
}

export interface UserData {
    epoch: number,
    spotVolume: string,
    perpVolume: string,
    tokenAlloted: string,
    merkleContractId: string,
    proof: string[],
}

export interface epochData {
    epoch: number,
    startDate: string,
    endDate: string,
    totalVolume: string,
    totalRewards: string,
    rewardsDecimals: number,
    wightedVolume: string,
    merkleContractId: string
}