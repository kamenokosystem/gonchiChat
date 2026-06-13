const express = require("express");
const OpenAI = require("openai");
const dotenv = require("dotenv");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

dotenv.config();

const app = express();

const db = new sqlite3.Database("./rin.db");

app.use(express.json());
app.use(express.static("public"));

const client = new OpenAI({
apiKey: process.env.OPENAI_API_KEY
});


// 凛の人格設定を読み込む
const rinPrompt = fs.readFileSync(
"./prompt/rin.txt",
"utf8"
);


// 仮の会話履歴保存（サーバ再起動で消える）
const conversations = {};

/*
app.get("/history/:userId", (req, res) => {

  db.all(
    `
    SELECT role, content
    FROM messages
    WHERE user_id = ?
    ORDER BY id
    `,
    [req.params.userId],
    (err, rows) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json(rows);
    }
  );

});
*/

app.post("/chat", async (req, res) => {
try {
const { userId, message } = req.body;

if (!userId || !message) {
  return res.status(400).json({
    error: "userId と message が必要です"
  });
}


// 初回なら履歴作成
if (!conversations[userId]) {
  conversations[userId] = [];
}

// ユーザー発言を追加
conversations[userId].push({
  role: "user",
  content: message
});

/*
db.run(
  `INSERT INTO messages(user_id, role, content)
   VALUES (?, ?, ?)`,
  [userId, "user", message]
);
*/

// AIのレスポンス取得
const response = await client.responses.create({
  model: "gpt-5",
  input: [
    {
      role: "system",
      content: rinPrompt
    },
    ...conversations[userId]
  ]
});


const reply = response.output_text;


// AIの返答も履歴に追加
conversations[userId].push({
  role: "assistant",
  content: reply
});


/*
db.run(
  `INSERT INTO messages(user_id, role, content)
   VALUES (?, ?, ?)`,
  [userId, "assistant", reply]
);
*/

res.json({
  reply
});

} catch (error) {
console.error(error);

res.status(500).json({
  error: "AIとの通信でエラーが発生しました"
});

}
});


app.get("/", (req, res) => {
res.send("Rin Chat Server Running");
});


app.listen(3000, () => {
console.log("Server Started");
});