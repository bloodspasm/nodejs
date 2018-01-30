/**
 * Created by bloodspasm on 2018/1/9.
 */

require('../prototypeJs/prototypeJs');
var express = require('express');
var fs = require('fs');
var crypto = require('crypto');
var request = require('request');
var feedster = require('feedster');
/**
 *  Define the sample application.
 */
var SampleApp = function () {

    //  Scope.
    var self = this;

    var path = require('path')

    self.NSLog = function (resultBuffer) {
        console.log(resultBuffer);
    }

    self.timeFrame = function (string) {
        //console.log('isArray'+arr)
        //var time = mblog.created_at;
        var time = string;
        console.log(typeof (time))
        if (typeof (time)=== "string") {
            var t = time.indexOf('小时');
            var m = time.indexOf('分钟');
            var g = time.indexOf('刚');
            var n = time.indexOf('2016');
            var z = time.indexOf('天');
            var date = new Date();
            date = date.getBJDate();
            if (t > 0) {
                time = date.format("yyyy-MM-dd");
            } else if (m > 0) {
                time = date.format("yyyy-MM-dd");
            } else if (g > 0 || time.length == 2) {
                time = date.format("yyyy-MM-dd");
            } else if (n > 0) {
                time = time;
            } else if(z > 0){
                date.setDate(date.getDate() - 1);
                time = date.format("yyyy-MM-dd");;
            } else {
                time = "2017-" + time
            }
            time = time.replace('2017-20', "20");
        } else {
            time = "公元前的某日"
        }

        return time;
    }


    self.getWBQueue = function (wbUserId) {
        var urls = 'https://m.weibo.cn/api/container/getIndex?uid=' + wbUserId + '&type=uid&value=' + wbUserId;
        request(urls, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var obj = JSON.parse(body);
                // console.log(obj.data)
                //console.log('opencount1 =' + obj.data.tabsInfo.tabs);
                var tabs = obj.data.tabsInfo.tabs;
                var conId;
                for (var i = 0; i < tabs.length; i++) {
                    if (tabs[i].tab_type == 'weibo') {
                        conId = tabs[i].containerid;
                        // console.log('conId =' + conId);
                        self.getIndex(wbUserId, conId)
                    }
                }
            }
        })
    }

//https://m.weibo.cn/api/comments/show?id=4155501182321076&page=1
//4155501182321076
    var arr = [];
    self.getIndex = function (wbUserId, conId) {
        //self.NSLog("缓存数量------" + arr.length)
        for (var n = 0; n < 1; n++) {
            var urls = 'https://m.weibo.cn/api/container/getIndex?uid=' + wbUserId + '&type=uid&value=' + wbUserId + '&page=' + n + '&containerid=' + conId;
            //console.log(urls)
            request(urls, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var obj = JSON.parse(body);
                    if(typeof (obj.data.cards) === 'undefined'){
                        return
                    }
                    var date = new Date();
                    var feed = feedster.createFeed({
                        title: '小饼干更新微博了',
                        description: '<![CDATA[小饼干更新微博了]]',
                        link: 'https://m.weibo.cn/api/container/getIndex?uid=3152574715&type=uid&value=3152574715&page=0&containerid=1076033152574715',
                        lastBuildDate:date,

                    });

                    console.log(obj.data.cards)
                    for (var i = 0; i < obj.data.cards.length; i++) {
                        var cards = obj.data.cards[i];
                        if (cards.card_type == 9) {
                            var mblog = cards.mblog;
                            var thumbnail_pic = mblog.thumbnail_pic
                            var pics = mblog.pics;
                            //console.log(mblog)

                            var time = self.timeFrame(mblog.created_at);

                            var text = wbstring(mblog.text,'')
                            text = text.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
                            var title = text;
                            if (text.length > 18) {
                                title = text.substring(0, 18)
                                title = title + "..."
                            }
                            arr.push(thumbnail_pic);

                            var author;
                            if (wbUserId == '6077805247') {
                                author = "微博-绿帽社";
                            } else if (wbUserId == '1905895522') {
                                author = "微博-妖姬葵";
                            } else if (wbUserId == '3152574715') {
                                author = "小饼干";
                            }

                            var bodyQuery = {
                                "author": author,
                                "commentcount": 0,
                                "ts": time,
                                "content": text,
                                "from": "来自:" + author,
                                "icon": thumbnail_pic,
                                "read": 1,
                                "readcount": 0,
                                "title": title
                            };

                            var title = text;
                            feed.addItem({
                                title: title,
                                description: time,
                                link: cards.scheme,
                            });
                            mblog.created_at =  time
                            var URL = 'https://api.leancloud.cn/1.1/classes/wbPushRss';
                            self.wb_leancloud(URL,mblog,function () {

                            })
                        }

                    }
                    var rss = feed.render();
                    self.writeRss(rss);
                }
            })

        }
    }


    function wbstring(myString,appstring) {
        var s=myString.indexOf('<');
        var e=myString.indexOf('>');
        var str
        if(s === 0 && e !== 0){
            var s2=myString.indexOf('alt="');
            var e2=myString.indexOf('"></s');
            if (s2 !== -1){
                str = myString.substring(s2+5,e2)
            }else{
                str = ''
            }
        }else if(s === -1 && appstring === ''){
            str = myString
        }else{
            str = myString.substring(0,s)
        }
        appstring = appstring + str;


        if(s === 0){
            myString = myString.substring(e+1,myString.length)
        }else{
            myString = myString.substring(s,myString.length)
        }

        if(s !== -1){
            return wbstring(myString,appstring)
        }else {
            return appstring;
        }
    }



    self.getComments = function (cid, themeObject) {
        for (var n = 0; n < 1; n++) {
            var urls = 'https://m.weibo.cn/api/comments/show?id=' + cid + '&page=' + n
            request(urls, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var obj = JSON.parse(body);
                    //console.log(obj.data)
                    var data = obj.data;
                    console.log(data)
                    for (var i = 0; i < data.length; i++) {

                        var time = self.timeFrame()
                        var showUser = data[i].user;
                        var text = data[i].text;
                        text = text.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
                        var body = {
                            "themeObject": themeObject,
                            "isAnonymity": true,
                            "ts": time,
                            "themeComment": text,
                            "showUser": showUser
                        };
                        console.log(body)
                        //var URL = 'https://api.leancloud.cn/1.1/classes/comment';
                        //self.leancloud(URL, body);
                    }
                }
            })
        }

    }

    self.writeRss = function (rss) {
        fs.writeFile( path.resolve(__dirname, '..')+"/public/wbPushRss.xml", rss, function (err) {
            if (err) throw err;
            // console.log(rss);
        })
    }

//wbPushRss
    self.wb_leancloud = function (urls, bodyQuery,callback) {


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
            //console.log(typeof (body))
            // if(typeof (body) !== 'object'){
            //     console.log('mmp')
            //     // self.sleep(1000)
            //     return self.wb_leancloud(urls, bodyQuery,callback);
            // }else if (body.code === 137) {
            //     //console.log(body)
            //     callback()
            // }else if (body.code === 1) {
            //     //console.log(body)
            //     callback()
            // }else if (!error && response.statusCode === 200) {
            //     //console.log(body)
            //     callback()
            // }else{
            //     return self.wb_leancloud(urls, bodyQuery,callback);
            // }
        });
    }
};
/*  Sample Application.  */
var wbPushRss = {
    startwbPushRss: function () {
        console.log("wbPushRss开始");
        var zapp = new SampleApp();
        zapp.getWBQueue('3152574715')
    }
}

module.exports = wbPushRss;

