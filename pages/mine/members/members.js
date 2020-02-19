const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({

  data: {
    person: [],
    cardlist: [],
  },

  onLoad: function(options) {
    let person = JSON.parse(options.data)
    this.setData({
      person: person
    })
    this.getAllCard()
  },

  getAllCard: function() {
    let that = this
    let url = app.globalData.api + '/portal/Level/index'
    request.sendRequest(url, 'post', {}, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data
          for (let i = 0; i < list.length; i++) {
            let move = i * 160
            list[i].top = move
          }
          that.setData({
            cardlist: list
          })
        }
      }
    })
  },

  // onReady: function() {
  //   this.animation = wx.createAnimation()
  // },

  // choiceCard: function(e) {
  //   let that = this
  //   let index = e.currentTarget.dataset.index
  //   let len = that.data.cardlist.length - 1
  //   if (index != len) {
  //     console.log('移动距离：',index * 50)
  //     that.animation.translateY(index*50).step()
  //     that.setData({
  //       animation: that.animation.export()
  //     })
  //   }
  // },

  toBuy: function() {
    console.log(222)
  },
})