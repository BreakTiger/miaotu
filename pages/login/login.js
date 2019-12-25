var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    appid: 'wx50dfda425882fd70',
    secret: 'a69dc9bcd562f6e218466431d9878019',
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
  bindGetUserInfo: function () {
    
    var that = this
        wx.getSetting({
          success: function (res) {
            var that = this
              if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                wx.getUserInfo({
                  success: function (res) {

                    console.log(res.userInfo.nickName)
                    var name = res.userInfo.nickName

                    try {
                      wx.setStorageSync('userName', name)
                    } catch (e) {
                    }
                    // this.globalData = res.userInfo

                    var url = app.configData.activity.api_url + "/admin/index.php?ctl=home_Wxapp&act=getUnionid"
                    var session_key = wx.getStorageSync('session_key')
                    console.log(session_key)
                    wx.request({
                      url: url,
                      data: { appid: 'wx50dfda425882fd70', session_key: session_key, encryptedData: res.encryptedData, iv: res.iv },
                      header: { 'content-type': 'application/json', },
                      method: 'GET',
                      success: function (re) {
                        wx.setStorage({
                          key: 'head',
                          data: re.header['Set-Cookie'],
                        })
                        wx.navigateBack({
                          delta: 1
                        })
                      },
                    })
                  }
                })
              }
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

})