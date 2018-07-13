let spider = require("./core/spider");
let async = require("async");
let path = require("path");
let rar = require("./core/rar");
let type = process.env.type || "historyAndMilitary";
require('console-stamp')(console, {
    label:true,
    pattern: 'yyyy-mm-dd HH:MM:ss.l'
});
function beginNovelWorkPipe(novel, cb) {
    async.waterfall([
        (cb) => {
            // 获取基本信息以及下载地址
            spider.getRealDownloadUrl(novel, cb);
        },
        // 获取仙草、粮草、枯草、干草、毒草投票
        spider.getVote,
        // 下载保存到本地
        spider.saveToLocal,
        // 信息写入mysql
        spider.saveToMysql,
        (novel, cb) => {
            //一分钟下载一本，不要太快
            setTimeout(cb, 20000);
            // 解压rar文件
            // let filePath = path.join(process.cwd(), "./data/rar/"+novel.novelHash);
            // rar.unrarFile(filePath, cb);
        }
    ], (err) => {
        if(err){
            console.error(err);
        }
        // 这里哪怕出错都不退出，而是继续循环
        cb(0);
    });
}

function processList(list, cb) {
    async.mapLimit(list, 1, (novel, cb) => {
        console.info(type, "===>", novel.title, novel.url);
        spider.checkIdIsExist(novel.fileId, (err, isExist) => {
            if(err){
                return cb(err);
            }
            if(isExist){
                return cb(0);
            }
            beginNovelWorkPipe(novel, cb);
        });
    },cb);
}
spider.getMaxPage(type, (err, max) => {
    if(err){
        return console.error(type, "===>", err);
    }
    if(!max){
        return console.error(type, "===>", "页数非法");
    }
    let count = 0;
    let list = [];
    async.whilst(
        () => { return count++ < max; },
        (cb) => {
            async.waterfall([
                (cb) => {
                    spider.getList(type, {page:count}, cb);
                },
                processList
            ], cb);
        },
        (err, n) => {
            // 5 seconds have passed, n = 5
            if(err){
                return console.error(type, "===>", err);
            }
            console.info(type, "===>", "下载完成，总页数",max);
        }
    );
});