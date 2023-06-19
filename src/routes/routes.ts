import { getEpochData } from "../controller/getEpoch/getEpochData";
import { getUserAllEpochData } from "../controller/getEpoch/getUserAllEpoch";
import { getEpochUserData } from "../controller/getEpoch/getUserEpoch";
import { createEpoch } from "../controller/startEpoch/createEpoch";

const express = require('express');

const router = express.Router();


router.post("/epoch",createEpoch);
router.get("/epoch/user/:epoch/:userId", getEpochUserData);
router.get("/epoch/user/:userId", getUserAllEpochData);
router.get("/epoch", getEpochData);



export default router;