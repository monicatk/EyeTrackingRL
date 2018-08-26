$(document).ready(function () {
    $("div.bhoechie-tab-menu>div.list-group>a").click(function (e) {
        e.preventDefault();
        $(this).siblings('a.active').removeClass("active");
        $(this).addClass("active");
        var index = $(this).index();
        $("div.bhoechie-tab>div.bhoechie-tab-content").removeClass("active");
        $("div.bhoechie-tab>div.bhoechie-tab-content").eq(index).addClass("active");
    });
    
    $("#pop-up").hide();
    $("#pop-down").hide();
	
	// Find all the YouTube video embedded on a page
	var videos = document.getElementsByClassName("youtube"); 
	for (var i=0; i<videos.length; i++) {
	  var youtube = videos[i];
	  // Based on the YouTube ID, we can easily find the thumbnail image
	  var img = document.createElement("img");
	  img.setAttribute("src", "http://i.ytimg.com/vi/" + youtube.id + "/mqdefault.jpg");
	  img.setAttribute("class", "thumb");
	  img.setAttribute('width', '40%');
	  img.setAttribute('height', '40%'); 
	  youtube.appendChild(img);
	}
	
    var width = document.getElementById('search').clientWidth; //returns value in px
    document.getElementById("search").style.textAlign = "center";
    document.getElementById('up').style.width = "100%";
    document.getElementById('down').style.width = "100%";
    var height = document.getElementById('content').clientHeight;

    $(document).on("click", "#down", function () {
        actual_scroll += height;
        $("#content").scrollTop(actual_scroll);
        $("#down").show();
    });

    //scroll up with up-btn
    $(document).on("click", "#up", function () {
        actual_scroll -= height;
        $("#content").scrollTop(actual_scroll);
        $("#up").show();
    });

});
var player,
    time_update_interval = 0;

function onYouTubeIframeAPIReady() {
	var videoID = qs["videoid"];
	if(! videoID){				
			// @todo : this part is just for keeping the demo page working. should be removed later
			videoID = 'LCfCWnM5zeY';
	}
    player = new YT.Player('video-placeholder', {
        width: 713,
        height: 367,
        videoId: videoID,	
        playerVars: {
            color: 'white',
            playlist: 'IfVhzIV7F1U,Ph77yOQFihc',  // @todo make this list daynamic 
			controls: 0,
			modestbranding: 1,
			autohide: 1,
			showinfo: 0					
        },
        events: {
            onReady: initialize
        }
    });
}

function initialize(){

    // Update the controls on load
    updateTimerDisplay();
    updateProgressBar();

    // Clear any old interval.
    clearInterval(time_update_interval);

    // Start interval to update elapsed time display and
    // the elapsed part of the progress bar every second.
    time_update_interval = setInterval(function () {
        updateTimerDisplay();
        updateProgressBar();
    }, 1000);


    $('#volume-input').val(Math.round(player.getVolume()));
}


// This function is called by initialize()
function updateTimerDisplay(){
    // Update current time text display.
    $('#current-time').text(formatTime( player.getCurrentTime() ));
    $('#duration').text(formatTime( player.getDuration() ));
}


// This function is called by initialize()
function updateProgressBar(){
    // Update the value of our progress bar accordingly.
    $('.progress-bar').css("width",(player.getCurrentTime() / player.getDuration()) * 100 + "%");
}


// Progress bar

$('#progress-bar').on('mouseup touchend', function (e) {

    // Calculate the new time for the video.
    // new time in seconds = total duration in seconds * ( value of range input / 100 )
    var newTime = player.getDuration() * (e.target.value / 100);
	alert(e.target.value);
    // Skip video to new time.
    player.seekTo(newTime);

});


$('#progress-forward').on('click', function () {
	var newTime = player.getCurrentTime() + 10 ; 
	player.seekTo(newTime);
});

$('#progress-backward').on('click', function () {
	var newTime = player.getCurrentTime() - 10 ; 
    player.seekTo(newTime);
});


