// pages/mine/draw/draw.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    turntable: [{
        id: 1,
        name: '¥100',
        icon: '../../../icon/draw_one.png',
        round: 30
      },
      {
        id: 2,
        name: '50减去20',
        icon: '../../../icon/draw_two.png',
        round: 90
      },
      {
        id: 3,
        name: '+34',
        icon: '../../../icon/draw_three.png',
        round: 150
      },
      {
        id: 4,
        name: '满200减30',
        icon: '../../../icon/draw_four.png',
        round: -150
      }, {
        id: 5,
        name: '首单减¥1000',
        icon: '../../../icon/draw_five.png',
        round: -90
      }, {
        id: 6,
        name: '+29',
        icon: '../../../icon/draw_six.png',
        round: -30
      }
    ],
    covers: false,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  toPrize: function() {
    wx.navigateTo({
      url: '/pages/mine/draw/prize/prize',
    })
  },
  toRules: function() {
    wx.navigateTo({
      url: '/pages/mine/draw/rules/rules',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // 创建动画
    this.animation = wx.createAnimation()
  },

  // 选择
  rotate: function() {
    this.animation.rotate(Math.random() * 720 - 360).step()
    this.setData({
      animation: this.animation.export()
    })
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