const
    request = require("request"),
    cheerio = require("cheerio"),
    image2base64 = require('image-to-base64'),
    md5 = require('md5'),
    fs = require('fs'),
    MAX_IT = 100000;

var
    url = "http://www.humansnotinvited.com/",
    imgs = [],
    db = {},
    it = 1,
    interval;

function count(db) {
	var len = 0;
	for (img in db) len++;
	return len;
}

function load() {
	fs.readFile('db.json', 'utf8', function(e, contents) {
	    if (!e) {
	    	var dump = JSON.parse(contents);
	    	db = dump.db;
	    	it = dump.it;
	    	console.log("Database loaded. Iteration " + it++ + ". " + count(db) + " images are known.");
	    } else {
	    	console.log("Database is empty Will create new one.");
	    }
	});
}

function save() {
	var dump = {};
	dump['it'] = it;
	dump['db'] = db;
	console.log("Saving database  on iteration " + it + "...")
	fs.writeFile("db.json", JSON.stringify(dump), function(err) {
	    if(err) {
	        return console.log(err);
	    }
	    console.log("Database saved. " + count(db) + " images are known.");
	}); 
}


function feed() {
	request(url, function (error, response, body) {
	    if (!error) {
	    	imgs = [];
	        var $ = cheerio.load(body),
	            fuck = $(".content img");
	            for (i = 0; i < 9; i++) {
	            	var img = $(fuck[i]).attr("src");
	            	imgs.push(img);
	            }
	            console.log("Start iteration " + it);
	            console.log("Image URLs:")
	            console.log(imgs);
	            var cat = $(".header strong").text().toString();
	            console.log("Category: " + cat);
	            console.log("Loading images and calculating hashsums...")

	            var imagesReady = 0;

	            for (i = 0; i < 9; i++) {
		            image2base64(url + imgs[i])
					    .then(function(r) {
					    	var h = md5(r);
					    	
					    	if (!db[h]) {
					    		db[h] = {};
					    		db[h][cat] = 1;
					    	} else {
					    		if (db[h][cat]) {
					    			db[h][cat]++;
					    		} else {
					    			db[h][cat] = 1;
					    		}
					    	}

					    	imagesReady++;

					    }).catch(function(e) {
					    	clearInterval(interval);
							/*console.log("Error: " + e);
					        console.log("Trying to feed again in 5 minutes...");
					        setTimeout(feed, 300000);*/
					    });
				}

				interval = setInterval(function(){
					if (imagesReady == 9) {
							console.log("End iteration " + it);
					    	//console.log('to print db here');
					    	console.log(count(db) + " images are known.");
					    	clearInterval(interval);

					    	if (it % 10 == 0) {
					    		save();
					    	}

					    	if (it < MAX_IT) {
					    		if (it % 200 == 0) {
					    			console.log("Waiting 120 seconds...");
					    			setTimeout(feed, 120000);
					    		} else if (it % 100 == 0) {
					    			console.log("Waiting 60 seconds...");
					    			setTimeout(feed, 60000);
					    		} else if (it % 10 == 0) {
					    			console.log("Waiting 10 seconds...");
					    			setTimeout(feed, 10000);
					    		} else {
					    			feed();
					    		}	
					    	} else {
					    		save();
					    	}

					    	it++;
					    	//console.log("=========================================================================");
					}
					
				}, 100);

	    } else {
	        console.log("Error: " + error);
	        console.log("Trying to feed again in 10 seconds...");
	        setTimeout(feed, 10000);
	    }
	});
}

load();
feed();