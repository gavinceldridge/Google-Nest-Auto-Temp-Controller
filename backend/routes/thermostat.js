"use strict";

//Routes for controlling the thermometer

const express = require("express");
const { OAUTH_ID, OAUTH_PASSWORD, PROJECT_ID, DEVICE_ID, REFRESH_TOKEN, LAT, LON, WEATHER_API_ID } = require("../configSecret");
const axios = require("axios");
const { BadRequestError, ExpressError, NotFoundError } = require("../expressError");
const router = new express.Router();

const BASE_WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const BASE_THERMOSTAT_URL = `https://www.googleapis.com/oauth2/v4/token`;
const SMART_DEVICES_URL = `https://smartdevicemanagement.googleapis.com/v1/enterprises`;
let thermostatAccessToken;
let intervalId;

const getNewToken = async (refreshToken = REFRESH_TOKEN) => {
    const result = await axios.post(`${BASE_THERMOSTAT_URL}?client_id=${OAUTH_ID}&client_secret=${OAUTH_PASSWORD}&refresh_token=${refreshToken}&grant_type=refresh_token`);
    thermostatAccessToken = result.data.access_token;
}

const convertCelsiusToFahrenheit = (cel) => {
    return (cel * (9 / 5) + 32);
}

const convertFahrenheitToCelsius = (far) => {
    return (far - 32) * 5 / 9;
}

const compareWithWeather = async () => {
    try {

        console.log("checking current weather data...");
        if (!thermostatAccessToken) await getNewToken();

        //get the current weather
        const weatherResponse = await axios.get(`${BASE_WEATHER_API_URL}?lat=${LAT}&lon=${LON}&appid=${WEATHER_API_ID}&units=imperial`);

        //get the current thermostat data
        const thermostatResponse = await axios.get(`${SMART_DEVICES_URL}/${PROJECT_ID}/devices`,
            {
                headers: {
                    "Authorization": `Bearer ${thermostatAccessToken}`
                }
            });

        console.log(weatherResponse.data);
        console.log(thermostatResponse.data.devices[0].traits['sdm.devices.traits.ThermostatMode']);
        let weatherTemp = weatherResponse.data.main.feels_like;
        if (thermostatResponse.data.devices[0].traits['sdm.devices.traits.ThermostatMode'].mode === "COOL") {
            //if ac is running & climate inside is warmer than outside, turn it off

            let thermoTemp = convertCelsiusToFahrenheit(thermostatResponse.data.devices[0].traits['sdm.devices.traits.ThermostatTemperatureSetpoint'].coolCelsius);
            if (thermoTemp && thermoTemp > weatherTemp) {
                console.log("temp outside is lower than the house temp, powering off the ac");

                const data = {
                    "command": "sdm.devices.commands.ThermostatMode.SetMode",
                    "params": {
                        "mode": "OFF"
                    }
                }
                const headerContent = { Authorization: `Bearer ${thermostatAccessToken}` };
                await axios.post(`${SMART_DEVICES_URL}/${PROJECT_ID}/devices/${DEVICE_ID}:executeCommand`, data, { headers: headerContent });
                // console.log(result);
            }
        } else {
            //if ac is not running & climate outside is warmer than the last temperature, turn it on
            //currently not checking the last temp, just if its over 72
            if (weatherTemp > 72) {
                console.log("temp outside is higher than 72 degrees, powering on the ac");

                const data = {
                    "command": "sdm.devices.commands.ThermostatMode.SetMode",
                    "params": {
                        "mode": "COOL"
                    }
                }
                const headerContent = { Authorization: `Bearer ${thermostatAccessToken}` };
                await axios.post(`${SMART_DEVICES_URL}/${PROJECT_ID}/devices/${DEVICE_ID}:executeCommand`, data, { headers: headerContent });
            } else {
                console.log("no changes made");
            }
        }
    } catch (e) {
        console.log(e);
    }
}

/*change the temperature
Body: {
    temperature: int,
    command: <SetHeat>, <SetCool>
}
*/
router.post("/temperature", async (req, res, next) => {

    try {

        if (!thermostatAccessToken) await getNewToken();
        let { temperature, command } = req.body;
        temperature = convertFahrenheitToCelsius(temperature);


        if (command === "SetHeat") {

            const data = {
                "command": "sdm.devices.commands.ThermostatTemperatureSetpoint.SetHeat",
                "params": {
                    "heatCelsius": temperature
                }
            }

            const headerContent = { Authorization: `Bearer ${thermostatAccessToken}` };
            await axios.post(`${SMART_DEVICES_URL}/${PROJECT_ID}/devices/${DEVICE_ID}:executeCommand`, data, { headers: headerContent });

        } else if (command === "SetCool") {

            const data = {
                "command": "sdm.devices.commands.ThermostatTemperatureSetpoint.SetCool",
                "params": {
                    "coolCelsius": temperature
                }
            }

            const headerContent = { Authorization: `Bearer ${thermostatAccessToken}` };
            await axios.post(`${SMART_DEVICES_URL}/${PROJECT_ID}/devices/${DEVICE_ID}:executeCommand`, data, { headers: headerContent });
            return res.json({})
        }
    } catch (e) {
        return next(e);
    }
});

router.post("/timer", async (req, res, next) => {
    try {

        const mode = req.body.mode;

        if (mode === "start" && !intervalId) {
            await compareWithWeather();
            intervalId = setInterval(async () => {
                await compareWithWeather();
            }, 1800000);
            // }, 10000);

        } else if (mode === "stop" && intervalId) {
            clearInterval(intervalId);
            intervalId = undefined;
        }

        let status = intervalId !== undefined ? "on" : "off";
        let response = {
            status
        }

        return res.json(response);

    } catch (e) {
        console.log("error");
        return next(e);
    }
});

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
        console.log(thermostatAccessToken);

        let url = `${SMART_DEVICES_URL}/${PROJECT_ID}/devices`;
        const result = await axios.get(url,
            {
                headers: {
                    "Authorization": `Bearer ${thermostatAccessToken}`
                }
            });

        return res.json(result.data);

    } catch (e) {
        // console.log(e);
        return next(e);
    }

});

module.exports = router;
