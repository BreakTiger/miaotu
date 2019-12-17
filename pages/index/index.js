const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    sw_list: [1, 2], //轮播图
    na_list: [{
        icon: '../../icon/group.png',
        name: '单身拼团',
        path: '',
      },
      {
        icon: '../../icon/free.png',
        name: '助力免单',
        path: '',
      },
      {
        icon: '../../icon/tickets.png',
        name: '门票砍价',
        path: '',
      },
      {
        icon: '../../icon/sign.png',
        name: '现金签到',
        path: '',
      }
    ],
    goodsnav: [{
      id: 1,
      name: '推荐'
    }, {
      id: 2,
      name: '最新'
    }, {
      id: 3,
      name: '本地'
    }, {
      id: 4,
      name: '国外'
    }, {
      id: 5,
      name: '小众'
    }, {
      id: 6,
      name: '猎奇'
    }],
    choice_one: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  toPlace: function() {
    wx.navigateTo({
      url: '/pages/index/place/place',
    })
  },

  toSearch:function(){
    wx.navigateTo({
      url: '/pages/index/search/search',
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