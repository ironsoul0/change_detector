const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

async function getInternships() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

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
  
  await browser.close();
  
  return jobsList;
}

module.exports = getInternships;