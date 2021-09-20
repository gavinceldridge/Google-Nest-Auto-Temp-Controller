"use strict";

//Routes for getting the weather info

const express = require("express");
const { LAT, LON, WEATHER_API_ID } = require("../configSecret");
const axios = require("axios");
const { BadRequestError, ExpressError, NotFoundError } = require("../expressError");
const router = new express.Router();

const BASE_WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

router.post("/", async (req, res, next) => {
    try {
        const result = await axios.get(`${BASE_WEATHER_API_URL}?lat=${LAT}&lon=${LON}&appid=${WEATHER_API_ID}&units=imperial`);
        console.log(result.data);
        return res.json({ weather: result.data });
    } catch (e) {
        console.log("HOUSTON WE HAVE AN ERROR")
        return next(e);
    }

});

module.exports = router;