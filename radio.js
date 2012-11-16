var globalPlaying, globalList, globalPlayingStatus;

var app = angular.module('RadioApp', [], function($compileProvider) {
	$compileProvider.directive('compile', function($compile) {
		return function(scope, element, attrs) {
			scope.$watch(
				function(scope) {
					return scope.$eval(attrs.compile);
				},
				function(value) {
					element.html(value);
					$compile(element.contents())(scope);
				}
			);
		};
	})
});

app.controller('RadioListCtl',function RadioListCtl($scope,initializeRadio){
	$scope.list = [];
	$scope.stationPlaying;
	$scope.search_text;
	$scope.playingStatus = globalPlayingStatus = 'not playing';
	$scope.displayList = function(){
		var html = "";
		var patt = new RegExp($scope.search_text,'i');
		angular.forEach($scope.list,function(country,country_index){
			angular.forEach(country.stations,function(station,station_index){
				if($scope.search_text == "" || patt.test(station.name) || patt.test(country.country_name) || patt.test(station.tags.join(',')) )
					html += "<div class='station_box' ng-click='selectStation("+country_index+","+station_index+")'><div class='station_name'>"+station.name+"</div><div class='country'>"+country.country_name+"</div><div class='tags'>[<span class='tag'>"+station.tags.join('</span> , <span class="tag">')+"</span>]</div><div class='description'>"+station.description+"</div></div>"
			});
		});
		return html;
	};

	$scope.play = function(){
		$scope.playingStatus = 'play';
		chrome.runtime.getBackgroundPage(function(bgPage){
			audio = bgPage.document.getElementById('radio_player');
			audio.src = $scope.list[$scope.stationPlaying[0]].stations[$scope.stationPlaying[1]].link;
			audio.play();
		});
	};
	$scope.pause = function(){
		$scope.playingStatus = 'pause';
		chrome.runtime.getBackgroundPage(function(bgPage){
			audio = bgPage.document.getElementById('radio_player');
			audio.pause();
			audio.src="";
		});
	};
	$scope.selectStation = function(country,station){
		$scope.stationPlaying = [country,station];
		$scope.playingStatus = 'play';
		chrome.runtime.getBackgroundPage(function(bgPage){
			audio = bgPage.document.getElementById('radio_player');
			audio.src = $scope.list[country].stations[station].link;
			audio.play();
		});
	};
	$scope.initialize = function(){
		initializeRadio.getList();
		initializeRadio.getPlaying();
		$('.search_box').focus();
	};
});

app.factory('initializeRadio',function($rootScope){
	return {
		getList: function(){
			$.ajax({
				url: 'temp_radio_stations.json',
				dataType: 'json',
				async: false,
				success: function(data){
					var pro = [];
					$rootScope.$$childTail.list = data;
					$.each(data,function(k,v){
						pro.push(v.country_name);
						$.each(v.stations,function(k1,v1){
							pro.push(v1.station_name);
							$.each(v1.tags,function(k2,v2){
								pro.push(v2);
							});
						});
					});
					pro = $.grep(pro, function(v, k){
					    return $.inArray(v ,pro) === k;
					});
					var index = pro.indexOf(undefined);
					if (index !== -1) 
					    pro.splice(index, 1);
					$('.search_box').autocomplete({
						source: pro,
						select: function(event,ui){
							$rootScope.$$childTail.search_text = $('.search_box').val();
							$rootScope.$$childTail.$digest();
						}
					});
				}
			});
		},
		getPlaying: function(){
			chrome.runtime.getBackgroundPage(function(bgPage){
				audio = bgPage.document.getElementById('radio_player');
				if(audio.src){
					if ($rootScope.$$childTail.list) {
						angular.forEach($rootScope.$$childTail.list,function(country,country_index){
							angular.forEach(country.stations,function(station,station_index){
								if (station.link == audio.src){
									$rootScope.$$childTail.stationPlaying = [country_index,station_index];
								};
							});
						});
					}
					if(!audio.paused)
						$rootScope.$$childTail.playingStatus = 'play';
					else
						$rootScope.$$childTail.playingStatus = 'pause';
				}
				else
					$rootScope.$$childTail.playingStatus = 'not playing';
				$rootScope.$$childTail.$digest();
			});
		}
	}
});
