const now = new Date();
var when = new Date();
var year;

const util = {
  capitalize: (v) => v[0].toUpperCase() + v.slice(1),
  fmt: function(v) {
    let nv = parseInt(v);
    if ( nv === 0 ) {
      return '00';
    } else if ( nv < 10 ) {
      return '0' + nv;
    } else {
      return v.toString();
    }
  },
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
      return new Array(end-start).fill(value||undefined, start, end);
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
  },

  equalArrays: function (l, r) {
    return l.length === r.length && l.every((x, i) => x === r[i]);
  }
};

const calendar = {
  MONTH_NAMES: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  QUARTERS: [[0, 1, 2], [3, 4, 5], [6, 7, 8], ['October', 'November', 'December']],
  WEEKDAY_NAMES: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  weekdayQueue: function(first){
    let f = first
    if ( first instanceof Date ) {
      f = first.getDay();
    }
    return [...calendar.WEEKDAY_NAMES.slice(f, 7), ...calendar.WEEKDAY_NAMES.slice(0, f)]
  },
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
        January: 31,
        0: 31,
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

  getDaysInYear: (year) => calendar.isLeapYear(year) ? 366 : 365,

  iterToDate: function*(year, month, date=366) {
    util.assertInstance(year, Number);
    util.assertInstance(month, Number);
    util.assertInstance(date, Number);

    for ( const mon of calendar.iterYearByMonth(year) ) {
      for ( const day of calendar.iterMonthByDay(mon.getFullYear(), mon.getMonth()) ) {
        if ( util.equalArrays(calendar.compBy(day, new Date(year, month, date)), [0, 0, 0]) ) {
          return day;
        }
        yield day
      }
    }
    return
  },

  iterHourByMinute: function*(year, month, date=1) {
    let minMin = (localStorage.getItem('first_minute') === 'now' ? when.getMinutes() : 0);
    let maxMin = 60 + (localStorage.getItem('first_minute') === 'now' ? when.getMinutes() : 0);
    for (let i=minMin; i < maxMin; i++) {
      yield new Date(year, month, date, i);
    }
  },

  iterDayByHour: function*(year, month, date=1, hour=0, initializedTo='midnight') {
    let initHour = new Date(year, month%12, date%31, hour%24);
    let minHr = (initializedTo === 'now' ? initHour.getHours() : 0);
    for (let i=minHr; i <= minHr + 24; i++) {
      yield [new Date(year, month, date, i), i == minHr];
    }
  },

  iterWeekByDay: function*(year, month, date=1, initializedTo='Sunday', wide=7) {
    util.assertInstance(year, Number);
    util.assertInstance(month, Number);
    util.assertInstance(date, Number);

    let firstDay = new Date(year, month%12, date%31);
    let minDay   = calendar.getAdjustedFirstDayOfWeek(firstDay, wide, initializedTo);
    let when, d  = minDay;
    for (let i = minDay; i < minDay+wide; i++) {
      when = new Date(year, month, i);
      yield [when, i == minDay];
    }
  },

  iterMonthByDay: function*(year, month, date=1) {
    util.assertInstance(year, Number);
    util.assertInstance(month, Number);
    util.assertInstance(date, Number);

    for (let i = date%31; i <= calendar.getDaysInMonth(year, month%12); i++) {
      yield new Date(year, month, i);
    }
  },

  iterYearByMonth: function*(year) {
    util.assertInstance(year, Number);

    for ( let i = 0; i < 12; i++ ) {
      yield new Date(year, i, 1);
    }
  },

  iterQuarterByMonth: function*(num, year) {
    util.assertInstance(num, Number);
    util.assertBounds(num, 1, 4);
    util.assertInstance(year, Number);

    let months = calendar.MONTH_NAMES.filter((e, i) => calendar.getQuarterNumber(i) == num);
    for ( let i = 0; i < months.length; i++ ) {
      yield new Date(year, calendar.MONTH_NAMES.indexOf(months[i]), 1);
    }
  },

  makeMonthArray: function(year, month, date=1) {
    let cols = 7, rows = 6, initArray = Array(rows).fill([]).map((x) => x = Array(cols).fill(0));
    let first = new Date(year, month, date%31);

    let row = 0;
    for ( const day of calendar.iterMonthByDay(year, month, date) ) {
      initArray[row][day.getDay()] = day;
      if ( day.getDay() == 6 ) { row++ }
    }

    if (!initArray[5].some((x) => x != 0)) {
      initArray.pop();
    }
    return initArray;
  },

  makeYearArray: function(year) {
    let initArray = Array(calendar.getDaysInYear(year)).fill(0);

    initArray[0] = new Date(year-1, 11, 31);
    for ( let m = 0; m < 12; m++ ){
      for ( let i = 1; i <= calendar.getDaysInMonth(year, m); i++) {
        let when = new Date(year, m, i);
        initArray[calendar.getDayOfYear(when)] = when;
      }
    }
    return initArray
  },

  getQuarterNumber: function(month) {
    util.assertInstance(month, [Number, Date]);

    let m = parseInt( month instanceof Date ? month.getMonth() : month ) % 12;
    return Math.ceil((m + 1)/ 3);
  },

  getAdjustedFirstDayOfWeek(date, size=7, adjustment='Sunday') {
    util.assertInstance(date, Date);
    util.assertInstance(size, Number);
    util.assertInstance(adjustment, String);

    if ( adjustment.toLowerCase() === 'today' ) {
      return date.getDate();
    }
    let i = calendar.WEEKDAY_NAMES.indexOf(util.capitalize(adjustment));
    console.log(i, size, date.getDate())

    if ( date.getDay() < i ) {
      return date.getDate()-(size-i);
    } else {
      return date.getDate()-(date.getDay()+i);
    }
  },

  getWeekNumber: function(date) {
    util.assertInstance(date, [Number, Date]);

    if ( calendar.getDayOfYear(date) < 7 && year[1].getDay() > 0 ) {
      return 1
    } else {
      return year.slice(1, calendar.getDayOfYear(date)+1).reduce((sum, d) => sum + (d.getDay() === 0 ? 1 : 0), 1);
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
      sum += calendar.getDaysInMonth(date.getFullYear(), i);
    }
    return sum
  },

  dateFromString: function (str) {
    let timestamp = Date.parse(str);

    if ( Number.isNaN(timestamp) ) {
      throw new Error(`Invalid date value ${str}.`);
    } else {
      return new Date(timestamp);
    }
  }
};

