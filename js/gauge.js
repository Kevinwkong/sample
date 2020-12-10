var gaugeChartData = {
        labels: ['Over Budget','' ,'','Savings Goal'],
        datasets: [{
            label: 'Cash inflow',
            lineTension: 0,
            data: [25, 25, 25, 25],
            needleValue: 27,
            backgroundColor: [
                '#FF5733',
                '#FF9333',
                '#FFCE33',
                '#339CFF'
            ],
            borderColor: [
                '#FF5733',
                '#FF9333',
                '#FFCE33',
                '#339CFF'
            ],
            borderWidth: 1,
           
        }]
    }


var ctx = document.getElementById('gaugeChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'doughnut',
    plugins: [{
        
    afterDraw: chart => {
      var needleValue = chart.chart.config.data.datasets[0].needleValue;
      var dataTotal = chart.chart.config.data.datasets[0].data.reduce((a, b) => a + b, 0);
      var angle = Math.PI + (1 / dataTotal * needleValue * Math.PI);
      var ctx = chart.chart.ctx;
      var cw = chart.chart.canvas.offsetWidth;
      var ch = chart.chart.canvas.offsetHeight;
      var cx = cw / 2;
      var cy = ch - 6;

      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(ch - 20, 0);
      ctx.lineTo(0, 3);
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fill();
      ctx.rotate(-angle);
      ctx.translate(-cx, -cy);
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    
  }],
    data: gaugeChartData,
    options: {
        circumference: Math.PI,
        rotation: -Math.PI,
        elements: {
                    point:{
                        radius: 0
                    }
                },
        scales: {
            yAxes: [{
                display: false,
                ticks: {
                    
                   
                }
            }]
        }
    }
});