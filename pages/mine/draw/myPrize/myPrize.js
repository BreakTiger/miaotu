const request = require('../../../../utils/http.js')
import modals from '../../../../utils/modal.js'
const app = getApp()

Page({


  data: {
    page: 1,
    list: []
  },


  onLoad: function(options) {
    this.getPrize()
  },

  // 奖品列表
  getPrize: function() {
    let that = this
    let data = {
      status: 1,
      page: that.data.page,
      length: 10
    }
    let url = app.globalData.api + '/portal/Lottery/get_prize'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data)
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
    this.getPrize()
  },


  onReachBottom: function() {
    let that = this
    let old = that.data.list
    let page = that.data.page + 1
    let data = {
      status: 1,
      page: page,
      length: 10
    }
    let url = app.globalData.api + '/portal/Lottery/get_prize'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          if (list.length > 0) {
            that.setData({
              list: old.concat(list)
            })
          }
        } else {
          modals.showToast('我也是有底线的', 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  }
})