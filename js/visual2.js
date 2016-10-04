$(function() {
  var margin = {
      top: 50,
      right: 0,
      bottom: 100,
      left: 30
    },
    width = 960 - margin.left - margin.right,
    height = 430 - margin.top - margin.bottom,
    gridSize = Math.floor(width / 24),
    legendElementWidth = gridSize * 2,
    buckets = 9,
    colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"],
    days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    times = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];

  var svg = d3.select("#visual2").append("svg")
    .attr("id","visual2-svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var dayLabels = svg.selectAll(".dayLabel")
    .data(days)
    .enter().append("text")
    .text(function(d) {
      return d;
    })
    .attr("x", 0)
    .attr("y", function(d, i) {
      return i * gridSize;
    })
    .style("text-anchor", "end")
    .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
    .attr("class", function(d, i) {
      return ((i >= 1 && i <= 5) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis");
    });

    // Define the div for the tooltip
  var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  var timeLabels = svg.selectAll(".timeLabel")
    .data(times)
    .enter().append("text")
    .text(function(d) {
      return d;
    })
    .attr("x", function(d, i) {
      return i * gridSize;
    })
    .attr("y", 0)
    .style("text-anchor", "middle")
    .attr("transform", "translate(" + gridSize / 2 + ", -6)")
    .attr("class", function(d, i) {
      return ((i >= 9 && i <= 17) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis");
    });

  function formatTooltip(d) {
    return 'Total Commits: ' + d.value;
  }

  function heatmapChart() {
    $.getJSON('./data/punchcard.json')
      .done(function(data) {
        var dataset = data.map(function(d) {
          return {
            day: +d[0],
            hour: +d[1],
            value: +d[2]
          };
        });

        var colorScale = d3.scale.quantile()
          .domain([0, buckets - 1, d3.max(dataset, function(d) {
            return d.value;
          })])
          .range(colors);

        var cards = svg.selectAll(".hour")
          .data(dataset, function(d) {
            return d.day + ':' + d.hour;
          });

        cards.append("title");

        cards.enter().append("rect")
          .attr("x", function(d) {
            return d.hour * gridSize;
          })
          .attr("y", function(d) {
            return d.day * gridSize;
          })
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("class", "hour bordered")
          .attr("width", gridSize)
          .attr("height", gridSize)
          .style("fill", colors[0])
          .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div	.html(formatTooltip(d))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 20) + "px");
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(200)
                    .style("opacity", 0);
            });

        cards.transition().duration(1000)
          .style("fill", function(d) {
            return colorScale(d.value);
          });

        cards.select("title").text(function(d) {
          return d.value;
        });

        cards.exit().remove();

        var legend = svg.selectAll(".legend")
          .data([0].concat(colorScale.quantiles()), function(d) {
            return d;
          });

        legend.enter().append("g")
          .attr("class", "legend");

        legend.append("rect")
          .attr("x", function(d, i) {
            return legendElementWidth * i;
          })
          .attr("y", height)
          .attr("width", legendElementWidth)
          .attr("height", gridSize / 2)
          .style("fill", function(d, i) {
            return colors[i];
          });

        legend.append("text")
          .attr("class", "mono")
          .text(function(d) {
            return "≥ " + Math.round(d);
          })
          .attr("x", function(d, i) {
            return legendElementWidth * i;
          })
          .attr("y", height + gridSize);

        legend.exit().remove();

      });
  }

  heatmapChart();
});
