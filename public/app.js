const chat = document.getElementById("chat");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("send");

let userId = localStorage.getItem("userId");

// 画面の最後会話日付
let lastDisplayedDate = "";

//テスト★
//addMessage("てすと★", false)

if (!userId) {
userId = crypto.randomUUID();
localStorage.setItem("userId", userId);
}

async function loadHistory() {

  const response =
    await fetch(`/history/${userId}`);

  const messages =
    await response.json();

  messages.forEach(msg => {

    addMessage(
      msg.content,
      msg.role === "user"
    );

  });

}

//DBから過去の発言を読み込んで表示
//loadHistory();

function addMessage(text, isUser) {

  if (isUser) {

    // 日付を画面に表示
    const today = new Date().toISOString().split("T")[0];

    if (today !== lastDisplayedDate) {
      addDateSeparator(today);
      lastDisplayedDate = today;
    }

    const div = document.createElement("div");
    div.className = "message user";
    div.textContent = text;

    chat.appendChild(div);
  } else {

    const row = document.createElement("div");
    row.className = "ai-row";

    const icon = document.createElement("div");
    icon.className = "ai-icon";

    const bubble = document.createElement("div");
    bubble.className = "ai-bubble";
    bubble.textContent = text;

    row.appendChild(icon);
    row.appendChild(bubble);

    chat.appendChild(row);
  }

  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {

  console.log("sendMessage開始");

  const message = messageInput.value.trim();

  if (!message) return;

  console.log("送信内容:", message);

  addMessage(message, true);

  messageInput.value = "";

  const response = await fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId,
      message
    })
  });

  console.log("fetch完了");

  const data = await response.json();

  console.log(data);

  addMessage(data.reply, false);
}

function addDateSeparator(dateText) {
  const div = document.createElement("div");
  div.className = "date-separator";

  const span = document.createElement("span");
  span.textContent = dateText;

  div.appendChild(span);

  chat.appendChild(div);
}

sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
  sendMessage();
  }
});
