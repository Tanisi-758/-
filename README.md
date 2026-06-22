<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>Campus Map</title>

<style>
body{
    font-family:sans-serif;
}

#viewport{
    width:600px;
    height:600px;
    border:2px solid #333;
    overflow:hidden;
    position:relative;
    touch-action:none;
}

canvas{
    display:block;
}
</style>
</head>
<body>

<h2>校内地図</h2>

<div id="viewport">
    <canvas id="mapCanvas" width="600" height="600"></canvas>
</div>

<p>
左クリック：
1回目=現在地<br>
2回目=目的地<br>
3回目=現在地リセット
</p>

<p id="coord">
X: -, Y: -
</p>
<script>

// ======================
// 設定
// ======================

const canvas = document.getElementById("mapCanvas");
const coord = document.getElementById("coord");

canvas.addEventListener("click", (e) => {

    const rect = canvas.getBoundingClientRect();

    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const world = screenToWorld(sx, sy);

    coord.textContent =
        `World X: ${Math.round(world.x)}, ` +
        `World Y: ${Math.round(world.y)}`;

});

const ctx = canvas.getContext("2d");

const VIEW_W = 600;
const VIEW_H = 600;

// 背景画像
const bg = new Image();
bg.src = "スクリーンショット 2026-05-25 143538.png";


// ======================
// サンプルデータ
// ======================

const nodes = [
    {id:"A",x:508,y:698},
    {id:"B",x:508,y:605},
    {id:"C",x:508,y:525},
    {id:"D",x:510,y:480},
    {id:"E",x:512,y:393},
    {id:"F",x:550,y:337},
    {id:"G",x:580,y:310},
    {id:"H",x:590,y:310},
    {id:"I",x:626,y:310},
    {id:"J",x:712,y:310},

    {id:"K",x:440,y:605},
    {id:"L",x:355,y:605},

    {id:"M",x:440,y:525},
    {id:"N",x:355,y:525},

    {id:"O",x:450,y:480},
    {id:"P",x:380,y:490},

    {id:"Q",x:450,y:360},
    {id:"R",x:380,y:333},

    {id:"S",x:450,y:360},
    {id:"T",x:450,y:360},
    {id:"U",x:450,y:360},
    {id:"V",x:450,y:360},
    {id:"W",x:450,y:360},
    {id:"X",x:450,y:360},
    {id:"Y",x:450,y:360},
    {id:"Z",x:450,y:360},
];

const edges = [
    {from:"A",to:"B",cost:90},
    {from:"B",to:"C",cost:80},
    {from:"C",to:"D",cost:40},
    {from:"D",to:"E",cost:90},
    {from:"E",to:"F",cost:30},
    {from:"F",to:"G",cost:30},
    {from:"G",to:"H",cost:24},
    {from:"H",to:"I",cost:36},
    {from:"I",to:"J",cost:14},

    {from:"B",to:"K",cost:68},
    {from:"K",to:"L",cost:85},

    {from:"C",to:"M",cost:68},
    {from:"M",to:"N",cost:85},

    {from:"K",to:"M",cost:80},
    {from:"L",to:"N",cost:80},

    {from:"D",to:"O",cost:60},
    {from:"O",to:"P",cost:85},

    {from:"O",to:"M",cost:49},

    {from:"E",to:"Q",cost:70},
    {from:"Q",to:"R",cost:70},

    {from:"Q",to:"O",cost:120},
];

const features = [
    {
        id:"lib",
        name:"図書館",
        x:390,
        y:545,
        minZoom:1.5,
        maxZoom:10,
        description:"蔵書約10万冊"
    },

    {
        id:"caf",
        name:"9号館",
        x:465,
        y:550,
        minZoom:1.5,
        maxZoom:10,
    },

       {
        id:"caf",
        name:"食堂",
        x:468,
        y:507,
        minZoom:1.5,
        maxZoom:10,
        description:"ランチ営業"
    },

    {
        id:"caf",
        name:"10号館",
        x:455,
        y:440,
        minZoom:1.5,
        maxZoom:10,
    },

    {
        id:"caf",
        name:"5号館",
        x:600,
        y:480,
        minZoom:1.5,
        maxZoom:10,
    }
];


