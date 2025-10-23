function countdown() {
  let now = new Date();
  let evenDate = new Date(2025, 11, 25);

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

  if(document.querySelector('#to-christmas-days') != null) {
    document.querySelector('#to-christmas-days').textContent = d;
  }
  if(document.querySelector('#to-christmas-hours') != null) {
    document.querySelector('#to-christmas-hours').textContent = h;
  }
  if(document.querySelector('#to-christmas-minutes') != null) {
    document.querySelector('#to-christmas-minutes').textContent = m;
  }
  if(document.querySelector('#to-christmas-seconds') != null) {
    document.querySelector('#to-christmas-seconds').textContent = s;
  }

  setTimeout(countdown, 1000)
};

countdown();