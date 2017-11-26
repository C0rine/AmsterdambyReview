/*
 * Calaca - Search UI for Elasticsearch
 * https://github.com/romansanchez/Calaca
 * http://romansanchez.me
 * @rooomansanchez
 * 
 * v1.2.0
 * MIT License
 */

/* Calaca Controller
 *
 * On change in search box, search() will be called, and results are bind to scope as results[]
 *
 */
 Calaca.controller('calacaCtrl', ['calacaService', '$scope', '$location', '$sce', function(results, $scope, $location){
        //Init empty array
        $scope.results = [];

        //Init offset
        $scope.offset = 0;

        var paginationTriggered;
        var maxResultsSize = CALACA_CONFIGS.size;
        var searchTimeout;

        $scope.delayedSearch = function(mode) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function() {
                $scope.search(mode)
            }, CALACA_CONFIGS.search_delay);
        }

        //On search, reinitialize array, then perform search and load results
        $scope.search = function(m){
            $scope.results = [];
            $scope.offset = m == 0 ? 0 : $scope.offset;//Clear offset if new query
            $scope.loading = m == 0 ? false : true;//Reset loading flag if new query

            if(m == -1 && paginationTriggered) {
                if ($scope.offset - maxResultsSize >= 0 ) $scope.offset -= maxResultsSize;
            }     
            if(m == 1 && paginationTriggered) {
                $scope.offset += maxResultsSize;
            }
            $scope.paginationLowerBound = $scope.offset + 1;
            $scope.paginationUpperBound = ($scope.offset == 0) ? maxResultsSize : $scope.offset + maxResultsSize;
            $scope.loadResults(m);
        };

        //Load search results into array
        $scope.loadResults = function(m) {
            results.search($scope.query, $scope.placetype, m, $scope.offset).then(function(a) {

                //Load results
                var i = 0;
                for(;i < a.hits.length; i++){
                    $scope.results.push(a.hits[i]);
                }

                //Set time took
                $scope.timeTook = a.timeTook;

                //Set total number of hits that matched query
                $scope.hits = a.hitsCount;

                //Pluralization
                $scope.resultsLabel = ($scope.hits != 1) ? "results" : "result";

                //Check if pagination is triggered
                paginationTriggered = $scope.hits > maxResultsSize ? true : false;

                //Set loading flag if pagination has been triggered
                if(paginationTriggered) {
                    $scope.loading = true;
                }
            });
        };

        $scope.paginationEnabled = function() {
            window.scrollTo(0,0);
            $('#map').css('top', "0px");

            return paginationTriggered ? true : false;
        };





        $scope.createLocations = function()
        {
            // var locations = [{lat: 52.36711099999999, lng: 4.862746999999999}, {lat: 52.370295, lng: 4.859303}, {lat: 52.3649184, lng: 4.882298}, {lat: 52.3782917, lng: 4.848731700000001}, {lat: 52.37348110000001, lng: 4.888006799999999}, {lat: 52.3530658, lng: 4.890853799999999}]
            var locations = [];
            var names = [];
            var ratings = [];
            var sentiments = [];
            var tels = [];

            for (var i = 0; i < $scope.results.length; i++) {
                geo = $scope.results[i].geometry
                new_lat = parseFloat(geo.split(", ")[0]);
                new_lng = parseFloat(geo.split(", ")[1]);

                locations.push({lat: new_lat,lng: new_lng});

                names.push($scope.results[i].name)
                ratings.push($scope.results[i].rating)
                sentiments.push($scope.results[i].sentiment.substr(0,4))
                tels.push($scope.results[i].international_phone_number)
            };
            // console.log(locations);
            window.createMarkers(locations, names, ratings, sentiments, tels)

            centralstation = {"lat": 52.3791, "lng": 4.9003};
            olympicstadium = {"lat": 52.3434, "lng": 4.8541};
            sciencepark = {"lat": 52.3552, "lng": 4.9527};

            window.createFixedMarker("Me", sciencepark, "Science Park")
            // return locations;
        }



}]
);




