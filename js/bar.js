var barChartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [{
        label: 'Dataset 1',
        backgroundColor: window.chartColors.red,
        stack: 'Stack 0',
        
        data: [
            10,20,30,45,20,30
        ]
    }, {
        label: 'Dataset 2',
        backgroundColor: window.chartColors.blue,
        stack: 'Stack 1',
        data: [
            20,15,15,30,51,30
        ]
    }, {
        
    }]

};

    var ctx = document.getElementById('BarChart').getContext('2d');
    window.myBar = new Chart(ctx, {
        type: 'bar',
        data: barChartData,
        options: {
            title: {
                display: true,
                text: 'Chart.js Bar Chart - Stacked'
            },
            tooltips: {
                mode: 'index',
                intersect: false
            },
            responsive: true,
            scales: {
                xAxes: [{
                    stacked: true,
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }
    });
