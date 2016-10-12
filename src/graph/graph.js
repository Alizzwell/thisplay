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
    }

    var drawText = function(d){
        var sx = d.source.getAttribute("x"), sy = d.source.getAttribute("y");
        var tx = d.target.getAttribute("x"), ty = d.target.getAttribute("y");
				var dx = tx - sx;
				var dy = ty - sy;
				dx = dx * 3, dy = dy * 3;

				var dr = Math.sqrt(dx * dx + dy * dy),
					theta = Math.atan2(dy, dx) + Math.PI / 11.95,
					d90 = Math.PI / 2,
					dtxs = tx - 4 * radius * Math.cos(theta),
					dtys = ty - 4 * radius * Math.sin(theta);
				return 'translate(' + [dtxs, dtys] + ')';
    }

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
    if(this.svgNode.select("#node_"+id).node() == null) {
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

    if(snode == null || tnode == null){
      // pr("no node");
    }
    else if(edge == null){
      this.links.push({
        id : "link_" + source + "_" + target,
        source : snode,
        target : tnode,
        value : value,
        is_directed_array : false
      });
    }
    else{
      for(var i=0;i<this.links.length;i++){
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
