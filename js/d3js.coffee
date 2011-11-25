$.getJSON("worker/data_count.json", (data) ->
  console.log(data)
)

data = [4, 8, 15, 16, 23, 42]

chart = d3.select('#container')
  .append('svg:svg')
    .attr('class', 'chart')
    .attr('width', 440)
    .attr('height', 20 * data.length + 20)
  .append('svg:g')
    .attr('transform', 'translate(10,15)')

x = d3.scale.linear()
    .domain([0, d3.max(data)])
    .range([0, 420])

y = d3.scale.ordinal()
    .domain(data)
    .rangeBands([0, 120])

chart.selectAll('line').data(x.ticks(10)).enter().append('svg:line')
    .attr('x1', (d) -> return x(d) + 0.5)
    .attr('x2', (d) -> return x(d) + 0.5)
    .attr('y1', 0)
    .attr('y2', 120 - 1)
    .attr('stroke', '#000')
    .attr('stroke-width', 1)

chart.selectAll('rect').data(data).enter().append('svg:rect')
    .attr('y', y)
    .attr('width', x)
    .attr('height', y.rangeBand() - 1)
    .attr('stroke-width', 0)

chart.selectAll('text').data(data).enter().append('svg:text')
    .attr('x', x)
    .attr('y', (d) -> return y(d) + y.rangeBand() / 2)
    .attr('dx', -3)
    .attr('dy', ".25em")
    .attr('text-anchor', 'end')
    .text(String)

chart.selectAll('text.rule').data(x.ticks(10)).enter().append('svg:text')
    .attr('class', 'rule')
    .attr('x', x)
    .attr('y', 0)
    .attr('dy', -3)
    .attr('text-anchor', 'middle')
    .text(String)

chart.append('svg:line')
    .attr('x', 0)
    .attr('y1', 0)
    .attr('y2', 120 - 1)
    .attr('stroke', '#000')
    .attr('stroke-width', 2)
