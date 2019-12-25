const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:[],
    login: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
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
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  bindGetUserInfo: function(e){
    var openid = wx.getStorageSync('openid');
    var info = e.detail.userInfo
    var that = this
    that.setData({
      userInfo: info
    })
    wx.setStorage({
      key: 'avatarUrl',
      data: info.avatarUrl
    })
    wx.setStorage({
      key: 'nickName',
      data: info.nickName
    })
    // 1男；2女；0保密
    wx.setStorage({
      key: 'gender',   
      data: info.gender
    })
    //更新用户数据
    var url = app.configData.miaotu.api_url +"/portal/Public/user"
    wx.request({
      url: url,
      data: { nickname: info.nickName, sex: info.gender, city: info.city, avatar: info.avatarUrl, openid: openid},
      method: 'POST',
      header: {
        'content-type': 'application/json',
      },
      success: function (res) {
        
      }
    })
  },

  toNav: function(e) {
    var url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url,
    })
  },

  totravel:function(){
    wx.navigateTo({
      url: '/pages/mine/travel/travel',
    })
  },

  toUpmembers:function(){
    wx.navigateTo({
      url: '/pages/mine/members/members',
    })
  },

  toEdutor:function(){
    wx.navigateTo({
      url: '/pages/mine/user/user',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

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

  }
})