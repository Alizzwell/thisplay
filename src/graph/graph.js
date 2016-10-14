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
    }
    
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
      this.nodes.push({id: "node_" + idx, idx: idx, text: text});
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
    if(edge2.node() != null)
      if(edge2.node().getAttribute("is_directed") !== "true") {{
        edge = edge2;
      }
    }  
    console.log(edge.node());
    console.log(edge2.node());    
    if(edge.node() !== null) {
      edge.transition().duration(500).style("stroke", "black");
    }
  };
  
  Graph.prototype.deleteEdge = function (source, target){
    var snode = this.svgNode.select("#node_" + source).node();
    var tnode = this.svgNode.select("#node_" + target).node();
    
    if(source == target || snode == null || tnode == null) return ;
    
    for(var i = 0; i<this.links.length; i++){
      if(this.links[i].source == snode && this.links[i].target == tnode){
        console.log("1");
        this.links.splice(i, 1);
      }
      else if(this.links[i].source == tnode && this.links[i].target == snode 
        && this.links[i].is_directed !== "true"){
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
  }
  
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
  }
  
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
