const util = require('../../../utils/util.js')
const app = getApp();
var orderId;
var start = 7;
var end = start * 2;
var dshlist = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classifyes: null,
    isLoad: true,
    scrollHeight: 750
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var paramsStr = "{\"pageNow\":1,\"pageSize\":10,\"sellInfoType\":\"\",\"userAccountId\":" + app.globalData.userId+"}";
    var params = {
      "params": paramsStr,
      "token": app.globalData.token
    }
    util.wxRequest(app.globalData.hangjia + '/takeout/user/findUserOrderList', params, data => {
      if (data.info == 100) {
        dshlist = data.obj
        console.log(dshlist)
        that.setData({
          classifyes: dshlist,
          isLoad: true
        })
      } else {
        wx.showToast({
          title: data.msg,
        })
      }

    }, data => { }, data => { });
  },
  // 第一个按钮
  stateOne:function(){
    wx.showToast({
      title: '请使用生活Plus',
    })
  },
  bindPay: function (e) {
    var index = e.currentTarget.dataset.index
    console.log(dshlist[index])
    var that = this;
    wx.request({
      url: app.globalData.domain + '/sweep/wxpay/pay/',
      method: "POST",
      data: {
        openid: app.globalData.openid,
        orderPrice: dshlist[index].totalPrice,
        orderId: dshlist[index].orderId
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
                orderId: dshlist[index].orderId
              },
              success: function (res) {
                wx.showToast({
                  title: '支付成功',
                })
                // app.globalData.tableMe.isOrder = 0
                // app.globalData.tableMe.orderId = null
                // console.log("socket", app.globalData.socket)
                // if (app.globalData.socket) {
                //   app.globalData.socket.emit('payment', { openid: app.globalData.openid })
                //   wx.redirectTo({
                //     url: '/pages/scan/payment/payment',
                //   })
                // }
              }
            })
          },
          'fail': function (res) {
            wx.showToast({
              title: '支付失败',
            })
          }
        })
      }
    })
  },
  // 加载更多
  loadingOrder: function () {
    var that = this;
    util.wxRequest(app.globalData.domain + '/sweep/get_order/', { orderId: orderId, end: end }, data => {
      if (data.status == 200) {
        var dshlist = data.orders
        that.setData({
          classifyes: dshlist,
          isLoad: true
        })
        start *= 2
        end = start * 2
      } else {
        wx.showToast({
          title: '拉去购物车出现错误',
        })
      }
    }, data => { }, data => { });
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})