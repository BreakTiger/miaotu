const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({

  data: {
    data: {},
    page: 1,
    list: [],
    covers: false,
    rpage: 1,
    rlist: []
  },

  onLoad: function(options) {
    let data = JSON.parse(options.data)
    this.setData({
      data: data
    })
  },

  onShow: function() {
    // 判断是否登录
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      this.getList_login(openID)
    } else {
      this.getList_unlogin()
    }
  },

  // 获取列表 - 登录
  getList_login: function(openID) {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      type: that.data.data.type,
      name: that.data.data.word,
      sid: that.data.data.id
    }
    // console.log('参数：', data)
    let url = app.globalData.api + '/portal/Strategy/lists'
    request.sendRequest(url, 'post', data, {
      'token': openID
    }).then(function(res) {
      // console.log(res);
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          for (let i = 0; i < list.length; i++) {
            list[i].showVideo = false
            list[i].show = false
          }
          // console.log(list)
          that.setData({
            list: list
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 获取列表 - 未登录
  getList_unlogin: function() {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      type: that.data.data.type,
      name: that.data.data.word,
      sid: that.data.data.id
    }
    // console.log('参数：', data)
    let url = app.globalData.api + '/portal/Strategy/lists'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          for (let i = 0; i < list.length; i++) {
            list[i].showVideo = false
            list[i].show = false
          }
          // console.log(list)
          that.setData({
            list: list
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },



  // 轮播图的视频显示
  toShowVideo: function(e) {
    let that = this
    let index = e.currentTarget.dataset.index
    let change = "list[" + index + "].showVideo";
    that.setData({
      [change]: true
    })
  },

  // 关闭视频播放
  toCloseVideo: function(e) {
    let that = this
    let index = e.currentTarget.dataset.index
    let change = "list[" + index + "].showVideo";
    that.setData({
      [change]: false
    })
  },

  // 展开
  toOpened: function(e) {
    let that = this
    let index = e.currentTarget.dataset.index
    let change = "list[" + index + "].show";
    console.log(change);
    that.setData({
      [change]: true
    })
  },

  // 关注
  toLike: function(e) {
    let that = this
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.showModal({
        title: '提示',
        content: '需要先授权后，才可以进行此操作',
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
    } else {
      let url = app.globalData.api + '/portal/Strategy/do_like'
      let id = e.currentTarget.dataset.id
      console.log(id)
      request.sendRequest(url, 'post', {
        id: id
      }, {
        'token': wx.getStorageSync('openid')
      }).then(function(res) {
        console.log(res)
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            modals.showToast(res.data.msg, 'none')
            that.getList_login(wx.getStorageSync('openid'))
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
    }

  },

  // 取消关注
  toCancel: function(e) {
    let that = this
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.showModal({
        title: '提示',
        content: '需要先授权后，才可以进行此操作',
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
    } else {
      let url = app.globalData.api + '/portal/Strategy/out_like'
      let id = e.currentTarget.dataset.id
      console.log(id)
      request.sendRequest(url, 'post', {
        id: id
      }, {
        'token': wx.getStorageSync('openid')
      }).then(function(res) {
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            modals.showToast(res.data.msg, 'none')
            that.getList_login(wx.getStorageSync('openid'))
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
    }
  },

  // 查看所有的评论 - 弹窗
  toAllComment: function(e) {
    let that = this
    that.setData({
      rpage: 1
    })
    let id = e.currentTarget.dataset.item.id
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.showModal({
        title: '提示',
        content: '需要先授权后，才可以进行此操作',
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
    } else {
      let data = {
        page: that.data.rpage,
        length: 10,
        id: id
      }
      console.log('参数：', data)
      let url = app.globalData.api + '/portal/Strategy/get_comment'
      request.sendRequest(url, 'post', data, {
        'token': openID
      }).then(function(res) {
        console.log(res.data.data)
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            that.setData({
              rlist: res.data.data.data,
              covers: true
            })
          }
        } else {

        }
      })
      // that.setData({
      //   covers: true,
      //   rlist: item
      // })
    }
  },

  toClosed: function() {
    this.setData({
      covers: false,
      rlist: []
    })
  },



  onPullDownRefresh: function() {

  },
  onReachBottom: function() {

  },

  onShareAppMessage: function() {

  }
})