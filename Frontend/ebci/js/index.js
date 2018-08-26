/*$('.carousel .item').each(function(){
  var next = $(this).next();
  if (!next.length) {
    next = $(this).siblings(':first');
  }
  next.children(':first-child').clone().appendTo($(this));
 // next.children(':first-child').clone().appendTo($(this));

  if (next.next().length>0) {
    next.next().children(':first-child').clone().appendTo($(this));
  }
  else {
    $(this).siblings(':first').children(':first-child').clone().appendTo($(this));
  }
});*/

$('.carousel .item').each(function(){
  var next = $(this).next();

  if (!next.length) {
    next = $(this).siblings(':first');
  }
  next.children(':first-child').clone().appendTo($(this));

  for (var i=0;i<2;i++) {
    next=next.next();
    if (!next.length) {
        next = $(this).siblings(':first');
    }

    next.children(':first-child').clone().appendTo($(this));
	
 }
});


	var actual_scroll = 0;
	var i = 1;
	var last_i = 0;
	var actual_scroll_height = 0;
	var a = [];



$(document).ready(function(){ 


	// Find all the YouTube video embedded on a page
	var videos = document.getElementsByClassName("youtube"); 

	for (var i=0; i<videos.length; i++) {
	  var youtube = videos[i];
	  // Based on the YouTube ID, we can easily find the thumbnail image
	  var img = document.createElement("img");
	  img.setAttribute("src", "http://i.ytimg.com/vi/" + youtube.id + "/mqdefault.jpg");
	  img.setAttribute("class", "thumb");
	  img.setAttribute('width', '100%');
	  img.setAttribute('height', '100%'); 
	  youtube.appendChild(img);
	  
		var iframe = document.createElement("iframe");

	  // When the user clicks on a thumbnail the video player html should be open with the same video.
	  // Attach an onclick event to the YouTube Thumbnail
	  /*youtube.onclick = function() {
		// Create an iFrame with autoplay set to true
		iframe.setAttribute("src", "https://www.youtube.com/embed/" + this.id + "?autoplay=1&autohide=1"); 
		iframe.setAttribute("frameborder",0);
		iframe.setAttribute("autoplay", 1);
		iframe.setAttribute("enablejsapi", 1);
		iframe.setAttribute("autohide", 1);
		iframe.setAttribute("showinfo", 1);
		iframe.setAttribute("controls", 0);
		iframe.setAttribute("modestbranding", 1);	
		// Replace the YouTube thumbnail with YouTube HTML5 Player
		//this.parentNode.replaceChild(iframe, this);
		$(this).append(iframe);
	  };*/ 
	 
	}
	
	//set up-btn and down-btn width to same search width
	var width = document.getElementById('search').clientWidth; //returns value in px
	document.getElementById("search").style.textAlign = "center";
	document.getElementById('up').style.width = width + "px";
	document.getElementById('down').style.width = width + "px";

	//click to scroll down with button for eyetracking
		var height = document.getElementById('content').clientHeight;
		var scrollHeight = document.getElementById('content').scrollHeight;
		$(document).on("click", "#down",function(){
			actual_scroll += height;
			$("#content").scrollTop(actual_scroll);
			if((actual_scroll + height) >= scrollHeight){
				$("#down").hide();
				$("#up").show();
			} else {
				$("#up").show();
				$("#down").show();
			}

		});

	//click to scroll down up with button for eyetracking
		 $(document).on("click", "#up",function(){
			 actual_scroll -= height;
			 $("#content").scrollTop(actual_scroll);
			 if((actual_scroll) <= 0){
				$("#up").hide();
				$("#down").show();
			} else {
				$("#up").show();
				$("#down").show();
			}
		});	
});
