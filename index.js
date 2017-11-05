const d3 = require('d3');
require('d3-selection-multi');

const startApp = () => {
  const fetchURL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

  d3.json(fetchURL, (error, data) => {
    console.log(data);
  });
};

window.onload = startApp;
