$.getJSON("data/data_count.json", (data) ->
  
  width = 780
  height = 220
  
  create_graph = () ->  
    chart = d3.select('#container')
      .append('svg:svg')
        .attr('class', 'chart')
        .attr('width', width + 20)
        .attr('height', 2 * height + 40)
      .append('svg:g')
        .attr('transform', 'translate(10,15)')
    
    start_date = moment(new Date(data[0].date)).add('days',1)
    end_date = moment(new Date(data[0].date)).subtract('days', 30)

    x = d3.time.scale()
        .domain([end_date.native(), start_date.native()])
        .rangeRound([0, width])
    
    y = d3.scale.linear()
        .domain([0, d3.max(data, (day) -> return day.count)])
        .range([0, height])

    y_weight = d3.scale.linear()
        .domain([40, d3.max(data, (day) -> if day.weight? then return day.weight else return 0)])
        .rangeRound([0, height])
        # .range([height + 40, 2 * height])
    
    # chart.selectAll('line').data(y.ticks(10)).enter().append('svg:line')
    #     .attr('x1', 20)
    #     .attr('x2', width - 1 + 20)
    #     .attr('y1', (d) -> return y(d) + 0.5)
    #     .attr('y2', (d) -> return y(d) + 0.5)
    #     .attr('stroke', '#000')
    #     .attr('stroke-width', 1)

    chart.selectAll('rect').data(data).enter().append('svg:rect')
        .attr('x', (d,i) -> return x(new Date(d.date)))
        .attr('y', (d,i) -> return height - y(d.count))
        .attr('width', (d,i) ->
          x_end_date = x(moment(new Date(d.date)).add('days', 1).native())
          return x_end_date - x(new Date(d.date)) - 1
        )
        .attr('height', (d, i) -> return y(d.count))
        .attr('stroke-width', 0)
    
    # number on items bar
    chart.selectAll('text').data(data).enter().append('svg:text')
        .attr('x', (d,i) -> return x(new Date(d.date)))
        .attr('y', (d,i) -> return height - y(d.count))
        .attr('dx', "0.9em")
        .attr('dy', 16)
        .attr('text-anchor', 'middle')
        .text((d,i) -> return d.count)
    
    # y-axis marker
    # chart.selectAll('text.rule').data(y.ticks(10)).enter().append('svg:text')
    #     .attr('class', 'rule')
    #     .attr('x', 0)
    #     .attr('y', (d,i) -> return height - y(d) + 5)
    #     .attr('dx', 10)
    #     .attr('text-anchor', 'end')
    #     .text(String)
    
    # x-axis marker
    chart.selectAll('text.days').data(x.ticks(40)).enter().append('svg:text')
        .attr('class', 'days')
        .attr('x', (d,i) -> return x(d) + 10)
        .attr('y', height + 20)
        .attr('text-anchor', 'middle')
        .text((d) -> return d.getDate())
  
    # x-axis line top
    chart.append('svg:line')
        .attr('y1', height + 2)
        .attr('y2', height + 2)
        .attr('x1', 20)
        .attr('x2', width - 1)
        .attr('stroke', '#000')
        .attr('stroke-width', 2)
        
    # x-axis line bottom
    chart.append('svg:line')
        .attr('y1', height + 28)
        .attr('y2', height + 28)
        .attr('x1', 20)
        .attr('x2', width - 1)
        .attr('stroke', '#000')
        .attr('stroke-width', 2)
        
    # weight bar
    chart.selectAll('rect.weight').data(data).enter().append('svg:rect')
        .attr('class', 'weight')
        .attr('x', (d,i) -> return x(new Date(d.date)))
        .attr('y', (d,i) -> return height + 30)
        .attr('width', (d,i) ->
          x_end_date = x(moment(new Date(d.date)).add('days', 1).native())
          return x_end_date - x(new Date(d.date)) - 1
        )
        .attr('height', (d, i) -> if d.weight? then (y_weight(d.weight)) else 0)
        # .attr('height', (d, i) -> return (y_weight(if d.weight?)))
        .attr('stroke-width', 0)
        
    # number on weight bar
    chart.selectAll('text.weight').data(data).enter().append('svg:text')
        .attr('class', 'weight')
        .attr('x', (d,i) -> return x(new Date(d.date)))
        # .attr('y', (d,i) -> return height + y_weight(d.weight)
        .attr('y', (d, i) -> if d.weight? then height + 20 + y_weight(d.weight) else 0)
        .attr('dx', "1.4em")
        .attr('dy', 0)
        .attr('text-anchor', 'middle')
        .text((d,i) -> if d.weight? then d.weight else null)
  
  setTimeout(() ->
    create_graph()
  , 1000)
  
)

