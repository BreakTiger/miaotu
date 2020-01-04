const request = require('../../../api/http.js');
import modals from '../../../methods/modal.js'
const WxParse = require('../../../wxParse/wxParse.js')
const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: [{
        name: '商品'
      },
      {
        name: '详情'
      },
      {
        name: '须知'
      }
    ],

    details: {},
    startTime: '',
    hint:'',
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
      console.log(res);
      console.log(res.data.data.details);
      if (res.statusCode == 200) {
        let result = res.data.data.details
        that.setData({
          details: result,
          hint: result.twice_submit
        })
        // 产品简介
        let introduce = result.introduce
        WxParse.wxParse('introduce', 'html', introduce, that, 5);
        // 交通信息
        let traffic = result.traffic
        WxParse.wxParse('traffic', 'html', traffic, that, 5);
        // 购买须知
        let buy = result.buy_notice
        WxParse.wxParse('buy', 'html', buy, that, 5);
        that.trailer(result.article_type)
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },
  // 预告
  trailer: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/home/get_foreshow'
    modals.loading()
    request.sendRequest(url, 'post', {
      type: e
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        that.setData({
          startTime: res.data.data
        })
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