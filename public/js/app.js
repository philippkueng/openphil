(function($){
	$(function(){
		$.getJSON("/weight", function(response){

			// DAY OF WEEK STATS GRAPH
			var day_of_week = response.day_of_week;

			// var dow_days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
			var dow_days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

			var dow_graph = function(){
				var dow_width = 330;
				var dow_height = 300;
				var bar_width = 11.785714285714286;

				var dow_chart = d3
					.select('#diff_stats_container')
					.append('svg')
					.attr('class', 'dow')
					.attr('width', dow_width + 30)
					.attr('height', dow_height + 70);

				var x = d3.scale.linear()
					.domain([0,1])
					.range([0, (dow_width / 7)]);

				var y = d3.scale.linear()
					.domain([1.5, -1.5])
					.range([0, (dow_height)]);

				// insert kg lines
				dow_chart
					.selectAll('line')
					.data(y.ticks(10))
					.enter()
					.append('line')
					.attr('x1', 0)
					.attr('x2', dow_width + 30)
					.attr('y1', y)
					.attr('y2', y)
					.style('stroke', '#999');

				// insert kg-line markers
				dow_chart
					.selectAll('text')
					.data(y.ticks(10))
					.enter()
					.append('text')
					.attr('class', 'marker')
					.attr('x', 0)
					.attr('y', function(i){
						return y(i) - 3;
					})
					.text(function(d){
						return d + ' kg';
					});

				// insert line
				dow_chart
					.append('line')
					.attr('x1', 0)
					.attr('x2', dow_width + 30)
					.attr('y1', function(d, i){
						return y(0);
					})
					.attr('y2', function(d, i){
						return y(0);
					})
					.attr('stroke', '#999')
					.attr('stroke-width', 2);

				// insert min-max diff-blocks
				dow_chart
					.selectAll('rect')
					.data(day_of_week, function(d){
						return d.average;
					})
					.enter()
					.append('rect')
					.attr('x', function(d, i){
						return x(i) + 23 + 30;
					})
					.attr('y', function(d){
						return y(d.maximum);
					})
					.attr('width', bar_width)
					.attr('height', function(d){
						return (d.maximum + (d.minimum * -1)) * 100;
					});

				// insert weight averages
				dow_chart
					.selectAll('line.average')
					.data(day_of_week, function(d){
						return d.average;
					})
					.enter()
					.append('line')
					.attr('stroke', '#000')
					.attr('stroke-width', 2)
					.attr('x1', function(d, i){
						return x(i) + 21 + 30;
					})
					.attr('x2', function(d, i){
						return x(i) + 21 + bar_width + 4 + 30;
					})
					.attr('y1', function(d, i){
						return y(d.average);
					})
					.attr('y2', function(d, i){
						return y(d.average);
					});

				// insert weekday names
				dow_chart
					.selectAll('text')
					.data(day_of_week, function(d){
						return parseFloat(d.average);
					})
					.enter()
					.append('text')
					.attr('class', 'marker')
					.attr('x', function(d, i){
						return i * (dow_width / 7) + 14 + 30;
					})
					.attr('y', dow_height - 3)
					.text(function(d){
						return dow_days[parseInt(d.day_of_week)];
					});

				// remove top weight line
				dow_chart
					.append('line')
					.attr('x1', 0)
					.attr('x2', dow_width + 30)
					.attr('y1', 0)
					.attr('y2', 0)
					.attr('stroke', '#fff')
					.attr('stroke-width', 1);

			}();


			// WEIGHT CHART
			var weight_arr = response.weight;

			var weight_graph = function(){
				var width = 330;
				var height = 200;

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
					.select('#weight_container')
					.append('svg')
					.attr('class', 'chart')
					.attr('width', width + 30)
					.attr('height', height + 70);

				// weight lines
				chart
					.selectAll('line')
					.data(y.ticks(6))
					.enter()
					.append('line')
					.attr('x1', 0)
					.attr('x2', width + 30)
					.attr('y1', y)
					.attr('y2', y)
					.style('stroke', '#000');

				// weight lines markers
				chart
					.selectAll(".weight_markers")
					.data(y.ticks(6))
					.enter()
					.append('text')
					.attr('class', 'weight_markers')
					.attr('x', 0)
					.attr('y', function(d){
						return height - y(d) - 3;
					})
					.text(function(d){
						return (parseFloat(d) + 43) + ' kg';
					});

				// insert the bars
				chart
					.selectAll('rect')
					.data(weight_arr, function(d){
						return parseFloat(d.weight) - 43;
					})
					.enter()
					.append('rect')
					.attr('x', function(d, i){
						return x(i) + 30;
					})
					.attr('y', function(d){
						return height - y(parseFloat(d.weight) - 43);
					})
					.attr('width', bar_width)
					.attr('height', function(d){
						return y(parseFloat(d.weight) - 43);
					});

				// date markers
				chart
					.selectAll('text')
					.data(weight_arr, function(d){
						return parseFloat(d.weight) - 43;
					})
					.enter()
					.append('text')
					.attr('x', function(d, i){
						return x(i) + 30;
					})
					.attr('y', height + 10)
					.attr('dx', 2)
					.text(function(d, i){
						var date = moment(d.date);
						return date.date();
						// return i;
					});

				// month markers
				chart
					.selectAll('text.month')
					.data(weight_arr, function(d){
						return parseFloat(d.weight);
					})
					.enter()
					.append('text')
					.attr('x', function(d, i){
						return x(i) + 30;
					})
					.attr('y', height + 20)
					.attr('dx', 2)
					.text(function(d, i){
						var date = moment(d.date);
						return date.month() + 1;
					});

				// lower cover line
				chart
					.append('line')
					.attr('x1', 0)
					.attr('x2', width + 30)
					.attr('y1', height)
					.attr('y2', height)
					.style('stroke', '#000');

				// upper cover line
				chart
					.append('line')
					.attr('x1', 0)
					.attr('x2', width + 30)
					.style('stroke', '#fff');

				// insert date marker
				chart
					.append('text')
					.attr('x', 0)
					.attr('y', height + 10)
					.text('Day');

				// insert month marker
				chart
					.append('text')
					.attr('x', 0)
					.attr('y', height + 20)
					.text('Month');

			}();
		});
	});
})(jQuery);