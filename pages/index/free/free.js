const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({


  data: {
    liu: [{
      img: '../../../icon/tickets_one.png',
      name: '选择门票'
    }, {
      img: '../../../icon/tickets_two.png',
      name: '邀请好友助力'
    }, {
      img: '../../../icon/tickets_three.png',
      name: '人满必获得门票'
    }],
    page: 1,
    list: [],
    covers: false,
    width_one: 204,
    width_two: 0,
    cardlist: 3,
    choice_card: '',
    before: true,
    members: '',
    id: '',
  },


  onLoad: function(options) {
    this.getList()
  },

  getList: function() {
    let that = this
    let data = {
      page: that.data.page,
      length: 10
    }
    let url = app.globalData.api + '/portal/Miandan/index'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            list: res.data.data.data
          })
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })

  },

  toGetFree: function(e) {
    let that = this
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.showModal({
        title: '提示',
        content: '您需授权才可以进行此项操作哦',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
    } else {
      let url = app.globalData.api + '/portal/Miandan/do_miandan'
      let id = e.currentTarget.dataset.id
      modals.loading()
      request.sendRequest(url, 'post', {
        id: id
      }, {
        'token': openID
      }).then(function(res) {
        modals.loaded()
        console.log(res)
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            console.log(res.data.data)
            that.setData({
              covers: true,
              members: res.data.data,
              id: id
            })
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
    }
  },

  onReady: function() {
    this.animation = wx.createAnimation()
  },

  choose_card: function() {
    let that = this
    that.setData({
      cardlist: 1
    })
    this.animation.rotateY(180).step()
    this.setData({
      animation: this.animation.export()
    })
    setTimeout(function() {
      that.setData({
        before: false
      })
    }, 500)
  },

  // 跳转去资料输入页面
  toReceive: function() {
    console.log('ID:', this.data.id)
    wx.navigateTo({
      url: '/pages/buy_typefour/buy_typefour?id=' + this.data.id,
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
    this.onLoad()
  },

  onReachBottom: function() {

  },

})