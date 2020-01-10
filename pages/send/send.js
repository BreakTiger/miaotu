const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({

  data: {
    imgList: [],
    imgPath: '',
    videoList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },


  // 上传图片
  addPicture: function() {
    let that = this
    let list = that.data.imgList
    let img = []
    wx.chooseImage({
      success: function(res) {
        var tempFilePaths = res.tempFilePaths
        img = list.concat(tempFilePaths)
        that.setData({
          imgList: img
        })
        that.cycle_img()
      },
    })
  },


  cycle_img: function() {
    let list = this.data.imgList
    console.log(list)
    let url = app.globalData.api + '/portal/home/upload'
    // for (let i = 0; i < list.length; i++) {
    //   let item = list[i]
    //   console.log(item);
    //   wx.uploadFile({
    //     url: url,
    //     filePath: item,
    //     name: 'file',
    //     header: {
    //       'token': wx.getStorageSync('openid')
    //     },
    //     success: function(res) {
    //       console.log(res)
    //     }
    //   })
    // }
  },



  // 删除图片
  delsPicture: function(e) {
    let index = e.currentTarget.dataset.index
    let list = this.data.imgList
    list.splice(index, 1)
    this.setData({
      imgList: list
    })
  },

  // 选择视频
  addVideo: function() {
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success(res) {
        console.log(res)
        console.log(res.tempFilePath)
        let url = app.globalData.api + '/portal/home/upload_video'
        // wx.uploadFile({
        //   url: url,
        //   filePath: res.tempFilePath,
        //   name: 'flie',
        //   header: {
        //     'token': wx.getStorageSync('openid')
        //   },
        //   success: function(res) {
        //     console.log(res)
        //   }
        // })
      }
    })

  },

  // 选择位置
  choice_postion: function() {

  },

  // 发布
  toSend: function() {
    let url = app.globalData.api + '/portal/home/upload'
    let list = this.data.imgList

    wx.uploadFile({
      url: url,
      filePath: list,
      name: 'file',
    })

  },





})