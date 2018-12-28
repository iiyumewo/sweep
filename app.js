const util = require('/utils/util.js')
const app = getApp();
App({
  onLaunch: function (res) {
    // let that = this;
    // // 登录
    // wx.login({
    //   success: res => {
    //     if (res.code) {
    //       var that = this;
    //       //发起网络请求
    //       wx.request({
    //         url: 'https://api.weixin.qq.com/sns/jscode2session',
    //         data: {
    //           appid: "wx76c8cb8675237f35",
    //           secret: "67c7b8c13b6fddc0273c0d11e1d9a2a8",
    //           js_code: res.code,
    //           grant_type: "authorization_code"
    //         },
    //         success: function (res) {
    //           if (res.data.openid != null && res.data.openid != undefined) {
    //             that.globalData.openid = res.data.openid
    //             // that.getUser()
    //           }
    //         },
    //         fail: function () {

    //         }
    //       })
    //     } else {
    //       console.log('登录失败！' + res.errMsg)
    //     }
    //   }
    // })
  },
// classifyes商家端用来查菜品信息的
  globalData: {
    // domain:"https://www.wssmarket.com",
    domain:"http://10.102.24.186:5000",
    hangjia:"https://preapi.yangguanghaina.com",
    userInfo: '',
    login:false,
    openid:null,
    classifyes:null,
    scrollHeight:960,
    gsellId:0,
    gtableNum:0,
    sellInfo:null,
    userId:"",
    token:"",
    activeInfo:"",
    isNewComer:0,
    maxcnt:"",
    gsellInfo:null
  }
})