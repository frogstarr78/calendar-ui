function Year(y) {
  if ( ! y instanceof Number ) {
    throw new Error(`Supplied year argument: ${y} should be a number but isn't.`);
  }
  this.year = y
}
Year.prototype.next = function () { return new Year(this.year+1) }
Year.prototype.prev = function () { return new Year(this.year-1) }
Year.prototype.isLeapYear = function () {
  return ( this.year % 100 == 0 && this.year % 400 == 0 ) || this.year % 4 == 0
}
Year.prototype.toDate = function (m, d) {
  return new Date(this.year, m||1, d||1);
}
Year.prototype.equal = function (other) {
  if ( other instanceof Date ) {
    return this.year == other.getFullYear();
  } else {
    return this.year == other.year;
  }
}
Year.prototype.fromDate = function (date) {
  if ( ! date instanceof Date ) {
    throw new Error(`Supplied date argument: ${date} should be a date but isn't.`);
  }
  return new Year(date.getFullYear());
}

function Month(y, m) {
  this.year  = new Year(y)
  if ( ! m instanceof Number ) {
    throw new Error(`Supplied month argument: ${m} should be a number but isn't.`);
  }
  this.month = m
  this.MAP = {
      January: 0,
      February: 31,
      March: this.year.isLeapYear() ? 29 : 28,
      April: 31,
      May: 30,  
      June: 31, 
      July: 30, 
      August: 31, 
      September: 30, 
      October: 31, 
      November: 30, 
      December: 31
  };
  this.name = Month.MONTH_NAMES[this.m];
}
Month.prototype.prev = function () {
  return ( this.month == 0 ) ? new Month(this.year-1, 11) : new Month(this.year, this.month-1);
}
Month.prototype.next = function () {
  return ( this.month == 11 ) ? new Month(this.year+1, 1) : new Month(this.year, this.month+1);
}
Month.prototype.daysInMonth = function () {
  return Object.entries(this.MAP)[this.month][1];
}
Month.MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
Month.prototype.toDate = function (d) {
  return new Date(this.year, this.month, d||1);
}
Month.prototype.equal = function (other) {
  if ( other instanceof Date ) {
    return this.year == other.getFullYear() && this.month == other.getMonth();
  } else {
    return this.year == other.year && this.month == other.month;
  }
}
Month.prototype.fromDate = function (date) {
  if ( ! date instanceof Date ) {
    throw new Error(`Supplied date argument: ${date} should be a date but isn't.`);
  }
  return new Month(date.getFullYear(), date.getMonth());
}
Month.prototype.quarter = function() { return Math.ceil((this.month + 1) / 3); }

function Day(y, m, d) {
  this.year  = new Year(y)
  this.month = new Month(y, m)
  if ( ! d instanceof Number ) {
    throw new Error(`Supplied date argument: ${d} should be a number but isn't.`);
  }
  this.day   = d
  this.weekday = new Date(this.year, this.month, this.day).getDay();
}
Day.prototype.dayOfYear = function() {
  let sum = deight;
  for ( let i = 0; i < month; i++ ) {
    sum += this.month.daysInMonth(i);
  }
  return sum
}
Day.WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
Day.prototype.prev = function () {
  if ( this.month == 0 && this.day == 1 ) {
    return new Day(this.year-1, 12, 31);
  } else if ( this.day == this.month.daysInMonth() ) {
    return new Day(this.year, this.month-1, new Month(this.year, this.month-1).daysInMonth());
  } else {
    return new Day(this.year, this.month, this.day - 1);
  }
}
Day.prototype.prevMonth = function () {
  return new Month(this.year, this.month).prev();
}
Day.prototype.next = function () {
  if ( this.month == 11 && this.day == 31 ) {
    return new Day(this.year+1, 1, 1);
  } else if ( this.day == this.month.daysInMonth() ) {
    return new Day(this.year, this.month+1, 1);
  } else {
    return new Day(this.year, this.month, this.day + 1);
  }
}
Day.prototype.nextMonth = function () {
  return new Month(this.year, this.month).next()
}
Day.prototype.toDate = function () {
  return new Date(this.year, this.month, this.day);
}
Day.prototype.equal = function (other) {
  if ( other instanceof Date ) {
    return this.year == other.getFullYear() && this.month == other.getMonth() && this.day == other.getDate();
  } else {
    return this.year == other.year && this.month == other.month && this.day == other.day;
  }
}
Day.prototype.getDay = function () {
  return this.toDate().getDay();
}
Day.fromDate = function (date) {
  if ( ! date instanceof Date ) {
    throw new Error(`Supplied date argument: ${date} should be a date but isn't.`);
  }
  return new Day(date.getFullYear(), date.getMonth(), date.getDate());
}

