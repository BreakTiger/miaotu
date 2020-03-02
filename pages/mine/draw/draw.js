const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    turntable: [{
        id: 1,
        name: '¥100',
        icon: '../../../icon/draw_one.png',
        round: 30
      },
      {
        id: 2,
        name: '50减去20',
        icon: '../../../icon/draw_two.png',
        round: 90
      },
      {
        id: 3,
        name: '+34',
        icon: '../../../icon/draw_three.png',
        round: 150
      },
      {
        id: 4,
        name: '满200减30',
        icon: '../../../icon/draw_four.png',
        round: -150
      }, {
        id: 5,
        name: '首单减¥1000',
        icon: '../../../icon/draw_five.png',
        round: -90
      }, {
        id: 6,
        name: '+29',
        icon: '../../../icon/draw_six.png',
        round: -30
      }
    ],
    covers: false,

  },

  onLoad: function(options) {

  },

  toPrize: function() {
    wx.navigateTo({
      url: '/pages/mine/draw/prize/prize',
    })
  },
  toRules: function() {
    wx.navigateTo({
      url: '/pages/mine/draw/rules/rules',
    })
  },


  onReady: function() {
    // 创建动画
    this.animation = wx.createAnimation()
  },

  // 选择
  rotate: function() {
    this.animation.rotate(Math.random() * 720 - 360).step()
    this.setData({
      animation: this.animation.export()
    })
  },


  onShow: function() {

  },
})