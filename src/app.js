/* eslint-disable no-console */

const CronJob = require('cron').CronJob;
var cookieParser = require('cookie-parser');
// const summarizeAsync = require('./bots/nlpbot.js');

const cors = require("cors");

const newsDao = require('./dao/newsdao');
const newsbot = require('./bots/newsbot');
const nlpbot = require('./bots/nlpbot');

const axios = require('axios');

const config = require ('./config/config.js');
let authorizationurl = config.authorizationurl;
const Jasypt = require ('jasypt');
const jasypt = new Jasypt();
jasypt.setPassword(process.env['urlpassword']);
authorizationurl = jasypt.decrypt(authorizationurl);



process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const express = require('express');
const http = require('http')
const util = require("./utils/util");
const port = 8080;



const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());



newsDao.instantiate();

// text = 'WASHINGTON AP  The National Institutes of Health is beginning a handful of studies to test possible treatments for long COVID an anxiously awaited step in US efforts against the mysterious condition that afflicts millions Mondays announcement from the NIHs 115 billion RECOVER project comes amid frustration from patients whove struggled for months or even years with sometimesdisabling health problems  with no proven treatments and only a smattering of rigorous studies to test potential ones. This is a year or two late and smaller in scope than one would hope but nevertheless its a step in the right direction said Dr Ziyad AlAly of Washington University in St Louis who isnt involved with NIHs project but whose own research highlighted long COVIDs toll Getting answers is critical he added because theres a lot of people out there exploiting patients vulnerability with unproven therapies.Scientists dont yet know what causes long COVID the catchall term for about 200 widely varying symptoms Between 10 and 30 of people are estimated to have experienced some form of long COVID after recovering from a coronavirus infection a risk that has dropped somewhat since early in the pandemic.If I get 10 people I get 10 answers of what long COVID really is US Health and Human Services Secretary Xavier Becerra said';

// summarizeAsync(text,0);
// newsbot.readnews();


 new CronJob(
     "0 4 * * *",
    async function () {
        console.log("Running cron Job at "+ Date.now())
      //run every day at 4`o clock  in the morning
        await newsbot.readnews();
        // await webbot.scrape();
        // await nlpbot.summarize();

    },
    null,
    true,
    'America/Los_Angeles'
);

//authorize using usertoken
async function authorization(authorizationHeader){
    const token = authorizationHeader.split(' ')[1];
    // console.log(authorizationurl);
    // console.log(token);
   
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: authorizationurl,
        headers: { 
            'true-client-ip': '10.0.0.0', 
            'Accept': 'application/json', 
            'Content-Type': 'application/json', 
            'meta-transid': 'login-12345', 
            'userToken': token
        }
    };
    try{
        const response = await axios.request(config);
        return response;
      } catch (error) {
        console.log('authorization failed');
        return '';
    }
    
} 

//TODO:pass user token to headers to validate user
app.get('/fetchnews/',async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader && authorizationHeader == 'Bearer no account'){ //if not logged in,don't verify
        const returnData = await newsDao.getNews();
        console.log('nutrition news length:',returnData['Nutrition'].length);
        try {
            res.send(JSON.parse(JSON.stringify(returnData)));
        } catch (e) {
            res.status(500).send({"status": "get new from in-memory databse failed", "error": e})
        }   
    }
    else if (authorizationHeader && authorizationHeader.startsWith('Bearer ')){
        try{
            const authorizationRes =await authorization(authorizationHeader);
            if (authorizationRes == ''){
                res.status(401).send({"status": "authorization failed"});
            }
            else{
                const returnData = await newsDao.getNews();
                console.log('nutrition news length:',returnData['Nutrition'].length);
                try {
                    res.send(JSON.parse(JSON.stringify(returnData)));
                } catch (e) {
                    res.status(500).send({"status": "get new from in-memory databse failed", "error": e})
                }   
            }
            
        } catch (e){
            res.send({"status": "fetch news failed", "error": e});
        }
    } else{
        res.status(401).send('User token should be provided');
    }
});

app.get('/Health', function (req, res) {
    res.send({"success":true});
});


app.listen(port,"0.0.0.0", () => {
    console.log("MedShorts BE is started in "+port);
});

