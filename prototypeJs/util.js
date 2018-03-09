var fs = require('fs');
var readArray = function (path) {
    var data = fs.readFileSync(path, 'utf8');
    if(data.length > 0 ){
        return data.split(",");
    }else{
        return [];
    }
};

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