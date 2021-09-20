"use strict";

require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || 'secret-dev';

const PORT = +process.env.PORT || 3001;

const getDatabaseUri = () => {
    return (process.env.NODE_ENV === "test")
        ? "thermostat_controller_test"
        : process.env.DATABUSE_URL || "thermostat_controller"
}

console.log("Thermostat Controller Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("Database:".yellow, getDatabaseUri());
console.log("---");

module.exports = {
    SECRET_KEY,
    PORT,
    getDatabaseUri,
};
