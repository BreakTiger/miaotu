const request = require('../../../utils/http.js')
import modals from '../../../utils/modal.js'
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
  year: '', //年
  month: '', //月
  days: '', //日
  date: "", //当前日期字符串
  arrIsShow: [], //是否显示此日期
  arrDays: [], //关于几号的信息
  arrSign: [] //对应日期的签到状态数组
}


//刷新全部数据
var refreshPageData = function(year, month, day, week) {
  pageData.year = year
  pageData.month = month + 1
  pageData.days = day
  pageData.date = year + '-' + (month + 1) + '-' + day
  var offset = new Date(year, month, 1).getDay();
  for (var i = 0; i < 42; ++i) {
    pageData.arrIsShow[i] = i < offset || i >= getDayCount(year, month) + offset ? false : true;
    pageData.arrDays[i] = i - offset + 1;
  }
};

refreshPageData(curYear, curMonth, curDay, curWeek);

Page({

  data: {
    sign: [],
    user: [],
    integral: '0',
    signType: true,
    pageData,
    showList: [],
    card: '',
    page: 1,
    leftList: [],
    rightList: []
  },

  onLoad: function(options) {
    this.getintegral()
  },

  // 获取签到情况
  getintegral: function() {
    let that = this
    let url = app.globalData.api + '/portal/Sign/info'
    request.sendRequest(url, 'post', {}, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      // console.log(res.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            sign: res.data.data.sign,
            user: res.data.data.user,
            integral: res.data.data.user.integral
          })
          let data = new Date()
          let time = data.getFullYear() + '-' + (data.getMonth() + 1) + '-' + data.getDate()
          // console.log('今日时间：', time)
          let end = res.data.data.user.end_time
          // console.log('最近的签到时间：', end)
          // 判断签到状态
          if (end == '0-0-0') {
            that.setData({
              signType: true
            })
          } else if (end != time) {
            that.setData({
              signType: true
            })
          } else {
            that.setData({
              signType: false
            })
          }
          let months = data.getFullYear() + '-' + (data.getMonth() + 1)
          that.calendar(months)
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 每月的签到日历数据
  calendar: function(e) {
    let that = this
    let data = {
      month: e
    }
    let url = app.globalData.api + '/portal/Sign/get_sign'
    // console.log('参数：', data)
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      // console.log(res.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data
          that.trim(list)
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 整理
  trim: function(list) {
    // console.log('签到记录：', list)
    let that = this
    let year = that.data.pageData.year
    // console.log('年：', year)
    let month = that.data.pageData.month
    // console.log('月份:', month)
    let ishowList = that.data.pageData.arrIsShow
    // console.log('展示：', ishowList)
    let daylist = that.data.pageData.arrDays

    let list_one = [] //月+日
    for (let i = 0; i < ishowList.length; i++) {
      if (ishowList[i] == true) {
        list_one.push(year + '-' + month + '-' + daylist[i])
      } else {
        list_one.push('')
      }
    }
    // console.log('月+日：', list_one)

    let list_two = [] //签到
    for (let i = 0; i < list.length; i++) {
      list_two.push(list[i].time)
    }
    // console.log('签到：', list_two)

    let list_three = [] //签到日期所在的下标
    for (let i = 0; i < list_one.length; i++) {
      let item_one = list_one[i]
      for (let j = 0; j < list_two.length; j++) {
        let item_two = list_two[j]
        if (item_one == item_two) {
          list_three.push(i)
        }
      }
    }
    // console.log('签到日期所在的下标:', list_three)

    let showList = [] //签到显示
    for (let i = 0; i < 42; i++) {
      showList.push(false)
    }
    console.log(showList)

    for (let i = 0; i < list_three.length; i++) {
      let item_three = list_three[i]
      // console.log(item_three)
      showList.splice(item_three, 1, true)
    }
    // console.log(showList)
    that.setData({
      showList: showList
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
    let months = curYear + '-' + (curMonth + 1)
    this.calendar(months)
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
    let months = curYear + '-' + (curMonth + 1)
    this.calendar(months)
  },

  // 签到
  toSign: function() {
    let that = this
    let url = app.globalData.api + '/portal/Sign/do_sign'
    modals.loading()
    request.sendRequest(url, 'post', {}, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast(res.data.msg, 'none')
          that.getintegral()
        } else {
          modals.showToast(res.data.msg, 'none');
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  onShow: function() {
    this.getCard()
  },

  //瀑布流-1
  getCard: function() {
    let that = this
    let url = app.globalData.api + '/portal/Home/get_slide_item'
    request.sendRequest(url, 'post', {
      tags: 9
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            card: res.data.data[0].image
          })
        }
        that.getList()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  //瀑布流-2
  getList: function() {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      type: 7
    }
    let url = app.globalData.api + '/portal/Home/get_type_details'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          let len = list.length
          if (len > 0) {
            let half = (len / 2).toFixed(0);
            that.setData({
              leftlist: list.slice(0, half),
              rightlist: list.slice(half, len)
            })
          }
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 积分明细
  toIntegral: function() {
    wx.navigateTo({
      url: '/pages/mine/sign_in/Integral/Integral',
    })
  },

  // 进入详情
  toGoodsDetail: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/goods_detail/goods_detail?id=' + id,
    })
  },

  onReachBottom: function() {
    let that = this
    let left = that.data.leftlist
    let right = that.data.rightlist
    let pages = that.data.page + 1
    let data = {
      page: pages,
      length: 10,
      type: 7
    }
    console.log('参数：', data)
    let url = app.globalData.api + '/portal/Home/get_type_details'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          let len = list.length
          if (len > 0) {
            let half = len / 2
            let one = list.slice(0, half)
            let two = list.slice(half, len)
            that.setData({
              leftlist: left.concat(two),
              rightlist: right.concat(one),
              page: pages
            })
          }
        } else {
          modals.showToast('我也是有底线的', 'none');
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none');
      }
    })
  }
})