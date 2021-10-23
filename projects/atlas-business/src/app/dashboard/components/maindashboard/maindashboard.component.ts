import { Component } from '@angular/core';
import { ChartType, ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';

@Component({
  selector: 'app-maindashboard',
  templateUrl: './maindashboard.component.html',
  styleUrls: ['./maindashboard.component.scss'],
})
export class MainDashboardComponent {
  chartOptions = {
    responsive: true,
    scales: {
      xAxes: [
        {
          gridLines: {
            display: false,
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            display: false,
          },
        },
      ],
    },
  };

  chartData = [
    { data: [330, 600, 260, 700], label: 'Account A' },
    { data: [120, 455, 100, 340], label: 'Account B' },
    { data: [45, 67, 800, 500], label: 'Account C' },
  ];

  chartLabels = ['January', 'February', 'March', 'April'];

  // order chart

  orderChartOptions = {
    title: {
      text: 'Order History',
      display: true
    },
    responsive: true,
    legend: { display: false },
    scales: {
      xAxes: [
        {
          gridLines: {
            display: false,
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            display: false,
          },
        },
      ],
    },
  };

  orderChartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  orderChartData = [
    { data: [10, 6, 12, 17, 8, 5, 7], label: 'Orders This Week' },
  ];

  public orderChartColors = [
    {
      backgroundColor: ['rgba(0,255,0,0.3)', 'rgba(0,255,0,0.3)', 'rgba(0,255,0,0.3)', 'rgba(0,255,0,0.3)', 'rgba(0,255,0,0.3)', 'rgba(0,255,0,0.3)', 'rgba(0,255,0,0.3)'],
    },
  ];


  // Pie
  public pieChartOptions: ChartOptions = {
    responsive: true,
    title: {
      text: 'Top 5 Products',
      display: true
    },
    legend: {
      position: 'bottom',
    }
  };

  public pieChartLabels: Label[] = ['Sodium Hypochlorite', 'Sulphuric Acid', 'Hydrochloric Acid', 'Sanitizer', 'Phenyl'];
  public pieChartData: number[] = [300, 500, 100, 400, 250];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartColors = [
    {
      backgroundColor: ['rgba(255,0,0,0.3)', 'rgba(0,255,0,0.3)', 'rgba(0,0,255,0.3)', 'rgba(0,255,255,0.3)', 'rgba(255,0,255,0.3)'],
    },
  ];

  onChartClick(event) {
    console.log(event);
  }





  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  addSlice() {
    this.pieChartLabels.push(['Line 1', 'Line 2', 'Line 3']);
    this.pieChartData.push(400);
    this.pieChartColors[0].backgroundColor.push('rgba(196,79,244,0.3)');
  }

  removeSlice() {
    this.pieChartLabels.pop();
    this.pieChartData.pop();
    this.pieChartColors[0].backgroundColor.pop();
  }

}
