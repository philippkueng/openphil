
  $.getJSON("data/data_count.json", function(data) {
    var create_graph, height, width;
    width = 780;
    height = 220;
    window.data = data;
    create_graph = function() {
      var chart, end_date, start_date, x, y, y_weight;
      chart = d3.select('#container').append('svg:svg').attr('class', 'chart').attr('width', width + 20).attr('height', 2 * height + 40).append('svg:g').attr('transform', 'translate(10,15)');
      start_date = moment(new Date(data[0].date)).add('days', 1);
      end_date = moment(new Date(data[0].date)).subtract('days', 30);
      x = d3.time.scale().domain([end_date["native"](), start_date["native"]()]).rangeRound([0, width]);
      y = d3.scale.linear().domain([
        0, d3.max(data, function(day) {
          return day.count;
        })
      ]).range([0, height]);
      y_weight = d3.scale.linear().domain([
        40, d3.max(data, function(day) {
          if (day.weight != null) {
            return day.weight;
          } else {
            return 0;
          }
        })
      ]).rangeRound([0, height]);
      chart.selectAll('rect').data(data).enter().append('svg:rect').attr('x', function(d, i) {
        return x(new Date(d.date));
      }).attr('y', function(d, i) {
        return height - y(d.count);
      }).attr('width', function(d, i) {
        var x_end_date;
        x_end_date = x(moment(new Date(d.date)).add('days', 1)["native"]());
        return x_end_date - x(new Date(d.date)) - 1;
      }).attr('height', function(d, i) {
        return y(d.count);
      }).attr('stroke-width', 0);
      chart.selectAll('text').data(data).enter().append('svg:text').attr('x', function(d, i) {
        return x(new Date(d.date));
      }).attr('y', function(d, i) {
        return height - y(d.count);
      }).attr('dx', "0.9em").attr('dy', 16).attr('text-anchor', 'middle').text(function(d, i) {
        return d.count;
      });
      chart.selectAll('text.days').data(x.ticks(40)).enter().append('svg:text').attr('class', 'days').attr('x', function(d, i) {
        return x(d) + 10;
      }).attr('y', height + 20).attr('text-anchor', 'middle').text(function(d) {
        return d.getDate();
      });
      chart.append('svg:line').attr('y1', height + 2).attr('y2', height + 2).attr('x1', 20).attr('x2', width - 1).attr('stroke', '#000').attr('stroke-width', 2);
      chart.append('svg:line').attr('y1', height + 28).attr('y2', height + 28).attr('x1', 20).attr('x2', width - 1).attr('stroke', '#000').attr('stroke-width', 2);
      chart.selectAll('rect.weight').data(data).enter().append('svg:rect').attr('class', 'weight').attr('x', function(d, i) {
        return x(new Date(d.date));
      }).attr('y', function(d, i) {
        return height + 30;
      }).attr('width', function(d, i) {
        var x_end_date;
        x_end_date = x(moment(new Date(d.date)).add('days', 1)["native"]());
        return x_end_date - x(new Date(d.date)) - 1;
      }).attr('height', function(d, i) {
        if (d.weight != null) {
          return y_weight(d.weight);
        } else {
          return 0;
        }
      }).attr('stroke-width', 0);
      return chart.selectAll('text.weight').data(data).enter().append('svg:text').attr('class', 'weight').attr('x', function(d, i) {
        return x(new Date(d.date));
      }).attr('y', function(d, i) {
        if (d.weight != null) {
          return height + 20 + y_weight(d.weight);
        } else {
          return 0;
        }
      }).attr('dx', "1.4em").attr('dy', 0).attr('text-anchor', 'middle').text(function(d, i) {
        if (d.weight != null) {
          return d.weight;
        } else {
          return null;
        }
      });
    };
    return setTimeout(function() {
      return create_graph();
    }, 1000);
  });
