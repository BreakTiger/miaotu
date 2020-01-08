const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({

  data: {
    tlist: [{
        id: 1,
        name: '关注'
      },
      {
        id: 2,
        name: '发现'
      },
      {
        id: 3,
        name: '问答'
      },
      {
        id: 4,
        name: '精选'
      }
    ],
    choice_one: 1
  },


  onLoad: function(options) {
    // 判断用户是否登陆
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    } else {

    }
  },


  // 发布
  tosend: function() {
    wx.navigateTo({
      url: '/pages/strategy/send/send',
    })
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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


})