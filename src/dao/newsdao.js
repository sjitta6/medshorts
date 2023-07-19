
const JsonDB = require('node-json-db').JsonDB;
const Config = require('node-json-db/dist/lib/JsonDBConfig').Config;

const db = new JsonDB(new Config('../etcm_cm_newsapp_be/src/db/newsdb', true, false, '/'));

function instantiate() {
  db.resetData({});
  let news = {};
  news["TotalResults"]  = 0;
  news["articles"]= {
    "Tech":[],
    "Medication":[],
    "Research":[],
    "Mental Health":[],
    "Nutrition":[],
    "Environment":[]};

  db.push('/', news, true);
}

function getNews() {
  return db.getData("/articles/");
}

function updateNews(path, data) {
  db.push(path, data, true);
}

module.exports = { instantiate, updateNews, getNews };