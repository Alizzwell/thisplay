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

    var forceManyBody = d3.forceManyBody()
        .strength(-3500)
      //  .theta(0.9) // need to test
        .distanceMin(100) // ntt
        .distanceMax(1000); // ntt

    var forceLink = d3.forceLink();
    forceLink
      .links(links)
      .distance(300) // ntt
      .strength(-200) // ntt
      .iterations(0.5); // ntt

    var forceCollide = d3.forceCollide()
    .radius(width/2)
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
      .alphaDecay(0.05)
      .velocityDecay(0.85)
      .on("tick", function () {
        svgNode.selectAll(".node")
          .attr("transform", function(d) { return 'translate(' + [d.x , d.y] + ')' ;})
          .attr("x", function(d) { return d.x; })
          .attr("y", function(d) { return d.y; });

        svgNode.selectAll(".nodetext")
          .attr("transform", function(d) {
            return 'translate(' + [d.x, d.y+10] + ')' ;
          });

        svgLink.selectAll(".link")
          .attr("d", function(d) {
            if(d.is_directed === true) return drawDirectedLine(d);
            else return drawUnDirectedLine(d);
        });

				svgLink.selectAll(".linktext")
          .attr("transform", function(d){
            return drawText(d);
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
      dx = dx * 3;
			dy = dy * 3;
      var dr = Math.sqrt(dx * dx + dy * dy);
      var theta = Math.atan2(dy, dx) + 0.2;
			var d90 = Math.PI / 2;
      var dtxs = tx - 1.43 * radius * Math.cos(theta);
      var dtys = ty - 1.43 * radius * Math.sin(theta);
      var val1 = 3.5, val2 = 8.5;
      return "M" + sx + "," + sy +
	      "A" + dr + "," + dr + " 0 0 1," + dtxs + "," + dtys +
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
      var dr = Math.sqrt(dx * dx + dy * dy),
        theta = Math.atan2(dy, dx) + 0.3,
        dtxs = tx - 5 * radius * Math.cos(theta),
        dtys = ty - 5 * radius * Math.sin(theta);

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
      .text(function(d) { return d.text; });


    function dragstarted(d) {
      if (!d3.event.active) that.force.alpha(0.6).restart();
      that.force.alpha(0.3);
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
  
  Graph.prototype.makeEdge = function (source, target, value) {
    var that = this;
    var snode, tnode;
    var edge = this.svgLink.select("#link_" + source + "_" + target).node();
    
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
        is_directed: true
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
   
  Graph.prototype.makeUnDirectedEdge = function (source, target, value) {
    var that = this;
    var snode, tnode;
    var tmp;
    
    if(source > target){
      tmp = source;
      source = target;
      target = tmp;
    }
    
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
        is_directed: false
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

    this.force.alpha(1).restart();
    this.redraw();
   };
   
  Graph.prototype.highlightNode = function (idx) {
   	var node = this.svg.select("#node_" + idx);
    if(node.node() !== null) {
      node.transition().duration(500).style("fill", "red");
    }
  };

  Graph.prototype.highlightEdge = function (source, target) {
   	var edge = this.svg.select("#link_" + source + "_" + target); 
    var trg_to_src_edge = this.svg.select("#link_" + target + "_" + source);
    if(trg_to_src_edge.node() != null){
      if(trg_to_src_edge.node().getAttribute("is_directed") === false) {
        edge = this.svg.select("#link_" + target + "_" + source);
      }
    }    
    if(edge.node() !== null) {
      edge.transition().duration(500).style("stroke", "red");
    }
  };
  
  Graph.prototype.deleteEdge = function (source, target){
    var snode = this.svgNode.select("#node_" + source).node();
    var tnode = this.svgNode.select("#node_" + target).node();
    
    if(source == target || snode == null || tnode == null) return ;
    
    for(var i = 0; i<this.links.length; i++){
      if(this.links[i].source == snode && this.links[i].target == tnode){
         this.links.splice(i, 1);
      }
 
      if(this.links[i].source == tnode && this.links[i].target == snode 
        && this.links[i].is_directed === false){
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
      this.unHighlightNode(this.nodes[i].idx);
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
