

import moment from 'moment'
import { ErrorResponse, StartEndDate } from '../../../types';
import { Response } from 'express';
import { ERROR } from '../../../error';

export function getStartEndDates(epoch: number): StartEndDate | ErrorResponse {
    try {
        const epochStartTime = Number(process.env.EPOCH_LAUNCH_TIME);
        const epochDuration = Number(process.env.EPOCH_DURATION);

        if (isNaN(epochDuration) || isNaN(epochStartTime)) {
            return { status: false, error: ERROR.ADD_VALID_EPOCH_DURATION_AND_START_TIME_IN_ENV, statusCode:400 };

        }

        const epochDurationFromStart = epochDuration * (epoch + 1);
        const start = new Date(epochStartTime + epochDurationFromStart - epochDuration);
        const end = new Date(epochStartTime + epochDurationFromStart - 24 * 60 * 60 * 1000);
        const startDate = moment(start).format('YYYY-MM-DD');
        const endDate = moment(end).format('YYYY-MM-DD');
        if (end.getTime() > Date.now()) {
            console.log(`Epoch duration is not valid, startDate:${startDate}, endDate: ${endDate}`);
            return { status: false, error: ERROR.EPOCH_DURATION_NOT_VALID, statusCode: 400 };

        }
        console.log(startDate, endDate);
        return { startDate, endDate };
    }
    catch (error) {
        console.log(`Error @ getStartEndDates: ${error}`);
        return { status: false, error: ERROR.INTERNAL_SERVER_ERROR, statusCode: 500 };
    }
}



