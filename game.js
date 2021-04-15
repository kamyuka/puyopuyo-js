/*
 * Puyo Puyo 
 */

var DOT_SIZE = 5;
var BLOCK_SIZE = 8;
var STAGE_HEIGHT = 15;
var STAGE_WIDTH = 8;
var WALL_WIDTH = 4;
var FIELD_HEIGHT = BLOCK_SIZE * STAGE_HEIGHT;
var FIELD_WIDTH = BLOCK_SIZE * (STAGE_WIDTH + WALL_WIDTH);

var BLACK = "#000";
var RED = "#f00";
var GREEN = "#0f0";
var BLUE = "#00f";
var YELLOW = "#ff0";
var WHITE = "#fff";
var STAGE_COLOR = "#eee"
var WALL_COLOR = "#6cf"

var field = new Array(FIELD_HEIGHT)
for(let i=0; i<FIELD_HEIGHT; i++){
    field[i] = new Array(FIELD_WIDTH);
    for(let j=0; j<FIELD_WIDTH; j++){
        field[i][j] = 0;
    }
}

var stage_data = new Array(STAGE_HEIGHT)
var copy_stage_data = new Array(STAGE_HEIGHT)
for(let i=0; i<STAGE_HEIGHT; i++){
    stage_data[i] = new Array(STAGE_WIDTH);
    copy_stage_data[i] = new Array(STAGE_WIDTH);
    for(let j=0; j<STAGE_WIDTH; j++){
        stage_data[i][j] = 0;
        copy_stage_data[i][j] = 0;
    }
}

var block_data = [
    [
        [7,7,7,7,7,7,7,7],  //空
        [7,7,7,7,7,7,7,7],
        [7,7,7,7,7,7,7,7],
        [7,7,7,7,7,7,7,7],
        [7,7,7,7,7,7,7,7],
        [7,7,7,7,7,7,7,7],
        [7,7,7,7,7,7,7,7],
        [7,7,7,7,7,7,7,7]
    ],
    [
        [7,7,0,0,0,0,7,7],  //赤ぷよ
        [7,0,1,1,1,1,0,7],
        [0,1,0,1,1,0,1,0],
        [0,1,0,1,1,0,1,0],
        [0,1,0,1,1,0,1,0],
        [0,1,1,1,1,1,1,0],
        [7,0,1,1,1,1,0,7],
        [7,7,0,0,0,0,7,7]
    ],
    [
        [7,7,0,0,0,0,7,7],  //緑ぷよ
        [7,0,2,2,2,2,0,7],
        [0,2,0,2,2,0,2,0],
        [0,2,0,2,2,0,2,0],
        [0,2,0,2,2,0,2,0],
        [0,2,2,2,2,2,2,0],
        [7,0,2,2,2,2,0,7],
        [7,7,0,0,0,0,7,7]
    ],
    [
        [7,7,0,0,0,0,7,7],  //青ぷよ
        [7,0,3,3,3,3,0,7],
        [0,3,0,3,3,0,3,0],
        [0,3,0,3,3,0,3,0],
        [0,3,0,3,3,0,3,0],
        [0,3,3,3,3,3,3,0],
        [7,0,3,3,3,3,0,7],
        [7,7,0,0,0,0,7,7]
    ],
    [
        [7,7,0,0,0,0,7,7],  //黄ぷよ
        [7,0,4,4,4,4,0,7],
        [0,4,0,4,4,0,4,0],
        [0,4,0,4,4,0,4,0],
        [0,4,0,4,4,0,4,0],
        [0,4,4,4,4,4,4,0],
        [7,0,4,4,4,4,0,7],
        [7,7,0,0,0,0,7,7]
    ],
    [
        [0,0,0,0,0,0,0,0],  //壁
        [8,8,0,8,8,8,8,8],
        [8,8,0,8,8,8,8,8],
        [8,8,0,8,8,8,8,8],
        [0,0,0,0,0,0,0,0],
        [8,8,8,8,8,8,0,8],
        [8,8,8,8,8,8,0,8],
        [8,8,8,8,8,8,0,8]
    ]
]

var mode = 1;   // MODE_GAME/MODE_START/MODE_GAME_OVER
var MODE_GAME = 0;
var MODE_START = 1;
var MODE_GAME_OVER = 2;

var timer;
var canvas;
var ctx;
var connect_num;    //ブロックの繋がっている数
var block1_x, block1_y, block2_x, block2_y;
var block2_position_x , block2_position_y;
var block2_position_id;

