$(function() {

	var img = $('<img>');
	var newImage, contextNew;
	var func = ''; // last used function
	var canvas = $('#can')[0], 
	context = canvas.getContext('2d');
		
	var p1 = 0.99;
	var p2 = 0.99;
	var p3 = 0.99;
	var er = 0; // extra red
	var eg = 0; // extra green
	var eb = 0; // extra blue
	
	var px;
	var iBlurRate = 0;
	
	
	
	img.load(function(){
	
		context.drawImage(this, 0, 0);
		// creating testing context
		newImage= $('#panel')[0];
		contextNew = newImage.getContext('2d');
	
	});

	img.attr('src','assets/img/test.jpg');

	// When the button is pressed, convert
	// all the pixels to grayscale:

	$('#btn').click(function(){
	
		var imageData = context.getImageData(0, 0, canvas.width, canvas.height),
		px = imageData.data, gray = 0; 
        
		// 4 bytes per pixels - RGBA
		for (var i = 0, n = px.length; i < n; i += 4) {
			gray = (px[i] + px[i+1] + px[i+2]) / 3;
	    
			px[i]   = gray;   // red
			px[i+1] = gray;   // green
			px[i+2] = gray;   // blue
		}
        
		// Draw the converted image data back to the canvas.
		contextNew.putImageData(imageData, 0, 0);

	});
    
	$('#noise').click(function(){
		
		func = 'noise'; 
		var imgd = context.getImageData(0, 0, canvas.width, canvas.height);
		var data = imgd.data;

		for (var i = 0, n = data.length; i < n; i += 4) {

			// generating random color coefficients
			var randColor1 = 0.6 + Math.random() * 0.4;
			var randColor2 = 0.6 + Math.random() * 0.4;
			var randColor3 = 0.6 + Math.random() * 0.4;

			// assigning random colors to our data
			data[i] = data[i]*p2*randColor1+er; // green
			data[i+1] = data[i+1]*p2*randColor2+eg; // green
			data[i+2] = data[i+2]*p3*randColor3+eb; // blue
		}

		contextNew.putImageData(imgd, 0, 0);
    
	});
	
	$('#blur').click(function(){
		func = 'blur'; 
		iBlurRate = 1;	
		var imgd = context.getImageData(0, 0, canvas.width, canvas.height);
		var data = imgd.data;

		for (var br = 0; br < iBlurRate; br += 1) { 
			for (var i = 0, n = data.length; i < n; i += 4) {

				var iMW = 4 * canvas.width;
				var iSumOpacity = 0;
				var iSumRed =0;
				var  iSumGreen = 0;
				var iSumBlue = 0;
				var iCnt = 0;

				// data of close pixels (from all 8 surrounding pixels)
				var aCloseData = [
				i - iMW - 4, i - iMW, i - iMW + 4, 
				i - 4, i + 4, // middle pixels
				i + iMW - 4, i + iMW, i + iMW + 4 
				];

				for (e = 0; e < aCloseData.length; e += 1) {
					if (aCloseData[e] >= 0 && aCloseData[e] <= data.length - 3) {
						iSumOpacity += data[aCloseData[e]];
						iSumRed += data[aCloseData[e] + 1];
						iSumGreen += data[aCloseData[e] + 2];
						iSumBlue += data[aCloseData[e] + 3];
						iCnt += 1;
					}
				}

				data[i] = (iSumOpacity / iCnt)*p1+er;
				data[i+1] = (iSumRed / iCnt)*p2+eg;
				data[i+2] = (iSumGreen / iCnt)*p3+eb;
				data[i+3] = (iSumBlue / iCnt);
			}
		}
		contextNew.putImageData(imgd, 0, 0);
	});
	
	$('#thres').click(function(){
		var imgd = context.getImageData(0, 0, canvas.width, canvas.height);
		var d = imgd.data;
		var threshold =128;
		for (var i=0; i<d.length; i+=4) {
			var r = d[i];
			var g = d[i+1];
			var b = d[i+2];
			var v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
			d[i] = d[i+1] = d[i+2] = v
		}
		contextNew.putImageData(imgd, 0, 0);
	});
	
	$('#custom').click(function(){		
		var weights = [ ];
		$('#customMatrix :input').each(function() {
			weights.push(parseInt($(this).val()));
		});

		var opaque = true;
		var side = Math.round(Math.sqrt(weights.length));
		var halfSide = Math.floor(side/2);
		var imgd = context.getImageData(0, 0, canvas.width, canvas.height);
		
		var src = imgd.data;
		var sw = canvas.width;
		var sh = canvas.height;

		var w = sw;
		var h = sh;
		var output = contextNew.createImageData(w, h);
		var dst = output.data;

		var alphaFac = opaque ? 1 : 0;

		for (var y=0; y<h; y++) {
			for (var x=0; x<w; x++) {
				var sy = y;
				var sx = x;
				var dstOff = (y*w+x)*4;
				var r=0, g=0, b=0, a=0;
				for (var cy=0; cy<side; cy++) {
					for (var cx=0; cx<side; cx++) {
						var scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
						var scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
						var srcOff = (scy*sw+scx)*4;
						var wt = weights[cy*side+cx];
						r += src[srcOff] * wt;
						g += src[srcOff+1] * wt;
						b += src[srcOff+2] * wt;
						a += src[srcOff+3] * wt;
					}
				}
				dst[dstOff] = r;
				dst[dstOff+1] = g;
				dst[dstOff+2] = b;
				dst[dstOff+3] = a + alphaFac*(255-a);
			}
		}
		contextNew.putImageData(output, 0, 0);  
	});


	$('#sobel').click(function(){
		var imgd = context.getImageData(0, 0, canvas.width, canvas.height);		
		var px = imgd.data;
		px = gray(px);
		
		var vertical =conventionFloat(px,  [-1,-2,-1,
			0, 0, 0,
			1, 2, 1]);
		var horizontal = conventionFloat(px, [-1,0,1,
			-2,0,2,
			-1,0,1]);
		var id = contextNew.createImageData(vertical.width, vertical.height);
		for (var i=0; i<id.data.length; i+=4) {
			var v = Math.abs(vertical.data[i]);
			id.data[i] = v;
			var h = Math.abs(horizontal.data[i]);
			id.data[i+1] = h
			id.data[i+2] = (v+h)/4;
			id.data[i+3] = 255;
		}
	
		contextNew.putImageData(id, 0, 0);  
	});
	if (!window.Float32Array)
		Float32Array = Array;

	function conventionFloat(pixels,weights,opaque) {  
		var side = Math.round(Math.sqrt(weights.length));
		var halfSide = Math.floor(side/2);

		var src = pixels;
		var sw =  canvas.width;
		var sh = canvas.height;

		var w = sw;
		var h = sh;
		var output = {
			width: w, 
			height: h, 
			data: new Float32Array(w*h*4)
		};
		var dst = output.data;

		var alphaFac = opaque ? 1 : 0;

		for (var y=0; y<h; y++) {
			for (var x=0; x<w; x++) {
				var sy = y;
				var sx = x;
				var dstOff = (y*w+x)*4;
				var r=0, g=0, b=0, a=0;
				for (var cy=0; cy<side; cy++) {
					for (var cx=0; cx<side; cx++) {
						var scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
						var scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
						var srcOff = (scy*sw+scx)*4;
						var wt = weights[cy*side+cx];
						r += src[srcOff] * wt;
						g += src[srcOff+1] * wt;
						b += src[srcOff+2] * wt;
						a += src[srcOff+3] * wt;
					}
				}
				dst[dstOff] = r;
				dst[dstOff+1] = g;
				dst[dstOff+2] = b;
				dst[dstOff+3] = a + alphaFac*(255-a);
			}
		}
		return output;
	}

	function gray(px) {
		var d = px;
		for (var i=0; i<d.length; i+=4) {
			var r = d[i];
			var g = d[i+1];
			var b = d[i+2];
			// CIE luminance for the RGB
			var v = 0.2126*r + 0.7152*g + 0.0722*b;
			d[i] = d[i+1] = d[i+2] = v
		}
		return d;
		
	}

$('#test').click(function(){
	
	var level = 100;
	level = Math.max(0,Math.min(500,parseFloat(level)||100)) / 100; // [0-500%]
		var imgd = context.getImageData(0, 0, canvas.width, canvas.height);		
		var srcData = imgd.data;

		var w = canvas.width;
		var h = canvas.height;
		var w4 = w * 4;
	//	var newImg = contextNew.createImageData(w, h);
		
	//	var newData = newImg.data;

		var filter = [-1, -1, -1,
						-1, 8, -1,
				-1, -1, -1]; // Laplacian filter
		
		/* var filter = [0, -1, 0,
						-1, 4, -1,
						0, -1, 0]; */

		for (var y=0; y<h; y++) {
			var offsetY = w4 * y;

			for (var x=0; x<w; x++) {
				var index = offsetY + x * 4;
				var cols = getColorArray(srcData, w, h, index, x, y);
				var newColor = 0;
				for (var i=0; i<9; i++) {
					newColor += (filter[i] * cols[i]);
				}

				newColor *= level;
				if (newColor < 0) newColor = -newColor; // change to positive num
				if (newColor > 255) newColor = 255;
				newColor = newColor | 0;

				srcData[index] = srcData[index+1] = srcData[index+2] = newColor;
				srcData[index+3] = 255;
			}
		}
		contextNew.putImageData(imgd, 0, 0);  
});

function getColorArray(imgData, w, h, index, x, y, offset) {
		if (offset == null) offset = 0;
		var offsetAlpha = 3 - offset;
		var hasPrevX = x > 0;
		var hasNextX = x < w-1;
		var w4 = w * 4;

		var indexOffsetAlpha = index + offsetAlpha;
		var indexOffset      = index + offset;

		var centerCol = imgData[indexOffset]
		var colorArray = [centerCol,centerCol,centerCol,centerCol,
	  	      centerCol,centerCol,centerCol,centerCol,centerCol];

		if (y > 0) {
			var indexOffsetAlphaBase = indexOffsetAlpha - w4;
			var indexOffsetBase      = indexOffset      - w4;
			if (hasPrevX && imgData[indexOffsetAlphaBase-4] > 0) colorArray[0] = imgData[indexOffsetBase-4];
			if (imgData[indexOffsetAlphaBase]) colorArray[1] = imgData[indexOffsetBase];
			if (hasNextX && imgData[indexOffsetAlphaBase+4] > 0) colorArray[2] = imgData[indexOffsetBase+4];
		}

		if (hasPrevX && imgData[indexOffsetAlpha-4] > 0) colorArray[3] = imgData[indexOffset-4];
		if (hasNextX && imgData[indexOffsetAlpha+4] > 0) colorArray[5] = imgData[indexOffset+4];

		if (y < h-1) {
			var indexOffsetAlphaBase = indexOffsetAlpha + w4;
			var indexOffsetBase      = indexOffset      + w4;
			if (hasPrevX && imgData[indexOffsetAlphaBase-4] > 0) colorArray[6] = imgData[indexOffsetBase-4];
			if (imgData[indexOffsetAlphaBase] > 0) colorArray[7] = imgData[indexOffsetBase];
			if (hasNextX && imgData[indexOffsetAlphaBase+4] > 0) colorArray[8] = imgData[indexOffsetBase+4];
		}

		return colorArray;
	}

$('#solarize').click(function(){
		//amount -  prag na inversiq, cvetovete pod tozi prag sa obarnati
		var imgd = context.getImageData(0, 0, canvas.width, canvas.height);		
		var srcData = imgd.data;
		var amount = $("#amount").val();
		amount = Math.max(0,Math.min(255,parseFloat(amount)||127));

		var w = canvas.width;
		var h = canvas.height;

		for (var i=0, len=w*h*4; i<len; i+=4) {
			var r = srcData[i];
			var g = srcData[i+1];
			var b = srcData[i+2];

			if (r > amount) r = 255 - r;
			if (g > amount) g = 255 - g;
			if (b > amount) b = 255 - b;

			srcData[i]   = r;
			srcData[i+1] = g;
			srcData[i+2] = b;
		}
		contextNew.putImageData(imgd, 0, 0);

});

$('#posterize').click(function(){
	//pehodat ot edin cvqt v drug. lavel - dalbo4ina na bitovete/s po golqma dalbo4ina pove4e nuansi na cvetovete/
	var level =$("#level").val();
	var imgd = context.getImageData(0, 0, canvas.width, canvas.height);		
		var srcData = imgd.data;
level = Math.max(2,Math.min(256,parseFloat(level)||2));

		var w = canvas.width;
		var h = canvas.height;

		var numAreas  = 256 / level;
		var numValues = 256 / (level-1);

		for (var i=0, len=w*h*4; i<len; i+=4) {
			var r = (numValues * ((srcData[i]   / numAreas)>>0)) | 0;
			var g = (numValues * ((srcData[i+1] / numAreas)>>0)) | 0;
			var b = (numValues * ((srcData[i+2] / numAreas)>>0)) | 0;

			if (r > 255) r = 255;
			if (g > 255) g = 255;
			if (b > 255) b = 255;

			srcData[i]   = r;
			srcData[i+1] = g;
			srcData[i+2] = b;
		}
	contextNew.putImageData(imgd, 0, 0);
});

});
