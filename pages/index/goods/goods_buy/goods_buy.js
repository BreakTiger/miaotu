// pages/index/goods/goods_buy/goods_buy.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    new app.ToastPannel();
  },

  /**
   * 发起支付
   */
  pay:function(){
    var that = this
    wx.request({
      url: app.configData.miaotu.api_url +'/portal/Pay/do_pay',
      method:'POST',
      data:{order_id:6},
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': 'oioNa5F9v7bcbtJRrXl4e3mz8-Xs',
      },
      success: function(res){
        var timeStamp = res.data.data.timeStamp
        var nonceStr = res.data.data.nonceStr
        var packages = res.data.data.package
        var paySign = res.data.data.paySign
        var payNum = res.data.data.payNum

        if (res.data.status == 1) {
          wx.requestPayment({
            'timeStamp': timeStamp,
            'nonceStr': nonceStr,
            'package': packages,
            'signType': 'MD5',
            'paySign': paySign,
            'success': function (re) {
              that.show('支付成功')
            }, fail: function (res) {
              that.show('取消支付')
            }
          })
        } else {
          that.show('请求失败，请稍后再试')
        }
      }
    })
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