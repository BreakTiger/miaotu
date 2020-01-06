const request = require('../../../../api/http.js')
import modals from '../../../../methods/modal.js'
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
    total: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let data = JSON.parse(options.data)
    console.log(data.tao[0].id)
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
    if (that.data.region != '请选择出发地址') {
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
        console.log(res)
        modals.loaded()
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            that.payment(res.data.data)
          } else {
            modals.showToast(res.data.msg, 'none')
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
    } else {
      modals.showToast('请先选择出发地址', 'none');
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
              setTimeout(function() {
                wx.navigateBack({
                  delta: 2
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