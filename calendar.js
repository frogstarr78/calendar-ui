const now = new Date();
var when = new Date();

const util = {
  capitalize: (v) => v[0].toUpperCase() + v.slice(1),
  fmt: (v) => ( ( parseInt(v) < 10 ) ? `0${v}` : v ),
  assertInstance: function(o, typeOrTypes, msg=`Object ${o} is not type ${typeOrTypes}. It is type ${typeof typeOrTypes} instead.`) {
    if ( (Array.isArray(typeOrTypes) ? typeOrTypes : [typeOrTypes]).some((type) => ( o === undefined || ! o instanceof type )) ){
      throw new Error(msg);
    }
    return true;
  },
  assertBounds: function(v, min, max) {
    if ( v < min || v > max ) {
      throw new Error(msg);
    }
    return true;
  },
  range: function(start, end, value) {
    try{ 
      assertInstance(start, Number)
      assertInstance(end, Number)
    } catch {
      return new Array();
    }

    if ( end == start ) {
      return [start]
    } else if ( end > start ) {
      return new Array(end-start).fill(value||=undefined, start, end);
    }
  },

  copyDate: (d) => Object.assign(new Date, d),
  compNumbers: function (l, r) {
    util.assertInstance(l, Number);
    util.assertInstance(r, Number);

    if ( l < r )
      return -1

    if ( l === r )
      return 0

    if ( l > r )
      return 1
  }
};

const calendar = {
  MONTH_NAMES: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  QUARTERS: [[0, 1, 2], [3, 4, 5], [6, 7, 8], ['October', 'November', 'December']],
  WEEKDAY_NAMES: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  weekdayQueue: (first) => [...calendar.WEEKDAY_NAMES.slice(first, 7), ...calendar.WEEKDAY_NAMES.slice(0, first)],
  isLeapYear: function (year) {
    util.assertInstance(year, Number);

    let y = parseInt(year);
    return ( y % 100 == 0 && y % 400 == 0 ) || y % 4 == 0;
  },

  getDaysInMonth: function(dateOrYear, month) {
    if ( dateOrYear instanceof Date ) {
      return calendar.getDaysInMonth(dateOrYear.getFullYear(), dateOrYear.getMonth());
    } else {
      return {
        January: 30,
        0: 30,
        February: calendar.isLeapYear(dateOrYear) ? 29 : 28,
        1: calendar.isLeapYear(dateOrYear) ? 29 : 28,
        March: 31,
        2: 31,
        April: 30,
        3: 30,
        May: 31,  
        4: 31,  
        June: 30, 
        5: 30, 
        July: 31, 
        6: 31, 
        August: 31, 
        7: 31, 
        September: 30, 
        8: 30, 
        October: 31, 
        9: 31, 
        November: 30, 
        10: 30, 
        December: 31,
        11: 31
      }[month]
    }
  },

  week: function*(year, month, date=1) {
    util.assertInstance(year, Number);
    util.assertInstance(month, Number);
    util.assertInstance(date, Number);

    let firstDay = new Date(year, month%12, date%31);
    for (let i = (date%31)-firstDay.getDay(); i < ((date%31)-firstDay.getDay())+7; i++) {
      yield new Date(year, month, i);
    }
  },

  month: function*(year, month, date=1) {
    util.assertInstance(year, Number);
    util.assertInstance(month, Number);
    util.assertInstance(date, Number);

    for (let i = date%31; i <= calendar.getDaysInMonth(year, month%12); i++) {
      yield new Date(year, month, i);
    }
  },

  makeMonthArray: function(year, month, date=1) {
    let cols = 7, rows = 6, initArray = Array(rows).fill([]).map((x) => x = Array(cols).fill(0));
    let first = new Date(year, month, date%31);

    let row = 0;
    for ( const day of calendar.month(year, month, date) ) {
      initArray[row][day.getDay()] = day;
      if ( day.getDay() == 6 ) { row++ }
    }

    if (!initArray[5].some((x) => x != 0)) {
      initArray.pop();
    }
    return initArray;
  },

  getQuarterNumber: function(month) {
    util.assertInstance(month, [Number, Date]);

    let m = parseInt( month instanceof Date ? month.getMonth() : month ) % 12;
    return Math.ceil((m + 1)/ 3);
  },

  getWeekNumber: function(date) {
    util.assertInstance(date, [Number, Date]);

    let d = parseInt( date instanceof Date ? calendar.getDayOfYear(date) : date );
    return Math.ceil((d-1) / 7);
  },

  quarter: function*(num, year) {
    util.assertInstance(num, Number);
    util.assertBounds(num, 1, 4);
    util.assertInstance(year, Number);

    let months = calendar.MONTH_NAMES.filter((e, i) => calendar.getQuarterNumber(i) == num);
    for ( let i = 0; i < months.length; i++ ) {
      yield new Date(year, calendar.MONTH_NAMES.indexOf(months[i]), 1);
    }
  },

  year: function*(year) {
    util.assertInstance(year, Number);

    for ( let i = 0; i < 12; i++ ) {
      yield new Date(year, i, 1);
    }
  },

  compDates: function(l, r) {
    util.assertInstance(l, Date);
    util.assertInstance(r, Date);

    return util.compNumbers(l.getTime(), r.getTime());
  },

  compBy: function(l, r, by='date') {
    util.assertInstance(l, Date);
    util.assertInstance(r, Date);
    
    let byAttributes = ['year', 'month', 'date', 'quarter', 'hour', 'minute']
    if ( ! byAttributes.includes(by) ) {
      throw new Error(`The supplied by argument ${by} should be one of these values: ${byAttributes.join(', ')}.`);
    }

    switch (by) {
      case 'year':
      case 'years':
        return [util.compNumbers(l.getFullYear(), r.getFullYear())];
      case 'quarter':
      case 'quarters':
        throw new Error('Implement me!')
      case 'month':
      case 'months':
        return [...calendar.compBy(l, r, 'year'), util.compNumbers(l.getMonth(), r.getMonth())];
      case 'date':
      case 'dates':
        return [...calendar.compBy(l, r, 'month'), util.compNumbers(l.getDate(), r.getDate())];
      case 'hour':
      case 'hours':
        return [...calendar.compBy(l, r, 'date'), util.compNumbers(l.getHours(), r.getHours())];
      case 'minute':
      case 'minutes':
        return [...calendar.compBy(l, r, 'hour'), util.compNumbers(l.getMinutes(), r.getMinutes())];
      default:
    }
  },

  prevMonth: function(curr) {
    util.assertInstance(curr, Date);

    let present = util.copyDate(curr);
    present.setMonth(curr.getMonth()-1);
    return new Date(present.getTime());
  },

  nextMonth: function(curr) {
    util.assertInstance(curr, Date);

    let present = util.copyDate(curr);
    present.setMonth(curr.getMonth()+1);
    return new Date(present.getTime());
  },

  getDayOfYear: function(date) {
    util.assertInstance(date, Date);

    let sum = date.getDate();
    for ( let i = 0; i < date.getMonth(); i++ ) {
      sum += calendar.getDaysInMonth(date);
    }
    return sum
  }
};

