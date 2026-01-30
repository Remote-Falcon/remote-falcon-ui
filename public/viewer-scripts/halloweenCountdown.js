function countdown() {
  let now = new Date();
  let year = now.getFullYear();
  let evenDate = new Date(year, 9, 31); // October 31

  // If Halloween has passed, count down to next year
  if (now > evenDate) {
    evenDate = new Date(year + 1, 9, 31);
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

  if(document.querySelector('#to-halloween-days') != null) {
    document.querySelector('#to-halloween-days').textContent = d;
  }
  if(document.querySelector('#to-halloween-hours') != null) {
    document.querySelector('#to-halloween-hours').textContent = h;
  }
  if(document.querySelector('#to-halloween-minutes') != null) {
    document.querySelector('#to-halloween-minutes').textContent = m;
  }
  if(document.querySelector('#to-halloween-seconds') != null) {
    document.querySelector('#to-halloween-seconds').textContent = s;
  }

  setTimeout(countdown, 1000)
};

countdown();
