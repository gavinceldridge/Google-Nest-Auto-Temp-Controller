import axios from "axios";

const BASE_URL = process.env.BACKEND_API_URL || "http://10.0.0.25:3001";


class BackendApi {

    static token = '';

    static async request(endpoint, data = {}, method = "get") {
        // alert("this.token: " + this.token)
        if (this.token === '') {
            const result = await axios.post(`${BASE_URL}/thermostat/token`);
            this.token = result.data.token;
        }
        console.debug("API Call:", endpoint, data, method);

        //there are multiple ways to pass an authorization token, this is how you pass it in the header.
        //this has been provided to show you another way to pass the token. you are only expected to read this code for this project.
        const url = `${BASE_URL}/${endpoint}`;
        console.log(url);
        const headers = { Authorization: `Bearer ${this.token}` };
        const params = (method === "get")
            ? data
            : {};

        try {
            return (await axios({ url, method, data, params, headers })).data;
        } catch (err) {
            console.error("API Error:", err.response);
            let message = err.response.data.error.message;
            throw Array.isArray(message) ? message : [message];
        }
    }

    static async getDeviceInfo() {
        const res = await this.request(`thermostat/`);
        console.log(res);
        return res;
    }

    static async getNewToken() {
        const res = await this.request("thermostat/token");
        this.token = res.token;
        return this.token;
    }

    static async changeMode(mode) {
        console.log(mode);
        await this.request("thermostat/mode", { "mode": mode }, "post");
    }

    static async changeTemperature(temperature, mode) {

        if (mode === "COOL") {
            mode = "SetCool";
        } else if (mode === "HEAT") {
            mode = "SetHeat";
        }

        await this.request("thermostat/temperature", { temperature, "command": mode }, "post");
    }

    static async changeTimer(mode) {
        const res = await this.request("thermostat/timer", { mode }, "post");
        return res;
    }

}

export default BackendApi;