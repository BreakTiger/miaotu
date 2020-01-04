const request = require('../../../../api/http.js')
import modals from '../../../../methods/modal.js'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sid: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      sid: options.sid
    })
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      this.getShop(openID, options.sid)
    } else {

    }
  },

  // 店铺基础信息
  getShop: function(openID, e) {
    let that = this
    let url = app.globalData.api + '/portal/Shop/shop_info'
    request.sendRequest(url, 'post', {
      id: e
    }, {
      'token': openID
    }).then(function(res) {
      console.log(res);
      if (res.statusCode == 200) {

      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
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