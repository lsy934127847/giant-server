


/*
this.fail("验证码错误")
{
    errmsg :"验证码错误",
    errno: 1000
}


let data = {code:200,msg:"我是信息"}
this.success(data)
{
    data: {code:200,msg:"我是信息"}
    errmsg :"",
    errno: 0
}


// 为什么要将验证码存在session中 session的作用是什么?
*/

// 更新数据库数据返回值格式
/*
data = await this.model('user').where({Fuser_id}).update(updateData)
返回 data = 1 更新成功的数据条数
*/


//添加数据返回格式
/*
   let res = await this.model('qq_login').add({a:1})
   // 返回插入数据的id
*/

let filterParams = [undefined,'','1']

let a = ''
console.log(filterParams.includes(null))