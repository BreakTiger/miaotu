const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    balance: null,
    signType: null,
    goodsnav: [{
        id: 5,
        name: '推荐'
      },
      {
        id: 6,
        name: '最新'
      },
      {
        id: 1,
        name: '本地'
      },
      {
        id: 2,
        name: '国外'
      },
      {
        id: 3,
        name: '小众'
      },
      {
        id: 4,
        name: '猎奇'
      }
    ],
    choice_one: 5,
    page: 1,
    leftlist: [],
    rightlist: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getList(this.data.choice_one)
  },

  getList: function(e) {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      type: e
    }
    let url = app.globalData.api + '/portal/Home/get_type_details'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        let list = res.data.data.data
        let len = list.length
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



  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let openID = wx.getStorageSync('openid') || '';
    if (openID) {
      this.signning(openID)
    } else {
      wx.showModal({
        title: '提示',
        content: '授权登录后才可以签到哦',
        success: function(res) {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/login/login',
            })
          } else if (res.cancel) {
            wx.navigateBack({
              delta: 2
            })
          }
        }
      })
    }
  },

  // 签到状态 + 余额
  signning: function(openID) {
    let that = this
    let url = app.globalData.api + '/portal/Sign/info'
    request.sendRequest(url, 'post', {}, {
      'token': openID
    }).then(function(res) {
      console.log(res.data.data);
      if (res.statusCode == 200) {
        that.setData({
          balance: res.data.data.user.balance
        })
        // 判断签到状态
        if (res.data.data.user.end_time == '0000-00-00') {
          that.setData({
            signType: true
          })
        } else {
          let data = new Date()
          let time = data.getFullYear() + '-' + (data.getMonth() + 1) + '-' + data.getDate()
          if (res.data.data.user.end_time == time) {
            that.setData({
              signType: false
            })
          }
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 立即签到
  toSign: function() {
    let that = this
    let url = app.globalData.api + '/portal/Sign/do_sign'
    request.sendRequest(url, 'post', {}, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res)
      if (res.statusCode == 200) {
        console.log(res.data)
        modals.showToast(res.data.msg, 'none')
        that.signning(wx.getStorageSync('openid'))
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
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