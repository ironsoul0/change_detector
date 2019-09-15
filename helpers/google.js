const axios = require('axios');

const API = 'https://careers.google.com/api/jobs/jobs-v1/search/?category=SOFTWARE_ENGINEERING&degree=BACHELORS&employment_type=INTERN';

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

  const stableList = [];
  for (const internship of internships) {
    if (!internship.job_title.includes('2018') && !internship.job_title.includes('2019')) {
      stableList.push(`${internship.job_title} - ${internship.location}`);
    }
  }

  return stableList;
}

module.exports = getInternships;