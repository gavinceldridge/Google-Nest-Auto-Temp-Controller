# Google Nest Auto Temp Controller

![Screenshot](Screenshot.png)

A tool to control my Nest Home Thermostat to automatically turn off when the outside temperature is cooler than the inside AC. This will hopefully do some good for my power bill as well as the environment! It includes a manual controller so my roommates and I can change the thermostat should we forget if we left the house or are just feeling too potato-y to go to the physical thermostat.

### Disclaimer
The source code here is old. New code can be found at the following repositories:
- [Backend](https://github.com/gavinceldridge/Nest-Backend)
- [Frontend](https://github.com/gavinceldridge/Nest-Frontend)

## Tech Stack:
### Backend:
- [Node.js](https://nodejs.dev/)
- [Express](https://expressjs.com/)
### Frontend:
- [React.js](https://reactjs.org/)
  - [React-Bootstrap](https://react-bootstrap-v4.netlify.app/)
### APIs and Device
- [Google Nest Home Device](https://store.google.com/us/category/connected_home?hl=en-US)
  - [Google Device Access Console](https://console.nest.google.com/u/1/device-access/project-list)
  - [Google Smart Device Management API](https://developers.google.com/nest/device-access/get-started)
- [Open Weather API](https://openweathermap.org/current)

## Current Goals:
- Add text notifications using [Twilio](https://www.twilio.com/)
- Make it easily adoptable for others (even the non-tech oriented)

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
