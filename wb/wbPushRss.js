/**
 * Created by bloodspasm on 2018/1/9.
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
    var wbjsonPath = path.resolve(__dirname, '..')+"/public/wbPushRss.json"
    var wbxmlPath = path.resolve(__dirname, '..')+"/public/wbPushRss.xml"
    var arr = [];
    self.getIndex = function (wbUserId, conId) {
        arr = util.readArray(wbjsonPath)
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

                            if(isInArray(arr,mblog.mid) === false){
                                console.log('不存在')
                                arr.push(mblog.mid);
                                util.writeFile(wbjsonPath,arr)



                                var URL = 'https://api.leancloud.cn/1.1/classes/wbPushRss';
                                self.wb_leancloud(URL,mblog,title,function () {
                                    self.wxPush('小饼干更新了微博了~', mblog.text + '   '+ cards.scheme)
                                })
                            }
                        }

                    }
                    var rss = feed.render();
                    util.writeFile(wbxmlPath,rss)
                }
            })

        }
    }

    function isInArray(arr,value){
        for(var i = 0; i < arr.length; i++){
            if(value === arr[i]){
                return true;
            }
        }
        return false;
    }


    /**
     * 文本过滤 - 递归拼接
     * @param myString
     * @param appstring
     * @returns {*}
     */
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

    self.wb_leancloud = function (urls, bodyQuery,title,callback) {


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
            }else if (body.code === 137) {
                //console.log(body)
                // callback()
            }else if (body.code === 1) {
                //console.log(body)
                // callback()
            }else if (!error && response.statusCode === 200) {
                console.log('存储成功')
                callback()
            }else{
                // return self.wb_leancloud(urls, bodyQuery,callback);
            }
        });
    }





    /**
     *
     * 腾讯文智情感分析API
     * by soonfy
     *
     *输入参数
     *type参数传递分类，1：电商；2：APP；3：美食；4：酒店和其他
     *content参数传递句子
     *
     * 输出参数
     * positive，正面情感概率
     * negative，负面情感概率
     * code，0表示成功，非0表示失败
     * message，失败时候的错误信息，成功则无该字段
     *
     */

    self.textSentiment = function(type, content){
        var Capi = require('qcloudapi-sdk') ;

        console.log('TextSentiment test start.') ;

        //传递密钥和服务类型，构造qcloudapi对象
        //密钥需要在腾讯云免费申请
        //API请求域名为wenzhi.api.qcloud.com，API文档定义标准
        //API基础域名为api.qcloud.com，API内部默认
        //API服务类型 = 请求域名 - 基础域名，需要传递参数
        var capi = new Capi({
            SecretId : 'AKIDQkv1wj5sAFD1d7HVRbkiU4UiGhGJMxZz' ,
            SecretKey : 'RhnistmqoaBaopeLuHTaqxwmRuEMI7kC' ,
            serviceType : 'wenzhi'
        }) ;

        //传递接口和接口参数，调用对象的request请求方法
        //区域参数：bj，gz，sh，hk，ca
        //接口名参数：TextSentiment
        //特定接口参数
        capi.request({
            Region : 'sh' ,
            Action : 'TextSentiment' ,
            content : content ,                     //content参数使用
            type : type                                 //type参数使用
        } , function(err, data){
            if(!err){
                console.log(data) ;
                console.log('TextSentiment test suc.') ;
            }else{
                console.log(err) ;
                console.log('TextSentiment test err.') ;
            }
        }) ;
    } ;


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

