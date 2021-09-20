"use strict";

//Routes for controlling the thermometer

const express = require("express");
const { OAUTH_ID, OAUTH_PASSWORD, PROJECT_ID, DEVICE_ID, REFRESH_TOKEN } = require("../configSecret");
const axios = require("axios");
const { BadRequestError, ExpressError, NotFoundError } = require("../expressError");
const router = new express.Router();

const BASE_THERMOSTAT_URL = `https://www.googleapis.com/oauth2/v4/token`;
const SMART_DEVICES_URL = `https://smartdevicemanagement.googleapis.com/v1/enterprises`;
let thermostatAccessToken;

const getNewToken = async (refreshToken = REFRESH_TOKEN) => {
    const result = await axios.post(`${BASE_THERMOSTAT_URL}?client_id=${OAUTH_ID}&client_secret=${OAUTH_PASSWORD}&refresh_token=${refreshToken}&grant_type=refresh_token`);
    thermostatAccessToken = result.data.access_token;
}

//Get a new access token
router.post("/token", async (req, res, next) => {
    try {
        const refreshToken = req.query.refreshToken || REFRESH_TOKEN;
        await getNewToken(refreshToken);
        return res.json({ token: thermostatAccessToken });
    } catch (e) {
        return next(e);
    }

});

//Route to change the thermostat's current mode
//Must pass in the desired mode into the query parameters
//Returns desired mode on success
router.post("/mode", async (req, res, next) => {
    try {
        if (!thermostatAccessToken) await getNewToken();

        const mode = req.body.mode;
        console.log(mode);
        const data = {
            "command": "sdm.devices.commands.ThermostatMode.SetMode",
            "params": {
                "mode": mode
            }
        }

        const headerContent = { Authorization: `Bearer ${thermostatAccessToken}` };
        const result = await axios.post(`${SMART_DEVICES_URL}/${PROJECT_ID}/devices/${DEVICE_ID}:executeCommand`, data, { headers: headerContent });
        console.log(result);
        return res.json({ mode });
    } catch (e) {
        // console.log(e);
        return next(e);
    }
});

//Get basic info about the thermometer (mainly its status [OFF, COOL, HEAT])
router.get("/", async (req, res, next) => {

    try {

        if (!thermostatAccessToken) {
            await getNewToken();
        }

        let url = `${SMART_DEVICES_URL}/${PROJECT_ID}/devices`;
        console.log(url)
        const result = await axios.get(url,
            {
                headers: {
                    "Authorization": `Bearer ${thermostatAccessToken}`
                }
            });
        console.log(result);
        return res.json(result.data);

    } catch (e) {
        return next(e);
    }

});

module.exports = router;
