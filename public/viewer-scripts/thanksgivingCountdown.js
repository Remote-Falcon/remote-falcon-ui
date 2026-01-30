function countdown() {
  let now = new Date();
  let year = now.getFullYear();

  // Thanksgiving is the 4th Thursday of November
  let evenDate = getThanksgiving(year);

  // If Thanksgiving has passed, count down to next year
  if (now > evenDate) {
    evenDate = getThanksgiving(year + 1);
  }

  let actualTime = now.getTime();
  let eventTime = evenDate.getTime();
  let remTime = eventTime - actualTime;

  let s = Math.floor(remTime / 1000);
  let m = Math.floor(s / 60);
  let h = Math.floor(m / 60);
  let d = Math.floor(h / 24);

  h %= 24;
  m %= 60;
  s %= 60;

  h = h < 10 ? '0' + h : h;
  m = m < 10 ? '0' + m : m;
  s = s < 10 ? '0' + s : s;

  if(document.querySelector('#to-thanksgiving-days') != null) {
    document.querySelector('#to-thanksgiving-days').textContent = d;
  }
  if(document.querySelector('#to-thanksgiving-hours') != null) {
    document.querySelector('#to-thanksgiving-hours').textContent = h;
  }
  if(document.querySelector('#to-thanksgiving-minutes') != null) {
    document.querySelector('#to-thanksgiving-minutes').textContent = m;
  }
  if(document.querySelector('#to-thanksgiving-seconds') != null) {
    document.querySelector('#to-thanksgiving-seconds').textContent = s;
  }

  setTimeout(countdown, 1000)
};

// Calculate the 4th Thursday of November for a given year
function getThanksgiving(year) {
  // Start with November 1st
  let november = new Date(year, 10, 1);
  // Find the first Thursday (day 4)
  let dayOfWeek = november.getDay();
  let firstThursday = 1 + ((4 - dayOfWeek + 7) % 7);
  // 4th Thursday is 3 weeks later
  let fourthThursday = firstThursday + 21;
  return new Date(year, 10, fourthThursday);
}

countdown();
