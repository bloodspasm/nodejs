/**
 * Created by bloodspasm on 2017/12/29.
 */
require('../prototypeJs/prototypeJs');
var util = require('../prototypeJs/util');
var express = require('express');
var fs = require('fs');
var request = require('request');
var feedster = require('feedster');
/**
 *  Define the sample application.
 */
var SampleApp = function () {

    //  Scope.
    var self = this;

    var path = require('path')

    var list = [];


    // var mfbjsonPath = path.resolve(__dirname, '..')+"/public/mfbPushRss.json"
    var mfbxmlPath = path.resolve(__dirname, '..')+"/public/mfbPushRss.xml"
    var arr = [];
    self.rssLog = function () {
        //arr = util.readArray(mfbjsonPath)
        var urls = 'http://wxmp.momfo.com/house/momBaby.do?page=1&row=10';
        request(urls, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var obj = JSON.parse(body);
                console.log(obj.data.houseList);
                var date = new Date();
                var feed = feedster.createFeed({
                    title: '魔方宝发布了新项目',
                    description: '<![CDATA[魔方宝发布了新项目]]',
                    link: 'http://wxmp.momfo.com/house/momBaby.do?page=1&amp;row=10',
                    lastBuildDate:date,

                });

                var houseList =  obj.data.houseList;
                for (var i = 1; i < houseList.length - 2; i++) {
                    var item = houseList[i];
                    var title = item.houseName+'|时间:'+item.minInvestTime+'月|利率:'+item.minInvestReturn+'%';
                    if  (item.leftInvest < 600){

                        feed.addItem({
                            title: title,
                            description: item.minInvestTime,
                            link: item.headPic,
                        });
                        /*
                        if(isInArray(arr,title) === false){
                            console.log('不存在')
                            arr.push(title);
                            util.writeFile(mfbjsonPath,arr)
                            var URL = 'https://api.leancloud.cn/1.1/classes/mfbPushRss';
                            self.mfb_leancloud(URL,item,title,function () {
                                self.wxPush('魔方宝发布了新项目了~', title)
                            })
                        }
                        */
                        var URL = 'https://api.leancloud.cn/1.1/classes/mfbPushRss';
                        self.mfb_leancloud(URL,item,title,function () {
                            self.wxPush('魔方宝发布了新项目了~', title)
                        })
                    }



                }

                var rss = feed.render();
                util.writeFile(mfbxmlPath,rss);
            }
        })

    }

    function isInArray(arr,value){
        for(var i = 0; i < arr.length; i++){
            if(value === arr[i]){
                return true;
            }
        }
        return false;
    }

    self.writeRss = function (rss) {
        fs.writeFile( path.resolve(__dirname, '..')+"/public/mfbPushRss.xml", rss, function (err) {
            if (err) throw err;
            // console.log(rss);
        })
    }

    self.wxPush = function (text,desp) {

        var request = require("request");

        var options = { method: 'POST',
            url: 'http://sc.ftqq.com/SCU22824T08731a59cd89a114b11a12f596907f2d5aa2323cc37b2.send',
            headers:
                { 'postman-token': 'd0c5646b-08a2-71f5-1b83-6918b4c9b438',
                    'cache-control': 'no-cache',
                    'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' },
            formData: { text: text, desp: desp } };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
        });


    }


    self.mfb_leancloud = function (urls, bodyQuery,title,callback) {


        // console.log('qt_leancloud')
        //console.log(bodyQuery)
        var url = urls;
        var head = {
            "X-LC-Id": "Dl7oBuzmjMkYOwnRA6JODe7e-gzGzoHsz",
            "X-LC-Key": "kS1LrrEyiMcAszLFUyMmtdEb",
            "Content-Type": "application/json"
        }

        request({
            url: url,
            method: "POST",
            json: true,
            headers: head,
            body: bodyQuery
        }, function (error, response, body) {
            console.log(body)
            console.log(typeof (body))
            // self.textSentiment(4,title)
            if(typeof (body) !== 'object'){
                // console.log('mmp')
                // // self.sleep(1000)
                // return self.wb_leancloud(urls, bodyQuery,callback);
            }else if (body.code > 0) {
                //console.log(body)
                // callback()
            }else{
                console.log('存储成功')
                callback()
            }
        });
    }
};
/*  Sample Application.  */
var mfbPushRss = {
    startmfbPushRss: function () {
        console.log("mfbPushRss开始");
        var zapp = new SampleApp();
        zapp.rssLog();
    }
}

module.exports = mfbPushRss;

