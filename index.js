const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
const PORT = 8080;

// SQLite 데이터베이스 연결
const db = new sqlite3.Database("./todos.db");

// Swagger 옵션 설정
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "ToDo API with Swagger",
      version: "1.0.0",
      description: "ToDo API를 자동으로 문서화하는 Express 애플리케이션",
    },
  },
  // API 파일 경로 설정
  apis: ["./index.js"],
};

// Swagger 문서 생성
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI 설정
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: 모든 ToDo 가져오기
 *     description: 데이터베이스에서 모든 ToDo를 가져옵니다.
 *     responses:
 *       200:
 *         description: 성공적으로 ToDo 목록을 가져왔을 때
 *       500:
 *         description: 서버에서 오류가 발생했을 때
 */
app.get("/todos", (req, res) => {
  db.all("SELECT * FROM todos", (err, rows) => {
    if (err) {
      res.status(500).send("ToDo 목록을 불러오는 중 오류가 발생했습니다.");
    } else {
      res.json(rows);
    }
  });
});

/**
 * @swagger
 * /todos/{id}:
 *   get:
 *     summary: 특정 ToDo 가져오기
 *     description: 데이터베이스에서 특정 ID에 해당하는 ToDo를 가져옵니다.
 *     parameters:
 *       - name: id
 *         description: 가져올 ToDo의 ID
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: 성공적으로 ToDo를 가져왔을 때
 *       404:
 *         description: 요청한 ToDo를 찾을 수 없을 때
 *       500:
 *         description: 서버에서 오류가 발생했을 때
 */
app.get("/todos/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM todos WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).send("ToDo를 가져오는 중 오류가 발생했습니다.");
    } else if (!row) {
      res.status(404).send("해당 ID의 ToDo를 찾을 수 없습니다.");
    } else {
      res.json(row);
    }
  });
});

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: 새로운 ToDo 추가
 *     description: 데이터베이스에 새로운 ToDo를 추가합니다.
 *     parameters:
 *       - name: todo
 *         description: 추가할 ToDo 객체
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             description:
 *               type: string
 *             dueDate:
 *               type: string
 *               format: date-time
 *             isCompleted:
 *               type: boolean
 *     responses:
 *       201:
 *         description: ToDo가 성공적으로 추가되었을 때
 *       400:
 *         description: 클라이언트 요청이 잘못되었을 때
 */
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

/**
 * @swagger
 * /todos/{id}:
 *   put:
 *     summary: ToDo 업데이트
 *     description: 데이터베이스에 있는 특정 ToDo를 업데이트합니다.
 *     parameters:
 *       - name: id
 *         description: 업데이트할 ToDo의 ID
 *         in: path
 *         required: true
 *         type: integer
 *       - name: todo
 *         description: 업데이트할 ToDo 객체
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             description:
 *               type: string
 *             dueDate:
 *               type: string
 *               format: date-time
 *             isCompleted:
 *               type: boolean
 *     responses:
 *       200:
 *         description: ToDo가 성공적으로 업데이트되었을 때
 *       400:
 *         description: 클라이언트 요청이 잘못되었을 때
 */
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

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: ToDo 삭제
 *     description: 데이터베이스에서 특정 ToDo를 삭제합니다.
 *     parameters:
 *       - name: id
 *         description: 삭제할 ToDo의 ID
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: ToDo가 성공적으로 삭제되었을 때
 *       400:
 *         description: 클라이언트 요청이 잘못되었을 때
 */
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
