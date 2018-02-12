/**
 * Created by bloodspasm on 2018/2/11.
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

    var date = new Date();
    var feed = feedster.createFeed({
        title: '挖钻石项目',
        description: '<![CDATA[挖钻石项目]]',
        link: 'https://star.8.163.com/',
        lastBuildDate:date,

    });

    var cookit = '_ga=GA1.2.1436162892.1518168885; _gat=1; NTES_YD_SESS=ZcAgmlwvREWNNs3U9EtCUPxrrEApzM.A5xu4BbEZR4k7l.DwlvG8Q0Q12z9.8sl0TSOI10Y48RnnwmpsNPnJhyI5IJ2uAzESLe6N1kBaPmYeV0n0AySeeRWzRvcxhDs.nw1Mio99eBGnUTgR1Ch1irNqVk3LABx9wVXngSzbHp3dg4u75oq6r16d8x9bgc25h2sDXOokdsl1v9xfELb9KIdOybgsc8IfKGQBrxSuJpX7I; STAREIG=d7ae858cb77165a26986c2ccebf2ccdd78af3a6f';

    self.indexList = function () {

        var headers = {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_0_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13A452star_client_1.0.0',
            'X-Requested-With': 'XMLHttpRequest',
            'Host': 'star.8.163.com',
            'Referer': 'https://star.8.163.com/m',
            'Origin': 'https://star.8.163.com',
            'Cookie': cookit
        };


        var options = {
            url: 'https://star.8.163.com/api/home/index',
            method: 'POST',
            headers: headers
        };
        var now = new Date();
        request(options, function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var obj = JSON.parse(body);
                console.log(obj);
                if(obj.data.collectCoins.length > 0){
                    obj.data.collectCoins.forEach(function(item,index){
                        self.crawl(item.id);
                    });
                    //挖矿了
                    feed.addItem({
                        title: '挖到矿石了:'+now,
                        description: now
                    });
                }
            }else{
                //过期了
                feed.addItem({
                    title: '账号过期了:'+now,
                    description: now
                });
            }

            var rss = feed.render();
            self.writeRss(rss);
        });

    }


    self.crawl = function (id) {
        var dataString = '{"id":'+id+'}';

        var headers = {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_0_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13A452star_client_1.0.0',
            'X-Requested-With': 'XMLHttpRequest',
            'Host': 'star.8.163.com',
            'Referer': 'https://star.8.163.com/m',
            'Origin': 'https://star.8.163.com',
            'Cookie': cookit,
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json;charset=UTF-8'
        };

        var options = {
            url: 'https://star.8.163.com/api/starUserCoin/collectUserCoin',
            method: 'POST',
            headers: headers,
            body: dataString
        };

        request(options, function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        });



    }

    self.writeRss = function (rss) {
        fs.writeFile( path.resolve(__dirname, '..')+"/public/hzPushRss.xml", rss, function (err) {
            if (err) throw err;
            // console.log(rss);
        })
    }
};
/*  Sample Application.  */
var hzPushRss = {
    starthzPushRss: function () {
        console.log("hzPushRss开始");
        var zapp = new SampleApp();
        zapp.indexList();

    }
}

module.exports = hzPushRss;