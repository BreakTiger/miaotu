const request = require('../../../utils/http.js')
import modals from '../../../utils/modal.js'
const app = getApp()

Page({


  data: {
    liu: [{
        img: '../../../icon/tickets_one.png',
        name: '选择门票'
      },
      {
        img: '../../../icon/tickets_two.png',
        name: '邀请好友助力'
      },
      {
        img: '../../../icon/tickets_three.png',
        name: '人满必获得门票'
      }
    ],
    mylist: [],
    page: 1,
    list: [],
    covers: false,
    before: false,
    cardchange: false,
    card: 3,
    cardlist: '',
    members: '',
    id: '',
    oid: ''
  },

  onShow: function() {
    this.getMyList()
  },

  // 我参加的
  getMyList: function() {
    let that = this
    let data = {
      page: 1,
      length: 20
    }
    let url = app.globalData.api + '/portal/Miandan/my_index'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            mylist: res.data.data.data
          })
        }
        that.getList()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })

  },

  // 所有活动
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

  // 免费获得
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
      console.log(e.currentTarget.dataset.item)
      let id = e.currentTarget.dataset.item.id
      that.setData({
        id: id,
        covers: true,
        before: true
      })
    }
  },

  onReady: function() {
    this.animation = wx.createAnimation()
  },

  // 选择卡片，并旋转
  choose_card: function() {
    let that = this
    that.getmembers()
    that.setData({
      card: 1,
      members: that.data.members
    })
    this.animation.rotateY(90).step()
    this.setData({
      animation: this.animation.export()
    })
    setTimeout(function() {
      that.setData({
        cardchange: true
      })
    }, 250)
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

  // 领取任务，并随机获取人数
  getmembers: function() {
    let that = this
    let data = {
      id: that.data.id
    }
    console.log('参数：', data)
    let url = app.globalData.api + '/portal/Miandan/do_miandan'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            members: res.data.data.number,
            oid: res.data.data.miandan_order
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 立即领取
  toReceive: function() {
    let that = this
    let id = this.data.oid
    console.log(id)
    wx.navigateTo({
      url: '/pages/free_detail/free_detail?id=' + id,
    })
    that.setData({
      covers: false,
      before: false,
      cardchange: false,
      card: 3
    })
  },

  // 分享给好友
  toshares: function(e) {
    let id = e.currentTarget.dataset.id
    console.log(id)
    wx.navigateTo({
      url: '/pages/free_detail/free_detail?id=' + id,
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
    let that = this
    let pages = that.data.page + 1
    let old = that.data.list
    let data = {
      page: pages,
      length: 10
    }
    console.log(data)
    let url = app.globalData.api + '/portal/Miandan/index'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      console.log(res)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          if (list.length > 0) {
            that.setData({
              page: pages,
              list: old.concat(list)
            })
          }
        } else {
          modals.showToast('我也是有底线的', 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  }
})