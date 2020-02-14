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
    let data = {
      page: this.data.page,
      length: 10,
      type: this.data.data.type,
      name: this.data.data.word,
      sid: this.data.data.id
    }
    if (openID) {
      this.getList_login(openID, data)
    } else {
      this.getList_unlogin(data)
    }
  },

  getList_login: function(openID, param) {
    let that = this
    let url = app.globalData.api + '/portal/Strategy/lists'
    request.sendRequest(url, 'post', param, {
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

  getList_unlogin: function(param) {
    let that = this
    let url = app.globalData.api + '/portal/Strategy/lists'
    console.log(param)
    request.sendRequest(url, 'post', param, {
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

  toShowVideo: function(e) {
    let that = this
    let index = e.currentTarget.dataset.index
    let change = "list[" + index + "].showVideo";
    that.setData({
      [change]: true
    })
  },

  toCloseVideo: function(e) {
    let that = this
    let index = e.currentTarget.dataset.index
    let change = "list[" + index + "].showVideo";
    that.setData({
      [change]: false
    })
  },

  toOpened: function(e) {
    let that = this
    let index = e.currentTarget.dataset.index
    let change = "list[" + index + "].show";
    that.setData({
      [change]: true
    })
  },

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

  toAllComment: function(e) {
    let that = this
    let item = e.currentTarget.dataset.item
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
    let that = this
    let data = {
      page: that.data.rpage,
      length: 10,
      id: e
    }
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

  toClosed: function() {
    this.setData({
      covers: false,
      rlist: [],
      rhint: '添加评论',
      uid: 0
    })
    this.onShow()
  },

  getInput: function(e) {
    this.setData({
      relay: e.detail.value
    })
  },

  secondReply: function(e) {
    let item = e.currentTarget.dataset.item
    let id = item.id
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
      let url = app.globalData.api + '/portal/Strategy/do_comment'
      request.sendRequest(url, 'post', data, {
        'token': wx.getStorageSync('openid')
      }).then(function(res) {
        if (res.statusCode == 200) {
          if (res.data.status == 1) {
            modals.showToast(res.data.msg, 'none')
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

  deltReay: function(e) {
    let that = this
    let id = e.currentTarget.dataset.item.id
    let openID = e.currentTarget.dataset.item.open_id
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
          let openid = e.currentTarget.dataset.item.open_id
          if (openid == openID) {
            let id = e.currentTarget.dataset.item.id
            let url = app.globalData.api + '/portal/Strategy/delete'
            request.sendRequest(url, 'post', {
              id: id
            }, {
              'token': wx.getStorageSync('openid')
            }).then(function(res) {
              if (res.statusCode == 200) {
                if (res.data.status == 1) {
                  modals.showToast(res.data.msg, 'none');
                } else {
                  modals.showToast(res.data.msg, 'none');
                }
              } else {
                modals.showToast('系统繁忙，请稍后重试', 'none')
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '你没有权限进行此项操作',
            })
          }
        }
      })
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
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      this.getList_login(openID)
    } else {
      this.getList_unlogin()
    }
  },

  onReachBottom: function() {
    let that = this
    let list = that.data.list
    let data = {
      page: that.data.page + 1,
      length: 10,
      type: that.data.data.type,
      name: that.data.data.word,
      sid: that.data.data.id
    }
    let openID = wx.getStorageSync('openid') || ''
    if (openID) {
      this.getBottom_login(openID, data, list)
    } else {
      this.getBottom_unlogin(data, list)
    }
  },

  getBottom_unlogin: function(param, list) {
    let that = this
    let url = app.globalData.api + '/portal/Strategy/lists'
    request.sendRequest(url, 'post', param, {
      'content-type': 'application/json'
    }).then(function(res) {
      console.log(res)
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let one = res.data.data.data
          console.log(one)
          that.setData({
            list: list.concat(one),
            page: param.page
          })
        } else {
          modals.showToast('我也是有底线的', 'none');
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none');
      }
    })
  },

  getBottom_login: function(openID, param, list) {
    let that = this
    let url = app.globalData.api + '/portal/Strategy/lists'
    request.sendRequest(url, 'post', param, {
      'token': openID
    }).then(function(res) {
      if (res.statusCode == 200) {
        if (res.data.status == 1) {
          let one = res.data.data.data
          console.log(one)
          that.setData({
            list: list.concat(one),
            page: param.page
          })
        } else {
          modals.showToast('我也是有底线的', 'none');
        }
      } else {
        modals.showToast('系统繁忙，请稍后重试', 'none');
      }
    })
  }
})