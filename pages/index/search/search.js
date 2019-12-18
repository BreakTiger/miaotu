const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hislist: [{
        id: 1,
        name: '西藏骑行'
      },
      {
        id: 2,
        name: '北京阅兵'
      },
      {
        id: 3,
        name: '长隆一日游'
      },
      {
        id: 4,
        name: '广州塔'
      },
      {
        id: 5,
        name: '普吉岛'
      }
    ],
    hotlist: [{
        id: 1,
        name: '西藏骑行'
      },
      {
        id: 2,
        name: '北京阅兵'
      },
      {
        id: 3,
        name: '长隆一日游'
      },
      {
        id: 4,
        name: '广州塔'
      },
      {
        id: 5,
        name: '普吉岛'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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