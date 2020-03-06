const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    award: [],
    role: {},
    user: {},
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
    covers: false

  },

  onLoad: function(options) {
    this.getDraw()
  },

  // 获取积分抽奖信息
  getDraw: function() {
    let that = this
    let url = app.globalData.api + '/portal/Lottery/index'
    request.sendRequest(url, 'post', {}, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            award: res.data.data.award,
            role: res.data.data.role,
            user: res.data.data.user,
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 我的奖品
  toPrize: function() {
    // wx.navigateTo({
    //   url: '/pages/mine/draw/prize/prize',
    // })
  },

  // 规则
  toRules: function() {
    // wx.navigateTo({
    //   url: '/pages/mine/draw/rules/rules',
    // })
  },


  onReady: function() {
    this.animation = wx.createAnimation({
      duration: 4000,
      timingFunction: 'ease'
    })
  },

  // 开始抽奖
  // 选择
  rotate: function() {
    let awardIndex = 2; //中奖index
    // 设置选择周数
    let runNum = 8; //旋转8周
    // 小方块角度
    let sangle_one = 360 / 6
    console.log(sangle_one)
    let sangle_two = sangle_one * awardIndex
    console.log(sangle_two)
    // 计算角度
    let angle = runNum * 360 - sangle_two - (sangle_one / 2)
    console.log('选择角度：', angle)
    this.animation.rotate(angle).step()
    this.setData({
      animation: this.animation.export()
    })
  },


  onShow: function() {

  },
})