let spider = require("./core/spider");
let async = require("async");
let path = require("path");
let rar = require("./core/rar");
let type = process.env.type || "historyAndMilitary";
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
        function() { return count < max; },
        function(cb) {
            //数据库写入与遍历文件
            spider.getList("historyAndMilitary", {page:count}, (err, list) => {
                async.mapLimit(list, 1, (novel, cb) => {
                    console.info(type, "===>", novel);
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
                            // 解压rar文件
                            // let filePath = path.join(process.cwd(), "./data/rar/"+novel.novelHash);
                            // rar.unrarFile(filePath, cb);
                            cb();
                        }
                    ], cb);
                },cb);
            });
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