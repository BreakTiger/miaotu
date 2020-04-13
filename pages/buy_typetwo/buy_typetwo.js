// 拼团下单
const request = require('../../utils/http.js')
import modals from '../../utils/modal.js'
const WxParse = require('../../wxParse/wxParse.js')
const app = getApp()

Page({

  data: {
    id: '', //活动ID
    uid: '', //团战ID
    tao: [], //套餐
    insurance: {}, //保险
    price: '', //商品价

    //套餐
    choice: null, //选择套餐
    tprice: '0.00', //套餐价格

    //出发地
    startPlace: [],
    region: '请选择出发地址',

    //信息
    name: '',
    mobile: '',
    identity: '',

    //保险
    choice_one: 0,
    price_one: '0.00', //意外险价格
    choice_two: 0,
    price_two: '0.00', //退款险价格

    total: '0.00' //总价
  },


  onLoad: function(options) {
    let data = JSON.parse(options.data)
    console.log(data)
    this.setData({
      id: data.id,
      uid: data.uid,
      tao: data.tao,
      insurance: data.insurance,
      price: data.price,
      total: data.price
    })

    // 解析富文本
    let insurance_one = data.insurance.insurance.rule
    WxParse.wxParse('insurance_one', 'html', insurance_one, this, 5);
    let insurance_two = data.insurance.insurance_refund.rule
    WxParse.wxParse('insurance_two', 'html', insurance_two, this, 5);

    // 判断缓存中是否存在infos
    let infos = wx.getStorageSync('putInfo') || ''
    if (infos) {
      this.setData({
        name: infos.name,
        mobile: infos.mobile,
        identity: infos.identity
      })
    }
  },

  // 选择套餐
  toChoices: function(e) {
    let item = e.currentTarget.dataset.item
    // console.log(item)
    let sprice = parseFloat(item.setmeal_price)
    // console.log('套餐价：', sprice)
    let price = parseFloat(this.data.price)
    // console.log('商品价：', price)
    let one = parseFloat(this.data.price_one)
    // console.log('保险1价：', one)
    let two = parseFloat(this.data.price_two)
    // console.log('保险2价：', two)
    let total = parseFloat(this.data.total)
    // console.log('总价：', total)
    let id = this.data.choice
    // 判断
    if (id == item.id) { //取消选中
      let a = (total - sprice).toFixed(2)
      this.setData({
        choice: null,
        tprice: '0.00',
        total: a
      })
    } else { //选中
      let a = (price + sprice + one + two).toFixed(2)
      this.setData({
        choice: item.id,
        tprice: sprice,
        total: a
      })
    }
  },

  // 选择出发地
  bindRegionChange: function(e) {
    let address = e.detail.value
    this.setData({
      region: address[0] + '-' + address[1] + '-' + address[2]
    })
  },

  // 姓名
  usernames: function(e) {
    let name = e.detail.value
    this.setData({
      name: name
    })
  },

  // 手机号
  phones: function(e) {
    let phone = e.detail.value
    this.setData({
      mobile: phone
    })
  },

  // 身份证
  identity: function(e) {
    let idnum = e.detail.value
    this.setData({
      identity: idnum
    })
  },

  //保险
  //意外险
  toBuy_one: function(e) {
    let item = e.currentTarget.dataset.item
    let one = parseFloat(item.price)
    let total = parseFloat(this.data.total)
    let select = this.data.choice_one
    if (select == 0) {
      this.setData({
        choice_one: 1,
        price_one: one,
        total: (one + total).toFixed(2)
      })
    } else {
      this.setData({
        choice_one: 0,
        price_one: '0.00',
        total: (total - one).toFixed(2)
      })
    }
  },

  //取消险
  toBuy_two: function(e) {
    let item = e.currentTarget.dataset.item
    let two = parseFloat(item.price)
    let total = parseFloat(this.data.total)
    let select = this.data.choice_two
    if (select == 0) {
      this.setData({
        choice_two: 1,
        price_two: two,
        total: (two + total).toFixed(2)
      })
    } else {
      this.setData({
        choice_two: 0,
        price_two: '0.00',
        total: (total - two).toFixed(2)
      })
    }
  },


  // 确定
  toOrder: function() {
    let that = this
    let choice = that.data.choice //选择套餐
    let place = that.data.region //出发地
    let name = that.data.name //姓名
    let phone = that.data.mobile //电话
    let identity = that.data.identity //身份证
    let c_one = that.data.choice_one //意外险
    let c_two = that.data.choice_two //退款险
    // 判断
    if (place == "请选择出发地址") {
      modals.showToast('请选择您的出发地', 'none')
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
      // 输入信息缓存
      let infos = {
        name: name,
        mobile: phone,
        identity: identity
      }
      wx.setStorageSync('putInfo', infos)

      // 再判断所选保险
      if (c_one == 0 && c_two == 0) { // 1.俩种保险都无
        let data = {
          id: that.data.id,
          name: name,
          mobile: phone,
          identity: identity,
          set_meal_id: that.data.choice,
          starting: place,
          refund_insurance_status: '',
          accident_insurance_status: '',
          total: that.data.total
        }
        that.getOrder(data)
      } else if (c_one == 1 && c_two == 1) { // 2.俩种保险都存在
        let data = {
          id: that.data.id,
          name: name,
          mobile: phone,
          identity: identity,
          set_meal_id: that.data.choice,
          starting: place,
          refund_insurance_status: 1,
          accident_insurance_status: 1,
          total: that.data.total
        }
        that.getOrder(data)
      } else if (c_one == 1) { // 3.只存在意外险
        let data = {
          id: that.data.id,
          name: name,
          mobile: phone,
          identity: identity,
          set_meal_id: that.data.choice,
          starting: place,
          refund_insurance_status: 1,
          accident_insurance_status: '',
          total: that.data.total
        }
        that.getOrder(data)
      } else if (c_two == 1) { // 4.只存在退款险
        let data = {
          id: that.data.id,
          name: name,
          mobile: phone,
          identity: identity,
          set_meal_id: that.data.choice,
          starting: place,
          refund_insurance_status: '',
          accident_insurance_status: 1,
          total: that.data.total
        }
        that.getOrder(data)
      }
    }
  },

  // 下单
  getOrder: function(data) {
    console.log('参数：', data)
    let that = this
    let url = app.globalData.api + '/portal/Pintuan/do_team'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let oid = res.data.data
          console.log('订单ID：', oid)
          console.log('总价：', that.data.total)
          that.payment(oid)
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 支付
  payment: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/Pay/do_pay'
    request.sendRequest(url, 'post', {
      order_id: e
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          console.log(res.data.data)
          wx.requestPayment({
            timeStamp: res.data.data.timeStamp,
            nonceStr: res.data.data.nonceStr,
            package: res.data.data.package,
            signType: res.data.data.signType,
            paySign: res.data.data.paySign,
            success: function(res) {
              modals.showToast('支付成功', 'success')
              console.log('订单ID：', e)
              console.log('总价：', that.data.total)
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
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  }

})