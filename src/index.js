let spider = require("spider");
let async = require("async");

async.waterfall([
    // 获取列表
    function(cb) {
        spider.getList("historyAndMilitary", null, cb);
    },
    // 获取详情
    function (list, cb) {
        if(!list || !list.length){
            console.info("historyAndMilitary ===> 小说下载完毕");
            return cb(0);
        }
        cb(0);
    }
], function (err, result) {
    // result now equals 'done'
    if(err){
        return console.error(err);
    }
    console.info("爬取成功", pageMap.historyAndMilitary);
});