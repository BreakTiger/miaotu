// 拼团下单

const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    uid: '',
    types: [],
    choice: null,
    startPlace: [],
    region: '请选择出发地址',
    name: '',
    phone: '',
    idnum: '',
    price: '',
    total: '0.00'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let data = JSON.parse(options.data)
    console.log(data)
    // console.log(data.tao[0].id)
    this.setData({
      id: data.id,
      uid: data.uid,
      types: data.tao,
      price: data.price
    })
  },

  // 选择套餐
  toChoices: function(e) {
    let item = e.currentTarget.dataset.item
    this.setData({
      choice: item.id,
      total: parseFloat(item.setmeal_price) + parseFloat(this.data.price)
    })
  },

  // 选择出发地
  bindRegionChange: function(e) {
    console.log(e.detail.value)
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
      phone: phone
    })
  },

  // 身份证
  identity: function(e) {
    let idnum = e.detail.value
    this.setData({
      idnum: idnum
    })
  },

  // 下单
  toOrder: function() {
    let that = this
    let name = that.data.name
    console.log('姓名：', name)
    let phone = that.data.phone
    console.log('电话：', phone)
    let code = that.data.idnum
    console.log('身份证：', code)
    // 验证
    if (that.data.region == '请选择出发地址') {
      modals.showToast('请选择出发地址', 'none')
    } else if (!name) {
      modals.showToast('请输入姓名！', 'none')
    } else if (!phone) {
      modals.showToast('请输入手机号码', 'none')
    } else if (!(/^1[34578]\d{9}$/.test(phone))) {
      modals.showToast('手机号码有误，请重新输入', 'none')
    } else if (!code) {
      modals.showToast('请输入身份证号码', 'none')
    } else if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
      modals.showToast('身份证号码有误，请重新输入', 'none')
    } else {
      let data = {
        id: that.data.id,
        set_meal_id: that.data.choice,
        name: that.data.name,
        mobile: that.data.phone,
        identity: that.data.idnum,
        starting: that.data.region,
        uid: that.data.uid
      }
      console.log('参数：', data);
      modals.loading()
      let url = app.globalData.api + '/portal/Pintuan/do_team'
      request.sendRequest(url, 'post', data, {
        'token': wx.getStorageSync('openid')
      }).then(function(res) {
        modals.loaded()
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
    }
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
              setTimeout(function () {
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