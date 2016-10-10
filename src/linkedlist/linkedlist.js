;(function (window, d3) {
	'use strict';


	function LinkedList(target) {
    d3 = d3 || window.d3;

    var svg = d3.select(target).append("g")
      .attr("class", "thisplay-linkedlist")
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

  LinkedList.prototype.addNode = function(idx, val) {
    // if (idx < 0 || this.data.length < idx) {
    //   console.log("index 범위 초과");
    //   return;
    // }
    
    var that = this;
    var duration = 500;
    
    if (this.data.length === idx || this.data.length === 0) {
      this.addNodeAniOpacity(idx, val, duration);
    }
    else {
      this.addNodeAniMove(idx, val, duration);
      setTimeout(function() { that.addNodeAniOpacity(idx, val, duration); }, duration);
    }
  };
  
  LinkedList.prototype.addNodeAniMove = function(idx, val, dur) {
    // idx부터 모두 뒤로 옮기는 애니메이션
    this.svg.selectAll(".node")
      .transition().duration(dur)
      .attr("x", function(d, i) {
        if (i < idx)  return i * 50;
        else          return (i + 1) * 50;
      });
      
    this.svg.selectAll(".text")
      .transition().duration(dur)
      .attr("x", function(d, i) { 
        if (i < idx)  return i * 50 + 15;
        else          return (i + 1) * 50 + 15;
      });
  };
  
  LinkedList.prototype.addNodeAniOpacity = function(idx, val, dur) {
    // idx의 노드를 opacity 0에서 1로 변경
    
    this.data.splice(idx, 0, val);
    this.h.splice(idx, 0, 0);
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
        that.h.splice(idx, 1);
        that.redraw();
      }, delay);
  }
  
  LinkedList.prototype.deleteNodeAniMove = function(idx, dur) {
    this.svg.selectAll(".node")
      .transition().duration(dur)
      .attr("x", function(d, i) {
        if (i > idx)  return (i - 1) * 50;
        else          return i * 50;
      });
      
    this.svg.selectAll(".text")
      .transition().duration(dur)
      .attr("x", function(d, i) { 
        if (i > idx)  return (i - 1) * 50 + 15;
        else          return i * 50 + 15;
      });
  };
  
  LinkedList.prototype.deleteNodeAniOpacity = function(idx, dur) {
    this.svg.selectAll(".node")
      .transition().duration(dur)
      .attr("opacity", function(d, i) { return i === idx ? 0 : 1; });
    this.svg.selectAll(".text")
      .transition().duration(dur)
      .attr("opacity", function(d, i) { return i === idx ? 0 : 1; });
  };

  LinkedList.prototype.setData = function (idx, val) {
    var that = this;
    this.data[idx] = val;
    
    this.svg.selectAll(".text")
      .data(this.data)
      .text(function(d) { return d; });
  };

  LinkedList.prototype.clear = function () {
    this.svg.selectAll(".node").remove();
    this.svg.selectAll(".text").remove();
  };

  LinkedList.prototype.highlight = function (idx) {
    this.h[idx] = 1;
    this.reColoring();
  };

  LinkedList.prototype.unhighlight = function (idx) {
    if (idx === undefined) {
      this.h.fill(0);
    }
    else {
      this.h[idx] = 0;
    }
    this.reColoring();
  };

  LinkedList.prototype.redraw = function () {
    var that = this;
    this.clear();
    
    this.svg.selectAll(".node")
      .data(this.data)
      .enter().append("rect")
      .attr("class", "node")
      .attr("x", function(d, i) { return i * 50; })
      .attr("y", 0)
      .attr("width", 30)
      .attr("height", 30)
      .attr("opacity", 1);
      
    this.svg.selectAll(".text")
      .data(this.data)
      .enter().append("text")
      .attr("class", "text")
      .attr("x", function(d, i) { return i * 50 + 15; })
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "central")
      .attr("opacity", 1)
      .text(function(d) { return d; });
      
    this.reColoring();
  };


  LinkedList.prototype.reColoring = function () {
    var self = this;
    this.svg.selectAll(".node")
      .style("fill", function (d, i) {
        if (self.h[i] === 1) return 'red';
      });
  };

  window.thisplay.LinkedList = LinkedList;

})(window, window.d3);
