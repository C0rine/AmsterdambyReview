/*
 * Calaca - Search UI for Elasticsearch
 * https://github.com/romansanchez/Calaca
 * http://romansanchez.me
 * @rooomansanchez
 * 
 * v1.2.0
 * MIT License
 */

/* Service to Elasticsearch */
Calaca.factory('calacaService', ['$q', 'esFactory', '$location', function($q, elasticsearch, $location){

    //Set default url if not configured
    CALACA_CONFIGS.url = (CALACA_CONFIGS.url.length > 0)  ? CALACA_CONFIGS.url : $location.protocol() + '://' +$location.host() + ":9200";

    var client = elasticsearch({ host: CALACA_CONFIGS.url });

    var search = function(query, placetype, mode, offset){

        var deferred = $q.defer();

        if (query.length == 0) {
            deferred.resolve({ timeTook: 0, hitsCount: 0, hits: [] });
            return deferred.promise;
        }

        // console.log(placetype);

        //CS  "lat": 52.3791, "lon": 4.9003 ,        SP "lat": 52.3552, "lon": 4.9527    , OlympSt.  "lat": 52.3434, "lon": 4.8541 
        var centralstation = {"lat": 52.3791, "lon": 4.9003};
        var olympicstadium = {"lat": 52.3434, "lon": 4.8541};
        var sciencepark = {"lat": 52.3552, "lon": 4.9527};

        if (placetype=="all") {
            console.log("searching for all");
            client.search({
                "index": CALACA_CONFIGS.index_name,
                "type": CALACA_CONFIGS.type,
                "body": {
                    "size": CALACA_CONFIGS.size,
                    "from": offset,
                    // "query": {
                    //     "query_string": {
                    //         "query": query
                    //     }
                    // }
                   "query" : {
                      "function_score" : {
                          "query": {
                              "multi_match" : {
                                  "query":  query,
                                  "fields": [ "name", "reviews", "website", "types" ],
                                  "operator" : "and",
                                  "fuzziness": 1
                              }
                          },
                          // "field_value_factor" : {
                          //     "field": "sentiment"
                          // }
                          "functions": [
                            {
                              "gauss": {
                                "geometry": { 
                                  "origin": sciencepark,
                                  "offset": "0.5km",
                                  "scale":  "0.5km"
                                }
                              }
                            },
                            {
                              "gauss": {
                                "sentiment": { 
                                  "origin": "0.85", 
                                  "offset": "0.15",
                                  "scale":  "0.15"
                                }
                              },
                              "weight": 1
                            }
                          ]
                        }
                      },
                    // "sort" : [
                    //     { "sentiment" : {"order" : "desc"}}
                    // ],
                    "highlight" : {
                        "pre_tags" : ["<span class='highlight-result'>"],
                        "post_tags" : ["</span>"],
                        "fields" : {
                            "reviews" : {"fragment_size" : 250, "number_of_fragments" : 3}
                        }
                    }
                    }
            }).then(function(result) {

                    var i = 0, hitsIn, hitsOut = [], source;
                    hitsIn = (result.hits || {}).hits || [];
                    for(;i < hitsIn.length; i++){
                        source = hitsIn[i]._source;
                        source._id = hitsIn[i]._id;
                        source._index = hitsIn[i]._index;
                        source._type = hitsIn[i]._type;
                        source._score = hitsIn[i]._score;
                        
                        if (typeof(hitsIn[i].highlight) !== 'undefined') {
                            source._highlight = hitsIn[i].highlight.reviews[0];
                            // console.log(hitsIn[i].highlight.reviews);
                        }
                        else {
                            source._highlight = "query not found in result"
                        }
                        
                        
                        hitsOut.push(source);
                    }
                    deferred.resolve({ timeTook: result.took, hitsCount: result.hits.total, hits: hitsOut });
            }, deferred.reject);
        } else {
            client.search({
                "index": CALACA_CONFIGS.index_name,
                "type": CALACA_CONFIGS.type,
                "body": {
                    "size": CALACA_CONFIGS.size,
                    "from": offset,
                    // "query": {
                    //     "query_string": {
                    //         "query": query
                    //     }
                    // }
                    "query" : {
                    "function_score" : {
                      "query": {
                        "bool": {
                          "must": [
                            {
                              "multi_match" : {
                                "query":  query,
                                "fields": [ "name", "reviews", "website" ],
                                "operator" : "and",
                                "fuzziness": 1
                              }
                            },
                            {
                              "multi_match": {
                                "query":  placetype,
                                "fields": "types"
                              }
                            }
                          ]
                        }
                      },
                      "field_value_factor" : {
                          "field": "sentiment"
                      }
                    }
                    },
                    // "sort" : [
                    //     { "sentiment" : {"order" : "desc"}}
                    // ],
                    "highlight" : {
                        "pre_tags" : ["<span class='highlight-result'>"],
                        "post_tags" : ["</span>"],
                        "fields" : {
                            "reviews" : {"fragment_size" : 250, "number_of_fragments" : 3}
                        }
                    }
                }
            }).then(function(result) {

                    var i = 0, hitsIn, hitsOut = [], source;
                    hitsIn = (result.hits || {}).hits || [];
                    for(;i < hitsIn.length; i++){
                        source = hitsIn[i]._source;
                        source._id = hitsIn[i]._id;
                        source._index = hitsIn[i]._index;
                        source._type = hitsIn[i]._type;
                        source._score = hitsIn[i]._score;
                        
                        if (typeof(hitsIn[i].highlight) !== 'undefined') {
                            source._highlight = hitsIn[i].highlight.reviews[0];
                            // console.log(hitsIn[i].highlight.reviews);
                        }
                        else {
                            source._highlight = "query not found in result"
                        }
                        
                        
                        hitsOut.push(source);
                    }
                    deferred.resolve({ timeTook: result.took, hitsCount: result.hits.total, hits: hitsOut });
            }, deferred.reject);
        }

        

        return deferred.promise;
    };

    return {
        "search": search
    };

    }]
);