const db = {
  populateStorage: function(e) {
    let el = $(`#${e}`);
    let val = ( el.prop('tagName').toLowerCase() == 'select' ) ? el.children('option:selected').val() : el.val();
    localStorage.setItem(e, val);
  },
  loadStorage: function(e) {
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
};

const ui = {
  element: $('#calendar'),
  storage_items: ['display', 'kind', 'zone', 'first_minute', 'first_hour', 'first_day', 'first_month', 'date'],
  options: {
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
  },

  updateDateTime: function() {
    when = new Date();
    $('input.year').val(parseInt(when.getFullYear()));
    $('input.day').val(util.fmt(parseInt(when.getDate())));

    $('#hour').text(util.fmt(when.getHours()));
    $('#minute').text(util.fmt(when.getMinutes()));
    $('#second').text(util.fmt(when.getSeconds()));
    
    $('.time').removeClass().addClass( `dark${util.fmt(when.getHours())}` );
    //$('body').removeClass().addClass( `dark${util.fmt(when.getHours())}` );
  },

  updateWeekDays: function(parent, abbrev=false) {
    util.assertInstance(abbrev, Boolean);

    parent.empty();
    let val = parent.find('.first').val();
    let sorted_days = calendar.weekdayQueue(val == 'week:today' ? now.getDay() : 0);
    if ( $('#display').val() == 'work' ) {
      sorted_days = sorted_days.slice(0, 5)
    }
    sorted_days.forEach(function (v, i) {
      parent.append(`<th id="row${i}">${( abbrev === true ) ? v.slice(0, 3) : v}</th>`);
    });
  },

  loopy: function(parent, init, limit, func) {
     for (let i=init; i < limit; i++) {
       parent.append(func(i));
     }
  },

  buildMonth: function(parent, date, abbrev) {
    let week, cell, day;
    let month = calendar.makeMonthArray(date.getFullYear(), date.getMonth(), 1);

    for ( let row = 0; row < month.length; row++ ) {
      week = $(`<tr class="row${row}">`);
      if ( month[row][0] != 0 ) {
        week.attr('data-year', month[row][0].getFullYear());
        week.attr('data-month', month[row][0].getMonth());
        week.attr('data-week', calendar.getWeekNumber(month[row][0]));
      }

      for ( let col = 0; col < month[row].length; col++ ) {
        cell = $(`<td class="cell${col} day">&nbsp;</td>`);
        cell.attr('data-week', calendar.getWeekNumber(date));

        if ( month[row][col] == 0 ) {
          cell.attr('data-year', calendar.prevMonth(date).getFullYear());
          cell.attr('data-month', calendar.prevMonth(date).getMonth().toString());
        } else {
          day = month[row][col];
          cell.addClass(calendar.compBy(day, now).every((x) => x == 0) ? 'today' : '');
          cell.attr('data-year', day.getFullYear());
          cell.attr('data-month', day.getMonth());
          cell.attr('data-day-of-year', calendar.getDayOfYear(day));
          cell.attr('data-day', day.getDay());
          cell.attr('data-date', day.getDate());
          cell.text(day.getDate().toString());
        }
        week.append(cell);
      }
      parent.append(week);
    }
  },

  build: function(display, when) {
    $('#ui .container').empty();
    let rowi = 1, row, cell, tbl, cspan = null;
    switch (display) {
      case 'hour':
        ui.loopy($('#ui .container'), 0, 60, (i) => `<tr class="row${i+1}"><td colspan="3" class="cell1 hour"><span class="time">${util.fmt(when.getHours())}:${util.fmt(i)}</span></td></tr>`);
        $('#hr_ctrl,#da_ctrl,#mo_ctrl').hide();
        break;
      case 'day':
        ui.loopy($('#ui .container'), 0, 24, (i) => `<tr class="row${i+1}"><td colspan="3" class="cell1 hour">${util.fmt(i)}</td></tr>`);
        $('#mn_ctrl,#da_ctrl,#mo_ctrl').hide();
        break;
      case 'week':
        $('#ui .weekdays').remove();
        row = $(`<tr class="row3 weekdays">`);
        ui.updateWeekDays(row, false);
        $('#ui thead').append(row);

        row = $('<tr class="days row1">');
        //ui.loopy(row, 1, 8, (i) => `<td class="cell${i} day">${util.fmt(i)}</td>`);
        for ( const day of calendar.week(when.getFullYear(), when.getMonth(), when.getDate()) ){
          let cell = $(`<td class="cell${day.getDay()} day">${util.fmt(day.getDate())}</td>`);
          cell.addClass(calendar.compBy(day, now).every((x) => x == 0) ? 'today' : '');
          cell.attr('data-year', day.getFullYear());
          cell.attr('data-month', day.getMonth());
          cell.attr('data-day', day.getDay());
          cell.attr('data-date', day.getDate());
          cell.attr('data-day-of-year', calendar.getDayOfYear(day));
          cell.attr('data-week', calendar.getWeekNumber(day));
          row.append(cell)
        }
        $('#mn_ctrl,#hr_ctrl,#mo_ctrl').hide();
        $('#ui .container').append(row);
        cspan = 5;
        break;
      case 'work':
        $('#controls').empty();
        row = $('<tr class="days row1">');
        ui.loopy(row, 1, 6, (i) => `<td class="cell${i} day">${util.fmt(i)}</td>`);
        $('#mn_ctrl,#hr_ctrl,#mo_ctrl').hide();
        $('#ui .container').append(row);
        cspan = 3;
        break;
      case 'month':
        $('#controls').empty();
        $('#controls').append('<th class="cell1"><input         name="year"  class="year year_field"   type="number" min="1970" max="2035"></th>');
        $('#controls').append('<th class="cell2 middle"><select name="month" class="month month_field" ></select></th>');
        $('#controls').append('<th class="cell3"><input         name="day"   class="day day_field"     type="number" min="1" max="31"></th>');
        calendar.MONTH_NAMES.forEach(function (v, i) {
          let sel = ( i == when.getMonth() ) ? ' selected="selected"' : '';
          $('select.month').append(`<option value="${i}"${sel}>${util.capitalize(v)}</option>`);
        });
        ui.buildMonth($('#ui .container'), when);
        $('#ui .weekdays').remove();
        row = $(`<tr class="row3 weekdays">`);
        ui.updateWeekDays(row, false);
        $('#ui thead').append(row);
        $('#mn_ctrl,#hr_ctrl,#mo_ctrl').hide();
        cspan = 5;
        break;
      case 'quarter':
        row = $('<tr class="months row0" colspan="6"><td class="cell0">');
        $('#mn_ctrl,#hr_ctrl').hide();
        $('#ui .weekdays').remove();
        $('#controls').empty();
        $('#controls').append('<th class="cell2 middle"><select name="quarter" class="quarter quarter_field"><option value="1">Q1</option><option value="2">Q2</option><option value="3">Q3</option><option value="4">Q4</option></select></th>');
        $('#controls select').val(calendar.getQuarterNumber(when.getMonth()));
        calendar.MONTH_NAMES.filter((e, i) => calendar.getQuarterNumber(i) === calendar.getQuarterNumber(when.getMonth())).forEach(function (v, i) {
          row.append(`<td class="cell${i+1}"><table cellpadding="0" cellspacing="0" border><caption>${v}</caption><thead><tr class="weekdays"><tbody class="months months${calendar.MONTH_NAMES.indexOf(v)}"><tfoot>`);
        });
        row.append(`<td class="cell4">`);
        $('#ui .container').append(row);

        for ( const month of calendar.quarter(calendar.getQuarterNumber(when), when.getFullYear())) {
          ui.buildMonth($(`#ui .months${month.getMonth()}`), month);
        }
        ui.updateWeekDays($('#ui .weekdays'), false);
        cspan = 6;
        break;
      case 'year':
        $('#controls').empty();
        $('#controls').append('<th class="cell0" colspan="5"><input         name="year"  class="year year_field"   type="number" min="1970" max="2035"></th>');

        ui.loopy($('#ui .container'), 1, 5, (i) => `<tr class="row${i} quarter${i}"><td class="cell1"></td></tr>`);
        $('#mn_ctrl,#hr_ctrl').hide();

        let j
        calendar.MONTH_NAMES.forEach(function (v, i) {
          j = $(`#ui .quarter${calendar.getQuarterNumber(i)}`).find('td').length + 1;
          $(`#ui .quarter${calendar.getQuarterNumber(i)}`).append(`<td class="cell${j}"><table cellpadding="0" cellspacing="0" border><caption><b>${v}</b></caption><thead><tr class="weekdays"></tr></thead><tbody class="month${i}"></tbody><tfoot></tfoot></table></td>`)
        });
        for ( let i = 1; i < 5; i++ ) {
          j = $(`#ui .quarter${i}`).find('td').length + 1;
          $(`#ui .quarter${i}`).append(`<td class="cell${j}">`); 
        }

        for ( const month of calendar.year(when.getFullYear())) {
          ui.buildMonth($(`#ui .month${month.getMonth()}`), month);
        }
        ui.updateWeekDays($('#ui .weekdays'), true);
        cspan = 3;
        break;
      default:
        alert(`Unknown display type: "${display}".`)
        return
    }

    $('#ui > caption').text(util.capitalize(display));
    $('#ui .middle').attr('colspan', String(cspan)).attr('colspan', Number(cspan));
  },

  load: function() {
    Intl.supportedValuesOf('calendar').forEach(function (e) {
      let sel = (e == 'gregory') ? ' selected="selected"' : ' ';
      $('#kind').append(`<option value="${e}"${sel}>${util.capitalize(e)}</option>`);
    });
    Intl.supportedValuesOf('timeZone').forEach(function (e) {
      let sel = (e == 'America/Los_Angeles') ? ' selected="selected"' : '';
      $('#zone').append(`<option value="${e}"${sel}>${e}</option>`);
    });

    Object.entries(ui.options).forEach(function ([key, opt]) {
      Object.entries(opt.options).forEach(function ([val, txt]) {
        let eid = `#first_${opt.first}`;
        if ( $(eid).find(`option[value="${val}"`).length == 0 ) {
          $(eid).append(`<option value="${val}">${txt}</option>`);
        }
      });
    });

    ui.storage_items.forEach(function (e) {
      (( ! localStorage.getItem(e) || localStorage.getItem(e) === 'undefined' ) ? db.populateStorage : db.loadStorage)(e);
    });

    Object.entries(ui.options).forEach(function ([key, val]) {
      $('#display').append(`<option value="${key}">${val.display}</option>`);
    });

    ui.storage_items.map(function (id) {
      $(`#${id}`).children('option').each(function (i, v) {
        $(v).prop('selected', ( $(v).val() != localStorage.getItem($(v).parent('select').attr('id')) ) ? null : 'selected');
      });
    });

    ui.build(localStorage.getItem('display'), when);

    console.log(`Loaded: ${now}.`);
  }
};

calendar.WEEKDAY_NAMES.forEach((d) => ui.options.week.options[d.toLowerCase()] = d);
calendar.MONTH_NAMES.forEach((m)   => ui.options.year.options[m.toLowerCase()] = m);
