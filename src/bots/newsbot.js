const request = require('request');
const timeSince =  require('../utils/util');
const newsdao = require('../dao/newsdao');
const util = require("../utils/util");
const summarizeAsync = require('./nlpbot.js');
const axios = require('axios');
const delayInMilliseconds = 90000;
const newsSize = 25; //How many news we want for each sub-categories

const config = require ('../config/config.js');
let goPerigonApiKey = config.goPerigonApiKey;
const Jasypt = require ('jasypt');
const jasypt = new Jasypt();
jasypt.setPassword(process.env['urlpassword']);
goPerigonApiKey = jasypt.decrypt(goPerigonApiKey);

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchNewsList(url){
  try{
    const headers = {
      "User-Agent":"PostmanRuntime/7.31.1"
    };
    const response = await axios.get(url, {headers});
    return response.data;
  } catch (error) {
    console.error('Error', error);
  }
}


async function readnews() {
  // console.log('go perigon api key:', goPerigonApiKey);
  base_url = 'https://api.goperigon.com/v1/all?apiKey=' + goPerigonApiKey+ '&from=2023-07-04&sourceGroup=top100&showNumResults=true&showReprints=false&excludeLabel=Non-news&excludeLabel=Opinion&excludeLabel=Paid News&excludeLabel=Roundup&excludeLabel=Press Release&sortBy=date&category=Health&size='+newsSize;

  subcategories_list = ['Nutrition','Research','Medication','Tech','Mental Health','Environment'];
  keysToKeep = ['pubDate','imageUrl','url','title'];
  for(let idx = 0; idx < subcategories_list.length; idx++){
    const subcategories = subcategories_list[idx];

    var called_url = base_url+'&q='+subcategories;
    console.log(called_url);

    const newList = await fetchNewsList(called_url);
    for (let idx = 0; idx < newList.articles.length; idx++){
      //after making 5 api calls, stop for 1.5 minutes
      if ((idx % 5) == 0){
        await delay(delayInMilliseconds);
      }
      element = newList.articles[idx];
      //calculate how long the article has been published according to current time and assign it to publishedTimeGap
      // element.publishedTimeGap = timeSince(element.pubDate);


      //summary content using cohere api and assign it to summary_new
      const newsSummary = await summarizeAsync(element.content, idx);

      if (newsSummary == undefined){
        element.summary_new = element.summary;
        console.log('news ', idx, ' is not summarized using AI');
      }
      else{
        element.summary_new = newsSummary;
        console.log('news ', idx , ' is summarized using AI');
      }

      for (const key of keysToKeep){
        if (!keysToKeep.includes(key)){
          delete element[key];
        }
      }

    }
    
    newsdao.updateNews("/articles/" + subcategories, newList.articles);
  }
}

module.exports = { readnews };

