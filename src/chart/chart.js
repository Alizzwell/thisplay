;(function (thisplay, d3) {
	'use strict';


	function Chart(target) {
    var svg = d3.select(target).append("g")
      .attr("class", "thisplay-chart")
      .attr("transform", "translate(25, 25)");

    var width = 300;
    var height = 200;
    var data = [];
    var h = [];

    var zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on("zoom", function () {
        svg.attr("transform", d3.event.transform);
      });

    d3.select(target).call(zoom);


    this.svg = svg;
    this.width = width;
    this.height = height;
    this.data = data;
    this.h = h;
  }

  Chart.prototype.init = function (size) {
    this.data = new Array(size);
    this.h = new Array(size);
    this.data.fill(0);
    this.h.fill(0);

    var x = d3.scaleBand()
      .range([0, this.width])
      .padding(0.1);
    var y = d3.scaleLinear()
      .range([this.height, 0]);

    x.domain(this.data.map(function (d, i) { return i; }));

    this.x = x;
    this.y = y;
    this.redrawChart();
  };

  Chart.prototype.setData = function (idx, val) {
    var that = this;
    this.data[idx] = val;

    this.y.domain([0, d3.max(this.data, function (d) { return d; })]);
    this.svg.selectAll(".bar")
      .data(this.data)
      .transition()
      .duration(300)
      .attr("x", function(d, i) { return that.x(i); })
      .attr("y", function(d) { return that.y(d); })
      .attr("height", function(d) { return that.height - that.y(d); });
  };

  Chart.prototype.swap = function (i, j) {
    var that = this;
    var swap_duration = 300;

    var tmp = this.data[i];
    this.data[i] = this.data[j];
    this.data[j] = tmp;
    tmp = this.h[i];
    this.h[i] = this.h[j];
    this.h[j] = tmp;

    this.svg.selectAll(".bar")
      .style("fill", function(d, idx) {
        if (idx == i || idx == j)
          return "orchid";
        if (that.h[idx]) return "red";
      })
      .transition()
      .duration(swap_duration)
      .attr("x", function(d, idx) {
        if (idx == i)
          return that.x(j);
        else if (idx == j)
          return that.x(i);
        else
          return that.x(idx);
      });

    setTimeout(function () {
      that.redrawChart();
    }, swap_duration);
  };

  Chart.prototype.clear = function () {
    this.svg.select(".axis").remove();
    this.svg.selectAll(".bar").remove();
  };

  Chart.prototype.highlight = function (idx) {
    this.h[idx] = 1;
    this.reColoring();
  };

  Chart.prototype.unhighlight = function (idx) {
    if (!idx) {
      this.h.fill(0);
    }
    else {
      this.h[idx] = 0;
    }
    this.reColoring();
  };

  Chart.prototype.redrawChart = function () {
    var that = this;
    this.clear();

    this.svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(this.x));

    this.svg.selectAll(".bar")
      .data(this.data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d, i) { return that.x(i); })
      .attr("width", this.x.bandwidth())
      .attr("y", function(d) { return that.y(d); })
      .attr("height", function(d) { return that.height - that.y(d); });

    this.reColoring();
  };


  Chart.prototype.reColoring = function () {
    var self = this;
    var bar = this.svg.selectAll(".bar");
    bar.data(this.data)
    .style("fill", function (d, i) {
      if (self.h[i] === 1) return 'red';
    });
  };

  thisplay.Chart = Chart;

})(thisplay, d3);