// ======================
// グラフ作成
// ======================

const graph = {};

nodes.forEach(n=>{
    graph[n.id]=[];
});

edges.forEach(e=>{
    graph[e.from].push({
        id:e.to,
        cost:e.cost
    });

    graph[e.to].push({
        id:e.from,
        cost:e.cost
    });
});


// ======================
// カメラ
// ======================

let scale = 0.5;

let offsetX = 0;
let offsetY = 0;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;


// ======================
// 状態
// ======================

let startNode = null;
let goalNode = null;
let path = [];


// ======================
// 座標変換
// ======================

// world -> screen
function worldToScreen(x,y){
    return {
        x:x*scale + offsetX,
        y:y*scale + offsetY
    };
}

// screen -> world
function screenToWorld(x,y){
    return {
        x:(x-offsetX)/scale,
        y:(y-offsetY)/scale
    };
}


// ======================
// clamp
// ======================

function clampCamera(){

    if(!bg.width) return;

    const mapW = bg.width * scale;
    const mapH = bg.height * scale;

    if(mapW <= VIEW_W){
        offsetX = (VIEW_W-mapW)/2;
    }else{
        offsetX = Math.min(
            0,
            Math.max(
                VIEW_W-mapW,
                offsetX
            )
        );
    }

    if(mapH <= VIEW_H){
        offsetY = (VIEW_H-mapH)/2;
    }else{
        offsetY = Math.min(
            0,
            Math.max(
                VIEW_H-mapH,
                offsetY
            )
        );
    }
}


// ======================
// 最寄りノード検索
// ======================

function nearestNode(x,y){

    let best = null;
    let bestDist = Infinity;

    for(const n of nodes){

        const dx = x-n.x;
        const dy = y-n.y;

        const d = dx*dx + dy*dy;

        if(d < bestDist){
            bestDist = d;
            best = n;
        }
    }

    return best;
}


// ======================
// Dijkstra
// ======================

function shortestPath(startId,goalId){

    const dist = {};
    const prev = {};
    const visited = new Set();

    nodes.forEach(n=>{
        dist[n.id]=Infinity;
    });

    dist[startId]=0;

    while(true){

        let current = null;
        let best = Infinity;

        for(const id in dist){

            if(
                !visited.has(id) &&
                dist[id] < best
            ){
                best = dist[id];
                current = id;
            }
        }

        if(current===null) break;

        if(current===goalId) break;

        visited.add(current);

        graph[current].forEach(next=>{

            const nd =
                dist[current]
                + next.cost;

            if(nd < dist[next.id]){

                dist[next.id] = nd;
                prev[next.id] = current;
            }
        });
    }

    const result=[];

    let cur=goalId;

    while(cur){

        result.unshift(cur);
        cur=prev[cur];
    }

    if(result[0]!==startId){
        return [];
    }

    return result;
}


// ======================
// 描画
// ======================

