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
    let data = {
      nickname: info.nickName,
      sex: info.gender,
      city: info.city,
      avatar: info.avatarUrl,
      openid: wx.getStorageSync('openid')
    }
    let url = app.globalData.api + '/portal/Public/user'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
      console.log(res);
      if (res.statusCode == 200) {
        console.log('登录成功')
        wx.setStorageSync('openid', openid);
      } else {
        wx.showToast({
          title: '系统繁忙，请稍后重试',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})