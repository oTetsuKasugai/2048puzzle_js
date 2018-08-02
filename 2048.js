var current_table;
var current_score = 0;
var is_game_over = false;

window.onload = function(){
  new_game();

  //矢印キー押下時に対応したイベントを起動
  document.body.onkeydown = function(e){
    if(!is_game_over){
      var type = null;
      switch(e.keyCode){
        case 37:
          type = "left";
          break;
        case 38:
          type = "up";
          break;
        case 39:
          type = "right";
          break;
        case 40:
          type = "down";
          break;
        default:
          type = false;
      }

      !type || main(type);
    }
  }
}

var main = function(type){
  var table_buffer = form_table(current_table, type);
  table_buffer = shift_and_merge(table_buffer, type);
  table_buffer = form_table(table_buffer ,type, true);
  current_table = add_new_value(table_buffer);
  is_game_over = detect_game_over(current_table);
  current_score = calc_score(current_table);
  display(current_table, current_score);
}

//表の並べ替え(並べ直し)
var form_table = function(table, type, reform){
  switch (type) {
    case "left":
      return table
    case "up":
      return transpose_table(table);
    case "down":
      if(reform){
        return transpose_table(reverse_table(table));
      }else{
        return reverse_table(transpose_table(table));
      }
    case "right":
      return reverse_table(table);
  }
}

//行と列を入れ替え(4＊4の配列のみ)
var transpose_table = function(table){
  var new_array = [[],[],[],[]]
  table.forEach(function(row){
    row.forEach(function(cell, index){
      new_array[index].push(cell);
    });
  });
  return new_array;
}

//各行の中身の順番を逆転
var reverse_table = function(table){
  return table.map(function(row){
    return row.reverse();
  });
}

//セルを移動＆結合
var shift_and_merge = function(table, type){
  return table.map(function(row){
    //セルの移動先がtarget_index,移動元がdetect_index
    var target_index = 0;
    var detect_index = 1;
    var row_buffer = row;

    while(detect_index < 4){
      if(row_buffer[detect_index] != 0){
        if(row_buffer[target_index] == 0){
          row_buffer[target_index] = row_buffer[detect_index];
          row_buffer[detect_index] = 0;
          detect_index ++;

        }else if(row_buffer[detect_index] == row_buffer[target_index]){
          row_buffer[target_index] *= 2;
          row_buffer[detect_index] = 0;
          target_index ++;
          detect_index ++;

        }else{
          target_index ++;
          if(target_index == detect_index){
            detect_index ++;
          }
        }
      }else{
        detect_index ++;
      }
    }
    return row_buffer;
  });
}

//ランダムに新しいセルを追加
var add_new_value = function(table){
  var table_buffer = table

  empty_cells = find_empty_cells(table_buffer);

  if(empty_cells){
    var target = empty_cells[Math.floor(Math.random() * empty_cells.length)];
    var value = 2;
    if(Math.random() * 4 >= 3){
      value = 4;
    }

    table_buffer[target[0]][target[1]] = value;

    return table_buffer;
  }else{
    return table;
  }
}

//0の値を持つセルのインデックスを取得
var find_empty_cells = function(table, review_mode){
  var empty_cells = [];
  var flag = false;

  for(var i = 0; i < 4; i++){
    for(var j = 0; j < 4; j++){
      if(table[i][j] == 0){
        empty_cells.push([i,j]);
        flag = true;
        if(review_mode){
          break;
        }
      }
    }
  }
  return flag ? empty_cells: false;
}

var detect_game_over = function(table){
  if(!find_empty_cells(table, true)){
    if(!movable(table)){
      if(!movable(form_table(table, "up"))){
        return true;
      }
    }
  }
  return false;
}

//隣り合うセルの値が同一のものを探す
var movable = function(table){
  var flag = false;

  return table.some(function(row){
    var previous = 0;

    return row.some(function(cell){
      if(cell == previous){
        return true;
      }else{
        previous = cell;
      }
    });
  });

}

//スコアを計算
var calc_score = function(table){
  var sum = 0;
  table.forEach(function(row){
    sum += row.reduce(function(prev_cell, curr_cell){
      return prev_cell + curr_cell;
    });
  });
  return sum;
}

//htmlに反映
var display = function(table, score){
  //game-containerを作成し直し、上書きする
  var current_container = document.getElementById("game-container");
  var new_container = document.createElement("div")
  new_container.setAttribute("id", "game-container");

  //new-container内に各セルのNodeを作成
  table.forEach(function(row){
    row.forEach(function(cell){

      var class_text = "";
      if(cell > 2048){
        class_text = "cell-extra";
      }else{
        class_text = "cell-" + String(cell);
      }

      cell_node = document.createElement("div");
      cell_node.classList.add(class_text);
      cell_node.innerText = cell;

      new_container.appendChild(cell_node);
    });
  });

  current_container.parentNode.replaceChild(
    new_container, current_container);

  //スコアを反映
  document.getElementById("current-score").innerText = score;

  //ゲームオーバーメッセージの表示/非表示
  var attr_value = is_game_over ? "block" : "none";
  document.getElementById("game-over").style.display = attr_value;
}

//ニューゲームを開始する
var new_game = function(){
  is_game_over = false;
  current_table = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
  current_table = add_new_value(add_new_value(current_table));
  current_score = calc_score(current_table);
  display(current_table, current_score);
}

