const moment = require('moment');
const textract = require('textract');
const FileType = require('file-type');
const extract = require('@gmr-fms/word-extractor');

const ALLOWED_LANGUAGES = ['ua' , 'ru' , 'eng'];
const PRICE_PER_SYMBOL = {
    ua: 0.05,
    ru: 0.05,
    eng: 0.12 
}; // grn
const MIN_PRICE = {
    ua: 50,
    ru: 50,
    eng: 120 
}; // grn
const MIME_TYPES = ['doc', 'docx', 'rtf']; // else + 20% price

// monday - friday; 10.00 -19.00 Kyiv timezone
const SYMBOLS_PER_HOUR =  {
    ua:1333,
    ru:1333,
    eng: 333 
};

function price(lang, symbolsAmount, mime) {
    let amount = symbolsAmount * PRICE_PER_SYMBOL[lang];
    if(MIME_TYPES.indexOf(mime) < 0 ) { amount += amount*0.2; }
    if(amount < MIN_PRICE[lang]) { amount = MIN_PRICE[lang]; }
    return +amount.toFixed(2);
};

function requiredTime(lang, symbolsAmount) {
    let time = 0.5 + symbolsAmount/SYMBOLS_PER_HOUR[lang];
    if(time < 1) time = 1; // set min time

    return time.toFixed(1)*60;
}

function roundTime(mins){
    return mins%30 === 0 ? mins : mins + (30 - mins % 30);
}

function estimateDeadline(timeMin) {
    const now = moment().utcOffset(3);
    const currentDay = now.day();
    const currentHour = now.hours();
    const currentMinutes = now.minutes();
    let deadline = now.clone();
    let requiredDays = Math.floor(timeMin / (9*60)); // int; 9-working hours
    let remainMinutes = Math.ceil(timeMin % (9*60));

    if(currentDay == 6) requiredDays+=2;
    if(currentDay == 0) requiredDays+=1;

    if(currentDay > 0 && currentDay < 6) {
        if(currentHour < 10 ) {
            deadline = now.startOf('day').add(10*60 + roundTime(remainMinutes), 'minutes');
        } else if( currentHour <19) {
            let approxFinish = currentHour*60 + currentMinutes + remainMinutes;
            if(approxFinish >19*60) {
                requiredDays++;
                remainMinutes = approxFinish -19*60;
                deadline = now.startOf('day').add( 10 *60+ roundTime(remainMinutes), 'minutes');
            } else {
                deadline = now.add(roundTime(remainMinutes), 'minutes');
            }
        } else {
            requiredDays++;
            deadline = now.startOf('day').add(10*60 + roundTime(remainMinutes), 'minutes');
        }
        if(currentDay + requiredDays > 5) requiredDays +=2; // weekdays
    } else {
        deadline = now.startOf('day').add(10*60 + roundTime(remainMinutes), 'minutes');
    }

    deadline.add(requiredDays, 'days');
    return deadline;
}

async function estimate(fileBuffer, lang, fileName) {
    if(ALLOWED_LANGUAGES.indexOf(lang) < 0 ) { 
        throw new Error('Unsupported language.')
     }

    const fileExt =  await FileType.fromBuffer(fileBuffer);
    let extension = '';
    let fileContext = '';
    if(!fileExt){
        throw new Error('Unknown file type.');
    }
    if(fileExt.ext ==='cfb') {
        if( fileName.split('.').pop() !== 'doc') {
            throw new Error('Unknown file type.');
        }
        extension = 'doc';

        fileContext = await extract.fromBuffer(fileBuffer).then(doc => {
            return doc.getBody();
          }).catch(err => { throw err; });
    } else {
        extension = fileExt.ext;
        fileContext = await new Promise( (resolve, reject) => {
            textract.fromBufferWithName(`sample.${extension}`, fileBuffer, {}, function( error, text ) {
                if(error) { 
                    console.log(error);
                    reject('Unknown file type.')
                }
                resolve(text); 
            });
        });
    }

    const symbolsAmount = fileContext.length;

    const cost = price(lang, symbolsAmount, extension);
    let time = Math.ceil(requiredTime(lang, symbolsAmount));
    const deadline = estimateDeadline(time).toString();

    return {
        cost,
        deadline,
    }
}

module.exports = estimate;
