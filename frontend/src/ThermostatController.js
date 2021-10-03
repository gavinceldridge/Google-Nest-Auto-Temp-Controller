import { React, useState, useEffect } from 'react'
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import BackendApi from './BackendApi';

export default function ThermostatController() {

	const [formData, setFormData] = useState({ mode: "", modeOptions: ["OFF", "COOL", "HEAT"], temp: "", autoStatus: "" });


	const convertCelsiusToFahrenheit = (cel) => {
		return (cel * (9 / 5) + 32);
	}

	const convertFahrenheitToCelsius = (far) => {
		return (far - 32) * 5 / 9;
	}

	//initialize UI data
	useEffect(() => {
		const initData = async () => {

			const deviceInfo = await BackendApi.getDeviceInfo();
			const mode = deviceInfo.devices[0].traits["sdm.devices.traits.ThermostatMode"].mode;
			document.getElementById("mode").value = mode;

			let temp = "";
			if (mode === "COOL") temp = convertCelsiusToFahrenheit(deviceInfo.devices[0].traits["sdm.devices.traits.ThermostatTemperatureSetpoint"]['coolCelsius']);
			else if (mode === "HEAT") temp = convertCelsiusToFahrenheit(deviceInfo.devices[0].traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].heatCelsius);
			document.getElementById("temp").value = temp;
			temp = temp.toFixed(1);

			//get the current status of the smart detector
			const statusResponse = await BackendApi.changeTimer("");
			const status = statusResponse.status.toUpperCase();
			document.getElementById("autodetect").value = status;
			setFormData(data => ({
				...data,
				mode: mode,
				temp: temp,
				autoStatus: status
			}));
		}

		initData();

	}, []);

	const formChangeHandler = async (evt) => {

		// console.log(evt.target.value);
		const { name, value } = evt.target;
		setFormData(data => ({
			...data,
			[`${name}`]: value
		}));

		if (name === "mode") {
			await BackendApi.changeMode(value.toUpperCase());
		} else if (name === "autodetect") {

		}
	}

	const changeTemp = async () => {
		console.log(`changing temp to: ${formData.temp}`)
		await BackendApi.changeTemperature(formData.temp, formData.mode);
	}

	return (
		<div className="mt-3">
			<Row className="justify-content-center">
				<h1>Temperature Controller</h1>
			</Row>
			<Row className="justify-content-center mt-5">
				<Col xs={8}>

					<Form.Group as={Row} id="mode">
						<Form.Label column sm={5}><h3>Mode</h3></Form.Label>
						<Col sm={6}>
							<Form.Control as="select" size="lg" name="mode" onChange={formChangeHandler} value={formData.mode} >
								{formData.modeOptions.map(val => <option key={val}>{val}</option>)}
							</Form.Control>
						</Col>
					</Form.Group>

					<Form.Group as={Row} id="temp">
						<Form.Label column sm={5}><h3>Temperature</h3></Form.Label>
						<Col sm={5}>
							<Form.Control type="number" size="lg" name="temp" onChange={formChangeHandler} value={formData.temp} data-testid="tempId"></Form.Control>
						</Col>
						<Col sm={1}>
							<Button variant="primary" name="confirm" onClick={changeTemp} data-testid="confirmBtn">Confirm</Button>
						</Col>

					</Form.Group>

					<Form.Group as={Row} id="autodetect">
						<Form.Label column sm={5}><h3>Autodetect temp outside</h3></Form.Label>
						<Col sm={6}>
							<Form.Control as="select" size="lg" name="autodetect" onChange={formChangeHandler}>
								<option key={1}>ON</option>
								<option key={2}>OFF</option>
							</Form.Control>
						</Col>
					</Form.Group>
				</Col>
			</Row >


		</div >
	)
}
