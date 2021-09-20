const axios = require("axios");
const { OAUTH_ID, OAUTH_PASSWORD, PROJECT_ID, DEVICE_ID, REFRESH_TOKEN, AUTH_CODE, LAT, LON, WEATHER_API_ID } = require("./pw");

const generateNewToken = async (refreshToken = REFRESH_TOKEN) => {
    try {

        const res = await axios.post(`https://www.googleapis.com/oauth2/v4/token?client_id=${OAUTH_ID}&client_secret=${OAUTH_PASSWORD}&refresh_token=${refreshToken}&grant_type=refresh_token`);
        console.log(res.data);
        return res.data.access_token;
    } catch (e) {
        console.log("ERROR!")
        console.error(e);
    }

}

const test = async () => {

    const commandURL = `https://smartdevicemanagement.googleapis.com/v1/enterprises/${PROJECT_ID}/devices/${DEVICE_ID}:executeCommand`;

    let command = "SetMode";
    let mode = "COOL";
    const data = { command: `sdm.devices.commands.ThermostatMode.${command}`, params: { "mode": mode } };

    const headerContent = {
        Authorization: "Bearer ya29.a0ARrdaM9cvCbe8K01wZTlTC49Y_Uz75eODaCKrnhwi4gqwlGGNLQtLYbV5-i6HvmQecVFZjgj0I6JcnOHLFpPmgTCjcMqA2BTBFfqFZWMnGO243iSDZDZw8i86XSqT__CGtCBB_urFrN8fw-htpKVVS7IBMO7"
    };
    try {
        const res = await axios.post(commandURL, data, { headers: headerContent });
        console.log(res);
    } catch (e) {
        console.error(e);
    }

}

const run = async () => {
    const WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather";

    try {
        const weatherData = await axios.get(`${WEATHER_URL}?lat=${LAT}&lon=${LON}&appid=${WEATHER_API_ID}&units=imperial`);
        console.log(weatherData.data);
        const feelsLikeTemp = weatherData.data.main.feels_like;
        console.log('it feels like', feelsLikeTemp);

    } catch (e) {
        console.error(e);
    }

    const token = generateNewToken();



}

run();
setInterval(run, 1800000);//set an interval to run every 30 minutes