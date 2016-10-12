;(function (window) {
	'use strict';

	window.thisplay = window.thisplay || {};

})(window);

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
    if (idx === undefined) {
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

;(function (thisplay, d3) {
	'use strict';

  function Graph(target) {
    var svg = d3.select(target).append("g")
      .attr("class", "thisplay-graph")
      .attr("transform", "translate(25, 25)");

    var svgLink = svg.append("g").attr("class", "linkGroup");
    var svgNode = svg.append("g").attr("class", "nodeGroup");
    var zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on("zoom", function () {
        svg.attr("transform", d3.event.transform);
      });

    d3.select(target).call(zoom);

    var width = 700;
    var height = 1000;
    var radius = 30;

    var nodes = [];
	  var links = [];

    var forceManyBody = d3.forceManyBody()
        .strength(-2400)
      //  .theta(0.9) // need to test
        .distanceMin(100) // ntt
        .distanceMax(300); // ntt

    var forceLink = d3.forceLink();
    forceLink
      .links(links)
      .distance(300) // ntt
      .strength(0.7) // ntt
      .iterations(0.5); // ntt

    var forceCollide = d3.forceCollide()
    .radius(2)
    .strength(0.7)
    .iterations(1);

    var	force = d3.forceSimulation();

    force
      .nodes(nodes)
      .force("charge", forceManyBody)
      .force("link", forceLink)
      .force("center", d3.forceCenter(width/2, height/2))
      .force("collide", forceCollide)
      .force("x", d3.forceX().strength(0.05))
      .force("y", d3.forceY().strength(0.1))
      .alphaMin(0.2)
      .alphaDecay(0.03)
      .velocityDecay(0.85)

      .on("tick", function () {
        svgNode.selectAll(".node")
          .attr("transform", function(d) { return 'translate(' + [d.x , d.y] + ')' ;})
          .attr("x", function(d) { return d.x; })
          .attr("y", function(d) { return d.y; });

        svgNode.selectAll(".nodetext")
          .attr("transform", function(d) {
            return 'translate(' + [d.x, d.y+7] + ')' ;
          });

        svgLink.selectAll(".link")
          .attr("d", function(d) {
             return drawLine(d);
        });

				svgLink.selectAll(".linktext")
          .attr("transform", function(d){
            return drawText(d);
        });
      });





    var drawLine = function (d) {
      var sx = d.source.getAttribute("x"), sy = d.source.getAttribute("y");
      var tx = d.target.getAttribute("x"), ty = d.target.getAttribute("y");
      var dx = tx - sx;
      var dy = ty - sy;
      dx = dx * 3;
			dy = dy * 3;
      var dr = Math.sqrt(dx * dx + dy * dy);
      var theta = Math.atan2(dy, dx) + Math.PI / 26.55;
			var d90 = Math.PI / 2;
      var dtxs = tx - 1.22 * radius * Math.cos(theta);
      var dtys = ty - 1.22 * radius * Math.sin(theta);
      var val1 = 3.5, val2 = 10.5;

      return "M" + sx + "," + sy +
	      "A" + dr + "," + dr + " 0 0 1," + tx + "," + ty +
	      "A" + dr + "," + dr + " 0 0 0," + sx + "," + sy +
	      "M" + dtxs + "," + dtys +
	      "l" + (val1 * Math.cos(d90 - theta) - val2 * Math.cos(theta)) + "," +
	      (-val1 * Math.sin(d90 - theta) - val2 * Math.sin(theta)) +
	      "L" + (dtxs - val1 * Math.cos(d90 - theta) - val2 * Math.cos(theta)) + "," +
	      (dtys + val1 * Math.sin(d90 - theta) - val2 * Math.sin(theta)) + "z";
    };

    var drawText = function(d){
        var sx = d.source.getAttribute("x"), sy = d.source.getAttribute("y");
        var tx = d.target.getAttribute("x"), ty = d.target.getAttribute("y");
				var dx = tx - sx;
				var dy = ty - sy;
				dx = dx * 3;
			 	dy = dy * 3;

				var dr = Math.sqrt(dx * dx + dy * dy),
					theta = Math.atan2(dy, dx) + Math.PI / 11.95,
					d90 = Math.PI / 2,
					dtxs = tx - 4 * radius * Math.cos(theta),
					dtys = ty - 4 * radius * Math.sin(theta);
				return 'translate(' + [dtxs, dtys] + ')';
    };

    this.target = target;
    this.svg = svg;
    this.svgNode = svgNode;
    this.svgLink = svgLink;
    this.width = width;
    this.height = height;
    this.radius = radius;
    this.forceLink = forceLink;
    this.forceManyBody = forceManyBody;
    this.force = force;
    this.nodes = nodes;
    this.drawLine = drawLine;
    this.links = links;
  }

  Graph.prototype.redraw = function () {
     var that = this;
    // draw link tag
    this.svgLink.selectAll('.link')
      .data(this.links)
      .enter()
      .insert("path")
      .attr("class", "link")
      .attr("id", function(d) { return d.id; });

    this.svgLink.selectAll('.linktext')
      .data(this.links)
      .enter()
      .insert('text')
      .attr("class", "linktext")
      .attr("id", function(d) { return "text" + d.id; })
      .text(function(d) { return d.value; });

    this.svgNode.selectAll('.node')
      .data(this.nodes)
      .enter()
      .insert('circle')
      .attr("class", "node")
      .attr("id", function(d) {return d.id;})
      .attr("r", this.radius)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    this.svgNode.selectAll('.nodetext')
      .data(this.nodes)
      .enter()
      .insert('text')
      .attr("class", "nodetext")
      .text(function(d) { return d.text; });


    function dragstarted(d) {
      if (!d3.event.active) that.force.alpha(1).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) that.force.alphaTarget(0.15);
      d.fx = null;
      d.fy = null;
    }
  };

  Graph.prototype.makeNode = function (id) {
    if(this.svgNode.select("#node_"+id).node() === null) {
      this.nodes.push({id: "node_" + id, text: id});
    }
    this.force.nodes(this.nodes).alpha(1).restart();
    this.redraw();
  };

  Graph.prototype.makeEdge = function (source, target, value) {
    var that = this;
    var snode, tnode;
    var edge = this.svgLink.select("#link_" + source + "_" + target).node();
    snode = this.svgNode.select("#node_" + source).node();
    tnode = this.svgNode.select("#node_" + target).node();

    if(snode === null || tnode === null){
      // pr("no node");
    }
    else if(edge === null){
      this.links.push({
        id : "link_" + source + "_" + target,
        source : snode,
        target : tnode,
        value : value,
        is_directed_array : false
      });
    }
    else{
      for(var i = 0; i < this.links.length; i++){
        if(this.links[i].id === "link_" + source + "_" + target){
          this.links[i].value = value;
          this.svgLink.select("#textlink_" + source + "_" + target).text(value);
          break;
        }
      }
    }

    this.forceLink
      .links(this.links);

    this.force.alpha(1);
    this.force.restart();
    this.redraw();
   };

  Graph.prototype.highlightNode = function (id) {
   	var node = this.svg.select("#node_" + id);
    if(node.node() !== null) {
      node.transition().duration(500).style("fill", "red");
    }
  };

  Graph.prototype.highlightEdge = function (source, target) {
   	var edge = this.svg.select("#link_" + source + "_" + target);
    if(edge.node() !== null) {
      edge.transition().duration(500).style("stroke", "red");
    }
  };

  Graph.prototype.unHighlightNode = function (id) {
   	var node = this.svg.select("#node_" + id);
    if(node.node() !== null) {
      node.transition().duration(500).style("fill", "black");
    }
  };

  Graph.prototype.unHighlightEdge = function (source, target) {
   	var edge = this.svg.select("#link_" + source + "_" + target);
    if(edge.node() !== null) {
      edge.transition().duration(500).style("stroke", "#999");
    }
  };

  Graph.prototype.unHighlightNodeAll = function () {
    for(var i = 0; i < this.nodes.length; i++){
      this.unHighlightNode(this.nodes[i].text);
    }
  };

  Graph.prototype.unHighlightEdgeAll = function () {
    for(var i = 0; i < this.links.length; i++){
      this.svg.select("#" + this.links[i].id)
      .transition().duration(500).style("stroke", "#999");
    }
  };

  Graph.prototype.clear = function(){
    this.svg.selectAll(".node").remove();
    this.svg.selectAll(".nodetext").remove();
    this.svg.selectAll(".link").remove();
    this.svg.selectAll(".linktext").remove();
    this.nodes = [];
    this.links = [];
    this.redraw();
  };

  thisplay.Graph = Graph;

})(thisplay, d3);

