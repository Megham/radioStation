$(function(){
	$(".search_text").keypress(function(e){
		if (e.which == 13) {
			chrome.tabs.getCurrent(function(tab){
				chrome.tabs.update(tab.id,{url: 'http://search.yahoo.com/search?p='+$(".search_text").val()});
			});
		};
	});
	$(".search_text").focus();
});