# Rewards

## Backend APIS

### 1. For Fetching User Data As Per The Epoch

### Route  /epoch/user/:epoch/:userId

### Expected Input

```
Method : Get
Url : http://localhost:3010/epoch/user/:epoch/:userId
```

### Expected Output

```
{
    "status": true,
    "data": {
        "spotVolume": "1.8151",
        "perpVolume": "60817.742985",
        "tokenAlloted": "141053969145699848190000000000",
        "merkleContractId": "merkletreetest-1-1687325871633.testnet",
        "proof": [
            "0x76419aa4642e33cfc255a4793ce70d069ad5cc19e2aa4a0db7a53cbc1e0d16a4",
            "0xe9df4e7f2db225293aaf1f8069c469a05e5ce2ebfac6987e27cfe7589629d75d",
            "0xbdd9dcfd6b824cb3495dac53141a53c75377319f42510836e83a5022909ed4cf",
            "0x34884e2955d2e79e39e1da96d20031edefc589af92aad9fd4c248473ffdf563e",
            "0xf04a08e440d46b975daa6979eb8269fd69635affb6a905061b9f2f0c8a165d09",
            "0x4e197688aa8800b5890e10f32badd85d1070ec91711bf618288bc9d65194d8d9",
            "0x8ed5de28b846deb133e92af522c63c817924fb70e5ff57c8353916b208f1496d"
        ],
        "epoch": 1
    }
}
```

### 2. For Fetching User All Epoch Data

### Route  /epoch/user/:userId

### Expected Input

```
Method : Get
Url : http://localhost:3010/epoch/user/:userId
```

### Expected Output

```
{
    "status": true,
    "data": [
        {
            "spotVolume": "1.8151",
            "perpVolume": "60817.742985",
            "tokenAlloted": "141053969145699848190000000000",
            "merkleContractId": "merkletreetest-1-1687325871633.testnet",
            "proof": [
                "0x76419aa4642e33cfc255a4793ce70d069ad5cc19e2aa4a0db7a53cbc1e0d16a4",
                "0xe9df4e7f2db225293aaf1f8069c469a05e5ce2ebfac6987e27cfe7589629d75d",
                "0xbdd9dcfd6b824cb3495dac53141a53c75377319f42510836e83a5022909ed4cf",
                "0x34884e2955d2e79e39e1da96d20031edefc589af92aad9fd4c248473ffdf563e",
                "0xf04a08e440d46b975daa6979eb8269fd69635affb6a905061b9f2f0c8a165d09",
                "0x4e197688aa8800b5890e10f32badd85d1070ec91711bf618288bc9d65194d8d9",
                "0x8ed5de28b846deb133e92af522c63c817924fb70e5ff57c8353916b208f1496d"
            ],
            "epoch": 1
        },
        {
            "spotVolume": "2983.041",
            "perpVolume": "65977.792347",
            "tokenAlloted": "309215580578067120810000000000",
            "merkleContractId": "merkletreetest-2-1687324926878.testnet",
            "proof": [
                "0x4e5e0b52e757c5fba96e5264d38eee671d8c772b3fe6c1ed0034afc02b8f0259",
                "0x8004be36c150803a334d2fa36c9280cc9be8c82b33d1af3d3e5f9640f8a081ed",
                "0x9d15fe186d025c795b08e088b7810f3243b5381890a5aca5db3afab364d8ff37",
                "0x4a7222e35a69105c7705c9a4bbdf0166976f405576c67e00712095bec1e3765e",
                "0x686ff9aaf63417cdb11525f97ffc2808c4741e5de5dca56092a116dc92f9a5ec"
            ],
            "epoch": 2
        }
    ]
}
```
### 3. For Fetching All Epoch Data

### Route  /epoch

### Expected Input

```
Method : Get
Url : http://localhost:3010/epoch
```

### Expected Output

```
{
    "status": true,
    "data": [
        {
            "epoch": 0,
            "startDate": "2023-05-01",
            "endDate": "2023-05-14",
            "totalVolume": "65425.805016",
            "totalRewards": "1000000000000000000000000000000",
            "rewardsDecimals": 24,
            "wightedVolume": "65425.805016",
            "merkleContractId": "merkletreetest-0-1687324557993.testnet"
        },
        {
            "epoch": 1,
            "startDate": "2023-05-15",
            "endDate": "2023-05-28",
            "totalVolume": "338158.99158072",
            "totalRewards": "1000000000000000000000000000000",
            "rewardsDecimals": 24,
            "wightedVolume": "258712.75450112",
            "merkleContractId": "merkletreetest-1-1687325871633.testnet"
        },
        {
            "epoch": 2,
            "startDate": "2023-05-29",
            "endDate": "2023-06-11",
            "totalVolume": "206060.018131",
            "totalRewards": "1000000000000000000000000000000",
            "rewardsDecimals": 24,
            "wightedVolume": "137670.0240286",
            "merkleContractId": "merkletreetest-2-1687324926878.testnet"
        }
    ]
}
```
### 4. For Initializing New Epoch

### Route  /epoch

### Expected Input

```
Method : post
Url : http://localhost:3010/epoch

ReqBody:{
    "epoch": 2,
    "tokens": 1000000, // tokens in Near
    "secret": "sddhfadkhbabfa"
}
```

### Expected Output

```
{
    "status": true,
    "data": {
        "epoch": 2,
        "merkleTreeContractId": "merkletreetest-2-1687424926878.testnet"
    }
}
```

# To call contract with near cli:
## Veiw Method
```
near view contract_name method_name '{"arg1":val1}' --accountId xyz.testnet --gas 300000000000000
```
## Call Method
```
near call contract_name method_name '{"arg1": val1, "arg2": val2}' --accountId xyz.testnet --depositYocto 100000000000000000 --gas 300000000000000
```
# To Claim Zexe
## 1. User need to create stoarge in zexe
```
near call zexe.testnet storage_deposit '{"account_id":"user.testnet","registration_only": true}' --accountId user.testnet --depositYocto 2500000000000000000000 --gas 300000000000000
```
## 2. User need to call claim with 2500000000000000000000 yocto near for storage
```
near call merkletree.testnet claim '{"amount":"100000000000000000000000000","proof":["0x76419aa4642e33cfc255a4793ce70d069ad5cc19e2aa4a0db7a53cbc1e0d16a4","0xe9df4e7f2db225293aaf1f8069c469a05e5ce2ebfac6987e27cfe7589629d75d"] }' --accountId user.testnet --depositYocto 2500000000000000000000 --gas 3000000000000000
```
# To Run Server 
## Fill env
```
PRIVATE_KEY=
EPOCH_DURATION=
EPOCH_LAUNCH_TIME=
ZEXE_TOKEN_ID=
CREATOR=
PERP_VS_SPOT_FRAC=
SECRET=
```
## Then run command : yarn dev
