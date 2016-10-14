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