;(function (thisplay, d3) {
	'use strict';


	function LinkedList(target) {
    var svg = d3.select(target).append("g")
      .attr("class", "thisplay-linkedlist")
      .attr("transform", "translate(25, 25)");

    var width = 300;
    var height = 200;
    var data = ["head"];
    var cur = 0;

    var zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on("zoom", function () {
        svg.attr("transform", d3.event.transform);
      });

    d3.select(target).call(zoom);

    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -10 20 20')
      .attr('refX', 6)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
      .append('path')
      .attr("d", "M0,10 L10,0 L0,-10")
        .attr('fill', '#000');


    this.svg = svg;
    this.width = width;
    this.height = height;
    this.data = data;
    this.cur = cur;

    this.redraw();
    this.colorCur();
  }

  LinkedList.prototype.colorCur = function() {
    var that = this;
    this.svg.selectAll(".node")
      .style("fill", function(d, i) { return i === that.cur ? "orange" : "white"; });
  };

  LinkedList.prototype.curInit = function() {
    this.cur = 0;
    this.colorCur();
  };

  LinkedList.prototype.next = function() {
    if (this.cur < this.data.length - 1) {
      this.cur++;
      this.colorCur();
    }
  };

  LinkedList.prototype.insertCur = function(val) {
    if (this.cur >= this.data.length)
      return;
    this.addNode(this.cur + 1, val);
  };

  LinkedList.prototype.deleteCur = function() {
    if (this.cur === 0 || this.cur >= this.data.length)
      return;
    this.deleteNode(this.cur);
  };

  LinkedList.prototype.setDataCur = function(val) {
    this.setData(this.cur, val);
  };

  LinkedList.prototype.pushBack = function(val) {
    this.addNode(this.data.length, val);
  };

  LinkedList.prototype.pushFront = function(val) {
    this.addNode(1, val);
  };

  LinkedList.prototype.popBack = function() {
    this.deleteNode(this.data.length - 1);
  };

  LinkedList.prototype.popFront = function() {
    this.deleteNode(1);
  };

  LinkedList.prototype.addNode = function(idx, val) {
    // if (idx < 0 || this.data.length < idx) {
    //   console.log("index 범위 초과");
    //   return;
    // }

    var that = this;
    var duration = 500;

    if (this.data.length === idx || this.data.length === 0) {
      this.addNodeAniOpacity(idx, val, duration);
      setTimeout(function () { that.colorCur(); }, duration);
    }
    else {
      this.addNodeAniMove(idx, val, duration);
      setTimeout(function() { that.addNodeAniOpacity(idx, val, duration); }, duration);
      setTimeout(function() { that.colorCur(); }, duration * 2);
    }
  };

  LinkedList.prototype.addNodeAniMove = function(idx, val, dur) {
    // idx부터 모두 뒤로 옮기는 애니메이션
    this.svg.selectAll(".node")
      .transition().duration(dur)
      .attr("x", function(d, i) {
        if (i < idx)  return i * 80;
        else          return (i + 1) * 80;
      });

    this.svg.selectAll(".text")
      .transition().duration(dur)
      .attr("x", function(d, i) {
        if (i < idx)  return i * 80 + 15;
        else          return (i + 1) * 80 + 15;
      });

    this.svg.selectAll(".arrow")
      .transition().duration(dur)
      .attr("transform", function(d, i) {
        if (i < idx) {
          return "translate(" + (i * 80) + ",15)";
        }
        else {
          return "translate(" + ((i + 1) * 80) + ",15)";
        }
      });
  };

  LinkedList.prototype.addNodeAniOpacity = function(idx, val, dur) {
    // idx의 노드를 opacity 0에서 1로 변경

    this.data.splice(idx, 0, val);
    this.redraw();

    this.svg.selectAll(".node")
      .attr("opacity", function(d, i) { return i === idx ? 0 : 1; })
      .transition().duration(dur)
      .attr("opacity", 1);
    this.svg.selectAll(".text")
      .attr("opacity", function(d, i) { return i === idx ? 0 : 1; })
      .transition().duration(dur)
      .attr("opacity", 1);
  };

  LinkedList.prototype.deleteNode = function(idx) {
    var that = this;
    var duration = 500;

    if (this.data.length - 1 === idx || this.data.length === 1) {
      this.deleteNodeAniOpacity(idx, duration);
      this.deleteNodeFinal(idx, duration);
    }
    else {
      this.deleteNodeAniOpacity(idx, duration);
      setTimeout(function () { that.deleteNodeAniMove(idx, duration); }, duration);
      this.deleteNodeFinal(idx, duration * 2);
    }
  };

  LinkedList.prototype.deleteNodeFinal = function(idx, delay) {
    var that = this;
    setTimeout(function() {
        that.data.splice(idx, 1);
        that.redraw();
        that.colorCur();
      }, delay);
  };

  LinkedList.prototype.deleteNodeAniMove = function(idx, dur) {
    this.svg.selectAll(".node")
      .transition().duration(dur)
      .attr("x", function(d, i) {
        if (i > idx)  return (i - 1) * 80;
        else          return i * 80;
      });

    this.svg.selectAll(".text")
      .transition().duration(dur)
      .attr("x", function(d, i) {
        if (i > idx)  return (i - 1) * 80 + 15;
        else          return i * 80 + 15;
      });

    this.svg.selectAll(".arrow")
      .transition().duration(dur)
      .attr("transform", function(d, i) {
        if (i >= idx) {
          return "translate(" + ((i - 1) * 80) + ",15)";
        }
        else {
          return "translate(" + (i * 80) + ",15)";
        }
      });
  };

  LinkedList.prototype.deleteNodeAniOpacity = function(idx, dur) {
    this.svg.selectAll(".node")
      .transition().duration(dur)
      .attr("opacity", function(d, i) { return i === idx ? 0 : 1; });
    this.svg.selectAll(".text")
      .transition().duration(dur)
      .attr("opacity", function(d, i) { return i === idx ? 0 : 1; });
    this.svg.selectAll(".arrow")
      .transition().duration(dur)
      .attr("opacity", function(d, i) { return i === idx ? 0 : 1; });
  };

  LinkedList.prototype.setData = function (idx, val) {
    this.data[idx] = val;

    this.svg.selectAll(".text")
      .data(this.data)
      .text(function(d) { return d; });
  };

  LinkedList.prototype.clear = function () {
    this.clearSVG();

    this.data = ["head"];
    this.cur = 0;

    this.redraw();
    this.colorCur();
  };

  LinkedList.prototype.clearSVG = function () {
    this.svg.selectAll(".node").remove();
    this.svg.selectAll(".text").remove();
    this.svg.selectAll(".arrow").remove();
  };

  LinkedList.prototype.redraw = function () {
    var that = this;
    this.clearSVG();

    this.svg.selectAll(".node")
      .data(this.data)
      .enter().append("rect")
      .attr("class", "node")
      .attr("x", function(d, i) { return i * 80; })
      .attr("y", 0)
      .attr("width", 30)
      .attr("height", 30)
      .attr("opacity", 1);

    this.svg.selectAll(".text")
      .data(this.data)
      .enter().append("text")
      .attr("class", "text")
      .attr("x", function(d, i) { return i * 80 + 15; })
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "central")
      .attr("opacity", 1)
      .text(function(d) { return d; });

    this.svg.selectAll(".arrow").data(this.data.slice(0, -1))
      .enter().append("path")
      .attr("class", "arrow")
      .attr("transform", function(d, i) { return "translate(" + (i * 80) + ",15)"; })
      .attr("d", "M40,0 L70,0")
      .style("marker-end", "url(#arrow)")
      .style("stroke", "black")
      .style("stroke-width", "3px")
      .attr("opacity", 1);
  };

	thisplay.LinkedList = LinkedList;

})(thisplay, d3);

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

