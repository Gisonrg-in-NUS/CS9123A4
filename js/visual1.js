$(function() {
  // 1. Get contributions data
  // $.getJSON('./data/contributors.json')
  //   .done(function(data) {
  //     data.forEach(function(user) {
  //       var contributionMap = user.weeks.reduce(function(pre, cur) {
  //         pre['additions'] += cur['a'];
  //         pre['deletions'] += cur['d'];
  //         pre['commits'] += cur['c'];
  //         return pre;
  //       }, {
  //         'additions': 0,
  //         'commits': 0,
  //         'deletions': 0
  //       });
  //       console.log(user.author.login, contributionMap);
  //     });
  //   })
  //   .fail(function() {
  //
  //   });

  var causes = ["wounds", "other", "disease"];
  var types = ["additions", "deletions", "commits"];

  var parseDate = d3.time.format("%m/%Y").parse;

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

  var svg = d3.select("#visual1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.json("./data/contributors.json", function(error, contributors) {
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
      pre[0].unshift({x: cur.author.login, y: counts['a']});
      pre[1].unshift({x: cur.author.login, y: counts['d']});
      pre[2].unshift({x: cur.author.login, y: counts['c']});
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
      .attr("width", x.rangeBand() - 1);

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

  function type(d) {
    d.date = parseDate(d.date);
    causes.forEach(function(c) {
      d[c] = +d[c];
    });
    return d;
  }

});
