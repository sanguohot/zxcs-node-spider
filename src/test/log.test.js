require('console-stamp')(console, {
    label:true,
    pattern: 'yyyy-mm-dd HH:MM:ss.l'
});
let name = "node";
console.log("hello world", name);
console.info("hello world", name);
console.warn("hello world", name);
console.error("hello world", name);
console.trace("hello world", name);
