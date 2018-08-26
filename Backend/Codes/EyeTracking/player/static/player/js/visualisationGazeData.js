// Visualisation of fixation points belong to last 5 user	
var canvas = document.getElementById('gazeCanvas'),
context = canvas.getContext('2d');
var canvas2 = document.getElementById('gazeCanvas2'),
context2 = canvas2.getContext('2d');
var canvas3 = document.getElementById('gazeCanvas3'),
context3 = canvas3.getContext('2d');
var canvas4 = document.getElementById('gazeCanvas4'),
context4 = canvas4.getContext('2d');
var canvas5 = document.getElementById('gazeCanvas5'),
context5 = canvas5.getContext('2d');
var canvas6 = document.getElementById('gazeCanvas6'),
context6 = canvas6.getContext('2d');
//fit window size 
var dimension = [document.documentElement.clientWidth, document.documentElement.clientHeight];
var c = document.getElementById("gazeCanvas");
c.width = dimension[0];
c.height = dimension[1];
var g = document.getElementById("videoContext");
g.width = dimension[0];
g.height = dimension[1];
var c2 = document.getElementById("gazeCanvas2");
c2.width = dimension[0];
c2.height = dimension[1];
var c3 = document.getElementById("gazeCanvas3");
c3.width = dimension[0];
c3.height = dimension[1];
var c4 = document.getElementById("gazeCanvas4");
c4.width = dimension[0];
c4.height = dimension[1];
var c5 = document.getElementById("gazeCanvas5");
c5.width = dimension[0];
c5.height = dimension[1];
var c6 = document.getElementById("gazeCanvas6");
c6.width = dimension[0];
c6.height = dimension[1];
//amount of points in the same time period
var countPoints = 0;
//array of coordinates : [position, duration, start, endtime]
var coord = new Array();
//array of all durations
var dur = new Array();
//medium duration time
var middleDur; 	

// get the gaze data
var gazeData = get_gaze_data();
//console.log(gazeData);

// point colors
var colors = ["#f4201d","gray", "#1526c1", "#e1ef40", "#06591a"];

// convert data from json to array with coordinates 

// get current user gaze points
var currentUserGazePoints = get_current_user_gaze_data();
if (currentUserGazePoints){
	array = getCoordinatesFromData(get_current_user_gaze_data());
} else {
	//just for testing purpose, these points are static and does not belong to this video and user
	array = getCoordinatesFromData(gazeData[2]);
}

array1 = getCoordinatesFromData(gazeData[0]);

array2 = getCoordinatesFromData(gazeData[3]);

array3 = getCoordinatesFromData(gazeData[2]);

array4 = getCoordinatesFromData(gazeData[0]);

array5 = getCoordinatesFromData(gazeData[1]);


//round to secound place 
function round2(x){
	return Math.round(x / 0.01) * 0.01;
}
//create coordinate object
function coordinate(x, y, duration, start) {
	this.x = x;
	this.y = y;
	this.duration = duration;
	this.start = start;
}
//get Coordinates and Duration from Data
function getCoordinatesFromData(data){
	var tmp = new Array();
	for (var i = 0; i < data.length; i++) {
		tmp.push(new coordinate(data[i].x, data[i].y,round2(data[i].duration), data[i].start * 1000));
	}return tmp;
}
//paint Circles at fixatuon points
function paintCircles2(coordArray, i , color, context){
	var col = color;
    if (i < coordArray.length-1) {
		setCirclePositionOneColour(coordArray[i].x,coordArray[i].y,coordArray[i].duration *1000, color, context);		
		setTimeout(function() {paintCircles2(coordArray, i+1, col, context);}, coordArray[i+1].start- coordArray[i].start);
	}
}
//clear canvas
function clearCanvas(canvas){
	canvas.clearRect(0,0,dimension[0],dimension[1]);
}
//draw Circle at x, y position in correct Size 
function setCirclePositionOneColour(x,y,duration, color, con){
	x= x/ 1920 * dimension[0];
	y= y/ 1200 * dimension[1];
	var r = 40;
	con.beginPath();
	con.arc(x,y,50,0,2*Math.PI);
	con.fillStyle =  color;
	con.globalAlpha = 0.5;
	con.fill();
	con.globalAlpha = 1.0;
	setTimeout(function() {clearCanvas(con);}, duration);
};

//paint: 
function visualization_initial(){
	setTimeout(function() { paintCircles2(array1, 0, colors[0], context); }, 1);
	setTimeout(function() { paintCircles2(array2, 0, colors[1], context2);}, 1);
	setTimeout(function() { paintCircles2(array3, 0, colors[2], context3);}, 1);
	setTimeout(function() { paintCircles2(array4, 0, colors[3], context4);}, 1);
	setTimeout(function() { paintCircles2(array5, 0, colors[4], context5);}, 1);
}

function user_gaze_initial(){
	setTimeout(function() { paintCircles2(array, 0, colors[0], context); }, 1);
}


var visualToggle = false;
// get the value from browser local storage

if (localStorage.getItem("visualToggle") != null){
	visualToggle = JSON.parse(localStorage.getItem("visualToggle"));
}

// set the button title based on the status
if(visualToggle == true){
	$("#visualisation_btn_text").html("Hide");
} else {
	$("#visualisation_btn_text").html("Show");
}

// toggle visualisation on and off
$('#visualisation_btn').on('click', function () {
	
	if(visualToggle == false){
		$("#visualisation_btn_text").html("Hide");
		$(".gazeCanvas").show();
		visualToggle = true;
		localStorage.setItem("visualToggle", true);
	} else {
		$("#visualisation_btn_text").html("Show");
		$(".gazeCanvas").hide();
		visualToggle = false;
		localStorage.setItem("visualToggle", false);
	}
});


var userGazeToggle = false;
// get the value from browser local storage

if (localStorage.getItem("userGazeToggle") != null){
	userGazeToggle = JSON.parse(localStorage.getItem("userGazeToggle"));
}

// set the button title based on the status
if(userGazeToggle == true){
	$("#gaze_btn_text").html("Hide");
} else {
	$("#gaze_btn_text").html("Show");
}

// toggle user gaze points on and off
$('#user_gaze_btn').on('click', function () {
	
	if(userGazeToggle == false){
		$("#gaze_btn_text").html("Hide");
		$(".gazeCanvas").show();
		userGazeToggle = true;
		localStorage.setItem("userGazeToggle", true);
	} else {
		$("#gaze_btn_text").html("Show");
		$(".gazeCanvas").hide();
		userGazeToggle = false;
		localStorage.setItem("userGazeToggle", false);
	}
});


// get the gaze data last 5 user
function get_gaze_data(){	
	var result = null;
	
	$.ajax({
		async: false,
		url : "/static/player/json/data.json",
		type : 'GET',
		data : {
			'nodata' : 0
		},
		dataType:'json',
		success : function(data) {              
			result = data;
		},
		error : function(request,error)
		{
			console.log("Request: "+JSON.stringify(request));
		}
	});
	//console.log( result);
	return result;
};


// get the gaze data current user
function get_current_user_gaze_data(){
	var result = null;
	var videoId = $("#videoContext").attr("name");
	console.log('videoId: ',videoId);
	$.ajax({
        url: "/player/ajax/retrieve_fixations/",
        data: {
            'videoId': videoId
        },
		dataType:'json',
		success : function(data) {              
			result = data;
			console.log('success branch');
			console.log("JSON: "+JSON.stringify(result));
		},
		error : function(request,error)
		{
			console.log("Request: "+JSON.stringify(request));
		}
	});
	//console.log( result);
	return result;
};




