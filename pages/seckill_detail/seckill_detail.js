const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({

  data: {
    id: ''
  },

  onLoad: function(options) {
    console.log(options)
    this.setData({
      id: options.oid
    })
    this.getShopInfo(options.oid)
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
    }
  },

  getShopInfo: function(e) {
    let that = this
    console.log(e)
    let url = app.globalData.api + '/portal/home/get_details_info'
    request.sendRequest(url, 'post', {
      id: e
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      console.log(res)
    })


  },


  onShow: function() {

  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})