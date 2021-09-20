"use strict";

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const thermostatRoutes = require("./routes/thermostat");
const weatherRoutes = require("./routes/weather");

const morgan = require("morgan");

const app = express();

app.use(express.json());
app.use(morgan("tiny"));
app.use("/thermostat", thermostatRoutes);
app.use("/weather", weatherRoutes);

//404 handler
app.use((req, res, next) => {
    return next(new NotFoundError());
});

app.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
        error: { message, status }
    });
});

module.exports = app;