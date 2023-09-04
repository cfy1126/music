// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
const axios = require('axios')

const BASE_URL = 'https://apis.imooc.com'
const ICODE = 'B6A89A236239CE7A'

cloud.init({
  env: 'develop-1gql0wjg71ab156f',
})

// 云函数入口函数
exports.main = async (event, context) => {
  // 后端路由
  const app = new TcbRouter({
    event
  })
  // 获取云数据库数据
  app.router('playlist', async (ctx, next) => {
    ctx.body = await cloud.database().collection('playlist')
      .skip(event.start)
      .limit(event.count)
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        return res
      })
  })
  // 获取非云数据库数据
  app.router('musiclist', async (ctx, next) => {
    const {
      data
    } = await axios.get(`${BASE_URL}/playlist/detail?id=${parseInt(event.playlistId)}&icode=${ICODE}`)
    ctx.body = data
  })
  app.router('musicUrl', async (ctx, next) => {
    const {
      data
    } = await axios.get(`${BASE_URL}/song/url?id=${event.musicId}&icode=${ICODE}`)
    ctx.body = data
  })
  return app.serve()
}