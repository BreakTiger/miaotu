const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()


Page({


  data: {
    page: 1,
    infoList: [],
    cover: false,
    info: {}
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

  // 已读消息
  toRead: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/Message/read_message'
    request.sendRequest(url, 'post', {
      id: e.currentTarget.dataset.item.id
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            cover: true,
            info: e.currentTarget.dataset.item
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

  // 关闭弹窗
  toClose: function() {
    this.setData({
      cover: false
    })
  },

  onReachBottom: function() {
    let that = this
    let old = that.data.infoList
    let page = that.data.page + 1
    let data = {
      page: page,
      length: 10
    }
    // console.log('参数：', data)
    let url = app.globalData.api + '/portal/Message/index'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          console.log(list)
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