(function($){
	$(function(){
		$.getJSON("/weight", function(weight_arr){
			// console.log(weight_arr);
			var data = [4, 8, 15, 16, 23, 42, 23, 42, 23, 12, 31, 12, 34, 23, 54, 21, 29];

			var width = 780;
			var height = 220;

			var x = d3.scale.ordinal()
				.domain(data)
				.rangeBands([0, width]);

			var y = d3.scale.linear()
				.domain([0, d3.max(data)])
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
					.attr("stroke-width", 2)

				// insert the bars
				chart
					.selectAll('rect')
					.data(data)
					.enter()
					.append('rect')
					.attr('x', function(d){
						return x(d) + 10;
					})
					.attr('y', function(d){
						return height - y(d);
					})
					.attr('width', x.rangeBand())
					.attr('height', y);
			};

			create_graph();
		});
	});
})(jQuery);