const request = require('../../../utils/http.js')
import modals from '../../../utils/modal.js'
const app = getApp()

Page({

  data: {
    id: '',
    info: {}
  },

  onLoad: function(options) {
    this.setData({
      id: options.id
    })
    this.getCodeInfo(options.id)
  },

  // 核销订单信息
  getCodeInfo: function(e) {
    let that = this
    let data = {
      id: e
    }
    let url = app.globalData.api + '/portal/Personal/get_check_info'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            info: res.data.data
          })
        } else {
          modals.showToast(res.data.msg, 'none')
          setTimeout(function() {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none');
      }
    })
  },

  // 确定核销
  toSure: function() {
    let that = this
    let data = {
      id: that.data.id
    }
    let url = app.globalData.api + '/portal/Personal/do_check'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast(res.data.msg, 'loading')
          setTimeout(function() {
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
        } else {
          modals.showToast(res.data.msg, 'none');
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none');
      }
    })
  }
})