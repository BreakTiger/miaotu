// 普通下单
const request = require('../../utils/http.js')
import modals from '../../utils/modal.js'
const WxParse = require('../../wxParse/wxParse.js')
const app = getApp()

//获取系统时间（不变）
var date = new Date()
var y = date.getFullYear();
var m = date.getMonth();
var d = date.getDate();

// 获取时间：年，月，日，星期 -- 用于日历中（会改变）
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

// 价格日历-对象
var pageData = {
  year: '', //年
  month: '', //月
  day: '', //日
  date: '', //年+月+日
  time: '', //当前：年+月
  arrIsShow: [], //是否显示此日期
  arrDays: [] //关于几号的信息
}

// 今日日期
var today = curYear + '-' + (curMonth + 1) + '-' + (curDay + 1)

//刷新全部数据
var refreshPageData = function(year, month, day, week) {
  pageData.year = year
  pageData.month = (month + 1)
  pageData.day = day
  if (year == y && month == m) {
    pageData.date = year + '-' + (month + 1) + '-' + (day + 1)
  }
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
    pageData, //日历

    id: '', //产品ID

    details: {}, //产品数据

    tao: [], //套餐数据
    choice: null, //选择的套餐
    tprice: '0.00', //套餐价格

    calendar: [], //每月的价位数组（未整理）

    insurance: {}, //保险

    priceList: [], //日历的价格数组（整理后）


    choice_day_index: null, //所选的日期下标
    today: '', //日期
    dprice: '0.00', //日期对应的价位

    // 参与人
    contact: [], //参与人列表,
    choice_contact: [], //选中参与人信息
    choice_index: [], //选中的下标

    adult: 0, //成人数
    child: 0, //儿童数

    //出发地
    startPlace: [],
    region: '请选择出发地址',


    //保险
    choice_one: 0,
    price_one: '0.00', //意外险价格
    choice_two: 0,
    price_two: '0.00', //退款险价格

    list: [], //优惠券列表

    discount: '', //会员折扣

    choice_coupon_index: null, //选择的券
    coupons: '0.00', //平台优惠价

    total: '0.00', //最终价格

    you: '0.00', //优惠

    covers: false //优惠券窗口
  },

  onLoad: function(options) {
    let id = options.id
    this.setData({
      id: options.id
    })
  },

  onShow: function() {
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
            discount: (res.data.data.discount) / 100
          })
          that.getMonthPrice()
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 每月，每日对应的价位
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
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            details: res.data.data.details,
            tao: res.data.data.setmeal,
            insurance: res.data.data.insurance,
            calendar: res.data.data.calendar
          })

          // 解析富文本
          let insurance_one = res.data.data.insurance.insurance.rule
          WxParse.wxParse('insurance_one', 'html', insurance_one, that, 5);
          let insurance_two = res.data.data.insurance.insurance_refund.rule
          WxParse.wxParse('insurance_two', 'html', insurance_two, that, 5);

          that.clean()

        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 整理规划价格数组 + 设置默认日期
  clean: function() {
    let that = this
    let a = []
    let ishowList = that.data.pageData.arrIsShow
    // console.log(ishowList)
    let list = that.data.calendar
    // console.log(list)
    if (list.length != 0) {
      for (let i = 0; i < ishowList.length; i++) {
        if (ishowList[i] == true) {
          a.push(list[0].price)
          list.shift();
        } else {
          a.push(0);
        }
      }
    } else {
      for (let i = 0; i < ishowList.length; i++) {
        a.push(0)
      }
    }
    that.setData({
      priceList: a
    })

    // 设置默认
    let year = that.data.pageData.year
    let month = that.data.pageData.month
    if (y == year && month == (m + 1)) {
      // console.log('默认日：', d + 1)
      let lists = that.data.pageData.arrDays
      let price = that.data.priceList
      lists.forEach(function(item, index) {
        if (item == (d + 1)) {
          // console.log(index)
          // console.log('默认日的价位：', price[index])
          that.setData({
            choice_day_index: index,
            dprice: price[index],
            today: that.data.pageData.year + '-' + that.data.pageData.month + '-' + (d + 1)
          })
        }
      })
    }

    that.getContact()
    // that.calculate_one()
  },

  // 参与人列表
  getContact: function() {
    let that = this
    let data = {
      page: 1,
      length: 25
    }
    let url = app.globalData.api + '/portal/contacts/index'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          list.forEach(function(item) {
            item.choice = null
          })
          that.setData({
            contact: list
          })
        } else {
          that.setData({
            contact: []
          })
        }
        that.synchronous()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 同步选中内容
  synchronous: function() {
    let that = this
    let list = that.data.contact
    let arr = wx.getStorageSync('arr')
    let arr_two = wx.getStorageSync('arr_two')
    let a = []
    let b = []
    let ad = 0
    let cd = 0
    // console.log('当前年：', y)
    // 循环判断 - 变更选中状态，及其对应信息 -计算成人，儿童票数
    if (arr.length != 0) {

      for (let i = 0; i < arr.length; i++) {
        for (let k = 0; k < list.length; k++) {
          if (arr[i].id == list[k].id) {
            a.push(list[k])
            b.push(list[k].id)
            list[k].choice = 1
          }
        }
        // 计算获取成人儿童票
        // console.log('身份证号：', arr[i].identity)
        let birthYear = arr[i].identity.substring(6, 10);
        if (y - birthYear >= 18) {
          ad++;
        } else {
          cd++;
        }
      }

    } else {
      list.forEach(function(item) {
        item.choice = null
      })
    }

    // 设置更新
    wx.setStorageSync('arr', a)
    wx.setStorageSync('arr_two', b)

    that.setData({
      contact: list,
      choice_contact: a,
      choice_index: b,
      adult: ad,
      child: cd
    })

    that.calculate_one()
  },


  // 选择参与人 +增加
  choice_joined: function(e) {
    let that = this
    let items = e.currentTarget.dataset.item
    let arr = that.data.choice_contact
    let arr_two = that.data.choice_index

    // 判断，变更选中状态
    if (items.choice == null) {
      let list = that.data.contact
      list.forEach(function(item, index) {
        if (item.id == items.id) {
          item.choice = 1
          arr.push(item)
          arr_two.push(item.id)
        }
      })

      console.log('选中信息', arr)
      console.log('选中下标：', arr_two)

      // 设置缓存，并绑定更新
      wx.setStorageSync('arr', arr)
      wx.setStorageSync('arr_two', arr_two)

      that.setData({
        contact: list,
        choice_contact: arr,
        choice_index: arr_two
      })
    }

    that.synchronous()
  },

  // 删除参与人 -减少
  toDelChoice: function(e) {
    let that = this

    let arr = that.data.choice_contact
    let arr_two = that.data.choice_index
    console.log('选中信息', arr)
    console.log('选中下标：', arr_two)

    let index = e.currentTarget.dataset.index
    console.log('选择的下标：', index)

    // 删除
    arr.splice(index, 1)
    arr_two.splice(index, 1)

    // 更新缓存，以及绑定
    wx.setStorageSync('arr', arr)
    wx.setStorageSync('arr_two', arr_two)

    // 更新
    that.setData({
      choice_contact: arr,
      choice_index: arr_two
    })

    that.synchronous()
  },

  // 选择日期
  selectDay: function(e) {
    let ys = e.currentTarget.dataset.y
    let ms = e.currentTarget.dataset.m
    let ds = e.currentTarget.dataset.d
    let index = e.currentTarget.dataset.index
    // console.log('选择下标:', index)
    let list = this.data.priceList
    let day = this.data.pageData.arrDays[index]
    // console.log('所选的日期：', day)
    if (ys == y) { //今年内
      if (ms == (m + 1)) { //等于当月
        if (day >= d) { //大于等于当前日
          console.log(list[index])
          this.setData({
            choice_day_index: index,
            dprice: list[index],
            today: ys + '-' + ms + '-' + day
          })
        }
      } else if (ms > (m + 1)) { //大于当月
        console.log(list[index])
        this.setData({
          choice_day_index: index,
          dprice: list[index],
          today: ys + '-' + ms + '-' + day
        })
      }
    } else if (ys > y) { //大于今年
      console.log(list[index])
      this.setData({
        choice_day_index: index,
        dprice: list[index],
        today: ys + '-' + ms + '-' + day
      })
    }
    this.calculate_one()
  },

  // 上一个月
  lastMonth: function() {
    let that = this
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
    that.getMonthPrice()

    let ys = this.data.pageData.year
    let ms = this.data.pageData.month
    if (ys == y) { //今年内
      if (ms != (m + 1)) { //不在当前月份内
        this.setData({
          choice_day_index: null,
          dprice: ''
        })
      }
    } else { //不在今年内
      this.setData({
        choice_day_index: null,
        dprice: ''
      })
    }
  },

  // 下一个也
  nextMonth: function() {
    let that = this
    if (11 == curMonth) {
      curMonth = 0;
      ++curYear
    } else {
      ++curMonth;
    }
    refreshPageData(curYear, curMonth, 1, 0);
    that.setData({
      pageData: pageData
    })
    that.getMonthPrice()

    let ys = this.data.pageData.year
    let ms = this.data.pageData.month
    if (ys == y) { //今年内
      if (ms != (m + 1)) { //不在当前月份内
        this.setData({
          choice_day_index: null,
          dprice: ''
        })
      }
    } else { //不在今年内
      this.setData({
        choice_day_index: null,
        dprice: ''
      })
    }
  },

  // 添加参与人
  toAdd: function() {
    app.globalData.item = {}
    wx.navigateTo({
      url: '/pages/contact/contact',
    })
  },

  // 修改参与人
  toChange: function(e) {
    let items = e.currentTarget.dataset.item
    app.globalData.item = items
    wx.navigateTo({
      url: '/pages/contact/contact',
    })
  },

  //保险
  //意外险
  toBuy_one: function(e) {
    let item = e.currentTarget.dataset.item
    let one = parseFloat(item.price)
    let select = this.data.choice_one
    if (select == 0) {
      this.setData({
        choice_one: 1,
        price_one: one,
      })
    } else {
      this.setData({
        choice_one: 0,
        price_one: '0.00',
      })
    }
    this.calculate_one()
  },

  //取消险
  toBuy_two: function(e) {
    let item = e.currentTarget.dataset.item
    let two = parseFloat(item.price)
    let select = this.data.choice_two
    if (select == 0) {
      this.setData({
        choice_two: 1,
        price_two: two
      })
    } else {
      this.setData({
        choice_two: 0,
        price_two: '0.00'
      })
    }
    this.calculate_one()
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
        length: 25
      }
      let url = app.globalData.api + '/portal/Personal/coupon'
      modals.loading()
      request.sendRequest(url, 'post', data, {
        'token': wx.getStorageSync('openid')
      }).then(function(res) {
        modals.loaded()
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            let list = res.data.data.data
            let arr = []
            for (let i = 0; i < list.length; i++) {
              WxParse.wxParse('yhq_rule' + i, 'html', list[i].yhq_rule, that);
              if (i === list.length - 1) {
                WxParse.wxParseTemArray("WxParseListArr", 'yhq_rule', list.length, that);
              }
            }
            let listArr = that.data.WxParseListArr;
            listArr.forEach((item, index) => {
              list[index].contentCopy = item;
              arr.push(list[index])
            })
            that.setData({
              list: list
            })
          } else {
            modals.showToast(res.data.msg, 'none')
          }
          that.setData({
            covers: true
          })
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
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
    console.log(e.currentTarget.dataset)
    let item = e.currentTarget.dataset.item
    console.log(item)
    let index = e.currentTarget.dataset.index
    let total = that.data.total
    console.log('总价：', total)
    if (item.coupon_type == 0) { //满减券
      let low = item.lowprice
      console.log('最低消费：', low)
      if (total >= low) {
        let down = item.fullprice
        console.log('优惠：', down)
        that.setData({
          choice_coupon_index: item.id,
          coupons: down,
          covers: false
        })
      } else {
        modals.showToast('不符合试用条件', 'none')
      }
    } else { //现金券
      let down = item.fullprice
      console.log('优惠：', down)
      that.setData({
        choice_coupon_index: item.id,
        coupons: down,
        covers: false
      })
    }
    that.calculate_one()
  },

  // 选择套餐
  toChoices: function(e) {
    let item = e.currentTarget.dataset.item
    console.log(item)
    if (item.id == this.data.choice) {
      this.setData({
        choice: null,
        tprice: 0,
      })
    } else {
      this.setData({
        choice: item.id,
        tprice: item.setmeal_price
      })
    }
    this.calculate_one()
  },




  // 计算
  calculate_one: function() {
    let that = this

    let price = parseFloat(that.data.dprice)
    console.log('普通票价：', price)

    let tprice = parseFloat(that.data.tprice)
    console.log('套餐价格：', tprice)

    let num = that.data.choice_contact.length
    console.log('人数：', num)

    let c_d = parseFloat((that.data.details.child_price) / 100)
    console.log('儿童折扣：', c_d)

    let a = parseFloat(that.data.adult)
    console.log('成人票：', a)

    let c = parseFloat(that.data.child)
    console.log('儿童票：', c)

    let price_one = parseFloat(that.data.price_one)
    console.log('保险一：', price_one)

    let price_two = parseFloat(that.data.price_two)
    console.log('保险二：', price_two)

    let m_d = parseFloat(that.data.discount)
    console.log('会员折扣：', m_d)

    let coupons = parseFloat(that.data.coupons)
    console.log('优惠券优惠部分：', coupons)

    let t_a = parseFloat(price * a)
    console.log('成人票总价：', t_a)

    let t_c = parseFloat(price * c_d * c)
    console.log('儿童票总价：', t_c)

    let t_t = parseFloat((a + c) * tprice)
    console.log('套餐总价(票数*套餐价))：', t_t)

    let bao = parseFloat(price_one * (a + c))
    console.log('出行险总价：', bao)

    let as = parseFloat(t_a + t_c - coupons)
    console.log('(成总+儿总-优惠)', as)

    let at = parseFloat(as * m_d)
    console.log('(成总+儿总-优惠)*会员：', at)

    let aa = parseFloat(at + t_t)
    console.log('((成总+儿总-优惠)*会员)+套总：', aa)

    let aaa = parseFloat((aa + bao + price_two)).toFixed(2)
    console.log('(((成总+儿总-优惠)*会员)+套价)+出行险总价 + 退款险：', aaa)

    let bbb = parseFloat(t_a + t_c + t_t + bao + price_two).toFixed(2)
    console.log('儿童总价 + 成人总价 +套餐总价 + 出行险总价 +退款险', bbb)

    let you = parseFloat(bbb - aaa).toFixed(2)
    console.log('优惠：', you)

    that.setData({
      total: aaa,
      you: bbb
    })
  },

  // 选择出发地
  bindRegionChange: function(e) {
    let address = e.detail.value
    this.setData({
      region: address[0] + '-' + address[1] + '-' + address[2]
    })
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

  // 确定
  toOrder: function() {
    let that = this
    let choice = that.data.choice //选择套餐
    let place = that.data.region //出发地
    let t_one = that.data.adult //成人票
    let t_two = that.data.child //儿童票
    let name = that.data.name //姓名
    let phone = that.data.mobile //电话
    let c_one = that.data.choice_one //意外险
    console.log(c_one)
    let c_two = that.data.choice_two //退款险
    console.log(c_two)
    // 判断
    if (place == "请选择出发地址") {
      modals.showToast('请选择您的出发地', 'none')
    } else if (t_one == 0 && t_two == 0) {
      modals.showToast('请选择/添加活动参与人', 'none')
    } else if (!name) {
      modals.showToast('请输入您的姓名', 'none')
    } else if (!phone) {
      modals.showToast('请输入您的手机号码', 'none')
    } else if (!(/^1[34578]\d{9}$/.test(phone))) {
      modals.showToast('手机号码有误，请重新输入', 'none')
    } else {
      // 再判断所选保险
      if (c_one == 0 && c_two == 0) { // 1.俩种保险都无
        let data = {
          details_id: that.data.id,
          set_meal_id: that.data.choice,
          name: name,
          mobile: phone,
          starting: place,
          day: that.data.today,
          adult_num: t_one,
          child_num: t_two,
          coupon_id: that.data.choice_coupon_index,
          total: that.data.total,
          refund_insurance_status: '',
          accident_insurance_status: '',
          contacts: wx.getStorageSync('arr_two')
        }
        that.getOrder(data)
      } else if (c_one == 1 && c_two == 1) { // 2.俩种保险都存在
        let data = {
          details_id: that.data.id,
          set_meal_id: that.data.choice,
          name: name,
          mobile: phone,
          starting: place,
          day: that.data.today,
          adult_num: t_one,
          child_num: t_two,
          coupon_id: that.data.choice_coupon_index,
          total: that.data.total,
          refund_insurance_status: 1,
          accident_insurance_status: 1,
          contacts: wx.getStorageSync('arr_two')
        }
        that.getOrder(data)
      } else if (c_one == 1) { // 3.只存在意外险
        let data = {
          details_id: that.data.id,
          set_meal_id: that.data.choice,
          name: name,
          mobile: phone,
          starting: place,
          day: that.data.today,
          adult_num: t_one,
          child_num: t_two,
          coupon_id: that.data.choice_coupon_index,
          total: that.data.total,
          refund_insurance_status: '',
          accident_insurance_status: 1,
          contacts: wx.getStorageSync('arr_two')
        }
        that.getOrder(data)
      } else if (c_two == 1) { // 4.只存在退款险
        let data = {
          details_id: that.data.id,
          set_meal_id: that.data.choice,
          name: name,
          mobile: phone,
          starting: place,
          day: that.data.today,
          adult_num: t_one,
          child_num: t_two,
          coupon_id: that.data.choice_coupon_index,
          total: that.data.total,
          refund_insurance_status: 1,
          accident_insurance_status: '',
          contacts: wx.getStorageSync('arr_two')
        }
        that.getOrder(data)
      }
    }
  },


  // 下单
  getOrder: function(data) {
    console.log(data)
    let that = this
    let url = app.globalData.api + '/portal/Order/do_order'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let oid = res.data.data
          console.log('订单ID：', oid)
          console.log('订单总价：', that.data.total)
          that.pay_memont(oid)
        } else {
          modals.showToast(res.data.msg, 'none');
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 微信支付
  pay_memont: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/Pay/do_pay'
    request.sendRequest(url, 'post', {
      order_id: e
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let result = res.data.data
          wx.requestPayment({
            timeStamp: result.timeStamp,
            nonceStr: result.nonceStr,
            package: result.package,
            signType: result.signType,
            paySign: result.paySign,
            success: function(res) {
              modals.showToast('支付成功', 'success')
              console.log('订单ID：', e)
              console.log('订单总价：', that.data.total)
              let param = {
                oid: e,
                tprice: that.data.total
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
        } else {
          modals.showToast(res.data.msg, 'none');
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  }
})