const config = require('../config.js')
const md5 = require("../libs/md5.js")
var app = getApp();
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const wxRequest = (url,params,successCallback,errorCallback,completeCallback) => {
  var that = this;
  var timestamp = Date.parse(new Date());
  params.timestamp = timestamp
  params.format = "json"
  params.version = "3.0"
  params.appKey = "10990665afc94531a3121a0b374d4e78"
  params.signatureMethod = "md5"
  var paramsMd5 = params.params + "appKey=10990665afc94531a3121a0b374d4e78format=jsontimestamp=" + timestamp + "version=3.0signatureMethod=md589bc8adea10a4bbc8730782305a9adff"
  let b64 = md5.md5(paramsMd5);
  params.signature = b64
  wx.request({
    url: url,
    data: params || {},
    header:{
      'content-type': 'application/json'
    },
    method:"POST",
    success:function(res){
      if(res.statusCode == 200){
        successCallback(res.data)
      }else{
        errorCallback(res)
      }
    },
    fail:function(error){
      errorCallback(error)
    },
    complete:function(e){
      completeCallback(e)
    }
  })
}

// 跳转界面封装
var navigateTo = (url, successCallback, errorCallback, completeCallback) => {
  if (config.login == true && config.openid != null){
    wx.navigateTo({
      url: url,
      success: function () {
        successCallback()
      },
      fail: function (error) {
        errorCallback(error)
      },
      complete: function () {
        completeCallback()
      }
    })
  }else{
    wx.showToast({
      title: '请先登录',
      duration: 2000
    })
  }
}
let getQueryString = function (url, name) {
  console.log("url = " + url)
  console.log("name = " + name)
  var reg = new RegExp('(^|&|/?)' + name + '=([^&|/?]*)(&|/?|$)', 'i')
  var r = url.substr(1).match(reg)
  if (r != null) {
    console.log("r = " + r)
    console.log("r[2] = " + r[2])
    return r[2]
  }
  return null;
}

module.exports = {
  formatTime: formatTime,
  wxRequest:wxRequest,
  navigateTo: navigateTo,
  getQueryString: getQueryString
}
