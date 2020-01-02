const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

let openid = wx.getStorageSync('openid')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    infoList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getList()
  },

  getList: function() {
    let that = this
    let data = {
      page: that.data.page,
      length: 10
    }
    let url = app.globalData.api + '/portal/Message/index'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'token': openid
    }).then(function(res) {
      modals.loaded()
      console.log(res.data.data.data)
      if (res.statusCode == 200) {
        that.setData({
          infoList: res.data.data.data
        })
      }
    })
  },

  toRead: function(e) {
    console.log(e.currentTarget.dataset.id)
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