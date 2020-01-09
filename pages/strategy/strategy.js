const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({

  data: {
    tlist: [{
        id: 1,
        name: '关注'
      },
      {
        id: 2,
        name: '发现'
      },
      {
        id: 3,
        name: '问答'
      },
      {
        id: 4,
        name: '精选'
      }
    ],
    choice_one: 1,
    choice_one_name: '关注',
    sw_list: [],
    page: 1,
    leftlist: [],
    rightlist: [],
    card: ''
  },

  onLoad: function(options) {
    // 判断用户是否登陆
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
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
        that.getList(that.data.choice_one_name)
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  getList: function(e) {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      name: e
    }
    let url = app.globalData.api + '/portal/Strategy/index'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data.data)
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
          modals.showToast(res.data.msg, 'none')
        }
        that.getCard()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  getCard: function() {
    let that = this
    let url = app.globalData.api + '/portal/Home/get_slide_item'
    modals.loading()
    request.sendRequest(url, 'post', {
      tags: 9
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            card: res.data.data[0].image
          })
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 选择分类
  toChoice: function(e) {
    console.log(e);
    let choice = this.data.choice_one
    let cid = e.currentTarget.dataset.item.id
    let cname = e.currentTarget.dataset.item.name
    if (choice != cid) {
      this.setData({
        choice_one: cid,
        choice_one_name: cname
      })
      this.getList(this.data.choice_one_name)
    }
  },

  // 发布
  tosend: function() {
    wx.navigateTo({
      url: '/pages/strategy/send/send',
    })
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


})