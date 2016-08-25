#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

/**
 * 数据库文件
 */
var dbfile = 'raffle.json';

/**
 * 参会总人数
 */
var totalBoys = 600;

/**
 * 产生一个幸运者。
 * 已经中过奖的人再次中奖的概率等于之前中奖总人数的倒数
 * 随着中奖人数的越来越多，倒数的值将越来越小。注意数据
 * 发生的变化：
 * 中奖前：
 *     [ ..., 16, ... ]
 * 中奖后：
 *     [ ..., {no: 16, times: 1}, ...]
 *     
 * @param  {Array} arr 所有参会者序号构成的数组
 * @return {Number}     幸运者的序号
 */
function newLuckyBody(arr) {
	var luckyNumber, boy;
	// 之前中过奖的总人数
	var luckyBoysCount = getPreviousLuckyBoysCount(arr);
	// 再度中奖概率
	var doubleLuckyRate = 1 / luckyBoysCount;

	while(true) {
		luckyNumber = nextLuckyNumber();
		boy = arr[luckyNumber];
		// 这个 boy 还没中过奖
		if(typeof boy === "number") {
			arr[luckyNumber] = {no: boy, times: 1};
			break;
		} else if(typeof boy === "object") {
			// 说明先前这个 boy 中过奖了
			if(Math.random() < doubleLuckyRate) {
				arr[luckyNumber].times++;
				break;
			}
		}
	}
	return boy;
}

function loadDatabase() {
	var data;
	try {
		data = fs.readFileSync(path.join(__dirname, dbfile), 'utf-8');
		return JSON.parse(data.toString());
	} catch(e) {
		if(e.code === "ENOENT") {
			console.error("找不到 " + dbfile);
		} else {
			console.error("解析数据库文件失败");
		}
		return [];
	}
}

function syncDatabase(arr) {
	fs.writeFileSync(path.join(__dirname, dbfile), JSON.stringify(arr));
}


/**
 * 计算已经中过奖的总人数，如果一个人中了多次奖，也只记为 1 人
 * @param  {Array} arr 所有参会者序号构成的数组
 * @return {Number}     总人数
 */
function getPreviousLuckyBoysCount(arr) {
	var sum = 0;
	arr.forEach(function(boy){
		if(typeof boy === "object") {
			sum++;
		}
	});
	return sum;
}
/**
 * 产生一个基于 0 幸运数字
 * @return {Number} 幸运数字
 */
function nextLuckyNumber() {
	var number = Math.round(Math.random() * totalBoys);
	if(number === 0) {
		number = 1;
	}
	return number;
}


function main() {
	var count = parseInt(process.argv[2]);
	var arr = loadDatabase(), boy;
	if(arr.length === 0) { return; }
	count = count || 1;
	while(count-- > 0) {
		boy = newLuckyBody(arr);
		if(typeof boy === "object") {
			console.log(boy.no + " => 第 " + boy.times + " 次中奖！");
		} else {
			console.log(boy);
		}
	}
	syncDatabase(arr);
}

if(require.main === module) {
	main();
}
