var curDate = new Date();
var curYear = curDate.getFullYear();
var curMonth = curDate.getMonth();
var curDay = curDate.getDate()
var curWeek = curDate.getDay();

//月份天数表
var DAY_OF_MONTH = [
  [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
];


//判断当前年是否闰年
var isLeapYear = function(year) {
  if (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0))
    return 1
  else
    return 0
};

//获取当月有多少天
var getDayCount = function(year, month) {
  return DAY_OF_MONTH[isLeapYear(year)][month];
};

//获取当前索引下是几号
var getDay = function(index) {
  return index - curDayOffset;
};

var pageData = {
  date: "", //当前日期字符串
  arrIsShow: [], //是否显示此日期
  arrDays: [], //关于几号的信息
  arrPrice: [] //对应日期的价格数组
}


//刷新全部数据
var refreshPageData = function(year, month, day, week) {
  pageData.date = year + '年' + (month + 1) + '月' + day + '日'
  var offset = new Date(year, month, 1).getDay();
  for (var i = 0; i < 42; ++i) {
    pageData.arrIsShow[i] = i < offset || i >= getDayCount(year, month) + offset ? false : true;
    pageData.arrDays[i] = i - offset + 1;
  }
};

refreshPageData(curYear, curMonth, curDay, curWeek);

Page({

  /**
   * 页面的初始数据
   */
  data: {
    startPlace: [],
    region: '请选择出发地址',
    types: [{
        id: 1,
        name: 'a.商务车环耳海存完'
      },
      {
        id: 2,
        name: 'b.吉普车跟拍（间修）'
      },
      {
        id: 3,
        name: 'c.商务车（游船+扎玩）'
      }
    ],
    choice_two: 1,
    pageData,
    adult: 0, //成人票数
    child: 0, //儿童票数 
  },

  onLoad: function(options) {

  },

  // 选择出发地
  bindRegionChange: function(e) {
    console.log(e.detail.value)
    let address = e.detail.value
    this.setData({
      region: address[0] + '-' + address[1] + '-' + address[2]
    })
  },

  // 选择套餐类型


  // 上一个月
  lastMonth: function() {
    if (0 == curMonth) {
      curMonth = 11;
      --curYear
    } else {
      --curMonth;
    }
    refreshPageData(curYear, curMonth, 1, 0);
    this.setData({
      pageData: pageData
    })
  },

  // 下一个月
  nextMonth: function() {
    if (11 == curMonth) {
      curMonth = 0;
      ++curYear
    } else {
      ++curMonth;
    }
    refreshPageData(curYear, curMonth, 1, 0);
    this.setData({
      pageData: pageData
    })
  },


  // 成人票：
  toadd_one: function() {

  },

  tominus_one: function() {

  },


  // 儿童票
  toadd_two: function() {

  },
  tominus_two: function() {

  },



  toOrder: function() {
    wx.navigateTo({
      url: '/pages/index/goods/order/order',
    })
  },

  onShow: function() {

  },

  onPullDownRefresh: function() {

  },


  onReachBottom: function() {

  }
})