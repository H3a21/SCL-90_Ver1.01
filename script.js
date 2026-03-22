let questions = [];
let current = 0;
let answers = {};
//开始时间
let startTime = null;
fetch("questions.json")
    .then(res => res.json())
    .then(data => {
        questions = data;
        startTime = Date.now(); //开始计时
        showQuestion();
    });
function showQuestion() {
    const q = questions[current];
    document.getElementById("progress").innerText =
        `进度：${current + 1}/${questions.length}`;
    document.getElementById("questionBox").innerHTML = `
        <div class="question">Q${q.id}：${q.text}</div>
        <div class="options">
            ${[1,2,3,4,5].map(v => `
                <label>
                    <input type="radio" name="q" value="${v}"
                    ${answers[q.id]==v?"checked":""}>
                    <span>${v} 分</span>
                </label>
            `).join("")}
        </div>
    `;
    // 控制按钮
    document.getElementById("submitBtn").style.display =
        current === questions.length - 1 ? "inline-block" : "none";
    document.getElementById("nextBtn").style.display =
        current === questions.length - 1 ? "none" : "inline-block";
    document.querySelectorAll("input[name='q']").forEach(i=>{
        i.onclick=()=>answers[q.id]=parseInt(i.value);
    });
}
function nextQuestion() {
    if (!document.querySelector("input[name='q']:checked")) {
        alert("请选择！");
        return;
    }
    current++;
    showQuestion();
}
function prevQuestion() {
    if (current > 0) current--;
    showQuestion();
}
function submitTest() {
    //结束时间
    let endTime = Date.now();
    let duration = Math.floor((endTime - startTime) / 1000);
    let minutes = Math.floor(duration / 60);
    let seconds = duration % 60;
    let durationStr = `${minutes}分${seconds}秒`;
    let totalScore = 0;
    let positive = 0;
    let factorMap = {};
    questions.forEach(q => {
        let val = answers[q.id] || 0;
        totalScore += val;
        if (val >= 2) positive++;
        if (!factorMap[q.category]) {
            factorMap[q.category] = [];
        }
        factorMap[q.category].push({
            id: q.id,
            value: val
        });
    });
    let avg = (totalScore / questions.length).toFixed(2);
    document.getElementById("result").innerHTML = `
        <h3>结果</h3>
        测量用时：${durationStr}<br>
        总分：${totalScore}<br>
        总均分：${avg}<br>
        阳性项目数：${positive}
    `;
    let factorAvg = {};
    for (let k in factorMap) {
        let sum = factorMap[k].reduce((a,b)=>a+b.value,0);
        factorAvg[k] = (sum / factorMap[k].length).toFixed(2);
    }
    drawChart(factorAvg);
    generateTable(factorMap, factorAvg, durationStr, totalScore, avg, positive);
}
function drawChart(data) {
    const ctx = document.getElementById('chart');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: '心理因子',
                data: Object.values(data)
            }]
        }
    });
}
function generateTable(factorMap, factorAvg, durationStr, totalScore, avg, positive) {
    let html = "<h3>评分表</h3>";
    html += `<p><b>测量用时：</b>${durationStr}</p>`;
    html += "<table>";
    html += "<tr><th>因子</th><th>题号</th><th>得分</th><th>因子分</th></tr>";
    for (let factor in factorMap) {
        let items = factorMap[factor];
        let ids = items.map(i => i.id).join(", ");
        let scores = items.map(i => i.value).join(", ");
        html += `
            <tr>
                <td class="factor-name">${factor}</td>
                <td>${ids}</td>
                <td>${scores}</td>
                <td>${factorAvg[factor]}</td>
            </tr>
        `;
    }
    html += `
        <tr style="background:#e6f7ff;font-weight:bold;">
            <td colspan="2">总计</td>
            <td>总分：${totalScore}</td>
            <td>均分：${avg}</td>
        </tr>
        <tr style="background:#fffbe6;font-weight:bold;">
            <td colspan="4">阳性项目数：${positive}</td>
        </tr>
    `;
    html += "</table>";
    document.getElementById("tableResult").innerHTML = html;
}