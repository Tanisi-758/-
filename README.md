<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Panzoom対応：画像に追従するボタン</title>
    <script src="https://unpkg.com/@panzoom/panzoom@4.5.1/dist/panzoom.min.js"></script>
    <style>
        /* 1. 外側の枠（画面に表示するサイズを固定する） */
        .panzoom-wrapper {
            width: 500px;
            height: 600px;
            margin: 20px auto;
            border: 1px solid #333;
            overflow: hidden; /* 枠からはみ出た画像を隠す */
            background-color: #eee;
            position: relative;
        }
        #panzoom-element {
            width: 100%;
            display: block;
        }
        /* 2. 【超重要】Panzoomのターゲット（画像とボタンをセットにする） */
        .panzoom-target {
            position: relative;
            width: 800px;  /* 画像の本来のサイズ、または基準にしたいサイズ */
            height: 533px; /* 高さを指定して、ボタンの基準面を固定する */
            display: inline-block;
        }

        .panzoom-target img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        /* 3. ボタンの配置（画像ではなく、.panzoom-targetを基準に絶対配置） */
        .overlay-button {
            position: absolute;
            top: 315px;  /* 上から40%の位置 */
            left: 255px; /* 左から60%の位置 */
            transform: translate(-50%, -50%);

            /* 見た目の装飾 */
            padding: 10px 15px;
            background-color: transparent;
            color: #333;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <div class="panzoom-wrapper">
        
        <div id="panzoom-element" class="panzoom-target">
            <img src="スクリーンショット 2026-05-25 143538.png" alt="背景画像">
            
            <button class="overlay-button" onclick="alert('9号館')"></button>
        </div>

    </div>

    <script>
        // HTML要素を取得
        const element = document.getElementById('panzoom-element');
        
        // Panzoomの初期化（画像ではなく、コンテナを指定する！）
        const panzoom = Panzoom(element, {
            maxScale: 10,
            minScale: 1.2,
            contain: 'outside' // 枠外に消えていかないように制限（お好みで）
        });

        // マウスホイールでのズームを有効にする設定
        element.parentElement.addEventListener('wheel', panzoom.zoomWithWheel);
    </script>

</body>
</html>
