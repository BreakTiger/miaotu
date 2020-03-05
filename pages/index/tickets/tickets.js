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
      length: 15
    }
    let url = app.globalData.api + '/portal/Kanjia/my_index'
    request.sendRequest(url, 'post', data, {
      'token': openID
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            alist: res.data.data.data
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
      that.getList()
    })
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
    console.log(id)
    // 判断是否登录
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      wx.navigateTo({
        url: '/pages/buy_typefour/buy_typefour?id=' + id,
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

  // 分享好友
  toShareDown: function(e) {
    console.log(e.currentTarget.dataset.item)
    let id = e.currentTarget.dataset.item.id
    wx.navigateTo({
      url: '/pages/tickets_detail/tickets_detail?id=' + id,
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
    this.onLoad()
  },

  onReachBottom: function() {
    let that = this
    let old = that.data.list
    let pages = that.data.page + 1
    let data = {
      page: pages,
      length: 10
    }
    let url = app.globalData.api + '/portal/Kanjia/index'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      console.log(res)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let lists = res.data.data.data
          if (lists.length > 0) {
            that.setData({
              list: old.concat(lists),
              page: pages
            })
          }
        } else {
          modals.showToast('我也是有底线的', 'none');
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none');
      }
    })
  }
})