;(function (thisplay, d3) {
	'use strict';

	function Queue(target) {
		var queue;
		var queueData = [];
		var front = 0;
		var rear = 0;
		var rectWidth = 80;
		var rectHeight = 80;
		var padding = 5;
		var width = 1000;
		var height = 700;

    var container = d3.select(target)
			.append("svg")
			.attr("width", width)
			.attr("height", height)
			.attr("id","container")
			.append("g");

    var zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on("zoom", function () {
        container.attr("transform", d3.event.transform);
      });

    d3.select(target).call(zoom);

		this.container = container;
		this.target = target;
		this.queue = queue;
		this.queueData = queueData;
		this.front = front;
		this.rear = rear;
		this.rectWidth = rectWidth;
		this.rectHeight = rectHeight;
		this.padding = padding;


		var that = this;
		this.mouseOver = function (d,i) {

			d3.select("#rectIdx"+i)
				.attr("fill","#FA812F")
				.attr("width", that.rectWidth*1.1)
				.attr("height", that.rectHeight*1.1)
				.attr("transform","translate("+(-that.rectHeight*0.05)+","+(-that.rectWidth*0.05)+")");


			that.queue.append("text")
				.text("↑")
				.attr("font-family","Consolas")
				.attr("font-size","20px")
				.attr("fill","black")
				.attr("text-anchor","middle")
				.attr("id","arrow")
				.attr("x",function(){return 100+(that.rectWidth+that.padding)*(i) +that.rectWidth/2;})
				.attr("y",function(){return 300+that.rectHeight*1.3;});

			that.queue.append("text")
				.text(function(){return "queue["+(i)+"] = "+ that.queueData[i];})
				.attr("font-family","Consolas")
				.attr("font-size","20px")
				.attr("fill","black")
				.attr("text-anchor","middle")
				.attr("id","arrInfo")
				.attr("x",function(){return 100+(that.rectWidth+that.padding)*(i) +that.rectWidth/2;})
				.attr("y",function(){return 300+that.rectHeight*1.6;});
		};

		this.mouseOut = function (d,i) {
			d3.select(this)
				.attr("fill","#FAAF08")
				.attr("width",that.rectWidth)
				.attr("height",that.rectHeight)
				.attr("transform","translate(0,0)");

			d3.select("#arrInfo").remove();
			d3.select("#arrow").remove();
		};
  }

  Queue.prototype.push = function (_value) {
		var newElem;

		this.rear++;
		this.queueData.push(_value);

		var position = (this.rectWidth+this.padding)*((this.rear-this.front)-1)+100;
		var distance = 300;
		var that = this;
		newElem = this.container.append("g");
		newElem.append("rect")
			.attr("x", position + distance)
			.attr("y",300)
			.attr("width", this.rectWidth)
			.attr("height",this.rectHeight)
			.attr("fill","#FAAF08")
			.attr("rx",10)
			.attr("ry",10);

		newElem.append("text")
			.text(_value)
			.attr("x",function(){return position+distance+that.rectWidth/2;})
		 	.attr("y",function(){return 300+that.rectHeight/5*3;})
			.attr("fill","black")
			.attr("font-family","Consolas")
			.attr("font-size","20px")
			.attr("text-anchor","middle");

		newElem.transition().duration(300)
			.attr("transform","translate("+(-distance)+",0)").ease(d3.easeSinOut);

		setTimeout(function(){
			newElem.remove().exit();
			that.drawQueue();
		},300);
  };

  Queue.prototype.pop = function () {
		var that = this;
    if(this.front == this.rear)
			return ;

		var newElem;
		var _value = this.queueData[0];

		this.front++;

		this.queueData = this.queueData.slice(1,this.queueData.length);

		this.drawQueue();

		var position = (this.rectWidth + this.padding)*(-1)+100;
		var distance = 300;

		newElem = this.container.append("g");
		 newElem.append("rect")
			.attr("x", position)
		 	.attr("y",300)
			.attr("width", this.rectWidth)
			.attr("height", this.rectHeight)
			.attr("fill","#FAAF08")
			.attr("rx",10)
			.attr("ry",10);

		newElem.append("text")
			.text(_value)
			.attr("x",function(){return position + that.rectWidth/2;})
		 	.attr("y",function(){return 300 + that.rectHeight/5*3;})
			.attr("fill","black")
			.attr("font-family","Consolas")
			.attr("font-size","20px")
			.attr("text-anchor","middle");

		//var distance = -300;
		newElem.transition().duration(300)
			.attr("transform","translate("+ (-distance)+",0)").ease(d3.easeSinOut);

		setTimeout(function(){
			newElem.remove().exit();
			that.drawQueue();
		},300);
  };

	Queue.prototype.clear = function () {

    if(this.front == this.rear)
			return ;
		while(this.front != this.rear)
		{
			var that = this;
			var newElem;
			var _value = this.queueData[0];

			this.front++;

			this.queueData = this.queueData.slice(1,this.queueData.length);

			this.drawQueue();

			var position = (this.rectWidth + this.padding)*(-1)+100;
			var distance = 300;

			newElem = this.container.append("g");
			 newElem.append("rect")
				.attr("x", position)
				.attr("y",300)
				.attr("width", this.rectWidth)
				.attr("height", this.rectHeight)
				.attr("fill","#FAAF08")
				.attr("rx",10)
				.attr("ry",10);

			newElem.append("text")
				.text(_value)
				.attr("x", position + that.rectWidth/2)
				.attr("y", 300 + that.rectHeight/5 * 3)
				.attr("fill","black")
				.attr("font-family","Consolas")
				.attr("font-size","20px")
				.attr("text-anchor","middle");

			//var distance = -300;
			newElem.transition().duration(300)
				.attr("transform","translate("+ (-distance)+",0)").ease(d3.easeSinOut);

			//setTimeout(function(){
				newElem.remove().exit();
				that.drawQueue();
			//},300);
		}

  };

  Queue.prototype.drawQueue = function () {
		var that = this;

    if(this.queue !== undefined){
			this.queue.remove().exit();
		}

		if(this.queueData.length === 0)
			return ;

		this.queue = this.container.append("g");
		this.queue.selectAll("g.rect")
			.data(this.queueData)
			.enter()
			.append("rect")
			.attr("x",function(d,i){return 100+(that.rectWidth+that.padding)*(i);})
			.attr("y",300)
			.attr("width", this.rectWidth)
			.attr("height", this.rectHeight)
			.attr("rx",10)
			.attr("ry",10)
			.attr("fill","#FAAF08")
			.attr("id",function(d,i){return "rectIdx"+i;})
			.attr("opacity",1.0)
			.on("mouseover", this.mouseOver)
			.on("mouseout", this.mouseOut);

		this.queue.selectAll("g.text")
			.data(this.queueData)
			.enter()
			.append("text")
			.text(function(d,i){return d;})
			.attr("x",function(d,i){return 100+(that.rectWidth+that.padding)*(i) +that.rectWidth/2;})
		 	.attr("y",function(){return 300+that.rectHeight/5*3;})
			.attr("fill","black")
			.attr("font-family","Consolas")
			.attr("font-size","20px")
			.attr("text-anchor","middle")
			.attr("id",function(d,i){return "textIdx"+i;});

		this.queue.append("text")
			.text("▼")
			.attr("font-family","Consolas")
			.attr("font-size","20px")
			.attr("fill","black")
			.attr("text-anchor","middle")
			.attr("x",function(){return 100 +that.rectWidth/2;})
			.attr("y",function(){return 300-that.rectHeight*0.2;});

		this.queue.append("text")
			.text("front")
			.attr("font-family","Consolas")
			.attr("font-size","20px")
			.attr("fill","black")
			.attr("text-anchor","middle")
			.attr("x",function(){return 100 +that.rectWidth/2;})
			.attr("y",function(){return 300-that.rectHeight*0.5;});


		this.queue.append("text")
			.text("▼")
			.attr("font-family","Consolas")
			.attr("font-size","20px")
			.attr("fill","black")
			.attr("text-anchor","middle")
			.attr("x",function(){return 100+(that.rectWidth+that.padding)*(that.rear-that.front) +that.rectWidth/2;})
			.attr("y",function(){return 300-that.rectHeight*0.2;});

		this.queue.append("text")
			.text("rear")
			.attr("font-family","Consolas")
			.attr("font-size","20px")
			.attr("fill","black")
			.attr("text-anchor","middle")
			.attr("x",function(){return 100+(that.rectWidth+that.padding)*(that.rear-that.front) +that.rectWidth/2;})
			.attr("y",function(){return 300-that.rectHeight*0.5;});
  };

  thisplay.Queue = Queue;

})(thisplay, d3);

