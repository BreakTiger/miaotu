const request = require('../../api/http.js');
import modals from '../../methods/modal.js'
const WxParse = require('../../wxParse/wxParse.js')
const app = getApp()

Page({

  data: {
    top: [{
        name: '商品'
      },
      {
        name: '详情'
      },
      {
        name: '须知'
      }
    ],
    id: '',
    details: {},
    packages: [],
    startTime: '',
    discuss: {},
    collecttype: false
  },

  onLoad: function(options) {
    this.setData({
      id: options.id
    })
    this.getShopInfo()
    let openID = wx.getStorageSync('openid') || ''
    if (!openID){
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
  },

  // 获取商品信息
  getShopInfo: function() {
    let that = this
    let url = app.globalData.api + '/portal/home/get_details_info'
    modals.loading()
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let details = res.data.data.details
          let packages = res.data.data.setmeal
          that.setData({
            details: details,
            packages: packages
          })
          let introduce = details.introduce
          WxParse.wxParse('introduce', 'html', introduce, that, 5);
          let traffic = details.traffic
          WxParse.wxParse('traffic', 'html', traffic, that, 5);
          let buy = details.buy_notice
          WxParse.wxParse('buy', 'html', buy, that, 5);
          that.trailer(details.article_type)
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 活动预告
  trailer: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/home/get_foreshow'
    modals.loading()
    request.sendRequest(url, 'post', {
      type: e
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            startTime: res.data.data
          })
          that.getReview()
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 获取评论
  getReview: function() {
    let that = this
    let data = {
      page: 1,
      length: 1,
      details_id: that.data.details.id
    }
    let url = app.globalData.api + '/portal/home/comment'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            discuss: res.data.data.data
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  onShow: function() {
    let that = this
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      that.collectType(openID)
    }
  },

  // 收藏状态
  collectType: function(openID) {
    let that = this
    let url = app.globalData.api + '/portal/Shop/collect'
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
      'token': openID
    }).then(function(res) {
      // console.log(res.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          if (res.data.data == 0) {
            that.setData({
              collecttype: false
            })
          } else {
            that.setData({
              collecttype: true
            })
          }
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 收藏
  toCollect: function() {
    let that = this
    let url = app.globalData.api + '/portal/Shop/set_collect'
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast(res.data.msg, 'none')
          that.collectType(wx.getStorageSync('openid'))
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 取消收藏
  toCancel: function() {
    let that = this
    let url = app.globalData.api + '/portal/Shop/out_collect'
    modals.loading()
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast(res.data.msg, 'none')
          that.collectType(wx.getStorageSync('openid'))
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 查看所有评论
  toEvaluate: function(e) {
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/evaluate/evaluate?id=' + e.currentTarget.dataset.id,
    })
  },

  // 去到商铺
  toShop: function(e) {
    wx.navigateTo({
      url: '/pages/shop/shop?sid=' + e.currentTarget.dataset.sid,
    })
  },

  // 立即预定
  toOrder: function() {
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      let data = {
        id: this.data.details.id,
        tao: this.data.packages
      }
      wx.navigateTo({
        url: '/pages/buy_typeone/buy_typeone?data=' + JSON.stringify(data),
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您需要授权后，才可进行此项操作',
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



  onPullDownRefresh: function() {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000);
    this.onLoad({
      id: this.data.id
    })
  },

  onShareAppMessage: function() {
    if (options.from === 'button') {}
    return {
      title: this.data.details.title,
      path: '/pages/goods_detail/goods_detail?id=' + this.data.id,
    }
  }
})