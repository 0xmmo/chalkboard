$(document).ready(chalkboard);

function chalkboard(){

	$('#chalkboard').remove();
	$('.chalk').remove();
	$('body').prepend('<div class="panel"><a class="link" target="_blank">Save</a></div>');
	$('body').prepend('<div class="panel2"><a onClick="window.location.reload()">Clear Board</a></div>');
	var dt = new Date();
	$('body').prepend('<div class="date">' + dt.toLocaleDateString() + '</div>');
	$('body').prepend('<div class="subject"><form> <label for="subject">Subject Name:</label><input type="text" id="subject" name="subject"></form> </div>');
	$('body').prepend('<div class="topic"><form> <label for="topic">Topic Name:  </label><input type="text" id="topic" name="topic"></form> </div>');
	$('body').prepend('<div class="draggable"><div id="mydiv"><div id="mydivheader">Notes (Drag to Move)</div><button type="button" class="collapsible">Click to expand / collapse</button><div class="content"><textarea id = "textbox" > </textarea></div></div></div>');
	$('body').prepend('<img src="img/bg.png" id="pattern" width=50 height=50>');
	$('body').prepend('<canvas id="chalkboard"></canvas>');
	$('body').prepend('<div class="chalk"></div>');
	
	var canvas = document.getElementById("chalkboard");
	$('#chalkboard').css('width',$(window).width());
	$('#chalkboard').css('height',$(window).height());
	canvas.width = $(window).width();
	canvas.height = $(window).height();
	
	var ctx = canvas.getContext("2d");
	
	var width = canvas.width;
	var height = canvas.height;
	var mouseX = 0;
	var mouseY = 0;
	var mouseD = false;
	var eraser = false;
	var xLast = 0;
	var yLast = 0;
	var brushDiameter = 7;
	var eraserWidth = 50;
	var eraserHeight = 100;
	
	$('#chalkboard').css('cursor','none');
	document.onselectstart = function(){ return false; };
	ctx.fillStyle = 'rgba(255,255,255,0.5)';	
	ctx.strokeStyle = 'rgba(255,255,255,0.5)';	
    ctx.lineWidth = brushDiameter;
	ctx.lineCap = 'round';

	var patImg = document.getElementById('pattern');

	document.addEventListener('touchmove', function(evt) {
        var touch = evt.touches[0];
        mouseX = touch.pageX;
        mouseY = touch.pageY;
        if (mouseY < height && mouseX < width) {
            evt.preventDefault();
            $('.chalk').css('left', mouseX + 'px');
            $('.chalk').css('top', mouseY + 'px');
            if (mouseD) {
                draw(mouseX, mouseY);
            }
        }
    }, false);
    document.addEventListener('touchstart', function(evt) {
        //evt.preventDefault();
        var touch = evt.touches[0];
        mouseD = true;
        mouseX = touch.pageX;
        mouseY = touch.pageY;
        xLast = mouseX;
        yLast = mouseY;
        draw(mouseX + 1, mouseY + 1);
    }, false);
    document.addEventListener('touchend', function(evt) {
        mouseD = false;
    }, false);
    $('#chalkboard').css('cursor','none');
	ctx.fillStyle = 'rgba(255,255,255,0.5)';	
	ctx.strokeStyle = 'rgba(255,255,255,0.5)';	
    ctx.lineWidth = brushDiameter;
	ctx.lineCap = 'round';
	
	$(document).mousemove(function(evt){
		mouseX = evt.pageX;
		mouseY = evt.pageY;
		if(mouseY<height && mouseX<width){
			$('.chalk').css('left',(mouseX-0.5*brushDiameter)+'px');
			$('.chalk').css('top',(mouseY-0.5*brushDiameter)+'px');
			if(mouseD){
				if(eraser){
					erase(mouseX,mouseY);
				}else{
					draw(mouseX,mouseY);
					}
				}
		}else{
			$('.chalk').css('top',height-10);
			}
		});
	$(document).mousedown(function(evt){ 
		mouseD = true;
		xLast = mouseX;
		yLast = mouseY;
		if(evt.button == 2){
			erase(mouseX,mouseY);
			eraser = true;
			$('.chalk').addClass('eraser');
		}else{
			if(!$('.panel').is(':hover')){
				draw(mouseX+1,mouseY+1);
			}		
		}
	});

	$(document).mouseup(function(evt){ 
		mouseD = false;
		if(evt.button == 2){
			eraser = false;
			$('.chalk').removeClass('eraser');
		}
	});

	$(document).keyup(function(evt){
		if(evt.keyCode == 32){
			ctx.clearRect(0,0,width,height);
			layPattern();
		}
	});

	$(document).keyup(function(evt){
		if(evt.keyCode == 83){
			changeLink();
		}
	});

	document.oncontextmenu = function() {return false;};
         
	function draw(x,y){
		ctx.strokeStyle = 'rgba(255,255,255,'+(0.4+Math.random()*0.2)+')';
		ctx.beginPath();
  		ctx.moveTo(xLast, yLast);		
  		ctx.lineTo(x, y);
  		ctx.stroke();
          
  		// Chalk Effect
		var length = Math.round(Math.sqrt(Math.pow(x-xLast,2)+Math.pow(y-yLast,2))/(5/brushDiameter));
		var xUnit = (x-xLast)/length;
		var yUnit = (y-yLast)/length;
		for(var i=0; i<length; i++ ){
			var xCurrent = xLast+(i*xUnit);	
			var yCurrent = yLast+(i*yUnit);
			var xRandom = xCurrent+(Math.random()-0.5)*brushDiameter*1.2;			
			var yRandom = yCurrent+(Math.random()-0.5)*brushDiameter*1.2;
    		ctx.clearRect( xRandom, yRandom, Math.random()*2+2, Math.random()+1);
			}

		xLast = x;
		yLast = y;
	}

	function erase(x,y){
		ctx.clearRect (x-0.5*eraserWidth,y-0.5*eraserHeight,eraserWidth,eraserHeight);
	}

	$('.link').click(function(evt){

		$('.download').remove();

		

		var imgCanvas = document.createElement('canvas');
		var imgCtx = imgCanvas.getContext("2d");
		var pattern = imgCtx.createPattern(patImg,'repeat');
		imgCanvas.width = width;
		imgCanvas.height = height;

		imgCtx.fillStyle = pattern;
		imgCtx.rect(0,0,width,height);
		imgCtx.fill();


		var layimage = new Image;
		layimage.src = canvas.toDataURL("image/png");

		setTimeout(function(){

			imgCtx.drawImage(layimage,0,0);
			imgCanvas.crossOrigin = 'Anonymous';
			imgCanvas.allowTaint = false;
			var compimage = imgCanvas.toDataURL("image/png");//.replace('image/png','image/octet-stream');

			$('.panel').append('<a href="'+compimage+'" download="chalkboard.png" class="download">Download</a>');
			$('.download').click(function(){
				IEsave(compimage);
			});
		
		}, 500);


	});

	function IEsave(ctximage){
		setTimeout(function(){
			var win = window.open();
			$(win.document.body).html('<img src="'+ctximage+'" crossorigin name="chalkboard.png">');
		},500);
	}

	$(window).resize(function(){
		// chalkboard();
	});

	dragElement(document.getElementById("mydiv"));

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}

} 
