# humans-are-invited
This is captcha solver for [humansnotinvited.com](http://humansnotinvited.com).

##Requirements
- Node.js
- Some modules: request, cheerio, image-to-base64, md5. To install these, run:
`npm install request cheerio image-to-base64 md5`.

##Running the code
To solve the captcha we need to count how many times a picture appears in certain category. So, we need some data. To collect them, run from command line:
`node feed.js`

After collecting data for about 1000 iterations we are ready to solve the captcha. To do it automatically, run from command line:
`node solve.js`

If you want to solve the captcha in your web browser, do this steps:
1. Open website [humansnotinvited.com](http://humansnotinvited.com)
2. Run from command line `node manual.js`
2. Open the console (`Ctrl+Shift+I` or `F12`)
3. Run this code from the console:
`
var cat = $(".header strong").html()
var imgs = [];
for (i = 1; i <= 9; i++) {
        imgs.push($($("img")[i]).attr("src").toString());
}
console.log(JSON.stringify({"cat": cat, "imgs": imgs}));
`
4. Paste the output to command line where manual.js is running
5. Mark squares in browser as will be shown in command line output, for example:
`
Mark the squares like this:
------------
|   |   | x|
------------
|   |   |  |
------------
|   | x | x|
------------
`

