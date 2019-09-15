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

function checkDifference(current, initial) {
  if (initial.length === 0) {
    return [];
  }

  const newEntries = [];
  current.forEach(function (internship) {
    if (!initial.includes(internship)) {
      newEntries.push(internship);
    }
  });

  return newEntries;
}

async function notifyUsers(newEntries, bot, db) {
  const messageContent = 'Bloomberg! ❤️\n\n' + newEntries.join('\n');
  const allUsers = await db.getAllUsers();
  for (const user of allUsers) {
    bot.sendMessage(user.chat_id, messageContent);
  }
}

async function bloombergProcess(bot, db) {
  let initialContent = await getInternships();
  console.log('initialContent', initialContent);
  
  setInterval(function () {
    getInternships()
      .then(function (currentContent) {
        console.log('currentContent', currentContent);
        
        const newEntries = checkDifference(currentContent, initialContent);
        if (newEntries.length > 0) {
          notifyUsers(newEntries, bot, db);
        }

        if (currentContent.length >= initialContent.length) {
          initialContent = [...currentContent]; 
        }
      });
  }, 1000 * 60 * 2);
}

//module.exports = notifyUsers;
module.exports = bloombergProcess;