const calendar = $('#calendar');
const storage_items = ['display', 'kind', 'zone', 'first_minute', 'first_hour', 'first_day', 'first_month', 'date'];
const options = {
  hour: {
    display: 'Hour',
    first: 'minute',
    options: {
      'top': 'Top of the hour',
      'now': 'Now'
    }
  },
  day: {
    display: 'Day',
    first: 'hour',
    options: {
      'midnight': 'Midnight',
      'now': 'Current'
    }
  },
  week: {
    display: 'Week',
    first: 'day',
    options: {
      'today': 'Today',
    }
  },
  work: {
    display: 'Work Week',
    first: 'day',
    options: {
      'today': 'Today',
    }
  },
  month: {
    display: 'Month',
    first: 'day',
    options: {
      'today': 'Today',
    }
  },
  quarter: {
    display: 'Quarter',
    first: 'month',
    options: {
      'first': 'First',
      'last': 'Last'
    }
  },
  year: {
    display: 'Year',
    first: 'month',
    options: {
      'quarter': 'Quarter', 
      'current': 'Current'
    }
  }
};
Day.WEEKDAY_NAMES.forEach((d)   => options.week.options[d.toLowerCase()] = d);
Month.MONTH_NAMES.forEach((m) => options.year.options[m.toLowerCase()] = m);
var now        = new Date();

function capitalize(v){ return v[0].toUpperCase() + v.slice(1);    }
function fmt(v) {       return ( parseInt(v) < 10 ) ? `0${v}` : v; }

function updateDateTime() {
  now = new Date();
  $('input.year').val(parseInt(now.getFullYear()));
  $('input.day').val(fmt(parseInt(now.getDate())));

  $('#hour').text(fmt(now.getHours()));
  $('#minute').text(fmt(now.getMinutes()));
  $('#second').text(fmt(now.getSeconds()));
  
  $('.time').removeClass().addClass( `dark${fmt(now.getHours())}` );
}

storage_items.forEach(function (v) {
  $(`#${v}`).on('blur', function () {
    populateStorage($(this).attr('id'));
  });
});

function updateWDays(parent, abbrev) {
  parent.empty();
  let val = parent.find('.first').val();
  let first = ( val == 'week:today' ) ? now.getDay() : 0;
  let sorted_days = [...Day.WEEKDAY_NAMES.slice(first, 7), ...Day.WEEKDAY_NAMES.slice(0, first)];
  abbrev ??= false;
  if ( $('#display').val() == 'work' ) {
    sorted_days = sorted_days.slice(0, 5)
  }
  sorted_days.forEach(function (v, i) {
    parent.append(`<th id="row${i}">${( abbrev === true ) ? v.slice(0, 3) : v}</th>`);
  });
}
function populateStorage(e) {
  let el = $(`#${e}`);
  let val = ( el.prop('tagName').toLowerCase() == 'select' ) ? el.children('option:selected').val() : el.val();
  localStorage.setItem(e, val);
}
function loadStorage(e) {
  let el = $(`#${e}`);
  if ( el.prop('tagName').toLowerCase() == 'select' ) {
    val = localStorage.getItem(e);
    el.each(function (i, v) {
      $(v).prop('selected', ( $(v).val() != val ) ? null : 'selected');
    });
  } else {
    el.val(localStorage.getItem(e));
  }
}

function loopy(parent, init, limit, func) {
   for (let i=init; i < limit; i++) {
     parent.append(func(i));
   }
}