$(function() {
	// Playback

	$('#play').on('click', function (e) {
		e.preventDefault();
		player.playVideo();
		
		$('#play').hide();
		$('#pause').show();
	});


	$('#pause').on('click', function (e) {
		e.preventDefault();
		player.pauseVideo();
		
		$('#pause').hide();
		$('#play').show();
	});


	// Sound volume


	$('#mute-toggle').on('click', function(e) {
		e.preventDefault();
		var mute_toggle = $(this);
		
		if(player.isMuted()){
			mute_toggle.html('<a href="#" id="vol-down" style="float:left;"><span class="glyphicon glyphicon-minus" ></a>' +
								'<a href="#" id="mute-btn" style="float:left;"><span class="glyphicon glyphicon-volume-up" ></a>' + 
								'<a href="#" id="vol-up" style="float:left;"><span class="glyphicon glyphicon-plus" ></a>');
			mute_toggle.css("fontSize", "3.5em");
		}
		else{
			mute_toggle.html('<a href="#" id="vol-down" style="float:left;"><span class="glyphicon glyphicon-minus" ></a>' +
								'<a href="#" id="mute-btn" style="float:left;"><span class="glyphicon glyphicon-volume-off" ></a>' + 
								'<a href="#" id="vol-up" style="float:left;"><span class="glyphicon glyphicon-plus" ></a>');
			mute_toggle.css("fontSize", "3.5em");
		}
	});
	
	$( document ).on( 'click', '#mute-btn', function(e){
		e.preventDefault();
		var mute_toggle = $('#mute-toggle');
		if(player.isMuted()){
			player.unMute();
			mute_toggle.html('<span class="glyphicon glyphicon-volume-off fa-5x" style="padding-left:75px;padding-right:75px;"></span>');
			mute_toggle.css("fontSize", "1em");
		} else {
			player.mute();
			mute_toggle.html('<span class="glyphicon glyphicon-volume-up fa-5x" style="padding-left:75px;padding-right:75px;"></span>');
			mute_toggle.css("fontSize", "1em");
		}
		

		
	});
	
	var volume = 100;
	$( document ).on( 'click', '#vol-up', function(e){
		if(volume < 100){
			volume = volume + 15;
			player.setVolume(volume);
		}
	});
	$( document ).on( 'click', '#vol-down', function(e){
		if(volume > 0){
			volume = volume - 15;
			player.setVolume( volume );
		}

	});
	
	
	// fullscreen
	
		$('#fullscreen').on('click', function () {
			
		 $(".progress").hide();
		    $(".glyphis").hide();

		    $("#pop-up").click(function () {
		        $(".progress").show();
		        $(".glyphis").show();
		        $("#pop-up").hide();
		        $("#pop-down").show();
		    });

		    $("#pop-down").click(function () {
		        $(".progress").hide();
		        $(".glyphis").hide();
		        $("#pop-down").hide();
		        $("#pop-up").show();

		    });
	
			
		var fullscreenbtn = $(this);

		if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
		   (!document.mozFullScreen && !document.webkitIsFullScreen)) {
			if (document.documentElement.requestFullScreen) {  
			  document.documentElement.requestFullScreen();  
			} else if (document.documentElement.mozRequestFullScreen) {  
			  document.documentElement.mozRequestFullScreen();  
			} else if (document.documentElement.webkitRequestFullScreen) {  
			  document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
			}  
			
			fullscreenbtn.empty();
			fullscreenbtn.append('<span class="glyphicon glyphicon-resize-small fa-5x" style="padding-left:75px;padding-right:75px;color:#9d9d9d;">');
			
			$('#header').hide();
			//$('.navbar').hide();
			$('.bhoechie-tab-menu').hide();
			$('#player-container').css("width", "100%");
			$("#pop-up").show();
			
			w = $(window).width();
			h = $(window).height();
			$("iframe").width(w);
			$("iframe").height(h-15);
			
		  } else {  
			if (document.cancelFullScreen) {  
			  document.cancelFullScreen();  
			} else if (document.mozCancelFullScreen) {  
			  document.mozCancelFullScreen();  
			} else if (document.webkitCancelFullScreen) {  
			  document.webkitCancelFullScreen();  
			}  
			
			fullscreenbtn.empty();
			fullscreenbtn.append('<span class="glyphicon glyphicon-fullscreen fa-5x" style="padding-left:75px;padding-right:75px;">');
			
			$('#header').show();
			$('.bhoechie-tab-menu').show();
			$('#player-container').css("width", "66.66666667%");
			
			$("iframe").width(713);
			$("iframe").height(367);
			$(".glyphis").show();
			$(".progress").show();
			$("#pop-down").hide();
		  }  
	});


	// Other options


	$('#speed').on('change', function () {
		player.setPlaybackRate($(this).val());
	});

	$('#quality').on('change', function () {
		player.setPlaybackQuality($(this).val());
	});


	// Playlist

	$('#next').on('click', function () {
		player.nextVideo()
	});

	$('#prev').on('click', function () {
		player.previousVideo()
	});


	// Load video

	$('.related-video').on('click', function () {

		var url = $(this).attr('data-video-id');

		player.cueVideoById(url);
		
		$('.progress-bar').css("width", "0px");

	});
	


});

// Helper Functions

function formatTime(time){
    time = Math.round(time);

    var minutes = Math.floor(time / 60),
        seconds = time - minutes * 60;

    seconds = seconds < 10 ? '0' + seconds : seconds;

    return minutes + ":" + seconds;
}

// Read query string
var qs = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));

