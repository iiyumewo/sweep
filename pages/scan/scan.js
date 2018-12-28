const util = require('../../utils/util.js')
const config = require('../../config.js')
const md5 = require("../../libs/md5.js")
const openSocket = require("../../utils/socket.js")
const app = getApp();
var gsellId = null;
var gshopDishes = [];//规格下面的所有菜品
var gconditionsInfo = [];
var gtableNum = 1;
var gtotalPrice = 0
var discount = 0
var greens = {};//菜对应分组
var shoppings = []
var skipOrderUrl = "/pages/scan/order/order" //用来控制跳转那个页面
var money;//用来存规格价格
var practi;//用来存规格的
var cuisine;//规格当前选择的菜品
var actives;//活动优惠
var moneyOffs = []//满减
var isNewComer;//是否可以参加新人满减活动
var moneyOffsStr = []//所有满减优惠
var afterDiscount = 0.00//折扣后
var peopleNew = {}
var standardsCuisine;
Page({
  /**
   * 页面的初始数据
   * classifyes:所有分类以及菜品
   * classify:所有分类
   * pitchId:选中的ID
   * scrollHeight:适配用的，可滑动高度
   * hintContent:有人点餐提示内容
   * totalPrice:总价格openDimension
   * shoppings:购物车所有商品
   * isShoppings:购物车是否显示
   * orderHint: 主页给用户的提示信息
   * atDimension:当前规格
   * money:规格选择多少钱
   */
  data: {
    index: 0,
    toView:"b0",
    classifyes:null,
    classify:[],
    pitchName:"素菜",
    scrollHeight: 900,
    receiveOrder:false,
    hintContent:null,
    totalPrice:0,
    meal:1,
    shopping:[],
    isShoppings:true,
    dimension:true,
    maskFlag:true,
    clickShopDIshes:null,
    conditionsMoney:0,
    conditionsInfo:[],
    actives:[],
    activeTips:"",
    discount:0,
    sellInfo:"",
    isActiveTips:true
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    })
    wx.getStorage({
      key: 'userInfo',
      success: function(res) {
        console.log(res)
        console.log(res.data)
        app.globalData.userInfo = res.data
        app.globalData.userId = res.data.id
        app.globalData.token = res.data.token
      },
      fail:function(){
        wx.redirectTo({
          url: '/pages/scan/index/index',
        })
      }
    })
    // let q = decodeURIComponent(options.q)
    // 扫码获取的商家ID和桌号
    // if (util.getQueryString(q, 'sellId')){
    //   app.globalData.gsellId = util.getQueryString(q, 'sellId').toString()
    //   app.globalData.gtableNum = util.getQueryString(q, 'tableNum').toString()
    //   gsellId = app.globalData.gsellId.toString()
    //   gtableNum = app.globalData.gtableNum.toString()
    // }
    app.globalData.gsellId = "472"
    app.globalData.gtableNum = "2"
    gsellId = app.globalData.gsellId
    gtableNum = app.globalData.gtableNum
    var that = this;
    var height = (wx.getSystemInfoSync().windowHeight * 2) - 450;
    height = height > 900 ? height:900
    if (height > 998){
      height-=150
    }
    app.globalData.scrollHeight = height
    this.setData({
      scrollHeight: height
    })
    var paramsStr = "{\"olng\":\"121.610695\",\"sellInfoId\":\"" + gsellId + "\",\"userId\":\"" + app.globalData.userId+"\",\"olat\":\"31.185682\"}";
    var params = {
      "params": paramsStr,
      "token": app.globalData.token
    }
    // 请求接口 拿到商家信息
    util.wxRequest(app.globalData.hangjia +'/takeout/user/getShopperDtail', params, data => {
      console.log(data)
      if (data.info == 100){
        var classifyes = data.obj.categoryList
        app.globalData.gsellInfo = data.obj.sellInfo;
        wx.setNavigationBarTitle({
          title: app.globalData.gsellInfo.sellName
        })
        
        actives = data.obj.activeInfo
        for (var active in actives){
          if (actives[active].activeName == "满减"){
            moneyOffs.push({
              arrivalAmount:actives[active].arrivalAmount,
              fullAmount: actives[active].fullAmount
            })
            moneyOffsStr.push("满" + actives[active].arrivalAmount + "减" + actives[active].fullAmount)
          }
        }
        for (var i in moneyOffs) {
          moneyOffs.push(moneyOffs[i].arrivalAmount);
        }
        moneyOffs.sort(function (num1, num2) {
          return num2-num1;
        })
        app.globalData.activeInfo = data.obj.activeInfo
        isNewComer = data.obj.isNewComer;
        app.globalData.isNewComer = data.obj.activeInfo
        if (classifyes != undefined) {
          gshopDishes = classifyes
          // 第一次进来拉一下同桌点的餐
          that.setData({
            classifyes: gshopDishes,
            actives: actives,
            sellInfo: data.obj.sellInfo
          })
          if (actives != [] && isNewComer == 0){
            for (var active in actives){
              if(actives[active].activeName == "新人立减"){
                peopleNew = {arrivalAmount: actives[active].arrivalAmount, fullAmount: actives[active].fullAmount}
              }
            }
          }else{
            that.setData({
              isActiveTips: true
            })
          }
          that.getShopping();
          wx.hideLoading();
          
        }
      } else if (data.info == 991){
        wx.redirectTo({
          url: '/pages/scan/index/index',
        })
        wx.showToast({
          title: '登录超时',
        })
      }
      
    }, data => { }, data => { });
    
  },
  // 点击切换分类，并且显示菜品
  pitchCuisine: function (e) {
    var classifyIndex = e.target.dataset.classifyIndex
    var id = e.target.dataset.id
    this.setData({
      index: classifyIndex,
      toView: "b" + id
    })
  },
  // 减菜按钮
  minuteCuisine:function(e){
    var cuisineId = e.currentTarget.dataset.cuisineId;
    var cuisinesIndex = e.currentTarget.dataset.cuisinesIndex;
    var cuisine = gshopDishes[cuisinesIndex].shopDishesMap[cuisineId];
    this.minusCuisine(cuisine)
  },
  // 加菜按钮
  plusCuisine:function(e){
    // 根据点击的传来的ID，获取当前界面菜品ID所有信息
    var cuisineId = e.currentTarget.dataset.cuisineId;
    var cuisinesIndex = e.currentTarget.dataset.cuisinesIndex;
    var cuisine = gshopDishes[cuisinesIndex].shopDishesMap[cuisineId];
    this.plusCuisineFun(cuisine)
  },
  // 浏览菜品大图
  browseCuisine:function(e){
    wx.previewImage({
      urls: [e.target.dataset.urlImage],
    })
  },
  // 购物车
  SkipShopping: function (e) {
    if (gtotalPrice <= 0) {
      return;
    }
    wx.navigateTo({
      url: '/pages/scan/shopping/shopping?discount=' + discount
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  openShopping:function(){
    if (gtotalPrice <= 0) {
      return;
    }
    this.setData({
      isShoppings:false,
      dimension: false
    })
    var that = this;
    var paramsStr = "{\"sellInfoId\":\"" + gsellId + "\",\"userId\":\"" + app.globalData.userId + "\"}";
    var params = {
      "params": paramsStr,
      "token": app.globalData.token
    }
    
    util.wxRequest(app.globalData.hangjia +'/takeout/user/cart/getUserCart', params, data => {
      if (data.info == 100) {
        shoppings = data.obj.userCart
          that.setData({
            shoppings: shoppings
          })
        }else{
          console.log(app.globalData.token)
        }
    }, data => { }, data => { });
  },
  closeShopping:function(){
    this.setData({
      isShoppings: true,
      maskFlag: true,
      dimension:true
    })
  },
  // 跳转订单页面
  sikpOrder:function(){
    wx.navigateTo({
      url: '/pages/scan/payment/payment',
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getShopping()
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

  },
  // 自动计算满多少减多少
  motionCount:function(){
    if (actives == [] || actives == undefined) {
      return;
    } else if (isNewComer == 0) {
      if (peopleNew.fullAmount > afterDiscount) {
        discount = 0.01
      } else {
        discount = gtotalPrice - peopleNew.fullAmount
      }
    } else{
      var maxcnt = moneyOffs[moneyOffs.length - 1];
      app.globalData.maxcnt = maxcnt
      if (gtotalPrice < maxcnt) {//如果要是小于最小的满减 提示所有满减
        discount = gtotalPrice
        function toDecimal(x) {
          var f = parseFloat(x);
          if (isNaN(f)) {
            return;
          }
          f = Math.round(x * 100) / 100;
          return f;
        }
        discount = toDecimal(discount)
        this.setData({
          discount: discount,
          activeTips: moneyOffsStr.toString(),
          isActiveTips: false
        })
        return;
      } else {
        var previous = 0//记录上一个满减的价格
        for (var moneyOff in moneyOffs) {
          var arrivalAmount = moneyOffs[moneyOff].arrivalAmount
          var fullAmount = moneyOffs[moneyOff].fullAmount
          if (gtotalPrice > arrivalAmount) {
            discount = (afterDiscount - fullAmount) + previous
            afterDiscount = afterDiscount - fullAmount
            previous = fullAmount
            var index = parseInt(moneyOff)+1
            if (typeof moneyOffs[index] != 'number'){
              this.setData({
                activeTips: "下单减" + (gtotalPrice - discount) + "元, 再买" + moneyOffs[index].arrivalAmount + "元" + "可减" + moneyOffs[index].fullAmount + "元"
              })
            }else{
              this.setData({
                isActiveTips:true
              })
            }
          }
        }
      }
    }
    this.setData({
      discount: discount.toFixed(2)
    })
    
  },
  // 加菜方法
  plusCuisineFun: function (cuisine, money, specification){
    var that = this;
    if (money != undefined){
      gtotalPrice = parseFloat(money) + parseFloat(gtotalPrice)
    }else{
      gtotalPrice = parseFloat(cuisine.dishSellPrice) + parseFloat(gtotalPrice)
    }
    afterDiscount = gtotalPrice
    var normsFlag = ""
    var flavor =  "" 
    var practice = "" 
    var paramsStr = ""
    var conditions = ""
    var cuisineId = cuisine.id
    if (cuisineId == undefined){
      cuisineId = cuisine.dishesId
    }
    paramsStr = "{\"sellInfoId\":\"" + gsellId + "\",\"userId\":\"" + app.globalData.userId + "\",\"dishesId\":\"" + cuisineId + "\",\"normsInfo\":\"\",\"conditionsInfo\":\"\",\"typeNumber\":1}";
    if (specification != undefined){
      normsFlag = specification.normsFlag
      flavor = specification.flavor
      practice = specification.practice
      if (practice != undefined && flavor!= undefined){
        conditions = flavor + "," + practice
      }else{
        conditions = practice
      }
      if (specification.conditionsInfo != undefined){
        conditions = specification.conditionsInfo
        cuisineId = cuisine.dishesId
      }
      paramsStr = "{\"sellInfoId\":\"" + gsellId + "\",\"userId\":\"" + app.globalData.userId + "\",\"dishesId\":\"" + cuisineId + "\",\"normsInfo\":\"" + normsFlag + "\",\"conditionsInfo\":\"" + conditions + "\",\"typeNumber\":1}";
      if (normsFlag != undefined && conditions==undefined){
        paramsStr = "{\"sellInfoId\":\"" + gsellId + "\",\"userId\":\"" + app.globalData.userId + "\",\"dishesId\":\"" + cuisineId + "\",\"normsInfo\":\"" + normsFlag + "\",\"conditionsInfo\":\"\",\"typeNumber\":1}";
      }
    }
    var params = {
      "params": paramsStr,
      "token": app.globalData.token
    }
    util.wxRequest(app.globalData.hangjia +'/takeout/user/cart/updateUserCart', params, data => {
      if (data.info == 100) {
        cuisine.dishNum += 1
        that.motionCount();
        gconditionsInfo.isShopping = true
        gconditionsInfo.cuisine = cuisine
        that.setData({
          classifyes: gshopDishes,
          conditionsInfo: gconditionsInfo,
          totalPrice: gtotalPrice.toFixed(2),
          meal: 2
        })
        // 发送用户点击的菜品给其他人
        var parameter = {
          userId: app.globalData.userInfo.id,
          dishName: cuisine.dishName,
          dishSellPrice: cuisine.dishSellPrice,
          dishImgUrl: cuisine.dishImgUrl,
          userName: app.globalData.userInfo.userName
        }
        if (app.globalData.socket) {
          app.globalData.socket.emit('spot order', parameter)
        }
      }else if(data.info == 900){
        wx.showToast({
          title: '超出限购',
        })
        if (money != undefined) {
          gtotalPrice = parseFloat(gtotalPrice) - parseFloat(money)
        } else {
          gtotalPrice = parseFloat(gtotalPrice) - parseFloat(cuisine.dishSellPrice)
        }
      }else{
        if (money != undefined) {
          gtotalPrice = parseFloat(gtotalPrice) - parseFloat(money)
        } else {
          gtotalPrice = parseFloat(gtotalPrice) - parseFloat(cuisine.dishSellPrice)
        }
      }
    }, data => { }, data => { });
  },
  // 减菜方法
  minusCuisine: function (cuisine, money, specification){
    var that = this;
    cuisine.dishNum -= 1
    if (money != undefined) {
      gtotalPrice = parseFloat(gtotalPrice) - parseFloat(money)
    } else {
      gtotalPrice = parseFloat(gtotalPrice) - parseFloat(cuisine.dishSellPrice)
    }
    if (gtotalPrice <= 0){
      that.setData({
        meal: 1,
        isShoppings:true,
        dimension:true
      })
    }
    var normsFlag = ""
    var flavor = ""
    var practice = ""
    var paramsStr = ""
    var conditions = ""
    var cuisineId = cuisine.id
    paramsStr = "{\"sellInfoId\":\"" + gsellId + "\",\"userId\":\"" + app.globalData.userId + "\",\"dishesId\":\"" + cuisineId + "\",\"normsInfo\":\"\",\"conditionsInfo\":\"\",\"typeNumber\":-1}";
    if (specification != undefined) {
      normsFlag = specification.normsFlag
      flavor = specification.flavor
      practice = specification.practice
      if (practice != undefined && flavor != undefined) {
        conditions = flavor + "," + practice
      } else {
        conditions = practice
      }
      if (specification.conditionsInfo != undefined) {
        conditions = specification.conditionsInfo
        cuisineId = cuisine.dishesId
      }
      paramsStr = "{\"sellInfoId\":\"" + gsellId + "\",\"userId\":\"" + app.globalData.userId + "\",\"dishesId\":\"" + cuisineId + "\",\"normsInfo\":\"" + normsFlag + "\",\"conditionsInfo\":\"" + conditions + "\",\"typeNumber\":-1}";
    }
    var params = {
      "params": paramsStr,
      "token": app.globalData.token
    }
    util.wxRequest(app.globalData.hangjia + '/takeout/user/cart/updateUserCart', params, data => {
      if (data.info == 100) {
        that.setData({
          classifyes: gshopDishes,
          totalPrice: gtotalPrice.toFixed(2),
        })
        that.motionCount();
      }
    }, data => { }, data => { });
  },
  // 拉去购物车数据
  getShopping:function (){
    // 每次回来重新加载一下购物车
    var that = this;
    var paramsStr = "{\"sellInfoId\":\"" + gsellId + "\",\"userId\":\"" + app.globalData.userId + "\"}";
    var params = {
      "params": paramsStr,
      "token": app.globalData.token
    }
    util.wxRequest(app.globalData.hangjia + '/takeout/user/cart/getUserCart', params, data => {
      if (data.info == 100) {
        gtotalPrice = 0
        discount = 0
        shoppings = data.obj.userCart
        // 先把之前点的抹掉
        for (var cuisinesIndex in gshopDishes) {
          for (var cuisineId in gshopDishes[cuisinesIndex].shopDishesMap) {
            gshopDishes[cuisinesIndex].shopDishesMap[cuisineId].dishNum = 0
          }
        }
        var dshlist = data.obj.userCart
        if (dshlist.length != 0) {
          that.setData({
            meal: 2
          })
        } else {
          that.setData({
            meal: 1
          })
        }
        for (var dshIndex in dshlist) {
          for (var cuisinesIndex in gshopDishes) {
            for (var cuisineId in gshopDishes[cuisinesIndex].shopDishesMap) {
              if (gshopDishes[cuisinesIndex].shopDishesMap[cuisineId].id == dshlist[dshIndex].dishesId) {
                var dcuine = dshlist[dshIndex]
                gtotalPrice = parseFloat(gtotalPrice)+(parseFloat(dcuine.price) * dcuine.dishNumber)
                gshopDishes[cuisinesIndex].shopDishesMap[cuisineId].dishNum = dcuine.dishNumber
                break;
              }
            }
          }
        }
        gtotalPrice = gtotalPrice.toFixed(2)
        afterDiscount = gtotalPrice
        that.setData({
          classifyes: gshopDishes,
          totalPrice: gtotalPrice
        })
        that.motionCount()
      }
    }, data => { }, data => { });
  },
  openLifePlus:function(){
    wx.navigateTo({
      url: '/pages/loading/loading',
    })
  },
  // 点击分类
  shortButton: function (e) {
    // 分类ID
    var conditionsId = e.target.dataset.conditionsId
    // 选择的ID
    var childId = e.target.dataset.childId
    // 获取到当前点击的child
    var conditions = gconditionsInfo.conditions[conditionsId];
    for (var index in conditions.child) {
      conditions.child[index].isSelect = false;
    }
    conditions.child[childId].isSelect = true;
    this.isDimension()
    this.setData({
      conditionsInfo: gconditionsInfo,
      conditionsMoney: conditions.child[childId].money
    })
  },
  // 判断规格是否有点过菜
  isDimension: function (normsSmallPrice){
    gconditionsInfo.isShopping = false
    var that = this;
    var paramsStr = "{\"sellInfoId\":\"" + gsellId + "\",\"userId\":\"" + app.globalData.userId + "\"}";
    util.wxRequest(app.globalData.hangjia + '/takeout/user/cart/getUserCart', {
        "params": paramsStr,
        "token": app.globalData.token
      }, data => {
      if (data.info == 100) {
        shoppings = data.obj.userCart
        var specification = false;
        var taste = false;
        var practice = false;
        var conditions = gconditionsInfo.conditions
        console.log(standardsCuisine)
        for (var shopping in shoppings) {
          specification = false;
          taste = false;
          practice = false;
          gconditionsInfo.isShopping = false;
          shoppings[shopping].dishNum = 0
          var conditionsInfo;
          cuisine = shoppings[shopping]
          for (var condition in conditions) {
            conditionsInfo = shoppings[shopping].conditionsInfo.split(",");
            var normsInfo = "";
            if (shoppings[shopping].normsInfo == "0") {
              normsInfo = "小份"
            } else if (shoppings[shopping].normsInfo == "1") {
              normsInfo = "中份"
            } else if (shoppings[shopping].normsInfo == "2") {
              normsInfo = "大份"
            }
            if (conditions[condition].name == "规格") {
              for (var index in conditions[condition].child) {
                if (normsInfo == conditions[condition].child[index].name) {
                  if (conditions[condition].child[index].isSelect != false) {
                    specification = true
                    break;
                  }
                }
              }
              if (conditionsInfo == "") {
                if (specification != false && (standardsCuisine.conditionsOne == "" || standardsCuisine.conditionsTwo == "" || standardsCuisine.conditionsOne == ",," || standardsCuisine.conditionsTwo == ",,")) {
                  gconditionsInfo.isShopping = true
                  shoppings[shopping].dishNum = shoppings[shopping].dishNumber
                  //规格菜品
                  gconditionsInfo.cuisine = shoppings[shopping]
                  this.setData({
                    conditionsInfo: gconditionsInfo,
                    conditionsMoney: normsSmallPrice
                  })
                  return;
                }
              }
            } else if (conditions[condition].name == "口味") {
              for (var index in conditions[condition].child) {
                if (conditionsInfo[0] == conditions[condition].child[index].name) {
                  if (conditions[condition].child[index].isSelect != false) {
                    taste = true
                    break;
                  }
                }
              }
            } else if (conditions[condition].name == "做法") {
              for (var index in conditions[condition].child) {
                if (conditionsInfo[1] == conditions[condition].child[index].name) {
                  if (conditions[condition].child[index].isSelect != false) {
                    practice = true
                    break;
                  }
                }
              }
            }
            if (taste == true && specification == true && practice == true) {
              gconditionsInfo.isShopping = true
              shoppings[shopping].dishNum = shoppings[shopping].dishNumber
              //规格菜品
              gconditionsInfo.cuisine = shoppings[shopping]
              this.setData({
                conditionsInfo: gconditionsInfo,
                conditionsMoney: normsSmallPrice
              })
              return;
            }
          }
        }
        gconditionsInfo.isShopping = false
        this.setData({
          conditionsInfo: gconditionsInfo,
          conditionsMoney: normsSmallPrice
        })
      }
    }, data => { }, data => { });
    
  },
  // 打开规格
  openDimension:function(e){
    var cuisineId = e.currentTarget.dataset.cuisineId;
    var cuisinesIndex = e.currentTarget.dataset.cuisinesIndex;
    cuisine = gshopDishes[cuisinesIndex].shopDishesMap[cuisineId];
    standardsCuisine = cuisine
    var dimensions = []
    var conditionsOne = cuisine.conditionsOne
    var conditionsTwo = cuisine.conditionsTwo
    var tastes = conditionsTwo.split(",");
    var practices = conditionsOne.split(",");
    var conditionsList = {
      "cuisine": cuisine,
      "dishName": cuisine.dishName,
      "cuisineId": cuisineId,
      "cuisinesIndex": cuisinesIndex,
      "isShopping": false
    };
    if (conditionsOne == ",," && conditionsTwo == ",,"){
      conditionsList.conditions = [
        {
          "id": 1, "name": "规格", "child": [
            {
              "id": 1, "name": "小份", "money": cuisine.normsSmallPrice, "isSelect": true
            },
            {
              "id": 2, "name": "中份", "money": cuisine.normsMediumPrice, "isSelect": false
            },
            {
              "id": 3, "name": "大份", "money": cuisine.normsBigPrice, "isSelect": false
            }
          ]
        }
      ]
    }else{
      if (conditionsTwo == ",," || conditionsTwo == ","){
        conditionsList.conditions = [
          {
            "id": 1,"name":"规格","child":[
                {
                "id": 1, "name": "小份", "money": cuisine.normsSmallPrice,"isSelect": true 
                },
                {
                  "id": 2, "name": "中份", "money": cuisine.normsMediumPrice,"isSelect": false 
                },
                {
                  "id": 3, "name": "大份", "money": cuisine.normsBigPrice,"isSelect": false 
                }
            ]
        },
          {
            "id": 3, "name": "做法", "child": [
              {
                "id": 1, "name": practices[0], "isSelect": true
              },
              {
                "id": 2, "name": practices[1], "isSelect": false
              },
              {
                "id": 3, "name": practices[2], "isSelect": false
              }
            ]
          }
        ]
      } else if (conditionsOne == ",," || conditionsOne == ","){
         conditionsList.conditions = [
           {
             "id": 1, "name": "规格", "child": [
               {
                 "id": 1, "name": "小份", "money": cuisine.normsSmallPrice, "isSelect": true
               },
               {
                 "id": 2, "name": "中份", "money": cuisine.normsMediumPrice, "isSelect": false
               },
               {
                 "id": 3, "name": "大份", "money": cuisine.normsBigPrice, "isSelect": false
               }
             ]
           },
           {
             "id": 2, "name": "口味", "child": [

               {
                 "id": 1, "name": tastes[0], "isSelect": true
               },
               {
                 "id": 2, "name": tastes[1], "isSelect": false
               },
               {
                 "id": 3, "name": tastes[2], "isSelect": false
               }
             ]
           }
         ]
      }else{
        conditionsList.conditions = [
          {
            "id": 1, "name": "规格", "child": [
              {
                "id": 1, "name": "小份", "money": cuisine.normsSmallPrice, "isSelect": true
              },
              {
                "id": 2, "name": "中份", "money": cuisine.normsMediumPrice, "isSelect": false
              },
              {
                "id": 3, "name": "大份", "money": cuisine.normsBigPrice, "isSelect": false
              }
            ]
          },
          {
            "id": 2, "name": "口味", "child": [
              {
                "id": 1, "name": tastes[0], "isSelect": true
              },
              {
                "id": 2, "name": tastes[1], "isSelect": false
              },
              {
                "id": 3, "name": tastes[2], "isSelect": false
              }
            ]
          },
          {
            "id": 3, "name": "做法", "child": [
              {
                "id": 1, "name": practices[0], "isSelect": true
              },
              {
                "id": 2, "name": practices[1], "isSelect": false
              },
              {
                "id": 3, "name": practices[2], "isSelect": false
              }
            ]
          }
        ]
      }
    }
    // 把规格设成全局
    gconditionsInfo = conditionsList
    this.isDimension(cuisine.normsSmallPrice)
    this.setData({
      clickShopDIshes: cuisine,
      conditionsInfo: gconditionsInfo,
      maskFlag: false,
      dimension: false
    })
  },
  
  // 购物车减菜品
  shopMinusCuisine: function (e) {
    var cuisineId = e.currentTarget.dataset.cuisineId;
    var shoppingIndex = e.currentTarget.dataset.shoppingIndex;
    for (var cuisinesIndex in gshopDishes) {
      for (var cuisineId1 in gshopDishes[cuisinesIndex].shopDishesMap) {
        if (gshopDishes[cuisinesIndex].shopDishesMap[cuisineId1].id == cuisineId) {
          var cuisine = shoppings[shoppingIndex]
          if (cuisine.normsInfo != "") {
            this.minusCuisine(cuisine, cuisine.price, {
              "normsFlag": cuisine.normsInfo,
              "conditionsInfo": cuisine.conditionsInfo
            })
            shoppings[shoppingIndex].dishNumber -= 1
          } else {
            this.minusCuisine(gshopDishes[cuisinesIndex].shopDishesMap[cuisineId1])
            shoppings[shoppingIndex].dishNumber -= 1
          }
          this.setData({
            shoppings: shoppings
          })
          return;
        }
      }
    }
  },
  // 购物车加菜按钮
  shopPlusCuisine: function (e) {
    var cuisineId = e.currentTarget.dataset.cuisineId;
    var shoppingIndex = e.currentTarget.dataset.shoppingIndex;
    for (var cuisinesIndex in gshopDishes) {
      for (var cuisineId1 in gshopDishes[cuisinesIndex].shopDishesMap) {
        if (gshopDishes[cuisinesIndex].shopDishesMap[cuisineId1].id == cuisineId) {
          var cuisine = shoppings[shoppingIndex]
          if (cuisine.normsInfo != "") {
            this.plusCuisineFun(cuisine, cuisine.price, {
              "normsFlag": cuisine.normsInfo,
              "conditionsInfo": cuisine.conditionsInfo
            })
            shoppings[shoppingIndex].dishNumber += 1
          } else {
            this.plusCuisineFun(gshopDishes[cuisinesIndex].shopDishesMap[cuisineId1])
            shoppings[shoppingIndex].dishNumber += 1
          }
          this.setData({
            shoppings: shoppings
          })
          return;
        }
      }
    }
    
  },
  // 规格加入购物车
  dPlusCuisine:function(e){
    var money;
    var normsFlag;
    var flavor;
    var practice;
    var conditions = gconditionsInfo.conditions
    for (var gindex in conditions){
      for (var index in conditions[gindex].child) {
        if (conditions[gindex].child[index].isSelect == true) {
          if (conditions[gindex].name == "规格"){
            money = conditions[gindex].child[index].money
            normsFlag = conditions[gindex].child[index].name
            if (normsFlag == "小份"){
              normsFlag = 0
            } else if (normsFlag == "中份"){
              normsFlag = 1
            } else if (normsFlag == "大份"){
              normsFlag = 2
            }else{
              normsFlag = 0
            }
          }
          if (conditions[gindex].name == "做法"){
            practice = conditions[gindex].child[index].name
          }
          if (conditions[gindex].name == "口味"){
            flavor = conditions[gindex].child[index].name
          }
        }
      }
    }
    this.plusCuisineFun(standardsCuisine,money,{
      "normsFlag": normsFlag,
      "flavor": flavor,
      "practice": practice
    })
    
  },
  // 清空购物车
  delShoppings:function(){
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定要清楚购物车?',
      success(res) {
        if (res.confirm) {
          var paramsStr = "{\"sellInfoId\":\"" + gsellId + "\",\"userId\":\"" + app.globalData.userId + "\"}";
          var params = {
            "params": paramsStr,
            "token": app.globalData.token
          }
          util.wxRequest(app.globalData.hangjia +'/takeout/user/cart/deleteUserCart', params, data => {
            if (data.info == 100) {
              gtotalPrice = 0
              shoppings = []
              for (var cuisinesIndex in gshopDishes) {
                for (var cuisineId in gshopDishes[cuisinesIndex].shopDishesMap) {
                  gshopDishes[cuisinesIndex].shopDishesMap[cuisineId].dishNum = 0
                }
              }
              that.setData({
                meal: 1,
                isActiveTips:true,
                isShoppings:true,
                dimension:true,
                totalPrice: gtotalPrice,
                classifyes: gshopDishes,
                discount: 0.00
              })
            }
          }, data => { }, data => { });
        } else if (res.cancel) {
          return;
        }
      }
    })
  }
})