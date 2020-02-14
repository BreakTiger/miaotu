const request = require('../../../../api/http.js')
import modals from '../../../../methods/modal.js'
const app = getApp()

Page({


  data: {
    //出发地
    startPlace: [],
    region: '请选择出发地址',

    name: '',
    mobile: '',
    identity: '',

    total_fina:'0.00'

  },


  onLoad: function(options) {

  },


  onShow: function() {

  }
})