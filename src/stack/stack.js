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
