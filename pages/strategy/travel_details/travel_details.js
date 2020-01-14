const request = require('../../../api/http.js')
import modals from '../../../methods/modal.js'
const app = getApp()

Page({
  data: {
    data: {},
    page: 1,
    list: [],
    covers: false,
    rpage: 1,
    rlist: [],
    rid: '',
    rhint: '添加评论',
    uid: 0,
    relay: '',
  },

  onLoad: function(options) {
    let data = JSON.parse(options.data)
    this.setData({
      data: data
    })
  },

  onShow: function() {
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      this.getList_login(openID)
    } else {
      this.getList_unlogin()
    }
  },

  // 获取列表 - 登录
  getList_login: function(openID) {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      type: that.data.data.type,
      name: that.data.data.word,
      sid: that.data.data.id
    }
    let url = app.globalData.api + '/portal/Strategy/lists'
    request.sendRequest(url, 'post', data, {
      'token': openID
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          for (let i = 0; i < list.length; i++) {
            list[i].showVideo = false
            list[i].show = false
          }
          that.setData({
            list: list
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 获取列表 - 未登录
  getList_unlogin: function() {
    let that = this
    let data = {
      page: that.data.page,
      length: 10,
      type: that.data.data.type,
      name: that.data.data.word,
      sid: that.data.data.id
    }
    let url = app.globalData.api + '/portal/Strategy/lists'
    request.sendRequest(url, 'post', data, {
      'content-type': 'application/json'
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let list = res.data.data.data
          for (let i = 0; i < list.length; i++) {
            list[i].showVideo = false
            list[i].show = false
          }
          that.setData({
            list: list
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 轮播图的视频显示
  toShowVideo: function(e) {
    let that = this
    let index = e.currentTarget.dataset.index
    let change = "list[" + index + "].showVideo";
    that.setData({
      [change]: true
    })
  },

  // 关闭视频播放
  toCloseVideo: function(e) {
    let that = this
    let index = e.currentTarget.dataset.index
    let change = "list[" + index + "].showVideo";
    that.setData({
      [change]: false
    })
  },

  // 展开
  toOpened: function(e) {
    let that = this
    let index = e.currentTarget.dataset.index
    let change = "list[" + index + "].show";
    console.log(change);
    that.setData({
      [change]: true
    })
  },

  // 关注
  toLike: function(e) {
    let that = this
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.showModal({
        title: '提示',
        content: '需要先授权后，才可以进行此操作',
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
    } else {
      let url = app.globalData.api + '/portal/Strategy/do_like'
      let id = e.currentTarget.dataset.id
      console.log(id)
      request.sendRequest(url, 'post', {
        id: id
      }, {
        'token': wx.getStorageSync('openid')
      }).then(function(res) {
        console.log(res)
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            modals.showToast(res.data.msg, 'none')
            that.getList_login(wx.getStorageSync('openid'))
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
    }
  },

  // 取消关注
  toCancel: function(e) {
    let that = this
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.showModal({
        title: '提示',
        content: '需要先授权后，才可以进行此操作',
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
    } else {
      let url = app.globalData.api + '/portal/Strategy/out_like'
      let id = e.currentTarget.dataset.id
      console.log(id)
      request.sendRequest(url, 'post', {
        id: id
      }, {
        'token': wx.getStorageSync('openid')
      }).then(function(res) {
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            modals.showToast(res.data.msg, 'none')
            that.getList_login(wx.getStorageSync('openid'))
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
    }
  },

  // 查看所有评论
  toAllComment: function(e) {
    let that = this
    let item = e.currentTarget.dataset.item
    console.log(item)
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.showModal({
        title: '提示',
        content: '需要先授权后，才可以进行此操作',
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
    } else {
      that.setData({
        rpage: 1,
        rid: item.id,
        covers: true
      })
      that.allComment(item.id);
    }
  },

  allComment: function(e) {
    // console.log('攻略ID：', e)
    let that = this
    let data = {
      page: that.data.rpage,
      length: 10,
      id: e
    }
    console.log('参数：', data)
    let url = app.globalData.api + '/portal/Strategy/get_comment'
    request.sendRequest(url, 'post', data, {
      'token': wx.getStorageSync('openid')
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          that.setData({
            rlist: res.data.data.data
          })
        } else {
          that.setData({
            rlist: res.data.data
          })
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none')
      }
    })
  },

  // 关闭评论弹窗
  toClosed: function() {
    this.setData({
      covers: false,
      rlist: [],
      rhint: '添加评论',
      uid: 0
    })
    this.onShow()
  },

  // 获取输入的评论内容
  getInput: function(e) {
    this.setData({
      relay: e.detail.value
    })
  },

  // 选择回复的评论
  secondReply: function(e) {
    let item = e.currentTarget.dataset.item
    console.log(item)
    let id = item.id
    console.log('回复评论的ID：', id)
    this.setData({
      uid: id,
      rhint: '回复' + item.name
    })
  },

  // 发送
  toSend: function() {
    let that = this
    let id = that.data.rid
    let relay = that.data.relay
    if (!relay) {
      wx.showModal({
        title: '提示',
        content: '请输入评论内容',
      })
    } else {
      let data = {
        id: id,
        content: relay,
        uid: that.data.uid
      }
      console.log('参数：', data);
      let url = app.globalData.api + '/portal/Strategy/do_comment'
      request.sendRequest(url, 'post', data, {
        'token': wx.getStorageSync('openid')
      }).then(function(res) {
        console.log(res);
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            modals.showToast(res.data.msg, 'none')
            console.log('攻略ID：', that.data.rid)
            that.setData({
              relay: '',
              uid: 0,
              rhint: '添加回复'
            })
            that.allComment(that.data.rid)
          }
        } else {
          modals.showToast('系统繁忙，请稍后重试', 'none')
        }
      })
    }
  },

  // 长按删除
  deltReay: function(e) {
    let that = this
    let id = e.currentTarget.dataset.item.id
    console.log('评论ID:', id)
    let openID = e.currentTarget.dataset.item.open_id
    console.log('openID:', openID)
    if (openID == wx.getStorageSync('openid')) {
      wx.showModal({
        title: '提示',
        content: '是否删除该评论',
        success: function(res) {
          if (res.confirm) {
            let url = app.globalData.api + '/portal/Strategy/delete_comment'
            request.sendRequest(url, 'post', {
              id: id
            }, {
              'token': wx.getStorageSync('openid')
            }).then(function(res) {
              if (res.statusCode == 200) {
                if (res.data.status == 1) {
                  modals.showToast(res.data.msg, 'none');
                  that.allComment(that.data.rid)
                } else {
                  modals.showToast(res.data.msg, 'none');
                }
              } else {
                modals.showToast('系统繁忙，请稍后重试', 'none')
              }
            })
          }
        }
      })
    }
  },

  toControl: function(e) {
    let openID = wx.getStorageSync('openid') || ''
    if (!openID) {
      wx.showModal({
        title: '提示',
        content: '登录授权后，才可以进行此项操作哦',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
      })
    } else {
      wx.showActionSheet({
        itemList: ['删除信息'],
        itemColor: '#FF3B30',
        success(res) {
          let id = e.currentTarget.dataset.item.id
          console.log('攻略ID：', id)
          let url = app.globalData.api + '/portal/Strategy/delete'
          request.sendRequest(url, 'post', {
            id: id
          }, {
            'token': wx.getStorageSync('openid')
          }).then(function(res) {
            if (res.statusCode == 200) {
              if (res.data.status == 1) {
                modals.showToast(res.data.msg, 'none');
                that.getList_login(wx.getStorageSync('openid'))
              } else {
                modals.showToast(res.data.msg, 'none');
              }
            } else {
              modals.showToast('系统繁忙，请稍后重试', 'none')
            }
          })
        }
      })
    }
  },

  onPullDownRefresh: function() {

  },
  onReachBottom: function() {

  }
})