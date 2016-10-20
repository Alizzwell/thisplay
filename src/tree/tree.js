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
    var nodeIds = {};
    var h = [];

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
    this.nodeIds = nodeIds;
    this.h = h;
  }
  
  Tree.prototype.makeNode = function(id, val) {
    if (this.nodeIds[id])
      return;
    var newNode = {"val": val, "id": id, "children": []};
    this.nodeIds[id] = newNode;
    this.data.push(newNode);
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
    var duration = 1500;
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
      console.log("invalid id");
      return;
    }
    
    var parTreeTF = this.svg.select("#tree" + parIdx)
      .attr("transform");
    
    var parNodeTF = this.svg.select("#node" + parId)
      .attr("transform");
      
    var childNodeTF = this.svg.select("#node" + childId)
      .attr("transform");
      
    function getTFArg1 (str) {
      var a = str.substring(str.indexOf("(") + 1, str.indexOf(","));
      return Number(a);
    }
    function getTFArg2 (str) {
      var a = str.substring(str.indexOf(",") + 1, str.indexOf(")"));
      return Number(a);
    }
    
    var TF = "translate(" 
      + (getTFArg1(parTreeTF) + getTFArg1(parNodeTF) - getTFArg1(childNodeTF)) + ","
      + (getTFArg2(parTreeTF) + getTFArg2(parNodeTF) + this.treeHeight) + ")";
      
      
    this.svg.select("#tree" + childIdx)
      .transition().duration(duration)
      .attr("transform", TF);
    
    par.children.push(this.data[childIdx]);
    this.data.splice(childIdx, 1);
    
    setTimeout(function() {
      that.redraw();
    }, duration);
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
  }
  
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
    
  Tree.prototype.highlight = function (id) {
    this.h.push(id);
    this.svg.select("#node" + id).select("circle")
      .style("fill", "#f88")
  };
  
  Tree.prototype.unhighlight = function (id) {
    if (id === undefined) {
      this.h = [];
      this.svg.selectAll(".node")
        .select("circle")
        .style("fill", "#fff");
    }
    else {
      var i;
      for (i = 0; i < this.h.length; i++) {
        if (this.h[i] === id)
          break;
      }
      this.h.splice(i, 1);
      this.svg.select("#node" + id).select("circle")
        .style("fill", "#fff");
    }
  }
  
  Tree.prototype.recolor = function () {
    this.svg.selectAll(".node")
      .select("circle")
      .style("fill", "#fff");
    for (var i = 0; i < this.h.length; i++) {
      var id = this.h[i];
      this.svg.selectAll("#node" + id).select("circle")
        .style("fill", "#f88")
    }
  };
  
  Tree.prototype.redraw = function () {
    this.clearSVG();
    
    var that = this;
    this.beforeTreeWidth = 0;
    
    for (var i = 0; i < this.data.length; i++) {
      var data = this.data[i];
      var tree = d3.tree();
      var nodes = d3.hierarchy(data, function (d) { return d.children; });
      var maxDepth = 0;
      maxDepth = this.maxDepth(nodes);
      var numLeaf = this.numLeaf(nodes);
      
      tree.size([this.treeWidth * numLeaf, this.treeHeight * maxDepth]);
      nodes = tree(nodes);
      
      var g = this.svg
        .append("g")
        .attr("class", "tree")
        .attr("id", function () { return "tree" + i; })
        .attr("opacity", 1)
        .attr("transform", function () { return "translate(" + that.beforeTreeWidth + ",0)"; });
      this.beforeTreeWidth += this.treeWidth * numLeaf;
        
      var link = g.selectAll(".link").data(nodes.descendants().slice(1));
      link.enter().append("path")
        .attr("class", "link")
        .attr("d", function(d) {
          return "M" + d.x + "," + d.y
            + "C" + d.x + "," + (d.y + d.parent.y) / 2
            + " " + d.parent.x + "," + (d.y + d.parent.y) / 2
            + " " + d.parent.x + "," + d.parent.y;
        })
        .attr("opacity", 1);
      
      var node = g.selectAll(".node").data(nodes.descendants());
      var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("id", function (d) { return "node" + d.data.id; })
        .attr("opacity", 1)
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
        
      nodeEnter.append("circle")
        .attr("r", 20);
      nodeEnter.append("text")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .text(function (d) { return d.data.val; });
    }
    
    this.recolor();
  };
  
  Tree.prototype.clear = function () {
    this.data = [];
    this.h = [];
    this.nodeIds = {};
    this.redraw();
  };
  
  Tree.prototype.clearSVG = function () {
    this.svg.selectAll(".tree").remove();
  };
  
  window.thisplay.Tree = Tree;

})(window, window.d3);
