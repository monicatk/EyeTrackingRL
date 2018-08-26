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
	
    /* default */
    $(function() {
        $('span.averageNumber').rates();
    });
    
    /*rating*/
    $('#stars').on('starrr:change', function(e, value){
    	console.log("star changed");
        $('#count').html(value);
        var current_rating = value;
        var videoId = $("#videoContext").attr("name");
        console.log("videoId ", videoId)
        var currentUrl = window.location.href;

      $.ajax({

        url: "/player/ajax/rating/",
        data: {
            'rating': current_rating,
            'videoId': videoId
        },
        dataType: 'json',
          //parameter data below will contain json with the following key:value pairs, comen from backend:
          //userRate, total, average, total_5, total_4, total_3, total_2, total_1
          //total_x are percentage already. Currently these values are hardcoded on backend, not come from db.
          //You could change the view now to update the ratings popup with these obtained values
        success: function (data) {
            console.log(data);
        }
      });
      });
      
      $('#stars-existing').on('starrr:change', function(e, value){
        $('#count-existing').html(value);
      });
	  
	//bxslider
	$('.bxslider').bxSlider({
		mode: 'vertical',
		nextSelector: '#btn-down-list',
		prevSelector: '#btn-up-list',
		minSlides: 3,
		pager: false,
		nextText: '<a href="#" class="hoverClickableSelf btn btn-default btn-lg" id="item_down_btn" style="width: 100%;"><span data-slide="prev" class="glyphicon glyphicon-chevron-down"></span></a>',
		prevText: '<a href="#" id="item_up_btn" class="hoverClickableSelf btn btn-default btn-lg" style="width: 100%;"><span data-slide="next" class="btn-vertical-slider glyphicon glyphicon-chevron-up"></span></a>'
	});
	
	$.getJSON('https://www.googleapis.com/youtube/v3/videos?id='+ getVideoID +'&key=AIzaSyDpnL6pkF_k3bKktCFwxbPkzy7A8gh6rcY&part=snippet&callback=?',function(data){
		if (typeof(data.items[0]) != "undefined") {
			$('#video-description-box').html( data.items[0].snippet.description);
		}
	});
});
var player,
    time_update_interval = 0;

