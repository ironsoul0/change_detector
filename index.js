require('dotenv').config()

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const sendMail = require('./mail');

async function getInternships() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://careers.bloomberg.com/job/search?el=Internships');
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  
  const $ = cheerio.load(bodyHTML);
  const jobs = $('div[class=job-results-section]');

  let jobsList = [];

  jobs.each(function () {
    const name = $(this).find($('.job-results-name')).text(); 
    const city = $(this).find($('.job-results-city')).text(); 
    jobsList.push(`${name} - ${city}`);
  });
  
  return jobsList;
}

function checkDifference(current, initial) {
  if (initial.length === 0) {
    return;
  }

  const newEntries = [];
  current.forEach(function (internship) {
    if (!initial.includes(internship)) {
      newEntries.push(internship);
    }
  });

  if (newEntries.length) {
    sendMail(newEntries.join('\n'));
  }
}

(async function() {
  let initialContent = await getInternships();
  console.log('initialContent', initialContent);
  
  setInterval(function () {
    getInternships()
      .then(function (currentContent) {
        console.log('currentContent', currentContent);
        checkDifference(currentContent, initialContent);
        if (currentContent.length >= initialContent.length) {
          initialContent = [...currentContent]; 
        }
      }); 
  }, 1000 * 60 * 5);
})();
