const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({

  data: {
    data: {},
    page: 1,
    list: [],
    showVideo: false,
    show: false,
    page: 1
  },

  onLoad: function(options) {
    let data = JSON.parse(options.data)
    console.log(data)
    this.setData({
      data: data
    })
    // 判断是否登录
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      this.getList_login(openID)
    } else {
      this.getList_unlogin()
    }
  },


  getList_login: function() {
    console.log('已登录')
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      type: that.data.data.type,
      name: that.data.data.word,
      sid: that.data.data.id
    }
    // console.log('参数：', data)
    let url = app.globalData.api + '/portal/Strategy/lists'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      // console.log(res);
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          for (let i = 0; i < list.length; i++) {
            list[i].showVideo = false
            list[i].show = false
          }
          that.setData({
            list: list
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  getList_unlogin: function() {
    console.log('未登录')
  },



  // 轮播图的视频显示
  toShowVideo: function() {
    let that = this
    let type = that.data.showVideo
    console.log(type)
    if (type) {
      that.setData({
        showVideo: false
      })
    } else {
      that.setData({
        showVideo: true
      })
    }
  },

  // 查看所有的评论 - 弹窗
  toAllComment: function() {

  },

  onShow: function() {

  },

  onPullDownRefresh: function() {

  },
  onReachBottom: function() {

  },

  onShareAppMessage: function() {

  }
})