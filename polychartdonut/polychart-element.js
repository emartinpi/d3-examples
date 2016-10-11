Polymer({
    is: 'polychart-element',

    ready: function() {
        var width = 960,
        height = 500,
        radius = Math.min(width, height) / 2;

        var color = d3.scale.ordinal()
	        .range(["#3399FF", "#5DAEF8", "#86C3FA", "#cccccc"]);

        var pie = d3.layout.pie()
            .value(function(d) { 
                return d.apples; 
            })
            .sort(null);

        var arc = d3.svg.arc()
            .outerRadius(function(d, i){
                return i !== 3 ? radius : radius-10;
            })
            .innerRadius(function(d, i){
                return i !== 3 ? radius/1.3 : radius/1.3+10;
            });

        var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        d3.tsv("../data.tsv", type, function(error, data) {
            var path = svg.datum(data).selectAll("path")
                .data(function() {
                    return pie(data); //se transforman los datos de numeros a radianes
                })
            .enter().append("path")
                .attr("fill", function(d, i) { 
                    return color(i); 
                })
                .each(function(d) { 
                    this._current = d; 
                }) // store the initial angles
                .transition().ease("exp").duration(2000).attrTween("d", tweenPie);

            function tweenPie(d, index) {
                var i = d3.interpolate({startAngle: 0, endAngle: 0}, d);
                return function(t) {
                    return arc(i(t), index);
                }
            }

            d3.selectAll("input")
                .on("change", change);

            var timeout = setTimeout(function() {
                d3.select("input[value=\"oranges\"]").property("checked", true).each(change);
            }, 3000);

            function change() {
                var value = this.value;
                clearTimeout(timeout);
                pie.value(function(d) { 
                    return d[value]; 
                }); // change the value function
                path = svg.datum(data).selectAll("path").data(pie); // compute the new angles
                path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
            }
        });

        function type(d) {
            d.apples = +d.apples || 0;
            d.oranges = +d.oranges || 0;
            return d;
        }

        // Store the displayed angles in _current.
        // Then, interpolate from _current to the new angles.
        // During the transition, _current is updated in-place by d3.interpolate.
        function arcTween(a, index) {
            var i = d3.interpolate(this._current, a);
            this._current = i(1);
            return function(t) {
                return arc(i(t), index);
            };
        }
    }
});