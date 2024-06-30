# 排他制御を用いたファイル更新の例

このプロジェクトは、TypeScriptベースのAPIサーバーにおける排他制御（mutex）の必要性と実装を示しています。システムは、APIサーバーとWebサーバーで構成されており、Docker Composeを使用して管理されています。Webサーバーは、API呼び出しをトリガーするボタンが配置されたHTMLページをホストしており、排他制御の効果を実演します。

## 排他制御の必要性

並行環境では、複数のプロセスやスレッドが同時に同じリソースを更新しようとすることがあります。排他制御がない場合、更新のタイミングに依存してリソースの最終状態が変わるレースコンディションが発生し、一貫性のないデータや破損したデータが生成される可能性があります。

これを防ぐために、mutex（相互排他）を使用して、1つのプロセスのみがリソースを更新できるようにします。これにより、各更新が完了してから次の更新が始まるため、データの一貫性が保たれます。

## システムの詳細

- **APIサーバー:** Node.js（TypeScript）とExpressを使用し、排他制御には`async-mutex`を使用。
- **Webサーバー:** Nginxを使用し、BootstrapとJavaScriptを用いたHTMLページを提供。

### APIエンドポイント

1. **GET /v1/increment**
   - 排他制御を使用して`data.json`の`id`値をインクリメントします。
   - 長時間実行プロセスをシミュレートするために5秒の遅延を追加します。
   - レスポンス: `{ "old_id": <old_value>, "new_id": <new_value> }`

2. **GET /v1/increment_notransaction**
   - 排他制御を行わずに`data.json`の`id`値をインクリメントします。
   - 長時間実行プロセスをシミュレートするために5秒の遅延を追加します。
   - レスポンス: `{ "old_id": <old_value>, "new_id": <new_value> }`

## 始め方

### 前提条件

- Docker
- Docker Compose

### セットアップ

1. リポジトリをクローン
```bash
git clone https://github.com/y-omasa-kbc/eg-exclusive-access-ts.git
cd eg-exclusive-access-ts
```

2. api/app内にnode_moduleを作成
リポジトリに含まれる **api/appディレクトリ**で、以下のコマンドを実行することで、node_modulesディレクトリを作成してモジュールをインストールします。
```bash
npm install
```

3. IDデータを保存するJSONファイルの作成
**api/appディレクトリ**内に、以下の内容のファイルを**data.json**というファイル名で作成します。
```json
{
  "id": 1
}
```

### 環境の起動
**eg-exclusive-access-tsディレクトリ**内で、以下のコマンドを実行します。
```bash
docker-compose up -d
```

## 実験方法
異なる2つのブラウザで、http:localhost:8080を開きます。

1. トランザクションを用いたインクリメント:
- ブラウザAで「Increment with mutex」ボタンをクリックします。
- ブラウザAが結果を取得する前に、ブラウザBで「Increment with mutex」ボタンをクリックします。
- 各ブラウザが取得した結果で、排他制御が適切に行われ、同時実行が発生してもnew_idが重複しないことを確認します。

2. トランザクションなしのインクリメント:
- ブラウザAで「Increment without mutex」ボタンをクリックします。
- ブラウザAが結果を取得する前に、ブラウザBで「Increment without mutex」ボタンをクリックします。
- 各ブラウザが取得した結果で、排他制御がないことにより重複したIDがnew_idとして取得されることを確認します。

## 期待される結果
- トランザクションあり: mutexによる排他制御により、同時リクエストに関係なく、各呼び出しでid値が1ずつインクリメントされます。
- トランザクションなし: 同時リクエスト時にid値のインクリメントが正しく行われない可能性があり、排他制御の必要性が実証されます。

## ファイルとディレクトリ
- api/src/index.ts: エンドポイントとmutex実装を含むメインのAPIサーバーコード。
- web/index.html: API呼び出しをトリガーするボタンを含むHTMLページ。
- web/script.js: ボタンクリックを処理し、APIレスポンスを表示するJavaScriptコード。
- docker-compose.yml: APIおよびWebサーバーを設定するためのDocker Compose構成。