const db = {
  populateStorage: function(e) {
    let el = $(`#${e}`);
    localStorage.setItem(e, ( el.prop('tagName').toLowerCase() == 'select' ? el.children('option:selected').val() : el.val() ));
  },
  loadStorage: function(e) {
    $(`#${e}`).val(localStorage.getItem(e));
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
    $('#hour').text(util.fmt(when.getHours()));
    $('#minute').text(util.fmt(when.getMinutes()));
    $('#second').text(util.fmt(when.getSeconds()));

    $('.time').removeClass().addClass( `dark${util.fmt(when.getHours())}` );
    //$('body').removeClass().addClass( `dark${util.fmt(when.getHours())}` );
    if ( $('#display').val() == 'day' ) {
      if ( when.getMinutes() % 2 == 0 && !$('#follow').prop('disabled') && !$('#follow').prop('checked') ) {
        ui.shrinkHour(when);
      }
      $('.hour:first').prop('title', [util.fmt(when.getHours()), util.fmt(when.getMinutes())].join(':'));
    }
  },

  updateWeekDays: function(parent, when, abbrev=false) {
    util.assertInstance(when, Date);
    util.assertInstance(abbrev, Boolean);

    parent.empty();
    let wide = ( $('#display').val() === 'work' ? 5 : 7 );
    let sortedDays = calendar.weekdayQueue(calendar.getAdjustedFirstDayOfWeek(when, wide, localStorage.getItem('first_day'))%6);
    console.log(when, wide, calendar.getAdjustedFirstDayOfWeek(when, wide, localStorage.getItem('first_day'))%6, sortedDays);
    if ( $('#display').val() == 'work' ) {
      sortedDays = sortedDays.slice(0, 5)
    }
    sortedDays.forEach(function (v, i) {
      let wdnam = ( abbrev === true ? v.slice(0, 3) : v );
      parent.append(`<th class="row${i}">${wdnam}</th>`);
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

        if ( month[row][col] == 0 ) {
          cell.attr('data-year', calendar.prevMonth(date).getFullYear());
          cell.attr('data-month', calendar.prevMonth(date).getMonth().toString());
        } else {
          day = month[row][col];
          cell.addClass(calendar.compBy(day, now).every((x) => x == 0) ? 'today' : '');
          cell.attr('data-week', calendar.getWeekNumber(day));
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
    util.assertInstance(when, Date);

    $('#ui .container').empty();
    let rowi = 1, row, cell, tbl, cspan = null;
    switch (display) {
      case 'hour':
        $('#controls').empty();
        var ctrls = $('<th class="cell0">' +
          `  <input type="number" name="hour" id="hour" class="hour_field" min="0" max="24" value="${when.getHours()}" />` +
          '</th>')
        $('#controls').append(ctrls);
        $('#ui .weekdays').remove();
        let minMin = (localStorage.getItem('first_minute') === 'now' ? when.getMinutes() : 0), maxMin = 60 + (localStorage.getItem('first_minute') === 'now' ? when.getMinutes() : 0);
        for (let i=minMin; i < maxMin; i++) {
          let hr = ( when.getHours() + ( i > 60 ? 1 : 0 ) ) % 24;
          let time = `${util.fmt(hr)}:${util.fmt(i%60)}`;
          let el = $(`<tr class="row${i}">` +
          '  <td colspan="3" class="cell1 hour"' +
          `      data-year="${when.getFullYear()}"` +
          `      data-month="${when.getMonth()}"` +
          `      data-week="${calendar.getWeekNumber(when)}"` +
          `      data-date="${when.getDate()}"` +
          `      data-day="${when.getDay()}"` +
          `      data-day-of-year="${calendar.getDayOfYear(when)}"` +
          `      data-hour="${hr}"` +
          `      data-time="${time}"` +
          `    ><span class="time">${time}</span>` +
          '  </td>' +
          '</tr>');
          $('#ui .container').append(el);
        }
        $('#hr,#da,#mo,#fl').hide();
        $('#mn').show();
        break;
      case 'day':
        $('#controls').empty();
        var ctrls = $('<th class="cell0">' +
          `  <input type="number" name="day" id="date" class="day_field" min="1" max="${calendar.getDaysInMonth(when)}" value="${when.getDate()}" />` +
          '</th>')
        $('#controls').append(ctrls);
        $('#ui .weekdays').remove();
        for( const [hour, firstHour] of calendar.iterDayByHour(when.getFullYear(), when.getMonth(), when.getDate(), when.getHours(), localStorage.getItem('first_hour'))) {
          let time = [util.fmt(hour.getHours()), util.fmt( firstHour ? when.getMinutes() : '00' )].join(':');
          let el = $(`<tr class="row${hour.getHours()}">` +
          `  <td colspan="3" class="cell1 hour" ` +
          `      data-year="${hour.getFullYear()}"` +
          `      data-month="${hour.getMonth()}"` +
          `      data-week="${calendar.getWeekNumber(hour)}"` +
          `      data-date="${hour.getDate()}"` +
          `      data-day="${hour.getDay()}"` +
          `      data-day-of-year="${calendar.getDayOfYear(hour)}"` +
          `      data-hour="${hour.getHours()}"` +
          `      title="${time}"` +
          `      ><span class="dark${util.fmt(hour.getHours())}">${util.fmt(hour.getHours())}</span></td>` +
          `</tr>`)
          $('#ui .container').append(el);
        }
        $('#mn,#da,#mo').hide();
        $('#hr,#fl').show();
        $('#follow').prop('disabled', false);
        ui.shrinkHour(when, false);
        break;
      case 'week':
        $('#controls').empty();
        var ctrls = $('<th colspan="3" class="cell0">&nbsp;</th>' +
          '<th class="cell1">' +
          `  <input type="number" name="week" id="week" class="week_field" min="1" max="${calendar.getWeekNumber(new Date(when.getFullYear(), 11, 31))}" value="${calendar.getWeekNumber(when)}" />` +
          '</th>' +
          '<th colspan="3" class="cell2">&nbsp;</th>')
        $('#controls').append(ctrls);
        $('#ui .weekdays').remove();

        row = $('<tr class="days row1">');
        for ( const [day, firstDoW] of calendar.iterWeekByDay(when.getFullYear(), when.getMonth(), when.getDate(), localStorage.getItem('first_day'), 7) ){
          if ( firstDoW ) {
            dowRow = $(`<tr class="row3 weekdays">`);
            ui.updateWeekDays(dowRow, day, false);
            $('#ui thead').append(dowRow);
          }
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
        $('#mn,#hr,#mo').hide();
        $('#da,#fl').show();
        $('#ui .container').append(row);
        cspan = 7;
        break;
      case 'work':
        $('#controls').empty();
        $('#ui .weekdays').remove();
        var ctrls = $('<th colspan="3" class="cell0">&nbsp;</th>' +
          '<th class="cell1">' +
          `  <input type="number" name="week" id="week" class="week_field" min="1" max="${calendar.getWeekNumber(new Date(when.getFullYear(), 11, 31))}" value="${calendar.getWeekNumber(when)}" />` +
          '</th>' +
          '<th colspan="3" class="cell2">&nbsp;</th>')
        $('#controls').append(ctrls);
        row = $(`<tr class="row3 weekdays">`);
        ui.updateWeekDays(row, when, false);
        $('#ui thead').append(row);

        row = $('<tr class="days row1">');
        for ( const [day, firstDoW] of calendar.iterWeekByDay(when.getFullYear(), when.getMonth(), when.getDate(), 'Monday', 5) ){
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
        $('#mn,#hr,#mo').hide();
        $('#da,#fl').show();
        $('#ui .container').append(row);
        cspan = 3;
        break;
      case 'month':
        $('#controls').empty();
        var ctrls = $('' +
          '<th class="cell0" colspan="3">&nbsp;</th>' +
          '<th class="cell1">' +
          '  <select name="month" id="month" class="month_field">' +
          '  </select>' +
          `  <input name="year" id="year"    class="year_field"  type="number" min="1970" max="2035" value="${when.getFullYear()}" />` +
          '</th>' +
          '<th class="cell2" colspan="3">&nbsp;</th>')
        $('#controls').append(ctrls);
        if ( $('#month option').length == 0 ) {
          calendar.MONTH_NAMES.forEach((v, i) => $('#month').append(`<option value="${i}" ${( when.getMonth() === i ? 'selected="selected"' : '')}>${v}</option>`));
        }
        //$('#month').val(`${when.getFullYear()}-${when.getMonth()+1}`);
        ui.buildMonth($('#ui .container'), when);
        $('#ui .weekdays').remove();
        row = $(`<tr class="row3 weekdays">`);
        ui.updateWeekDays(row, when, false);
        $('#ui thead').append(row);
        $('#mn,#hr,#mo').hide();
        $('#da,#fl').show();
        cspan = 7;
        break;
      case 'quarter':
        row = $('<tr class="months row0" colspan="6">');
        $('#ui .weekdays').remove();
        $('#controls').empty();
        $('#controls').append('<th class="cell2 middle"><select name="quarter" class="quarter quarter_field"><option value="1">Q1</option><option value="2">Q2</option><option value="3">Q3</option><option value="4">Q4</option></select></th>');
        $('#controls select').val(calendar.getQuarterNumber(when.getMonth()));
        calendar.MONTH_NAMES.filter((e, i) => calendar.getQuarterNumber(i) === calendar.getQuarterNumber(when.getMonth())).forEach(function (v, i) {
          row.append(`<td class="cell${i}"><table cellpadding="0" cellspacing="0" border><caption>${v}</caption><thead><tr class="weekdays"><tbody class="months months${calendar.MONTH_NAMES.indexOf(v)}"><tfoot>`);
        });
        $('#ui .container').append(row);

        for ( const month of calendar.iterQuarterByMonth(calendar.getQuarterNumber(when), when.getFullYear())) {
          ui.buildMonth($(`#ui .months${month.getMonth()}`), month);
        }
        ui.updateWeekDays($('#ui .weekdays'), when, false);
        $('#mn,#hr').hide();
        $('#mo,#da,#fl').show();
        cspan = 5;
        break;
      case 'year':
        $('#controls').empty();
        $('#controls').append(`<th class="cell0" colspan="5"><input name="year" id="year" type="number" min="1970" max="2035" value="${when.getFullYear()}"></th>`);

        ui.loopy($('#ui .container'), 1, 5, (i) => `<tr class="row${i} quarter${i}"></tr>`);

        let j
        calendar.MONTH_NAMES.forEach(function (v, i) {
          j = $(`#ui .quarter${calendar.getQuarterNumber(i)}`).find('td').length + 1;
          $(`#ui .quarter${calendar.getQuarterNumber(i)}`).append(`<td class="cell${j}"><table cellpadding="0" cellspacing="0" border><caption><b>${v}</b></caption><thead><tr class="weekdays"></tr></thead><tbody class="month${i}"></tbody><tfoot></tfoot></table></td>`)
        });

        for ( const month of calendar.iterYearByMonth(when.getFullYear())) {
          ui.buildMonth($(`#ui .month${month.getMonth()}`), month);
        }
        ui.updateWeekDays($('#ui .weekdays'), when, true);
        $('#mn,#hr').hide();
        $('#mo,#da,#fl').show();
        cspan = 3;
        break;
      default:
        alert(`Unknown display type: "${display}".`)
        return
    }

    $('#ui > caption').text(util.capitalize(display));
    $('#ui .middle').attr('colspan', String(cspan)).attr('colspan', Number(cspan));
  },

  shrinkHour: function (when, allowReload=true) {
    util.assertInstance(when, Date);

    if ( when.getMinutes() === 59 && allowReload ) {
      window.location.reload();
    } else {
      $('.container .cell1:first').css('height', `${120-(when.getMinutes()*2)}px`);
    }

    if ( when.getMinutes() > 2 ) {
      $('.container .cell1:last').css('height', `${when.getMinutes()*2}px`);
    }
  },

  start: function() {
    Intl.supportedValuesOf('calendar').forEach(function (e) {
      let sel = (e == 'gregory') ? ' selected="selected"' : ' ';
      $('#kind').append(`<option value="${e}"${sel}>${util.capitalize(e)}</option>`);
    });
    Intl.supportedValuesOf('timeZone').forEach(function (e) {
      let sel = (e == 'America/Los_Angeles') ? ' selected="selected"' : '';
      $('#zone').append(`<option value="${e}"${sel}>${e}</option>`);
    });

    calendar.WEEKDAY_NAMES.forEach((d) => ui.options.week.options[d.toLowerCase()] = d);
    calendar.MONTH_NAMES.forEach((m)   => ui.options.year.options[m.toLowerCase()] = m);

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

    ui.storage_items.map(db.loadStorage);

    ui.build(localStorage.getItem('display'), when);
    setInterval(ui.updateDateTime, 100);

    console.log(`Loaded: ${now}.`);
  }
};

year = calendar.makeYearArray(now.getFullYear());
