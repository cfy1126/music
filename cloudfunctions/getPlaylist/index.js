// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-1gql0wjg71ab156f',
})

const db = cloud.database()

const axios = require('axios')

const URL = 'https://apis.imooc.com/personalized?icode=B6A89A236239CE7A'

const playlistCollection = db.collection('playlist')

const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  const countResult = await playlistCollection.count()
  const total = countResult.total
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  let list = {
    data: []
  }
  if (tasks.length > 0) {
    list = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }

  // 更新代码: axios发送请求，请求新的URL
  const {
    data
  } = await axios.get(URL)
  if (data.code >= 1000) {
    console.log(data.msg)
    return 0
  }
  const playlist = data.result

  const newData = []
  for (let i = 0, len1 = playlist.length; i < len1; i++) {
    let flag = true
    for (let j = 0, len2 = list.data.length; j < len2; j++) {
      if (playlist[i].id === list.data[j].id) {
        flag = false
        break
      }
    }
    if (flag) {
      // 更新代码: 给每个歌单信息增加createTime属性
      let pl = playlist[i]
      pl.createTime = db.serverDate()
      // newData.push(playlist[i])
      newData.push(pl)
    }
  }
  console.log(newData)
  console.log([...newData])
  // 更新代码: 一次性批量插入数据
  if (newData.length > 0) {
    await playlistCollection.add({
      data: newData
    }).then((res) => {
      console.log('插入成功')
    }).catch((err) => {
      console.log(err)
      console.error('插入失败')
    })
  }

  return newData.length
}