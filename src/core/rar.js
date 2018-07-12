let unrar = require("@fknop/node-unrar");
let fs = require("fs");
let path = require('path');
let fse = require("fs-extra");
function unrarFile(filePath, cb) {
    let dir = path.join(process.cwd(), "./data/unrar");
    fse.ensureDir(dir)
        .then(() => {
            let result = unrar.extractSync(filePath, {dest:dir});
            console.log(Buffer.from(JSON.stringify(result)).toString());
            cb();
        })
        .catch(err => {
            console.error(filePath, "===>", dir, err);
            cb(err);
        })
}


// console.log('__dirname：', __dirname)
// console.log('__filename：', __filename)
// console.log('process.cwd()：', process.cwd())
// console.log('./：', path.join(process.cwd(), "./data"))
// unrarFile(path.join(process.cwd(), "./data/rar/a5eb9939de061d87d0a8d478baf3857a"), (err) => {})
exports.unrarFile = unrarFile;