// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  bindGetUserInfo: function (e) {
    var openid = wx.getStorageSync('openid');
    var info = e.detail.userInfo
    var that = this
    
    wx.setStorage({
      key: 'avatarUrl',
      data: info.avatarUrl
    })
    wx.setStorage({
      key: 'nickName',
      data: info.nickName
    })
    // 1男；2女；0保密
    wx.setStorage({
      key: 'gender',
      data: info.gender
    })
    //更新用户数据
    var url = app.configData.miaotu.api_url + "/portal/Public/user"
    wx.request({
      url: url,
      data: { nickname: info.nickName, sex: info.gender, city: info.city, avatar: info.avatarUrl, openid: openid },
      method: 'POST',
      header: {
        'content-type': 'application/json',
      },
      success: function (res) {

      }
    })
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})