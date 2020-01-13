const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

let openid = wx.getStorageSync('openid')

Page({

  data: {
    login: 0,
    person: [],
    person_like: [],
    nav: [{
        id: 1,
        icon: '../../icon/track.png',
        name: '足迹',
        path: '/pages/mine/track/track'
      },
      {
        id: 2,
        icon: '../../icon/order.png',
        name: '订单',
        path: '/pages/mine/order/order'
      },
      {
        id: 3,
        icon: '../../icon/certificates.png',
        name: '礼券',
        path: '/pages/mine/coupon/coupon'
      },
      {
        id: 4,
        icon: '../../icon/wallet.png',
        name: '钱包',
        path: '/pages/mine/wallet/wallet'
      }
    ],
    travelList: []
  },

  onLoad: function(options) {

  },

  // 去登陆
  toLogin: function() {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },

  toNav: function(e) {
    var url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url,
    })
  },

  totravel: function() {
    wx.navigateTo({
      url: '/pages/mine/travel/travel',
    })
  },

  toUpmembers: function() {
    wx.navigateTo({
      url: '/pages/mine/members/members',
    })
  },

  toEdutor: function() {
    wx.navigateTo({
      url: '/pages/mine/user/user',
    })
  },

  toAttention: function() {
    wx.navigateTo({
      url: '/pages/mine/attention/attention',
    })
  },

  tosend: function() {
    wx.navigateTo({
      url: '/pages/strategy/send/send',
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let openid = wx.getStorageSync('openid') || ''
    console.log('openid:', openid)
    // 判断登录状态
    if (openid) {
      console.log('已登录')
      this.setData({
        login: 1
      })
      this.getParson()
    } else {
      console.log('未登陆')
      this.setData({
        login: 0
      })
    }
  },

  // 获取个人资料
  getParson: function() {
    let that = this
    let url = app.globalData.api + '/portal/Personal/user_info'
    request.sendRequest(url, 'post', {}, {
      'token': openid
    }).then(function(res) {
      if (res.statusCode == 200) {
        // console.log(res)
        that.setData({
          person: res.data.data
        })
        that.getLike()
      } else {
        wx.showToast({
          title: '系统繁忙，请稍后重试',
          icon: 'none'
        })
      }
    })
  },

  // 获赞+粉丝+关注
  getLike: function() {
    let that = this
    let url = app.globalData.api + '/portal/Personal/get_like'
    request.sendRequest(url, 'post', {}, {
      'token': openid
    }).then(function(res) {
      // console.log(res.data.data);
      if (res.statusCode == 200) {
        that.setData({
          person_like: res.data.data
        })
      } else {
        wx.showToast({
          title: '请求失败，请稍后重试',
          icon: 'none'
        })
      }
    })
  },

  // 我的游记



  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },


})