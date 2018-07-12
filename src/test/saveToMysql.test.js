let spider = require("../core/spider");
let novel = {
    novelHash:"123",
    type:"city",
    size:10,
    title:"hello",
    desc:"world",
    xianCao:1,
    liangCao:2,
    ganCao:3,
    kuCao:4,
    duCao:5
}
spider.saveToMysql(novel, (err) => {
    if(err){
        return console.error(err);
    }
    console.info("插入成功", novel);
})