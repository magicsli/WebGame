    var boxWidth = window.innerWidth <1000 ?window.innerWidth * 0.2 :100 ,
        startX,
        startY, 
        my2048,
        timer,
        cols = 4,
        rows = 4,
        spacing = 12,
        squareWidth = boxWidth,
        boardSet = [], 
        valueSet = [],
        squareSet = [], 
        lock = true,
        isChange = false,
        colorMapping = { "0": "#ccc0b3", "2": "#eee4da", "4": "#ede0c8", "8": "#f2b179", "16": "#f59563", "32": "#f67e5f", "64": "#f65e3b", "128": "#edcf72", "256": "#edcc61", "512": "#9c0", "1024": "#33b5e5", "2048": "#09c", "4096": "#5b67ff" },
        directionEnum = { left: { x: -1, y: 0, key: "left" }, right: { x: 1, y: 0, key: "left" }, top: { x: 0, y: -1, key: "top" }, down: { x: 0, y: 1, key: "top" } };

function getRandNum () {
    return Math.random() < 0.5 ? 2 : 4;
}
function randGeneratSquare () {
    for (; ;) {
        var randRow = Math.floor(Math.random() * rows );
        var randCol = Math.floor(Math.random() * cols );
        if (valueSet[randRow][randCol] == 0) {
            var temp = createSquare(getRandNum(), randCol * (squareWidth + spacing) + spacing, randRow * (squareWidth + spacing) + spacing,  randRow, randCol)
            valueSet[temp.row][temp.col] = temp.num;
            squareSet[temp.row][temp.col] = temp;
            my2048.appendChild(temp);
            return true;
        }
    }
}
function initBoard() {
    my2048 = document.getElementById('my2048');
    my2048.style.height = rows * (squareWidth + spacing) + spacing +'px';
    my2048.style.width = cols * (squareWidth + spacing) + spacing + 'px';
}
function createSquare (value, left, top, row, col ) {
    var temp = document.createElement('div');
    temp.style.width = squareWidth + 'px';
    temp.style.height = squareWidth + 'px';
    temp.style.top = top + 'px';
    temp.style.left = left + 'px';
    temp.col = col;
    temp.row = row;
    temp.style.backgroundColor = colorMapping[value];
    temp.style.lineHeight = squareWidth + 'px';
    temp.style.textAlign = 'center';
    temp.style.fontSize = squareWidth * 0.4 + 'px';
    temp.num = value;
    if( value > 0 ){

    temp.innerText = value;
    }
    return temp;
}
function init() {
    initBoard();
    for (var i = 0; i < rows; i++) {
        boardSet[i] = [];
        valueSet[i] = [];
        squareSet[i] = [];
        for (var j = 0; j < cols; j++) {
            valueSet[i][j] = 0;
            squareSet[i][j] = null;
            boardSet[i][j] = createSquare(0, j * (squareWidth + spacing) + spacing, i * (squareWidth + spacing) + spacing, i, j);
            my2048.appendChild(boardSet[i][j]);
       
        }
    }
    randGeneratSquare();
    randGeneratSquare();
    document.addEventListener('touchstart', function (ev) {
        startX = ev.touches[0].pageX;
        startY = ev.touches[0].pageY;
    }, false);
    document.addEventListener('touchend', function (ev) {
        if (!lock) return;
        lock = false;
        var endX, endY;
        endX = ev.changedTouches[0].pageX;
        endY = ev.changedTouches[0].pageY;
        var direction = GetSlideDirection(startX, startY, endX, endY);
        switch (direction) {
            case 0:
                break;
            case 1:
                move(directionEnum.top);
                break;
            case 2:
                move(directionEnum.down);
                break;
            case 3:
                move(directionEnum.left);
                // alert("!");
                break;
            case 4:
                move(directionEnum.right);
                break;
            default: {
                lock = true;
            }
        }

    }, false);
    document.addEventListener('keydown',function (e) {
        if(!lock) return;
        lock = false;
        switch(e.key){
            case "ArrowUp": move(directionEnum.top); break;
            case "ArrowDown": move(directionEnum.down); break;
            case "ArrowLeft": move(directionEnum.left); break;
            case "ArrowRight": move(directionEnum.right); break;
            default: {
                lock = true;
            }
        } 
    } )
} 
function isOver() {
    for (var i = 0; i < squareSet.length; i++) {
        for (var j = 0; j < squareSet[i].length; j++) {  // 遍历元素二维数组
            if (squareSet[i][j] == null) {               // 如果有空地  就返回 false
                return false;
            }
            if (squareSet[i][j + 1] && squareSet[i][j].num == squareSet[i][j + 1].num || squareSet[i + 1] && squareSet[i + 1][j] && squareSet[i][j].num == squareSet[i + 1][j].num) {
                return false;       // 如果这位置的右边和下边可以进行合并   就返回 false
            }
        }
    }
    return true;  // 如果既没有空地,有没有能进行合并的数,  就返回  true
}
function move (direction) {
    if (isOver()) {
        alert ('you lose');
        return;
    }
    // 移动判断
    var newSquareSet =  analysisActions(direction);
    setTimeout (function(){
        refresh(newSquareSet);
        if(isChange) randGeneratSquare();
        lock = true;
        isChange = false;
    }
    ,timer || 300 )
}
function refresh(newSquareSet) {//纠正位图，保证最终一致性
    squareSet = generateNullMap();  // 把原先的元素数组清空
    var newValueMap = generateNullMap();  //再拿一个空的二维数组
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            //新的存在则添加
            if (newSquareSet[i][j]) {  // 如果元素数组中有元素

                if (newSquareSet[i][j].nextSquare) { // 如果这个元素有重叠属性

                    //以这个元素创建一个新的方块, 数值为这个元素的数值的两倍
                    var temp = createSquare(newSquareSet[i][j].num * 2, newSquareSet[i][j].offsetLeft, newSquareSet[i][j].offsetTop, i, j);
                    squareSet[i][j] = temp;  // 将这个方块存在空的元素数组中
                    my2048.append(temp);     // 将这个方块渲染到面板中
                    my2048.removeChild(newSquareSet[i][j].nextSquare); // 删除排好序的新元素数组的重叠元素
                    my2048.removeChild(newSquareSet[i][j]);            // 删除这个位置的新元素数组的元素
                } else {
                    var temp = createSquare(newSquareSet[i][j].num, newSquareSet[i][j].offsetLeft, newSquareSet[i][j].offsetTop, i, j);
                    squareSet[i][j] = temp;
                    my2048.append(temp);
                    my2048.removeChild(newSquareSet[i][j]);
                }
                if (valueSet[i][j] != squareSet[i][j].num) {  // 如果位图这个位置的值不等于元素数组的这个数值
                    isChange = true;                         // 把变化的锁打开
                }
                newValueMap[i][j] = squareSet[i][j].num;  // 给新的位图数组的这个位置赋值
            } else {
                newValueMap[i][j] = 0;  // 如果这个元素没有元素, 给新的位图数组这个位置赋值
            }
        }
    }
    valueSet = newValueMap;  // 重置位图数组
}
function analysisActions(direction) {  // 移动判断

    var newSquareSet = generateNullMap();   // 拿到一个新的空的二维数组 

    if (direction == directionEnum.left) {  // 向左   遍历所有的行, 重新排序,并且将排好序的的方块放在一个新的二维数组中
        console.log("向左");
        for (var i = 0; i < squareSet.length; i++) {   // 遍历 存方块的二维数组的 行
            var temp = [];                             // 创建一个空的数组
            for (var j = 0; j < squareSet[i].length; j++) {  // 遍历存方块的二维数组的 列
                if (squareSet[i][j] != null) {               //  如果这个坐标有元素
                    temp.push(squareSet[i][j]);              //将这个 元素添加上上面创建的空数组中
                }
            }
            temp = getNewLocation(temp);                    // 调用排序函数  ,吧这一列重新进行排序 并赋值给temp
            for (var k = 0; k < newSquareSet[i].length; k++) {  // 遍历这个空的二维数组的列
                if (temp[k]) {                               // 如果temp有东西
                    newSquareSet[i][k] = temp[k];              //就把temp的这个元素赋给 空的二维数组的这个位置
                }
            }
        }
    } else if (direction == directionEnum.right) {//向右   行不变 列遍历的方向从右到左
        console.log("向右");
        for (var i = 0; i < squareSet.length; i++) {
            var temp = [];
            for (var j = squareSet[i].length - 1; j >= 0; j--) {
                if (squareSet[i][j] != null) {
                    temp.push(squareSet[i][j]);
                }
            }
            temp = getNewLocation(temp);
            for (var k = newSquareSet[i].length - 1; k >= 0; k--) {
                if (temp[newSquareSet[i].length - 1 - k]) {
                    newSquareSet[i][k] = temp[newSquareSet[i].length - 1 - k];
                }
            }
        }
    } else if (direction == directionEnum.top) {//向前    先遍历列,  再从从上往下遍历
        console.log("向前");
        for (var j = 0; j < squareSet[0].length; j++) {
            var temp = [];
            for (var i = 0; i < squareSet.length; i++) {
                if (squareSet[i][j] != null) {
                    temp.push(squareSet[i][j]);
                }
            }
            temp = getNewLocation(temp);
            for (var k = 0; k < newSquareSet.length; k++) {
                if (temp[k]) {
                    newSquareSet[k][j] = temp[k];
                }
            }
        }
    } else {//向后    先遍历列,  再从底往上遍历
        console.log("向后");
        for (var j = 0; j < squareSet[0].length; j++) {
            var temp = [];
            for (var i = squareSet.length - 1; i >= 0; i--) {
                if (squareSet[i][j] != null) {
                    temp.push(squareSet[i][j]);
                }
            }
            temp = getNewLocation(temp);
            for (var k = newSquareSet.length - 1; k >= 0; k--) {
                if (temp[newSquareSet.length - 1 - k]) {
                    newSquareSet[k][j] = temp[newSquareSet.length - 1 - k];
                }
            }
        }
    }
    //动画 
    for (var i = 0; i < newSquareSet.length; i++) {   // 遍历上面创建的排完序的二维数组 的行
        for (var j = 0; j < newSquareSet[i].length; j++) {  // 遍历列
            if (newSquareSet[i][j] == null) {               // 如果这个位置啥都没有就跳过
                continue;
            }
            // 如果这个位置有元素,就为这个元素增加动画属性和他的定位位置 (此时还没有渲染在面板中)
            newSquareSet[i][j].style.transition = direction.key + " 0.3s";
            newSquareSet[i][j].style.left = (j + 1) * spacing + j * squareWidth + "px";
            newSquareSet[i][j].style.top = (i + 1) * spacing + i * squareWidth + "px";
            if (newSquareSet[i][j].nextSquare) {  // 如果这个位置有重叠的方块  就为这个重叠的方块也设置动画属性
                newSquareSet[i][j].nextSquare.style.transition = direction.key + " 0.3s";
                newSquareSet[i][j].nextSquare.style.left = (j + 1) * spacing + j * squareWidth + "px";
                newSquareSet[i][j].nextSquare.style.top = (i + 1) * spacing + i * squareWidth + "px";
            }
        }
    }
    return newSquareSet;   // 返回这个新的元素二维数组 (排好序)
}
function getNewLocation (arr) {
    if (arr.length == 0 ){ return [];}
        var temp = [];
        // temp[0] = arr[0];
        temp.push(arr[0]);
    // console.log(arr,temp);

        for ( var i = 1; i <arr.length; i++) {
            if(arr[i].num == temp[temp.length-1].num && (!temp[temp.length-1].nextSquare || temp[temp.length-1].nextSquare == null) ){
                console.log(arr[i].num, temp[temp.length - 1].num);
              
                temp[temp.length - 1].nextSquare = arr[i];
            }else{
                temp.push(arr[i]);
            }
        }
        return temp;
}
function generateNullMap () {    
    var newValueMap = [];
    for(var i = 0; i < rows; i++) {
        newValueMap[i] = []
        for (var j = 0; j < cols; j++){
            newValueMap[i][j] = null;
        }
    }
    return newValueMap;
}
//返回角度
function GetSlideAngle(dx, dy) {
    return Math.atan2(dy, dx) * 180 / Math.PI;
}
//根据起点和终点返回方向 1：向上，2：向下，3：向左，4：向右,0：未滑动
function GetSlideDirection(startX, startY, endX, endY) {
    var dy = startY - endY;
    var dx = endX - startX;
    var result = 0;
    //如果滑动距离太短
    if(Math.abs(dx) < 2 && Math.abs(dy) < 2) {
        return result;
    }
              var angle = GetSlideAngle(dx, dy);
              if(angle >= -45 && angle < 45) {
                  result = 4;
              }else if (angle >= 45 && angle < 135) {
                  result = 1;
              }else if (angle >= -135 && angle < -45) {
                  result = 2;
              }else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
                  result = 3;
              }
              return result;
}
//滑动处理    
window.onload = function () {
    document.querySelector(' .button').addEventListener('touchend', function () {
        location.reload(true)
    }) 
    init();
}
