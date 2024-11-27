var now        = new Date();

const util = {
  capitalize: (v) => v[0].toUpperCase() + v.slice(1),
  fmt: (v) => ( ( parseInt(v) < 10 ) ? `0${v}` : v ),
  assert: function(o, types, msg=`Object ${o} is not type ${types}.`) {
    if ( Array.isArray(types) ) {
      if ( types.some((type) => ( o === undefined || ! o instanceof type )) ){
        throw new Error(msg);
      }
    } else {
      let type = types
      if ( o === undefined || ! o instanceof type ) {
        throw new Error(msg);
      }
    }
    return true;
  },
  range: function(start, end, value) {
    try{ 
      assert(start, Number)
      assert(end, Number)
    } catch {
      return new Array();
    }

    if ( end == start ) {
      return [start]
    } else if ( end > start ) {
      return new Array(end-start).fill(value||=undefined, start, end);
    }
  }
};

const calendar = {
  MONTH_NAMES: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  WEEKDAY_NAMES: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  isLeapYear: function (year) {
    util.assert(year, Number);

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
        3: 31,
        April: 31,
        3: 31,
        May: 30,  
        4: 30,  
        June: 31, 
        5: 31, 
        July: 30, 
        6: 30, 
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

  nextOf: function*(curr, by='date') {
    util.assert(curr, Date);
    let byAttributes = ['year', 'quarter', 'month', 'week', 'date', 'hour', 'minute']
    if ( ! byAttributes.includes(by) ) {
      throw new Error(`The supplied "by" argument ${by} should be one of these values: ${byAttributes.join(', ')}.`);
    }

    let then = Object.assign(new Date, curr);

    switch (by) {
      case 'year':
        then.setYear(then.getYear()+1)
        yield then
      case 'quarter':
        throw new Error('Implement me');
      case 'month':
        then.setMonth(then.getMonth()+1)
        yield then
      case 'week':
        throw new Error('Implement me');
      case 'minute':
        then.setMinutes(then.getMinutes()+1)
        yield then
      case 'hour':
        then.setHours(then.getHours()+1)
        yield then
      default:
        then.getDate(then.getDate()+1)
        yield then
    }
  },

  nextMonth: function(curr) {
    util.assert(curr, Date);

    let then = Object.assign(new Date, curr);
    then.setMonth(curr.getMonth()+1)
    then.setDate(1);
    return then
  },

  next: function(curr, by='date') {
    util.assert(curr, Date);
    let byAttributes = ['year', 'quarter', 'month', 'week', 'date', 'hour', 'minute'];
    if ( ! byAttributes.includes(by) ) {
      throw new Error(`The supplied "by" argument ${by} should be one of these values: ${byAttributes.join(', ')}.`);
    }

    let then = Object.assign(new Date, curr);

    switch (by) {
      case 'year':
        then.setYear(curr.getYear()+1);
        return then
      case 'quarter':
        throw new Error('Implement me');
      case 'month':
        then.setMonth(curr.getMonth()+1);
        return then
      case 'week':
        throw new Error('Implement me');
      case 'minute':
        then.setMinutes(curr.getMinutes()+1);
        return then
      case 'hour':
        then.setHours(curr.getHours()+1);
        return then
      default:
        then.setDate(curr.getDate()+1);
        return then
    }
  },

  makeGenerator: function*(start = 0, end = Infinity, step = 1, by='day') {
    let byAttributes = ['year', 'month', 'date', 'quarter', 'hour', 'minute']
    if ( ! byAttributes.includes(by) ) {
      throw new Error(`The supplied "by" argument ${by} should be one of these values: ${byAttributes.join(', ')}.`);
    }
    for (let i = start; i < end; i += step) {
      yield i;
    }
  },

  comp: function(l, r) {
    util.assert(l, Date);
    util.assert(r, Date);

    if ( l.getTime() < r.getTime() ) {
      return -1
    } else if ( l.getTime() === r.getTime() ) { 
      return 0
    } else if ( l.getTime() > r.getTime() ) {
      return 1
    }
  },

  compBy: function(l, r, by='date') {
    util.assert(l, Date);
    util.assert(r, Date);
    
    let byAttributes = ['year', 'month', 'date', 'quarter', 'hour', 'minute']
    if ( ! byAttributes.includes(by) ) {
      throw new Error(`The supplied by argument ${by} should be one of these values: ${byAttributes.join(', ')}.`);
    }

    throw new Error('Implement me!')
    switch (by) {
      case 'year':
        break;
      default:
    }
  },
//  equivalentDates = function(ldate, rdate) {
//    return ldate.getFullYear() === rdate.getFullYear() && ldate.getMonth() === rdate.getMonth() && ldate.getDate() === rdate.getDate();
//  }

  quarter: function(month) {
    util.assert(month, Number);

    return Math.ceil(parseInt(month + 1) / 3);
  },

  getDayOfYear: function(date) {
    util.assert(date, Date);

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
    now = new Date();
    $('input.year').val(parseInt(now.getFullYear()));
    $('input.day').val(util.fmt(parseInt(now.getDate())));

    $('#hour').text(util.fmt(now.getHours()));
    $('#minute').text(util.fmt(now.getMinutes()));
    $('#second').text(util.fmt(now.getSeconds()));
    
    $('.time').removeClass().addClass( `dark${util.fmt(now.getHours())}` );
  },

  updateWeekDays: function(parent, abbrev) {
    parent.empty();
    let val = parent.find('.first').val();
    let first = ( val == 'week:today' ) ? now.getDay() : 0;
    let sorted_days = [...calendar.WEEKDAY_NAMES.slice(first, 7), ...calendar.WEEKDAY_NAMES.slice(0, first)];
    abbrev ??= false;
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
    ui.updateWeekDays(parent.find('.wdays'), abbrev);
    let rowi = 1, dow = 0;
    let row = parent.append(`<tr class="row${rowi}" data-week="${rowi}">`)
    let when = new Date(date.getFullYear(), date.getMonth(), 1);

    for (let i = 0; i < when.getDay(); i++) {
      row.append(`<td class="cell${i} day">&nbsp;</td>`);
      dow++
    }

    //for( let when = when, i=0 ; when < calendar.next(when, by='month'); calendar.next(when, by='date'), i++) {
    console.log(`next month ${calendar.nextMonth(when)}`);
    console.log(when);
    console.log(calendar.next(when, by='date'))
    for( i=0 ; i<=5; calendar.next(when, by='date') ) {
      console.log(when)
      i++
    }

    /*
    for( let when = theFirst, i=0 ; when < calendar.next(theFirst, by='month'); calendar.next(when, by='date'), i++) {
      let el = $(`<td class="day cell${i}">${util.fmt(when.getDate())}</td>`);
      el.addClass(when.getDate() == now.getDate() ? 'today' : '');
      el.data('year', when.getFullYear().toString());
      el.data('month', when.getMonth().toString());
      el.data('week', rowi.toString());
      el.data('day-of-year', calendar.getDayOfYear(when).toString());
      el.data('day', when.getDay().toString());
      el.data('date', when.getDate().toString());

      if ( when.getDay() == dow ) { 
        row.append(el);
        dow++
      }

      console.log(when)
      if ( when.getDay() == 0 ) {
        rowi++
        row = parent.append(`<tr class="row${rowi}" data-week="${rowi}">`)
        row.append(el);
        dow = 1;
      }
    }
    */

    /*
    for (let when = theFirst; when < theFirst.month.next(); when=when.next()) {
      if ( when.getDay() == dow ) { 
        row.append(`<td class="cell${i} day ${(when.getDate() == now.getDate()) ? ' today' : '' }" data-year="${when.getFullYear()}" data-month="${when.getMonth()}" data-week="${rowi}" data-day-of-year"${getDayOfYear(when.getFullYear(), when.getMonth(), when.getDate())}" data-day="${when.getDay()}" data-date="${when.getDate()}">${util.fmt(when.getDate())}</td>`);
        dow++
      }
      console.log(when)
      if ( when.getDay() == 0 ) {
        rowi++
        row = parent.append(`<tr class="row${rowi}" data-week="${rowi}">`)
        row.append(`<td class="cell${i} day ${(when.getDate() == now.getDate()) ? ' today' : '' }" data-year="${when.getFullYear()}" data-month="${when.getMonth()}" data-week="${rowi}" data-day-of-year"${getDayOfYear(when.getFullYear(), when.getMonth(), when.getDate())}" data-day="${when.getDay()}" data-date="${when.getDate()}">${util.fmt(when.getDate())}</td>`);
        dow = 1;
      }
    }
    */
  },

  loadUI: function(display, when) {
    $('#ui .container').empty();
    let rowi = 1, row, cell, tbl, cspan = null;
    switch (display) {
      case 'hour':
        loopy($('#ui .container'), 0, 60, (i) => `<tr class="row${i+1}"><td colspan="3" class="cell1 hour"><span class="time">${util.fmt(when.getHours())}:${util.fmt(i)}</span></td></tr>`);
        $('#hr_ctrl,#da_ctrl,#mo_ctrl').hide();
        break;
      case 'day':
        loopy($('#ui .container'), 0, 24, (i) => `<tr class="row${i+1}"><td colspan="3" class="cell1 hour">${util.fmt(i)}</td></tr>`);
        $('#mn_ctrl,#da_ctrl,#mo_ctrl').hide();
        break;
      case 'week':
        row = $('<tr class="days row1">');
        loopy(row, 1, 8, (i) => `<td class="cell${i} day">${util.fmt(i)}</td>`);
        $('#mn_ctrl,#hr_ctrl,#mo_ctrl').hide();
        $('#ui .container').append(row);
        cspan = 5;
        break;
      case 'work':
        row = $('<tr class="days row1">');
        loopy(row, 1, 6, (i) => `<td class="cell${i} day">${util.fmt(i)}</td>`);
        $('#mn_ctrl,#hr_ctrl,#mo_ctrl').hide();
        $('#ui .container').append(row);
        cspan = 3;
        break;
      case 'month':
        ui.buildMonth($('#ui .container'), when);
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

        ui.buildMonth($('#ui .days'), when);
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

        ui.buildMonth($('#ui .days'), when, true);
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
      ui.updateWeekDays($('#ui').find('.wdays'));
    }
    $('#ui caption').text(util.capitalize(display));
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

    //ui.loadUI('hour', now);
    //ui.loadUI('day', now);
    //ui.loadUI('week', now);
    //ui.loadUI('work', now);
    ui.loadUI('month', now);
    //ui.loadUI('quarter', now);
    //ui.loadUI('year', now);
    $('#month').empty();
    calendar.MONTH_NAMES.forEach(function (v, i) {
      let sel = ( i == now.getMonth() ) ? ' selected="selected"' : '';
      $('select.month').append(`<option value="${i}"${sel}>${util.capitalize(v)}</option>`);
    });

    console.log(`Loaded: ${now}.`);
  }
};

calendar.WEEKDAY_NAMES.forEach((d) => ui.options.week.options[d.toLowerCase()] = d);
calendar.MONTH_NAMES.forEach((m)   => ui.options.year.options[m.toLowerCase()] = m);
