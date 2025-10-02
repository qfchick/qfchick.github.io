const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

let password = "";
let init_running = false, guess_running = false;
let guess_count = 0, is_ok = false;

/**
 * 开始游戏
 */
async function init(){
    let game_card = document.getElementById("game");
    let start_btn = document.getElementById("start");
    let log = document.getElementById("log");
    let count = document.getElementById("count");
    let game_rule = document.getElementById("game-rule");

    const had_show_rule = sessionStorage.getItem("had_show_rule");
    if(had_show_rule === null){
        game_rule.showModal();
        sessionStorage.setItem("had_show_rule", "true");
        return;
    }

    if(init_running || start_btn.classList.contains("btn-disabled"))
        return;
    init_running = true;


    game_card.style.display = "none";
    start_btn.classList.remove("btn-success");
    start_btn.classList.add("btn-disabled");
    start_btn.innerHTML = "准备中……";
    await sleep(1000);
    start_btn.classList.remove("btn-disabled");
    start_btn.classList.add("btn-success");
    start_btn.innerHTML = "准备完成";
    await sleep(500);
    game_card.style.display = "";
    start_btn.innerHTML = "重新开始";

    is_ok = false;
    guess_count = 0;
    count.innerHTML = 10;
    log.innerHTML = "破译进程已启动……";

    password = "";
    let num_list = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for(let i = 0; i < 4; i++){
        let index = Math.floor(Math.random() * num_list.length);
        password += num_list[index];
        num_list.splice(index, 1);
    }

    console.log(`init(): password = ${password}`);
    init_running = false;
}


/**
 * 校验密码
 */
async function check(){
    let answer = document.getElementById("answer").value;
    let submit_btn = document.getElementById("submit");
    let error_dialog = document.getElementById("error");
    let wrong_dialog = document.getElementById("wrong");
    let wrong_msg = document.getElementById("wrong-msg");
    let right_dialog = document.getElementById("right");
    let right_msg = document.getElementById("right-msg");
    let log = document.getElementById("log");
    let count = document.getElementById("count");
    let zero_count = document.getElementById("0-count");
    let show_ans = document.getElementById("show-ans");
    let ans_show = document.getElementById("ans-show");
    let had_completed = document.getElementById("had-completed");

    if(guess_running)
        return;
    guess_running = true;
    if(guess_count >= 10){
        zero_count.showModal();
        guess_running = false;
        return;
    }
    if(is_ok){
        had_completed.showModal();
        guess_running = false;
        return;
    }
    console.log("check(): checking:", answer);

    submit_btn.classList.add("btn-disabled");
    submit_btn.innerHTML = "正在校验……";
    await sleep(1000);
    submit_btn.classList.remove("btn-disabled");
    submit_btn.innerHTML = "尝试破译";

    let check_list = new Array(9), cnt = 0;
    for(let i = 0; i < 10; i++)
        check_list[i] = 0;
    for(let i = 0; i < 4; i++)
        check_list[Number(answer[i])] = 1;
    for(let i = 0; i < 10; i++)
        cnt += check_list[i];
    if(answer.length != 4 || cnt != 4){
        console.log("check(): answer is invalid");
        log.innerHTML += `<br />校验 ${answer} 失败：输入不合法（不计入尝试次数）`;
        error_dialog.showModal();
        guess_running = false;
        return;
    }

    count.innerHTML = 10 - (++ guess_count);
    if(answer == password){
        is_ok = true;
        console.log("check(): answer is correct");
        log.innerHTML += `<br />第 ${guess_count} 次校验：密码 ${answer} 正确！`;
        log.innerHTML += `<br />破译进程结束。`;
        right_msg.innerHTML = `<strong style="font-size: 1.5em;">破译成功！</strong><br />您一共尝试了${guess_count}次。<br /><br /><strong style="font-size: 1.25em;">祝贺你！</strong>`;
        right_dialog.showModal();
        guess_running = false;
        return;
    }
    
    let correct = 0, pos_wrong = 0;
    for(let i = 0; i < 4; i++)
        correct += answer[i] == password[i];
    for(let i = 0; i < 4; i++)
        for(let j = 0; j < 4; j++)
            if(i != j)
                pos_wrong += answer[i] == password[j];

    console.log(`check(): answer is wrong, correct = ${correct}, pos_wrong = ${pos_wrong}`);
    log.innerHTML += `<br />第 ${guess_count} 次校验：密码 ${answer} 错误，数字在答案中且位置正确上的数字有 ${correct} 个，数字在答案中但位置不正确的数字有 ${pos_wrong} 个。`;
    if(guess_count >= 10){
        console.log("check(): guess_count >= 10");
        log.innerHTML += `<br />校验次数已耗尽。<br />正确密码为 ${password}。`;
        log.innerHTML += `<br />破译进程异常终止。`;
        ans_show.innerHTML = password;
        show_ans.showModal();
    }
    wrong_msg.innerHTML = `破译失败。<br /><strong>根据系统信息</strong>：<br />数字在答案中且位置正确上的数字有 ${correct} 个，<br />数字在答案中但位置不正确的数字有 ${pos_wrong} 个。`;
    wrong_dialog.showModal();

    
    guess_running = false;
    return;
}