function draw(){

    ctx.clearRect(0,0,VIEW_W,VIEW_H);

    if(bg.complete){

        ctx.drawImage(
            bg,
            offsetX,
            offsetY,
            bg.width*scale,
            bg.height*scale
        );
    }

    // 道ネットワーク
    ctx.strokeStyle="#888";
    ctx.lineWidth=2;

    edges.forEach(e=>{

        const a =
            nodes.find(n=>n.id===e.from);

        const b =
            nodes.find(n=>n.id===e.to);

        const p1 =
            worldToScreen(a.x,a.y);

        const p2 =
            worldToScreen(b.x,b.y);

        ctx.beginPath();
        ctx.moveTo(p1.x,p1.y);
        ctx.lineTo(p2.x,p2.y);
        ctx.stroke();
    });


    // 経路
    if(path.length>1){

        ctx.strokeStyle="#ff3b30";
        ctx.lineWidth=6;

        ctx.beginPath();

        path.forEach((id,index)=>{

            const n =
                nodes.find(v=>v.id===id);

            const p =
                worldToScreen(n.x,n.y);

            if(index===0){
                ctx.moveTo(p.x,p.y);
            }else{
                ctx.lineTo(p.x,p.y);
            }
        });

        ctx.stroke();
    }


    // start
    if(startNode){

        const p =
            worldToScreen(
                startNode.x,
                startNode.y
            );

        ctx.fillStyle="green";

        ctx.beginPath();
        ctx.arc(
            p.x,
            p.y,
            8,
            0,
            Math.PI*2
        );
        ctx.fill();
    }


    // goal
    if(goalNode){

        const p =
            worldToScreen(
                goalNode.x,
                goalNode.y
            );

        ctx.fillStyle="blue";

        ctx.beginPath();
        ctx.arc(
            p.x,
            p.y,
            8,
            0,
            Math.PI*2
        );
        ctx.fill();
    }


    
    features.forEach(f=>{

        if(
            scale < f.minZoom ||
            scale > f.maxZoom
        ){
            return;
        }

        const p =
            worldToScreen(
                f.x,
                f.y
            );

        const r = 8*scale*0.5;

        ctx.fillStyle="orange";

        ctx.beginPath();
        ctx.arc(
            p.x,
            p.y,
            r,
            0,
            Math.PI*2
        );
        ctx.fill();

        ctx.fillStyle="black";
        ctx.font=`${12*scale}px sans-serif`;

        ctx.fillText(
            f.name,
            p.x+10,
            p.y
        );
    });

    requestAnimationFrame(draw);
}


// ======================
// クリック
// ======================

canvas.addEventListener("click",(e)=>{

    const rect =
        canvas.getBoundingClientRect();

    const sx =
        e.clientX-rect.left;

    const sy =
        e.clientY-rect.top;

    const w =
        screenToWorld(
            sx,
            sy
        );

    const node =
        nearestNode(
            w.x,
            w.y
        );

    if(!startNode){

        startNode=node;

    }else if(!goalNode){

        goalNode=node;

        path=
        shortestPath(
            startNode.id,
            goalNode.id
        );

    }else{

        startNode=node;
        goalNode=null;
        path=[];
    }
});


// ======================
// ドラッグ
// ======================

let dragging=false;
let lastX=0;
let lastY=0;

canvas.addEventListener("mousedown",(e)=>{

    dragging=true;

    lastX=e.clientX;
    lastY=e.clientY;
});

window.addEventListener("mouseup",()=>{
    dragging=false;
});

window.addEventListener("mousemove",(e)=>{

    if(!dragging) return;

    offsetX += e.clientX-lastX;
    offsetY += e.clientY-lastY;

    lastX=e.clientX;
    lastY=e.clientY;

    clampCamera();
});


// ======================
// ズーム
// ======================

canvas.addEventListener(
    "wheel",
    (e)=>{

        e.preventDefault();

        const rect =
            canvas.getBoundingClientRect();

        const mx =
            e.clientX-rect.left;

        const my =
            e.clientY-rect.top;

        const before =
            screenToWorld(mx,my);

        const factor =
            e.deltaY<0
            ?1.1
            :0.9;

        scale *= factor;

        scale =
        Math.max(
            MIN_ZOOM,
            Math.min(
                MAX_ZOOM,
                scale
            )
        );

        offsetX =
            mx -
            before.x*scale;

        offsetY =
            my -
            before.y*scale;

        clampCamera();
    },
    {passive:false}
);


// ======================
// 初期化
// ======================

bg.onload=()=>{

    clampCamera();
    draw();
};

</script>

</body>
</html>
