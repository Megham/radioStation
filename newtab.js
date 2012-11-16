$(function(){
	$(".search_text").keypress(function(e){
		if (e.which == 13) {
			chrome.tabs.getCurrent(function(tab){
				chrome.tabs.update(tab.id,{url: 'http://search.yahoo.com/search?p='+$(".search_text").val()});
			});
		};
	});
	$(".search_text").focus();
createBookmarkBar();
});

 function d(id) {
			return document.getElementById(id);
	   }

function createBookmarkBar() {

			var closedTabsBar = d("bookmarksBar");
			closedTabsBar.innerHTML = "";
			var bg = document.createElement("div");
			bg.setAttribute("class", "bar-bg bookmarksBar");
			var container = document.createElement("div");
			container.setAttribute("class", "bar-container");

			closedTabsBar.appendChild(bg);
			closedTabsBar.appendChild(container);

			var bookmarkIcon = document.createElement("div");
			bookmarkIcon.setAttribute("class", "bookmarkIcon");
			container.appendChild(bookmarkIcon);
			
			bookmarkIcon.addEventListener("click"  , openBookmarks, false);


			chrome.bookmarks.getTree(function (list) {
				var bookmarkBarID = list[0].children[0].id;
				chrome.bookmarks.getChildren(bookmarkBarID, function (nodes) {
					var a = nodes[1]
					for (var i=0;i<nodes.length;i++) {
							var allow = true;
							if (nodes[i].url) {
								if (nodes[i].url.indexOf("chrome://")!=-1) {
									allow = false;
								}
							}
							
							if (allow) {
							
								if ((nodes[i].title) && (nodes[i].title!=null)){
									var title = nodes[i].title;
								} else {
									var title = nodes[i].url;
								}

								var bookmarkLink = document.createElement("div");
								bookmarkLink.setAttribute("class", "bookmarkLink");

								var bookmarkLink_bg = document.createElement("div");
								bookmarkLink_bg.setAttribute("class", "bookmarkLink-bg");
								var bookmarkLink_container = document.createElement("div");
								bookmarkLink_container.setAttribute("class", "bookmarkLink-container");

								bookmarkLink.appendChild(bookmarkLink_container);
								bookmarkLink.appendChild(bookmarkLink_bg);

								var l = document.createElement("a");
								if (nodes[i].url) {
									var img = "<img src='http://www.google.com/s2/favicons?domain_url=" + nodes[i].url +"' width='16' height='16'></img>"
									l.setAttribute("href", nodes[i].url);
									l.setAttribute("title", nodes[i].title);
								} else {
									var img = "<img src='images/folder.png' width='16' height='16'></img>"
									l.style.cursor = "pointer"
									l.id = nodes[i].id;
									l.addEventListener("mousedown",createBookmarkMenu, false);
								}
								
								l.innerHTML = img + "<font>" +nodes[i].title+ "</font>"

								bookmarkLink_container.appendChild(l);

								container.appendChild(bookmarkLink);
							}

					}
				})
			})
	
	   }

function openBookmarks() {
			if (bookmarksOpen) {
				closeBookmarks();
				return;
			} 
			d("dials").style.opacity = "0";
			d("search").style.opacity = "0";
			
			//d("header").style.opacity = "0";
			d('options-button').style.display = 'none';
			d('minimize-button').style.display = 'none';
			d("closedTabsBar").style.opacity = "0";
			d("search").style.display = "none";

			d("bookmarksTree").innerHTML = "";

			d("dials").style.display = "none";
			//d("header").style.display = "none";
			d("closedTabsBar").style.display = "none";
			d("bookmarksTree").style.display = "block";
			bookmarksOpen = !bookmarksOpen;
			var callback = function() {}

			var a = document.createElement("a");
			a.setAttribute("href", "#");
			a.setAttribute("onclick", "return false");
			a.innerHTML = "Back to Speed Dial";
			a.style.cssFloat = "left"
			a.style.marginBottom = "10px"
			d("bookmarksTree").style.marginLeft = "20px"

			a.addEventListener("click", openBookmarks, false);
			d("bookmarksTree").appendChild(a);

			var tree = new Tree(d("bookmarksTree"), null, callback, {treeNodeText : "", treeNodeFolderText : "tree-node-folder-text"}, true);
			tree.createBookmarkTree();
		}

		function createBookmarkMenu(e) {
			var l = e.currentTarget;
			var id = l.id;
			var counter = 0;
			l.setAttribute("id", id);

			d("context-text").innerHTML = "";
			var show = function() {
				$('#' + id).menu({ 
						content: d("context-text").innerHTML, 
						showSpeed: 0,
						backLink: false,
						callback : bookmarkMenuCallback
					})
				
				setTimeout(function() {
				
						
				}, 10);
			}
			var getChildren = function(id, li) {
				counter++;
				chrome.bookmarks.getChildren(id, function (nodes) {
					var ul = document.createElement("ul");
					li.appendChild(ul);
					createLI(ul, nodes);
					counter--;
					if (counter==0) {
						show();
					}
				});
			}

			var createLI = function(ul, nodes) {
				for (var i=0;i<nodes.length;i++) {
					var allow = true;
					if (nodes[i].url) {
						if (nodes[i].url.indexOf("chrome://")!=-1) {
							allow = false;
						}
					}
					if (allow) {
						if ((nodes[i].title) && (nodes[i].title!=null)){
							var title = nodes[i].title;
						} else {
							var title = nodes[i].url;
						}
						var li = document.createElement("li");
						li.innerHTML = "<a href='"+nodes[i].url+"'><img src='http://www.google.com/s2/favicons?domain_url=" + nodes[i].url +"' width='16' height='16'></img><div>"+ nodes[i].title +"</div></a>";
						ul.appendChild(li);
						if (nodes[i].url==null) {
							getChildren(nodes[i].id, li);
						}
					}
				}	
					if (counter==0) {
						show();
					}				
			}
			chrome.bookmarks.getChildren(id, function (nodes) {
					
					var ul = document.createElement("ul");
					d("context-text").appendChild(ul);
					createLI(ul, nodes);
					
					
			})
	   }