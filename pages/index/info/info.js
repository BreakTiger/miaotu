const request = require('../../../utils/http.js')
import modals from '../../../utils/modal.js'
const app = getApp()


Page({


  data: {
    page: 1,
    infoList: [],
    //详情
    cover: false,
    info: {}
  },

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
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
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

  // 读取消息
  toRead: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/Message/read_message'
    request.sendRequest(url, 'post', {
      id: e.currentTarget.dataset.item.id
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let indexs = e.currentTarget.dataset.index
          let list = that.data.infoList
          list.forEach(function(item, index) {
            if (index == indexs) {
              if (item.status == 0) {
                item.status = 1
              }
            }
          })
          that.setData({
            cover: true,
            infoList: list,
            info: e.currentTarget.dataset.item
          })
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 关闭弹窗
  toClose: function() {
    this.setData({
      cover: false
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
    this.setData({
      page: 1
    })
    this.getList()
  },

  onReachBottom: function() {
    let that = this
    let old = that.data.infoList
    let page = that.data.page + 1
    let data = {
      page: page,
      length: 10
    }
    let url = app.globalData.api + '/portal/Message/index'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          if (list.length > 0) {
            that.setData({
              page: page,
              infoList: old.concat(list)
            })
          }
        } else {
          modals.showToast('我也是有底线的', 'none');
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  }
})