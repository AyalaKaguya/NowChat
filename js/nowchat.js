var $$ = mdui.JQ;
var NC_version = "1.4"
var NC_bulid = 200306
var NC_channel = "NowChat_Public"
    //Goeasy controler
var userName, userLocation, userAvatar
var goEasy = new GoEasy({
    host: 'hangzhou.goeasy.io',
    appkey: "BC-de02bc0bb7e54c009f43510d74c88156",
    forceTLS: true,
    onDisconnected: function() {
        console.log('goeasy:连接断开！')
        mdui.dialog({
            title: '错误！',
            content: '与远程服务器连接断开，请刷新后重试！',
            modal: true,
            closeOnEsc: false,
            destroyOnClosed: true
        });
    },
    onConnectFailed: function(error) {
        console.log('goeasy:连接失败或错误！')
        mdui.dialog({
            title: '错误！',
            content: '与远程服务器连接断开，请刷新后重试！',
            modal: true,
            closeOnEsc: false,
            destroyOnClosed: true
        });
    }
});
var login_count = 0;

function randomNum(minNum, maxNum) {
    //随机整数生成器
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
            break;
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
            break;
        default:
            return 0;
            break;
    }
}

function DIVinner(html, div = "textarea") {
    //在div中插入信息，并把滚动条拉到最底
    if (html !== " ") {
        $$('#' + div).append(html);
    };
    var div = document.getElementById('textarea');
    div.scrollTop = div.scrollHeight;
};

function sendMessage() {
    //发送标准对话框信息
    var msg = document.getElementById("messageBox").value
    if (msg !== "") {
        goEasy.publish({
            channel: NC_channel,
            message: "<div class='mdui-row'><div class='mdui-col-xs-1'><img class='mdui-chip-icon mdui-float-right' src='" +
                userAvatar + "'/></div><div class='mdui-col-xs-10'><div class='mdui-text-color-black-icon'>" +
                userName + "</div><div class='mdui-chip mdui-color-white mdui-shadow-2'><span class='mdui-chip-title mdui-text-truncate' style='max-width:500px;'>" +
                msg + "</span></div><br/><br/></div></div>"
        });
        document.getElementById("messageBox").value = "";
    }
};

function commonTipMessage(msg) {
    //发送公共系统信息
    goEasy.publish({
        channel: NC_channel,
        message: "<br/><div style='text-align:center;' class='mdui-text-color-black-secondary'>" + msg + "</div><br/>"
    });
    document.getElementById('messageBox').value = "";
};

//pushMessage("markdown", "paper", "none", "test")

function pushMessage(type, userName, userAvatar, msg, channel = NC_channel) {
    //向Goeasy推送JSON数据
    function pushOrigin(json) {
        goEasy.publish({
            channel: channel,
            message: JSON.stringify(json)
        });
    }
    uuid = $$.guid(userName);
    if (type == "markdown") {
        var json = {
            "type": type,
            "uuid": uuid,
            "userName": userName,
            "userAvatar": userAvatar,
            "message": msg,
            "version": NC_version,
            "build": NC_bulid,
            "channel": channel
        }
        pushOrigin(json)
        document.getElementById('messageBox').value = "";
    };
    if (type == "system") {
        var json = {
            "type": "system",
            "uuid": uuid,
            "userName": null,
            "userAvatar": null,
            "message": msg,
            "version": NC_version,
            "build": NC_bulid,
            "channel": channel
        }
        pushOrigin(json)
    };
    if (type == "private") {
        DIVinner("<br/><div style='text-align:center;' class='mdui-text-color-black-secondary'>" + msg + "</div><br/>")
    }
};

function pullMessage(channel, userName) {
    //从Goeasy拉取JSON数据

};

function privateTipMessage(msg) {
    //发送私有系统信息
    DIVinner("<br/><div style='text-align:center;' class='mdui-text-color-black-secondary'>" + msg + "</div><br/>")
};

function logout() {
    //取消Goeasy频道监听
    commonTipMessage("-- 用户 " + userName + " 已退出本聊天室 --");
    goEasy.unsubscribe({
        channel: NC_channel
    });
    privateTipMessage("-- 您已退出聊天室，您将不会再接收到消息 --");
};

function login() {
    //打开Goeasy频道监听
    commonTipMessage("-- 用户 " + userName + " 已加入本聊天室 --");
    goEasy.subscribe({
            channel: NC_channel,
            onMessage: function(message) {
                DIVinner(message.content);
            }
        }

    );
    privateTipMessage("-- 您已加入聊天室：Public --");
};

function refresh() {
    //刷新，其实没卵用。。。
    goEasy.unsubscribe({
        channel: NC_channel
    });
    goEasy.subscribe({
            channel: NC_channel,
            onMessage: function(message) {
                DIVinner(message.content);
            }
        }

    );
    privateTipMessage("-- 已刷新 --");
};

function openHAS() {
    //打开HAS，获取用户名
    if (mdui.Dialog('#HAS') == "opened") {
        mdui.Dialog('#HAS').destroy()
    }
    new mdui.Dialog('#HAS', {
        modal: true,
        closeOnEsc: false,
        destroyOnClosed: true,
        history: false
    }).open();
};

function init() {
    //初始化页面，添加监听
    //调用一次限制
    login_count = login_count + 1;
    if (login_count !== 1) { return "none" };

    //随机为用户选取头像
    userAvatar = "images/Avatar-" + randomNum(1, 10) + ".png";

    //启动enter键监听
    document.onkeydown = function(event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if (e && e.keyCode == 13) {
            sendMessage();
        };
    };

    //启用页面关闭监听
    window.onbeforeunload = function() {　　
        logout();
    };

    //MDUI 元素控制器
    var inst_ControlMenu = new mdui.Menu('#openControlMenu', '#controlMenu');
    var inst_infoBOX = new mdui.Dialog('#informationBOX');
    document.getElementById('openinfoBOX').addEventListener('click', function() {
        inst_infoBOX.open();
    });
    document.getElementById('openControlMenu').addEventListener('click', function() {
        inst_ControlMenu.open();
    });

    //登陆
    login();
};

//获取用户名等相关配置
openHAS()
var dialog_HAS = document.getElementById('HAS');
dialog_HAS.addEventListener('confirm.mdui.dialog', function() {
    var preg = /^[\u4E00-\u9FA5\uF900-\uFA2D|\w]{2,20}$/
    userName = document.getElementById("HAS_UNI").value
    if (preg.test(userName) == true) {
        init(); //网页初始化
    } else {
        openHAS();
    }
});