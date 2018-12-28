const io = require("../libs/weapp.socket.io.js")
const App = getApp()

let wsStatus = false
let onSocket = null

export const connect = function (cb) {
  if (!onSocket) {
    // onSocket = io('https://www.wssmarket.com/')//socket的地址
    onSocket = io('http://10.102.24.186:5000/')
    onSocket.on('connect', function (res) {
      cb(true, onSocket)
      wsStatus = true
    })
    setTimeout(function () {//超时
      if (!wsStatus) {
        cb(false, onSocket)
      }
      console.log("正在尝试连接...")
    }, 1000)
  } else {
    cb(true, onSocket)
  }
}