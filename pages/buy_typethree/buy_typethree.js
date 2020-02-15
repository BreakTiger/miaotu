const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({


  data: {
    id: '',
    tao: [],
    price: '0.00',
    choice: null,
    //出发地
    startPlace: [],
    region: '请选择出发地址',
    name: '',
    mobile: '',
    identity: '',
    total: '0.00'
  },


  onLoad: function(options) {
    let data = JSON.parse(options.data)
    this.setData({
      id: data.id,
      tao: data.tao,
      total: parseFloat(data.price)
    })
  },

  // 选择套餐
  toChoices: function(e) {
    let item = e.currentTarget.dataset.item
    console.log(item)
    this.setData({
      choice: item.id,
      total: parseFloat(item.setmeal_price) + parseFloat(this.data.total) * 1
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

  toOrder: function() {
    let that = this
    let choice = that.data.choice
    let place = that.data.region
    let name = that.data.name
    let phone = that.data.mobile
    let identity = that.data.identity
    let time = new Date();
    let Y = time.getFullYear(); //获取当前年份
    let M = time.getMonth() + 1; //获取当前月份(0-11,0代表1月)
    let D = time.getDate(); //获取当前日(1-31)
    let now = Y + '-' + M + '-' + D
    // 验证
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
      let data = {
        details_id: that.data.id,
        set_meal_id: that.data.choice,
        name: name,
        mobile: phone,
        identity: identity,
        starting: place,
        day: now,
        adult_num: 1,
        child_num: 0,
        coupon_id: '',
        total: that.data.total
      }
      console.log('参数：', data)
      let url = app.globalData.api + '/portal/Order/do_order'
      request.sendRequest(url, 'post', data, {
        'token': wx.getStorageSync('openid')
      }).then(function(res) {
        console.log(res.data.data)
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
              // console.log('订单ID：', e)
              // console.log('总价：', total_fina)
              // let param = {
              //   oid: e,
              //   tprice: total_fina
              // }
              // setTimeout(function() {
              //   wx.navigateTo({
              //     url: '/pages/pay_ success/pay_ success?param=' + JSON.stringify(param),
              //   })
              // }, 2000)
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