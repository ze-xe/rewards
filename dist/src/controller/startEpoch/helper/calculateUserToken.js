"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateUserToken = void 0;
const axios_1 = __importDefault(require("axios"));
const big_js_1 = __importDefault(require("big.js"));
const ethers_1 = require("ethers");
const error_1 = require("../../../error");
require("dotenv").config();
function calculateUserToken(startDate, endDate, token) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userMap = new Map();
            let userData = [];
            try {
                userData = (yield axios_1.default.get(`https://api.zexe.io/orderly/user_data?start_date=${startDate}&end_date=${endDate}&broker_id=zexe_dex`)).data.data;
            }
            catch (e) {
                const error = e;
                console.log((_a = error.response) === null || _a === void 0 ? void 0 : _a.data);
                return { status: false, statusCode: (_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.status) !== null && _c !== void 0 ? _c : 500, error: error_1.ERROR.ERROR_FROM_ORDERLY };
            }
            let totalVolume = "0";
            let weightedVolume = "0";
            const perpVsSpotFrac = 0.6; //Number(process.env.PERP_VS_SPOT_FRAC);
            if (isNaN(perpVsSpotFrac)) {
                return { status: false, statusCode: 400, error: error_1.ERROR.PERP_VS_SPOT_FRAC_NOT_FOUND };
            }
            const userTokenData = {};
            for (let user of userData) {
                if (userMap.has(user.account_id)) {
                    const userSpot = (0, big_js_1.default)(userMap.get(user.account_id)[0]).plus(user.spot_volume).toString();
                    const userPerp = (0, big_js_1.default)(userMap.get(user.account_id)[1]).plus(user.perp_volume).toString();
                    userMap.set(user.account_id, [userSpot, userPerp]);
                }
                else if (!userMap.has(user.account_id)) {
                    userMap
                        .set(user.account_id, [user.spot_volume, user.perp_volume]);
                }
                totalVolume = (0, big_js_1.default)(totalVolume).plus(user.spot_volume)
                    .plus(user.perp_volume).toString();
                weightedVolume = (0, big_js_1.default)(weightedVolume).plus(user.spot_volume).plus((0, big_js_1.default)(user.perp_volume).times(perpVsSpotFrac)).toString();
            }
            const usersTokens = [...userMap.entries()];
            let totalAllotedToken = "0";
            usersTokens.forEach((user, index) => {
                const userPercentage = (0, big_js_1.default)(user[1][0]).plus((0, big_js_1.default)(user[1][1])
                    .times(perpVsSpotFrac)).div(weightedVolume);
                // converting in into 1e24 , 18 decimals by parse ether
                const tokenAlloted = (0, ethers_1.parseEther)((0, big_js_1.default)(token).times(userPercentage).times(1e6).toString())
                    .toString();
                userTokenData[`${user[0]}`] = [user[1][0], user[1][1], tokenAlloted];
                totalAllotedToken = (0, big_js_1.default)(totalAllotedToken).plus(tokenAlloted).toString();
            });
            console.log("token not alloted", +token * 1e24 - +totalAllotedToken);
            return { userTokenData, totalVolume, weightedVolume };
        }
        catch (error) {
            console.log(`Error @ calculateUserToken : ${error}`);
            return { status: false, statusCode: 500, error: error_1.ERROR.INTERNAL_SERVER_ERROR };
        }
    });
}
exports.calculateUserToken = calculateUserToken;
