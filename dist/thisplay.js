;(function (undefined) {
	'use strict';

	window.thisplay = window.thisplay || {};

}).call(this);

;(function (window, d3) {
	'use strict';


	function Chart(target) {
    d3 = d3 || window.d3;

    var svg = d3.select(target).append("g")
      .attr("class", "thisplay-chart")
      .attr("transform", "translate(25, 25)");

    var width = 600;
    var height = 400;
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
    this.data.fill(0);

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

    this.svg.selectAll(".bar")
      .style("fill", function(d, idx) {
        if (idx == i || idx == j)
          return "orchid";
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
    if (this.h.indexOf(idx) == -1) {
      this.h.push(idx);
    }
    this.reColoring();
  };

  Chart.prototype.unhighlight = function (idx) {
    if (!idx) {
      this.h = [];
    }
    else if (this.h.indexOf(idx) > -1) {
      this.h.splice(this.h.indexOf(idx), 1);
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
  };


  Chart.prototype.reColoring = function () {
    var self = this;
    var bar = this.svg.selectAll(".bar");
    bar.data(this.data)
    .style("fill", function (d, i) {
      if (self.h.indexOf(i) > -1) return 'red';
      return '';
    });
  };

  window.thisplay.Chart = Chart;

})(window, window.d3);
