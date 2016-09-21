;(function (window, d3) {
	'use strict';

	var sstatus = 0;

	function Matrix(target) {
    d3 = d3 || window.d3;

    var svg = d3.select(target).append("g")
      .attr("class", "thisplay-matrix")
      .attr("transform", "translate(25, 25)");

    var width = 600;
    var height = 600;
    var data = [];

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
	}

	Matrix.prototype.init = function (col, row) {
    this.data = new Array(row);
    for (var r = 0; r < row; r++) {
      this.data[r] = new Array(col);
      for (var c = 0; c < row; c++) {
        this.data[r][c] = {
          val: 0,
          color: "#f2f2f2"
        };
      }
    }
    this.redrawMatrix();
	};

  Matrix.prototype.redrawMatrix = function () {
    var that = this;
    this.clear();

    var rectSize = 20;
    var ele = this.svg.append('g')
    .attr("class", function () {return "matrix";});
    ele.selectAll(".row")
      .data(this.data)
      .enter()
      .append("g")
      .attr("class", "row")
      .attr("id", function (d, i) {
          return "rowIdx_" + i;
      })
      .attr("transform", function(d,i){
				return "translate(0," + (rectSize * i) + ")";
			})
      .selectAll("g.rect")
      .data(function (d) { return d; })
      .enter().append("rect")
      .attr("class", "cell")
      .attr("id", function (d, i) {
        return "colIdx_" + i;
      })
			.attr("x",function (d,i) {
        return rectSize * i;
      })
			.attr("y", 0)
      .attr("stroke", "#111111")
      .attr("fill", function (d) {
        console.log(d);
        return d.color;
      })
			.attr("width", rectSize)
			.attr("height", rectSize);
  };

  Matrix.prototype.clear = function () {
    this.svg.selectAll(".matrix").remove();
  };

	Matrix.prototype.highlight = function (col, row, color) {
    this.data[row][col].color = color;
		this.svg.select(
      "#rowIdx_" + row +
      " #colIdx_" + col)
      .transition()
      .attr("fill", color)
      .attr("opacity", 0.8);
	};

	Matrix.prototype.unhighlight = function(col, row){
    this.svg.select(
      "#rowIdx_" + row +
      " #colIdx_" + col)
      .attr("fill", "#f2f2f2");
	};

  Matrix.prototype.unhighlightColor = function (color) {
    this.svg.selectAll(".cell")
      .attr("fill", function (d, i) {
        console.log(d.color);
        if (d.color === color) {
          d.color = "#f2f2f2";
        }
        return d.color;
      });
  };

	window.thisplay.Matrix = Matrix;

})(window, window.d3);
