

function queue(){
	// var drag = d3.drag()
 //    .on("start", dragstarted)
 //    .on("drag", dragged)
 //    .on("end", dragended);

    var zoom = d3.zoom()
    .scaleExtent([0.1,10])
    .on("zoom",zoomed);

	var container = d3.select("#section1")
	.append("svg")
	.attr("width",1000)
	.attr("height",700)
	.attr("id","container")
	.append("g");

	var queue;
	var queueData = [];
	

	var front = 0;
	var rear = 0;
	var rectWidth = 80;
	var rectHeight = 80;

	var padding = 5;

	var Push = function(_value, done){
		var newElem;

		rear++;
		queueData.push(_value);
		
		var position = (rectWidth+padding)*(rear-1)+100;
		var distance = 300;
		newElem = container.append("g");
		newElem.append("rect")
			.attr("x",position + distance)
			.attr("y",300)
			.attr("width",rectWidth)
			.attr("height",rectHeight)
			.attr("fill","#FAAF08")
			.attr("rx",10)
			.attr("ry",10);

		newElem.append("text")
			.text(_value)
			.attr("x",function(){return position+distance+rectWidth/2;})
		 	.attr("y",function(){return 300+rectHeight/5*3;})
			.attr("fill","black")
			.attr("font-family","Consolas")
			.attr("font-size","20px")
			.attr("text-anchor","middle");
					
		newElem.transition().duration(300)
			.attr("transform","translate("+(-distance)+",0)").ease(d3.easeSinOut);
					
		newElem.remove().exit();
		drawQueue();
				
		done();
	}

	var Pop = function(done){
		if(front == rear)
			return ;

		var newElem;
		var _value = queueData[0];

		front++;
		
		queueData = queueData.slice(1,queueData.length);
		
		drawQueue();
				
		var position = (rectWidth+padding)*(front-1)+100;
		var distance = 300;

		newElem = container.append("g");
		 newElem.append("rect")
			.attr("x",position)
		 	.attr("y",300)
			.attr("width",rectWidth)
			.attr("height",rectHeight)
			.attr("fill","#FAAF08")
			.attr("rx",10)
			.attr("ry",10);

		newElem.append("text")
			.text(_value)
			.attr("x",function(){return position+rectWidth/2;})
		 	.attr("y",function(){return 300+rectHeight/5*3;})
			.attr("fill","black")
			.attr("font-family","Consolas")
			.attr("font-size","20px")
			.attr("text-anchor","middle");
		
		//var distance = -300;
		newElem.transition().duration(300)
			.attr("transform","translate("+ (-distance)+",0)").ease(d3.easeSinOut);
								
		newElem.remove().exit();
		drawQueue();
			
		done();
	}


	var drawQueue = function(){
		
		if( queue !== undefined){
			queue.remove().exit();
		}

		if(queueData.length === 0)
			return ;

		
		d3.selectAll("#container").call(zoom);

		
		queue = container.append("g");
		queue.selectAll("g.rect")
			.data(queueData)
			.enter()
			.append("rect")
			.attr("x",function(d,i){return 100+(rectWidth+padding)*(front+i);})
			.attr("y",300)
			.attr("width",rectWidth)
			.attr("height",rectHeight)
			.attr("rx",10)
			.attr("ry",10)
			.attr("fill","#FAAF08")
			.attr("id",function(d,i){return "rectIdx"+i;})
			.attr("opacity",1.0)
			.on("mouseover",mouseOver)
			.on("mouseout",mouseOut);

		queue.selectAll("g.text")
			.data(queueData)
			.enter()
			.append("text")
			.text(function(d,i){return d;})
			.attr("x",function(d,i){return 100+(rectWidth+padding)*(front+i) +rectWidth/2;})
		 	.attr("y",function(){return 300+rectHeight/5*3;})
			.attr("fill","black")
			.attr("font-family","Consolas")
			.attr("font-size","20px")
			.attr("text-anchor","middle")
			.attr("id",function(d,i){return "textIdx"+i;});

		queue.append("text")
		.text("▼")
		.attr("font-family","Consolas")
		.attr("font-size","20px")
		.attr("fill","black")
		.attr("text-anchor","middle")
		.attr("x",function(){return 100+(rectWidth+padding)*front +rectWidth/2;})
		.attr("y",function(){return 300-rectHeight*0.2;})
		
		queue.append("text")
		.text("front")
		.attr("font-family","Consolas")
		.attr("font-size","20px")
		.attr("fill","black")
		.attr("text-anchor","middle")
		.attr("x",function(){return 100+(rectWidth+padding)*front +rectWidth/2;})
		.attr("y",function(){return 300-rectHeight*0.5;})
	

		queue.append("text")
		.text("▼")
		.attr("font-family","Consolas")
		.attr("font-size","20px")
		.attr("fill","black")
		.attr("text-anchor","middle")
		.attr("x",function(){return 100+(rectWidth+padding)*rear +rectWidth/2;})
		.attr("y",function(){return 300-rectHeight*0.2;})
		
		queue.append("text")
		.text("rear")
		.attr("font-family","Consolas")
		.attr("font-size","20px")
		.attr("fill","black")
		.attr("text-anchor","middle")
		.attr("x",function(){return 100+(rectWidth+padding)*rear +rectWidth/2;})
		.attr("y",function(){return 300-rectHeight*0.5;})
	}

	
	var mouseOver = function(d,i){
		

		d3.select("#rectIdx"+i)
		.attr("fill","#FA812F")
		.attr("width",rectWidth*1.1)
		.attr("height",rectHeight*1.1)
		.attr("transform","translate("+(-rectHeight*0.05)+","+(-rectWidth*0.05)+")");

		
		queue.append("text")
		.text("↑")
		.attr("font-family","Consolas")
		.attr("font-size","20px")
		.attr("fill","black")
		.attr("text-anchor","middle")
		.attr("id","arrow")
		.attr("x",function(){return 100+(rectWidth+padding)*(front+i) +rectWidth/2;})
		.attr("y",function(){return 300+rectHeight*1.3;})
		
		queue.append("text")
		.text(function(){return "queue["+(front+i)+"] = "+ queueData[i];})
		.attr("font-family","Consolas")
		.attr("font-size","20px")
		.attr("fill","black")
		.attr("text-anchor","middle")
		.attr("id","arrInfo")
		.attr("x",function(){return 100+(rectWidth+padding)*(front+i) +rectWidth/2;})
		.attr("y",function(){return 300+rectHeight*1.6;})
	}

	var mouseOut = function(d,i){
		d3.select(this)
		.attr("fill","#FAAF08")
		.attr("width",rectWidth)
		.attr("height",rectHeight)
		.attr("transform","translate(0,0)");

		d3.select("#arrInfo").remove();
		d3.select("#arrow").remove();
		
	}

	


	function zoomed() {

	 	container.attr("transform", d3.event.transform);
	}

	return {
		Push : Push,
		Pop : Pop,
		drawQueue : drawQueue
	};
}

var queueEnqueue = function (_data){
	a.Push(_data.elements[0].value,function(){});
}

var queueDequeue = function(){
	a.Pop(function(){});
}

var a = new queue();
a.drawQueue();
