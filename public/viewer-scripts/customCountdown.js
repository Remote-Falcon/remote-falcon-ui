function customCountdown() {
  let container = document.querySelector('#custom-countdown');
  if (container == null) {
    return;
  }

  let targetValue = container.getAttribute('data-target');
  if (targetValue == null) {
    return;
  }

  let now = new Date();
  let evenDate;

  // Check if it's a time-only format (HH:MM or HH:MM:SS)
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(targetValue)) {
    // Daily recurring time
    let timeParts = targetValue.split(':');
    let hours = parseInt(timeParts[0], 10);
    let minutes = parseInt(timeParts[1], 10);
    let seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

    evenDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);

    // If the time has passed today, set it for tomorrow
    if (now >= evenDate) {
      evenDate.setDate(evenDate.getDate() + 1);
    }
  } else {
    // Specific date/time format
    evenDate = new Date(targetValue);

    // If invalid date, exit
    if (isNaN(evenDate.getTime())) {
      return;
    }
  }

  let actualTime = now.getTime();
  let eventTime = evenDate.getTime();
  let remTime = eventTime - actualTime;

  // If the target has passed (for non-recurring), show zeros
  if (remTime < 0) {
    remTime = 0;
  }

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

  if (document.querySelector('#custom-countdown-days') != null) {
    document.querySelector('#custom-countdown-days').textContent = d;
  }
  if (document.querySelector('#custom-countdown-hours') != null) {
    document.querySelector('#custom-countdown-hours').textContent = h;
  }
  if (document.querySelector('#custom-countdown-minutes') != null) {
    document.querySelector('#custom-countdown-minutes').textContent = m;
  }
  if (document.querySelector('#custom-countdown-seconds') != null) {
    document.querySelector('#custom-countdown-seconds').textContent = s;
  }

  setTimeout(customCountdown, 1000);
}

customCountdown();
