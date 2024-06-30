"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = require("fs");
const async_mutex_1 = require("async-mutex");
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 3000;
const mutex = new async_mutex_1.Mutex(); //排他処理用のmutex
const dataFilePath = path_1.default.join(__dirname, './data.json');
app.use(express_1.default.json());
app.use((0, cors_1.default)());
//遅延処理関数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//排他処理
app.get('/v1/increment', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('increment');
    const release = yield mutex.acquire(); //mutexを取得
    try {
        //データを読む
        const data = JSON.parse(yield fs_1.promises.readFile(dataFilePath, 'utf8'));
        const oldId = data.id;
        data.id += 1;
        yield delay(5000); //同時実行のシミュレーションに5秒待つ
        //データ書き込み
        yield fs_1.promises.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
        res.send({ old_id: oldId, new_id: data.id });
    }
    catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
    finally {
        release(); //mutexを解放
    }
}));
//非排他処理
app.get('/v1/increment_nomutex', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('increment_nomutex');
    try {
        //データ読み込み
        const data = JSON.parse(yield fs_1.promises.readFile(dataFilePath, 'utf8'));
        const oldId = data.id;
        data.id += 1;
        yield delay(5000); //同時実行のシミュレーションに5秒待つ
        //データ書き込み
        yield fs_1.promises.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
        res.send({ old_id: oldId, new_id: data.id });
    }
    catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
}));
app.listen(port, () => {
    console.log(`API server is running on http://localhost:${port}`);
});