function buildMonth(parent, year, month, abbrev) {
  updateWDays(parent.find('.wdays'), abbrev);
  let rowi = 1, dow = 0;
  let row = parent.append(`<tr class="row${rowi}" data-week="${rowi}">`)
  let theFirst = new Day(year, month, 1);

  for (let i = 0; i < theFirst.getDay(); i++) {
    row.append(`<td class="cell${i} day">&nbsp;</td>`);
    dow++
  }
  for (let when = theFirst; when < theFirst.nextMonth(); when=when.next()) {
    if ( when.getDay() == dow ) { 
      row.append(`<td class="cell${i} day ${(when.getDate() == now.getDate()) ? ' today' : '' }" data-year="${when.getFullYear()}" data-month="${when.getMonth()}" data-week="${rowi}" data-day-of-year"${dayOfYear(when.getFullYear(), when.getMonth(), when.getDate())}" data-day="${when.getDay()}" data-date="${when.getDate()}">${fmt(when.getDate())}</td>`);
      dow++
    }
    console.log(when)
    if ( when.getDay() == 0 ) {
      rowi++
      row = parent.append(`<tr class="row${rowi}" data-week="${rowi}">`)
      row.append(`<td class="cell${i} day ${(when.getDate() == now.getDate()) ? ' today' : '' }" data-year="${when.getFullYear()}" data-month="${when.getMonth()}" data-week="${rowi}" data-day-of-year"${dayOfYear(when.getFullYear(), when.getMonth(), when.getDate())}" data-day="${when.getDay()}" data-date="${when.getDate()}">${fmt(when.getDate())}</td>`);
      dow = 1;
    }
  }
}

function loadUI(display, when) {
  $('#ui .container').empty();
  let rowi = 1, row, cell, tbl, cspan = null;
  switch (display) {
    case 'hour':
      loopy($('#ui .container'), 0, 60, (i) => `<tr class="row${i+1}"><td colspan="3" class="cell1 hour"><span class="time">${fmt(when.getHours())}:${fmt(i)}</span></td></tr>`);
      $('#hr_ctrl,#da_ctrl,#mo_ctrl').hide();
      break;
    case 'day':
      loopy($('#ui .container'), 0, 24, (i) => `<tr class="row${i+1}"><td colspan="3" class="cell1 hour">${fmt(i)}</td></tr>`);
      $('#mn_ctrl,#da_ctrl,#mo_ctrl').hide();
      break;
    case 'week':
      row = $('<tr class="days row1">');
      loopy(row, 1, 8, (i) => `<td class="cell${i} day">${fmt(i)}</td>`);
      $('#mn_ctrl,#hr_ctrl,#mo_ctrl').hide();
      $('#ui .container').append(row);
      cspan = 5;
      break;
    case 'work':
      row = $('<tr class="days row1">');
      loopy(row, 1, 6, (i) => `<td class="cell${i} day">${fmt(i)}</td>`);
      $('#mn_ctrl,#hr_ctrl,#mo_ctrl').hide();
      $('#ui .container').append(row);
      cspan = 3;
      break;
    case 'month':
      buildMonth($('#ui .container'), when.getFullYear(), when.getMonth());
      $('#mn_ctrl,#hr_ctrl,#mo_ctrl').hide();
      cspan = 5;
      break;
    case 'quarter':
      row = $('<tr class="months row1"><td class="cell0"></td></tr>');
      $('#mn_ctrl,#hr_ctrl').hide();
      months.filter((e, i) => quarterFromMonth(i) === quarterFromMonth(when.getMonth())).forEach(function (v, i) {
        cell = row.append(`<td class="cell${i++}">`); 
        tbl  = cell.append('<table cellpadding="0" cellspacing="0" border>');
        tbl.append(`<caption>${v}</caption>`);
        tbl.append('<thead><tr class="wdays">');
        tbl.append('<tbody class="days">');
        tbl.append('<tfoot>');
      });
      row.append(`<td class="cell${months.length}">`);
      $('#ui .container').append(row);

      buildMonth($('#ui .days'), when.getFullYear(), when.getMonth());
      cspan = 6;
      break;
    case 'year':
      loopy($('#ui .container'), 1, 5, (i) => `<tr class="row${i} quarter${i}"><td class="cell1"></td></tr>`);
      $('#mn_ctrl,#hr_ctrl').hide();
      let j
      months.forEach(function (v, i) {
        j = $(`#ui .quarter${quarterFromMonth(i)}`).find('td').length + 1;
        $(`#ui .quarter${quarterFromMonth(i)}`).append(`<td class="cell${j}"><table cellpadding="0" cellspacing="0" border><caption>${v}</caption><thead><tr class="wdays"></tr></thead><tbody class="days"></tbody><tfoot></tfoot></table></td>`)
      });
      for ( let i = 1; i < 5; i++ ) {
        j = $(`#ui .quarter${i}`).find('td').length + 1;
        $(`#ui .quarter${i}`).append(`<td class="cell${j}">`); 
      }

      buildMonth($('#ui .days'), when.getFullYear(), when.getMonth(), true);
      cspan = 3;
      break;
    default:
      alert(`Unknown display type: "${display}".`)
      return
  }

  if ( ['week', 'work', 'month', 'quarter'].includes(display) ) {
    $('#ui thead').append(`<tr class="row3 ${( display == 'quarter' ) ? 'month' : 'wdays'}">`);
  }

  if ( ['week', 'work', 'month'].includes(display) ) {
    updateWDays($('#ui').find('.wdays'));
  }
  $('#ui caption').text(capitalize(display));
  $('#ui .middle').attr('colspan', String(cspan)).attr('colspan', Number(cspan));
}

