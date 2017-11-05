const d3 = require('d3');
require('d3-selection-multi');

const startApp = () => {
  const fetchURL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';
  const margin = { top: 20, left: 20, bottom: 20, right: 0 };
  const viewBox = { width: 1000, height: 600 };
  const width = viewBox.width - margin.left - margin.right;
  const height = viewBox.height - margin.top - margin.bottom;
  const xScale = d3.scaleBand().range([0, width]);
  const yScale = d3.scaleBand().range([0, height]);
  const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
  const chart = d3.select('.chart')
    .attr('viewBox', `0 0 ${viewBox.width} ${viewBox.height}`)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  d3.json(fetchURL, (error, { monthlyVariance, baseTemperature }) => {
    xScale.domain(monthlyVariance.map(({ year }) => year));
    yScale.domain(monthlyVariance.map(({ month }) => month));

    chart.selectAll('rect')
      .data(monthlyVariance)
      .enter()
      .append('rect')
      .attrs(({ year, month }) => ({ x: xScale(year), y: yScale(month) }))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth());
  });
};

window.onload = startApp;
