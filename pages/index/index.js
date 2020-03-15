const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

var QQMapWX = require('../../qqmap-wx-jssdk.min.js')
var demo = new QQMapWX({
  key: 'OSCBZ-J26WX-M6M4B-T6MQM-JC6EQ-HUFDP'
});

Page({

  data: {
    city: '',
    noread: null,
    sw_list: [],
    na_list: [{
        icon: '../../icon/group.png',
        name: '单身拼团',
        path: '/pages/index/group/group',
      },
      {
        icon: '../../icon/free.png',
        name: '助力免单',
        path: '/pages/index/free/free',
      },
      {
        icon: '../../icon/tickets.png',
        name: '门票砍价',
        path: '/pages/index/tickets/tickets',
      },
      {
        icon: '../../icon/sign.png',
        name: '现金签到',
        path: '/pages/index/sign/sign',
      }
    ],
    countdown: '',
    skillgoods: {},
    goodsnav: [{
        id: 5,
        name: '推荐'
      },
      {
        id: 6,
        name: '最新'
      },
      {
        id: 1,
        name: '本地'
      },
      {
        id: 2,
        name: '国外'
      },
      {
        id: 3,
        name: '小众'
      },
      {
        id: 4,
        name: '猎奇'
      }
    ],
    choice_one: 5,
    page: 1,
    leftlist: [],
    rightlist: [],
    card: ''
  },

  onLoad: function(options) {
    let type = options.type || ''
    console.log('邀请参数：', type)
    if (type) {
      console.log('存在')
      wx.setStorageSync('share', type)
    }
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
    this.positioning()
  },

  // 定位
  positioning: function() {
    let that = this
    wx.getLocation({
      success: function(res) {
        let lat = res.latitude
        let lon = res.longitude
        demo.reverseGeocoder({
          location: {
            latitude: lat,
            longitude: lon
          },
          success: function(res) {
            that.setData({
              city: res.result.address_component.city
            })
            wx.setStorageSync('city', res.result.address_component.city)
          },
          fail: function(error) {
            console.log(error);
          }
        })
      },
    })
    that.getBanner()
  },

  // 轮播图
  getBanner: function() {
    let that = this
    let url = app.globalData.api + '/portal/Home/get_slide_item'
    modals.loading()
    request.sendRequest(url, 'post', {
      tags: 1
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            sw_list: res.data.data
          })
          that.getSkill()
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 秒杀
  getSkill: function() {
    let that = this
    let url = app.globalData.api + '/portal/Home/get_fire_seckill'
    modals.loading()
    request.sendRequest(url, 'post', {}, {
      'content-type': 'application/json'
    }).then(function(res) {
      modals.loaded()
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            skillgoods: res.data.data
          })
          wx.setStorageSync('skill', res.data.data)
          let time1 = res.data.data.ms_starttime
          time1 = time1.substring(0, 19);
          time1 = time1.replace(/-/g, '/');
          let start = new Date(time1).getTime();
          let time2 = res.data.data.ms_endtime
          time2 = time2.substring(0, 19);
          time2 = time2.replace(/-/g, '/');
          let end = new Date(time2).getTime();
          let now = Date.parse(new Date())
          if (now >= start || now <= end) {
            let currentstartTimer = (end - now) / 1000
            that.setTimeShow(currentstartTimer)
          } else {
            that.setData({
              countdown: '活动即将开始'
            })
          }
        } else {
          that.setData({
            skillgoods: res.data.data
          })
          wx.setStorageSync('skill', res.data.data)
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 倒计时
  setTimeShow: function(currentstartTimer) {
    let interval = setInterval(function() {
      var second = currentstartTimer;
      var day = Math.floor(second / 3600 / 24);
      var dayStr = day.toString();
      if (dayStr.length == 1) dayStr = '0' + dayStr;
      var hr = Math.floor((second - day * 3600 * 24) / 3600);
      var hrStr = hr.toString();
      if (hrStr.length == 1) hrStr = '0' + hrStr;
      var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
      var minStr = min.toString();
      if (minStr.length == 1) minStr = '0' + minStr;
      var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
      var secStr = sec.toString();
      if (secStr.length == 1) secStr = '0' + secStr;
      this.setData({
        countdown: dayStr + ':' + hrStr + ':' + minStr + ':' + secStr
      });
      currentstartTimer--;
      if (currentstartTimer <= 0) {
        clearInterval(interval);
        this.setData({
          countdown: '00' + ':' + '00' + ':' + '00' + ':' + '00'
        });
      }
    }.bind(this), 1000);
    this.getList(this.data.choice_one)
  },

  // 分类列表
  getList: function(e) {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      type: e
    }
    let url = app.globalData.api + '/portal/Home/get_type_details'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
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
          that.getCard()
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 小卡片
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
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  onShow: function() {
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      this.unread(openID)
    }
  },

  // 未读消息
  unread: function(openID) {
    let that = this
    let url = app.globalData.api + '/portal/Message/no_read'
    request.sendRequest(url, 'post', {}, {
      'token': openID
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            noread: res.data.data
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 搜索
  toSearch: function() {
    wx.navigateTo({
      url: '/pages/index/search/search',
    })
  },

  // 消息
  toInfo: function() {
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.showModal({
        title: '提示',
        content: '您还未授权登录，请先登录',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/index/info/info',
      })
    }
  },

  // 导航
  toNav: function(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  },

  // 进入秒杀
  toSeckillDetail: function(e) {
    let oid = e.currentTarget.dataset.item.id
    console.log(oid)
    wx.navigateTo({
      url: '/pages/seckill_detail/seckill_detail?oid=' + oid,
    })
  },

  // 获取分类
  toGetKind: function(e) {
    let id = e.currentTarget.dataset.id
    let choice = this.data.choice_one
    if (choice != id) {
      this.setData({
        choice_one: id,
        page: 1
      })
      this.getList(id);
    }
  },

  // 普通商品
  toGoodsDetail: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/goods_detail/goods_detail?id=' + id,
    })
  },

  // 轮播图详情
  toDetaill: function(e) {
    let list = this.data.sw_list
    let item = list[e.currentTarget.dataset.index];
    if (item.type1 == 1) { //商品详情
      console.log('商品详情')
      wx.navigateTo({
        url: '/pages/goods_detail/goods_detail',
      })
    } else if (item.type2 == 1) { //秒杀列表
      console.log('秒杀列表')
      wx.navigateTo({
        url: '/pages/index/seckill/seckill',
      })
    } else if (item.type3 == 1) { //轮播主题列表
      console.log('轮播主题列表')
    }
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
    let pages = that.data.page + 1
    let choice = that.data.choice_one
    let data = {
      page: pages,
      length: 10,
      type: choice
    }
    let url = app.globalData.api + '/portal/Home/get_type_details'
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
  },

  onShareAppMessage: function(options) {
    console.log(options)
    return {
      title: '喵途-首页',
      path: '/pages/index/index?type=' + '',
    }
  }
})