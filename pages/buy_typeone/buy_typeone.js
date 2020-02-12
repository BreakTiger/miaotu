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
  pageData.date = year + '-' + (month + 1) + '-' + day
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
    down: 0, //优惠券减少金额
    total_fina: '0.00', //合计总价
    covers: false,

    name: '',
    mobile: '',
    identity: '',

    //出发地
    startPlace: [],
    region: '请选择出发地址',

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
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate()
    let now = year + '-' + (month + 1) + '-' + day
    console.log('时间一：', now)
    let time = this.data.pageData.date
    console.log('时间二：', time)
    // 判断
    if (now == time) {
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
    } else {
      this.setData({
        choice_day_index: '',
        choice_day_price: ''
      })
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
    this.calculate_one()
  },

  // 选择日期
  selectDay: function(e) {
    let index = e.currentTarget.dataset.dayIndex
    let price = this.data.priceList[index]
    console.log('对应日期的价位：', price)
    let time = this.data.pageData.time
    console.log('年月：', time)
    let day = this.data.pageData.arrDays[index]
    console.log('日：', day)
    let choice = this.data.choice_day
    let times = time + '-' + day
    console.log('年月日:', times)
    if (choice != index) {
      this.setData({
        choice_day_index: index,
        'pageData.date': times,
        choice_day_price: this.data.priceList[index]
      })
    }
    this.calculate_one()
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
    this.calculate_one()
  },

  toTicket_one_add: function() {
    let num = this.data.adult;
    if (num < 1000) {
      this.data.adult++;
    }
    this.setData({
      adult: this.data.adult
    });
    this.calculate_one()
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
    this.calculate_one()
  },

  toTicket_two_add: function() {
    let num = this.data.child;
    if (num < 1000) {
      this.data.child++;
    }
    this.setData({
      child: this.data.child
    });
    this.calculate_one()
  },

  // 计算一
  calculate_one: function() {
    let that = this
    // 票数
    let t_one = that.data.adult
    let t_two = that.data.child
    // 票价
    let tp = that.data.choice_day_price
    // 折扣
    let zhe = that.data.discount / 100
    //优惠券
    let quan = that.data.down
    // 成人票总价
    let adTotal = t_one * tp
    // 单张儿童票价
    let c_zhe = that.data.child_price
    let chalone = tp * (c_zhe / 100)
    // 儿童总票价
    let chTotal = chalone * t_two
    //单份套餐价格
    let tao = that.data.taoPrice
    // 套餐总价
    let taoTotal = t_one * tao + t_two * tao
    let a = (((adTotal + chTotal - quan) * zhe) + taoTotal).toFixed(2)
    that.setData({
      total_fina: a
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
    let tprice = that.data.total_fina
    let down = item.fullprice
    let choice = item.id
    if (item.coupon_type == 0) {
      if (tprice >= item.lowprice) {
        that.setData({
          down: down,
          choice_coupon_index: choice,
          covers: false,
          choice_coupon: -down
        })
        that.calculate_one()
      } else {
        modals.showToast('不符合试用条件', 'none')
      }
    } else {
      that.setData({
        down: down,
        choice_coupon_index: choice,
        covers: false,
        choice_coupon: -down
      })
      that.calculate_one()
    }
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

  // 获取姓名
  toGetName: function(e) {
    this.setData({
      name: e.detail.value
    })
  },

  // 获取手机号
  toGetPhone: function(e) {
    this.setData({
      mobile: e.detail.value
    })
  },

  // 获取身份证
  toGetIdentity: function(e) {
    this.setData({
      identity: e.detail.value
    })
  },

  // 选择出发地
  bindRegionChange: function(e) {
    let address = e.detail.value
    this.setData({
      region: address[0] + '-' + address[1] + '-' + address[2]
    })
  },

  // 确定下单
  toOrder: function() {
    let that = this
    let t_one = that.data.adult
    let t_two = that.data.child
    let address = that.data.region
    let name = that.data.name
    let phone = that.data.mobile
    let identity = that.data.identity
    let total = that.data.total_fina
    if (address == "请选择出发地址") {
      modals.showToast('请选择您的出发地', 'none')
    } else if (t_one == 0 && t_two == 0) {
      modals.showToast('请添加你购买的票数', 'none')
    } else if (!name) {
      modals.showToast('请输入您的姓名', 'none')
    } else if (!phone) {
      modals.showToast('请输入您的手机号码', 'none')
    } else if (!(/^1[34578]\d{9}$/.test(phone))) {
      modals.showToast('手机号码有误，请重新输入', 'none')
    } else if (!identity) {
      modals.showToast('请输入身份证号码', 'none')
    } else if (!identity || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(identity)) {
      modals.showToast('身份证号码有误，请重新输入', 'none')
    } else {
      let data = {
        details_id: that.data.id,
        set_meal_id: that.data.choiceTao,
        name: name,
        mobile: phone,
        identity: identity,
        starting: address,
        day: that.data.pageData.date,
        adult_num: t_one,
        child_num: t_two,
        coupon_id: that.data.choice_coupon_index,
        total: parseFloat(total)
      }
      console.log('参数：', data)
      let url = app.globalData.api + '/portal/Order/do_order'
      request.sendRequest(url, 'post', data, {
        'token': wx.getStorageSync('openid')
      }).then(function(res) {
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            let oid = res.data.data
            that.pay_memont(oid)
          } else {
            modals.showToast(res.data.msg, 'none');
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
    }
  },

  // 支付
  pay_memont: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/Pay/do_pay'
    request.sendRequest(url, 'post', {
      order_id: e
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let result = res.data.data
          console.log(result)
          wx.requestPayment({
            timeStamp: result.timeStamp,
            nonceStr: result.nonceStr,
            package: result.package,
            signType: result.signType,
            paySign: result.paySign,
            success: function(res) {
              modals.showToast('支付成功', 'success')
              console.log('订单ID：', e)
              console.log('总价：', total_fina)
              let param = {
                oid: e,
                tprice: total_fina
              }
              setTimeout(function() {
                wx.navigateTo({
                  url: '/pages/pay_ success/pay_ success?param=' + JSON.stringify(param),
                })
              }, 2000)
            },
            fail: function(res) {
              modals.showToast('支付失败', 'loading')
              setTimeout(function() {
                wx.redirectTo({
                  url: '/pages/mine/order/order',
                })
              }, 2000)
            }
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  }



})