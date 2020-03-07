var $$ = mdui.JQ;
//系统设置
var NC_version = "1.6",
    NC_bulid = 2003071513,
    NC_channel = "NowChat_Public",
    NC_goeasy = "nowchat-official",
    login_count = 0,
    user_Name,
    user_Location,
    user_Avatar,
    user_UUID

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
    var msg = document.getElementById("messageBox").value
    if (msg !== "") {
        pushMessage("markdown", msg)
        document.getElementById("messageBox").value = "";
    }
};

function msg_processer(json) {
    //处理JSON信息
    if (NC_bulid < json.build) {
        console.log("你的build号：" + NC_bulid + "与目前收到的build号" + json.build + "不匹配，请检查Github上的更新！")
    };
    if (json.type == "markdown") {
        var message_str = json.message
        message_str = message_str.replace(/(!\[[\S| ]+\])(\()([\S| ]+)(\))/gi, '<img src="$3">');
        message_str = message_str.replace(/#(?=\S+\))/g, '%23');
        message_str = message_str.replace(/(##\s+\[)([\S| ]+)(\]\()(\S+)\)/gi, '<h2><a href="$4">$2</a></h2>');
        message_str = message_str.replace(/(\[)([\S| ]+)(\]\()(\S+)\)/g, "<a href='$4'>$2</a>");
        message_str = message_str.replace(/[\n|\r]+/g, "</br>");
        DIVinner("<div class='mdui-row'><div class='mdui-col-xs-1'><img class='mdui-chip-icon mdui-float-right' src='" +
            json.userAvatar + "'/></div><div class='mdui-col-xs-10'><div class='mdui-text-color-black-icon'>" +
            json.userName + "</div><div class='mdui-chip mdui-color-white mdui-shadow-2'><span class='mdui-chip-title mdui-text-truncate' style='max-width:500px;'>" +
            message_str + "</span></div><br/><br/></div></div>")
    };
    if (json.type == "system") {
        if (json.uuid == user_UUID) return;
        DIVinner("<br/><div style='text-align:center;' class='mdui-text-color-black-secondary'>" +
            json.message + "</div><br/>")
    };

};

function pushMessage(type, msg, userName = user_Name, uuid = user_UUID, userAvatar = user_Avatar, channel = NC_channel) {
    //将准备发送的信息打包成JSON,并向Goeasy推送
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
    };
    if (type == "private") {
        DIVinner("<br/><div style='text-align:center;' class='mdui-text-color-black-secondary'>" + msg + "</div><br/>")
        return
    };
    msg_processer(json);
    goEasy.publish({
        channel: json.channel,
        message: JSON.stringify(json)
    });
};

function pullMessage(uuid = user_UUID, channel = NC_channel) {
    //从Goeasy拉取JSON数据
    goEasy.subscribe({
        channel: channel,
        onMessage: function(message) {
            var json = message.content.replace(/<\/?[^>]*>/g, '')
            var json = JSON.parse(json);
            if (json.uuid == user_UUID) return;
            msg_processer(json);
        }
    });
};

function logout() {
    //取消Goeasy频道监听
    pushMessage("system", "-- 用户 " + user_Name + " 已退出本聊天室 --");
    goEasy.disconnect();
    DIVinner("<br/><div style='text-align:center;' class='mdui-text-color-black-secondary'>-- 您已退出聊天室，您将不会再接收到消息 --</div><br/>")
};

function login() {
    //打开Goeasy频道监听
    pushMessage("system", "-- 用户 " + user_Name + " 已加入本聊天室 --");
    pullMessage()
    pushMessage("private", "-- 您已加入聊天室：Public --")
};

function refresh() {
    //刷新，其实没卵用。。。
    pullMessage()
    pushMessage("private", "-- 已刷新 --")
};

function init() {
    //初始化页面，添加监听
    //调用一次限制
    login_count = login_count + 1;
    if (login_count !== 1) { return "none" };

    //随机为用户选取头像
    user_Avatar = "images/Avatar-" + randomNum(1, 10) + ".png";

    //生成用户UUID
    user_UUID = $$.guid(user_Name);

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
    var inst_infoBOX = new mdui.Dialog('#informationBOX', { history: false });
    document.getElementById('openinfoBOX').addEventListener('click', function() {
        inst_infoBOX.open();
    });
    document.getElementById('openControlMenu').addEventListener('click', function() {
        inst_ControlMenu.open();
    });

    //登陆
    login();
};

//获取用户名等相关配置,并启动。
$$(function() {
    var inst_HAS = new mdui.Dialog('#HAS', {
        modal: true,
        closeOnEsc: false,
        closeOnConfirm: false,
        history: false
    });

    var inst_loading = new mdui.snackbar({
        message: '正在连接至服务器....',
        position: 'top',
        timeout: 0,
        closeOnOutsideClick: false
    });

    $$.ajax({
        method: 'GET',
        url: NC_goeasy + '.json',
        xhrFields: {
            withCredentials: true
        },
        dataType: 'json',
        beforeSend: function() {
            inst_loading.open()
        },
        error: function() {
            mdui.dialog({
                title: '错误！',
                content: '无法获取服务器地址。',
                modal: true,
                closeOnEsc: false
            });
        },
        success: function(data) {
            goEasy = new GoEasy({
                host: data.host_ip,
                appkey: data.host_key,
                forceTLS: data.host_TLS,
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
            inst_loading.close()
            mdui.snackbar({
                message: '成功连接至' + data.host_name,
                position: 'top',
                timeout: 2,
                closeOnOutsideClick: false
            });
        }
    });

    inst_HAS.open()
    var dialog_HAS = document.getElementById('HAS');
    dialog_HAS.addEventListener('confirm.mdui.dialog', function() {
        var preg = /^[\u4E00-\u9FA5\uF900-\uFA2D|\w]{2,20}$/
        user_Name = document.getElementById("HAS_UNI").value
        if (preg.test(user_Name) == true) {
            inst_HAS.close()
            init(); //网页初始化
        } else {
            $$('#HAS_label').addClass('mdui-text-color-pink-accent')
        }
    });
})