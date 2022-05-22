var dayjs = require('dayjs')

// 扩展ctx对象
module.exports = {

/**
 * 
 * @returns {string} 返回一个2022-01-03 17:46:22格式的字符串
 */
    dateTime(){
        let time = dayjs().format('YYYY-MM-DD HH:mm:ss') // 2022-01-03 17:46:22
        return time
    },
/**
 * 
 * @param {{}} searchWhereParams 
 * @returns {{}}
 * 用户处理搜索参数 需要将值为
 * undefined null '' 
 * 的参数过滤掉
 */
    handleSearchParams(searchWhereParams){

        let filterParams = [undefined,null,'']
        let finnalyParams = {}
        for(let key in searchWhereParams){
            if(!filterParams.includes(searchWhereParams[key])){
                  // includes全等判断
                  finnalyParams[key] = searchWhereParams[key]
            }
        }

        return finnalyParams
    }
  }