$('.carousel[data-type="multi"] .item').each(function(){
  var next = $(this).next();
  if (!next.length) {
    next = $(this).siblings(':first');
  }
  next.children(':first-child').clone().appendTo($(this));

  for (var i=0;i<4;i++) {
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

//set up-btn and down-btn width to same search width
var width = document.getElementById('search').clientWidth; //returns value in px
document.getElementById("search").style.textAlign = "center";
document.getElementById('up').style.width = width + "px";
document.getElementById('down').style.width = width + "px";

//scroll down with down-btn 

	var height = document.getElementById('content').clientHeight;
    /*$(document).on("click", "#down",function(){
		actual_scroll += height;
		$("#content").scrollTop(actual_scroll);
        $("#down").show();
    });

//scroll up with up-btn
     $(document).on("click", "#up",function(){
		 actual_scroll -= height;
         $("#content").scrollTop(actual_scroll);
         $("#up").show();
    });*/


	 $(document).on("click", "#down",function(){ 
	 	 	var first = document.getElementById('pos-1');
			var rect_first = first.getBoundingClientRect();
			
			var elmnt = document.getElementById("content");
			//elmnt.style.paddingTop = '20px';
			elmnt.style.paddingBottom = '20px';
			var y = elmnt.scrollHeight;

			i +=1;
			var s = "pos-" + i;
			var next_element = document.getElementById(s);
			var rect_next_element = next_element.getBoundingClientRect();
			rect_next_element.left = rect_first.left;
			rect_next_element.top = rect_first.top;
						next_element.scrollIntoView();

			//actual_scroll_height += (rect_next_element.top - rect_first.top);

			next_element.style.paddingTop = '20px';
	
			if(i != 5) {
				$("#down").show();
				$("#up").show();
			}
			else {
				$('#content').scrollTop(y);
				$("#down").hide();
				$("#up").show();
			}		
    });
	
	 $(document).on("click", "#up",function(){ 
			var first = document.getElementById('pos-1');
			var rect_first = first.getBoundingClientRect();

			i -=1;
			var s = "pos-" + i;
			var next_element = document.getElementById(s);
			var rect_next_element = next_element.getBoundingClientRect();
			rect_next_element.left = rect_first.left;
			rect_next_element.top = rect_first.top;
			next_element.scrollIntoView();
						
			next_element.style.paddingTop = '0px';

			if(i != 1) {
				$("#up").show();
				$("#down").show();

			}
			else {
				$('#content').scrollTop(0);
				$("#up").hide();
				$("#down").show();
			}
    });
	
});
