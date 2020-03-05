const request = require('../../../../api/http.js')
import modals from '../../../../methods/modal.js'
const app = getApp()

Page({

  data: {
    oid: '',
    details: [],
    order: [],
    pintuan: []
  },

  onLoad: function(options) {
    this.setData({
      oid: options.oid
    })
  },

  onShow: function() {
    this.getInfo(this.data.oid)
  },

  // 获取单个订单详情
  getInfo: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/Order/info'
    let data = {
      order_id: e
    }
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data.data)
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            details: res.data.data.details,
            order: res.data.data.order,
            pintuan: res.data.data.pintuan
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 取消+删除订单
  delOrder: function() {
    let that = this
    let oid = that.data.oid
    let url = app.globalData.api + '/portal/order/delete'
    request.sendRequest(url, 'post', {
      id: oid
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast('取消成功', 'loading')
          setTimeout(function() {
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 继续付款
  continuePay: function() {
    let that = this
    let oid = that.data.oid
    let url = app.globalData.api + '/portal/Pay/do_pay'
    request.sendRequest(url, 'post', {
      order_id: oid
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
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
              modals.showToast('支付成功', 'loading')
              setTimeout(function() {
                that.getInfo(that.data.oid)
              }, 1000)
            },
            fail: function(res) {
              modals.showToast('支付失败', 'none')
            }
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 申请售后
  aftersales: function() {
    let id = this.data.oid
    wx.navigateTo({
      url: '/pages/mine/order/apply/apply?id=' + id,
    })
  },

  // 立即评价
  toReview: function() {
    let item = {
      id: this.data.order.id,
      title: this.data.details.title,
      banner: this.data.details.banner
    }
    wx.navigateTo({
      url: '/pages/mine/order/comments/comments?item=' + JSON.stringify(item),
    })
  },

  // 再次购买
  buyAgain: function() {
    let id = this.data.order.detailsId
    wx.navigateTo({
      url: '/pages/goods_detail/goods_detail?id=' + id,
    })
  },

  // 立即分享
  onShareAppMessage: function (options) {
    if (options.from === 'button') {
      console.log(this.data.order.detailsId)
    }
    return {
      title: this.data.details.title,
      path: '/pages/goods_detail/goods_detail?id=' + this.data.order.detailsId,
    }
  }
})