# VEINN Intro Website

VEINNの入口演出と、A FLOOR / B FLOOR選択画面をまとめた静的サイトです。

## ファイル

- `index.html` — 入口とフロア選択
- `style.css` — デザインとアニメーション
- `script.js` — 画面遷移、カーテン演出、環境音
- `a-floor.html` — A FLOOR仮ページ
- `b-floor.html` — B FLOOR仮ページ

## ローカルで確認

`index.html`をブラウザで開くだけでも確認できます。

より確実に表示する場合:

```bash
python -m http.server 8000
```

その後、ブラウザで `http://localhost:8000` を開きます。

## GitHub Pages

1. GitHubで新しいリポジトリを作る
2. このフォルダ内のファイルをアップロード
3. Settings → Pages
4. Branchを `main`、フォルダを `/ (root)` に設定
5. Save

## 次に編集する場所

- ロゴ文言: `index.html` の `<h1 class="logo">`
- 色: `style.css` 冒頭の `:root`
- A/B紹介文: `index.html` の `.floor-card__copy`
- クレジット: `index.html` の `<footer class="credits">`
