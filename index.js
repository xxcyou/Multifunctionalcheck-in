"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disable = exports.enable = exports.info = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const oim_1 = __importDefault(require("@vikiboss/oim"));
const oicq_1 = require("@vikiboss/oicq");
const setting_json_1 = __importDefault(require("./setting.json"));
const DefaultConfig = {
    unit: setting_json_1.default.unit,
    newbie: setting_json_1.default.newbie,
    remedy: setting_json_1.default.remedy // 补签所需积分，暂未实现
};
const Anti_gag_speech = {
    defend20: 0,
    defend40: 0,
    defend60: 0,
    defend80: 0,
    Like: 0
};
const info = {
    name: "签到多功能",
    author: "xxcyou",//原制作Viki
    version: "1.1.0"
};
// 在Viki制作的积分签到基础上开发
exports.info = info;
const ONE_DAY = 24 * 60 * 60 * 1000; // 一天的毫秒数

// 发送人不是机器人好友时的回复（由于 oicq 协议的限制，只能给好友点赞）
const notFriend = "客官！加一下好友嘛，人家点不到赞赞好委屈 T_T";
// 点赞成功的回复，[n] 变量为点赞数，普通用户为 10，svip 为 20
const success = "人家点了您 [n] 下，回一个嘛客官>3<";
// 点赞失败的回复（一般是点赞上限）
const faild = "人家已经点过了，不要欺负人家好不好讨厌 (*+﹏+*)~@";
let reply_01 = 0.03 //防 20
let reply_02 = 0.02 //防 40
let reply_03 = 0.007 //防 60
let reply_04 = 0.002 //防 80
let reply_1 = 0.08 //点赞
let reply_2 = 0.3 //积分 1
let reply_3 = 0.04 //积分 10
let reply_4 = 0.02 //积分 50
let reply_5 = 0.003 //积分 100
let reply_6 = 0.0003 //积分 1000
let reply_7 = 0.00003 //积分 10000
let reply_8 = 0.000003 //积分 100000
//剩下的 0.08 概率就是反击
let Xxzl = [
    "半衰期艾利克斯 V1.5.2 中文版",
    "街机",
    "20G 破解教程",
    "C 语言编程系列教程 (1.1.1 版本)",
    "VB 编程系列教程 (1.1.1 版本)",
    "逆向综合系列教程 (1.1.1 版本)",
    "其他综合类编程系列教程 (1.1.1 版本)",
    "易语言编程系列教程 (1.1.1 版本)",
    "大型安卓安全公开课"
];
let Xxzllj = [
    "链接：https://pan.baidu.com/s/1GU_-S136o_UI5oIk39zs0A?pwd=aaaa",
    "链接：https://pan.baidu.com/s/1m1R68-wCuYqFAkS92oLUeA?pwd=aaaa",
    "链接：https://pan.baidu.com/s/1pVvWZFKr1asHHZbYydnvIw?pwd=aaaa",
    "链接：https://pan.baidu.com/s/1bWOKIyDRHIxSrnDLsu_TFA?pwd=aaaa",
    "链接：https://pan.baidu.com/s/1Phhov5ENDcZkL4D8C7oDUA?pwd=aaaa",
    "链接：https://pan.baidu.com/s/1b2-OYgtm58JbRvgdbHRlZg?pwd=aaaa",
    "链接：https://pan.baidu.com/s/19ql1jjfaKUjH-fcm3_meeA?pwd=aaaa",
    "链接：https://pan.baidu.com/s/1Khiqvg1HrpggvK440EGfPg?pwd=aaaa",
    "链接：https://pan.baidu.com/s/1Dt5sPrpIFhxb5uFh4IOHTw?pwd=aaaa"
];
let pluginData = {};
let botAdmins = [];
const banAdmin = true;
const AT_REG_EXP = /\[CQ:at,qq=(.*?)]/g;
const nullInfo = {
    isOwner: false,
    isAdmin: false,
    owner_id: 0,
    admins: [],
    list: [],
    info: null
};
function sleep(n) {
    var start = new Date().getTime();
    while (true) {
        if (new Date().getTime() - start > n) {
            // 使用  break  实现；
            break;
        }
    }
}
const QQuser = [2021973733, 2638277701];//不准@
const fetchGroupInfo = (bot, group_id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const info = (yield bot.getGroupInfo(group_id)).data;
    if (!info)
        return nullInfo;
    const isOwner = (info === null || info === void 0 ? void 0 : info.owner_id) === bot.uin;
    const owner_id = info.owner_id;
    const groupMemberList = (yield bot.getGroupMemberList(group_id)).data
    const list = groupMemberList;
    const admins = [];
    for (const groupId of list.keys()) {
        const roleIsAdmin = ((_a = list.get(groupId)) === null || _a === void 0 ? void 0 : _a.role) === "admin";
        if (roleIsAdmin && ((_b = list.get(groupId)) === null || _b === void 0 ? void 0 : _b.user_id)) {
            admins.push((_c = list.get(groupId)) === null || _c === void 0 ? void 0 : _c.user_id);
        }
    }
    const isAdmin = admins.includes(bot.uin);
    return { isOwner, isAdmin, owner_id, admins, list, info };
});

const getQQFromAt = (msg) => Number(oim_1.default.mid(msg, "qq=", ","));
// 定义一个判断是否可以禁言目标 qq 的函数
function canBan(group_id, qq) {
    return __awaiter(this, void 0, void 0, function* () {
        const { isOwner, isAdmin, owner_id, admins } = yield fetchGroupInfo(this, group_id);
        const senderIsGroupAmin = [...admins, owner_id].includes(qq);
        const isNotSelf = this.uin !== qq;
        const isBanAdmin = banAdmin && isOwner && senderIsGroupAmin;
        const isBanMember = (isOwner || isAdmin) && !senderIsGroupAmin;
        return isNotSelf && (isBanAdmin || isBanMember);
    });
}

// function cantitle(group_id, qq) {
//     return __awaiter(this, void 0, void 0, function* () {
//         var list = (yield this.getGroupMemberInfo(group_id, qq)).data;
//         if (list.title.indexOf("100 积分") != -1) {
//             return 1;
//         } else if (list.title.indexOf("520 积分") != -1) {
//             return 2;
//         } else if (list.title.indexOf("1000 积分") != -1) {
//             return 3;
//         } else if (list.title.indexOf("9999 积分") != -1) {
//             return 4;
//         }
//         return 0;
//     });
// }

