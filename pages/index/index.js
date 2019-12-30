const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

let openid = wx.getStorageSync('openid')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sw_list: [], //轮播图
    noread: null,
    na_list: [{
        icon: '../../icon/group.png',
        name: '单身拼团',
        path: '/pages/index/group/group',
      },
      {
        icon: '../../icon/free.png',
        name: '助力免单',
        path: '/pages/index/free/free',
      },
      {
        icon: '../../icon/tickets.png',
        name: '门票砍价',
        path: '/pages/index/tickets/tickets',
      },
      {
        icon: '../../icon/sign.png',
        name: '现金签到',
        path: '/pages/index/sign/sign',
      }
    ],
    goodsnav: [{
      id: 5,
      name: '推荐'
    }, {
      id: 6,
      name: '最新'
    }, {
      id: 1,
      name: '本地'
    }, {
      id: 2,
      name: '国外'
    }, {
      id: 3,
      name: '小众'
    }, {
      id: 4,
      name: '猎奇'
    }],
    choice_one: 5
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.getLocation({
      success: function(res) {
        console.log(res);
        console.log(res.latitude)
        console.log(res.longitude)
      },
    })
    this.unread()
  },

  // 未读消息数量
  unread: function() {
    let that = this
    let url = app.globalData.api + '/portal/Message/no_read'
    request.sendRequest(url, 'post', {}, {
      'token': openid
    }).then(function(res) {
      console.log(res.data)
      if (res.statusCode == 200) {
        that.setData({
          noread: res.data.data
        })
        that.getBanner()
      } else {
        wx.showToast({
          title: '系统繁忙，请稍后重试',
          icon: 'none'
        })
      }
    })

  },

  // 获取轮播
  getBanner: function() {
    let that = this
    let url = app.globalData.api + '/portal/Home/get_slide_item'
    request.sendRequest(url, 'post', {
      tags: 1
    }, {
      'token': openid
    }).then(function(res) {
      if (res.statusCode == 200) {
        that.setData({
          sw_list: res.data.data
        })
      } else {
        wx.showToast({
          title: '系统繁忙，请稍后重试',
          icon: 'none'
        })
      }
    })
  },

  toGetKind: function(e) {
    let id = e.currentTarget.dataset.id
    let choice = this.data.choice_one
    if (choice != id) {
      this.setData({
        choice_one: id
      })
    }
  },




  toPlace: function() {
    wx.navigateTo({
      url: '/pages/index/place/place',
    })
  },

  toSearch: function() {
    wx.navigateTo({
      url: '/pages/index/search/search',
    })
  },

  toNav: function(e) {
    var url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url,
    })
  },
  toInfo: function() {
    wx.navigateTo({
      url: '/pages/index/info/info',
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