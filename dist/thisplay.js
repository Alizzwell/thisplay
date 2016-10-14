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

    var width = 500;
    var height = 500;
    var radius = 50;

    var nodes = [];
	  var links = [];

    var default_node_color = "#0aa";
    var default_link_color = "#ccc";

    var forceManyBody = d3.forceManyBody()
        .strength(-3000)
        .theta(0.9) // need to test
        .distanceMin(100) // ntt
        .distanceMax(1000); // ntt

    var forceLink = d3.forceLink();
    forceLink
      .links(links)
      .distance(500) // ntt
      .strength(-2000) // ntt
      .iterations(0.8); // ntt

    var forceCollide = d3.forceCollide()
    .radius(radius)
    .strength(0.9)
    .iterations(1);

    var	force = d3.forceSimulation();

    force
      .nodes(nodes)
      .force("charge", forceManyBody)
      .force("link", forceLink)
      .force("center", d3.forceCenter(width/2, height/2))
      .force("collide", forceCollide)
      .force("x", d3.forceX().strength(0.05))
      .force("y", d3.forceY().strength(0.05))
      .alphaMin(0.2)
      .alphaDecay(0.1)
      .velocityDecay(0.4)
      .on("tick", function () {
        svgNode.selectAll(".node")
          .attr("transform", function(d) { return 'translate(' + [d.x , d.y] + ')' ;})
          .attr("x", function(d) { return d.x; })
          .attr("y", function(d) { return d.y; });

        svgNode.selectAll(".nodetext")
          .attr("transform", function(d) {
            return 'translate(' + [d.x, d.y+15] + ')' ;
          });

        svgLink.selectAll(".link")
          .attr("d", function(d) {
            if(d.is_directed === "true") return drawDirectedLine(d);
            else return drawUnDirectedLine(d);
        });

				svgLink.selectAll(".linktext")
          .attr("transform", function(d){
            if(d.is_directed === "true") return drawDirectedText(d);
            else return drawUnDirectedText(d);
        });
      });



    var drawUnDirectedLine = function (d) {
      var sx = d.source.getAttribute("x"), sy = d.source.getAttribute("y");
      var tx = d.target.getAttribute("x"), ty = d.target.getAttribute("y");
      return "M" + sx + "," + sy +
      "L" + tx + "," + ty ;
    };

    var drawDirectedLine = function (d) {
      var sx = d.source.getAttribute("x"), sy = d.source.getAttribute("y");
      var tx = d.target.getAttribute("x"), ty = d.target.getAttribute("y");
      var dx = tx - sx;
      var dy = ty - sy;
      var dr = Math.sqrt(dx * dx + dy * dy);
      var theta = Math.atan2(dy, dx) + 0.1;
			var d90 = Math.PI / 2;
      var dtxs = tx - 1.43 * radius * Math.cos(theta);
      var dtys = ty - 1.43 * radius * Math.sin(theta);
      var val1 = 3.5, val2 = 8.5;
      return "M" + sx + "," + sy +
	      "A" + 1.5*dr + "," + 1.5*dr + " 0 0 1," + dtxs + "," + dtys +
	      "A" + 1.5*dr + "," + 1.5*dr + " 0 0 0," + sx + "," + sy +
	      "M" + dtxs + "," + dtys +
	      "l" + (val1 * Math.cos(d90 - theta) - val2 * Math.cos(theta)) + "," +
	      (-val1 * Math.sin(d90 - theta) - val2 * Math.sin(theta)) +
	      "L" + (dtxs - val1 * Math.cos(d90 - theta) - val2 * Math.cos(theta)) + "," +
	      (dtys + val1 * Math.sin(d90 - theta) - val2 * Math.sin(theta)) + "z";
    };

    var drawDirectedText = function(d){
      var sx = d.source.getAttribute("x"), sy = d.source.getAttribute("y");
      var tx = d.target.getAttribute("x"), ty = d.target.getAttribute("y");
      var dx = tx - sx;
      var dy = ty - sy;
      var dr = Math.sqrt(dx * dx + dy * dy),
        theta = Math.atan2(dy, dx),
        d90 = Math.PI / 2;
      var cx = tx - dr/2* Math.cos(theta),
          cy = ty - dr/2* Math.sin(theta);

      return 'translate(' + [cx + 70 * Math.cos(d90-theta),
          cy - 70 * Math.sin(d90-theta)] + ')';
    };

    var drawUnDirectedText = function(d){
      var sx = Number(d.source.getAttribute("x"));
      var sy = Number(d.source.getAttribute("y"));
      var tx = Number(d.target.getAttribute("x"));
      var ty = Number(d.target.getAttribute("y"));
      var dx = tx - sx;
      var dy = ty - sy;
      var theta = Math.atan2(dy, dx);
			var d90 = Math.PI / 2;

      return 'translate(' + [(sx+tx)/2 - 45*Math.cos(d90-theta), (sy+ty)/2 + 45*Math.sin(d90-theta)] + ')';
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
      .attr("id", function(d) { return d.id; })
      .attr("is_directed", function(d) { return d.is_directed; });

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
      .attr("id", function(d) { return "text" + d.id; })
      .text(function(d) { return d.text; })
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    function dragstarted(d) {
      if (!d3.event.active) that.force.alpha(0.6).restart();
      that.force.alpha(0.6);
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) that.force.alphaTarget(0.2);
      d.fx = null;
      d.fy = null;
    }
  };

  Graph.prototype.makeNode = function (idx, text) {
    if(this.svgNode.select("#node_"+idx).node() === null) {
			var last = this.nodes.length - 1;

      this.nodes.push({id: "node_" + idx, idx: idx, text: text,
			x: (last < 0 ? this.width / 2 : this.nodes[last].x),
			y: (last < 0 ? this.height / 2 : this.nodes[last].y)
		});
    }
    else {
      for(var i = 0; i < this.nodes.length; i++){
        if(this.nodes[i].idx === idx){
          this.nodes[i].text = text;
          this.svgNode.select("#textnode_" + idx).text(text);
          break;
        }
      }
    }
    this.force.nodes(this.nodes).alpha(1).restart();
    this.redraw();
  };

  Graph.prototype.makeEdge = function (source, target, value, is_directed) {
    var that = this;
    var snode, tnode;
    var edge = this.svgLink.select("#link_" + source + "_" + target).node();
    var tmp;

    if(source > target && is_directed !== "true"){
      tmp = source;
      source = target;
      target = tmp;
    }

    snode = this.svgNode.select("#node_" + source).node();
    tnode = this.svgNode.select("#node_" + target).node();

    if(source == target){
      // source == target
    }
    else if(snode === null || tnode === null){
      // pr("no node");
    }
    else if(edge === null){
      this.links.push({
        id : "link_" + source + "_" + target,
        source : snode,
        target : tnode,
        value : value,
        is_directed: is_directed
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

  Graph.prototype.highlightNode = function (idx) {
   	var node = this.svg.select("#node_" + idx);
    if(node.node() !== null) {
      node.transition().duration(500).style("fill", "#F0F");
    }
  };

  Graph.prototype.highlightEdge = function (source, target) {
   	var edge = this.svg.select("#link_" + source + "_" + target);
    var edge2 = this.svg.select("#link_" + target + "_" + source);
		
    if(edge2.node() !== null)
      if(edge2.node().getAttribute("is_directed") !== "true") {{
        edge2.transition().duration(500).style("stroke", "black");
      }
    }
    if(edge.node() !== null) {
      edge.transition().duration(500).style("stroke", "black");
    }
  };

  Graph.prototype.deleteEdge = function (source, target){
    var snode = this.svgNode.select("#node_" + source).node();
    var tnode = this.svgNode.select("#node_" + target).node();

    if(source == target || snode === null || tnode === null) return ;

    for(var i = 0; i<this.links.length; i++){
      if(this.links[i].source == snode && this.links[i].target == tnode){
        console.log("1");
        this.links.splice(i, 1);
      }
      else if(this.links[i].source == tnode &&
				this.links[i].target == snode &&
				this.links[i].is_directed !== "true"){
        console.log("2");
        this.links.splice(i, 1);
        this.svgLink.select("#link_" + target + "_" + source).remove();
        this.svgLink.select("#textlink_" + target + "_" + source).remove();
      }
    }

    this.svgLink.select("#link_" + source + "_" + target).remove();
    this.svgLink.select("#textlink_" + source + "_" + target).remove();
    this.forceLink.links(this.links);
    this.force.alpha(1).restart();
    this.redraw();
  };

  Graph.prototype.deleteNode = function (idx){
    for(var i=0; i<this.nodes.length; i++){
      if(this.nodes[i].idx === idx){
        for(var j=0; j<this.nodes.length; j++){
          this.deleteEdge(idx, j);
          this.deleteEdge(j, idx);
        }
        this.svgNode.select("#"+this.nodes[i].id).remove();
        this.svgNode.select("#text"+this.nodes[i].id).remove();
        this.nodes.splice(i, 1);
      }
    }

    this.force.nodes(this.nodes).alpha(1).restart();
    this.redraw();
  };

  Graph.prototype.unHighlightNode = function (idx) {
   	var node = this.svg.select("#node_" + idx);
    if(idx === undefined){
      this.unHighlightNodeAll();
    }
    else if(node.node() !== null) {
      node.transition().duration(500).style("fill", this.default_node_color);
    }
  };

  Graph.prototype.unHighlightEdge = function (source, target) {
   	var edge = this.svg.select("#link_" + source + "_" + target);
    if(source === undefined && target === undefined){
      this.unHighlightEdgeAll();
    }
    else if(edge.node() !== null) {
      edge.transition().duration(500).style("stroke", this.default_link_color);
    }
  };

  Graph.prototype.unHighlightNodeAll = function () {
    for(var i = 0; i < this.nodes.length; i++){
      this.unHighlightNode(this.nodes[i].idx);
    }
  };

  Graph.prototype.unHighlightEdgeAll = function () {
    for(var i = 0; i < this.links.length; i++){
      this.svg.select("#" + this.links[i].id)
      .transition().duration(500).style("stroke", this.default_link_color);
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
		var svg = d3.select(target).append("g")
      .attr("class", "thisplay-chart")
      .attr("transform", "translate(25, 25)");

		var queue;
		var queueData = [];
		var front = 0;
		var rear = 0;
		var rectWidth = 80;
		var rectHeight = 80;
		var padding = 5;
		var width = 1000;
		var height = 700;
		var popCount = 0;

    var zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on("zoom", function () {
        svg.attr("transform", d3.event.transform);
      });

    d3.select(target).call(zoom);

		this.container = svg;
		this.target = target;
		this.queue = queue;
		this.queueData = queueData;
		this.front = front;
		this.rear = rear;
		this.rectWidth = rectWidth;
		this.rectHeight = rectHeight;
		this.padding = padding;
		this.popCount = popCount;


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
				.text(function(){return "queue["+(i+that.popCount)+"] = "+ that.queueData[i];})
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

		this.popCount++;
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
		while(this.front < this.rear)
		{
			this.pop();
		}
  };

	Queue.prototype.init = function () {
		this.clear();
		this.front = 0;
		this.rear = 0;
		this.popCount = 0;
		this.drawQueue();
  };

  Queue.prototype.drawQueue = function () {
		var that = this;

    if(this.queue !== undefined){
			this.queue.remove().exit();
		}

		this.queue = this.container.append("g");

		if(this.queueData.length === 0)
		{
			this.queue.append("text")
				.text("▼▼")
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
				.text("rear")
				.attr("font-family","Consolas")
				.attr("font-size","20px")
				.attr("fill","black")
				.attr("text-anchor","middle")
				.attr("x",function(){return 100+(that.rectWidth+that.padding)*(that.rear-that.front) +that.rectWidth/2;})
				.attr("y",function(){return 300-that.rectHeight*0.8;});
			return ;
		}

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
    var lineData;
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
    this.rectHeight = 40;
    this.rectWidth = 70;
    this.padding = this.rectHeight / 10;
    this.top = -1;
    lineData = [
      {"x" : (width-this.rectWidth-4*this.padding)/2, "y" : this.padding},
      {"x" : (width-this.rectWidth-4*this.padding)/2, "y" : height/2},
      {"x" : (width-this.rectWidth-4*this.padding)/2, "y" : height},
      {"x" : (width-this.rectWidth-4*this.padding)/2, "y" : height+this.padding},
      {"x" : (width+this.rectWidth+4*this.padding)/2, "y" : height+this.padding},
      {"x" : (width+this.rectWidth+4*this.padding)/2, "y" : height},
      {"x" : (width+this.rectWidth+4*this.padding)/2, "y" : height/2},
      {"x" : (width+this.rectWidth+4*this.padding)/2, "y" : this.padding}
    ];

    var lineFunc = d3.line().x(function(d){return d.x;}).y(function(d){return d.y;}).curve(d3.curveCatmullRom,1.0);

    svg.append("path")
    .attr("d",lineFunc(lineData))
    .attr("stroke","#C6B2BB")
    .attr("stroke-width","2")
    .attr("fill","none")
    .attr("id","stackLine");

    var lineLength = d3.select("#stackLine").node().getTotalLength();

     d3.select("#stackLine")
      .attr("stroke-dasharray", lineLength)
      .attr("stroke-dashoffset", lineLength)
      .transition()
      .duration(1000)
      .attr("stroke-dashoffset", 0);



    var that = this;


    this.mouseOver = function(d,i){
      d3.select("#elemIdx_"+i)
        .attr("fill","#D3C4BE")//"#9598AB")
        .attr("width",that.rectWidth*1.1)
        .attr("height",that.rectHeight*1.1)
        .attr("transform","translate("+(-that.rectWidth*0.05)+","+(-that.rectHeight*0.05)+")");


      that.svg.append("text")
      .text("←")
      .attr("font-family","Arial")
      .attr("font-size", (that.rectHeight / 2)+"px")
      .attr("fill",that.data[i].color)
      .attr("text-anchor","middle")
      .attr("id","arrow")
      .attr("x", that.width/2+that.rectWidth/2 + 10)
      .attr("y",that.height-(that.rectHeight+that.padding)*(i+1)+that.rectHeight/3*2);


      that.svg.append("text")
          .text(function(){return "stack["+i+"] = " + that.data[i].text;})
          .attr("x", that.width/2+ that.rectWidth/2 + 10 + that.rectHeight / 2)
          .attr("y",that.height-(that.rectHeight+that.padding)*(i+1)+that.rectHeight/3*2)
          .attr("font-family","Arial")
          .attr("font-size",(that.rectHeight / 2)+"px")
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

  Stack.prototype.init = function(size){
    this.clear();
    if (!size) return;
    this.top = -1;
   // this.rectWidth = Math.ceil(this.width/10);
    if(size < 7){
      this.rectHeight = Math.ceil(this.height/(size+size/10));
      this.padding = this.rectHeight/10;
    }

  };

  Stack.prototype.redrawStack = function () {
    var that = this;
    this.svg.selectAll(".stack").remove();

    var rectWidth;
    var rectHeight;

    var ele = this.svg.append('g')
    .attr("class", "stack");

    if(this.top>=5){
      this.rectHeight = Math.ceil(this.height/(this.top+3+(this.top+3)/10));
      this.padding = this.rectHeight/10;
    }
    rectWidth = this.rectWidth;
    rectHeight = this.rectHeight;
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
      .attr("font-family","Arial")
      .attr("font-size",function(d){return rectHeight / 3 +"px";})
      .attr("fill", function (d) { return d.color; })
      .text(function (d) {  return d.text; });
  };

  Stack.prototype.push = function(val) {
    var that = this;
    this.top++;
    this.data[this.top] = {
        text:val,
        color:"#4F474A",
        background: "#EBCFC4"//"#FFA4A7"
      };


    this.svg.select("#elemIdx_" + this.top + " text").text(val);
    var distance = this.height-(this.rectHeight+this.padding)*(this.top+1);
    if( this.top > 5){
      distance = that.rectHeight-(that.height-(that.rectHeight+that.padding)*(this.top-1))+that.rectHeight*3;
    }
    var newElem = this.svg.append("g");
    
    var fontSize = that.rectHeight / 3;


    newElem.append("rect")
            .attr("x",this.width/2-this.rectWidth/2)
            .attr("y",0)
            .attr("width",this.rectWidth)
            .attr("height",this.rectHeight)
            .attr("fill","white")
            .attr("rx",2)
            .attr("ry",2)
            .attr("id","newElemRect");

    newElem.append("text")
            .text(val)
            .attr("x",that.width/2)
            .attr("y",that.rectHeight/3*2)
            .attr("text-anchor", "middle")
            .attr("font-family","Arial")
            .attr("font-size", (that.rectHeight / 3)+"px" )
            .attr("fill","white")
            .attr("id","newElemText");


    d3.select("#newElemRect")
            .transition()
            .attr("fill",this.data[this.top].background)
            .duration(300);

    d3.select("#newElemText")
            .transition()
            .attr("fill",this.data[this.top].color)
            .duration(300);

    newElem.transition()
            .attr("transform","translate(0,"+distance+")").duration(500).delay(300).ease(d3.easeSinOut);

    setTimeout(function(){
      newElem.remove().exit();
      that.redrawStack();
    },700);
  };

  Stack.prototype.pop = function(){
    var top = this.top;
    if (top < 0) return;
    var val = this.data[top];
    var newElem = this.svg.append("g");
    var that = this;
    var distance = -(this.height-(this.rectHeight+this.padding)*(this.top));
    if( this.top > 5){
      distance = that.rectHeight-(that.height-(that.rectHeight+that.padding)*(this.top))+that.rectHeight*3;
      distance *=-1;
    }

    this.data.pop();
    this.top--;

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
            .attr("font-family","Arial")
            .attr("font-size", (that.rectHeight / 3 )+"px")
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

;(function (window, d3) {
	'use strict';


	function Tree(target) {
    d3 = d3 || window.d3;

    var svg = d3.select(target).append("g")
      .attr("class", "thisplay-tree")
      .attr("transform", "translate(25, 25)");

    var data = [];
    var treeWidth = 60;
    var treeHeight = 80;

    var zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on("zoom", function () {
        svg.attr("transform", d3.event.transform);
      });

    d3.select(target).call(zoom);

    this.svg = svg;
    this.data = data;
    this.treeWidth = treeWidth;
    this.treeHeight = treeHeight;
    this.beforeTreeWidth = 0;
  }

  Tree.prototype.makeNode = function(id, val) {
    this.data.push({"val": val, "id": id, "par": -1, "children": []});
    this.redraw();
  };

  Tree.prototype.findNode = function (node, id) {
    var that = this;

    if (node.id === id)
      return node;

    var ret;
    node.children.forEach(function(d) {
      var temp = that.findNode(d, id);
      if (temp)
        ret = temp;
    });

    return ret;
  };

  Tree.prototype.connect = function (parId, childId) {
    var par, parIdx, childIdx;
    var duration = 1000;
    var that = this;

    this.data.forEach(function(d, i) {
      if (d.id === childId) {
        childIdx = i;
      }
    });

    for (var i = 0; i < this.data.length; i++) {
      if (i === childIdx)
        continue;

      par = this.findNode(this.data[i], parId);
      if (par) {
        parIdx = i;
        break;
      }
    }

    if (!par || childIdx === undefined) {
      console.log("no id");
      console.log(par);
      console.log(childIdx);
      return;
    }

    par.children.push(this.data[childIdx]);
    this.data.splice(childIdx, 1);

    this.connectAni(parIdx, childIdx, duration);

    setTimeout(function() {
      that.redraw();
    }, duration);
  };

  Tree.prototype.connectAni = function (parIdx, childIdx, duration) {
    this.redrawTrans(duration, parIdx);

    this.svg.selectAll(".trees")
      .transition().duration(duration)
      .attr("opacity", function(d, i) { return i === childIdx || i === parIdx ? 0 : 1; });
  };

  Tree.prototype.maxDepth = function (root) {
    var that = this;
    var max = root.depth;

    if (!root.children)
      return max;

    root.children.forEach(function (d) {
      var temp = that.maxDepth(d);
      if (temp > max)
        max = temp;
    });

    return max;
  };

  Tree.prototype.numLeaf = function (root) {
    var ret = 0;
    var that = this;

    if (!root.children)
      return 1;

    root.children.forEach(function (d) {
      var temp = that.numLeaf(d);
      ret += temp;
    });

    return ret;
  };

  Tree.prototype.redrawTrans = function (duration, idx) {
    var that = this;
    this.beforeTreeWidth = 0;

    console.log(idx);

    this.data.forEach(function (data, i) {
      var maxDepth = 0;
      var tree = d3.tree();
      var nodes = d3.hierarchy(data, function (d) { return d.children; });
      //console.log(nodes);
      maxDepth = that.maxDepth(nodes);
      var numLeaf = that.numLeaf(nodes);

      tree.size([that.treeWidth * numLeaf, that.treeHeight * maxDepth]);
      nodes = tree(nodes);

      var g = that.svg//.selectAll(".trees")
        .append("g")
        .attr("class", "trees")
        .attr("opacity", 1)
        .attr("transform", function () { return "translate(" + that.beforeTreeWidth + ",0)"; });
      that.beforeTreeWidth += that.treeWidth * numLeaf;


      if (idx !== undefined && idx !== i)
        return;

      var link = g.selectAll(".link").data(nodes.descendants().slice(1));
      link.enter().append("path")
        .attr("class", "link")
        .attr("opacity", 0)
        .attr("d", function(d) {
          return "M" + d.x + "," + d.y +
						"C" + d.x + "," + (d.y + d.parent.y) / 2 +
						" " + d.parent.x + "," + (d.y + d.parent.y) / 2 +
						" " + d.parent.x + "," + d.parent.y;
        })
        .transition().duration(duration)
        .attr("opacity", 1);

      var node = g.selectAll(".node").data(nodes.descendants());
      var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("opacity", 0)
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

      nodeEnter.append("circle")
        .attr("r", 20);
      nodeEnter.append("text")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .text(function (d) { return d.data.val; });

      nodeEnter.transition().duration(duration)
        .attr("opacity", 1);
    });
  };

  Tree.prototype.redraw = function () {
    this.clearSVG();

    this.redrawTrans(0);
  };

  Tree.prototype.clear = function () {
    this.data = [];
    this.redraw();
  };

  Tree.prototype.clearSVG = function () {
    this.svg.selectAll(".trees").remove();
  };

  window.thisplay.Tree = Tree;

})(window, window.d3);