const checkData = (group, user) => {
    if (!pluginData[group]) {
        pluginData[group] = {
            config: DefaultConfig,
            store: [],
            userData: {}
        };
    }
    if (!pluginData[group].userData[user]) {
        pluginData[group].userData[user] = {
            total: 0,
            continue: 0,
            Title: 0,
            records: [],
            Prevent_silence: Anti_gag_speech
        };
    }
};
const fileExist = (filePath) => {
    try {
        return fs_1.default.statSync(filePath).isFile();
    }
    catch (_a) {
        return false;
    }
};
const dirExist = (dirPath) => {
    try {
        return fs_1.default.statSync(dirPath).isDirectory();
    }
    catch (_a) {
        return false;
    }
};
const isIntNum = (val) => {
    if (parseFloat(val).toString() == "NaN") {
        return false;
    } else {
        return true;
    }
}
const nowForFileName = () => oim_1.default.format(new Date(), "MM 月 DD 日 HH 时 mm 分 ss 秒");
function save(data) {
    try {
        const dir = path_1.default.join(__dirname, String(this.uin));
        const filePath = path_1.default.join(dir, "config.json");
        if (!dirExist(dir))
            fs_1.default.mkdirSync(dir);
        fs_1.default.writeFileSync(filePath, JSON.stringify(data, null, 2));

        return true;
    }
    catch (_a) {
        return false;
    }
}
function load(defaultData) {
    const dir = path_1.default.join(__dirname, String(this.uin));
    const filePath = path_1.default.join(dir, "config.json");
    try {
        if (!dirExist(dir))
            fs_1.default.mkdirSync(dir);
        if (!fileExist(filePath)) {
            save.call(this, defaultData);
            return defaultData;
        }
        return JSON.parse(fs_1.default.readFileSync(filePath, { encoding: "utf-8" }));
    }
    catch (_a) {
        fs_1.default.copyFileSync(filePath, path_1.default.join(dir, `[${nowForFileName()}]-config.json`));
        const msg = `配置读取失败，已尝试将原始数据备份到原目录`;
        console.log(msg);
        save.call(this, defaultData);
        return defaultData;
    }
}
function upload(name, group) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [qq, GFS] = [String(this.uin), this.acquireGfs(group)];
            const uploadFileName = `${name}-${nowForFileName()}-config.json`;
            let [qqDirExists, pid, ls] = [false, "", yield GFS.ls()];
            for (const l of ls) {
                if (l.name === qq && ((_a = l) === null || _a === void 0 ? void 0 : _a.is_dir)) {
                    qqDirExists = true;
                    pid = (_b = l) === null || _b === void 0 ? void 0 : _b.fid;
                }
            }
            if (!qqDirExists) {
                const state = yield GFS.mkdir(qq);
                pid = state.fid;
            }
            yield GFS.upload(path_1.default.join(__dirname, qq, "config.json"), pid, uploadFileName);
            return `✅ ${name}：已将配置文件上传至指定群`;
        }
        catch (e) {
            return `❎ ${name}：配置文件上传失败，错误信息：${e === null || e === void 0 ? void 0 : e.message}`;
        }
    });
}

function lottery(group_id, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        checkData(group_id, user_id);
        var Tq = pluginData[group_id].userData[user_id].Title;
        const TqJ = [1, 2, 4, 8, 16, 32];
        const Mpnc = ["", "100 积分", "1000 积分", "9999 积分", "9-6 积分", "9-14 积分"];
        const unit = '积分'
        const total = pluginData[group_id].userData[user_id].total;
        if (total < TqJ[Tq]) {
            return `${oicq_1.cqcode.at(user_id)}${unit}不够！剩余: ${total} ${unit}`;
        }
        const ss = Tq > 0 ? `${oicq_1.cqcode.at(user_id)}\n---【${Mpnc[Tq]}】加成抽奖次数 X ${TqJ[Tq]} 次---\n` : `${oicq_1.cqcode.at(user_id)}\n---【无头衔】无加成抽奖次数 X 1 次---\n`;
        var msg = '';
        var jilv = false;
        var random_type = Math.random();
        for (var i = 0; i < TqJ[Tq]; i++) {
            if (!jilv) {
                random_type = Math.random();
            } else {
                random_type = 0.99;
            }
            if (random_type > reply_01) {
                if (random_type > reply_01 + reply_02) {
                    if (random_type > reply_01 + reply_02 + reply_03) {
                        if (random_type > reply_01 + reply_02 + reply_03 + reply_04) {
                            if (random_type > reply_01 + reply_02 + reply_03 + reply_04 + reply_1) {
                                if (random_type > reply_01 + reply_02 + reply_03 + reply_04 + reply_1 + reply_2) {
                                    if (random_type > reply_01 + reply_02 + reply_03 + reply_04 + reply_1 + reply_2 + reply_3) {
                                        if (random_type > reply_01 + reply_02 + reply_03 + reply_04 + reply_1 + reply_2 + reply_3 + reply_4) {
                                            if (random_type > reply_01 + reply_02 + reply_03 + reply_04 + reply_1 + reply_2 + reply_3 + reply_4 + reply_5) {
                                                if (random_type > reply_01 + reply_02 + reply_03 + reply_04 + reply_1 + reply_2 + reply_3 + reply_4 + reply_5 + reply_6) {
                                                    if (random_type > reply_01 + reply_02 + reply_03 + reply_04 + reply_1 + reply_2 + reply_3 + reply_4 + reply_5 + reply_6 + reply_7) {
                                                        if (random_type > reply_01 + reply_02 + reply_03 + reply_04 + reply_1 + reply_2 + reply_3 + reply_4 + reply_5 + reply_6 + reply_7 + reply_8) {
                                                            checkData(group_id, user_id);
                                                            pluginData[group_id].userData[user_id].total -= 1;
                                                            save.call(this, pluginData);
                                                            msg += `${i + 1}连 抽奖 : 抱歉什么都没抽中！\n`;
                                                            sleep(10);
                                                        } else {
                                                            checkData(group_id, user_id);
                                                            pluginData[group_id].userData[user_id].total -= 1;
                                                            pluginData[group_id].userData[user_id].total += 100000;
                                                            save.call(this, pluginData);
                                                            msg += `${i + 1}连 抽奖 : 恭喜你获得*100000 积分！\n`;
                                                            sleep(10);
                                                            jilv = true;
                                                        }
                                                    } else {
                                                        checkData(group_id, user_id);
                                                        pluginData[group_id].userData[user_id].total -= 1;
                                                        pluginData[group_id].userData[user_id].total += 10000;
                                                        save.call(this, pluginData);
                                                        msg += `${i + 1}连 抽奖 : 恭喜你获得*10000 积分！\n`;
                                                        sleep(10);
                                                        jilv = true;
                                                    }
                                                } else {
                                                    checkData(group_id, user_id);
                                                    pluginData[group_id].userData[user_id].total -= 1;
                                                    pluginData[group_id].userData[user_id].total += 1000;
                                                    save.call(this, pluginData);
                                                    msg += `${i + 1}连 抽奖 : 恭喜你获得*1000 积分！\n`;
                                                    sleep(10);
                                                    jilv = true;
                                                }
                                            } else {
                                                checkData(group_id, user_id);
                                                pluginData[group_id].userData[user_id].total -= 1;
                                                pluginData[group_id].userData[user_id].total += 100;
                                                save.call(this, pluginData);
                                                msg += `${i + 1}连 抽奖 : 恭喜你获得*100 积分！\n`;
                                                sleep(10);
                                                jilv = true;
                                            }
                                        } else {
                                            checkData(group_id, user_id);
                                            pluginData[group_id].userData[user_id].total -= 1;
                                            pluginData[group_id].userData[user_id].total += 50;
                                            save.call(this, pluginData);
                                            msg += `${i + 1}连 抽奖 : 恭喜你获得*50 积分！\n`;
                                            sleep(10);
                                            jilv = true;
                                        }
                                    } else {
                                        checkData(group_id, user_id);
                                        pluginData[group_id].userData[user_id].total -= 1;
                                        pluginData[group_id].userData[user_id].total += 10;
                                        save.call(this, pluginData);
                                        msg += `${i + 1}连 抽奖 : 恭喜你获得*10 积分！\n`;
                                        sleep(10);

                                    }
                                } else {
                                    checkData(group_id, user_id);
                                    pluginData[group_id].userData[user_id].total -= 1;
                                    pluginData[group_id].userData[user_id].total += 1;
                                    save.call(this, pluginData);
                                    msg += `${i + 1}连 抽奖 : 恭喜你获得*1 积分！\n`;
                                    sleep(10);

                                }
                            } else {
                                checkData(group_id, user_id);
                                pluginData[group_id].userData[user_id].total -= 1;
                                pluginData[group_id].userData[user_id].Prevent_silence.Like += 1;
                                save.call(this, pluginData);
                                msg += `${i + 1}连 抽奖 : 喜你获得《赞我》*1 张！\n`;
                                sleep(10);
                            }
                        } else {
                            checkData(group_id, user_id);
                            pluginData[group_id].userData[user_id].total -= 1;
                            pluginData[group_id].userData[user_id].Prevent_silence.defend80 += 1;
                            save.call(this, pluginData);
                            msg += `${i + 1}连 抽奖 : 喜你获得『防禁言 80%』*1 张！\n`;
                            sleep(10);
                            jilv = true;

                        }
                    } else {
                        checkData(group_id, user_id);
                        pluginData[group_id].userData[user_id].total -= 1;
                        pluginData[group_id].userData[user_id].Prevent_silence.defend60 += 1;
                        save.call(this, pluginData);
                        msg += `${i + 1}连 抽奖 : 喜你获得『防禁言 60%』*1 张！\n`;
                        sleep(10);
                        jilv = true;
                    }
                } else {
                    checkData(group_id, user_id);
                    pluginData[group_id].userData[user_id].total -= 1;
                    pluginData[group_id].userData[user_id].Prevent_silence.defend40 += 1;
                    save.call(this, pluginData);
                    msg += `${i + 1}连 抽奖 : 喜你获得『防禁言 40%』*1 张！\n`;
                    sleep(10);
                    jilv = true;
                }
            } else {
                checkData(group_id, user_id);
                pluginData[group_id].userData[user_id].total -= 1;
                pluginData[group_id].userData[user_id].Prevent_silence.defend20 += 1;
                save.call(this, pluginData);
                msg += `${i + 1}连 抽奖 : 喜你获得『防禁言 20%』*1 张！\n`;
                sleep(10);
            }
        }
        sleep(50);
        checkData(group_id, user_id);
        const total1 = pluginData[group_id].userData[user_id].total;
        return ss + msg + `---需扣除${TqJ[Tq]}, 总积分剩余：${total1} ${unit}---`;
    });
}

