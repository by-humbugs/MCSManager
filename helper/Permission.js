function randomString(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHIJKLNMOPQRSTUVWXYZabcdefghijklnmopqrstuvwxyz1234567890_';
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

function defaultFalseCallBack(req, res, ResponseKey, ResponseValue, notAjaxRedirect) {
    if (req.xhr) {
        res.send({
            'ResponseKey': ResponseKey,
            'ResponseValue': ResponseValue
        });
    } else {
        res.redirect(notAjaxRedirect || './error/notlogin');
    }
    res.end();
}

module.exports.randomString = randomString;

module.exports.needLogin = (req, res, trueCallBack, falseCallBack) => {
    if (req.session['login']) {
        if (req.session['login'] === true) {
            trueCallBack && trueCallBack();
            return true;
        }
    }
    falseCallBack ? falseCallBack() : defaultFalseCallBack(req, res, 'user/status', 'NotLogin');
    return false;
}

// module.exports.wsNeedLogin = (ws) => {

// }
const counter = require('../core/counter');

module.exports.isMaster = (wsSession, notPermssionCounter) => {
    if (wsSession.username) {
        if (wsSession.username.substr(0, 1) == '#') {
            return true;
        }
    }
    //某些可能只是单纯的检查，并不需要无权记录
    if (notPermssionCounter)
        counter.plus('notPermssionCounter');
    return false;
}


const TOKEN_NAME = '_T0K_N';
module.exports.tokenName = TOKEN_NAME;
module.exports.tokenCheck = (req, res, trueCallBack, falseCallBack) => {
    if (req.session['token'] && req.query[TOKEN_NAME]) {
        if (req.session['token'] == req.query[TOKEN_NAME]) {
            //不开启一次性 Token
            // req.session['token'] = randomString(32);
            trueCallBack && trueCallBack();
            //new token
            return;
        }
    }
    falseCallBack ? falseCallBack() : defaultFalseCallBack(req, res, 'user/status', 'NotToken', '/error/token');
}


const serverModel = require('../model/ServerModel');
const userModel = require('../model/UserModel');

//先判断用户是否存在，再是否能管理这个服务器，然后再判断这个服务器是否存在
module.exports.isCanServer = (userName, serverName) => {
    userName = userName.trim()
    serverName = serverName.trim();
    if (userName == '' || serverName == '') return false;
    if (userName.substr(0, 1) == '#') return true;

    if (userModel.userCenter().isExist(userName)) {
        let user = userModel.userCenter().get(userName);
        if (user.hasServer(serverName)) {
            if (serverModel.ServerManager().isExist(serverName)) {
                return true;
            }
        }
    }
    return false;
}

