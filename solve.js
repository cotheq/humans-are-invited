const
    request = require("request"),
    cheerio = require("cheerio"),
    image2base64 = require('image-to-base64'),
    md5 = require('md5'),
    fs = require('fs'),
    imgCats = [];

var
    url = "http://www.humansnotinvited.com/",
    imgs = [],
    db = {},
    max = {},
    interval,
    imagesReady = 0;


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
	    	max = shrink(db);
	    	console.log("Database loaded. Iteration " + it++ + ". " + count(db) + " images are known.");

	    	solve();
	    }
	});
}

function shrink(db) {
	var max = {}
	for (img in db) { 
		var maxValue = 0, maxKey = "";
		for (cat in db[img]) {
			if (maxValue < db[img][cat]) {
				maxValue = db[img][cat];
				maxKey = cat;
			}
		}
		max[img] = maxKey;
	}
	return max;
}

function getImgCat(url) {
	var fuck = "";
	image2base64(url + imgs[i])
		.then(function(r) {
			var h = md5(r);
			//var cat = findImage(h);
			if (!max[h]) {
				fuck = "Unknown image";
			} else {
				fuck = max[h];
			}
			console.log(url + ": " + fuck);
			imagesReady++;
			var query = url.split("?")[1].split("&");
			var token = query[0].split("=")[1];
			var id = query[1].split("=")[1];

			imgCats.push({'token': token, 'id': id, 'cat': fuck});

		}).catch(function(e) {
			console.log("Error: " + e);
		});
}

function buildPostData(imgCats, currentCat) {
	var capthcaData = [];
	for (img in imgCats) {
		capthcaData.push({
			'id': imgCats[img].id,
			'token': imgCats[img].token,
			'active': (imgCats[img].cat == currentCat)
		});
	}
	var data = {'capthcaData': capthcaData, 'category': currentCat};
	console.log("This data will be sent on server:");
	console.log(data);
	return data;
}

function solve() {
	request(url, function (error, response, body) {
	    if (!error) {

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
	        console.log("Loading images and defining their categories...")

	        

			for (i = 0; i < 9; i++) {
				getImgCat(url + imgs[i]);
			}

			interval = setInterval(function(){
				if (imagesReady == 9) {
					clearInterval(interval);
					//console.log(imgCats);
					var options = {
					  method: 'post',
					  form: buildPostData(imgCats, cat), 
					  json: true, 
					  url: url + "ajax/sendCaptcha.php",
					  headers: {
					    //"X-Forwarded-For": '127.0.0.1' /* to spoof your IP uncomment this */
					  }
					}

					request.post(options, function(err,httpResponse,body){
						if (!err) {
							//var $$ = cheerio.load(body);
							console.log("response: " + JSON.stringify(httpResponse));
							//console.log("body: " + JSON.stringify(body));
						} else {
							console.log("Error: " + err)
						}
						
					})
				}

			}, 100);


	    } else {
	        console.log("Error: " + error);
	    }
	});
}


load();