var x_move = 0; //横方向の移動
var y_move = 0; //縦方向の移動
var rotate = 0; //回転
var enter = 0;  //エンターキー入力
var esc = 0;    //escキー入力
var up = 0;     //上カーソル入力
var down = 0;   //下カーソル入力
var FPS = 30;
var time_count = 0; //ゲーム時間のカウント
var move_count = 0; //誤入力防止遅延のカウント
var fallen = 0; //落下継続判定
var next_data = [1,1,1,1];  //nextに表示されるブロックの情報
var fever_mode = 0; // 0:ENDRSS / 1:FEVER
var fever_level = 0;    //feverモードのレベル
var chain = 0;  //れんさ数カウント
var score = 0;  //れんさ数表示
var success = 0;    //feverモードの成功判定
var select_light = 1;   //選択カーソルの点滅


function init(){
    canvas = document.getElementById('canvas');
    canvas.width = DOT_SIZE * FIELD_WIDTH;
    canvas.height = DOT_SIZE * FIELD_HEIGHT;
    ctx = canvas.getContext('2d');
}


//フィールドデータにブロックを描画
function draw_block(pos_x, pos_y, block_num){
    for(let i=0; i<BLOCK_SIZE; i++){
        for(let j=0; j<BLOCK_SIZE; j++){
            field[pos_x+i][pos_y+j] = block_data[block_num][i][j];
        }
    }
}


//フィールドデータにステージを描画
function draw_stgae(){
    for(let i=2; i<STAGE_HEIGHT-1; i++){
        for(let j=1; j<STAGE_WIDTH-1; j++){
            draw_block(BLOCK_SIZE*i, BLOCK_SIZE*j, stage_data[i][j]);
        }
    }
}


//フィールドデータにnextを描画
function draw_next(){
    let next_y = BLOCK_SIZE * 2;
    let next_x = BLOCK_SIZE * STAGE_WIDTH;
    
    draw_block(next_y+BLOCK_SIZE*1, next_x+BLOCK_SIZE*0, next_data[0]);
    draw_block(next_y+BLOCK_SIZE*0, next_x+BLOCK_SIZE*0, next_data[1]);
    draw_block(next_y+BLOCK_SIZE*1, next_x+BLOCK_SIZE*2, next_data[2]);
    draw_block(next_y+BLOCK_SIZE*0, next_x+BLOCK_SIZE*2, next_data[3]);
}


//フィールドデータに壁を描画
function draw_wall(){
    for(let i=0; i<(FIELD_HEIGHT/BLOCK_SIZE); i++){
        for(let j=0; j<(FIELD_WIDTH/BLOCK_SIZE); j++){
            draw_block(BLOCK_SIZE*(i), BLOCK_SIZE*(j), 5);
        }
    }
}


//フィールドデータの描画
function draw(){
	for(i=0; i<FIELD_HEIGHT; i++){
		for(j=0; j<FIELD_WIDTH; j++){
            if(field[i][j] == 0){
                ctx.fillStyle = BLACK;
            } else if(field[i][j] == 1){
                ctx.fillStyle = RED;
            } else if(field[i][j] == 2){
                ctx.fillStyle = GREEN;
            } else if(field[i][j] == 3){
                ctx.fillStyle = BLUE;
            } else if(field[i][j] == 4){
                ctx.fillStyle = YELLOW;
            } else if(field[i][j] == 7){
                ctx.fillStyle = STAGE_COLOR;
            } else if(field[i][j] == 8){
                ctx.fillStyle = WALL_COLOR;
            } else if(field[i][j] == 9){
                ctx.fillStyle = WHITE;    
            } else {
                ctx.fillStyle = WHITE;
            }
            ctx.fillRect(j*DOT_SIZE, i*DOT_SIZE, DOT_SIZE, DOT_SIZE);
        }
	}
}


//走査用コピーステージの作成
function copy_stage(){
    for(let i=0; i<STAGE_HEIGHT; i++){

        for(let j=0; j<STAGE_WIDTH; j++){
            copy_stage_data[i][j] = stage_data[i][j];
        }
    }
}