$('#prev').on('click', function() {
  switch($('#display').val()) {
    case 'month':
      let curr_month = new Date(Date.parse($('#date').val()));
      let prev_month = new Date(curr_month.getFullYear(), curr_month.getMonth()-1, 1);
      $('#container').empty(); 
      console.log($('#display').children('option:selected').val());
      console.log(`prev ${prev_month}`);
      $('#ui').find('.wdays').remove();
      $('#date').val(prev_month.toISOString().split('T')[0]);
      localStorage.setItem('date', prev_month.toISOString().split('T')[0]);
      loadUI($('#display').children('option:selected').val(), prev_month);
      break;
    default:
      console.log('Unknown');
  }
});

$('#next').on('click', function() {
  switch($('#display').val()) {
    case 'month':
      let curr_month = new Date(Date.parse($('#date').val()));
      let next_month = new Date(curr_month.getFullYear(), curr_month.getMonth()+1, 1);
      $('#container').empty(); 
      console.log($('#display').children('option:selected').val());
      console.log(`next ${next_month}`);
      $('#ui').find('.wdays').remove();
      $('#date').val(next_month.toISOString().split('T')[0]);
      localStorage.setItem('date', next_month.toISOString().split('T')[0]);
      loadUI($('#display').children('option:selected').val(), next_month);
      break;
    default:
      console.log('Unknown');
  }
});

function load() {
  Intl.supportedValuesOf('calendar').forEach(function (e) {
    let sel = (e == 'gregory') ? ' selected="selected"' : ' ';
    $('#kind').append(`<option value="${e}"${sel}>${capitalize(e)}</option>`);
  });
  Intl.supportedValuesOf('timeZone').forEach(function (e) {
    let sel = (e == 'America/Los_Angeles') ? ' selected="selected"' : '';
    $('#zone').append(`<option value="${e}"${sel}>${e}</option>`);
  });

  Object.entries(options).forEach(function ([key, opt]) {
    Object.entries(opt.options).forEach(function ([val, txt]) {
      let eid = `#first_${opt.first}`;
      if ( $(eid).find(`option[value="${val}"`).length == 0 ) {
        $(eid).append(`<option value="${val}">${txt}</option>`);
      }
    });
  });

  storage_items.forEach(function (e) {
    let db = ( ! localStorage.getItem(e) || localStorage.getItem(e) === 'undefined' ) ? populateStorage : loadStorage;
    db(e);
  });

  Object.entries(options).forEach(function ([key, val]) {
    $('#display').append(`<option value="${key}">${val.display}</option>`);
  });

  storage_items.map(function (id) {
    $(`#${id}`).children('option').each(function (i, v) {
      $(v).prop('selected', ( $(v).val() != localStorage.getItem($(v).parent('select').attr('id')) ) ? null : 'selected');
    });
  });

  //loadUI('hour', now);
  //loadUI('day', now);
  //loadUI('week', now);
  //loadUI('work', now);
  loadUI('month', now);
  //loadUI('quarter', now);
  //loadUI('year', now);
  $('#month').empty();
  Month.MONTH_NAMES.forEach(function (v, i) {
    let sel = ( i == now.getMonth() ) ? ' selected="selected"' : '';
    $('select.month').append(`<option value="${i}"${sel}>${capitalize(v)}</option>`);
  });

  console.log(`Loaded: ${now}.`);
}
