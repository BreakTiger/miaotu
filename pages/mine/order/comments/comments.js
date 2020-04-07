const request = require('../../../../utils/http.js')
import modals from '../../../../utils/modal.js'
const app = getApp()

Page({

  data: {
    detail: [],
    maxword: 255,
    word: 255,
    inword: '',
    imgList: [],
    pricues: [],
  },

  onLoad: function(options) {
    let detail = JSON.parse(options.item)
    console.log(detail)
    this.setData({
      detail: detail
    })
  },

  // 选择图片
  toAddImg: function() {
    let that = this
    let list = that.data.imgList
    let img = []
    wx.chooseImage({
      count: 6,
      success: function(res) {
        let tempFilePaths = res.tempFilePaths
        console.log('图片组：', tempFilePaths)
        img = list.concat(tempFilePaths)
        that.setData({
          imgList: img
        })
      },
    })
  },

  // 删除图片
  toDelImg: function(e) {
    let index = e.currentTarget.dataset.index
    let list = this.data.imgList
    list.splice(index, 1)
    this.setData({
      imgList: list
    })
  },

  // 字数变动
  count: function(e) {
    let input = e.detail.value
    let count = input.length
    let words = this.data.maxword
    this.setData({
      inword: input,
      word: words - count
    })
  },

  // 发布 
  toSend: function() {
    let that = this
    let word = that.data.inword
    console.log(word)
    let list = that.data.imgList
    console.log(list)
    if (word) {
      if (list.length == 0) {
        that.submits_apply()
      } else {
        that.upImg(list)
      }
    } else {
      modals.showToast('请输入评论内容', 'none')
    }
  },

  // 上传图片
  upImg: function(e) {
    let that = this
    let pricue = []
    let url = app.globalData.api + '/portal/home/upload'
    modals.loading()
    for (let i = 0; i < e.length; i++) {
      let item = e[i]
      wx.uploadFile({
        url: url,
        filePath: item,
        name: 'file',
        header: {
          'token': wx.getStorageSync('openid')
        },
        success: function(res) {
          console.log('图片：', res)
          let data = JSON.parse(res.data).data
          console.log(data)
          pricue.push(data)
          that.setData({
            pricues: pricue
          })
        }
      })
    }
    // // 延迟俩秒执行发布接口
    setTimeout(function() {
      modals.loaded()
      that.submits_apply()
    }, 2000)
  },

  // 发布
  submits_apply: function() {
    let that = this
    let id = that.data.detail.id
    let url = app.globalData.api + '/portal/order/add_comment'
    let data = {
      order_id: that.data.detail.id,
      content: that.data.inword,
      img: that.data.pricues
    }
    console.log(data)
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast('申请成功')
          setTimeout(function() {
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  }
})