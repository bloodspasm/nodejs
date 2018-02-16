/**
 * Created by bloodspasm on 2018/2/16.
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

    var cookit = '_ga=GA1.2.1436162892.1518168885; NTES_YD_SESS=B.FjP8jHe4JnrCseUbY94.mj7mol4o2OLgATY3LBvTSKtMe.tG1VzrzpSlmiqHHXaNFi4Z1iP4EwZqn4pTDLw8NjbSV.l2oAyp0ohUaIFwetXt6snuDliRdwvG4g2e6MH.auCRPP9Y1HO5FvaD2aCnjfhSqpIYgP.wgssxCC5AOaWCchZ482YybzehvTf1QHShJXjA7tKd9iuRx0Zz9MKOYNdXYgJFawaUiYohhFyjk4J; STAREIG=4256424ab93b0a39af6dc1059a9bdeee8ea21372';

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
};
/*  Sample Application.  */
var hzChild1Push = {
    starthzChild1Push: function () {
        console.log("hzPushRss开始");
        var zapp = new SampleApp();
        zapp.indexList();

    }
}

module.exports = hzChild1Push;