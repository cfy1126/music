// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'develop-1gql0wjg71ab156f',
})

// 云函数入口函数
exports.main = async (event, context) => {
  return await cloud.database().collection('playlist')
    .skip(event.start)
    .limit(event.count)
    .orderBy('createTime', 'desc')
    .get()
    .then(res => {
      return res
    })
}