//ブロックの繋がっている数をカウント
function connect_count(x, y, color){
    connect_num++;
    copy_stage_data[x][y] = 0;
    if(copy_stage_data[x+1][y] == color) connect_count(x+1, y, color);
    if(copy_stage_data[x][y+1] == color) connect_count(x, y+1, color);
    if(copy_stage_data[x-1][y] == color) connect_count(x-1, y, color);
    if(copy_stage_data[x][y-1] == color) connect_count(x, y-1, color);
}


//繋がっているブロックを消す
function vanish_block(x, y, color){
    stage_data[x][y] = 0;
    if(stage_data[x+1][y] == color) vanish_block(x+1, y, color);
    if(stage_data[x][y+1] == color) vanish_block(x, y+1, color);
    if(stage_data[x-1][y] == color) vanish_block(x-1, y, color);
    if(stage_data[x][y-1] == color) vanish_block(x, y-1, color);
}


//ブロックの消去判定
function vanish_judge(){
    let block_color;
    let vanish = 0;

    copy_stage();
    for(let i=0; i<STAGE_HEIGHT; i++){
        for(let j=0; j<STAGE_WIDTH; j++){
            block_color = copy_stage_data[i][j];
            if(block_color != 0 && block_color != 5){
                connect_num = 0;
                connect_count(i, j, block_color);
                if(connect_num >= 4){
                    vanish_block(i, j, block_color);
                    vanish = 1;
                }
            }
        }
    }
    return vanish;
}


//浮いているブロックを1段落とす
function fallen_block(){
    let fallen = 0;
    for(let i=1; i<STAGE_WIDTH-1; i++){
        for(let j=STAGE_HEIGHT-1; j>0; j--){
            if(stage_data[j][i] == 0 && stage_data[j-1][i] != 0){
                for(let k=j; k>0; k--){
                    stage_data[k][i] = stage_data[k-1][i];
                }
                fallen = 1;
                break;
            }
        }
    }
    return fallen;
}


//ブロックの座標を初期位置へ&色を変更
function set_block(){
    block1_x = 3;
    block1_y = 2;
    block2_position_x = 0;
    block2_position_y = -1;
    block2_position_id = 3;
    block2_x = block1_x + block2_position_x;
    block2_y = block1_y + block2_position_y;

    stage_data[block1_y][block1_x] = next_data[0];
    stage_data[block2_y][block2_x] = next_data[1];

    next_data[0] = next_data[2];
    next_data[1] = next_data[3];

    next_data[2] = Math.floor(Math.random() * 4) + 1;
    next_data[3] = Math.floor(Math.random() * 4) + 1;
}


//ブロックの移動,　回転
function move_block(x_move, y_move, rotate){
    let tmp1, tmp2;

    tmp1 = stage_data[block1_y][block1_x]; 
    tmp2 = stage_data[block2_y][block2_x];  

    stage_data[block1_y][block1_x] = 0;   
    stage_data[block2_y][block2_x] = 0; 

    //回転
    if(rotate != 0){
        block2_position_id += rotate;
        if(block2_position_id == 4) block2_position_id = 0;
        if(block2_position_id == -1) block2_position_id = 3;

        if(block2_position_id == 0 && stage_data[block1_y][block1_x+1] == 0){
            block2_position_x = 1, block2_position_y = 0;
        }
        if(block2_position_id == 1 && stage_data[block1_y+1][block1_x] == 0){
            block2_position_x = 0, block2_position_y = 1;
        }
        if(block2_position_id == 2 && stage_data[block1_y][block1_x-1] == 0){
            block2_position_x = -1, block2_position_y = 0;
        }
        if(block2_position_id == 3 && stage_data[block1_y-1][block1_x] == 0){
            block2_position_x = 0, block2_position_y = -1;
        }
        block2_x = block1_x + block2_position_x;
        block2_y = block1_y + block2_position_y;
    }

    //移動
    if(stage_data[block1_y+y_move][block1_x+x_move] == 0 && stage_data[block2_y+y_move][block2_x+x_move] == 0){
        block1_x += x_move;
        block1_y += y_move;
        block2_x = block1_x + block2_position_x;
        block2_y = block1_y + block2_position_y;
    }

    //地面についたか判定
    if(stage_data[block1_y+1][block1_x] != 0 || stage_data[block2_y+1][block2_x]){  //ブロックが地面についたか判定
        fallen = 1;
        time_count = 0;
    }
    
    stage_data[block1_y][block1_x] = tmp1;
    stage_data[block2_y][block2_x] = tmp2;

    x_move = 0;
    y_move = 0;
    rotate = 0;
}


