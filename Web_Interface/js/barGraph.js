var name_click = [],
    price_click = [],
    rating_click = [],
    open_hour_click = [],
    service_click = [];

function setBarData(store_info_click) {
  name_click = [],
  price_click = [],
  rating_click = [],
  open_hour_click = [],
  service_click = [];

  var name_single,
      price_single,
      rating_single,
      openhour_single,
      service_single,
      freshness_single;

  var num = store_info_click.length;
  for (i = 0; i < num; i++) {
    name_single = store_info_click[i]["index"] + ". " + store_info_click[i]["name"];
    name_click.push(name_single);

    if (store_info_click[i]["price"] == "?") {
        price_single = 0.5;
    } else {
        price_single = 1 - store_info_click[i]["price"] * 2 / 10;
    }
    price_click.push(price_single);
    
    if (store_info_click[i]["rating"] == "?") {
        rating_single = 0.5;
    } else {
        rating_single = store_info_click[i]["rating"] * 2 / 10;
    }   
    rating_click.push(rating_single);

    if (store_info_click[i]["open_hour_detail"] == "?") {
        openhour_single = 0.5;
    } else {
        if (store_info_click[i]["open_hour_detail"].length == 1) {
            openhour_single = 1;
        } else {
            var total_hour = 0;
            var day_num = store_info_click[i]["open_hour_detail"].length;
            for (j = 0; j < day_num; j++) {
                var close_hour = store_info_click[i]["open_hour_detail"][j]["close"]["hours"];
                if (close_hour == 0) {
                    close_hour = 24;
                }
                var open_hour = store_info_click[i]["open_hour_detail"][j]["open"]["hours"];
                var open_period = close_hour - open_hour;
                total_hour += open_period;
            openhour_single = total_hour / 168;
            }
        }
    }
    open_hour_click.push(openhour_single);

    service_single = 0.2 * price_single + 0.8 * rating_single;   
    service_click.push(service_single);
  }
}


function makeBarData() {
  var bar_data = [["#E1514B"], ["#FEC574"], ["#FAE38C"], ["#C7E89E"], ["#4D9DB4"]];
  for (i = 0; i < store_info_click.length; i++) {
    if (name_click != null) {
      if (price_click != null) {
        bar_data[0].push({x:name_click[i], y:price_click[i]});
      }
      if (rating_click != null) {
        bar_data[1].push({x:name_click[i], y:rating_click[i]});
      }
      if (service_click != null) {
        bar_data[2].push({x:name_click[i], y:service_click[i]});
      }
      if (open_hour_click != null) {
        bar_data[4].push({x:name_click[i], y:open_hour_click[i]});
      } 
      if (final_freshness != null) {
        freshness_single = 0.2 * rating_click[i] + 0.2 * open_hour_click[i] + 0.6 * final_freshness;
        bar_data[3].push({x:name_click[i], y:freshness_single});
      }
    }
  }
  return bar_data;
}

/*var test = [
  ["#E1514B", {x:"store1", y:0.1}, {x:"store2", y:0.2}, {x:"store3", y:0.24}],
  ["#FEC574", {x:"store1", y:0.3}, {x:"store2", y:0.22}, {x:"store3", y:0.33}],
  ["#FAE38C", {x:"store1", y:0.2}, {x:"store2", y:0.211}, {x:"store3", y:0.3}],
  ["#C7E89E", {x:"store1", y:0.11}, {x:"store2", y:0.31}, {x:"store3", y:0.5}],
  ["#4D9DB4", {x:"store1", y:0.244}, {x:"store2", y:0.4}, {x:"store3", y:0.1}],    
  ]
*/


function barGraph(data) {
  $("#bar-stacked").prop("checked", true);
  
  var color = [];
  for (i = 0; i < data.length; i++) {
    color.push(data[i][0])
    data[i].shift();
  }

  var legends = name_click;

  var id = "#bar-graph-compare";

  d3.select(id).select("svg").remove();

  var n = 5, // number of layers
      m = 3, // number of samples per layer
      stack = d3.layout.stack(),
      layers = stack(data),
      yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
      yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

  var margin = {top: 40, right: 10, bottom: 20, left: 10},
      width = 400 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .domain(legends)
      .rangeRoundBands([0, width], .15);

  var y = d3.scale.linear()
      .domain([0, yStackMax])
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .tickSize(0)
      .tickPadding(6)
      .orient("bottom");

  var svgout = svg = d3.select(id).append("svg")
      .attr("width", width + margin.left + margin.right + 100)
      .attr("height", height + margin.top + margin.bottom + 30);

  var svg = svgout
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var filter = svg.append('defs').append('filter').attr('id','glow'),
  feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
  feMerge = filter.append('feMerge'),
  feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
  feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

  var layer = svg.selectAll(".layer")
      .data(layers)
    .enter().append("g")
      .attr("class", "layer")
      .style("filter" , "url(#glow)")
      .style("fill", function(d, i){return color[i]; })
      .style("fill-opacity", 0.8)

  var rect = layer.selectAll("rect")
      .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", height)
      .attr("width", x.rangeBand())
      .attr("height", 0);

  rect.transition()
      .delay(function(d, i) { return i * 10; })
      .attr("y", function(d) { return y(d.y0 + d.y); })
      .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll(".tick text")
      .call(wrap, x.rangeBand());
  
  d3.selectAll("input").on("change", change);

  var timeout = setTimeout(function() {
    d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
  }, 1000);

  function change() {
    clearTimeout(timeout);
    if (this.value === "grouped") transitionGrouped();
    else transitionStacked();
  }

  function transitionGrouped() {
    y.domain([0, yGroupMax]);

    rect.transition()
        .duration(500)
        .delay(function(d, i) { return i * 10; })
        .attr("x", function(d, i, j) { return x(d.x) + x.rangeBand() / n * j; })
        .attr("width", x.rangeBand() / n)
      .transition()
        .attr("y", function(d) { return y(d.y); })
        .attr("height", function(d) { return height - y(d.y); });
  }

  function transitionStacked() {
    y.domain([0, yStackMax]);

    rect.transition()
        .duration(500)
        .delay(function(d, i) { return i * 10; })
        .attr("y", function(d) { return y(d.y0 + d.y); })
        .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
      .transition()
        .attr("x", function(d) { return x(d.x); })
        .attr("width", x.rangeBand());
  }

  var labels = ["Price", "Rating", "Service", "Freshness", "Open Hour"]
  var fill = d3.scale.ordinal()
      .domain(labels)
      .range(color);

  var legend = svgout.selectAll(".legend")
      .data(fill.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(" + (width - 20) + "," + i * 20 + ")"; });

      // draw legend colored rectangles
      legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("x", 40)
      .attr("y", 10)
      .style("filter" , "url(#glow)")
      .style("fill", function(d) { return fill(d); });

      // draw legend text
      legend.append("text")
      .attr("y", 19)
      .attr("dx", 62)
      .attr("dy", ".35em")
      .style("text-anchor", "left")
      .text(function(d) { return d;})

  function wrap(text, width) {
    text.each(function() {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }

}
