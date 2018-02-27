/**
 * Created by bloodspasm on 2017/12/29.
 */
require('../prototypeJs/prototypeJs');
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



    self.rssLog = function () {

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
                    if  (item.leftInvest < 600){
                        var title = item.houseName+'|时间:'+item.minInvestTime+'月|利率:'+item.minInvestReturn+'%';
                        feed.addItem({
                            title: title,
                            description: item.minInvestTime,
                            link: item.headPic,
                        });
                    }
                }

                var rss = feed.render();
                self.writeRss(rss);
            }
        })

    }

    self.writeRss = function (rss) {
        fs.writeFile( path.resolve(__dirname, '..')+"/public/mfbPushRss.xml", rss, function (err) {
            if (err) throw err;
            // console.log(rss);
        })
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

