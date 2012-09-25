(function($){
	$(function(){
		$.getJSON("/weight", function(weight_arr){
			// console.log(weight_arr);
			var data = [4, 8, 15, 16, 23, 42.2, 23, 42, 23.5, 12, 31, 12, 34, 23, 54, 21, 29];

			var width = 780;
			var height = 220;

			var bar_width = (width / weight_arr.length);

			// var x = d3.scale.ordinal()
			// 	// .domain(weight_arr)
			// 	// .domain([0, d3.max(weight_arr, function(entry){
			// 	// 	return parseFloat(entry.weight);
			// 	// })])
			// 	.domain([0, d3.max(data)])
			// 	// .domain(data)
			// 	.rangeBands([0, bar_width]);

			var x = d3.scale.linear()
				.domain([0,1])
				.range([0, bar_width]);
				// .domain([0, d3.max(data)])
				// .rangeBands([0, bar_width]);

			var y = d3.scale.linear()
				.domain([0, d3.max(data)])
				// .domain([0, d3.max(weight_arr, function(entry){
				// 	return parseFloat(entry.weight);
				// })])
				.range([0, height]);

			var create_graph = function(){
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
						return parseFloat(d.weight);
					})
					.enter()
					.append('rect')
					.attr('x', function(d, i){
						return x(i) + 10;
						// return x(parseFloat(d.weight)) + 10;
					})
					.attr('y', function(d){
						return height - y(parseFloat(d.weight));
					})
					// .attr('width', x.rangeBand())
					.attr('width', bar_width)
					.attr('height', function(d){
						return y(parseFloat(d.weight));
					});
			};

			create_graph();
		});
	});
})(jQuery);