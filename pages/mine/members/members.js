// pages/mine/members/members.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardlist: [{
        id: 1,
        img: '../../../resources/card_one.png',
        money: 99,
        card: '大众会员',
        cardType: '8.5折会员卡',
        state: '首单最高立减666元'
      },
      {
        id: 2,
        img: '../../../resources/card_two.png',
        money: 99,
        card: '黄金会员',
        cardType: '8.5折会员卡',
        state: '首单最高立减666元'
      },
      {
        id: 3,
        img: '../../../resources/card_three.png',
        money: 99,
        card: '铂金会员',
        cardType: '8.5折会员卡',
        state: '首单最高立减666元'
      },
      {
        id: 4,
        img: '../../../resources/card_four.png',
        money: 99,
        card: '钻石会员',
        cardType: '8.5折会员卡',
        state: '首单最高立减666元'
      },
      {
        id: 5,
        img: '../../../resources/card_five.png',
        money: 99,
        card: '至尊会员',
        cardType: '8.5折会员卡',
        state: '首单最高立减666元'
      }
    ],
    top: 160,
    move: 70
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  toIntegral: function() {
    wx.navigateTo({
      url: '/pages/mine/sign_in/sign_in',
    })
  },

  toDraw: function() {
    wx.navigateTo({
      url: '/pages/mine/draw/draw',
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