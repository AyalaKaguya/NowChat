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
         var last_message = document.getElementById(div).innerHTML;
         document.getElementById(div).innerHTML = last_message + html
     };
     var div = document.getElementById('textarea');
     div.scrollTop = div.scrollHeight;
 };

 function sendMessage() {
     //发送标准对话框信息
     var msg = document.getElementById("messageBox").value
     if (msg !== "") {
         goEasy.publish({
             channel: "NowChat_Public",
             message: "<div class='mdui-row'><div class='mdui-col-xs-1'><img class='mdui-chip-icon mdui-float-right' src='" + userAvatar + "'/></div><div class='mdui-col-xs-10'><div class='mdui-text-color-black-icon'>" + userName + "</div><div class='mdui-chip mdui-color-white mdui-shadow-2'><span class='mdui-chip-title mdui-text-truncate' style='max-width:500px;'>" + msg + "</span></div><br/><br/></div></div>"
         });
         document.getElementById("messageBox").value = "";
     }
 };

 function commonTipMessage(msg) {
     //发送公共系统信息
     goEasy.publish({
         channel: "NowChat_Public",
         message: "<br/><div style='text-align:center;' class='mdui-text-color-black-secondary'>" + msg + "</div><br/>"
     });
     document.getElementById('messageBox').value = "";
 };

 function privateTipMessage(msg) {
     //发送私有系统信息
     DIVinner("<br/><div style='text-align:center;' class='mdui-text-color-black-secondary'>" + msg + "</div><br/>")
 };

 function logout() {
     //取消Goeasy频道监听
     commonTipMessage("-- 用户 " + userName + " 已退出本聊天室 --");
     goEasy.unsubscribe({
         channel: "NowChat_Public"
     });
     privateTipMessage("-- 您已退出聊天室，您将不会再接收到消息 --");
 };

 function login() {
     //打开Goeasy频道监听
     commonTipMessage("-- 用户 " + userName + " 已加入本聊天室 --");
     goEasy.subscribe({
             channel: "NowChat_Public",
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
         channel: "NowChat_Public"
     });
     goEasy.subscribe({
             channel: "NowChat_Public",
             onMessage: function(message) {
                 DIVinner(message.content);
             }
         }

     );
     privateTipMessage("-- 已刷新 --");
 };

 function openHAS() {
     new mdui.Dialog('#HAS', {
         modal: true,
         closeOnEsc: false,
         destroyOnClosed: true,
         history: false
     }).open();
 };

 function init() {
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
     }

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
     userName = document.getElementById("HAS_UNI").value
     init();
 });