const request = require('../../utils/http.js')
import modals from '../../utils/modal.js'
const app = getApp()

Page({


  data: {
    page: 1,
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      id: options.id
    })
    this.review(options.id)
  },

  review: function(e) {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      details_id: e
    }
    let url = app.globalData.api + '/portal/home/comment'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        that.setData({
          list: res.data.data.data
        })
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
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
    this.onLoad({
      id: this.data.id
    });
  },


  onReachBottom: function() {

  },


  onShareAppMessage: function() {

  }
})