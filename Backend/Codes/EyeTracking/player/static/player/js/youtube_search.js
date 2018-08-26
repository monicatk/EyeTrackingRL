function tplawesome(e,t){res=e;for(var n=0;n<t.length;n++){res=res.replace(/\{\{(.*?)\}\}/g,function(e,r){return t[n][r]})}return res}

$(function() {
    $("#search-btn").on("click", function(e) {
       e.preventDefault();
       // prepare the request
       var request = gapi.client.youtube.search.list({
            part: "snippet",
            type: "video",
            q: encodeURIComponent($("#search").val()).replace(/%20/g, "+"),
            maxResults: 5,
            order: "viewCount",
            publishedAfter: "2015-01-01T00:00:00Z"
       }); 
       // execute the request
       request.execute(function(response) {
          var results = response.result;
          $("#content").html("");
          $.each(results.items, function(index, item) {
            $.get("tpl/item.html", function(data) {
                $("#content").append(tplawesome(data, [{"title":item.snippet.title, "videoid":item.id.videoId, "description":item.snippet.description, "thumbnail": item.snippet.thumbnails.medium.url}]));
            });
          });
       });
    });
	
	$("#index-search-btn").on("click", function(e) {
		var q = encodeURIComponent($("#index-search-input").val()).replace(/%20/g, "+");
		window.location.replace("search.html?q=" + q);
	});
	
	

    
});

		
function init() {
    gapi.client.setApiKey("AIzaSyDpnL6pkF_k3bKktCFwxbPkzy7A8gh6rcY");
    gapi.client.load("youtube", "v3", function() {
		var keyword = qs["q"];
		if(keyword){
			var request = gapi.client.youtube.search.list({
				part: "snippet",
				type: "video",
				q: keyword,
				maxResults: 5,
				order: "viewCount",
				publishedAfter: "2015-01-01T00:00:00Z"
		   }); 
		   // execute the request
		   request.execute(function(response) {
			  var results = response.result;
			  $("#content").html("");
			  $.each(results.items, function(index, item) {
				$.get("tpl/item.html", function(data) {
					$("#content").append(tplawesome(data, [{"title":item.snippet.title, "videoid":item.id.videoId, "description":item.snippet.description, "thumbnail": item.snippet.thumbnails.medium.url}]));
				});
			  });
		   });
		}
    });
	
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
