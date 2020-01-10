const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({

  data: {
    page: 1,
    list: [],
    pages: 1,
    alist: []
  },


  onLoad: function(options) {
    this.getList()
  },

  // 默认列表
  getList: function() {
    let that = this
    let data = {
      page: that.data.page,
      length: 10
    }
    let url = app.globalData.api + '/portal/Kanjia/index'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            list: res.data.data.data
          })
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },



  // 点击免费拿
  toFreeGet: function(e) {
    let id = e.currentTarget.dataset.id
    // 判断是否登录
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      console.log('立即下单')
      wx.navigateTo({
        url: '/pages/index/tickets/tickets_buy/tickets_buy',
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '需要授权登录后才可以继续操作哦',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
    }
  },

  getFree: function(id) {
    console.log(id);
    let that = this
    let url = app.globalData.api + '/portal/Kanjia/get_kanjia'
    request.sendRequest(url, 'post', {
      id: id
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast(res.data.msg, 'none')
          // that.getMyList(wx.getStorageSync('openid'))
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },


  // 分享好友
  toShareDown: function(e) {
    console.log(e.currentTarget.dataset.item)
    let id = e.currentTarget.dataset.item.id
    wx.navigateTo({
      url: '/pages/tickets_detail/tickets_detail?id=' + id,
    })
  },

  onShow: function() {
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      this.getMyList(openID)
    }
  },

  // 获取我的活动列表
  getMyList: function(openID) {
    let that = this
    let data = {
      page: that.data.pages,
      length: 10
    }
    let url = app.globalData.api + '/portal/Kanjia/my_index'
    request.sendRequest(url, 'post', data, {
      'token': openID
    }).then(function(res) {
      console.log(res.data.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            alist: res.data.data.data
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
  }
})