const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({

  data: {
    tlist: [{
        id: 0,
        name: '发现'
      },
      {
        id: 1,
        name: '问答'
      },
      {
        id: 2,
        name: '精选'
      },
      {
        id: 3,
        name: '关注'
      },
    ],
    choice_one: 0,
    sw_list: [],
    card: '',
    word: '',
    page: 1,
    leftlist: [],
    rightlist: []

  },


  onLoad: function(options) {
    // 判断用户是否登陆
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },


  onShow: function() {
    this.getBanner()
  },

  // 轮播图
  getBanner: function() {
    let that = this
    let url = app.globalData.api + '/portal/Home/get_slide_item'
    request.sendRequest(url, 'post', {
      tags: 8
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            sw_list: res.data.data
          })
        } else {
          modals.showToast(res.data.msg, 'none')
        }
        that.getCard()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 瀑布流小卡片
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
          that.getList(that.data.choice_one)
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }

    })
  },

  // 分类列表 不包括关注
  getList: function(e) {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      type: e,
      name: that.data.word
    }
    console.log('参数：', data);
    let url = app.globalData.api + '/portal/Strategy/index'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
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
        } else {
          that.setData({
            leftlist: [],
            rightlist: [],
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }

    })
  },

  // 选择分类
  toChoice: function(e) {
    let choice = this.data.choice_one
    let cid = e.currentTarget.dataset.id
    if (choice != cid) {
      this.setData({
        choice_one: cid,
        page: 1
      })
      if (cid == 3) { //关注
        this.getCareList(this.data.choice_one)
      } else { //除关注外的其他列表
        this.getList(this.data.choice_one)
      }
    }
  },


  // 关注列表
  getCareList: function(e) {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      type: e,
      name: that.data.word
    }
    console.log(data)
    let url = app.globalData.api + '/portal/Strategy/index'
    modals.loading()
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      modals.loaded()
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
        } else {
          that.setData({
            leftlist: [],
            rightlist: [],
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 搜索
  toSearch: function(e) {
    let type = this.data.choice_one
    console.log(type)
    this.setData({
      word: e.detail.value
    })
    if (type == 3) {
      this.getCareList(this.data.choice_one)
    } else {
      this.getList(this.data.choice_one)
    }
  },

  // 发布
  tosend: function() {
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      wx.navigateTo({
        url: '/pages/send/send',
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '需要授权登录后，才可以进行发布哦',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
    }
  },

  // 去到详情
  toDetails: function(e) {
    let that = this
    let data = {
      type: that.data.choice_one,
      word: that.data.word || '',
      id: e.currentTarget.dataset.item.id
    }
    wx.navigateTo({
      url: '/pages/strategy/travel_details/travel_details?data=' + JSON.stringify(data),
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
    this.onLoad();
  },

  
  onReachBottom: function() {

  }
})