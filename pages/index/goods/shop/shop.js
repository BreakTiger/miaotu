const request = require('../../../../api/http.js')
import modals from '../../../../methods/modal.js'
const app = getApp()



Page({

  /**
   * 页面的初始数据
   */
  data: {
    sid: '',
    card: '',
    leftlist: [],
    rightlist: [],
    status: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options)
    let id = options.sid
    this.setData({
      sid: id
    })
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
      //未登录
      this.getShop(options.sid)
    }
  },

  // 店铺基础信息
  getShop: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/Shop/shop_info'
    request.sendRequest(url, 'post', {
      id: e
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        that.setData({
          shop: res.data.data
        })
        if (res.data.data.status == 0) {
          that.setData({
            status: false
          })
        } else {
          that.setData({
            status: true
          })
        }
        that.getCard()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  getCard: function() {
    let that = this
    let url = app.globalData.api + '/portal/Home/get_slide_item'
    request.sendRequest(url, 'post', {
      tags: 9
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        that.setData({
          card: res.data.data[0].image
        })
        that.getList()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  getList: function() {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      id: that.data.sid
    }
    let url = app.globalData.api + '/portal/Shop/index'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      // console.log(res.data.data);
      if (res.statusCode == 200) {
        let list = res.data.data.data
        // console.log(list)
        let len = list.length
        // console.log('长度：', len)
        if (len > 0) {
          let half = (len / 2).toFixed(0);
          that.setData({
            leftlist: list.slice(0, half),
            rightlist: list.slice(half, len)
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 查看店铺详情
  toGoodsDetail: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/index/goods/goods?id=' + id,
    })
  },

  enshrine: function() {
    let that = this
    let openID = wx.getStorageSync('openid') || ''
    if (openID) { //登陆下
      // 判断是否已经关注
      let type = that.data.status
      if (type) { //取消
        that.cancel()
      } else { //关注
        that.attention()
      }
    } else { //未登录
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  // 关注
  attention: function() {
    let that = this
    let url = app.globalData.api + '/portal/Shop/attention'
    request.sendRequest(url, 'post', {
      id: that.data.sid
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      // console.log(res);
      if (res.statusCode == 200) {
        modals.showToast(res.data.msg, 'none')
        that.getShops(wx.getStorageSync('openid'), that.data.sid)
      } else {
        modals.showToast(res.data.msg, 'none')
      }
    })
  },

  // 取消关注
  cancel: function() {
    let that = this
    let url = app.globalData.api + '/portal/Shop/out_attention'
    request.sendRequest(url, 'post', {
      id: that.data.sid
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        modals.showToast(res.data.msg, 'none')
        that.getShops(wx.getStorageSync('openid'), that.data.sid)
      } else {
        modals.showToast(res.data.msg, 'none')
      }
    })
  },






  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      // 登录下
      this.getShops(openID, this.data.sid)
    }
  },


  getShops: function(openID, e) {
    let that = this
    let url = app.globalData.api + '/portal/Shop/shop_info'
    request.sendRequest(url, 'post', {
      id: e
    }, {
      'token': openID
    }).then(function(res) {
      // console.log(res.data);
      if (res.statusCode == 200) {
        that.setData({
          shop: res.data.data
        })
        if (res.data.data.status == 0) {
          that.setData({
            status: false
          })
        } else {
          that.setData({
            status: true
          })
        }
        that.getCard()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
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