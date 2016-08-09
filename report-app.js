var utils = {
  uppercase: function(str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
  },

  chartOptions: function(reportType) {
    return  {
      legend: 'none',
      pointSize: 2,
      hAxis: {
        title: 'Date',
        format: 'MM/dd/yy'
      },
      vAxis: {
        title: this.uppercase(reportType)
      }
    }
  }
};

var ReportModel = Backbone.Model.extend({});

var ReportCollection = Backbone.Collection.extend({
  model: ReportModel,
  url: 'report-data.json'
});

var ReportChartView = Backbone.View.extend({
    events: {
      'change #select': 'renderChart'
    },

    initialize: function() {
      _.bindAll(this, 'render', 'renderChart');
      this.collection = new ReportCollection();
    },

    renderSelect: function() {
      var types = {
        sales: 'Overall sales',
        orders: 'Overall orders',
        pageViews: 'Page views',
        clickThruRate: 'Page rec clickthru rate'
      };

      var $select = $('<select name="select" id="select" />');

      $.each(types, function(v,i) {
        var $option = $('<option />').attr('value', v).text(types[v]);
        $select.append($option);
      });

      return $select;
    },

    renderMain: function() {
      return $('<div />').attr('id', 'linechart').css({
        'width': '600px',
        'height': '300px'
      });
    },

    render:function () {
      var $finalView = $('<div />');
      var $mainView = this.renderMain();
      var $selectView = this.renderSelect();

      $(this.el).html($finalView.append($selectView).append($mainView));
      google.load('visualization', '1', {'callback':this.renderChart, 'packages':['linechart']});
      return this;
    },

    renderChart:function () {
      var self = this;
      var reportType = this.$('#select').val() || 'sales';
      this.collection.fetch().done(function() {
        var records = self.collection.toJSON()[0].records
        var data = records.map(function(obj) {
          return [
            new Date(obj.date),
            obj[reportType]
          ];
        });

        var options = utils.chartOptions(reportType);
        var report = new google.visualization.DataTable();
        report.addColumn('date', 'Date');
        report.addColumn('number', utils.uppercase(reportType));
        report.addRows(data);

        var chart = new google.visualization.LineChart(self.$('#linechart').get(0));
        chart.draw(report, options);
      });
    }

});

var AppRouter = Backbone.Router.extend({
  routes:{
    "":"chart"
  },
  chart:function () {
    var $chartContainer = $('#chart-container');
    $chartContainer.append(new ReportChartView().render().el);
  }
});

router = new AppRouter();
Backbone.history.start();