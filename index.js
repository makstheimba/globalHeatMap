const d3 = require('d3');
require('d3-selection-multi');

const getTooltipHTML = ({ year, month, variance }, baseTemperature) => (
  `<strong>${year} - ${d3.timeFormat('%B')(new Date(month.toString()))}</strong><br />
  <strong>${d3.format('.4')(baseTemperature + variance)}</strong><br />
  ${variance}
  `
);


const startApp = () => {
  const fetchURL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';
  const margin = { top: 30, left: 50, bottom: 20, right: 0 };
  const viewBox = { width: 1250, height: 600 };
  const width = viewBox.width - margin.left - margin.right;
  const height = viewBox.height - margin.top - margin.bottom;
  const xScale = d3.scaleBand().range([0, width]);
  const yScale = d3.scaleBand().range([0, height]);
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(month => d3.timeFormat('%B')(new Date(month.toString())));
  const tooltip = d3.select('.tooltip');
  const svgContainerNode = d3.select('.svg-container').node();
  const chart = d3.select('.chart')
    .attr('viewBox', `0 0 ${viewBox.width} ${viewBox.height}`)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  chart.append('text')
    .attrs({ x: width, y: -10 })
    .classed('title', true)
    .text('Monthly Global Land-Surface Temperature');

  d3.json(fetchURL, (error, { monthlyVariance, baseTemperature }) => {
    xScale.domain(monthlyVariance.map(({ year }) => year));
    yScale.domain(monthlyVariance.map(({ month }) => month));
    xAxis.tickValues([...new Set(monthlyVariance
      .filter(({ year }) => year % 10 === 0)
      .map(({ year }) => year))]);

    chart.selectAll('rect')
      .data(monthlyVariance)
      .enter()
      .append('rect')
      .attrs(({ year, month }) => ({ x: xScale(year), y: yScale(month) }))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .on('mousemove', (monthlyEntry) => {
        const [left, top] = d3.mouse(svgContainerNode).map(val => `${val}px`);

        tooltip.classed('tooltip-hidden', false)
          .html(getTooltipHTML(monthlyEntry, baseTemperature))
          .style('left', left)
          .style('top', top);
      })
      .on('mouseout', () => tooltip.classed('tooltip-hidden', true));

    chart.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    chart.append('g').classed('yAxis', true).call(yAxis);
  });
};

window.onload = startApp;
