import express from 'express';
import { promises as fs } from 'fs';
import { Mutex } from 'async-mutex';
import path from 'path';
import cors from 'cors';

const app = express();
const port = 3000;
const mutex = new Mutex();  //排他処理用のmutex
const dataFilePath = path.join(__dirname, './data.json');

app.use(express.json());
app.use(cors());

//遅延処理関数
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//排他処理
app.get('/v1/increment', async (req, res) => {
  console.log('increment');
  const release = await mutex.acquire();  //mutexを取得
  try {
    //データを読む
    const data = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));
    const oldId = data.id;

    data.id += 1;
    await delay(5000);  //同時実行のシミュレーションに5秒待つ

    //データ書き込み
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    res.send({ old_id: oldId, new_id: data.id });
  } catch (error: any) {
    res.status(500).send({ success: false, error: error.message });
  } finally {
    release();  //mutexを解放
  }
});

//非排他処理
app.get('/v1/increment_nomutex', async (req, res) => {
  console.log('increment_nomutex');
  try {
    //データ読み込み
    const data = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));
    const oldId = data.id;

    data.id += 1;
    await delay(5000);   //同時実行のシミュレーションに5秒待つ

    //データ書き込み
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    res.send({ old_id: oldId, new_id: data.id });
  } catch (error: any) {
    res.status(500).send({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`API server is running on http://localhost:${port}`);
});