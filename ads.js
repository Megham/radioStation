function injectAdd(){
	var header_adhtml = chrome.extension.getURL("./header_ads.html");
	var footer_adhtml = chrome.extension.getURL("./footer_ads.html");
	var body_height = $(document).height();
	var body_width = $(document).width();
	var body_cont = $($("body")[0]);
	body_cont.prepend("<div style='width:"+body_width+"px;'><iframe style='height:90px; width:728px;margin:0px auto; border:1px solid black;z-index: 10000;display:block; position: relative;top: 0px;' src='"+header_adhtml+"'><iframe></div>");
	body_cont.append("<div style='position:absolute;width:"+body_width+"px;top:"+(parseInt(body_height)+parseInt(92))+"px;'><iframe style='height:90px; width:728px; margin: 0px auto; border:1px solid black;z-index: 10000; position: relative; display:block; bottom: 0px;' src='"+footer_adhtml+"'></iframe></div>");
};

function checkBlackListedUrl(Url){
	var blackListedUrls = ["\\.google\\.","www\\.youtube\\.com","doubleclick\\.net","facebook\\.com","\\.pdf$","\\.txt","\\.json","\\.webm","\\.ogg","\\.mp4","\\.mp3","\\.wmv","\\.wma","\\.flv","\\.swf","\\.avi"];
	for( x in blackListedUrls ){
		var patt = new RegExp(blackListedUrls[x]);
		if(patt.test(Url)){
			return true;
		}
	}
	return false;
}

function createStorageObject(today,timings){
	chrome.storage.sync.set({
		date: today,
		adSessions: [
			{ time: timings[0], ad_time: null, human_time: new Date(timings[0]).toTimeString(), ad_shown: false, site: null },
			{ time: timings[1], ad_time: null, human_time: new Date(timings[1]).toTimeString(), ad_shown: false, site: null },
			{ time: timings[2], ad_time: null, human_time: new Date(timings[2]).toTimeString(), ad_shown: false, site: null },
			{ time: timings[3], ad_time: null, human_time: new Date(timings[3]).toTimeString(), ad_shown: false, site: null }
		]
	});
}

$(document).ready(function(){
	var time_now = new Date();
	var today = time_now.toDateString();
	var today_start_time = new Date(today);
	var ad_times = [];
	for (var i = 1; i <= 4; i++) {
		ad_times.push(Math.floor(Math.random()*86400000)+today_start_time.valueOf());
	};
	ad_times.sort();
	chrome.storage.sync.get(function(adObj){
		if(adObj.date){
			if (adObj.date != today){
				chrome.storage.sync.clear();
				createStorageObject(today, ad_times);				
			}
		}
		else
			createStorageObject(today, ad_times);
		adObj.already_shown = function(link){
			for(var i=0;i<4;i++){
				if (this.adSessions[i].ad_shown && (this.adSessions[i].site == link)) {return true;};
			};
			return false;
		};
		for(var i=0;i<4;i++){
			if ((time_now > new Date(adObj.adSessions[i].time)) && (!adObj.adSessions[i].ad_shown) && (!adObj.already_shown(document.location.hostname))) {
				if(!checkBlackListedUrl(document.location)){
					injectAdd();
					adObj.adSessions[i].ad_shown = true;
					adObj.adSessions[i].ad_time = new Date(time_now).toTimeString();
					adObj.adSessions[i].site = document.location.hostname;
					chrome.storage.sync.set(adObj);
					break;
				}
			};
		};
	});
})