function onYouTubeIframeAPIReady() {

	var videoID = getVideoID;
    player = new YT.Player('videoContext', {
        //width: 713,
       // height: 367,
        videoId: videoID,	
        playerVars: {
            color: 'white',
            //playlist: 'IfVhzIV7F1U,Ph77yOQFihc',  // @todo make this list dynamic 
			controls: 0,
			modestbranding: 0,
			autohide: 1,
			showinfo: 0					
        },
        events: {
			'onReady': initialize,
						'onStateChange': onPlayerStateChange
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
    
	$("#rated").removeClass('fa-star').addClass('fa-star-o');
	$("#rated").css("color", "rgb(157,157,157)");
	$("#selectedEmotion").css("color", "rgb(157,157,157)");
}

function onPlayerStateChange(newState){
	// for more info: https://developers.google.com/youtube/iframe_api_reference#Events
    if(newState.data === 0){
        //alert('the video is end, do something here.');
		record_player_state(getVideoID, 'end');
    }
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
    $('.progress-footer').css("width",(player.getCurrentTime() / player.getDuration()) * 100 + "%");
}


// Progress bar

$('#progress-footer').on('mouseup touchend', function (e) {

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
		
		$(".progress").show();
				
		// start the recording of fixation points		
		record_player_state(getVideoID, 'play');
		
		// show the fixation points if it is on in the setting	
		if(visualToggle == true){
			visualization_initial();	
		}
		
		if(userGazeToggle == true){
			user_gaze_initial();	
		}
		
	});


	$('#pause').on('click', function (e) {
		e.preventDefault();
		player.pauseVideo();
		
		$('#pause').hide();
		$('#play').show();
		record_player_state(getVideoID, 'pause');
	});


	// Sound volume


	$('#mute-toggle').on('click', function(e) {
		e.preventDefault();
		var mute_toggle = $(this);
		
		if(player.isMuted()){
			mute_toggle.html('<div class="volume" title="Set volume"><span class="volumeBar"></span></div>' + 
								'<a href="#" id="vol-down" style="float:left;"><span class="hoverClickable glyphicon glyphicon-minus" ></a>' +
								'<a href="#" id="mute-btn" style="float:left;"><span class="hoverClickable glyphicon glyphicon-volume-up" ></a>' + 
								'<a href="#" id="vol-up" style="float:left;"><span class="hoverClickable glyphicon glyphicon-plus" ></a>');
			mute_toggle.css("fontSize", "3.5em");
		}
		else{
			mute_toggle.html('<div class="volume" title="Set volume"><span class="volumeBar"></span></div>' + 
								'<a href="#" id="vol-down" style="float:left;"><span class="hoverClickable glyphicon glyphicon-minus" ></a>' +
								'<a href="#" id="mute-btn" style="float:left;"><span class="hoverClickable glyphicon glyphicon-volume-off" ></a>' + 
								'<a href="#" id="vol-up" style="float:left;"><span class="hoverClickable glyphicon glyphicon-plus" ></a>');
			mute_toggle.css("fontSize", "3.5em");
		}
		$('.volume').show();
	});
	
	$( document ).on( 'click', '#mute-btn', function(e){
		e.preventDefault();
		var mute_toggle = $('#mute-toggle');
		if(player.isMuted()){
			player.unMute();
			mute_toggle.html('<span class="hoverClickable glyphicon glyphicon-volume-off fa-5x" style="padding-left:75px;padding-right:75px;"></span>');
			mute_toggle.css("fontSize", "1em");
		} else {
			player.mute();
			mute_toggle.html('<span class="hoverClickable glyphicon glyphicon-volume-up fa-5x" style="padding-left:75px;padding-right:75px;"></span>');
			mute_toggle.css("fontSize", "1em");
		}
					
		$('.volume').hide();		
	});
	
	var volume = 100;
	$( document ).on( 'click', '#vol-up', function(e){
		if(volume < 100 ){
			volume = volume + 15;
			player.setVolume(volume);
			$('.volumeBar').css('width', volume + '%');
		} else {
			player.setVolume( 100 );
			$('.volumeBar').css('width', '100%');
		}
	});
	$( document ).on( 'click', '#vol-down', function(e){
		if(volume > 0 ){
			volume = volume - 15;
			player.setVolume( volume );
			$('.volumeBar').css('width', volume + '%');
		} else {
			player.setVolume( 0 );
			$('.volumeBar').css('width', '0%');
		}

	});
	
	//VOLUME BAR
	//volume bar event
	var volumeDrag = false;
	$( document ).on( 'click', '.volume', function (e) {
		volumeDrag = true;
		$('.sound').removeClass('muted');
		updateVolume(e.pageX);
	});
	$(document).on('mouseup', '.volume', function (e) {
		if (volumeDrag) {
			volumeDrag = false;
			updateVolume(e.pageX);
		}
	});
	$(document).on('mousemove', '.volume', function (e) {
		if (volumeDrag) {
			volumeDrag = false;
			updateVolume(e.pageX);
		}
	});
	var updateVolume = function (x, vol) {
		var volume = $('.volume');
		var percentage;
		//if only volume have specificed
		//then direct update volume
		if (vol) {
			percentage = vol * 100;
		} else {
			var position = x - volume.offset().left;
			percentage = 100 * position / volume.width();
		}

		if (percentage > 100) {
			percentage = 100;
		}
		if (percentage < 0) {
			percentage = 0;
		}

		//update volume bar and video volume
		$('.volumeBar').css('width', percentage + '%');
		player.setVolume( percentage );	

	};
	
	
	// fullscreen
	
		$("#pop-up").on('click', function (e) {
			$("#footer").show();
			$("#pop-down").show();
			$("#pop-up").hide();
		});

		$("#pop-down").on('click', function (e) {
			$("#footer").hide();
			$("#pop-up").show();
			$("#pop-down").hide();
		});
		
		function fullscreenEnter(){
		if (document.documentElement.requestFullScreen) {  
			  document.documentElement.requestFullScreen();  
			} else if (document.documentElement.mozRequestFullScreen) {  
			  document.documentElement.mozRequestFullScreen();  
			} else if (document.documentElement.webkitRequestFullScreen) {  
			  document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
			}  

			$('#fullscreen').html('<span class="hoverClickable glyphicon glyphicon-resize-small fa-5x" style="padding-left:75px;padding-right:75px;color:#9d9d9d;border-left:1px solid rgb(68,68,68);width:20%;border-left:1px solid rgb(68,68,68);width:20%;padding-top:10px; padding-bottom:10px">');
			
			$('#header').hide();
			$('#videoList').hide();
			$('#title').hide();
			$('.container').hide();
			//$("#pop-up").show();
			
			var w = screen.width;
			var h = screen.height;

			
			$('.row').css("padding","0");
			//$('#footer').css("height","50px");
			$('#content').css("top","0");
			$('#content').css("bottom","0");
			$('#content').width = w;
			$('#content').height = h;
			
			$('.frame').css("background-color", "black");

			$('#player-container').css("width", w);
			$('#player-container').css("height", h);
			$('#player-container').css("vertical-align", "middle");
			$('#player-container').css("padding", "0");
			$('#player-container').css("overflow", "hidden");
		}
		
		function fullscreenExit(){
			if (document.cancelFullScreen) {  
			  document.cancelFullScreen();  
			} else if (document.mozCancelFullScreen) {  
			  document.mozCancelFullScreen();  
			} else if (document.webkitCancelFullScreen) {  
			  document.webkitCancelFullScreen();  
			}  
			
			$('#fullscreen').html('<span class="hoverClickable glyphicon glyphicon-fullscreen fa-5x" style="padding-left:75px;padding-right:75px;">');
			
			$('#player-container').css("padding-right","1%");
			$('#player-container').css("padding-top","1%");
			$('#player-container').css("padding-bottom","1%");


			$('.frame').css("background-color", "rgb(68,68,68)");

			$('#content').css("top","100px");
			$('#content').css("bottom","50px");
			//$('#footer').css("height","120px");
			$('#player-container').css("width", "55%");
			$('#player-container').css("height", "55%");
			$('#player-container').css("vertical-align", "middle");

			
			$('#header').show();
			$('#footer').show();
			$('#title').show();
			$('#videoList').show();
			$('.container').show();

		
			$(".glyphis").show();
			$(".progress").show();
			
			$("#pop-down").hide();
			$("#pop-up").hide();
		  
		}
		
		$('#fullscreen').on('click', function () {
			
		$("#pop-down").show();	

		if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
		   (!document.mozFullScreen && !document.webkitIsFullScreen)) {
			fullscreenEnter();
		  } else {  
			fullscreenExit();
		  }
	});
	
	$(document).keydown(function(e) {
		// ESCAPE key pressed
		if (e.keyCode == 27) {
			fullscreenExit();
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
		
		$('.progress-footer').css("width", "0px");

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


//read url segments
var getVideoID = (function(url) {
	
	var segments = url.split( '/' );
	var videoID = segments[5];
    console.log(segments);
	return videoID;
})($(location).attr('href'));

/*new rating*/
//Starrr plugin (https://github.com/dobtco/starrr)
var __slice = [].slice;

(function($, window) {
    var Starrr;

    Starrr = (function() {
        Starrr.prototype.defaults = {
            rating: void 0,
            numStars: 5,
            change: function(e, value) {}
        };

        function Starrr($el, options) {
            var i, _, _ref,
                _this = this;

            this.options = $.extend({}, this.defaults, options);
            this.$el = $el;
            _ref = this.defaults;
            for (i in _ref) {
                _ = _ref[i];
                if (this.$el.data(i) != null) {
                    this.options[i] = this.$el.data(i);
                }
            }
            this.createStars();
            this.syncRating();
            this.$el.on('mouseover.starrr', 'i', function(e) {
                return _this.syncRating(_this.$el.find('i').index(e.currentTarget) + 1);
            });
            this.$el.on('mouseout.starrr', function() {
                return _this.syncRating();
            });
            this.$el.on('click.starrr', 'i', function(e) {
                return _this.setRating(_this.$el.find('i').index(e.currentTarget) + 1);
            });
            this.$el.on('starrr:change', this.options.change);
        }

        Starrr.prototype.createStars = function() {
            var _i, _ref, _results;

            _results = [];
            for (_i = 1, _ref = this.options.numStars; 1 <= _ref ? _i <= _ref : _i >= _ref; 1 <= _ref ? _i++ : _i--) {
                _results.push(this.$el.append("<i class='fa fa-star-o fa-3x'></i>"));
            }
            return _results;
        };
        Starrr.prototype.setRating = function(rating) {
            if (this.options.rating === rating) {
                rating = void 0;
            }
            this.options.rating = rating;
            this.syncRating();
            return this.$el.trigger('starrr:change', rating);
        };

        Starrr.prototype.syncRating = function(rating) {
            var i, _i, _j, _ref;

            rating || (rating = this.options.rating);
            if (rating) {
                for (i = _i = 0, _ref = rating - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
                    this.$el.find('i').eq(i).removeClass('fa-star-o').addClass('fa-star');
                    this.$el.find('i').eq(i).css("color", "rgb(255,157,0)");

                }
            }
            if (rating && rating < 5) {
                for (i = _j = rating; rating <= 4 ? _j <= 4 : _j >= 4; i = rating <= 4 ? ++_j : --_j) {
                    this.$el.find('i').eq(i).removeClass('fa-star').addClass('fa-star-o');
                    this.$el.find('i').eq(i).css("color", "rgb(157,157,157)");
                }
            }
            if (!rating) {
                return this.$el.find('i').removeClass('fa-star').addClass('fa-star-o');
                this.$el.find('i').eq(i).css("color", "rgb(157,157,157)");
            }
        };

        return Starrr;

    })();
    return $.fn.extend({
        starrr: function() {
            var args, option;

            option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
            return this.each(function() {
                var data;

                data = $(this).data('star-rating');
                if (!data) {
                	  $(this).data('star-rating', (data = new Starrr($(this), option)));
                }
                if (typeof option === 'string') {
                    return data[option].apply(data, args);
                }
            });
        }
    });
})(window.jQuery, window);


$(function() {
    return $(".starrr").starrr();
});

/*$("#stars").click(function() {
	  $("#rated").removeClass('fa-star-o').addClass('fa-star');
	  $("#rated").css("color", "rgb(68,68,68)");
	});

$("#vDissatisfied").click(function() {
	  $("#selectedEmotion").css("color", "rgb(68,68,68)");
	});
$("#dissatisfied").click(function() {
	  $("#selectedEmotion").css("color", "rgb(68,68,68)");
	});
$("#neutral").click(function() {
	  $("#selectedEmotion").css("color", "rgb(68,68,68)");
	});
$("#satisfied").click(function() {
	  $("#selectedEmotion").css("color", "rgb(68,68,68)");
	});
$("#vSatisfied").click(function() {
	  $("#selectedEmotion").css("color", "rgb(68,68,68)");
	});
 */ 
/*Default value for rating*/
$.fn.rates = function() {
    return $(this).each(function() {
        // Get the value
        var ratingValue = parseFloat($(this).html()), rounded = (ratingValue | 0);
        for (var j = 0; j < 5 ; j++) {
        	  $(".averageStars").append('<i class="fa '+ ((j < rounded) ? "fa-star" : ((((ratingValue - j) > 0) && ((ratingValue - j) < 1)) ? "fa-star-half-o" : "fa-star-o")) +'" aria-hidden="true" + style="color:rgb(157,157,157)"></i>');
        	}
    });
}

$(window).unload(function () {
	record_player_state(getVideoID, 'stop');
});

function load_fixations(videoId){
	 $.ajax({
        url: "/player/ajax/retrieve_fixations/",
        data: {
            'videoId': videoId
        },
        dataType: 'json',
        success: function (fixations) {
        	//fixations parameter will contain json with the following keys:UserId,VideoId,PosX,PosY,StartTime,StopTime
            console.log(fixations);
        }
      });
}