function listener(data) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    var _aa, _bb, _cc, _dd, _ee, _ff;
    return __awaiter(this, void 0, void 0, function* () {
        const { raw_message: _message, user_id, message_type: type, message_id: msg_id, reply } = data;
        const message = _message.trim();
        const rep = type === "group" ? oicq_1.cqcode.reply(msg_id) : "";
        if (botAdmins.includes(user_id) && message === ((_a = setting_json_1.default === null || setting_json_1.default === void 0 ? void 0 : setting_json_1.default.admin) === null || _a === void 0 ? void 0 : _a.backup)) {
            return yield reply(yield upload.call(this, info.name, setting_json_1.default.group));
        }
        else if (botAdmins.includes(user_id) && message === ((_b = setting_json_1.default === null || setting_json_1.default === void 0 ? void 0 : setting_json_1.default.admin) === null || _b === void 0 ? void 0 : _b.count)) {
            const today = new Date(oim_1.default.format(new Date(), "YYYY-MM-DD 00:00")).getTime();
            let [un, aun] = [0, 0];
            const groups = Object.values(pluginData).map((e) => e.userData);
            for (const group of groups) {
                for (const user of Object.values(group)) {
                    if (user.records.length <= 0)
                        continue;
                    aun += 1;
                    if (user.records[user.records.length - 1].time !== today)
                        continue;
                    un += 1;
                }
            }
            return yield reply(`${rep}今日签到人数：${un}\n总签到人数：${aun}`);
        }
        if (type !== "group")
            return;
        const unit = DefaultConfig.unit;
        const { group_id } = data;
        if (message === "签到帮助") {
            return yield reply(
                '----------签到帮助----------\n\n' +
                '<>为可选参数，可填可不填\n' +
                '签到(获取积分)\n' +
                '积分排行\n' +
                '我的积分\n' +
                '\n----------签到商店----------\n\n' +
                '赞我(5积分)[点赞]\n' +
                '转盘@(5积分)[禁言]\n' +
                '禁言一分@@(10积分)[禁言]\n' +
                '禁言五分@@(50积分)[禁言]\n' +
                '禁言十分@@(100积分)[禁言]\n' +
                '100积分<保留>(100积分)[头衔]\n' +
                '1000积分<保留>(1000积分)[头衔]\n' +
                '9999积分<保留>(9999积分)[头衔]\n' +
                '9-6积分<保留>(999999积分)[头衔]\n' +
                '9-14积分<保留>(99999999999999积分)[头衔]\n' +
                '戳我(1积分)[抽奖]\n' +
                '\n----------签到被动----------\n\n' +
                '防禁20(30积分)[F禁言]\n' +
                '防禁40(50积分)[F禁言]\n' +
                '防禁60(80积分)[F禁言]\n' +
                '防禁80(120积分)[F禁言]\n' +
                '\n----------签到功能----------\n\n' +
                '给积分1@(积分)[转账]\n' +
                '卖头衔(+积分)[转账]\n' +
                '卖道具赞我<1>|防禁20<1>|防禁40<1>|>以此类推(+积分)[转账]\n' +
                '\n----------签到管理----------\n\n' +
                '                  #备份签到\n' +
                '                  #签到统计\n' +
                '                  #管积分1@\n' +
                '\n----------签到END-----------'
            );
        }
        if (message === ((_c = setting_json_1.default === null || setting_json_1.default === void 0 ? void 0 : setting_json_1.default.user) === null || _c === void 0 ? void 0 : _c.sign)) {
            checkData(group_id, user_id);
            const today = new Date(oim_1.default.format(new Date(), "YYYY-MM-DD 00:00")).getTime();
            const user = pluginData[group_id].userData[user_id];
            const isNewUser = user.records.length <= 0;
            const canSign = isNewUser || ((_d = user.records[user.records.length - 1]) === null || _d === void 0 ? void 0 : _d.time) < today;
            if (canSign) {
                let [sign, con] = [{ time: today, credit: 1 }, 1];
                const newbie = pluginData[group_id].config.newbie;
                const isContinue = ((_e = user.records[user.records.length - 1]) === null || _e === void 0 ? void 0 : _e.time) + ONE_DAY === today;
                if (isNewUser) {
                    sign = { time: today, credit: 1 + newbie };
                }
                else if (isContinue) {
                    con = user.continue + 1;
                    sign = { time: today, credit: con < 7 ? con : con };
                }
                var Tq = pluginData[group_id].userData[user_id].Title;
                const TqJ = [0, 1, 5, 10, 99, 99999];
                const Mpnc = ["", "100 积分", "1000 积分", "9999 积分", "9-6 积分", "9-14 积分"];
                pluginData[group_id].userData[user_id].records.push(sign);
                pluginData[group_id].userData[user_id].continue = con;
                pluginData[group_id].userData[user_id].total += sign.credit + TqJ[Tq];
                if (save.call(this, pluginData)) {
                    const mingpai = Tq > 0 ? `头衔加成【${Mpnc[Tq]}】加 ${TqJ[Tq]} ${unit}` : "";
                    const extra = isNewUser && newbie > 0 ? `，已为你额外加成首签 ${newbie} ${unit}` : "";
                    const continueStr = isContinue ? `，连签 ${con} 天` : "";
                    return yield reply(`${rep}签到成功，获得 ${sign.credit} ${unit}${continueStr}${extra}${mingpai}`);
                }
                else {
                    return yield reply(`${rep}数据读写失败，请联系管理员`);
                }
            }
            else {
                return yield reply(`${rep}今天已经签过了`);
            }
        }
        else if (message === ((_f = setting_json_1.default === null || setting_json_1.default === void 0 ? void 0 : setting_json_1.default.user) === null || _f === void 0 ? void 0 : _f.mine)) {
            checkData(group_id, user_id);
            const total = pluginData[group_id].userData[user_id].total;
            const Fjy20 = pluginData[group_id].userData[user_id].Prevent_silence.defend20;
            const Fjy40 = pluginData[group_id].userData[user_id].Prevent_silence.defend40;
            const Fjy60 = pluginData[group_id].userData[user_id].Prevent_silence.defend60;
            const Fjy80 = pluginData[group_id].userData[user_id].Prevent_silence.defend80;
            const Like = pluginData[group_id].userData[user_id].Prevent_silence.Like;
            return yield reply(`${rep}
            ----------拥有道具----------\n
            防禁言 20%: ${Fjy20}张\n
            防禁言 40%: ${Fjy40}张\n
            防禁言 60%: ${Fjy60}张\n
            防禁言 80%: ${Fjy80}张\n
            赞我 : ${Like}张\n
            你当前拥有 ${total} ${unit}
            `);
        }
        else if (message === ((_g = setting_json_1.default === null || setting_json_1.default === void 0 ? void 0 : setting_json_1.default.user) === null || _g === void 0 ? void 0 : _g.rank)) {
            const Mpnc = ["无", "100 积分", "1000 积分", "9999 积分", "9-6 积分", "9-14 积分"];
            checkData(group_id, user_id);
            const groupData = pluginData[group_id].userData;
            const today = new Date(oim_1.default.format(new Date(), "YYYY-MM-DD 00:00")).getTime();
            let arr = [];
            let [msg, i] = [`=== ${unit}排行榜 ===`, 1];
            for (const user of Object.keys(groupData)) {
                const userData = groupData[Number(user)];
                //                     先赋值给_h                               ||_h === nul
                const lastTime = (_h = userData.records[userData.records.length - 1]) === null || _h === void 0 ? void 0 : _h.time;
                const isContinue = lastTime === today || lastTime + ONE_DAY === today;// 假||假 = 假 or 假||真 = 真 or 真||假 | 真 = 真 
                const total = userData.total;
                const con = userData.continue;
                const Title = userData.Title;
                arr.push({ user, total, con, Title, isContinue });
            }
            arr = arr.sort((pre, next) => pre.total - next.total).reverse();
            for (const item of arr.slice(0, 10)) {
                msg += `\n第 ${i++} 名：${oicq_1.cqcode.at(Number(item.user), undefined, true)}「${Mpnc[Number(item.Title)]}」`;
                msg += `\n共 ${item.total} ${unit}`;
                msg += item.isContinue ? `，连签 ${item.con} 天` : "";
            }
            return yield reply(msg);
        } else if (message === ((_j = setting_json_1.default === null || setting_json_1.default === void 0 ? void 0 : setting_json_1.default.store) === null || _j === void 0 ? void 0 : _j.Kk01)) {
            const isFriend = this.fl.get(user_id);
            if (!isFriend) {
                return yield reply(`${rep}${notFriend}`);
            }
            checkData(group_id, user_id);
            var Tq = pluginData[group_id].userData[user_id].Title;
            const TqJ = [0, 1, 2, 3, 4, 4];
            const Mpnc = ["", "100 积分", "1000 积分", "9999 积分", "9-6 积分", "9-14 积分"];
            const mingpai = Tq > 0 ? `头衔减免【${Mpnc[Tq]}】减 ${TqJ[Tq]} ${unit}` : "";
            const total = pluginData[group_id].userData[user_id].total;
            const Like = pluginData[group_id].userData[user_id].Prevent_silence.Like;
            if (total < (5 - TqJ[Tq]) && Like < 1) {
                return yield reply(`${rep}${unit}不够！剩余：${total} ${unit}`);
            }
            let n = 0;
            while (true) {
                const res = yield this.sendLike(user_id, 10);
                if (res.error)
                    break;
                else
                    n += 10;
            }
            const msg = n > 0 ? Like < 1 ? success.replace(/\[n]/g, String(n)) + `${mingpai} ,剩余：${total - (5 - TqJ[Tq])} ${unit}` : success.replace(/\[n]/g, String(n)) + `本次消耗一张赞我卡！` : faild;
            if (n > 0)
                if (Like < 1)
                    pluginData[group_id].userData[user_id].total -= (5 - TqJ[Tq]);
                else
                    pluginData[group_id].userData[user_id].Prevent_silence.Like -= 1;
            save.call(this, pluginData)
            return yield reply(rep + msg);
        } else if (message === ((_cc = setting_json_1.default === null || setting_json_1.default === void 0 ? void 0 : setting_json_1.default.store) === null || _cc === void 0 ? void 0 : _cc.Kk08)) {
            //20
            checkData(group_id, user_id);
            const total = pluginData[group_id].userData[user_id].total;
            if (total < 30) {
                return yield reply(`${rep}${unit}不够！剩余：${total} ${unit}`);
            }
            pluginData[group_id].userData[user_id].total -= 30;
            pluginData[group_id].userData[user_id].Prevent_silence.defend20 += 1;
            save.call(this, pluginData);
            return yield reply(`${rep}购买『防禁言 20%』* 1 张，剩余：${total - 30} ${unit}`);
        } else if (message === ((_dd = setting_json_1.default === null || setting_json_1.default === void 0 ? void 0 : setting_json_1.default.store) === null || _dd === void 0 ? void 0 : _dd.Kk09)) {
            //40
            checkData(group_id, user_id);
            const total = pluginData[group_id].userData[user_id].total;
            if (total < 50) {
                return yield reply(`${rep}${unit}不够！剩余：${total} ${unit}`);
            }
            pluginData[group_id].userData[user_id].total -= 50;
            pluginData[group_id].userData[user_id].Prevent_silence.defend40 += 1;
            save.call(this, pluginData);
            return yield reply(`${rep}购买『防禁言 40%』* 1 张，剩余：${total - 50} ${unit}`);

        } else if (message === ((_ee = setting_json_1.default === null || setting_json_1.default === void 0 ? void 0 : setting_json_1.default.store) === null || _ee === void 0 ? void 0 : _ee.Kk10)) {
            //60
            checkData(group_id, user_id);
            const total = pluginData[group_id].userData[user_id].total;
            if (total < 80) {
                return yield reply(`${rep}${unit}不够！剩余：${total} ${unit}`);
            }
            pluginData[group_id].userData[user_id].total -= 80;
            pluginData[group_id].userData[user_id].Prevent_silence.defend60 += 1;
            save.call(this, pluginData);
            return yield reply(`${rep}购买『防禁言 60%』* 1 张，剩余：${total - 80} ${unit}`);

        } else if (message === ((_ff = setting_json_1.default === null || setting_json_1.default === void 0 ? void 0 : setting_json_1.default.store) === null || _ff === void 0 ? void 0 : _ff.Kk11)) {
            //80
            checkData(group_id, user_id);
            const total = pluginData[group_id].userData[user_id].total;
            if (total < 120) {
                return yield reply(`${rep}${unit}不够！剩余：${total} ${unit}`);
            }
            pluginData[group_id].userData[user_id].total -= 120;
            pluginData[group_id].userData[user_id].Prevent_silence.defend20 += 1;
            save.call(this, pluginData);
            return yield reply(`${rep}购买『防禁言 80%』* 1 张，剩余：${total - 120} ${unit}`);

        } else if (message.includes('100积分')) {
            const matches = message.replace('100积分', "");
            if (matches.indexOf("保留") == -1) {
                if (matches != "") {
                    return;
                }
            }
            checkData(group_id, user_id);
            const total = pluginData[group_id].userData[user_id].total;
            if (total < 100) {
                return yield reply(`${rep}${unit}不够！剩余：${total} ${unit}`);
            }
            if (matches.indexOf("保留") == -1) {
                yield this.setGroupSpecialTitle(group_id, user_id, '100积分', true);
            }
            pluginData[group_id].userData[user_id].total -= 100;
            pluginData[group_id].userData[user_id].Title = 1;
            save.call(this, pluginData);
            return yield reply(`${rep}设置成功，剩余：${total - 100} ${unit}`);
        } else if (message.includes('1000积分')) {
            const matches = message.replace('1000积分', "");
            if (matches.indexOf("保留") == -1) {
                if (matches != "") {
                    return;
                }
            }
            checkData(group_id, user_id);
            const total = pluginData[group_id].userData[user_id].total;
            if (total < 1000) {
                return yield reply(`${rep}${unit}不够！剩余：${total} ${unit}`);
            }
            if (matches.indexOf("保留") == -1) {
                yield this.setGroupSpecialTitle(group_id, user_id, '1000积分', true);
            }
            pluginData[group_id].userData[user_id].total -= 1000;
            pluginData[group_id].userData[user_id].Title = 2;
            save.call(this, pluginData);
            return yield reply(`${rep}设置成功，剩余：${total - 1000} ${unit}`);
        } else if (message.includes('9999积分')) {
            const matches = message.replace('9999积分', "");
            if (matches.indexOf("保留") == -1) {
                if (matches != "") {
                    return;
                }
            }
            checkData(group_id, user_id);
            const total = pluginData[group_id].userData[user_id].total;
            if (total < 9999) {
                return yield reply(`${rep}${unit}不够！剩余：${total} ${unit}`);
            }
            if (matches.indexOf("保留") == -1) {
                yield this.setGroupSpecialTitle(group_id, user_id, '9999积分', true);
            }
            pluginData[group_id].userData[user_id].total -= 9999;
            pluginData[group_id].userData[user_id].Title = 3;
            save.call(this, pluginData);
            return yield reply(`${rep}设置成功，剩余：${total - 9999} ${unit}`);
        } else if (message.includes('9-6积分')) {
            const matches = message.replace('9-6积分', "");
            if (matches.indexOf("保留") == -1) {
                if (matches != "") {
                    return;
                }
            }
            checkData(group_id, user_id);
            const total = pluginData[group_id].userData[user_id].total;
            if (total < 999999) {
                return yield reply(`${rep}${unit}不够！剩余：${total} ${unit}`);
            }
            if (matches.indexOf("保留") == -1) {
                yield this.setGroupSpecialTitle(group_id, user_id, '9-6积分', true);
            }
            pluginData[group_id].userData[user_id].total -= 999999;
            pluginData[group_id].userData[user_id].Title = 4;
            save.call(this, pluginData);
            return yield reply(`${rep}设置成功，剩余：${total - 999999} ${unit}`);
        } else if (message.includes('9-14积分')) {
            const matches = message.replace('9-14积分', "");
            if (matches.indexOf("保留") == -1) {
                if (matches != "") {
                    return;
                }
            }
            checkData(group_id, user_id);
            const total = pluginData[group_id].userData[user_id].total;
            if (total < 99999999999999) {
                return yield reply(`${rep}${unit}不够！剩余：${total} ${unit}`);
            }
            if (matches.indexOf("保留") == -1) {
                yield this.setGroupSpecialTitle(group_id, user_id, '9-14积分', true);
            }
            pluginData[group_id].userData[user_id].total -= 99999999999999;
            pluginData[group_id].userData[user_id].Title = 5;
            save.call(this, pluginData);
            return yield reply(`${rep}设置成功，剩余：${total - 99999999999999} ${unit}`);
        } else if (message.includes('转盘')) {
            const matches = message.match(AT_REG_EXP);
            if (!matches)
                return;
            const qqs = Array.from(new Set([...matches.map(getQQFromAt)]));
            checkData(group_id, user_id);
            var Tq = pluginData[group_id].userData[user_id].Title;
            const TqJ = [0, 1, 2, 3, 4, 4];
            const JYK = [1, 0.4, 0.6, 0.2, 0.8];
            const NCO = ["", "『防禁言 60%』", "『防禁言 40%』", "『防禁言 80%』", "『防禁言 20%』"];
            const Mpnc = ["", "100 积分", "1000 积分", "9999 积分", "9-6 积分", "9-14 积分"];
            const mingpai = Tq > 0 ? `头衔减免【${Mpnc[Tq]}】减 ${TqJ[Tq]} ${unit}` : "";
            for (const e of QQuser) {
                if (qqs.includes(e)) {
                    yield this.setGroupBan(group_id, user_id, 3 * 60);
                    return yield reply(`${rep}不准@管理！！！！`);
                }
            }
            if (!(yield canBan.call(this, group_id, qqs[0])))
                return yield reply(`机器人并非群 ${group_id} 的管理员，无法禁言`);
            if (qqs[0] == user_id)
                return yield reply(`${rep}无法禁言自己！`);

            const total = pluginData[group_id].userData[user_id].total;
            if (total < (5 - TqJ[Tq])) {
                return yield reply(`${rep}${unit}不够！剩余：${total} ${unit}`);
            }
            const rand = oim_1.default.random(1, 6);
            pluginData[group_id].userData[user_id].total -= (5 - TqJ[Tq]);
            save.call(this, pluginData);
            yield reply(`${rep}${mingpai} 剩余：${total - (5 - TqJ[Tq])} ${unit}`)
            const QQ = (rand == 1 || rand == 3 || rand == 5) ? user_id : qqs[0];
            checkData(group_id, QQ);
            const F20 = pluginData[group_id].userData[QQ].Prevent_silence.defend20;
            const F40 = pluginData[group_id].userData[QQ].Prevent_silence.defend40;
            const F60 = pluginData[group_id].userData[QQ].Prevent_silence.defend60;
            const F80 = pluginData[group_id].userData[QQ].Prevent_silence.defend80;
            const FFZ = F40 > 0 ? 1 : F60 > 0 ? 2 : F80 > 0 ? 3 : F20 > 0 ? 4 : 0;
            switch (FFZ) {
                case 1:
                    pluginData[group_id].userData[QQ].Prevent_silence.defend40 -= 1;
                    break;
                case 2:
                    pluginData[group_id].userData[QQ].Prevent_silence.defend60 -= 1;
                    break;
                case 3:
                    pluginData[group_id].userData[QQ].Prevent_silence.defend80 -= 1;
                    break;
                case 4:
                    pluginData[group_id].userData[QQ].Prevent_silence.defend20 -= 1;
                    break;
                default:
                    break;
            }
            // 执行禁言
            if (Math.random() < JYK[FFZ]) {
                yield this.setGroupBan(group_id, QQ, 5 * 60);
                if (FFZ > 0) {
                    yield reply(`${oicq_1.cqcode.at(QQ)}已为您使用${NCO[FFZ]} 防御失败！`);
                }
            } else {
                if (FFZ > 0) {
                    yield reply(`${oicq_1.cqcode.at(QQ)}已为您使用${NCO[FFZ]} 防御成功！`);
                }
            }
            return yield reply(`${oicq_1.cqcode.at(QQ)}第${rand}枪，你死了！`);
        } else if (message.includes('禁言一分')) {
            const matches = message.match(AT_REG_EXP);
            if (!matches)
                return;
            const qqs = Array.from(new Set([...matches.map(getQQFromAt)]));
            checkData(group_id, user_id);
            var Tq = pluginData[group_id].userData[user_id].Title;
            const TqJ = [0, 1, 2, 3, 4, 9];
            const JYK = [1, 0.8, 0.6, 0.4, 0.2]
            const NCO = ["", "『防禁言 20%』", "『防禁言 40%』", "『防禁言 60%』", "『防禁言 80%』"];
            const Mpnc = ["", "100 积分", "1000 积分", "9999 积分", "9-6 积分", "9-14 积分"];
            const mingpai = Tq > 0 ? `头衔减免【${Mpnc[Tq]}】减 ${TqJ[Tq] * qqs.length} ${unit}` : "";
            for (const e of QQuser) {
                if (qqs.includes(e)) {
                    yield this.setGroupBan(group_id, user_id, 3 * 60);
                    return yield reply(`${rep}不准@管理！！！！`);
                }
            }
            const total = pluginData[group_id].userData[user_id].total;
            if (total < ((10 - TqJ[Tq]) * qqs.length)) {
                return yield reply(`${rep}${unit}不够！剩余：${total} ${unit}`);
            }
            let msg = "";
            // 循环变量被艾特的 qq 列表
            for (const qq of qqs.slice(0)) {
                // 检测是否有足够的权限禁言，权限不够则跳过。
                if (!(yield canBan.call(this, group_id, qq)))
                    continue;
                // 定义一个逻辑变量，用于判断当前处理的 qq 是否是触发人
                const isSender = qq === user_id;
                // 执行禁言
                checkData(group_id, qq);
                const F20 = pluginData[group_id].userData[qq].Prevent_silence.defend20;
                const F40 = pluginData[group_id].userData[qq].Prevent_silence.defend40;
                const F60 = pluginData[group_id].userData[qq].Prevent_silence.defend60;
                const F80 = pluginData[group_id].userData[qq].Prevent_silence.defend80;
                const FFZ = F20 > 0 ? 1 : F40 > 0 ? 2 : F60 > 0 ? 3 : F80 > 0 ? 4 : 0;
                switch (FFZ) {
                    case 1:
                        pluginData[group_id].userData[qq].Prevent_silence.defend20 -= 1;
                        break;
                    case 2:
                        pluginData[group_id].userData[qq].Prevent_silence.defend40 -= 1;
                        break;
                    case 3:
                        pluginData[group_id].userData[qq].Prevent_silence.defend60 -= 1;
                        break;
                    case 4:
                        pluginData[group_id].userData[qq].Prevent_silence.defend80 -= 1;
                        break;
                    default:
                        break;
                }
                // 执行禁言
                if (Math.random() < JYK[FFZ]) {
                    yield this.setGroupBan(group_id, qq, 1 * 60);
                    msg += `禁言:${oicq_1.cqcode.at(qq)}(一分钟)\n`;
                    if (FFZ > 0) {
                        yield reply(`${oicq_1.cqcode.at(qq)}已为您使用${NCO[FFZ]} 防御失败！`);
                    }
                } else {
                    if (FFZ > 0) {
                        yield reply(`${oicq_1.cqcode.at(qq)}已为您使用${NCO[FFZ]} 防御成功！`);
                    }
                }
                // 未闪避则在待发送的消息后面追加随机禁言文案

            }
            if (msg) {
                // 发送待发消息
                yield reply(`${oicq_1.cqcode.at(user_id)}使用一分钟禁言卡\n` + msg);
            }
            else {
                // 如果消息为空，说明机器人不能禁言任何人
                // 可能机器人不是管理员，此时打印日志到控制台
                console.log(`自爆：机器人并非群 ${group_id} 的管理员，无法禁言`);
            }

            pluginData[group_id].userData[user_id].total -= ((10 - TqJ[Tq]) * qqs.length);
            save.call(this, pluginData);
            return yield reply(`${rep}禁言成功，${mingpai},剩余：${total - ((10 - TqJ[Tq]) * qqs.length)} ${unit}`);
        } else if (message.includes('禁言五分')) {
            const matches = message.match(AT_REG_EXP);
            if (!matches)
                return;
            const qqs = Array.from(new Set([...matches.map(getQQFromAt)]));
            checkData(group_id, user_id);
            var Tq = pluginData[group_id].userData[user_id].Title;
            const TqJ = [0, 3, 6, 12, 25, 45];
            const JYK = [1, 0.6, 0.4, 0.2, 0.8];
            const NCO = ["", "『防禁言 60%』", "『防禁言 40%』", "『防禁言 80%』", "『防禁言 20%』"];
            const Mpnc = ["", "100 积分", "1000 积分", "9999 积分", "9-6 积分", "9-14 积分"];
            const mingpai = Tq > 0 ? `头衔减免【${Mpnc[Tq]}】减 ${TqJ[Tq] * qqs.length} ${unit}` : "";
            for (const e of QQuser) {
                if (qqs.includes(e)) {
                    yield this.setGroupBan(group_id, user_id, 3 * 60);
                    return yield reply(`${rep}不准@管理！！！！`);
                }
            }
            const total = pluginData[group_id].userData[user_id].total;
            if (total < ((50 - TqJ[Tq]) * qqs.length)) {
                return yield reply(`${rep}${unit}不够！剩余：${total} ${unit}`);
            }
            let msg = "";
            // 循环变量被艾特的 qq 列表
            for (const qq of qqs.slice(0)) {
                // 检测是否有足够的权限禁言，权限不够则跳过。
                if (!(yield canBan.call(this, group_id, qq)))
                    continue;
                // 定义一个逻辑变量，用于判断当前处理的 qq 是否是触发人
                const isSender = qq === user_id;
                checkData(group_id, qq);
                const F20 = pluginData[group_id].userData[qq].Prevent_silence.defend20;
                const F40 = pluginData[group_id].userData[qq].Prevent_silence.defend40;
                const F60 = pluginData[group_id].userData[qq].Prevent_silence.defend60;
                const F80 = pluginData[group_id].userData[qq].Prevent_silence.defend80;
                const FFZ = F40 > 0 ? 1 : F60 > 0 ? 2 : F80 > 0 ? 3 : F20 > 0 ? 4 : 0;
                switch (FFZ) {
                    case 1:
                        pluginData[group_id].userData[qq].Prevent_silence.defend40 -= 1;
                        break;
                    case 2:
                        pluginData[group_id].userData[qq].Prevent_silence.defend60 -= 1;
                        break;
                    case 3:
                        pluginData[group_id].userData[qq].Prevent_silence.defend80 -= 1;
                        break;
                    case 4:
                        pluginData[group_id].userData[qq].Prevent_silence.defend20 -= 1;
                        break;
                    default:
                        break;
                }
                // 执行禁言
                if (Math.random() < JYK[FFZ]) {
                    yield this.setGroupBan(group_id, qq, 5 * 60);
                    msg += `禁言:${oicq_1.cqcode.at(qq)}(五分钟)\n`;
                    if (FFZ > 0) {
                        yield reply(`${oicq_1.cqcode.at(qq)}已为您使用${NCO[FFZ]} 防御失败！`);
                    }
                } else {
                    if (FFZ > 0) {
                        yield reply(`${oicq_1.cqcode.at(qq)}已为您使用${NCO[FFZ]} 防御成功！`);
                    }
                }
            }
            if (msg) {
                // 发送待发消息
                yield reply(`${oicq_1.cqcode.at(user_id)}使用五分钟禁言卡\n` + msg);
            }
            else {
                // 如果消息为空，说明机器人不能禁言任何人
                // 可能机器人不是管理员，此时打印日志到控制台
                console.log(`自爆：机器人并非群 ${group_id} 的管理员，无法禁言`);
            }

            pluginData[group_id].userData[user_id].total -= ((50 - TqJ[Tq]) * qqs.length);
            save.call(this, pluginData);
            return yield reply(`${rep}禁言成功，${mingpai},剩余：${total - ((50 - TqJ[Tq]) * qqs.length)} ${unit}`);
        } else if (message.includes('禁言十分')) {
            const matches = message.match(AT_REG_EXP);
            if (!matches)
                return;
            const qqs = Array.from(new Set([...matches.map(getQQFromAt)]));
            checkData(group_id, user_id);
            var Tq = pluginData[group_id].userData[user_id].Title;
            const TqJ = [0, 10, 20, 30, 40, 90];
            const JYK = [1, 0.2, 0.4, 0.6, 0.8];
            const NCO = ["", "『防禁言 80%』", "『防禁言 60%』", "『防禁言 40%』", "『防禁言 20%』"];
            const Mpnc = ["", "100 积分", "1000 积分", "9999 积分", "9-6 积分", "9-14 积分"];
            const mingpai = Tq > 0 ? `头衔减免【${Mpnc[Tq]}】减 ${TqJ[Tq] * qqs.length} ${unit}` : "";
            for (const e of QQuser) {
                if (qqs.includes(e)) {
                    yield this.setGroupBan(group_id, user_id, 3 * 60);
                    return yield reply(`${rep}不准@管理！！！！`);
                }
            }
            const total = pluginData[group_id].userData[user_id].total;
            if (total < ((100 - TqJ[Tq]) * qqs.length)) {
                return yield reply(`${rep}${unit}不够！剩余：${total} ${unit}`);
            }
            let msg = "";
            // 循环变量被艾特的 qq 列表
            for (const qq of qqs.slice(0)) {
                // 检测是否有足够的权限禁言，权限不够则跳过。
                if (!(yield canBan.call(this, group_id, qq)))
                    continue;
                // 定义一个逻辑变量，用于判断当前处理的 qq 是否是触发人
                const isSender = qq === user_id;
                checkData(group_id, qq);
                const F20 = pluginData[group_id].userData[qq].Prevent_silence.defend20;
                const F40 = pluginData[group_id].userData[qq].Prevent_silence.defend40;
                const F60 = pluginData[group_id].userData[qq].Prevent_silence.defend60;
                const F80 = pluginData[group_id].userData[qq].Prevent_silence.defend80;
                const FFZ = F80 > 0 ? 1 : F60 > 0 ? 2 : F40 > 0 ? 3 : F20 > 0 ? 4 : 0;
                switch (FFZ) {
                    case 1:
                        pluginData[group_id].userData[qq].Prevent_silence.defend80 -= 1;
                        break;
                    case 2:
                        pluginData[group_id].userData[qq].Prevent_silence.defend60 -= 1;
                        break;
                    case 3:
                        pluginData[group_id].userData[qq].Prevent_silence.defend40 -= 1;
                        break;
                    case 4:
                        pluginData[group_id].userData[qq].Prevent_silence.defend20 -= 1;
                        break;
                    default:
                        break;
                }
                // 执行禁言
                if (Math.random() < JYK[FFZ]) {
                    yield this.setGroupBan(group_id, qq, 10 * 60);
                    msg += `禁言:${oicq_1.cqcode.at(qq)}(十分钟)\n`;
                    if (FFZ > 0) {
                        yield reply(`${oicq_1.cqcode.at(qq)}已为您使用${NCO[FFZ]} 防御失败！`);
                    }
                } else {
                    if (FFZ > 0) {
                        yield reply(`${oicq_1.cqcode.at(qq)}已为您使用${NCO[FFZ]} 防御成功！`);
                    }
                }
            }
            if (msg) {
                // 发送待发消息
                yield reply(`${oicq_1.cqcode.at(user_id)}使用十分钟禁言卡\n` + msg);
            }
            else {
                // 如果消息为空，说明机器人不能禁言任何人
                // 可能机器人不是管理员，此时打印日志到控制台
                console.log(`自爆：机器人并非群 ${group_id} 的管理员，无法禁言`);
            }

            pluginData[group_id].userData[user_id].total -= ((100 - TqJ[Tq]) * qqs.length);
            save.call(this, pluginData);
            return yield reply(`${rep}禁言成功，${mingpai},剩余：${total - ((100 - TqJ[Tq]) * qqs.length)} ${unit}`);
        } else if (message.includes('给积分')) {
            const matches = message.match(AT_REG_EXP);
            if (!matches)
                return;
            const qqs = Array.from(new Set([...matches.map(getQQFromAt)]));
            if (!(yield canBan.call(this, group_id, qqs[0])))
                return yield reply(`机器人并非群 ${group_id} 的管理员`);
            if (qqs[0] == user_id)
                return yield reply(`${rep}无法给自己积分！`);

            if (qqs.length < 1 || qqs.length > 1)
                return;

            const title = message.replace('给积分', "");
            const title1 = title.replace(AT_REG_EXP, "")
            const title2 = title1.replace('-', "")
            const title3 = title2.replace(' ', "")
            const title4 = title3.match(/([0-9]\d*\.?\d*)|(0\.\d*[0-9])/g);
            if (title2.includes('.'))
                return;
            if (!title4)
                return;
            if (title2 === '')
                return;
            if (title4.length < 1)
                return;
            checkData(group_id, user_id);
            const total = pluginData[group_id].userData[user_id].total;
            if (total < title4[0]) {
                return yield reply(`${rep}${unit}不够！剩余：${total} ${unit}`);
            }
            var num1 = parseInt(title4[0]);
            pluginData[group_id].userData[user_id].total -= num1;
            save.call(this, pluginData);
            checkData(group_id, qqs[0]);
            const total1 = pluginData[group_id].userData[qqs[0]].total;
            pluginData[group_id].userData[qqs[0]].total += num1;
            save.call(this, pluginData);
            yield reply(`${rep}剩余：${total - num1} ${unit}`)
            return yield reply(`${oicq_1.cqcode.at(qqs[0])} 恭喜 ${oicq_1.cqcode.at(user_id)}为你转了${num1} ${unit}`);
        } else if (message === ((_bb = setting_json_1.default === null || setting_json_1.default === void 0 ? void 0 : setting_json_1.default.store) === null || _bb === void 0 ? void 0 : _j.Kk06)) {
            checkData(group_id, user_id);
            var Tq = pluginData[group_id].userData[user_id].Title;
            if (Tq === 0)
                return yield reply(`${rep}您没有头衔可以卖！！`);
            const TqJ = [0, 50, 500, 4999, 499999, 49999999999999];
            const Mpnc = ["", "100 积分", "1000 积分", "9999 积分", "9-6 积分", "9-14 积分"];
            const total = pluginData[group_id].userData[user_id].total;
            pluginData[group_id].userData[user_id].total += TqJ[Tq];
            pluginData[group_id].userData[user_id].Title = 0;
            save.call(this, pluginData);
            const { retcode } = yield this.setGroupSpecialTitle(group_id, user_id, '', true);
            return yield reply(`${rep}您成功变卖【${Mpnc[Tq]}】头衔，获得${TqJ[Tq]} ${unit},剩余 ${total + TqJ[Tq]} ${unit}`);
        } else if (message.includes('#管积分')) {
            const matches = message.match(AT_REG_EXP);
            if (!matches)
                return;
            const qqs = Array.from(new Set([...matches.map(getQQFromAt)]));
            if (user_id != "980334400")
                return yield reply(`非管理无法操作！！`);
            if (!(yield canBan.call(this, group_id, qqs[0])))
                return yield reply(`机器人并非群 ${group_id} 的管理员`);
            if (qqs.length < 1 || qqs.length > 1)
                return;

            const title = message.replace('#管积分', "");
            const title1 = title.replace(AT_REG_EXP, "")
            const title2 = title1.replace(' ', "")
            const title3 = title2.match(/([0-9]\d*\.?\d*)|(0\.\d*[0-9])/g);
            if (title2.includes('.'))
                return;
            if (!title3)//^(\-|\+)?\d+(\.\d+)?$)
                return;
            if (title2 === '')
                return;
            if (title3.length < 1)
                return;
            var num1 = parseInt(title3[0]);
            checkData(group_id, qqs[0]);
            const total1 = pluginData[group_id].userData[qqs[0]].total;
            if (title2.indexOf('-') != -1) {
                pluginData[group_id].userData[qqs[0]].total -= num1;
            } else {
                pluginData[group_id].userData[qqs[0]].total += num1;
            }
            const ss = title2.indexOf('-') != -1 ? `减少 ${num1}` : `增加 ${num1}`;
            save.call(this, pluginData);
            return yield reply(`${oicq_1.cqcode.at(qqs[0])} \n ${oicq_1.cqcode.at(user_id)}设置${ss} ${unit}`);
        } else if (message.includes('幸运抽奖')) {
            //return yield reply(yield lottery.call(this, group_id, user_id));
        } else if (message.includes('卖道具')) {
            const matches = message.replace('卖道具', "");
            if (matches.indexOf("赞我") != -1) {
                const matches1 = matches.replace('赞我', "");
                const Qianq = isIntNum(matches1) == true ? parseInt(matches1) : 1;

                checkData(group_id, user_id);
                const Like = pluginData[group_id].userData[user_id].Prevent_silence.Like;
                if (Like < Qianq) {
                    return yield reply(`${rep}你拥有具卡不足！`);
                }
                pluginData[group_id].userData[user_id].Prevent_silence.Like -= 1 * Qianq;
                pluginData[group_id].userData[user_id].total += 2 * Qianq;
                save.call(this, pluginData);
                return yield reply(`${rep}售卖成功，您获得${2 * Qianq}积分`)
            } else if (matches.indexOf("防禁20") != -1) {
                const matches1 = matches.replace('防禁20', "");
                const Qianq = isIntNum(matches1) == true ? parseInt(matches1) : 1;
                checkData(group_id, user_id);
                const defend20 = pluginData[group_id].userData[user_id].Prevent_silence.defend20;
                if (defend20 < Qianq) {
                    return yield reply(`${rep}你拥有具卡不足！`);
                }
                pluginData[group_id].userData[user_id].Prevent_silence.defend20 -= 1 * Qianq;
                pluginData[group_id].userData[user_id].total += 15 * Qianq;
                save.call(this, pluginData);
                return yield reply(`${rep}售卖成功，您获得${15 * Qianq}积分`)
            } else if (matches.indexOf("防禁40") != -1) {
                const matches1 = matches.replace('防禁40', "");
                const Qianq = isIntNum(matches1) == true ? parseInt(matches1) : 1;
                checkData(group_id, user_id);
                const defend40 = pluginData[group_id].userData[user_id].Prevent_silence.defend40;
                if (defend40 < Qianq) {
                    return yield reply(`${rep}你拥有具卡不足！`);
                }
                pluginData[group_id].userData[user_id].Prevent_silence.defend40 -= 1 * Qianq;
                pluginData[group_id].userData[user_id].total += 25 * Qianq;
                save.call(this, pluginData);
                return yield reply(`${rep}售卖成功，您获得${25 * Qianq}积分`)
            } else if (matches.indexOf("防禁60") != -1) {
                const matches1 = matches.replace('防禁60', "");
                const Qianq = isIntNum(matches1) == true ? parseInt(matches1) : 1;
                checkData(group_id, user_id);
                const defend60 = pluginData[group_id].userData[user_id].Prevent_silence.defend60;
                if (defend60 < Qianq) {
                    return yield reply(`${rep}你拥有具卡不足！！`);
                }
                pluginData[group_id].userData[user_id].Prevent_silence.defend60 -= 1 * Qianq;
                pluginData[group_id].userData[user_id].total += 40 * Qianq;
                save.call(this, pluginData);
                return yield reply(`${rep}售卖成功，您获得${40 * Qianq}积分`)
            } else if (matches.indexOf("防禁80") != -1) {
                const matches1 = matches.replace('防禁80', "");
                const Qianq = isIntNum(matches1) == true ? parseInt(matches1) : 1;
                checkData(group_id, user_id);
                const defend80 = pluginData[group_id].userData[user_id].Prevent_silence.defend80;
                if (defend80 < Qianq) {
                    return yield reply(`${rep}你拥有具卡不足！！`);
                }
                pluginData[group_id].userData[user_id].Prevent_silence.defend80 -= 1 * Qianq;
                pluginData[group_id].userData[user_id].total += 60 * Qianq;
                save.call(this, pluginData);
                return yield reply(`${rep}售卖成功，您获得${60 * Qianq}积分`)
            }


        }
    });
}



function pokelistener(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { sub_type, group_id, operator_id, target_id, user_id } = data;
        const unit = "积分"
        if (sub_type === "poke") {
            // if (user_id != "2638277701")//改自己的QQ机器人
            //     return;
            yield this.sendGroupMsg(group_id, yield lottery.call(this, group_id, operator_id));
        }
        //yield this.sendGroupMsg(group_id,`${oicq_1.cqcode.at(operator_id)}\n 戳我没用请戳----->${oicq_1.cqcode.at(QQ)}`);
    });
};
function adminListener(admins) {
    botAdmins = admins;
}
const enable = (bot) => {
    pluginData = load.call(bot, {});
    bot.on("message", listener);
    bot.on("kivibot.admin", adminListener);
    bot.on("notice.group.poke", pokelistener);
};
exports.enable = enable;
const disable = (bot) => {
    bot.off("message", listener);
    bot.off("kivibot.admin", adminListener);
    bot.off("notice.group.poke", pokelistener);
};
exports.disable = disable;
