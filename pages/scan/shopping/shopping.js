const util = require('../../../utils/util.js')
const openSocket = require("../../../utils/socket.js")
const md5 = require("../../../libs/md5.js")
const app = getApp();
var gtotalPrice = 0;
var gclassifyes = null;
var discount = 0
var newMoneyOff = 0
var reduceMoneyOff = 0
var moneyOff = 0
var activeIds = ""
Page({
  /**
   * 页面的初始数据
   */
  data: {
    classifyes:null,
    totalPrice:0,
    isLoad:true,
    scrollHeight:750
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    gtotalPrice = 0
    console.log(options)
    var that = this;
    var timestamp = Date.parse(new Date());
    var paramsStr = "{\"sellInfoId\":\"" + app.globalData.gsellId + "\",\"userId\":\"" + app.globalData.userId + "\"}";
    var paramsMd5 = paramsStr + "appKey=10990665afc94531a3121a0b374d4e78format=jsontimestamp=" + timestamp + "version=3.0signatureMethod=md589bc8adea10a4bbc8730782305a9adff"
    let b64 = md5.md5(paramsMd5);
    var params = {
      "version": "3.0",
      "timestamp": timestamp,
      "params": paramsStr,
      "format": "json",
      "appKey": "10990665afc94531a3121a0b374d4e78",
      "signatureMethod": "md5",
      "token": app.globalData.token
    }
    params.signature = b64
    // 查询购物车
    util.wxRequest(app.globalData.hangjia +'/takeout/user/getAccountOrder', params, data => {
      if (data.info == 100) {
        var dshlist = data.obj.shopOrderList
        gclassifyes = dshlist
        for (var dshIndex in dshlist) {
          var dcuine = dshlist[dshIndex]
          gtotalPrice = parseFloat(gtotalPrice) + (parseFloat(dcuine.price) * dcuine.dishNumber)
        }
        var money1 = gtotalPrice.toFixed(2)
        discount = gtotalPrice.toFixed(2)
        if (money1 > app.globalData.maxcnt) {
          var  actives = app.globalData.activeInfo
          for (var active in actives) {
            if (actives[active].activeName == "新人立减" && app.globalData.isNewComer == 0) {
              newMoneyOff = actives[active].fullAmount
              if (actives[active].fullAmount > money1) {
                discount = 0.01
              } else {
                discount = money1 - actives[active].fullAmount
                money1 = money1 - actives[active].fullAmount
              }
              moneyOff += actives[active].fullAmount
              activeIds += "," + actives[active].id
            } else if (actives[active].activeName == "满减") {
              reduceMoneyOff = actives[active].fullAmount
              if (money1 > actives[active].arrivalAmount) {
                discount = money1 - actives[active].fullAmount
                money1 = money1 - actives[active].fullAmount
              }
              activeIds = actives[active].id
              moneyOff += actives[active].fullAmount
            }
          }
        }else{
          discount = parseFloat(options.discount)
        }
        gtotalPrice = discount
        that.setData({
          classifyes: gclassifyes,
          totalPrice: discount.toFixed(2),
        })
      } else {
        wx.showToast({
          title: '拉去购物车出现错误',
        })
      }
    }, data => { }, data => { });
  },

  // 提交订单
  submitOrder:function(){
    String.prototype.format = function () {
      if (arguments.length == 0) return this;
      var param = arguments[0];
      var s = this;
      if (typeof (param) == 'object') {
        for (var key in param)
          s = s.replace(new RegExp("\\{" + key + "\\}", "g"), param[key]);
        return s;
      } else {
        for (var i = 0; i < arguments.length; i++)
          s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
        return s;
      }
    }
    var that = this;
    var timestamp = Date.parse(new Date());
    var shopOrder = []
    for (var index in gclassifyes) {
      var cuine = gclassifyes[index]
      shopOrder.push("{\"dishNumber\": \"" + cuine.dishNumber + "\",\"price\":\"" + cuine.price + "\",\"normsInfo\": \"\",\"conditionsInfoId\":\""+cuine.dishConditionId + "\",\"dishesId\": \""+cuine.dishesId+ "\",\"conditionsInfo\": \"\",\"normsInfoId\":\""+cuine.dishNormId+"\",\"dishName\": \""+cuine.dishName+"\"}")
    }
    var paramsStr = "{\"newMoneyOff\":\"" + newMoneyOff + "\",\"reduceMoneyOff\":\"" + reduceMoneyOff + "\",\"sendAddress\":\"\",\"dishType\":\"0\",\"orderLng\":0,\"sendUserName\":\"\",\"expectedDeliveryTime\":\"0\",\"orderLat\":0,\"\sendPrice\":\"\",\"appVersion\":\"3.0.0\",\"sellInfoId\":\"" + app.globalData.gsellId + "\",\"activePrice\":\"" + moneyOff + "\",\"orderType\":\"0\",\"sellInfoType\":\"0\",\"settlePrice\":\"" + gtotalPrice.toFixed(2) + "\",\"activeIds\":\"" + activeIds+"\",\"riderSendPrice\":\"\",\"redPacketIds\":\"\",\"moneyOff\":\"" + moneyOff+"\",\"sendPhone\":\"\",\"userAccountId\":\"" + app.globalData.userId + "\",\"remark\":\"\",\"orderPrice\":\"" + gtotalPrice.toFixed(2) + "\",\"shopOrderList\":[" + shopOrder+"]}";
    
    var paramsMd5 = paramsStr + "appKey=10990665afc94531a3121a0b374d4e78format=jsontimestamp=" + timestamp + "version=3.0signatureMethod=md589bc8adea10a4bbc8730782305a9adff"
    let b64 = md5.md5(paramsMd5);
    var params = {
      "version": "3.0",
      "timestamp": timestamp,
      "params": paramsStr,
      "format": "json",
      "appKey": "10990665afc94531a3121a0b374d4e78",
      "signatureMethod": "md5",
      "token": app.globalData.token
    }
    params.signature = b64
    console.log(params)
    util.wxRequest(app.globalData.hangjia +'/takeout/user/placeOrder', params, data => {
      console.log(data)
      if (data.info == 100){
        wx.navigateTo({
          url: '/pages/scan/hint/hint?orderId=' + data.obj.orderId,
        })
      }else{
        
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