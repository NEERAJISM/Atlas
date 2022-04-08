import { Component } from '@angular/core';
import { AuthService, Constants, FirebaseUtil, Stats } from 'atlas-core';
import { AppService } from '../../../app.service';

@Component({
  selector: 'app-maindashboard',
  templateUrl: './maindashboard.component.html',
  styleUrls: ['./maindashboard.component.scss'],
})
export class MainDashboardComponent {
  chartOptions = {
    title: {
      text: '',
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

  chartLabels = [];
  viewsChartData = [{ data: [], label: 'Views' }];
  viewsChartColors = [{ backgroundColor: [] }];
  viewsChartOptions = JSON.parse(JSON.stringify(this.chartOptions));

  ordersChartData = [{ data: [], label: 'Orders' }];
  ordersChartColors = [{ backgroundColor: [] }];
  ordersChartOptions = JSON.parse(JSON.stringify(this.chartOptions));

  revenueChartData = [{ data: [], label: 'Revenue' }];
  revenueChartColors = [{ backgroundColor: [] }];
  revenueChartOptions = JSON.parse(JSON.stringify(this.chartOptions));

  bizId = '';
  stats: Stats = new Stats();

  constructor(private fbUtil: FirebaseUtil, private service: AppService, private auth: AuthService) {
    this.service.presentLoading();
    this.viewsChartOptions.title.text = 'Views per Day';
    this.ordersChartOptions.title.text = 'Orders per Day';
    this.revenueChartOptions.title.text = 'Revenue per Day';

    this.auth.afAuth.authState.subscribe((user) => {
      if (user) {
        this.bizId = user.uid;
        this.init();
      }
    });
  }

  init() {
    this.getTodaysStats();
    this.getRangeStats();
  }

  getTodaysStats() {
    this.fbUtil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + this.bizId + '/' + Constants.STATS)
      .doc(new Date().toLocaleDateString().split('/').reverse().join(''))
      .get().subscribe((doc) => {
        if (doc.exists) {
          Object.assign(this.stats, doc.data());
        }
        this.service.dismissLoading();
      });
  }

  getRangeStats() {
    this.fbUtil
      .getInstance()
      .collection(
        Constants.BUSINESS + '/' + this.bizId + '/' + Constants.STATS
        , (ref) => ref.orderBy('date', 'desc').limit(10)
      )
      .get()
      .forEach((res) =>
        res.forEach((data) => {
          if (data.data()) {
            const stats = new Stats();
            Object.assign(stats, data.data());
            this.chartLabels.unshift(this.getLabel(String(stats.date)));

            // views
            this.viewsChartData[0].data.unshift(stats.views);
            this.viewsChartColors[0].backgroundColor.push('rgba(0,188,212,0.4)');

            // orders
            this.ordersChartData[0].data.unshift(stats.orders);
            this.ordersChartColors[0].backgroundColor.push('rgba(255,0,0,0.4)');

            // revenue
            this.revenueChartData[0].data.unshift(stats.revenue);
            this.revenueChartColors[0].backgroundColor.push('rgba(76,175,79,0.6)');
          }
        })
      );
  }

  getLabel(x: string, short?: boolean) {
    return x.substring(6) + ' ' + this.month(x.substring(4, 6));
  }

  month(x: string) {
    switch (x) {
      case "01":
        return "Jan";
      case "02":
        return "Feb";
      case "03":
        return "Mar";
      case "04":
        return "Apr";
      case "05":
        return "May";
      case "06":
        return "Jun";
      case "07":
        return "Jul";
      case "08":
        return "Aug";
      case "09":
        return "Sep";
      case "10":
        return "Oct";
      case "11":
        return "Nov";
      default:
        return "Dec";
    }
  }
}
