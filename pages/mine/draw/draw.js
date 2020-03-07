const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    role: {},
    user: {},
    turntable: [],
    round: [30, 90, 150, 210, 270, 330],
    awardIndex: 2,
    prize: {},
    card: '',
    page: 1,
    leftlist: [],
    rightlist: [],
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
            role: res.data.data.role,
            user: res.data.data.user,
          })
          that.trim(res.data.data.award)
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 整理
  trim: function(e) {
    let that = this
    let list = []
    // console.log(e)
    for (let i = 0; i < e.length; i++) {
      let item = e[i]
      if (item.occupied == 1) {
        list.push(item)
      } else {
        let num = e[i].occupied
        for (let j = 0; j < num; j++) {
          let rep = e[i]
          list.push(rep)
        }
      }
    }
    for (let i = 0; i < list.length; i++) {
      if (list[i].couponId == 0) {
        list[i]['icon'] = '../../../icon/draw_three.png'
      } else {
        list[i]['icon'] = '../../../icon/draw_four.png'
      }
    }
    console.log('转盘奖品：', list)
    that.setData({
      turntable: list
    })
  },

  // 动画
  onReady: function() {
    this.animation = wx.createAnimation({
      duration: 4000,
      timingFunction: 'ease'
    })
  },

  // 开始抽奖
  rotate: function() {
    let that = this
    let url = app.globalData.api + '/portal/Lottery/do_lottery'
    request.sendRequest(url, 'post', {}, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          console.log('11', res.data)
          // that.rounds()
          let prize = res.data.data.data
          let list = that.data.turntable
          console.log(list)
          let item = []
          for (let i = 0; i < list.length; i++) {
            if (list[i].id == prize.id) {
              console.log(i)
              item.push(i)
            }
          }
          console.log(item)
          that.rounds(item)
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 转盘动画
  rounds: function(item) {
    console.log(item)
    let that = this
    let awardIndex = item[Math.floor(Math.random() * item.length)];
    console.log('中奖index:', awardIndex)
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
    that.animation.rotate(angle).step()
    that.setData({
      animation: that.animation.export(),
      prize: that.data.turntable[awardIndex]
    })

    setTimeout(function() {
      that.setData({
        covers: true
      })
    }, 4500)
  },

  // 关闭弹窗，重设动画事件
  toSure: function() {
    this.getDraw()
    this.animation.rotate(0).step({
      duration: 0
    })
    this.setData({
      covers: false,
      animation: this.animation.export()
    })
  },


  // 抽奖规则
  toRules: function() {
    wx.navigateTo({
      url: '/pages/rules/rules',
    })
  },

  onShow: function() {
    this.getCard()
  },

  //瀑布流-1
  getCard: function() {
    let that = this
    let url = app.globalData.api + '/portal/Home/get_slide_item'
    request.sendRequest(url, 'post', {
      tags: 9
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            card: res.data.data[0].image
          })
        }
        that.getList()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  //瀑布流-2
  getList: function() {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      type: 7
    }
    let url = app.globalData.api + '/portal/Home/get_type_details'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          let len = list.length
          if (len > 0) {
            let half = (len / 2).toFixed(0);
            that.setData({
              leftlist: list.slice(0, half),
              rightlist: list.slice(half, len)
            })
          }
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 进入详情
  toGoodsDetail: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/goods_detail/goods_detail?id=' + id,
    })
  },

  onPullDownRefresh: function() {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000);
    this.getDraw()
  },

  onReachBottom: function() {
    let that = this
    let left = that.data.leftlist
    let right = that.data.rightlist
    let pages = that.data.page + 1
    let data = {
      page: pages,
      length: 10,
      type: 7
    }
    console.log('参数：', data)
    let url = app.globalData.api + '/portal/Home/get_type_details'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          let len = list.length
          if (len > 0) {
            let half = len / 2
            let one = list.slice(0, half)
            let two = list.slice(half, len)
            that.setData({
              leftlist: left.concat(two),
              rightlist: right.concat(one),
              page: pages
            })
          }
        } else {
          modals.showToast('我也是有底线的', 'none');
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none');
      }
    })
  }
})