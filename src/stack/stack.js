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
