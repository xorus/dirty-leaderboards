const max = 1000;
const checkbox = document.getElementById("hideaaa");
const checkbox0 = document.getElementById("hide0");
if (localStorage.getItem("hideaaa") === "1") {
    checkbox.checked = true;
}
if (localStorage.getItem("hide0") === "1") {
    checkbox0.checked = true;
}

function hideItem(score) {
    if (checkbox.checked && score.name === "AAA") {
        return true;
    }
    return checkbox0.checked && score.score <= 0;
}

function update() {
    document.getElementById("title").innerHTML = "Loading...";

    fetch("/leaderboard?count=" + max).then(d => d.json()).then(scores => {
        let count = scores.filter(score => !hideItem(score)).length;

        let block = "";
        scores.forEach(score => {
            let hide = hideItem(score);
            block += "<li class=\"" + (hide ? "hide" : "") + "\"><mark>" + score.name + "</mark><small>" + score.score + "</small></li>";
        });

        let len = scores.length;
        if (scores.length >= max) {
            len += "+";
        }

        if (count !== len) {
            len = count + "/" + len;
        }

        document.getElementById("list").innerHTML = block;
        document.getElementById("title").innerHTML = "Leaderboard (" + len + ")";
    });
}

checkbox.addEventListener('change', () => {
    update();
    localStorage.setItem("hideaaa", checkbox.checked ? "1" : "0");
});
checkbox0.addEventListener('change', () => {
    update();
    localStorage.setItem("hide0", checkbox0.checked ? "1" : "0");
});

update();
setInterval(() => update(), 10000);
