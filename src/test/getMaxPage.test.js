let cheerio = require("cheerio");
let fs = require("fs");
// console.log(res.text);
let pageMap = {
    "historyAndMilitary":"http://www.zxcs8.com/sort/28"
};
let type = "historyAndMilitary";
let text = fs.readFileSync("../../docs/historyAndMilitary.html").toString();
let $ = cheerio.load(text);
let href = $("div#pagenavi a").last().attr("href");
let max = parseInt(href.replace(pageMap[type]+"/page/",""));
console.log(href,max)