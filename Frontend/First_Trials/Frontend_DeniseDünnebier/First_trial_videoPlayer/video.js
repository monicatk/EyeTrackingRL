/* Made by Gemma Black */
/* Of AnonymousJ Creative as a tutorial - Feel Free to Use As You Like!!!!!! Open Source baby */
/* And check out anonymousjcreative.com */
	(function($) {
		
		var myvideoplayer = $('.myvideoplayer');
		

		$.fn.myVideoPlugin = function() {
			
		
			$(document).ready(function() {
				
				var myvideoplayer = $('.myvideoplayer');
				var myvid = $('.myvideoplayer').get(0);
				myvideoplayer.removeAttr( "controls" );
				
				// play/pause functionality
				
				var playPauseButton = $('.controls-play');
				
				playPauseButton.click(playVideo);
				
				function playVideo() {
					if (myvid.paused) {
						myvid.play();
						$(this).text("Pause");
					}
					else {
						myvid.pause();
						$(this).text("Play");
					}
					return false;
					
				};
				
				// gotoStart functionality
				
				var gotoStartButton = $('.controls-gotoStart');
				
				gotoStartButton.click(gotoStart);
				
				function gotoStart() {
					myvid.currentTime = 0;	
				};
				
				// fast-forward funtionality
				
				var fastforwardButton = $('.controls-fastfoward');
				
				fastforwardButton.mousedown(fastFowards);
				
				function fastFowards() {
					
					var currentTime = myvid.currentTime;
					currentTime = currentTime+4;
					myvid.currentTime = currentTime;
					
				};
				
				// rewind functionality 
				
				var rewindButton = $('.controls-rewind');
				
				rewindButton.click(rewind);				
				
				function rewind() {
					var currentTime = myvid.currentTime;
					currentTime = currentTime-4;
					myvid.currentTime = currentTime;
				}
				
				// Progress Bar Functionality
				
				var progressbar = $('.controls-progress-bar');
				var progress = $('.controls-progress-bar .progressing');
				var progressbarWidth = progressbar.width();
				var progressWidth = progress.width();
				
				
				myvideoplayer.bind("canplay", progressTo);
				
				function progressTo() {
				
				
					setInterval(checkProgress, 1000);
				
					
						function checkProgress(progressWidth) {
							var canprogressTo = myvid.buffered.end(0);
							var totalvidLength = myvid.duration;
							percentProgress = canprogressTo/totalvidLength; // decimal form
							newprogressWidth = progressbar.width()*percentProgress;
							progress.width(newprogressWidth);
						};
					if (progressbarWidth = newprogressWidth) {
						clearInterval(checkProgress)
						}
						
						return true;
							
				};
				
				//setInterval(function() { alert(percentProgress); }, 3000); // testing testing
				
				// timer functionality
				
				var theTimer = $('.controls-timer');
				
				myvid.addEventListener("timeupdate", runTimer, false);
				
				function runTimer() {
					var currentTime = myvid.currentTime;
					var mTime = Math.floor(myvid.currentTime/60);
					var sTime = Math.floor(myvid.currentTime-(mTime*60));
					if (sTime<10) {sTime="0"+sTime;}
					if (mTime<10) {mTime="0"+mTime;}
					theTimer.text(mTime+":"+sTime);
				};
				
				// Total Time Functionality
				
				var totalTimeDiv = $('.controls-totalTime');
						
				myvid.addEventListener("canplay", function() {
					var totalTime = myvid.duration;
					var mTime = Math.floor(totalTime/60);
					var sTime = Math.floor(totalTime-(mTime*60));
					if (sTime<10) {sTime="0"+sTime;}
					if (mTime<10) {mTime="0"+mTime;}
					totalTimeDiv.text("- "+mTime+":"+sTime);
				
				}, false );
				
				
				// slider User Manipulation functionality
				
				var theSlider = $('.controls-slider');
				
				theSlider.slider();
				
				var uiHandle = $('.ui-slider-handle');
				
				theSlider.bind("slide", changeVideoTime);
				
				function changeVideoTime() {
					var barLength = theSlider.width();
					var incrementals = barLength/myvid.duration;
					var barPercentage = uiHandle.position().left;
					barPercentage = barPercentage/barLength;
					myvid.currentTime = barPercentage*myvid.duration;
					
					/* Progress Bar Section */
					
					var canprogressTo = myvid.buffered.end(0);
					var totalvidLength = myvid.duration;
					var percentProgress = canprogressTo/totalvidLength; //decimal
					var progressbarLength = percentProgress*barLength;
					if (uiHandle.position().left > progressbarLength) {
						//alert(progressbarLength);	
						myvid.currentTime = percentProgress*myvid.duration;
					}
					
				};	
				
				
				// slider Automatic Play Through functionality
				
				myvideoplayer.bind("timeupdate", moveSlider);
				
				function moveSlider() {
					var barLength = theSlider.width();
					var incrementals = barLength/myvid.duration;
					var handlePosition = myvid.currentTime*incrementals;
					var newHandlePosition = uiHandle.position();
					uiHandle.css({ left: handlePosition });
					
				};
				
				
				
				// Audio Slider Functionality
				
				var audioSlider = $('.controls-audio-slider');
				myvideoplayer.volume = audioSlider.value;				
				audioSlider.slider();
				audioSlider.slider( "option", "value", 100 );
				
				var auHandle = $('.audio-seek > .ui-slider-horizontal .ui-slider-handle');
									
				audioSlider.bind('slide', sliderVolume);
				
				function sliderVolume() {
					
					var auHandlePos = auHandle.position().left;
					myvid.volume = auHandlePos/100;
						
					if (auHandlePos < 7 ) {
						myvid.volume = 0;	
					}
					if (auHandlePos > 93 ) {
						myvid.volume = 1;	
					}
					
				};
				
				// mute/unmute functionality
				
				var muteUnmuteButton = $('.controls-mute');
				
				muteUnmuteButton.click(muteVideo);
				
				function muteVideo() {
					if (myvid.volume > 0) {
						myvid.volume = 0;
						$(this).text("Unmute");
						auHandle.css({ left: 0 });
					} else {
						myvid.volume = 1;	
						$(this).text("Mute");
						auHandle.position().left = 100;
						auHandle.css({ left: 100 });
					}
					return false;	
				};
				
				
				
			});
			
		};
		
		myvideoplayer.myVideoPlugin();
		
	}) (jQuery);


