const util = require('../../../utils/util.js')
const config = require('../../../config.js')
const openSocket = require("../../../utils/socket.js")
const md5 = require("../../../libs/md5.js")
const app = getApp();
var gtableMe;
var latitude = ""
var longitude = ""
var gsocket = null
var coden = 0 ;
var phone = 0;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    phone: true,
    dimension:true,
    code:true,
    islogin:false,
    islogintext:"验证码登录",
    password:false,
    btntext: '获取验证码'
  },
  launchAppError:function(e){
    console.log(e)
  },
  openLifePlus: function () {
    wx.navigateTo({
      url: '/pages/loading/loading',
    })
  },
  open_sweep: function () {
    if (config.login == false) {
      return;
    }
    wx.reLaunch({
      url: '/pages/scan/scan?merchantId=' + app.globalData.gsellId + "&tableNum=" + app.globalData.gtableNum,
    })
  },
  // 获取用户手机号
  getPhone:function(e){
    this.setData({
      phone:false,
      dimension:false
    })
  },
  closeShopping: function () {
    this.setData({
      phone: true,
      dimension: true
    })
  },
  // 获取验证码
  getCode:function(e){
    if (coden != 0){
      return;
    }
    var that = this;
    var phone = e.detail.value.phone
    var paramsStr = "{\"userPhone\":\"" + phone + "\"}";
    var signature = ""
    var params = {
      "params": paramsStr
    }
    coden = 60
    util.wxRequest(app.globalData.hangjia+'/takeout/user/account/getCaptcha', params, data => {
      console.log(data)
      if (data.info == 100){
        wx.showToast({
          title: '发送成功',
        })
        console.log(data.obj.captcha)
          // 定义60秒的倒计时
        var codeV = setInterval(function () {
          that.setData({    // _this这里的作用域不同了
            btntext: '重新获取' + (--coden) + 's'
          })
          if (coden == -1) {  // 清除setInterval倒计时，这里可以做很多操作，按钮变回原样等
            clearInterval(codeV)
            that.setData({
              btntext: '获取验证码',
              isform:false
            })
          }
        }, 1000)  //  1000是1秒
      }
    }, data => { }, data => { });
  },
  // 手机号验证码登录
  codeLogin:function(e){
    var that = this;
    var code = e.detail.value.code
    var phone = e.detail.value.phone
    var paramsStr = "{\"userPhone\":\"" + phone + "\",\"registrationId\":\"1574851\",\"code\":\""+code+"\"}";
    var params = {
      "params": paramsStr
    }
    util.wxRequest(app.globalData.hangjia+'/takeout/user/account/loginByCode', params, data => {
      if (data.info == 100){
        app.globalData.userInfo = data.obj
        wx.setStorage({
          key: "userInfo",
          data: data.obj,
        })
        app.globalData.userId = data.obj.id
        app.globalData.token = data.obj.token
        app.globalData.login = true
        config.login = true
        that.setData({
          phone: false,
          dimension: false
        })
        if (data.obj.wechatOpenId == undefined) {
          if (app.globalData.openid == undefined) {
            wx.showToast({
              title: '请先登录微信',
            })
            return;
          }
          util.wxRequest(app.globalData.domain + '/sweep/setOpenid/', { openid: app.globalData.openid, phone: data.obj.userPhone }, data => {
            if (data.status == 200) {
              wx.showToast({
                title: '登录成功',
              })
              that.open_sweep();
            }
          }, data => { }, data => { });
        }else{
          app.globalData.openid = data.obj.wechatOpenId
          wx.showToast({
            title: '登录成功',
          })
          that.open_sweep();
        }
      }else{
        wx.showToast({
          title: data.msg,
        })
      }
      
    }, data => { }, data => { });
  },
  // 手机号密码登录
  passwordLogin:function(e){
    var that = this;
    var password = e.detail.value.password
    var phone = e.detail.value.phone
    password = md5.md5(password);
    var paramsStr = "{\"userPhone\":\"" + phone + "\",\"registrationId\":\"1574851\",\"userPassword\":\"" + password + "\"}";
    var params = {
      "params": paramsStr
    }
    util.wxRequest(app.globalData.hangjia+'/takeout/user/account/login', params, data => {
      if (data.info == 100) {
        // app.globalData.tableMe = data.tableMe
        // 用户信息
        app.globalData.userInfo = data.obj
        app.globalData.userId = data.obj.id
        app.globalData.token = data.obj.token
        app.globalData.login = true
        config.login = true
        config.openid = app.globalData.openid
        that.setData({
          phone: false,
          dimension: false
        })
        that.open_sweep();
      } else {
        wx.showToast({
          title: data.msg,
        })
      }
    }, data => { }, data => { });

  },
  // 切换验证码登录
  codeLoginActivity:function(){
    this.setData({
      code: false,
      password: true,
      islogin: true,
      islogintext:"密码登录"
    })
  },
  // 切换验证码登录
  passwordActivity: function () {
    this.setData({
      islogin: false,
      code: true,
      password:false,
      islogintext:"验证码登录"
    })
  },
  login: function (e) {
    var that = this
    var e = e
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.login({
      success: res => {
        if (res.code) {
          var params = {
            code: res.code
          }
          util.wxRequest(app.globalData.domain + '/sweep/get_user/', params, data => {
            app.globalData.openid = data.openid
            console.log("登录成功", app.globalData.openid)
          }, data => { }, data => { });
        } else {
          console.log('登陆失败')
        }
      }
    })
    if (config.login){
      this.setData({
        islogin:true
      })
    }
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
    gtableMe = app.globalData.tableMe
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