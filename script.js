const API_URL = "http://127.0.0.1:5001";
const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");
const fileInfo = document.getElementById("fileInfo");
const answerBox = document.getElementById("answerBox");
const questionInput = document.getElementById("question");
const sendBtn = document.getElementById("sendBtn");

let pdfText = "";


uploadBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadBox.classList.add("dragover");
});

uploadBox.addEventListener("dragleave", (e) => {
  e.preventDefault();
  uploadBox.classList.remove("dragover");
});

uploadBox.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadBox.classList.remove("dragover");
  if (e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
});


uploadBox.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
});


function showError(msg) {
  answerBox.innerHTML = `<p style="color:red;">❌ ${msg}</p>`;
}


function showLoading(msg) {
  answerBox.innerHTML = `<p>⏳ ${msg}</p>`;
}


async function handleFile(file) {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    showError("Please upload a PDF file");
    return;
  }

  fileInfo.textContent = `✓ ${file.name} selected`;
  showLoading("Extracting PDF...");

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/extract_pdf`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (res.ok && data.success) {
      pdfText = data.text;
      answerBox.innerHTML = `
        <div>
          <h3>✓ PDF Extracted Successfully!</h3>
          <p><strong>Pages:</strong> ${data.pages}</p>
          <p>You can now ask questions.</p>
        </div>`;
      questionInput.disabled = false;
      sendBtn.disabled = false;
      questionInput.focus();
    } else {
      showError(data.error || "Failed to extract PDF");
    }
  } catch (err) {
    console.error(err);
    showError("Backend not reachable. Start Flask server.");
  }
}

async function handleSendQuestion() {
  const question = questionInput.value.trim();
  if (!question) return;

  if (!pdfText) {
    showError("Upload a PDF first");
    return;
  }

  showLoading("Analyzing PDF...");
  questionInput.disabled = true;
  sendBtn.disabled = true;

  try {
    const response = await fetch(`${API_URL}/ask_question`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, context: pdfText })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      answerBox.innerHTML = `
        <div>
          <h3>🤖 Answer:</h3>
          <p>${data.answer}</p>
        </div>`;
      questionInput.value = "";
    } else {
      showError(data.error || "Failed to get answer");
    }
  } catch (err) {
    console.error(err);
    showError("Backend not reachable. Start Flask server.");
  } finally {
    questionInput.disabled = false;
    sendBtn.disabled = false;
    questionInput.focus();
  }
}


sendBtn.addEventListener("click", handleSendQuestion);
questionInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSendQuestion();
});
