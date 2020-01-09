const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({

  data: {
    sw_list: [],
    page: 1,
    list: [],
    lefts: 18
  },

  onLoad: function(options) {
    this.getBanner()
  },

  // 轮播图
  getBanner: function() {
    let that = this
    let url = app.globalData.api + '/portal/Home/get_slide_item'
    modals.loading()
    request.sendRequest(url, 'post', {
      tags: 2
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      // console.log(res)
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            sw_list: res.data.data
          })
          that.getList()
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 列表
  getList: function() {
    let that = this
    let data = {
      page: that.data.page,
      length: 10
    }
    let url = app.globalData.api + '/portal/Pintuan/index'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      console.log(res)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            list: res.data.data.data
          })
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 拼团详情
  toGoodsDetail: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/group_detail/group_detail?id=' + id,
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
    this.onLoad();
  },

  
  onReachBottom: function() {
    let that = this
    let page = that.data.page + 1
    let old = that.data.list
    let data = {
      page: page,
      length: 10
    }
    console.log('参数：', data)
    let url = app.globalData.api + '/portal/Pintuan/index'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      console.log(res)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let news = res.data.data.data
          that.setData({
            list: old.concat(news)
          })
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },
})