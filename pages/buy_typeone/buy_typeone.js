const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

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

var pageData = {
  date: '', //当前日期字符串,
  time: '', //当前的年，月
  arrIsShow: [], //是否显示此日期
  arrDays: [] //关于几号的信息
}


//刷新全部数据
var refreshPageData = function(year, month, day, week) {
  pageData.date = year + '年' + (month + 1) + '月' + day + '日'
  pageData.time = year + '-' + (month + 1)
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
    id: '', //商品ID
    //套餐
    types: [],
    choice: null,
    //出发地
    startPlace: [],
    region: '请选择出发地址',

    // 价格日历
    pageData,
    priceList: [],
    choice_day: '', //默认选择日

    // 票数
    adult: 0,
    child: 0,
    //合计价格
    total: '0.00',
  },

  onLoad: function(options) {
    let data = JSON.parse(options.data)
    console.log(data)
    this.setData({
      id: data.id,
      types: data.tao
    })
    this.getMonthPrice()
  },

  // 获取月份
  getMonthPrice: function() {
    let that = this
    let data = {
      id: that.data.id,
      calendar: that.data.pageData.time
    }
    let url = app.globalData.api + '/portal/home/get_details_info'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode) {
        if (res.data.status == 1) {
          let list = res.data.data.calendar
          let ishowList = that.data.pageData.arrIsShow
          let news = []
          for (let i = 0; i < ishowList.length; i++) {
            if (ishowList[i] == true) {
              news.push(list[0].price)
              list.shift();
            } else {
              news.push("");
            }
          }
          that.setData({
            priceList: news
          })
          that.getToday()
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 获取今日的下标
  getToday: function() {
    let daylist = this.data.pageData.arrDays
    for (let i = 0; i < daylist.length; i++) {
      if (daylist[i] == curDay) {
        this.setData({
          choice_day: i
        })
      }
    }
  },

  // 选择日期
  selectDay: function(e) {
    let index = e.currentTarget.dataset.dayIndex
    let choice = this.data.choice_day
    if (choice != index) {
      this.setData({
        choice_day: index
      })
    }

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
  toChoices: function(e) {
    let item = e.currentTarget.dataset.item
    console.log(item)
    this.setData({
      choice: item.id,
      total: parseFloat(item.setmeal_price) + parseFloat(this.data.price)
    })
  },

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
    this.getMonthPrice()
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
    this.getMonthPrice()
  },


  // 成人票：
  toTicket_one_minu: function() {
    let num = this.data.adult;
    // 商品总数量-1
    if (num > 0) {
      this.data.adult--;
    }
    // 将数值与状态写回  
    this.setData({
      adult: this.data.adult
    });
  },

  toTicket_one_add: function() {
    let num = this.data.adult;
    // 总数量-1  
    if (num < 1000) {
      this.data.adult++;
    }
    // 将数值与状态写回  
    this.setData({
      adult: this.data.adult
    });
  },

  // 儿童票
  toTicket_two_minu: function() {
    let num = this.data.child;
    // 商品总数量-1
    if (num > 0) {
      this.data.child--;
    }
    // 将数值与状态写回  
    this.setData({
      child: this.data.child
    });
  },

  toTicket_two_add: function() {
    let num = this.data.child;
    // 总数量-1  
    if (num < 1000) {
      this.data.child++;
    }
    // 将数值与状态写回  
    this.setData({
      child: this.data.child
    });
  },

  // toOrder: function() {
  //   wx.navigateTo({
  //     url: '/pages/index/goods/order/order',
  //   })
  // },


})