//画面にスコアを表示
function show_score(score){
    let tmp = BLOCK_SIZE * DOT_SIZE;
    let x = tmp*7.5;
    let y = tmp*10 + 20;
    let width = tmp*4;
    let height = tmp*4 - 20;

    ctx.fillStyle = STAGE_COLOR;
    ctx.fillRect(x, y, width, height);

    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.fillStyle = BLACK;
    ctx.font = "80px fantasy";
    ctx.fillText(score, x+width/2, y);
    ctx.font = "60px fantasy";
    ctx.fillText("Chain", x+width/2, y+80);
}


//画面に「SUCESS」か「FAILURE」を表示
function show_success(success){
    let tmp = BLOCK_SIZE * DOT_SIZE;
    let x = tmp;
    let y = 10;
    let width = (FIELD_WIDTH-BLOCK_SIZE*2)*DOT_SIZE;
    let height = 60;

    ctx.fillStyle = STAGE_COLOR;
    ctx.fillRect(x, y, width, height);

    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.fillStyle = BLACK;
    ctx.font = "60px fantasy";

    if(success == 1){
        ctx.fillText("SUCCESS", x+width/2, y);
    } else {
        ctx.fillText("FAILURE", x+width/2, y);
    }
}


//ゲームオーバー処理
function game_over(){
    let tmp = BLOCK_SIZE * DOT_SIZE;
    let x = tmp;
    let y = 10;
    let width = (FIELD_WIDTH-BLOCK_SIZE*2)*DOT_SIZE;
    let height = 60;


    ctx.fillStyle = STAGE_COLOR;
    ctx.fillRect(x, y, width, height);

    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.fillStyle = BLACK;
    ctx.font = "60px fantasy";
    ctx.fillText("GAME OVER", x+width/2, y);

    if(enter == 1){
        enter = 0;
        mode = MODE_START;
    }
}


//スタートメニュー処理
function start_menu(){
    let tmp = BLOCK_SIZE * DOT_SIZE;
    let x1 = tmp;
    let y1 = tmp*2;
    let width1 = (FIELD_WIDTH-BLOCK_SIZE*2)*DOT_SIZE;
    let height1 = tmp*2;
    let x2 = tmp;
    let y2 = tmp*6;
    let width2 = (FIELD_WIDTH-BLOCK_SIZE*2)*DOT_SIZE;
    let height2 = tmp*7;

    draw_wall();
    draw();
    ctx.fillStyle = STAGE_COLOR;
    ctx.fillRect(x1-5, y1-5, width1+10, height1+10);
    ctx.fillRect(x2-5, y2-5, width2+10, height2+10);

    ctx.fillStyle = BLACK;
    ctx.strokeRect(x1-5, y1-5, width1+10, height1+10);
    ctx.strokeRect(x1, y1, width1, height1);
    ctx.strokeRect(x2-5, y2-5, width2+10, height2+10);
    ctx.strokeRect(x2, y2, width2, height2);
    
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "80px fantasy";

    ctx.fillText("Puyo Puyo", x1+width1/2, y1);
    ctx.fillText("ENDRESS", x2+width2/2, y2+tmp);
    ctx.fillText("FEVER", x2+width2/2, y2+tmp*4);
   
    time_count++;
    if(time_count > 8){
        time_count = 0;
        select_light *= -1;
    }

    if(up == 1){
        fever_mode = 0;
    } else if(down == 1){
        fever_mode = 1;
    }

    if(select_light == 1){
        if(fever_mode == 0){
            ctx.strokeRect(x2+30, y2+tmp, width2-60, tmp*2);
        } else {
            ctx.strokeRect(x2+30, y2+tmp*4, width2-60, tmp*2);
        }
    }

    if(enter == 1){
        if(fever_mode == 0){
            endress_game();
        } else if(fever_mode == 1){
            fever_game(0);
        }
        enter = 0;
        mode = MODE_GAME;
        new_game();
    }

}


//操作
window.onkeydown = keydownfunc;
window.onkeyup = keyupfunc;

function keydownfunc(event) {
    var key_code = event.keyCode;
    if(key_code == 32) rotate = -1, event.preventDefault();;
    if(key_code == 38) rotate = +1, up = 1, event.preventDefault();
    if(key_code == 37) x_move = -1, event.preventDefault();
    if(key_code == 39) x_move = +1, event.preventDefault();
    if(key_code == 40) y_move = +1, down = 1, event.preventDefault();
}

