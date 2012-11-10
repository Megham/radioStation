chrome.webNavigation.onCommitted.addListener(function(details) {
	if(isBack(details.transitionQualifiers) )
	{
	 	if(isGoogleSearchUrl(details.url)){
	 	var searchString = getSearchString(details.url);
	 	chrome.tabs.executeScript(details.tabId,
                           {code:"document.body.innerHTML='Searching in YAHOO for : "+decodeURIComponent(searchString)+"';"});
	 	chrome.tabs.get(details.tabId, function (tab) {
  		
  				var tabTitle = encodeURIComponent(tab.title);
  				 chrome.tabs.update(tab.id, {url: "http://search.yahoo.com/search?p="+ searchString});	
		});
	 }
	}
});

function isBack(transitionQualifiers)
{
	for( qualifier in transitionQualifiers ){
		if(transitionQualifiers[qualifier] == "forward_back")
			return true;
	}
	return false;
}

function isGoogleSearchUrl(url)
{
	 var googleSearch = /\.google\./;      
	 isSearchUrl = url.indexOf("&q=") != -1 || url.indexOf("&oq=") != -1 || url.indexOf("/search?q=") != -1;
     return googleSearch.test(url) && isSearchUrl;
}

function getSearchString(searchUrl)
{
       var ampersandQIndex = searchUrl.indexOf("&q");
       var ampersandOQIndex = searchUrl.indexOf("&oq");
       var ampersandSearchQIndex = searchUrl.indexOf("/search?q=");
       var qSearch = null;
       var oqSearch = null;
       var searchqSearch = null;
       if(ampersandQIndex != -1)
               qSearch = searchUrl.substring(ampersandQIndex).split("&q=")[1].split("&")[0];
       if(ampersandOQIndex != -1)
               oqSearch = searchUrl.substring(ampersandOQIndex).split("&oq=")[1].split("&")[0];
       if(ampersandSearchQIndex != -1)
               searchqSearch = searchUrl.substring(ampersandSearchQIndex).split("/search?q=")[1].split("&")[0];
       return qSearch ? qSearch : (oqSearch ? oqSearch : searchqSearch);
}