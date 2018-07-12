let spider = require("./core/spider");
let async = require("async");
let path = require("path");
let rar = require("./core/rar");
let type = process.env.type || "historyAndMilitary";
require('console-stamp')(console, {
    label:true,
    pattern: 'yyyy-mm-dd HH:MM:ss.l'
});
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
        () => { return count < max; },
        (cb) => {
            async.waterfall([
                (cb) => {
                    spider.getList("historyAndMilitary", {page:count}, cb);
                },
                (list, cb) => {
                    async.mapLimit(list, 1, (novel, cb) => {
                        console.info(type, "===>", novel.title, novel.url);
                        async.waterfall([
                            (cb) => {
                                // 获取基本信息以及下载地址
                                spider.getRealDownloadUrl(novel, cb);
                            },
                            (novel, cb) => {
                                // 获取仙草、粮草、枯草、干草、毒草投票
                                spider.getVote(novel, cb);
                            },
                            (novel, cb) => {
                                // 下载保存到本地
                                spider.saveToLocal(novel, cb);
                            },
                            (novel, cb) => {
                                // 信息写入mysql
                                spider.saveToMysql(novel, cb);
                            },
                            (novel, cb) => {
                                //一分钟下载一本，不要太快
                                setTimeout(cb, 60000);
                                // 解压rar文件
                                // let filePath = path.join(process.cwd(), "./data/rar/"+novel.novelHash);
                                // rar.unrarFile(filePath, cb);
                            }
                        ], cb);
                    },cb);
                }
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