function keyupfunc(event) {
    var key_code = event.keyCode;
    if(key_code == 32) rotate = 0;
    if(key_code == 38) rotate = 0, up = 0;
    if(key_code == 37) x_move = 0;
    if(key_code == 39) x_move = 0;
    if(key_code == 40) y_move = 0, down = 0;
    if(key_code == 13) enter = 1;
    if(key_code == 27) esc = 1;
    move_count = 0;
}


//メインゲーム
function mainLoop(){
    timer = setTimeout(mainLoop, 1000/FPS);

    if(mode == MODE_GAME){

        if(fallen == 1){    //浮いているブロックがないか判定
            if(time_count == Math.floor(FPS/5)){ //0.2秒ごとに
                fallen = fallen_block(); //浮いているブロックを1段落とす
                if(fallen == 0){    //浮いているブロックがないか判定
                    if(vanish_judge() == 1){    //4つ以上繋がっているブロックを破壊
                        chain++;
                        score = chain;
                        fallen = 1;
                    } else {
                        if(stage_data[2][3] != 0){
                            mode = MODE_GAME_OVER;
                        }
                        if(fever_mode == 1 && chain != 0){
                            if(chain >= fever_level+5){
                                success = 1;
                            } else {
                                success = -1;
                            }
                            fever_level++;
                            if(fever_level >= 9) fever_level = 0;
                            fever_game(fever_level);
                        }
                        set_block();
                        chain = 0;
                    }    
                }
                time_count = 0;
            } 
        } else { 
            if(time_count == Math.floor(FPS)){  //1.0秒ごとに
                move_block(0, 1, 0);
                time_count = 0;
            }
            if(move_count == 0 && (x_move != 0 || y_move != 0 || rotate != 0)){
                    move_block(x_move, y_move, rotate);  //操作ブロックの移動
                    move_count = 3; //誤操作防止用の遅延
            }
        }

        if(move_count > 0){
            move_count--;
        }

        time_count++;

        draw_stgae();
        draw_next();
        draw();
        show_score(score);
        if(success != 0) show_success(success);

    } else if(mode == MODE_START){
        start_menu();

    } else if(mode == MODE_GAME_OVER){
        game_over();
    }

    if(esc == 1){
        esc = 0;
        mode = MODE_START;
    }
}


//ゲーム開始処理
function  new_game(){
    clearTimeout(timer);
    connect_num = 0;
    rotate = 0;
    enter = 0;
    esc = 0;
    up = 0;
    down = 0;
    FPS = 30;
    time_count = 0;
    move_count = 0;
    fallen = 0;
    fever_level = 0;
    chain = 0;
    score = 0;
    success = 0;

    for(let i=0; i<4; i++){
        next_data[i] = Math.floor(Math.random() * 4) + 1;
    }
    draw_wall();
    set_block();
    mainLoop();
}


//起動処理
window.onload = function(){
	init();
    new_game();
}


//ENDRESSモードのステージデータ
function endress_game(){
    stage_data = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [5,0,0,0,0,0,0,5],
        [5,0,0,0,0,0,0,5],
        [5,0,0,0,0,0,0,5],
        [5,0,0,0,0,0,0,5],
        [5,0,0,0,0,0,0,5],
        [5,0,0,0,0,0,0,5],
        [5,0,0,0,0,0,0,5],
        [5,0,0,0,0,0,0,5],
        [5,0,0,0,0,0,0,5],
        [5,0,0,0,0,0,0,5],
        [5,0,0,0,0,0,0,5],
        [5,0,0,0,0,0,0,5],
        [5,5,5,5,5,5,5,5]
    ]
}


