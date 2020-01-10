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

    cardlist: [{
        id: 0
      },
      {
        id: 1
      },
      {
        id: 3
      }
    ],

    choice_card: '',


    before: true
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
      // console.log(res.data.data.data);
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

  toGetFree: function() {
    this.setData({
      covers: true
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