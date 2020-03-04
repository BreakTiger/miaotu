const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()


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

  // 消息列表
  getList: function() {
    let that = this
    let data = {
      page: that.data.page,
      length: 10
    }
    let url = app.globalData.api + '/portal/Message/index'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            infoList: res.data.data.data
          })
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 信息已读
  toRead: function(e) {
    console.log(e.currentTarget.dataset.id)
    let that = this
    let url = app.globalData.api + '/portal/Message/read_message'
    request.sendRequest(url, 'post', {
      id: e.currentTarget.dataset.id
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.getList()
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },


  onPullDownRefresh: function() {

  },


  onReachBottom: function() {

  }
})