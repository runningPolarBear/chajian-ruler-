;
(function(window){
	//标尺的构造函数
	var Ruler=function(id,paraObj){
		var that=this;
		this.clientWidth=document.body.clientWidth;
		this.maxNum=paraObj.maxNum||300.0;
		this.minNum=paraObj.minNum||30.0;
		this.cellNum=paraObj.cellNum||10;
		this.minNum=parseInt(this.minNum/this.cellNum)*this.cellNum;
		this.record=[];
		if((this.maxNum-this.minNum)%this.cellNum!=0){
			this.maxNum=this.minNum+this.cellNum*parseInt((this.maxNum-this.minNum)/this.cellNum+1);
		}
		this.name=paraObj.name;
		this.unit=paraObj.unit;
		this.initNum=paraObj.initNum;
		this.nowData=this.initNum||this.minNum||30.0;
		this.decimalWei=paraObj.decimalWei;
		//做出标尺的html结构
		this.rulerStructure(id);
		//画出标尺的静态
		this.drawRuler();
		//添加滑动标尺功能
		this.moveRuler();
		// return this;
	}

	//构建html结构
	Ruler.prototype.rulerStructure=function(id){
		//父节点部分
		var parentNode=document.getElementById(id);
		var parentNodeStyle={
			"overflow":"hidden",
			"position":"relative"
		};
		this.addStyle(parentNode,parentNodeStyle);

		//标题部分
		var titleNode=document.createElement("div");
		titleNode.setAttribute("class", "ruler-title");
		titleStyle={
			"width": "100%",
			"height": "50%",
			"position": "relative",
			"overflow": "hidden"
		};
		this.addStyle(titleNode,titleStyle);

		//标题中的参数
		var parameterNode=document.createElement("div");
		parameterNode.setAttribute("class", "ruler-parameter");
		parameterStyle={
			"width": "200px",
			"text-align": "center",
			"box-sizing": "border-box",
			"margin": "0 auto",
			"margin-top": "30px"
		}
		this.addStyle(parameterNode,parameterStyle);
		parameterNode.innerHTML="<div id='rulerTitle' style='float:left; font-weight:bold; font-size:24px; line-height:60px;'>心率</div><div id='ruler-num' style='font: bold 48px/48px 微软雅黑; color:#2081c7; display:inline-block'>30.0</div><div id='ruler-unit' style='float:right; margin-top:20px;'>bpm</div>";
		//声明结果对象
		this.numNode=parameterNode.firstChild.nextSibling;
		//设定标尺的初始数值
		parameterNode.firstChild.innerHTML=this.name||"心率";
		parameterNode.firstChild.nextSibling.innerHTML=this.initNum||this.minNum;
		parameterNode.lastChild.innerHTML=this.unit;
		//打包标题节点
		titleNode.appendChild(parameterNode);
		parentNode.appendChild(titleNode);

		//标尺的包裹部分
		var containNode=document.createElement("div");
		containNode.setAttribute("class", "ruler-contain");
		containStyle={
			"width": "100%",
			"height": "40%",
			"position": "absolute",
			"top": "50%",
			"left": "0",
			"border": "1px solid #333",
			"box-sizing": "border-box",
			"border-radius": "8px",
			"overflow": "hidden"
		}
		this.addStyle(containNode,containStyle);
		containNode.innerHTML="<div class='ruler' id='ruler' style='left: 0; height: 100%; position: absolute; background: #fff; top: 0; left: 0;'><canvas id='rulerCanvas'></canvas></div>";
		//设定标尺的初始位置
		containNode.firstChild.style.left=-(this.initNum-this.minNum)/this.cellNum*100+"px";
		//声明标尺的canvase对象
		containNode.firstChild.firstChild.width=(Math.ceil((this.maxNum-this.minNum)/this.cellNum)*100+this.clientWidth*0.9);
		containNode.firstChild.firstChild.height="80";
		this.Canvas=containNode.firstChild.firstChild.getContext("2d");
		//声明尺子的包裹对象
		this.rulerNode=containNode.firstChild;
		parentNode.appendChild(containNode);

		//标尺的指针部分
		var pinNode=document.createElement("div");
		pinNode.setAttribute("class", "ruler-img");
		pinStyle={
			"margin": "0 auto",	
			"width": "4px",
			"height": "100px",
			"position": "relative",
			"z-index": "999"
		}
		this.addStyle(pinNode,pinStyle);
		pinNode.innerHTML="<canvas id='pinPic' width='4' height='100'></canvas>";
		this.drawPin(pinNode.firstChild);
		parentNode.appendChild(pinNode);

	}

	//添加样式属性
	Ruler.prototype.addStyle=function(obj,style){
		for( var i in style){
		   obj.style[i]=style[i];
		};
	}

	//画指示针
	Ruler.prototype.drawPin=function(obj){
		var pinCanvas = obj.getContext("2d");
		//画三角形
		pinCanvas.beginPath();
		pinCanvas.moveTo(3-0.5,0);
		pinCanvas.lineTo(3-0.5,50);
		pinCanvas.strokeStyle = "#f00";
		pinCanvas.lineWidth=3;
		pinCanvas.stroke();
		pinCanvas.closePath();
	}

	//将标尺画出来
	Ruler.prototype.drawRuler=function(){
		var that=this;
		//画整数的刻度
		(function(){
			for(var i=0; i<=Math.ceil((that.maxNum-that.minNum)/that.cellNum); i++){
				scale(i);
			}
			function scale(i){
				that.Canvas.beginPath();
				that.Canvas.moveTo(that.clientWidth*0.9/2+100*i-0.5,0);
				that.Canvas.lineTo(that.clientWidth*0.9/2+100*i-0.5,40);
				that.Canvas.stroke();
				that.Canvas.closePath();
				// that.Canvas.font="16px 宋体";
				that.Canvas.font="16px Arial";
				that.Canvas.strokeText(that.decimal(that.minNum+that.cellNum*i,that.decimalWei),that.clientWidth*0.9/2+100*i-8,66);
			}
		})();
		
		
		//画小数的刻度
		(function(){
			for(var j=0; j<=Math.ceil((that.maxNum-that.minNum)/that.cellNum)*100/10; j++){
				if(j%10!=0){
					scale(j);
				}
			}
			function scale(j){
				that.Canvas.beginPath();
				that.Canvas.moveTo(that.clientWidth*0.9/2+10*j-0.5,0);
				that.Canvas.lineTo(that.clientWidth*0.9/2+10*j-0.5,20);
				that.Canvas.stroke();
				that.Canvas.closePath();
			}
		})();
	}

	//控制标尺的滑动
	Ruler.prototype.moveRuler=function(){
		var that=this;
		//标尺绑定touchstart事件
		this.rulerNode.addEventListener("touchstart",rulerStart,false);
		function rulerStart(e){
			var e=e||window.event;
			e.preventDefault();
			clearInterval(that.timer);
			clearInterval(that.partTime);
			that.record=[];
			var startX=e.targetTouches[0].clientX;
			var startY=e.targetTouches[0].clientY;
			//标尺绑定touchmove事件
			that.rulerNode.addEventListener("touchmove",rulerMove,false);
			var moveNum=parseInt(that.rulerNode.style.left);
			var n=0;
			function rulerMove(e){
				var e=e||window.event;
				var moveX=e.targetTouches[0].clientX;
				var moveY=e.targetTouches[0].clientY;
				var transX=moveX-startX;
				var transY=moveY-startY;
				isScrolling = Math.abs(transX) < Math.abs(transY) ? 1:0; //isScrolling为1时，表示纵向滑动，0为横向滑动
				if(isScrolling==1){
					e.preventDefault();
				}else{
					var leftNum=-Math.round(moveNum+transX)/(100/that.cellNum)+that.minNum;
					var moveDis=moveNum+transX;
					if(moveDis>=0){
						moveDis=0;
						leftNum=that.minNum;
					}else if(moveDis<=-(Math.ceil((that.maxNum-that.minNum)/that.cellNum)*100)){
						moveDis=-(Math.ceil((that.maxNum-that.minNum)/that.cellNum)*100);
						leftNum=that.maxNum;
					}
					that.nowData=that.decimal(leftNum,that.decimalWei);
					that.numNode.innerHTML=that.nowData;
					that.rulerNode.style.left=moveDis+"px";
					n++;
					var moveTime=new Date().getTime();
					that.record[n]=[];
					that.record[n].push(moveTime);
					that.record[n].push(moveDis);
				}
			}
			//标尺绑定touchend事件
			that.rulerNode.addEventListener("touchend",rulerEnd,false);
			function rulerEnd(e){
				var e=e||window.event;
				that.rulerNode.removeEventListener("touchmove",rulerMove);
				that.rulerNode.removeEventListener("touchend",rulerEnd);
				if(that.record.length>4){
					var speed=(that.record[that.record.length-1][1]-that.record[that.record.length-4][1])/(that.record[that.record.length-1][0]-that.record[that.record.length-4][0])*1000;
					clearInterval(that.timer);
					that.timer=setInterval(function(){
						if(Math.abs(speed)>100){
							speed=speed>0?speed-30:speed+30;
							var speedX=parseInt(that.rulerNode.style.left)+(speed/50);
							if(speedX>=0){
								speedX=0;
							}else if(speedX<=-(Math.ceil((that.maxNum-that.minNum)/that.cellNum)*100)){
								speedX=-(Math.ceil((that.maxNum-that.minNum)/that.cellNum)*100);
							}
							that.rulerNode.style.left=speedX+"px";
							var speedNum=-Math.round(speedX)/(100/that.cellNum)+that.minNum;
							that.nowData=that.decimal(speedNum,that.decimalWei);
							that.numNode.innerHTML=that.nowData;
						}else{
							clearInterval(that.timer);
							var numM=parseFloat(that.rulerNode.style.left);
							var numStep=parseInt(numM/10);
							if(numM-numStep*10>-5){
								that.movePart(numM,numStep*10,10,that.rulerNode,"left");
							}else{
								that.movePart(numM,(numStep-1)*10,10,that.rulerNode,"left");
							}
						}
					},20);
				}else{
					var numM=parseFloat(that.rulerNode.style.left);
					var numStep=parseInt(numM/10);
					if(numM-numStep*10>-5){
						that.movePart(numM,numStep*10,10,that.rulerNode,"left");
					}else{
						that.movePart(numM,(numStep-1)*10,10,that.rulerNode,"left");
					}
				}
			}
		}
	}

	//滑动停止后的局部滑动
	Ruler.prototype.movePart=function(start,end,stepNum,obj,attr,fn){
		var that=this;
		clearInterval(this.partTime);
		if (end!=start){
			var step = (end-start)/stepNum;
			this.partTime = setInterval(function(){
				start += step;
				if(start<=end&&step<0){
					clearInterval(that.partTime);
					start = end;
					if(fn){
						fn();
					}
				}else if(start>=end&&step>0){
					clearInterval(that.partTime);
					start = end;
					if(fn){
						fn();
					}
				}
				obj.style[attr] = start + "px";
				var leftNum=-Math.round(start)/(100/that.cellNum)+that.minNum;
				that.nowData=that.decimal(leftNum,that.decimalWei);
				that.numNode.innerHTML=that.nowData;
			},20)
		}
		
	}

	//对小数位数的控制
	Ruler.prototype.decimal=function(num,decimalNum){
		var xsd=num.toString().split(".");
		if(decimalNum==1){
			if(xsd.length==1){
				num=num.toString()+".0";
				return num;
			}
			if(xsd.length>1){
				if(xsd[1].substring(0,decimalNum)=="0"){
					num=Math.round(num).toString()+".0";
					return num;
				}else{
					num=Math.round(num*10)/10;
					var xsd0=num.toString().split(".");
					if(xsd0.length==1){
						num=num+".0";
					}
					return num;
				}
			}
		}else if(decimalNum==2){
			if(xsd.length==1){
				num=num.toString()+".00";
				return num;
			}
			if(xsd.length>1){
				if(xsd[1].substring(0,decimalNum)=="0"){
					num=Math.round(num).toString()+".00";
					return num;
				}else{
					num=Math.round(num*100)/100;
					var xsd0=num.toString().split(".");
					if(xsd0.length==1){
						num=num+".00";
					}
					return num;
				}
			}
		}else{
			return Math.round(num);
		}	
	};

	if ( typeof module === "object" && module && typeof module.exports === "object" ) {
		module.exports = Ruler;
	}

	window.Ruler=Ruler;
})(window);
