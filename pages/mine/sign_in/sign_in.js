const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
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

//获取当前索引下是几号
var getDay = function(index) {
  return index - curDayOffset;
};

var pageData = {
  date: "", //当前日期字符串
  arrIsShow: [], //是否显示此日期
  arrDays: [], //关于几号的信息
  arrSign: [] //对应日期的签到状态数组
}


//刷新全部数据
var refreshPageData = function(year, month, day, week) {
  pageData.date = (month + 1) + '月'
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
    sign: [],
    user: [],
    integral: '0',
    pageData,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('日历：', this.data.pageData)
    // this.getintegral()
  },

  // 获取签到情况
  getintegral: function() {
    let that = this
    let url = app.globalData.api + '/portal/Sign/info'
    request.sendRequest(url, 'post', {}, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            sign: res.data.data.sign,
            user: res.data.data.user,
            integral: res.data.data.user.integral
          })
          let data = new Date()
          let time = data.getFullYear() + '-' + (data.getMonth() + 1) + '-' + data.getDate()
          console.log(time)
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  toSign: function() {
    // let that = this
    // let time = curYear + '-' + 
    // console.log(time)
    // console.log(1111)
  },

  toIntegral: function() {
    // console.log('积分明细')
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






  onShow: function() {

  },








})