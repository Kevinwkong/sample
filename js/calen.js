var CalendarEvents = [
  {
    title: 'Got salary'+'135000'+'php',
    start: '2020-10-15'
  },
  {
    title: 'Got salary'+'150000'+'php',
    start: '2020-10-30'
  },
  {
    title: 'Got salary'+'165000'+'php',
    start: '2020-11-15'
  },
  {
    title: 'Got salary'+'180000'+'php',
    start: '2020-11-30'
  }
]

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
      height: 550,
      initialView: 'dayGridMonth',
      initialDate: '2020-10-07',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: CalendarEvents
    });
    
    calendar.render();


  });


