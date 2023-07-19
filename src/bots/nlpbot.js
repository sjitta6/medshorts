const request = require('request');
const newsdao = require('../dao/newsdao');
const util = require('util');
const axios = require('axios');
const cohere = require('cohere-ai');

const config = require ('../config/config.js');
const Jasypt = require ('jasypt');
const jasypt = new Jasypt();
jasypt.setPassword(process.env['urlpassword']);


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
    const response = await cohere.summarize({
      text: text,
      length:'auto',
      additional_command:'180-240 characters',
    });
    return response.body.summary;
  } catch (error){
    console.log('error producing summary', error);
    return '';
  }

};

module.exports =  summarizeAsync ;

