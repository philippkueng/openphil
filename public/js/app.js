(function($){
	$(function(){
		$.getJSON("/weight", function(response){

			// DAY OF WEEK STATS GRAPH
			var day_of_week = response.day_of_week;

			var dow_graph = function(){
				var dow_width = 400;
				var dow_height = 300;

				var dow_chart = d3
					.select('#container')
					.append('svg')
					.attr('class', 'dow')
					.attr('width', dow_width)
					.attr('height', dow_height);

				var dow_y = function(value){
					if(value < 0){
						return 150 + (value * -100);
					} else {
						return 150 - (value * 100);
					}
				};

				// insert line
				dow_chart
					.append('line')
					.attr('x1', 0)
					.attr('x2', dow_width)
					.attr('y1', (dow_height/2) - 1)
					.attr('y2', (dow_height/2) - 1)
					.attr('stroke', '#DDD')
					.attr('stroke-width', 2);

				// insert 'min-max' weight-diff blocks
				dow_chart
					.selectAll('rect')
					.data(day_of_week, function(d){
						return d;
					})
					.enter()
					.append('rect')
					.attr('x', function(d, i){
						return i * (dow_width / 7) + 22;
					})
					.attr('width', function(d, i){
						return (dow_width / 7) - 44;
					})
					.attr('y', function(d){
						return dow_y(parseFloat(d.maximum));
					})
					.attr('height', function(d){
						return (parseFloat(d.maximum) - parseFloat(d.minimum)) * 100;
					});

				// insert 'average' bars
				dow_chart
					.selectAll('line.average')
					.data(day_of_week, function(d){
						return parseFloat(d.average);
					})
					.enter()
					.append('line')
					.attr('stroke', '#000')
					.attr('stroke-width', 2)
					.attr('x1', function(d, i){
						return i * (dow_width / 7) + 18;
					})
					.attr('x2', function(d, i){
						return (i + 1) * (dow_width / 7) - 18;
					})
					.attr('y1', function(d){
						return dow_y(parseFloat(d.average));
					})
					.attr('y2', function(d){
						return dow_y(parseFloat(d.average));
					});

			}();


			// WEIGHT CHART
			var weight_arr = response.weight;

			var weight_graph = function(){
				var width = 380;
				var height = 220;

				var bar_width = (width / weight_arr.length);

				var x = d3.scale.linear()
					.domain([0,1])
					.range([0, bar_width]);

				var y = d3.scale.linear()
					.domain([0, d3.max(weight_arr, function(entry){
						return parseFloat(entry.weight) - 43;
					})])
					.range([0, height]);

				var chart = d3
					.select('#container')
					.append('svg')
					.attr('class', 'chart')
					.attr('width', width + 20)
					.attr('height', 2 * height + 40);

				// insert line
				chart
					.append("line")
					.attr("x1", 10)
					.attr("x2", width + 10)
					.attr("y1", height + 10)
					.attr("y2", height + 10)
					.attr("stroke", "#000")
					.attr("stroke-width", 2);

				// insert the bars
				chart
					.selectAll('rect')
					.data(weight_arr, function(d){
						return parseFloat(d.weight) - 43;
					})
					.enter()
					.append('rect')
					.attr('x', function(d, i){
						return x(i) + 10;
					})
					.attr('y', function(d){
						return height - y(parseFloat(d.weight) - 43);
					})
					.attr('width', bar_width)
					.attr('height', function(d){
						return y(parseFloat(d.weight) - 43);
					});

			}();
		});
	});
})(jQuery);