let superagent = require("superagent");
let request = require("request");
let cheerio = require("cheerio");
let async = require("async");
let fs = require("fs");
let crypto = require("./crypto");
let fse = require("fs-extra");
// let proxy = process.env.http_proxy || 'https://39.135.35.18:80';
let pageMap = {
    "historyAndMilitary":"http://www.zxcs8.com/sort/28"
};
//http://www.zxcs8.com/sort/28
function getList(url, options, cb) {
    superagent
        .get(pageMap["historyAndMilitary"])
        .query()
        .end((err, res) => {
            if(err){
                return cb(err);
            }
            // 等待 code
            let $ = cheerio.load(res.text);
            // console.log(res.text);
            $("#plist").each((index, value) => {
                value = $(value);
                let title = value.find("dt").text();
                let url = value.find("dt a").attr("href");
                let desc = value.find("dd.des").text();
                let novel = {
                    title: title,
                    url: url,
                    desc: desc
                }
                // console.log(title,desc,novelUrl)

                if(!novel.url || !novel.title){
                    return cb("小说参数错误");
                }
                cb(novel);
            });
        });
}
function getRealDownloadUrl(novel, cb) {
    let id = novel.url.replace("http://www.zxcs8.com/post/","");
    let downloadUrl = "http://www.zxcs8.com/download.php?id="+id;
    superagent
        .get(downloadUrl)
        .end((err, res) => {
            if(err){
                return cb(err);
            }
            // 等待 code
            let $ = cheerio.load(res.text);
            // console.log(res.text);
            let realDownloadUrl = $("span.downfile").first().find("a").attr("href");
            novel.realDownloadUrl = realDownloadUrl;
            cb(0, novel);
            // let download = $("div.")
        });
}
function saveToLocal(novel, cb) {
    if(!novel.realDownloadUrl){
        return cb("参数错误")
    }
    let options = {
        url: novel.realDownloadUrl,

        // 非常关键，表示不要对响应做任何的转换
        encoding: null
    };
    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            // let info = JSON.parse(body);
            // console.log(info.stargazers_count + " Stars");
            // console.log(info.forks_count + " Forks");
            let buf = Buffer.from(body, "utf8");
            let filePath = './data/'+crypto.md5Encrypt(buf);
            fse.ensureFileSync(filePath);
            fs.writeFile(filePath, buf, (err) => {
                if (err) {
                    return cb(err);
                }
                console.log(filePath, 'The file has been saved!');
                cb(0,filePath);
            });
        }else {
            return cb(error||response.statusCode);
        }
    }

    request(options, callback);
}

function getDetail(novel, cb) {
    request
        .get(novel.url)
        .end((err, res) => {
            if(err){
                return cb(err);
            }
            // 等待 code
            let $ = cheerio.load(res.text);
            // console.log(res.text);
            // let download = $("div.")
        });
}
// async.waterfall([
//     // 获取列表
//     function(cb) {
//
//     },
//     // 获取详情
//     function (novel, cb) {
//         request
//         .get(novel.url)
//         .query()
//         .end((err, res) => {
//             if(err){
//                 return cb(err);
//             }
//             // 等待 code
//             let $ = cheerio.load(res.text);
//             console.log(res.text);
//         });
//     }
// ], function (err, result) {
//     // result now equals 'done'
//     if(err){
//         return console.error(err);
//     }
//     console.info("爬取成功", pageMap.historyAndMilitary);
// });
// getList(pageMap.historyAndMilitary, null, function (err, novel) {
//     console.log(err, novel);
// })
let novel = { title: '《懒散初唐》（校对版全本）作者：北冥老鱼',
    url: 'http://www.zxcs8.com/post/11032',
    desc: '\n\n\n\n\n【TXT大小】：7.26 MB\n【内容简介】：　　武德五年，大唐初立，李渊呆在美女如云的后宫之中，忙着享受自己得来不易的胜利果实，李建成忙着稳固自己的太子之位，李世民忙着觊觎大哥的位子，武将们忙着打仗，文臣们忙着治国，商人们忙着与胡商做生意，农户们忙着开垦荒地……\n　　在这片繁忙之中，李休抱着墓碑在长安城外醒来，看着眼前的初唐气象，他...' };
getRealDownloadUrl(novel
    ,function (err, novel) {
        if(err){
            return console.error(err);
        }
        console.log(novel)
        saveToLocal(novel, function (err, filePath) {
            if(err){
                return console.error(err);
            }
            console.info(novel.url,"===>",filePath);
        })
    });