import express from "express";
import healthcheck from "express-healthcheck";

import builtForTeamsTimesheet from './builtForTeamsTimesheet/index.js';
import built from './built/TimesheetDetailsReport.js'



const router = express.Router();


router.use('/', (req, res, next) => {
    // res.set({'Content-Type': 'application/json'});
    res.set({'Access-Control-Allow-Origin': '*'});
    next();
});

// router.use('/fetch-timesheet-builtforteams', builtForTeamsTimesheet);
router.use('/built', built);
router.use('/', healthcheck());

export default router;