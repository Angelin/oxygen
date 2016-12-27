#!/usr/bin/env node
'use strict';
const logger = require('./../../applogger');
const searchModel = require('./searchEntity').searchModel;
const datapublisher = require('../serviceLogger/redisLogger');
const async = require('async');
const docSearchJobModel = require('./../docSearchJob/docSearchJobEntity').docSearchJobModel;
const Request = require('superagent');
const startCrawlerMQ=require('./docOpenCrawlerEngine').startCrawler;

const getURL= function(jobDetails,i,callback)
{
  let eng=jobDetails.engineID.split(' ');
  let url="https://www.googleapis.com/customsearch/v1?q="+
  jobDetails.query+"&cx="+eng[0]+"&key="+eng[1]+"&start="+i;
  if(jobDetails.siteSearch!=='NONE'){
    url+="&siteSearch="+jobDetails.siteSearch;
  }
  if(jobDetails.exactTerms!=='NONE')
  {
    url+="&exactTerms="+jobDetails.exactTerms;
  }
  let searchResults=[];
  console.log(i+" "+url+" "+jobDetails.results);
  Request
  .get(url)
  .end(function(err,body)
  {
    if(err)
    {
      logger.error("encountered error while communicating with the google api :")
      logger.error(err);
    }

    console.log(body);
    let data = JSON.parse(body.text);
    //console.log(data)
    for (let k = 0; k < data.items.length; k+=1) {

      if((i+k)<=jobDetails.results)
      {
        let searchResult={
          "jobID":jobDetails._id,
          "query":jobDetails.query,
          "title":data.items[k].title,
          "url":data.items[k].link,
          "description":data.items[k].snippet
        };
        searchResults.push(searchResult);
      }
      else
        {break;}
    }
    callback(null,searchResults);
   // console.log(searchResults);

 });

}

const storeURL = function(id) {
  const query = { _id: id};
  docSearchJobModel.findOne(query, function(err, jobDetails) {
    if (err) {
      logger.error(
        "Encountered error at SearchController::docSearchJobModel, error: ",
        err);
    //  return callback(err, {});
  }

  if (!jobDetails) {
    logger.error("No such job Found");
    //  return callback('job not available or not found..!', {});
  }

  console.log('in search server');
  let stack=[];

  console.log(jobDetails);

  for(let k=1;k<jobDetails.results;k+=10){
    stack.push(async.apply(getURL,jobDetails,k));
  }


  let sendData=async.parallel(stack,function(errs,res){
    let send=[];
    res.map((ele)=>{
      console.log(ele.length);
      ele.map((data,i)=>{

        send.push(data);
        let saveUrl=new searchModel(data);
        saveUrl.save(function (saveErr,savedObj) {
          if (saveErr) {
            console.log(saveErr);
          }
          else {
            console.log("saved "+i+" "+savedObj._id);
            let msgObj={
              domain: jobDetails.exactTerms,
              concept: jobDetails.query,
              url: savedObj.url
            };
            startCrawlerMQ(msgObj);
            let RedisSearch={
              domain: jobDetails.exactTerms,
              actor: 'searcher',
              message: jobDetails.query,
              status: 'search completed'
            }
             datapublisher.processFinished(RedisSearch);
              //ch.sendToQueue('hello', new Buffer(objId));
              let redisCrawl={
                domain: jobDetails.exactTerms,
                actor: 'crawler',
                message: savedObj.url,
                status: 'crawl started for the url'
              }
              datapublisher.processStart(redisCrawl);
            }
          });

      })

    })
    console.log(send);
      //return callback(null, {'saved urls':send.length,'content':send});
    })
  return sendData;
});


};

module.exports = {
  storeURL: storeURL,
  getURL:getURL
};
