let httpProxy = require('http-proxy');
let fs = require('fs');
let port = 8443;
let target = "http://www.runoob.com/";
httpProxy.createProxyServer ({
    target: target,
    ssl: {
        key: fs.readFileSync('./key/privkey.pem', 'utf8'),
        cert: fs.readFileSync('./key/fullchain.pem', 'utf8')
    },
    changeOrigin:true
}).listen(port);