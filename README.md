NANBAN - AI-Powered PDF Assistant

NANBAN is a web application that allows users to upload PDF documents and ask questions about their content. Using OpenAI’s API, it generates accurate answers based on the uploaded PDF content. This project demonstrates a clean, modern frontend with a Python Flask backend for AI-powered responses.

Features

Upload PDF documents easily via drag & drop or file selection.

View uploaded file information instantly.

Ask questions about the PDF content and get AI-generated answers.

Elegant and responsive UI with subtle neon effects and a prominent answer box.

Lightweight and easy-to-use interface.

Frontend

index.html – Main webpage structure.

style.css – Styling including subtle neon NANBAN title, answer box, and upload box.

script.js – Handles PDF upload, question sending, and displaying AI answers.

bg.jpg – Optional background image for aesthetics.

Backend

app.py – Flask backend server that handles PDF text extraction and communicates with OpenAI API.

requirements.txt – Python dependencies: flask, flask-cors, openai, pymupdf.

.env – Optional: store your OpenAI API key securely.

uploads/ – Optional folder to store PDFs temporarily.
