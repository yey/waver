//mark:type of individual, MARK[i] === sum of possibilities
var MARK = [2,2,2,2,2,2,2,2];
var SUM = 1000;
var bornRate = 0.9;
var deathRate = 0.2;
var geLimit = 100;

function judgeIndo(indo){
	return arrSum(indo);	
}

//compute constants
var group = [];
var good = [];


function start(){
	init();
	nextGeneration(0);
}

function init(){
	for(var i = 0;i<SUM;i++){
		group.push(built());
	}
}

function built(){
	var ind = [];
	for(var i = 0;i<MARK.length;i++){
		var ran = Math.round(MARK[i]*Math.random() - 0.5);
		ind.push(ran);
	}
	return ind;
}

function calculateGood(){
	for(var i = 0;i<group.length;i++){
		good.push(judgeIndo(group[i]));
	}
}

function getParents(){
	return [group[0],group[1]];
}

function makeLove(parents){
	
}

function nextGeneration(times){
	calculateGood();
	//todo statistic this ge
	
	if(times < geLimit){
		var newGroup = [];
		for(var i = 0;i<group.length;i++){
			newGroup.push(makeLove(getParents()));
		}
		group = newGroup;

		nextGeneration(++times);
	}
}

function arrSum(list){
	var sum = 0;
	for(var i = 0;i<list.length;i++){
		sum += list[i];
	}
	return sum;
}

//------------------------
start();
