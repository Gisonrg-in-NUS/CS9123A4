$(function() {
  var width = 960,
    height = 500,
    radius = Math.min(width, height) / 2;

  var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

  var labelArc = d3.svg.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);

  var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) {
      return d.lines;
    });

  var svg = d3.select("#visual3").append("svg")
    .attr("id","visual3-svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  d3.json("./data/language.json", function(error, data) {
    var dataset = [];
    $.each(data, function(key, val) {
      dataset.push({
        language: key,
        lines: val
      })
    });
    if (error) throw error;

    var g = svg.selectAll(".arc")
      .data(pie(dataset))
      .enter().append("g")
      .attr("class", "arc");

    g.append("path")
      .attr("d", arc)
      .style("fill", function(d) {
        return color(d.data.language);
      });

    g.append("text")
      .attr("transform", function(d) {
        return "translate(" + labelArc.centroid(d) + ")";
      })
      .attr("dy", ".35em")
      .text(function(d) {
        return d.data.language;
      });
  });
});
