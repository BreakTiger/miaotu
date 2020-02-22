const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({


  data: {
    id: ''
  },


  onLoad: function(options) {
    console.log(options.id)
    this.setData({
      id: options.id
    })
  },

  
  onShow: function() {
    let openID = wx.getStorageSync('openid')||''
    if (!openID){
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }

  },

  onPullDownRefresh: function() {

  },

  
  onReachBottom: function() {

  },

  onShareAppMessage: function() {

  }
})