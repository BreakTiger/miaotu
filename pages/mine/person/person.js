const request = require('../../../utils/http.js')
import modals from '../../../utils/modal.js'
const app = getApp()

Page({
  data: {
    data: {},
    birth: '',
    city: '',
    content: '',
    img: ''
  },

  onLoad: function(options) {
    this.setData({
      data: JSON.parse(options.data),
      birth: JSON.parse(options.data).birthday,
      city: JSON.parse(options.data).city,
      content: JSON.parse(options.data).intro,
      img: JSON.parse(options.data).back_image
    })
  },

  // 出生日期
  getBirth: function(e) {
    this.setData({
      birth: e.detail.value
    })
  },

  // 常居城市
  getCity: function(e) {
    this.setData({
      city: e.detail.value[1]
    })
  },

  // 个人简介
  getInput: function(e) {
    this.setData({
      content: e.detail.value
    })
  },


  // 选择背景图
  toAddd: function() {
    let that = this
    wx.chooseImage({
      count: 1,
      success: function(res) {
        var img = res.tempFilePaths[0]
        that.setData({
          img: img
        })
      },
    })
  },

  delImg: function() {
    this.setData({
      img: ''
    })
  },

  // 确定
  toSure: function() {
    let that = this
    let img = that.data.img
    if (img) {
      let url = app.globalData.api + '/portal/home/upload'
      wx.uploadFile({
        url: url,
        filePath: img,
        name: 'file',
        header: {
          'token': wx.getStorageSync('openid')
        },
        success: function(res) {
          if (res.statusCode == 200) {
            let result = JSON.parse(res.data)
            console.log(result)
            if (result.status == 1) {
              that.setData({
                img: result.data
              })
              that.sure()
            } else {
              modals.showToast(result.msg, 'none')
            }
          } else {
            modals.showToast('系统繁忙，请稍后重试', 'none')
          }
        }
      })
    } else {
      that.sure()
    }

  },

  sure: function() {
    let that = this
    let data = that.data.data
    let param = {
      avatar: data.avatar,
      nickname: data.nickname,
      sex: data.sex,
      birthday: that.data.birth,
      city: that.data.city,
      intro: that.data.content,
      back_image: that.data.img
    }
    console.log('参数:', param);
    let url = app.globalData.api + '/portal/Personal/user_edit'
    request.sendRequest(url, 'post', param, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast(res.data.msg, 'none')
          setTimeout(function() {
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },




})