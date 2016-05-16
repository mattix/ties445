function truncate(str, maxLength, suffix) {
	if(str.length > maxLength) {
		str = str.substring(0, maxLength + 1); 
		str = str.substring(0, Math.min(str.length, str.lastIndexOf(" ")));
		str = str + suffix;
	}
	return str;
}

var maximumAmount = 0;

var margin = {top: 20, right: 200, bottom: 0, left: 25},
	width = 700,
	height = 900;

var start_year = 1891,
	end_year = 1950;

var c = d3.scale.category20c();

var x = d3.scale.linear()
	.range([0, width]);

var xAxis = d3.svg.axis()
	.scale(x)
    .tickValues([1891,1896,1901,1906,1911,1916,1921,1926,1931,1936,1941,1946])
	.orient("top");

var formatYears = function(year) {
        return year.toString() + '-' + (year + 4).toString();
};
xAxis.tickFormat(formatYears);

var svg = d3.select("body").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.style("margin-left", margin.left + "px")
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var dsv = d3.dsv(';', 'text/plain');
dsv('../csv/1891-1950.csv', type, function(error, data) {
    x.domain([start_year, end_year]);
	var xScale = d3.scale.linear()
		.domain([start_year, end_year])
		.range([0, width]);

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + 0 + ")")
		.call(xAxis);

	for (var j = 0; j < data.length; j++) {
		var g = svg.append("g").attr("class","yearly");

		var circles = g.selectAll("circle")
			.data(data[j]['years'])
			.enter()
			.append("circle");

		var text = g.selectAll("text")
			.data(data[j]['years'])
			.enter()
			.append("text");

		var rScale = d3.scale.linear()
			.domain([0, maximumAmount])
			.range([2, 20]);

		circles
			.attr("cx", function(d, i) { return xScale(parseInt(d[0])); })
			.attr("cy", j*30+20)
			.attr("r", function(d) { 
            return rScale(d[1]); })
			.style("fill", function(d) { return c(j); });

		text
			.attr("y", j*30+25)
			.attr("x",function(d, i) { return xScale(parseInt(d[0]))-5; })
			.attr("class","value")
			.text(function(d){ return d[1]; })
			.style("fill", function(d) { return c(j); })
			.style("display","none");

		g.append("text")
			.attr("y", j*30+25)
			.attr("x",width+20)
			.attr("class","label")
			.text(data[j]['name'])
			.style("fill", function(d) { return c(j); })
			.on("mouseover", mouseover)
			.on("mouseout", mouseout);
	};

	function mouseover(p) {
		var g = d3.select(this).node().parentNode;
		d3.select(g).selectAll("circle").style("display","none");
		d3.select(g).selectAll("text.value").style("display","block");
	}

	function mouseout(p) {
		var g = d3.select(this).node().parentNode;
		d3.select(g).selectAll("circle").style("display","block");
		d3.select(g).selectAll("text.value").style("display","none");
	}
});

function type(d) {
    var parsed = {};
    parsed.name = d[''];
    parsed.years = [];
    parsed.total = 0;
    for (var property in d) {
        if (d.hasOwnProperty(property) && property !== '') {
            var amount = parseFloat(d[property]);
            if (isNaN(amount)) amount = 0;
            var yearData = [property, amount];
            parsed.years.push(yearData);
            parsed.total += amount;
            if (amount > maximumAmount) maximumAmount = amount;
        }
    }
    return parsed;
}
