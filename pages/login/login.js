const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({

  data: {
    type: '',
  },

  onLoad: function(options) {
    let type = wx.getStorageSync('share') || ''
    if (type) {
      this.setData({
        type: type
      })
    }
  },

  // 授权登录 -1
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


  // 授权登录 -2
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
          if (this.data.type) {
            console.log('存在')
            this.invitat(this.data.type, openid)
          } else {
            console.log('不存在')
            setTimeout(function() {
              wx.navigateBack({
                delta: 1
              })
            }, 2000)
          }

        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none');
      }
    })
  },

  // 邀请新人， 获取抽奖次数
  invitat: function(type, openid) {
    let that = this
    let data = {
      uopenid: openid,
      type: type
    }
    let url = app.globalData.api + '/portal/Home/set_share'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          setTimeout(function() {
            wx.navigateBack({
              delta: 1
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