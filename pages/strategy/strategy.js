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
    page: 1,
    word: '',
    leftlist: [],
    rightlist: []
  },

  onLoad: function(options) {
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  onShow: function() {
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

  toChoice: function(e) {
    let choice = this.data.choice_one
    let cid = e.currentTarget.dataset.id
    if (choice != cid) {
      this.setData({
        choice_one: cid,
        page: 1
      })
      this.getList(this.data.choice_one)
    }
  },

  toSearch: function(e) {
    let type = this.data.choice_one
    this.setData({
      word: e.detail.value
    })
    this.getList(this.data.choice_one)
  },

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
    let that = this
    let left = that.data.leftlist
    let right = that.data.rightlist
    let pages = that.data.page+1
    let type = that.data.choice_one
    let name = that.data.word
    let data = {
      page: pages,
      length:10,
      type: type,
      name: name
    }
    console.log('参数：',data)
    let url = app.globalData.api + '/portal/Strategy/index'
    request.sendRequest(url,'post',data,{
      'content-type': 'application/json'
    }).then(function(res){
      if (res.statusCode==200){
        if(res.data.status==1){
          let list = res.data.data.data
          let len = list.length
          if (len > 0){
            let half = len / 2
            let one = list.slice(0, half)
            let two = list.slice(half, len)
            that.setData({
              leftlist: left.concat(one),
              rightlist: right.concat(two),
              page: pages
            })
          }
        }else{
          modals.showToast('我也是有底线的', 'none');
        }
      }
    })


  }
})