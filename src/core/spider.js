let superagent = require("superagent");
let request = require("request");
let cheerio = require("cheerio");
let async = require("async");
let path = require("path");
let fs = require("fs");
let crypto = require("./crypto");
let mysql = require("./mysql");
let fse = require("fs-extra");
// let proxy = process.env.http_proxy || 'https://39.135.35.18:80';
let pageMap = {
    "historyAndMilitary":"http://www.zxcs8.com/sort/28",
    "history":"http://www.zxcs8.com/sort/42",
    "military":"http://www.zxcs8.com/sort/43",
    "city":"http://www.zxcs8.com/sort/23",
    "swordsmanAndGod":"http://www.zxcs8.com/sort/25",
    "swordsman":"http://www.zxcs8.com/sort/36",
    "god":"http://www.zxcs8.com/sort/37",
    "fantasy0And1":"http://www.zxcs8.com/sort/26",
    "fantasy0":"http://www.zxcs8.com/sort/38",
    "fantasy1":"http://www.zxcs8.com/sort/39"
};
//http://www.zxcs8.com/sort/28
function getMaxPage(type, cb) {
    if(!type || !pageMap[type]){
        return cb("找不到类型");
    }
    superagent
        .get(pageMap[type])
        .end((err, res) => {
            if(err){
                return cb(err);
            }
            // 等待 code
            let $ = cheerio.load(res.text);
            // console.log(res.text);

            let href = $("div#pagenavi a").last().attr("href");
            let max = parseInt(href.replace(pageMap[type]+"/page/",""));
            cb(0, max);
    })
}
function getList(type, options, cb) {
    if(!type || !pageMap[type]){
        return cb("找不到类型");
    }
    let pageUrl = (options && options.page)?(pageMap[type]+"/page/"+options.page):pageMap[type];
    superagent
        .get(pageUrl)
        .end((err, res) => {
            if(err){
                return cb(err);
            }
            // 等待 code
            let $ = cheerio.load(res.text);
            // console.log(res.text);
            let list = [];
            $("#plist").each((index, value) => {
                value = $(value);
                let title = value.find("dt").text();
                let url = value.find("dt a").attr("href");
                let desc = value.find("dd.des").text();
                let novel = {
                    title: title,
                    url: url,
                    desc: desc,
                    type: type
                }
                // console.log(title,desc,novelUrl)

                if(!novel.url || !novel.title){
                    return console.warn("小说参数错误");
                }
                list.push(novel);
            });
            cb(0, list);
        });
}
function getVote(novel, cb) {
    if(!novel || !novel.url){
        return console.warn("小说参数错误");
    }
    let id = novel.url.replace("http://www.zxcs8.com/post/","");
    let voteUrl = "http://www.zxcs8.com/content/plugins/cgz_xinqing/cgz_xinqing_action.php?action=show&id="+id+"&m="+Math.random();
    superagent
        .get(voteUrl)
        .end((err, res) => {
            if(err){
                return cb(err);
            }
            // console.log(res.text);
            let list = res.text.split(",");
            if(list.length!=5){
                return cb("投票类型数量有误");
            }
            novel.xianCao = parseInt(list[0]);
            novel.liangCao = parseInt(list[1]);
            novel.ganCao = parseInt(list[2]);
            novel.kuCao = parseInt(list[3]);
            novel.duCao = parseInt(list[4]);
            cb(0, novel);
            // let download = $("div.")
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
            let novelHash = crypto.md5Encrypt(buf);
            let filePath = path.join(process.cwd(), "./data/rar/"+novelHash);
            fse.ensureFileSync(filePath);
            fs.writeFile(filePath, buf, (err) => {
                console.log(filePath, 'The file has been saved!');
                novel.novelHash = novelHash;
                novel.size = buf.length;
                cb(0,novel);
            });
        }else {
            return cb(error||response.statusCode);
        }
    }

    request(options, callback);
}

function saveToMysql(novel, cb) {
    let insertSql = "insert into tbl_novel (" +
        "novel_hash, " +
        "type," +
        "size," +
        "title," +
        "detail," +
        "xian_cao," +
        "liang_cao," +
        "gan_cao," +
        "ku_cao," +
        "du_cao," +
        "time" +
        ") values ";
    let insertData = [
        novel.novelHash,
        novel.type,
        novel.size,
        novel.title,
        novel.desc,
        novel.xianCao,
        novel.liangCao,
        novel.ganCao,
        novel.kuCao,
        novel.duCao,
        new Date().getTime()
    ];
    insertSql += mysql.escape([insertData])+" on duplicate key update time=VALUES(time)";
    mysql.query(insertSql, (err) => {
        if(err){
            return cb(err);
        }
        cb(0, novel);
    });
}

function getDetail(novel, cb) {
    superagent
        .get(novel.url)
        .end((err, res) => {
            if(err){
                return cb(err);
            }
            // 等待 code
            let $ = cheerio.load(res.text);
            console.log(res.text);
            cb(0)
            // let download = $("div.")
        });
}
//
// let novel = { title: '《懒散初唐》（校对版全本）作者：北冥老鱼',
//     url: 'http://www.zxcs8.com/post/11032',
//     desc: '\n\n\n\n\n【TXT大小】：7.26 MB\n【内容简介】：　　武德五年，大唐初立，李渊呆在美女如云的后宫之中，忙着享受自己得来不易的胜利果实，李建成忙着稳固自己的太子之位，李世民忙着觊觎大哥的位子，武将们忙着打仗，文臣们忙着治国，商人们忙着与胡商做生意，农户们忙着开垦荒地……\n　　在这片繁忙之中，李休抱着墓碑在长安城外醒来，看着眼前的初唐气象，他...' };
// getRealDownloadUrl(novel
//     ,function (err, novel) {
//         if(err){
//             return console.error(err);
//         }
//         console.log(novel)
//         saveToLocal(novel, function (err, filePath) {
//             if(err){
//                 return console.error(err);
//             }
//             console.info(novel.url,"===>",filePath);
//         })
//     });
// getDetail(novel, (err) => {
//     if(err){
//         return console.error(err);
//     }
// })
// getVote(novel, (err, novel) => {
//     if(err){
//         return console.error(err);
//     }
//     console.info(novel);
// })

exports.saveToLocal = saveToLocal;
exports.getRealDownloadUrl = getRealDownloadUrl;
exports.getList = getList;
exports.getVote = getVote;
exports.getMaxPage = getMaxPage;
exports.saveToMysql = saveToMysql;