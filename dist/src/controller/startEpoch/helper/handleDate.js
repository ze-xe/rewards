"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStartEndDates = void 0;
const moment_1 = __importDefault(require("moment"));
const error_1 = require("../../../error");
function getStartEndDates(epoch) {
    try {
        const epochStartTime = Number(process.env.EPOCH_LAUNCH_TIME);
        const epochDuration = Number(process.env.EPOCH_DURATION);
        if (isNaN(epochDuration) || isNaN(epochStartTime)) {
            return { status: false, error: error_1.ERROR.ADD_VALID_EPOCH_DURATION_AND_START_TIME_IN_ENV, statusCode: 400 };
        }
        const epochDurationFromStart = epochDuration * (epoch + 1);
        const start = new Date(epochStartTime + epochDurationFromStart - epochDuration);
        const end = new Date(epochStartTime + epochDurationFromStart - 24 * 60 * 60 * 1000);
        const startDate = (0, moment_1.default)(start).format('YYYY-MM-DD');
        const endDate = (0, moment_1.default)(end).format('YYYY-MM-DD');
        if (end.getTime() > Date.now()) {
            console.log(`Epoch duration is not valid, startDate:${startDate}, endDate: ${endDate}`);
            return { status: false, error: error_1.ERROR.EPOCH_DURATION_NOT_VALID, statusCode: 400 };
        }
        console.log(startDate, endDate);
        return { startDate, endDate };
    }
    catch (error) {
        console.log(`Error @ getStartEndDates: ${error}`);
        return { status: false, error: error_1.ERROR.INTERNAL_SERVER_ERROR, statusCode: 500 };
    }
}
exports.getStartEndDates = getStartEndDates;
