const
    request = require("request"),
    cheerio = require("cheerio"),
    image2base64 = require('image-to-base64'),
    md5 = require('md5'),
    fs = require('fs'),
    readline = require('readline'),
    imgCats = []; 

var
    url = "http://www.humansnotinvited.com/",
    imgs = [],
    db = {},
    max = {},
    interval,
    imagesReady = 0,
    res = [];

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
	    } else {
	    	console.log("Error: " + e);
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

function getImgCat(src) {
	var fuck = "";
	image2base64(url + src)
		.then(function(r) {
			var h = md5(r);
			//var cat = findImage(h);
			if (!max[h]) {
				fuck = "Unknown image";
			} else {
				fuck = max[h];
			}
			console.log(src + ": " + fuck);
			imagesReady++;

			imgCats.push({'src': src, 'cat': fuck});

		}).catch(function(e) {
			console.log("Error: " + e);
		});
}

function mark(x) {
	if (res[x]) return "x";
	else return " ";
}

function solve() {

	var browserCode = `
		var cat = $(".header strong").html();
		var imgs = [];
		for (i = 1; i <= 9; i++) {
			imgs.push($($("img")[i]).attr("src").toString());
		}
		console.log(JSON.stringify({"cat": cat, "imgs": imgs}));\n
	`;
	const rl = readline.createInterface({input: process.stdin, output: process.stdout});
	rl.question('\nRun this code in your browser\'s console and paste the output below:\n' + browserCode, (input) => {
  		var fuck = JSON.parse(input);

  		var imgs = fuck.imgs;
  		console.log(imgs);
  		var currentCat = fuck.cat;
  		for (i = 0; i < 9; i++) {
			getImgCat(imgs[i]);
		}

		interval = setInterval(function() {
			if (imagesReady == 9) {
				for (i in imgCats) {
					res[imgs.indexOf(imgCats[i].src)] = currentCat == imgCats[i].cat;
				}
				//console.log(res);
				console.log("\n\nMark the squares like this:");
				console.log('------------');
				var cnt = 0;
				for (i = 0; i < 3; i++) {
					console.log('| '+mark(cnt++)+' | '+mark(cnt++)+' | '+mark(cnt++)+'|');
					console.log('------------');
				}

				clearInterval(interval);
			}
		}, 100);

  		rl.close();
	});

}


load();










