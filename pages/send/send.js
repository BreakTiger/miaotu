const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

Page({

  data: {
    title: '',
    imgList: [],
    video: '',
    article: '',
    city: '位置',
    lat: '',
    lon: '',
    pricues: [],
    film: '',
  },


  onLoad: function(options) {
    let city = wx.getStorageSync('city')
    this.setData({
      city: city
    })
  },

  // 标题
  setTitle: function(e) {
    this.setData({
      title: e.detail.value
    })
  },

  // 上传图片
  addPicture: function() {
    let that = this
    let list = that.data.imgList
    let img = []
    wx.chooseImage({
      count: 6,
      success: function(res) {
        var tempFilePaths = res.tempFilePaths
        img = list.concat(tempFilePaths)
        that.setData({
          imgList: img
        })
      },
    })
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
    let that = this
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      compressed: true,
      maxDuration: 60,
      camera: 'back',
      success(res) {
        let size = res.size / 1024 / 1024
        if (size <= 5) {
          that.setData({
            video: res.tempFilePath
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '上传的视频最大为5M',
          })
        }
      }
    })
  },

  // 删除视频
  delsVideo: function() {
    this.setData({
      video: ''
    })
  },

  // 获取正文
  getArticle: function(e) {
    this.setData({
      article: e.detail.value
    })
  },

  // 选择位置
  choice_postion: function() {
    let that = this
    wx.chooseLocation({
      success: function(res) {
        let address = res.address
        that.setData({
          city: address
        })
      },
    })
  },

  // 发布
  toSend: function() {
    let that = this
    // 判读
    if (!that.data.title) {
      modals.showToast('请输入文章标题', 'none');
    } else if (that.data.imgList.length == 0) {
      modals.showToast('请上传图片', 'none');
    } else if (!that.data.article) {
      modals.showToast('请输入正文内容', 'none');
    } else {
      modals.loading()
      that.upVideo()
    }
  },

  // 上传视频
  upVideo: function() {
    let that = this
    let video = that.data.video
    // console.log(video)
    if (video) {
      let url = app.globalData.api + '/portal/home/upload_video'
      wx.uploadFile({
        url: url,
        filePath: video,
        name: 'file',
        header: {
          'token': wx.getStorageSync('openid')
        },
        success: function(res) {
          console.log(res)
          let movie = JSON.parse(res.data).data
          // console.log(movie)
          that.setData({
            film: movie
          })
          
        }
      })
    }
    that.cycle_img(that.data.imgList)
  },

  // 上传图片
  cycle_img: function(e) {
    let that = this
    let pricue = []
    let url = app.globalData.api + '/portal/home/upload'
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
          let data = JSON.parse(res.data).data
          pricue.push(data)
          that.setData({
            pricues: pricue
          })
        }
      })
    }
    // 延迟俩秒执行发布接口
    setTimeout(function() {
      that.sendTravel()
    }, 900)
  },


  // 发布游记
  sendTravel: function() {
    let that = this
    let data = {
      r_title: that.data.title,
      r_image: that.data.pricues,
      r_content: that.data.article,
      r_site: that.data.city,
      r_video: that.data.film
    }
    console.log('参数：', data)
    let url = app.globalData.api + '/portal/Strategy/add'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          modals.showToast(res.data.msg, 'none')
          setTimeout(function() {
            wx.navigateBack({
              delta: 2
            })
          }, 2000)
        } else {
          modals.showToast(res.data.msg, 'none')
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  }
})