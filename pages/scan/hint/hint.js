const util = require('../../../utils/util.js')
const app = getApp();
var orderId;
var totalPrice;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sellName:"",
    classifyes: null,
    totalPrice: 0,
    isLoad: true,
    scrollHeight: 600
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var that = this;
    this.setData({
      sellName: app.globalData.gsellInfo.sellName
    })
    orderId = options.orderId;
    var paramsStr = "{\"orderId\":\"" + orderId+"\"}";
    var params = {
      "params": paramsStr,
      "token": app.globalData.token
    }
    util.wxRequest(app.globalData.hangjia + '/takeout/user/findUserOrderDetail', params, data => {
      console.log(data)
      if (data.info == 100) {
        var dshlist = data.obj.shopDishList
        totalPrice = data.obj.settlePrice
        that.setData({
          classifyes: dshlist,
          totalPrice: totalPrice
        })
      } else {
        wx.showToast({
          title: data.msg,
        })
      }

    }, data => { }, data => { });
  },
  // 去加菜
  sikpOrder: function () {
    wx.reLaunch({
      url: '/pages/scan/scan',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  bindPay:function(){
    var that = this;
    wx.request({
      url: app.globalData.domain + '/sweep/wxpay/pay/',
      method: "POST",
      data: {
        openid: app.globalData.openid,
        orderPrice: totalPrice,
        orderId: orderId
      },
      success: function (res) {
        wx.requestPayment({
          timeStamp: res.data.data.timeStamp,
          nonceStr: res.data.data.nonceStr,
          package: res.data.data.package,
          signType: res.data.data.signType,
          paySign: res.data.data.paySign,
          'success': function (res) {
            wx.request({
              url: app.globalData.domain + '/sweep/wxpay/notify/',
              method: "POST",
              data: {
                orderId: orderId
              },
              success: function (res) {
                wx.showToast({
                  title: '支付成功',
                })
                // app.globalData.tableMe.isOrder = 0
                // app.globalData.tableMe.orderId = null
                // console.log("socket", app.globalData.socket)
                // if (app.globalData.socket) {
                //   app.globalData.socket.emit('payment', {openid: app.globalData.openid })
                //   wx.redirectTo({
                //     url: '/pages/scan/payment/payment',
                //   })
                // }
                wx.redirectTo({
                  url: '/pages/scan/payment/payment',
                })
              }
            })
          },
          'fail': function (res) {
            wx.showToast({
              title: '支付失败',
            })
            wx.redirectTo({
              url: '/pages/scan/payment/payment',
            })
          }
        })
      }
    })
    
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})