;(function (thisplay, d3) {
  'use strict';


  function Stack(target) {
    var svg = d3.select(target).append("g")
      .attr("class", "thisplay-stack")
      .attr("transform", "translate(25, 25)");

    var width = 500;
    var height = 300;
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
    this.rectHeight = 30;
    this.rectWidth = 30;
    this.padding = this.rectHeight / 10;
    this.top = -1;

    var that = this;

    this.mouseOver = function(d,i){
      d3.select("#elemIdx_"+i)
        //.attr("temp",function(){console.log(i);})
        .attr("fill","#9598AB")
        .attr("width",that.rectWidth*1.1)
        .attr("height",that.rectHeight*1.1)
        .attr("transform","translate("+(-that.rectWidth*0.05)+","+(-that.rectHeight*0.05)+")");


      that.svg.append("text")
      .text("←")
      .attr("font-family","Consolas")
      .attr("font-size",parseInt(that.rectHeight / 2))
      .attr("fill",that.data[i].color)
      .attr("text-anchor","middle")
      .attr("id","arrow")
      .attr("x", that.width/2+that.rectWidth/2 + 10)
      .attr("y",that.height-(that.rectHeight+that.padding)*(i+1)+that.rectHeight/3*2);


      that.svg.append("text")
          .text(function(){return "stack["+i+"] = " + that.data[i].text;})
          .attr("x", that.width/2+ that.rectWidth/2 + 10 + parseInt(that.rectHeight / 2))
          .attr("y",that.height-(that.rectHeight+that.padding)*(i+1)+that.rectHeight/3*2)
          .attr("font-family","Consolas")
          .attr("font-size",parseInt(that.rectHeight / 2))
          .attr("fill",that.data[i].color)
          //.attr("text-anchor","middle")
          .attr("id","stackInfo");
    };

    this.mouseOut = function(d,i){

      d3.select(this)
         .attr("fill",that.data[i].background)
         .attr("width",that.rectWidth)
         .attr("height",that.rectHeight)
         .attr("transform","translate(0,0)");

      d3.select("#arrow").remove();
      d3.select("#stackInfo").remove();
    };

  }

  Stack.prototype.redrawStack = function () {
    var that = this;
    this.svg.selectAll(".stack").remove();

    var rectWidth = this.rectWidth;
    var rectHeight = this.rectHeight;

    var ele = this.svg.append('g')
    .attr("class", "stack");



    var cells = ele.selectAll(".elem")
      .data(this.data)
      .enter()
      .append("g")
      //.attr("id", function (d, i) { return "elemIdx_" + i;})
      .attr("class", "elem");



    cells.append("rect")
      .attr("fill", function (d) { return d.background;})
      .attr("x", that.width/2-rectWidth/2)
      .attr("y", function(d,i){return that.height-(rectHeight+that.padding)*(i+1);})
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("rx",2)
      .attr("ry",2)
      .attr("id", function (d, i) { return "elemIdx_" + i;})
      .on("mouseover",this.mouseOver)
      .on("mouseout",this.mouseOut);


    cells.append("text")
      .attr("x", that.width/2)
      .attr("y", function(d,i){return that.height-(rectHeight+that.padding)*(i+1)+rectHeight/3*2;})
      .attr("text-anchor", "middle")
    //  .attr("dy", ".35em")
      .attr("font-size", parseInt(rectHeight / 3) )
      .attr("fill", function (d) { return d.color; })
      .text(function (d) {  return d.text; });
  };

  Stack.prototype.push = function(val) {
    this.top++;
    this.data[this.top] = {
        text:val,
        color:"#4F474A",
        background:"#FFA4A7"
      };

    this.svg.select("#elemIdx_" + this.top + " text").text(val);
    var distance = (this.height-(this.rectHeight+this.padding)*(this.top+1))-this.rectHeight;
    var newElem = this.svg.append("g");
    var that = this;
    var fontSize = parseInt(that.rectHeight / 3);


    newElem.append("rect")
            .attr("x",this.width/2-this.rectWidth/2)
            .attr("y",this.rectHeight)
            .attr("width",this.rectWidth)
            .attr("height",this.rectHeight)
            .attr("fill",this.data[this.top].background)
            .attr("rx",2)
            .attr("ry",2);

    newElem.append("text")
            .text(val)
            .attr("x",that.width/2)
            .attr("y",that.rectHeight/3*2 + that.rectHeight)
            .attr("text-anchor", "middle")
            .attr("font-size", parseInt(that.rectHeight / 3) )
            .attr("fill",this.data[this.top].color);


    newElem.transition()
            .attr("transform","translate(0,"+distance+")").duration(500).ease(d3.easeSinOut);

    setTimeout(function(){
      newElem.remove().exit();
      that.redrawStack();
    },300);
  };

  Stack.prototype.pop = function(){
    var top = this.top;
    if (top < 0) return;
    var val = this.data[top];
    var newElem = this.svg.append("g");
    var that = this;
    var distance = that.rectHeight-(that.height-(that.rectHeight+that.padding)*top);
    this.data.pop();
    this.top--;
    console.log("top="+top);
    console.log("thistop="+this.top);
    this.redrawStack();
    newElem.append("rect")
            .attr("x",this.width/2-this.rectWidth/2)
            .attr("y",that.height-(that.rectHeight+that.padding)*(top+1))
            .attr("width",this.rectWidth)
            .attr("height",this.rectHeight)
            .attr("fill",val.background)
            .attr("rx",2)
            .attr("ry",2);

    newElem.append("text")
            .text(val.text)
            .attr("x",that.width/2)
            .attr("y",that.rectHeight/3*2 + that.height-(that.rectHeight+that.padding)*(top+1))
            .attr("text-anchor", "middle")
            .attr("font-size", parseInt(that.rectHeight / 3) )
            .attr("fill",val.color);

    newElem.transition()
           .attr("transform","translate(0,"+distance+")").duration(500).ease(d3.easeSinOut);

    setTimeout(function(){
      newElem.remove().exit();
    },300);
  };

  Stack.prototype.clear = function () {
    this.svg.selectAll(".stack").remove();
    this.top = -1;
    this.data = [];
  };

  Stack.prototype.setData = function (idx, val) {
    this.data[idx].text = val;
    this.svg.select(
    "#elemIdx_" + idx +
    " text").text(val);
  };

  Stack.prototype.highlight = function (row, col, color) {
    this.data[row][col].background = color;
    this.svg.select(
      "#rowIdx_" + row +
      " #colIdx_" + col +
      " rect")
      .transition()
      .attr("fill", color);
  };

  Stack.prototype.unhighlight = function (row, col){
    this.data[row][col].background = "#f2f2f2";
    this.svg.select(
      "#rowIdx_" + row +
      " #colIdx_" + col +
      " rect")
      .attr("fill", "#f2f2f2");
  };

  Stack.prototype.unhighlightAll = function (){
    this.svg.selectAll(".cell rect")
      .attr("fill", "#f2f2f2");
  };

  Stack.prototype.unhighlightColor = function (color) {
    this.svg.selectAll(".cell rect")
      .attr("fill", function (d, i) {
        if (d.background === color) {
          d.background = "#f2f2f2";
        }
        return d.background;
      });
  };

  thisplay.Stack = Stack;

})(thisplay, d3);
