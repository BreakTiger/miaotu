const request = require('../../../api/http.js');
import modals from '../../../methods/modal.js'
const WxParse = require('../../../wxParse/wxParse.js')
const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    details: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    that.goodsDeatil(options.id);

  },

  // 商品详情
  goodsDeatil: function(e) {
    let that = this
    console.log(e);
    let url = app.globalData.api + '/portal/home/get_details_info'
    request.sendRequest(url, 'post', {
      id: e
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      console.log(res.data.data.details);
      if (res.statusCode == 200) {
        that.setData({
          details: res.data.data.details
        })
        // 产品简介
        let introduce = res.data.data.details.introduce

        // 交通信息
        // let traffic = res.

        // 景点详情

        // 购买须知
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  toEvaluate: function() {
    wx.navigateTo({
      url: '/pages/index/goods/evaluate/evaluate',
    })
  },

  toShop: function() {
    wx.navigateTo({
      url: '/pages/index/goods/shop/shop',
    })
  },

  toOrder: function() {
    wx.navigateTo({
      url: '/pages/index/goods/goods_buy/goods_buy',
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