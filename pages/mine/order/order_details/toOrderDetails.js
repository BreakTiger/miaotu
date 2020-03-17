const request = require('../../../../api/http.js')
import modals from '../../../../methods/modal.js'
const QRCode = require('../../../../utils/qr-core.js')
const app = getApp()

let qrcode = null;

Page({

  data: {
    oid: '',
    details: [],
    order: [],
    pintuan: [],
    aid: '',
    cover: false,
    qrcodeWidth: 0
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
      // console.log(res.data.data)
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            details: res.data.data.details,
            order: res.data.data.order,
            pintuan: res.data.data.pintuan
          })
          if (res.data.data.order.type == 1) {
            that.getPingID(that.data.oid)
          }
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 获取拼团活动ID
  getPingID: function(e) {
    let that = this
    let data = {
      order_id: e,
      type: 1
    }
    let url = app.globalData.api + '/portal/Order/get_pintuan'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            aid: res.data.data.p_id
          })
          that.getCode()
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 绘制二维码
  getCode: function() {
    let that = this
    const ctx = wx.createCanvasContext('canvas')
    const rate = wx.getSystemInfoSync().windowWidth / 750
    //二维码宽高
    let qrcodeWidth = rate * 400
    that.setData({
      qrcodeWidth: qrcodeWidth
    })
    qrcode = new QRCode('canvas', {
      usingIn: that,
      width: qrcodeWidth,
      height: qrcodeWidth,
      colorDark: "#000000", //前景颜色
      colorLight: "white", //背景颜色
      correctLevel: QRCode.CorrectLevel.H,
    })

    let id = that.data.oid
    console.log(id)
    qrcode.makeCode(id)
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

  // 展示所有拼团人数
  toShowAll: function() {
    this.setData({
      cover: true
    })
  },

  // 关闭弹窗
  toClose: function() {
    this.setData({
      cover: false
    })
  },

  // 立即分享
  onShareAppMessage: function(options) {
    if (options.from === 'button') {
      console.log(this.data.order)
      console.log(this.data.details)
      let order_type = this.data.order.type
      if (order_type == 0) { //普通
        return {
          title: this.data.details.title,
          path: '/pages/goods_detail/goods_detail?id=' + this.data.order.detailsId,
        }
      } else if (order_type == 1) { //拼团
        console.log(this.data.aid)
        return {
          title: this.data.details.title,
          path: '/pages/group_detail/group_detail?id=' + this.data.aid,
        }
      } else if (order_type == 2) { //门票
        return {
          title: '门票砍价',
          path: '/pages/index/tickets/tickets',
        }
      } else if (order_type == 3) { //秒杀
        let skill = wx.getStorageSync('skill')
        return {
          title: skill.title,
          path: '/pages/seckill_detail/seckill_detail?oid=' + skill.id,
        }
      } else if (order_type == 4) { //助力
        return {
          title: '助力免单',
          path: '//pages/index/free/free',
        }
      }
    }
  }
})