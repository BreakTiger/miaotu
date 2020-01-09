const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({

  
  data: {
    page: 1,
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id = options.id
    this.review(id)
  },

  review: function (e) {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      details_id: e
    }
    console.log(data);
    let url = app.globalData.api + '/portal/home/comment'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function (res) {
      console.log(res);
      if (res.statusCode == 200) {
        that.setData({
          list: res.data.data.data
        })
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  

  
  onPullDownRefresh: function () {

  },

  
  onReachBottom: function () {

  },

  
  onShareAppMessage: function () {

  }
})