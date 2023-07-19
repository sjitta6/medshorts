const moment = require('moment');
require('moment-timezone');

function timeSince(timeStamp) {
    const parsedTime = moment(timeStamp).utc();
    const currentTime = moment().utc();
    const secondsPast = currentTime.diff(parsedTime, 'seconds');
    if(secondsPast < 0){
        console.log(secondsPast);
    }
    if(secondsPast < 60){
        return secondsPast + ' seconds ago';
    }
    if(secondsPast < 3600){
        return parseInt(secondsPast/60) + ' mins ago';
    }
    if(secondsPast <= 86400){
        return parseInt(secondsPast/3600) + ' hours ago';
    }
    if(secondsPast <= 2628000){
        return parseInt(secondsPast/86400) + ' days ago';
    }
    if(secondsPast <= 31536000){
        return parseInt(secondsPast/2628000) + ' months ago';
    }
    if(secondsPast > 31536000){
        return parseInt(secondsPast/31536000) + ' years ago';
    }
}

module.exports = timeSince;
