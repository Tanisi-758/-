/**
 * 目的地と現在地から所要時間・距離・経路を計算する独立モジュール
 * 
 * @param {string} startId - 出発地のノードID
 * @param {string} goalId - 目的地のノードID
 * @param {Array} nodes - 全ノードデータ [{id: "A", x: 508, y: 698}, ...]
 * @param {Array} edges - 全エッジデータ [{from: "A", to: "B", cost: 90}, ...]
 * @param {number} costToMeterRatio - 1コスト（ピクセル）を何メートルとするかの変換比率
 * @returns {Object} 経路計算の結果
 */
function calculateRouteInfo(startId, goalId, nodes, edges, costToMeterRatio = 1.0) {
    
    // 1. グラフネットワークの構築（隣接リスト表現）
    const graph = {};
    nodes.forEach(n => { graph[n.id] = []; });
    
    edges.forEach(e => {
        // 双方向に移動可能としてエッジを登録
        if (graph[e.from]) graph[e.from].push({ id: e.to, cost: e.cost });
        if (graph[e.to]) graph[e.to].push({ id: e.from, cost: e.cost });
    });

    // 2. ダイクストラ法による最短経路探索
    const dist = {};
    const prev = {};
    const visited = new Set();

    nodes.forEach(n => { dist[n.id] = Infinity; });
    
    // 出発地が存在しない場合のエラーハンドリング
    if (dist[startId] === undefined) {
        return { isSuccess: false, error: "出発地のノードが見つかりません" };
    }
    
    dist[startId] = 0;

    while (true) {
        let current = null;
        let best = Infinity;

        // 未訪問の中で最もコストが低いノードを探す
        for (const id in dist) {
            if (!visited.has(id) && dist[id] < best) {
                best = dist[id];
                current = id;
            }
        }

        // 全て訪問したか、目的地に到達したらループ終了
        if (current === null || current === goalId) break;

        visited.add(current);

        // 隣接ノードの距離を更新
        if (graph[current]) {
            graph[current].forEach(next => {
                const newDist = dist[current] + next.cost;
                if (newDist < dist[next.id]) {
                    dist[next.id] = newDist;
                    prev[next.id] = current;
                }
            });
        }
    }

    // 3. 経路の復元（ゴールからスタートへ遡る）
    const path = [];
    let cur = goalId;
    while (cur) {
        path.unshift(cur);
        cur = prev[cur];
    }

    // 経路が見つからなかった場合（孤立したノードなど）
    if (path[0] !== startId) {
        return { isSuccess: false, error: "経路が見つかりませんでした" };
    }

    // 4. 総距離と所要時間の計算
    const totalCost = dist[goalId];
    const distanceMeters = Math.round(totalCost * costToMeterRatio);
    
    // 徒歩時間の計算：1分 = 80m で割り、端数を切り上げ
    const walkingTimeMin = Math.ceil(distanceMeters / 80);

    // 5. 計算結果のオブジェクトを返す
    return {
        isSuccess: true,
        path: path,
        distanceMeters: distanceMeters,
        timeMin: walkingTimeMin
    };
}
