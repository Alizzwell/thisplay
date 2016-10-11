;(function (window, d3) {
	'use strict';


	function LinkedList(target) {
    d3 = d3 || window.d3;

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
          return "translate(" + (i * 80) + ",15)" 
        }
        else {
          return "translate(" + ((i + 1) * 80) + ",15)" 
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
  }
  
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
          return "translate(" + ((i - 1) * 80) + ",15)" 
        }
        else {
          return "translate(" + (i * 80) + ",15)" 
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
      .attr("transform", function(d, i) { return "translate(" + (i * 80) + ",15)" })
      .attr("d", "M40,0 L70,0")
      .style("marker-end", "url(#arrow)")
      .style("stroke", "black")
      .style("stroke-width", "3px")
      .attr("opacity", 1);
  };

  window.thisplay.LinkedList = LinkedList;

})(window, window.d3);
