const d3 = require('d3');
require('d3-selection-multi');

const getTooltipHTML = ({ year, month, variance }, baseTemperature) => (
  `<strong>${year} - ${d3.timeFormat('%B')(new Date(month.toString()))}</strong><br />
  <strong>${d3.format('.4')(baseTemperature + variance)}</strong> \u2103<br />
  ${variance}
  `
);

const drawHeatScale = (chart, temperature, colors, viewBox) => {
  const heatScaleWidth = viewBox.width / 2;
  const heatScaleHeight = 20;
  const heatScale = d3.scaleLinear()
    .range([0, heatScaleWidth])
    .domain([temperature.min, temperature.max]);
  const heatAxis = d3.axisBottom(heatScale).tickSizeOuter(0).tickFormat(value => `${value} \u2103`);
  const heatGradient = chart.append('defs').append('linearGradient').attr('id', 'heatGradient');

  heatGradient.append('stop').attrs({ offset: '0%', 'stop-color': colors.cold });
  heatGradient.append('stop').attrs({
    offset: d3.format('.3%')(heatScale(temperature.base) / heatScaleWidth),
    'stop-color': colors.base,
  });
  heatGradient.append('stop').attrs({ offset: '100%', 'stop-color': colors.hot });

  chart.append('rect')
    .attrs({ x: 0, y: viewBox.height - heatScaleHeight })
    .attrs({ height: heatScaleHeight, width: heatScaleWidth })
    .attr('fill', 'url(#heatGradient)');

  chart.append('g')
    .attr('transform', `translate(0, ${viewBox.height})`)
    .call(heatAxis);
};

const startApp = () => {
  const fetchURL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';
  const margin = { top: 0, left: 50, bottom: 80, right: 0 };
  const padding = { bottom: 20 };
  const viewBox = { width: 1250, height: 580 };
  const width = viewBox.width - margin.left - margin.right;
  const height = viewBox.height - margin.top - margin.bottom;
  const xScale = d3.scaleBand().range([0, width]);
  const yScale = d3.scaleBand().range([0, height]);
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(month => d3.timeFormat('%B')(new Date(month.toString())));
  const tooltip = d3.select('.tooltip');
  const svgContainerNode = d3.select('.svg-container').node();
  const colors = {
    cold: d3.rgb(50, 150, 255), base: d3.rgb(255, 255, 255), hot: d3.rgb(255, 80, 0),
  };
  const temperatureScale = d3.scaleLinear().range(Object.values(colors));
  const chart = d3.select('.chart')
    .attr('viewBox', `0 0 ${viewBox.width} ${viewBox.height + padding.bottom}`)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  chart.append('text')
    .attrs({ x: width, y: viewBox.height })
    .classed('title', true)
    .text('Monthly Global Land-Surface Temperature');

  d3.json(fetchURL, (error, { monthlyVariance, baseTemperature }) => {
    const temperature = {
      min: d3.min(monthlyVariance, ({ variance }) => variance) + baseTemperature,
      base: baseTemperature,
      max: d3.max(monthlyVariance, ({ variance }) => variance) + baseTemperature,
    };

    temperatureScale.domain(Object.values(temperature));
    xScale.domain(monthlyVariance.map(({ year }) => year));
    yScale.domain(monthlyVariance.map(({ month }) => month));
    xAxis.tickValues([...new Set(monthlyVariance
      .filter(({ year }) => year % 10 === 0)
      .map(({ year }) => year))]);

    drawHeatScale(chart, temperature, colors, viewBox);
    chart.selectAll('rect')
      .data(monthlyVariance)
      .enter()
      .append('rect')
      .attrs(({ year, month, variance }) => ({
        x: xScale(year),
        y: yScale(month),
        width: xScale.bandwidth(),
        height: yScale.bandwidth(),
        fill: temperatureScale(variance + baseTemperature),
      }))
      .on('mousemove', (monthlyEntry) => {
        const [left, top] = d3.mouse(svgContainerNode).map(val => `${val}px`);

        tooltip.classed('tooltip-hidden', false)
          .html(getTooltipHTML(monthlyEntry, baseTemperature))
          .styles({ left, top });
      })
      .on('mouseout', () => tooltip.classed('tooltip-hidden', true));

    chart.append('g').attr('transform', `translate(0, ${height})`).call(xAxis);
    chart.append('g').classed('yAxis', true).call(yAxis);
  });
};

window.onload = startApp;
