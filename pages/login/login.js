const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  // 授权登录
  toGetUserInfo: function(e) {
    let that = this
    let info = e.detail.userInfo
    let url = app.globalData.api + '/portal/Public/getOpenid'
    modals.loading();
    request.sendRequest(url, 'post', {
      code: wx.getStorageSync('code')
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        let openid = res.data.data.openid
        // console.log(openid)
        that.upUserinfo(info, openid)
      } else {
        modals.loaded()
        wx.showToast({
          title: '系统繁忙，请稍后重试',
          icon: 'none'
        })
      }
    })
  },

  upUserinfo: function(info, openid) {
    // console.log(info)
    // console.log(openid)
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
        wx.setStorageSync('user', info);
        wx.setStorageSync('openid', openid);
        wx.navigateBack({
          delta: 2
        })
      } else {
        wx.showToast({
          title: '系统繁忙，请稍后重试',
          icon: 'none'
        })
      }
    })
  },
})