//FEVERモードのステージデータ
function fever_game(fever_level){

    let color_array = [1,2,3,4];

    for(let i=3; i>1; i--){
        let j = Math.floor(Math.random() * 4);
        tmp = color_array[i];
        color_array[i] = color_array[j];
        color_array[j] = tmp;
    }

    R = color_array[0];
    G = color_array[1];
    B = color_array[2];
    Y = color_array[3];

    var fever_data = [
        [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,Y,G,B,0,5],
            [5,0,G,B,R,B,0,5],
            [5,0,Y,G,B,R,0,5],
            [5,0,Y,G,B,R,B,5],
            [5,0,Y,G,B,R,B,5],
            [5,5,5,5,5,5,5,5]
        ],
        [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,B,0,R,0,G,5],
            [5,0,G,Y,R,B,G,5],
            [5,0,G,B,Y,B,G,5],
            [5,R,R,G,Y,R,B,5],
            [5,R,G,R,Y,G,B,5],
            [5,5,5,5,5,5,5,5]
        ],
        [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,G,R,0,0,0,0,5],
            [5,Y,G,G,G,0,0,5],
            [5,R,R,R,Y,R,0,5],
            [5,Y,Y,B,G,R,0,5],
            [5,Y,G,G,B,G,G,5],
            [5,G,B,B,G,R,R,5],
            [5,5,5,5,5,5,5,5]
        ],
        [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,B,0,0,0,5],
            [5,0,0,Y,R,G,0,5],
            [5,0,0,Y,Y,G,0,5],
            [5,0,B,B,R,R,B,5],
            [5,0,B,Y,R,G,G,5],
            [5,0,R,R,G,Y,B,5],
            [5,0,R,G,Y,B,B,5],
            [5,0,G,G,R,Y,Y,5],
            [5,5,5,5,5,5,5,5]
        ],
        [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [5,0,0,0,0,0,0,5],
            [5,B,0,0,0,0,0,5],
            [5,R,0,0,0,0,0,5],
            [5,Y,Y,0,0,0,0,5],
            [5,R,Y,0,0,0,0,5],
            [5,R,R,0,0,0,0,5],
            [5,B,G,0,0,R,0,5],
            [5,B,B,0,0,R,0,5],
            [5,R,G,0,B,B,G,5],
            [5,G,G,B,G,B,G,5],
            [5,R,Y,G,Y,G,R,5],
            [5,R,R,Y,Y,G,R,5],
            [5,5,5,5,5,5,5,5]
        ],
        [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,B,5],
            [5,0,0,0,0,0,B,5],
            [5,B,0,0,0,0,B,5],
            [5,R,0,0,0,B,R,5],
            [5,G,0,0,0,G,R,5],
            [5,R,0,0,0,G,R,5],
            [5,R,G,0,0,G,Y,5],
            [5,R,B,Y,B,R,Y,5],
            [5,G,R,G,Y,B,G,5],
            [5,G,R,G,Y,B,Y,5],
            [5,G,R,G,Y,B,Y,5],
            [5,5,5,5,5,5,5,5]
        ],
        [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,B,0,0,0,0,0,5],
            [5,R,Y,B,R,0,0,5],
            [5,R,Y,R,R,0,0,5],
            [5,Y,B,B,Y,Y,0,5],
            [5,R,Y,B,R,Y,G,5],
            [5,R,G,R,Y,R,G,5],
            [5,B,G,G,Y,R,R,5],
            [5,B,B,R,R,Y,G,5],
            [5,Y,G,R,Y,R,G,5],
            [5,5,5,5,5,5,5,5]
        ],
        [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,0,Y,G,0,0,0,5],
            [5,G,Y,B,B,0,0,5],
            [5,Y,G,G,B,0,0,5],
            [5,Y,R,G,Y,0,0,5],
            [5,G,G,R,Y,R,0,5],
            [5,G,B,R,R,Y,Y,5],
            [5,R,Y,B,G,R,B,5],
            [5,B,Y,G,B,R,R,5],
            [5,Y,G,Y,G,Y,B,5],
            [5,Y,G,Y,Y,B,B,5],
            [5,5,5,5,5,5,5,5]
        ],
        [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [5,0,0,0,0,0,0,5],
            [5,0,0,0,0,0,0,5],
            [5,Y,0,0,0,0,Y,5],
            [5,B,0,0,0,0,B,5],
            [5,Y,B,R,G,Y,B,5],
            [5,Y,R,R,Y,Y,B,5],
            [5,B,B,G,G,B,G,5],
            [5,Y,B,R,G,R,G,5],
            [5,Y,R,G,B,R,G,5],
            [5,B,Y,R,G,B,R,5],
            [5,B,Y,R,G,B,R,5],
            [5,B,Y,R,G,B,G,5],
            [5,5,5,5,5,5,5,5]
        ]
    ];

    for(let i=0; i<STAGE_HEIGHT; i++){
        for(let j=0; j<STAGE_WIDTH; j++){
            stage_data[i][j] = fever_data[fever_level][i][j];
        }
    }
}


