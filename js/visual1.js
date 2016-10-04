$(function() {
  var causes = ["wounds", "other", "disease"];
  var types = ["additions", "deletions", "commits"];

  var margin = {
      top: 50,
      right: 50,
      bottom: 200,
      left: 100
    },
    width = 2000 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
    .rangeRoundBands([0, width]);

  var y = d3.scale.linear()
    .rangeRound([height, 0]);

  var z = d3.scale.category10();

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(2);

  var yAxis = d3.svg.axis()
    .scale(y)
    .tickSize(2)
    .orient("left");

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<strong>"+d.label+"</strong> <span style='color:red'>" + d.y + "</span>";
    });

  var showAll = d3.select('#visual1').append("button")
          .attr("type","button")
          .attr("class","btn btn-primary bar-chart-button")
          .text("Show all")
          .on("click", function() {
            buildGraph('all');
          });

  var topTenOnly = d3.select('#visual1').append("button")
          .attr("type","button")
          .attr("class","btn btn-primary bar-chart-button")
          .text("Top 10 only")
          .on("click", function() {
            buildGraph('topten');
          });

  var hideTopTen = d3.select('#visual1').append("button")
          .attr("type","button")
          .attr("class","btn btn-primary bar-chart-button")
          .text("Hide top ten")
          .on("click", function() {
            buildGraph('hidetopten');
          });

  function buildGraph(mode) {
    d3.select("#visual1-svg").remove();
    var svg = d3.select("#visual1").append("svg")
      .attr("id","visual1-svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.call(tip);
    d3.json("./data/contributors.json", function(error, contributors) {
      if (mode == 'topten') {
        contributors = contributors.slice(90); // 90-100
      } else if (mode == 'hidetopten') {
        for (var i=0;i<10;i++) {
          contributors.pop();
        }
      }
      if (error) return console.warn(error);
      var userdata = contributors.reduce(function(pre, cur) {
        var counts = cur.weeks.reduce(function(pre, cur) {
          pre['a'] += cur['a'];
          pre['d'] += cur['d'];
          pre['c'] += cur['c'];
          return pre;
        }, {
          'a': 0,
          'd': 0,
          'c': 0
        });
        pre[0].unshift({x: cur.author.login, y: counts['a'], label: 'Additions'});
        pre[1].unshift({x: cur.author.login, y: counts['d'], label: 'Deletions'});
        pre[2].unshift({x: cur.author.login, y: counts['c'], label: 'Commits'});
        return pre;
      }, [[],[],[]]);

      var layers = d3.layout.stack()(userdata);
      x.domain(layers[0].map(function(d) {
        return d.x;
      }));
      y.domain([0, d3.max(layers[layers.length - 1], function(d) {
        return d.y0 + d.y;
      })]).nice();

      var layer = svg.selectAll(".layer")
        .data(layers)
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function(d, i) {
          return z(i);
        });

      layer.selectAll("rect")
        .data(function(d) {
          return d;
        })
        .enter().append("rect")
        .attr("x", function(d) {
          return x(d.x);
        })
        .attr("y", function(d) {
          return y(d.y + d.y0);
        })
        .attr("height", function(d) {
          return y(d.y0) - y(d.y + d.y0);
        })
        .attr("width", x.rangeBand() - 1)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

      svg.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(0,0)")
        .call(yAxis);

      svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");
    });
  }
  buildGraph("all");
});
