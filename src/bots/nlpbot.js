const request = require('request');
const newsdao = require('../dao/newsdao');
const util = require('util');
const axios = require('axios');
const cohere = require('cohere-ai');

const config = require ('../config/config.js');
const Jasypt = require ('jasypt');
const { response } = require('express');
const jasypt = new Jasypt();
jasypt.setPassword(process.env['urlpassword']);
const delayInMilliseconds = 60000;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function truncateString(input_text, maxlength){
  if (input_text.length > maxlength){
    return input_text.substring(0, maxlength);
  }
  return input_text;
}
async function summarizeAsync(text, news_idx) {
  //call nlp tool and summarize the entire content from webbot
  //Use different api key due to free api key rate limit(5 calls/minute at most)
  if (0 <= news_idx < 5){
    cohere.init(jasypt.decrypt(config.nlpApiKey6));
  }
  else if (5 <= news_idx < 10){
    cohere.init(jasypt.decrypt(config.nlpApiKey1));
  }
  else if (10 <= news_idx < 15){
    cohere.init(jasypt.decrypt(config.nlpApiKey2));
  }
  else if (15 <= news_idx < 20){
    cohere.init(jasypt.decrypt(config.nlpApiKey3));
  }
  else if (20 <= news_idx < 25){
    cohere.init(jasypt.decrypt(config.nlpApiKey4));
  }
  else {
    cohere.init(jasypt.decrypt(config.nlpApiKey5));
  }

  try{
    var response = await cohere.summarize({
      text: text,
      length:'short',
      additional_command:'at most 180 characters',
    });
    iter_cnt = 0;
    while (response.body.summary.length > 190 && iter_cnt < 3){
      iter_cnt += 1;
      await delay(delayInMilliseconds);
      response = await cohere.summarize({
        text: truncateString(text, 190)+'a'.repeat(312),
        length:'short',
        temperature:0.7,
        additional_command:'make it shorter',
      });
    } 
    return response.body.summary;
  } catch (error){
    return '';
  }

};

module.exports =  summarizeAsync ;

