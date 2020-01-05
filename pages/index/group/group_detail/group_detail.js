const request = require('../../../../api/http.js')
import modals from '../../../../methods/modal.js'
const WxParse = require('../../../../wxParse/wxParse.js')
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
    id: '',
    details: {},
    shop: {},
    startTime: '',
    discuss:[],
    collecttype: false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      id: options.id
    })
    this.goodsDeatil(options.id);
  },

  goodsDeatil: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/Pintuan/info'
    request.sendRequest(url, 'post', {
      id: e
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      // console.log(res);
      if (res.statusCode == 200) {
        let details = res.data.data.info
        // console.log(details)
        let shop = res.data.data.shop
        console.log(shop)
        that.setData({
          details: details,
          shop: shop
        })

        // 产品简介
        let introduce = details.introduce
        WxParse.wxParse('introduce', 'html', introduce, that, 5);
        // 交通信息
        let traffic = details.traffic
        WxParse.wxParse('traffic', 'html', traffic, that, 5);
        // 购买须知
        let buy = details.buy_notice
        WxParse.wxParse('buy', 'html', buy, that, 5);

        that.trailer(details.article_type)
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 预告
  trailer: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/home/get_foreshow'
    request.sendRequest(url, 'post', {
      type: e
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      console.log(res)
      if (res.statusCode == 200) {
        that.setData({
          startTime: res.data.data
        })
        that.review()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  review: function() {
    let that = this
    let data = {
      page: 1,
      length: 1,
      details_id: that.data.details.id
    }
    let url = app.globalData.api + '/portal/home/comment'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        // console.log(res.data.data.data)
        that.setData({
          discuss: res.data.data.data
        })
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },


  // 查看全部评价
  toEvaluate: function (e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/index/goods/evaluate/evaluate?id=' + id,
    })
  },

  // 去到商铺
  toShop: function (e) {
    wx.navigateTo({
      url: '/pages/index/goods/shop/shop?sid=' + e.currentTarget.dataset.sid,
    })
  },

  // 立即下单
  toOrder: function () {
    wx.navigateTo({
      url: '/pages/index/goods/goods_buy/goods_buy',
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