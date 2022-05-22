
var dayjs = require('dayjs')
let time = dayjs().format('YYYY-MM-DD HH:mm:ss') // 2022-01-03 17:46:22

console.log(time)

// 在关于时间查询中我们可能会查询如下情况
 
// 查询某一时间段
//   描述           格式
// 查询某一秒   YYYY-MM-DD HH:mm:ss
// 查询某一分   YYYY-MM-DD HH:mm
// 查询某一时   YYYY-MM-DD HH
// 查询某一天   YYYY-MM-DD
// 查询某一月   YYYY-MM
// 查询某一年   YYYY

// 查询某一时间段 - 某一时间段
//   描述           格式
// 某一秒 - 某一秒   YYYY-MM-DD HH:mm:ss  -  YYYY-MM-DD HH:mm:ss
// 某一分           YYYY-MM-DD HH:mm     -  YYYY-MM-DD HH:mm
// 某一时           YYYY-MM-DD HH        -  YYYY-MM-DD HH
// 某一天           YYYY-MM-DD           -  YYYY-MM-DD
// 某一月           YYYY-MM              -  YYYY-MM
// 某一年           YYYY                 -  YYYY-MM