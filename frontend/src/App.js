import 'bootstrap/dist/css/bootstrap.min.css';
import ThermostatController from './ThermostatController';
import { React, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import BackendApi from "./BackendApi";
// import "./App.css";

function App() {


  return (
    <>
      <Container className="">
        <ThermostatController />
      </Container>
    </>
  );
}

export default App;
