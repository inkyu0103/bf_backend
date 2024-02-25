const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 8000;

// SQLite 데이터베이스 연결
const db = new sqlite3.Database("./todos.db");

// 데이터베이스에 테이블 생성
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    dueDate DATETIME,
    isCompleted BOOLEAN
  )`);
});

// Middleware 설정
app.use(bodyParser.json());

// ToDo 목록을 반환
app.get("/todos", (req, res) => {
  db.all("SELECT * FROM todos", (err, rows) => {
    if (err) {
      res.status(500).send("ToDo 목록을 불러오는 중 오류가 발생했습니다.");
    } else {
      res.json(rows);
    }
  });
});

// ToDo 추가
app.post("/todos", (req, res) => {
  const { title, description, dueDate, isCompleted } = req.body;
  db.run(
    "INSERT INTO todos (title, description, dueDate, isCompleted) VALUES (?, ?, ?, ?)",
    [title, description, dueDate, isCompleted],
    function (err) {
      if (err) {
        res.status(400).send("ToDo 추가 중 오류가 발생했습니다.");
      } else {
        res.status(201).send("ToDo가 추가되었습니다.");
      }
    }
  );
});

// ToDo 업데이트
app.put("/todos/:id", (req, res) => {
  const id = req.params.id;
  const { title, description, dueDate, isCompleted } = req.body;
  db.run(
    "UPDATE todos SET title = ?, description = ?, dueDate = ?, isCompleted = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
    [title, description, dueDate, isCompleted, id],
    function (err) {
      if (err) {
        res.status(400).send("ToDo 업데이트 중 오류가 발생했습니다.");
      } else {
        res.send("ToDo가 업데이트되었습니다.");
      }
    }
  );
});

// ToDo 삭제
app.delete("/todos/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM todos WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(400).send("ToDo 삭제 중 오류가 발생했습니다.");
    } else {
      res.send("ToDo가 삭제되었습니다.");
    }
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
