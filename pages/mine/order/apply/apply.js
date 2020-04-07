const request = require('../../../../utils/http.js')
import modals from '../../../../utils/modal.js'
const app = getApp()

Page({

  data: {
    id: '',
    details: [],
    order: [],
    pintuan: [],
    reason: [
      '拍多/拍错',
      '信息填写错误',
      '不想要了',
      '其他'
    ],
    choice_reason: '请选择原因',
    imgList: [],
    pricues: [],

  },

  onLoad: function(options) {
    this.setData({
      id: options.id
    })
    this.getInfo(options.id)
  },


  // 获取订单详情数据
  getInfo: function(e) {
    let that = this
    let url = app.globalData.api + '/portal/Order/info'
    request.sendRequest(url, 'post', {
      order_id: e
    }, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res.data.data)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            details: res.data.data.details,
            order: res.data.data.order,
            pintuan: res.data.data.pintuan
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 选择退款原因
  bindPickerChange: function(e) {
    let index = e.detail.value
    let item = this.data.reason[index]
    this.setData({
      choice_reason: item
    })
  },

  // 上传图片
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

  //提交
  submits: function() {
    let that = this
    let choice_reason = that.data.choice_reason
    console.log('原因:', choice_reason)
    let list = that.data.imgList
    console.log('图片:', list)
    if (choice_reason == "请选择原因") {
      modals.showToast('请选择退款原因', 'none')
    } else {
      if (list.length == 0) {
        that.submits_apply()
      } else {
        that.upImg(list)
      }
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
    // 延迟俩秒执行发布接口
    setTimeout(function() {
      modals.loaded()
      that.submits_apply()
    }, 1500)
  },

  // 上传
  submits_apply: function() {
    let that = this
    let url = app.globalData.api + '/portal/order/apply_refund'
    let data = {
      order_id: that.data.id,
      describe: that.data.choice_reason,
      img: that.data.pricues
    }
    console.log('参数:', data)
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      console.log(res)
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