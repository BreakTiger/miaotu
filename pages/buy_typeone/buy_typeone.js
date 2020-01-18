const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

// 获取时间：年，月，日，星期
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

  data: {
    id: '', //商品ID
    types: '', //套餐数组
    pageData, //价格日历
    priceList: [], //日历中价格数组

    choice_day_index: '',
    choice_day_price: '',

    // 套餐
    choiceTao: null,
    taoPrice: '',

    // 票数
    adult: 0,
    child: 0,

    page: 1,
    list: [],
    choice_coupon: '请选择',
    choice_coupon_index: null,

    child_price: '', //儿童票价格百分比
    total_one: '',
    total_fina: '0.00', //合计总价
    covers: false,

    down: '', //优惠券减少金额


  },

  onLoad: function(options) {
    let data = JSON.parse(options.data)
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
            priceList: news,
            child_price: res.data.data.details.child_price
          })

          that.getToday()
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 获取今日，以及价格
  getToday: function() {
    let daylist = this.data.pageData.arrDays
    let price = this.data.priceList
    for (let i = 0; i < daylist.length; i++) {
      if (daylist[i] == curDay) {
        this.setData({
          choice_day_index: i,
          choice_day_price: price[i]
        })
      }
    }
    this.getDiscount()
  },

  // 获取会员折扣
  getDiscount: function() {
    let that = this
    let url = app.globalData.api + '/portal/Personal/user_info'
    request.sendRequest(url, 'post', {}, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            discount: res.data.data.discount
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 选择套餐类型
  toChoices: function(e) {
    let item = e.currentTarget.dataset.item
    this.setData({
      choiceTao: item.id,
      taoPrice: item.setmeal_price
    })
    if (this.data.down) {
      this.calculate_three()
    } else {
      this.calculate_one()
    }
  },

  // 选择日期
  selectDay: function(e) {
    let index = e.currentTarget.dataset.dayIndex
    let choice = this.data.choice_day
    if (choice != index) {
      this.setData({
        choice_day_index: index,
        choice_day_price: this.data.priceList[index]
      })
    }
    if (this.data.down) {
      this.calculate_three()
    } else {
      this.calculate_one()
    }
  },

  // 成人票：
  toTicket_one_minu: function() {
    let num = this.data.adult;
    if (num > 0) {
      this.data.adult--;
    }
    this.setData({
      adult: this.data.adult
    });
    if (this.data.down) {
      this.calculate_three()
    } else {
      this.calculate_one()
    }
  },

  toTicket_one_add: function() {
    let num = this.data.adult;
    if (num < 1000) {
      this.data.adult++;
    }
    this.setData({
      adult: this.data.adult
    });
    if (this.data.down) {
      this.calculate_three()
    } else {
      this.calculate_one()
    }
  },

  // 儿童票
  toTicket_two_minu: function() {
    let num = this.data.child;
    if (num > 0) {
      this.data.child--;
    }
    this.setData({
      child: this.data.child
    });
    if (this.data.down) {
      this.calculate_three()
    } else {
      this.calculate_one()
    }
  },

  toTicket_two_add: function() {
    let num = this.data.child;
    if (num < 1000) {
      this.data.child++;
    }
    this.setData({
      child: this.data.child
    });
    if (this.data.down) {
      this.calculate_three()
    } else {
      this.calculate_one()
    }
  },

  // 计算一
  calculate_one: function() {
    let that = this
    // 票数
    let t_one = that.data.adult
    let t_two = that.data.child
    console.log('成人票数：', t_one)
    console.log('儿童票数：', t_two)
    // 票价
    let tp = that.data.choice_day_price
    console.log('今日票价：', tp)
    // 折扣
    let zhe = that.data.discount
    console.log('折扣：', zhe)
    // 儿童
    let c_zhe = that.data.child_price
    console.log('儿童票价百分比：', c_zhe)
    // 成人票总价
    let adTotal = t_one * tp
    console.log('成人票总价:', adTotal)
    // 单张儿童票价
    let chalone = tp * (c_zhe / 100)
    console.log('单张儿童票价:', chalone)
    // 儿童总票价
    let chTotal = chalone * t_two
    console.log('儿童总票价：', chTotal)
    let tao = that.data.taoPrice
    console.log('套餐价格:', tao)
    // 套餐总价
    let taoToatl = (t_two + t_one) * tao
    console.log('套餐总价:', taoToatl)
    let fina = (adTotal + chTotal) * (zhe / 100) + taoToatl
    console.log('合计一（无优惠券）:', fina)
    that.setData({
      total_one: (adTotal + chTotal) * (zhe / 100),
      total_fina: fina
    })
  },

  // 平台优惠
  toShowCoupons: function() {
    let that = this
    let t_one = that.data.adult
    let t_two = that.data.child
    if (t_one != 0 || t_two != 0) {
      let data = {
        details_id: that.data.id,
        page: that.data.page,
        length: 10
      }
      let url = app.globalData.api + '/portal/Personal/coupon'
      request.sendRequest(url, 'post', data, {
        'token': wx.getStorageSync('openid')
      }).then(function(res) {
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            that.setData({
              list: res.data.data.data
            })
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
      that.setData({
        covers: true
      })
    } else {
      modals.showToast('请添加票数', 'none')
    }
  },

  // 关闭
  toClose: function() {
    this.setData({
      covers: false
    })
  },

  // 选择优惠券
  toChoiceCoupons: function(e) {
    let that = this
    let index = e.currentTarget.dataset.index
    let list = that.data.list
    console.log(list)
    let item = list[index]
    console.log(item)
    let tprice = that.data.total_one
    console.log('合计(不含套餐价，不含优惠券优惠)：', tprice)
    let down = item.fullprice
    let choice = item.id
    if (item.coupon_type == 0) {
      if (tprice >= item.lowprice) {
        console.log('满减')
        that.setData({
          down: down,
          choice_coupon_index: choice,
          covers: false
        })
        that.calculate_two()
      } else {
        modals.showToast('不符合试用条件', 'none')
      }
    } else {
      console.log('现金')
      that.setData({
        down: down,
        choice_coupon_index: choice,
        covers: false
      })
      that.calculate_two()
    }
  },

  // 计算二
  calculate_two: function() {
    let that = this
    let down = that.data.down
    console.log('优惠券减少数额:', down)
    let one = that.data.total_fina
    console.log('合计(不含优惠券优惠)：', one)
    let a = one - down
    console.log('合计二（包含套餐，包含优惠券）:', a);
    that.setData({
      total_fina: a
    })
  },

  // 计算三
  calculate_three: function() {
    let that = this
    let tao = that.data.taoPrice
    console.log('套餐价格:', tao)
    let tp = that.data.choice_day_price
    console.log('今日票价：', tp)
    let t_one = that.data.adult
    console.log('成人票数：', t_one)
    let t_two = that.data.child
    console.log('儿童票数：', t_two)
    let c_zhe = that.data.child_price
    console.log('儿童票价百分比：', c_zhe)
    let chalone = tp * (c_zhe / 100)
    console.log('单张儿童票价:', chalone)
    let adTotal = t_one * tp
    console.log('成人票总价:', adTotal)
    let chTotal = t_two * chalone
    console.log('儿童票总价:', chTotal)
    let taoTotal = (t_one + t_two) * tao
    console.log('套餐总价：', taoTotal)
    let down = that.data.down
    console.log('优惠券折扣减少：', down)
    let zhe = that.data.discount
    console.log('折扣：', zhe)
    let a = ((adTotal + chTotal) * (zhe / 100)) + taoTotal - down
    console.log('最终价格：', a)
    that.setData({
      total_fina: a
    })
  },


})