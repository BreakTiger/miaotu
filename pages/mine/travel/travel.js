const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({

  data: {
    person: [],
    person_like: [],
    card: '',
    page: 1,
    leftlist: [],
    rightlist: []
  },

  onLoad: function(options) {
    let data = JSON.parse(options.data)
    console.log(data)
    this.setData({
      person: data.person,
      person_like: data.person_like
    })
    this.getCard()
  },

  // 卡片
  getCard: function() {
    let that = this
    let url = app.globalData.api + '/portal/Home/get_slide_item'
    request.sendRequest(url, 'post', {
      tags: 9
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      console.log(res)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            card: res.data.data[0].image
          })
        }
        that.getMyTravel()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 我的游记
  getMyTravel: function() {
    let that = this
    let data = {
      page: that.data.page,
      length: 10
    }
    let url = app.globalData.api + '/portal/Personal/mytravel'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          console.log(list)
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

  onReachBottom: function() {
    let that = this
    let left = that.data.leftlist
    let right = that.data.rightlist
    let pages = that.data.page + 1
    let data = {
      page: pages,
      length: 10
    }
    console.log('参数：', data)
    let url = app.globalData.api + '/portal/Personal/mytravel'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res)
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