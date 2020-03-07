const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({

  data: {
    nav: [{
        id: 0,
        name: '全部'
      },
      {
        id: 1,
        name: '收入'
      }, {
        id: 2,
        name: '支出'
      }
    ],
    choice_one: 0,
    balance: '0.00',
    page: 1,
    list: []
  },

  onLoad: function(options) {
    this.getBalance()
  },

  // 获取余额
  getBalance: function() {
    let that = this
    let url = app.globalData.api + '/portal/Personal/wallet'
    modals.loading()
    request.sendRequest(url, 'post', {}, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            balance: res.data.data
          })
        }
        that.getList(that.data.choice_one)
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 获取列表
  getList: function(e) {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      type: e
    }
    let url = app.globalData.api + '/portal/Personal/wallet_info'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
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

  // 切换分类
  choice_nav: function(e) {
    let that = this
    let id = that.data.choice_one
    let choice = e.currentTarget.dataset.id
    if (choice != id) {
      that.setData({
        choice_one: choice
      })
      that.getList(that.data.choice_one)
    }
  },

  // 提现
  toMoney: function() {
    wx.showModal({
      title: '提示',
      content: '提现功能暂未开通！',
      showCancel: false
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
    let that = this
    let page = that.data.page + 1
    let type = that.data.choice_one
    let old = that.data.list
    let data = {
      page: page,
      length: 10,
      type: type
    }
    let url = app.globalData.api + '/portal/Personal/wallet_info'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          if (list.length > 0) {
            that.setData({
              page: page,
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