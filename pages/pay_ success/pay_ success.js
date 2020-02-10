const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({

  data: {
    id: '', //订单ID
    price: '0.00', //订单支付金额
    card: '',
    page: 1,
    leftlist: [],
    rightlist: []
  },

  onLoad: function(options) {
    // console.log(options)
    this.getCard()
  },

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


  // 猜你喜欢
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

  // 查看订单
  toOrderDetail: function() {
    wx.redirectTo({
      url: '/pages/mine/order/order',
    })
  },

  // 返回首页
  toBackHome: function() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },




  onPullDownRefresh: function() {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000);
    this.onLoad();
  },


  onReachBottom: function() {

  }
})