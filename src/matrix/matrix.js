;(function (thisplay, d3) {
	'use strict';

	function Matrix(target) {
    var svg = d3.select(target).append("g")
      .attr("class", "thisplay-matrix")
      .attr("transform", "translate(25, 25)");

    var width = 500;
    var data = [];

    var zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on("zoom", function () {
        svg.attr("transform", d3.event.transform);
      });

    d3.select(target).call(zoom);

    this.svg = svg;
    this.width = width;
		this.rectSize = 0;
    this.data = data;
	}

	Matrix.prototype.init = function (row, col) {
		this.rectSize = Math.ceil(this.width / col);
    this.data = new Array(row);
    for (var r = 0; r < row; r++) {
      this.data[r] = new Array(col);
      for (var c = 0; c < col; c++) {
        this.data[r][c] = {
					text: "",
          color: "#000000",
					background: "#f2f2f2"
        };
      }
    }
    this.redrawMatrix();
	};

  Matrix.prototype.redrawMatrix = function () {
    var that = this;
    this.clear();

    var rectSize = this.rectSize;
    var ele = this.svg.append('g')
    .attr("class", "matrix");
    var cells = ele.selectAll(".row")
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
      .selectAll("g.g")
      .data(function (d) { return d; })
      .enter()
      .append("g")
      .attr("class", "cell")
      .attr("id", function (d, i) {
        return "colIdx_" + i;
      })
      .attr("background", "red")
      .attr("transform", function(d,i){
        return "translate(" + (rectSize * i) + ",0)";
      })
      .attr("width", rectSize)
      .attr("height", rectSize);

		cells.append("rect")
      .attr("stroke", "#111111")
      .attr("fill", function (d) {
				return d.background;
			})
      .attr("x", 0)
      .attr("y", 0)
	    .attr("width", rectSize)
	    .attr("height", rectSize);

    cells.append("text")
      .attr("x", rectSize / 2)
      .attr("y", rectSize / 2)
			.attr("text-anchor", "middle")
			.attr("font-size", parseInt(rectSize / 3) + "px")
			.attr("dy", ".35em")
      .attr("width", rectSize)
      .attr("height", rectSize)
			.attr("fill", function (d) { return d.color; })
			.text(function (d) { return d.text; });
  };

  Matrix.prototype.clear = function () {
    this.svg.selectAll(".matrix").remove();
  };

	Matrix.prototype.setData = function (row, col, val) {
		this.data[row][col].text = val;
		this.svg.select(
		"#rowIdx_" + row +
		" #colIdx_" + col +
		" text").text(val);
	};

	Matrix.prototype.highlight = function (row, col, color) {
    this.data[row][col].background = color;
		this.svg.select(
      "#rowIdx_" + row +
      " #colIdx_" + col +
      " rect")
      .transition()
      .attr("fill", color);
	};

	Matrix.prototype.unhighlight = function (row, col){
		this.data[row][col].background = "#f2f2f2";
    this.svg.select(
      "#rowIdx_" + row +
      " #colIdx_" + col +
      " rect")
      .attr("fill", "#f2f2f2");
	};

	Matrix.prototype.unhighlightAll = function (){
    this.svg.selectAll(".cell rect")
      .attr("fill", "#f2f2f2");
	};

  Matrix.prototype.unhighlightColor = function (color) {
    this.svg.selectAll(".cell rect")
      .attr("fill", function (d, i) {
        if (d.background === color) {
          d.background = "#f2f2f2";
        }
        return d.background;
      });
  };

  thisplay.Matrix = Matrix;

})(thisplay, d3);
