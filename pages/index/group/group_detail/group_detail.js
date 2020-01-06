const request = require('../../../../api/http.js')
import modals from '../../../../methods/modal.js'
const WxParse = require('../../../../wxParse/wxParse.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
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
    shop: {},
    packages: [],
    startTime: '',
    discuss: {},
    page: 1,
    group: [],
    collecttype: false,
    shad: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      id: options.id
    })
    let openID = wx.getStorageSync('openid')
    // 判断是否登录
    if (openID) { //已经登录
      this.getShopInfo()
    } else { //未登录
      this.getShopInfo()
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  // 获取商品信息
  getShopInfo: function() {
    let that = this
    let url = app.globalData.api + '/portal/Pintuan/info'
    modals.loading()
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      // console.log(res.data.data)
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let details = res.data.data.info
          that.setData({
            details: details,
            shop: res.data.data.shop,
            packages: res.data.data.setmeal
          })
          // 绑定富文本:
          // 产品简介
          let introduce = details.introduce
          WxParse.wxParse('introduce', 'html', introduce, that, 5);
          // 交通信息
          let traffic = details.traffic
          WxParse.wxParse('traffic', 'html', traffic, that, 5);
          // 购买须知
          let buy = details.buy_notice
          WxParse.wxParse('buy', 'html', buy, that, 5);
          that.trailer(details.article_type)
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 活动开始预告
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
      // console.log(res.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            startTime: res.data.data
          })
          that.getReview()
        } else {
          modals.showToast(res.data.msg, 'none')
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
    // console.log(data);
    let url = app.globalData.api + '/portal/home/comment'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      // console.log(res.data)
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            discuss: res.data.data.data
          })
        }
        that.joinGroup()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 拼单情况 - 未登录下
  joinGroup: function() {
    let that = this
    let data = {
      id: that.data.id,
      page: that.data.page,
      length: 10
    }
    // console.log('参数：', data);
    let url = app.globalData.api + '/portal/Pintuan/info_desc'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      console.log(res.data)
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          // that.collectState()
        } else {
          modals.showToast(res.data.status, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  onShow: function() {
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      this.collectState()
    }
  },


  // 拼单情况-登陆下




  // 产品收藏状态
  collectState: function() {
    let that = this
    let url = app.globalData.api + '/portal/Shop/collect'
    modals.loading()
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      // console.log(res.data);
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          if (res.data.data == 0) { //未收藏
            that.setData({
              collecttype: false
            })
          } else { //收藏
            that.setData({
              collecttype: true
            })
          }
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
    modals.loading()
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      // console.log(res)
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast(res.data.msg, 'none')
          that.collectState()
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 取消收藏
  toCanel: function() {
    let that = this
    let url = app.globalData.api + '/portal/Shop/out_collect'
    modals.loading()
    request.sendRequest(url, 'post', {
      id: that.data.id
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      // console.log(res)
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast(res.data.msg, 'none')
          that.collectState()
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 查看所有拼团
  allGroup: function() {
    this.setData({
      shad: true
    })
  },

  // 关闭弹窗
  toClose: function() {
    this.setData({
      shad: false
    })
  },

  // 去到商铺
  toShop: function(e) {
    wx.navigateTo({
      url: '/pages/index/goods/shop/shop?sid=' + e.currentTarget.dataset.sid,
    })
  },

  // 立即预定
  toOrder: function() {
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      let data = {
        id: this.data.details.id,
        tao: this.data.packages,
        uid: '',
        price: this.data.details.pt_price
      }
      console.log('参数：', data)
      wx.navigateTo({
        url: '/pages/index/group/group_buy/group_buy?data=' + JSON.stringify(data),
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }

  },

  // 禁止手动滑动
  catchTouchMove: function(res) {
    return false
  },



  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    if (options.from === 'button') {}
    return {
      title: this.data.details.title,
      path: '/pages/index/group/group_detail/group_detail?id=' + this.data.id,
    }
  }
})