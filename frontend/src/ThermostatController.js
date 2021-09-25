import { React, useState, useEffect } from 'react'
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import BackendApi from './BackendApi';

export default function ThermostatController() {

    const [thermostatInfo, setThermostatInfo] = useState();
    const [formData, setFormData] = useState({ mode: "", modeOptions: ["Off", "Cool", "Heat"], temp: "" });



    const convertCelsiusToFahrenheit = (cel) => {
        return (cel * (9 / 5) + 32);
    }

    const convertFahrenheitToCelsius = (far) => {
        return (far - 32) * 5 / 9;
    }

    useEffect(async () => {
        //initialize thermostatInfo
        const deviceInfo = await BackendApi.getDeviceInfo()
        setThermostatInfo(deviceInfo);
        let temp = "";
        const mode = deviceInfo.devices[0].traits["sdm.devices.traits.ThermostatMode"].mode;
        console.log(deviceInfo.devices[0].traits['sdm.devices.traits.ThermostatMode']);
        if (mode === "COOL") temp = convertCelsiusToFahrenheit(deviceInfo.devices[0].traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].coolCelcius);
        else if (mode === "HEAT") temp = convertCelsiusToFahrenheit(deviceInfo.devices[0].traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].heatCelcius);
        console.log(deviceInfo.devices[0].traits);
        setFormData(data => ({
            ...data,
            mode: mode,
            temp: 72
        }));
        console.log("start");
    }, []);

    const tempFormHandler = async (evt) => {



    }

    const modeFormHandler = async (evt) => {

        // console.log(evt.target.value);
        const { name, value } = evt.target;
        console.log(name, value);
        setFormData(data => ({
            ...data,
            mode: value
        }));

        await BackendApi.changeMode(value.toUpperCase());

    }

    return (
        <div className="mt-3">
            <Row className="justify-content-center">
                <h1>Temperature Controller</h1>
            </Row>
            <Row className="justify-content-center mt-5">
                <Col xs={8}>

                    <Form.Group as={Row} controlId="formHorizontalMode">
                        <Form.Label column sm={5}><h3>Mode</h3></Form.Label>
                        <Col sm={6}>
                            <Form.Control as="select" size="lg" name="mode" onChange={modeFormHandler} >
                                {formData.modeOptions.map(val => <option>{val}</option>)}
                            </Form.Control>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="formHorizontalMode">
                        <Form.Label column sm={5}><h3>Temperature</h3></Form.Label>
                        <Col sm={6}>
                            <Form.Control type="number" size="lg" name="temp" onChange={tempFormHandler} value={formData.temp} ></Form.Control>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="formHorizontalMode">
                        <Form.Label column sm={5}><h3>Autodetect temp outside</h3></Form.Label>
                        <Col sm={6}>
                            <Form.Control as="select" size="lg" name="autodetect" onChange={tempFormHandler}>
                                <option>On</option>
                                <option>Off</option>
                            </Form.Control>
                        </Col>
                    </Form.Group>
                </Col>
            </Row>


        </div>
    )
}
