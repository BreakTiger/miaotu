const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({

  data: {},

  // 授权登录
  toGetUserInfo: function(e) {
    let that = this
    let info = e.detail.userInfo
    let url = app.globalData.api + '/portal/Public/getOpenid'
    modals.loading()
    request.sendRequest(url, 'post', {
      code: wx.getStorageSync('code')
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let openid = res.data.data.openid
          that.upUserinfo(info, openid)
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none');
      }
    })
  },

  upUserinfo: function(info, openid) {
    let data = {
      nickname: info.nickName,
      sex: info.gender,
      city: info.city,
      avatar: info.avatarUrl,
      openid: openid
    }
    let url = app.globalData.api + '/portal/Public/user'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast('授权成功', 'none')
          wx.setStorageSync('user', info);
          wx.setStorageSync('openid', openid);
          setTimeout(function() {
            wx.navigateBack({
              delta: 2
            })
          }, 2000)
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none');
      }
    })
  }
})