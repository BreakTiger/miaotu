const request = require('../../api/http.js')
import modals from '../../methods/modal.js'
const app = getApp()

// 引入SDK核心类
var QQMapWX = require('../../qqmap-wx-jssdk.min.js')
// 实例化API核心类
var demo = new QQMapWX({
  key: 'OSCBZ-J26WX-M6M4B-T6MQM-JC6EQ-HUFDP'
});

Page({

  /**
   * 页面的初始数据
   */
  data: {
    city: '',
    sw_list: [], //轮播图
    noread: null,
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
    skillgoods: {},
    countdown: '',
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 判断用户是否登陆
    let openID = wx.getStorageSync('openid')
    if (!openID) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    } else {
      this.unRead(openID)
    }

    this.positioning()
    this.getBanner()
  },

  // 获取定位
  positioning: function() {
    let that = this
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        let lat = res.latitude
        let lon = res.longitude
        // 使用地图API
        demo.reverseGeocoder({
          location: {
            latitude: lat,
            longitude: lon
          },
          success: function(res) {
            // console.log(res.result);
            that.setData({
              city: res.result.address_component.city
            })
          },
          fail: function(error) {
            console.log(error);
          }
        })
      },
    })
  },

  // 获取轮播
  getBanner: function() {
    let that = this
    let url = app.globalData.api + '/portal/Home/get_slide_item'
    modals.loading()
    request.sendRequest(url, 'post', {
      tags: 1
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        that.setData({
          sw_list: res.data.data
        })
        that.getSkill()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 推荐的秒杀爆款商品
  getSkill: function() {
    let that = this
    let url = app.globalData.api + '/portal/Home/get_fire_seckill'
    request.sendRequest(url, 'post', {}, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        that.setData({
          skillgoods: res.data.data
        })
        let time1 = res.data.data.ms_starttime
        // console.log('开始时间', time1)
        time1 = time1.substring(0, 19);
        time1 = time1.replace(/-/g, '/');
        let start = new Date(time1).getTime();
        // console.log('开始时间:', start)

        let time2 = res.data.data.ms_endtime
        // console.log('结束时间', time2)
        time2 = time2.substring(0, 19);
        time2 = time2.replace(/-/g, '/');
        let end = new Date(time2).getTime();
        // console.log('结束时间：', end)

        let now = Date.parse(new Date())
        // console.log('当前时间戳:', now)
        if (now >= start || now <= end) {
          let currentstartTimer = (end - now) / 1000
          // console.log('活动倒计时')
          that.setTimeShow(currentstartTimer)
        } else {
          this.setData({
            countdown: '活动即将开始'
          });
        }
        //默认情况下：
        that.getList(that.data.choice_one)
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 倒计时
  setTimeShow(currentstartTimer) {

    let interval = setInterval(function() {
      // 秒数
      var second = currentstartTimer;
      // 天数位
      var day = Math.floor(second / 3600 / 24);
      var dayStr = day.toString();
      if (dayStr.length == 1) dayStr = '0' + dayStr;

      // 小时位
      var hr = Math.floor((second - day * 3600 * 24) / 3600);
      var hrStr = hr.toString();
      if (hrStr.length == 1) hrStr = '0' + hrStr;

      // 分钟位
      var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
      var minStr = min.toString();
      if (minStr.length == 1) minStr = '0' + minStr;

      // 秒位
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
  },

  // 获取分类列表
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
      modals.loaded();
      // console.log(res.data.data)
      if (res.statusCode == 200) {
        let list = res.data.data.data
        // console.log(list)
        let len = list.length
        // console.log('长度：', len)
        if (len > 0) {
          let half = (len / 2).toFixed(0);
          that.setData({
            leftlist: list.slice(0, half),
            rightlist: list.slice(half, len)
          })
        }
        that.getCard()
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 小卡片
  getCard: function() {
    let that = this
    let url = app.globalData.api + '/portal/Home/get_slide_item'
    request.sendRequest(url, 'post', {
      tags: 9
    }, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        that.setData({
          card: res.data.data[0].image
        })
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 切换分类
  toGetKind: function(e) {
    let id = e.currentTarget.dataset.id
    let choice = this.data.choice_one
    if (choice != id) {
      this.setData({
        choice_one: id
      })
      this.getList(this.data.choice_one);
    }
  },

  // 秒杀详情
  toSkill: function() {
    let that = this
    let item = that.data.skillgoods
    console.log('秒杀ID：', item.id)
    // if (item != 0) {
    //   wx.navigateTo({
    //     url: '/pages/index/goods/goods?id=' + item.id,
    //   })
    // }
  },

  // 未读消息条数
  unRead: function(openID) {
    let that = this
    let url = app.globalData.api + '/portal/Message/no_read'
    request.sendRequest(url, 'post', {}, {
      'token': openID
    }).then(function(res) {
      if (res.statusCode == 200) {
        that.setData({
          noread: res.data.data
        })
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none');
      }
    })
  },

  // 选择地点
  toPlace: function() {

  },

  // 搜索
  toSearch: function() {
    wx.navigateTo({
      url: '/pages/index/search/search',
    })
  },

  // 查看信息
  toInfo: function() {
    let openID = wx.getStorageSync('openid')
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

  // 轮播跳转
  toDetaill: function(e) {
    let list = this.data.sw_list
    let item = list[e.currentTarget.dataset.index];
    console.log(item)
    if (item.type1 == 1) { //商品详情
      console.log('商品详情')
      wx.navigateTo({
        url: '/pages/index/goods/goods',
      })
    } else if (item.type2 == 1) { //秒杀列表
      console.log('秒杀列表')
      wx.navigateTo({
        url: '/pages/index/seckill/seckill',
      })
    } else if (item.type3 == 1) { //轮播主题列表
      console.log('轮播主题列表')
      wx.navigateTo({
        url: '/pages/index/shuffling/shuffling',
      })
    }
  },

  // 导航跳转
  toNav: function(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  },

  toGoodsDetail: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/index/goods/goods?id=' + id,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let openID = wx.getStorageSync('openid')
    this.unRead(openID);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this
    let left = that.data.leftlist
    // console.log('左边：', left)
    let right = that.data.rightlist
    // console.log('右边：', right)
    let pages = that.data.page + 1
    // console.log('页码：', page)
    let choice = that.data.choice_one
    // console.log('选择分类：', choice)
    let data = {
      page: pages,
      length: 10,
      type: choice
    }
    console.log('参数：', data)
    let url = app.globalData.api + '/portal/Home/get_type_details'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      // console.log(res.data.data.data);
      if (res.statusCode == 200) {
        let list = res.data.data.data
        // console.log(list)
        let len = list.length
        // console.log('长度：', len)
        if (len > 0) {
          let half = len / 2
          // console.log('一半：', half)
          let one = list.slice(0, half)
          // console.log(one)
          let two = list.slice(half, len)
          // console.log(two)
          that.setData({
            leftlist: left.concat(one),
            rightlist: right.concat(two),
            page: pages
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none');
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {


  }
})