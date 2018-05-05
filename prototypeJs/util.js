var fs = require('fs');
/**
 * 读取文件转数组
 * @param path 文件地址
 * @returns {Array}
 */
var readArray = function (path) {
    var data = fs.readFileSync(path, 'utf8');
    if(data.length > 0 ){
        return data.split(",");
    }else{
        return [];
    }
};

/**
 * 写入文件
 * @param path 文件地址
 * @param rss 内容
 */
var writeFile = function (path,rss) {
    fs.writeFile( path, rss, function (err) {
        if (err) throw err;
        // console.log(rss);
    })
};



var util = {
    readArray: readArray,
    writeFile: writeFile,
};


module.exports = util;