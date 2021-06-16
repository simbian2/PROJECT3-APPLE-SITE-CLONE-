const { users, items, buy, bag } = require('../../models');
const { createToken, createPW } = require("../../JWT");

let join = async (req, res) => {
    res.render('join.html');
}

let login = async (req, res) => {
    res.render('login.html',{
        msg:req.query.msg
    });
}
let login_cookie = async (req,res) => {
    res.clearCookie('username')
    res.clearCookie('item_name')
    res.clearCookie('AccessToken')
    res.render('login.html')
}
let bags = async (req, res) => {
    // console.log(req.cookies['Access_token'])
    // res.render('index.html');

    // let payload = Buffer.from(req.cookies['Access_token'].split('.')[1],'base64').toString();
    // console.log(payload)
    // var {userid} = JSON.parse(payload)
    // console.log(userid)
    // let userList= await bag.findAll({
    //     where:{
    //         users_id:req.id
    //     }
    // });
    // res.json({
        
    // })
}

let join_success = (req, res) => {
    let { username, userbirth, userid, userpw, mobile } = req.body;
    userpw = createPW(userpw);

    users.create({ userid, userpw, username, userbirth, mobile })
    res.redirect('/');
}

let userid_check = async (req,res) =>{
    let {userid} = req.body;
    let rst = {result:false, msg:'해당 email은 기존 등록된 아이디입니다. 다른 email 주소를 입력해주세요.'};
    let idCheckfromDB = await users.findOne({
        where:{userid}
    })
    if (idCheckfromDB == undefined){
        res.json({result:true, msg:'Apple 회원이 되신 것을 축하합니다!'});
    }else{
        res.json(rst)
    }
}


let logincheck = async (req, res) => {
    let { userid, userpw } = req.body;
    userpw = createPW(userpw);//고객이 로그인할 때 쓴 비번을 암호화 
    let result = { result: false, }
    let pick = await users.findOne({where:{userid}});
    if (pick == undefined) {
        result.msg = '이메일이 존재하지 않습니다.';
    } else {
        let userpwfromDB = pick.dataValues.userpw;
        let useridfromDB = pick.dataValues.userid;
        let usernamefromDB = pick.dataValues.username;
        if (userpw != userpwfromDB) {
            result.msg = '비밀번호가 일치하지 않습니다.';
        } else if (userpw == userpwfromDB && userid == useridfromDB) {
            result.result = true;
            result.msg = `Welcom back ${usernamefromDB}!`;
        }
    }
    let Token = createToken(userid);
    res.cookie('AccessToken', Token, {httpOnly:true, secure:true});
    req.session.userid=userid;
    req.session.save(()=>{
        res.json(result);
    })
}

let login_success = (req, res) => {
    res.redirect('/')
}

let chat = (req,res)=>{
    res.render('./chat/chat.html');
}

let chatHelp = (req,res)=>{
    res.render('./chat/chatHelp.html');
}

let chatBtn = (rea,res)=>{
    res.render('./chat/chatBtn.html');
}

let chatRoom = (req,res)=>{
    res.render('./chat/chatRoom.html');
}




module.exports = {
    login_cookie,bags,join, join_success,userid_check, login, logincheck, login_success, chat, chatRoom, chatHelp, chatBtn, 
}