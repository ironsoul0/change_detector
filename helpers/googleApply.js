const axios = require('axios');

const API = 'https://careers.google.com/api/jobs/jobs-v1/search/?category=SOFTWARE_ENGINEERING&degree=BACHELORS&employment_type=INTERN';
const DETAILED_API = 'https://careers.google.com/api/jobs/jobs-v1/jobs/get/?job_name=';
const REDIRECT_URI = 'https://careers.google.com/jobs/results/';

const extractID = (job_id) => {
  const index = job_id.indexOf('/');
  return job_id.substr(index + 1);
}

async function getInternshipDetails(internship) {
  const jobID = internship.job_id;
  const requestUrl = DETAILED_API + jobID;
  const currentPageContent = await axios.get(requestUrl);
  const jobDetails = currentPageContent.data;
  const exactID = extractID(jobID);

  if (jobDetails.apply_url) {
    return `${internship.job_title} - ${REDIRECT_URI + exactID}`;
  } else {
    return ``;
  }
}

async function getInternships() {
  let currentPage = 1, found = true, internships = [];

  while (found) {
    const currentPageContent = await axios.get(`${API}&page=${currentPage}`);
    const jobs = currentPageContent.data.jobs;
    if (!jobs) {
      found = false;
    } else {
      internships = [...internships.concat(jobs)];
    }
    currentPage++;
  }

  const promisesList = [];
  for (const internship of internships) {
    if (internship.job_title.includes('2018') || internship.job_title.includes('2019')) {
      continue;
    }
    if (!internship.job_id || internship.location.includes('USA')) {
      continue;
    }
    if (internship.location.includes('London') || internship.job_title.includes('STEP')) {
      promisesList.push(getInternshipDetails(internship));
    }
  }

  let finalInternhips = await Promise.all(promisesList);
  finalInternhips = finalInternhips.filter(internship => internship.length > 0);

  return finalInternhips;
}

module.exports = getInternships;