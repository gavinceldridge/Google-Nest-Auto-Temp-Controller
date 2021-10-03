import 'bootstrap/dist/css/bootstrap.min.css';
import ThermostatController from './ThermostatController';
import { React } from "react";
import Container from "react-bootstrap/Container";
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
