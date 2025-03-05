const chatLog = document.getElementById('chat-log');
const usernameInput = document.getElementById('username');
const chatInput = document.getElementById('chat-input');
const fileInput = document.getElementById('file-input');
const chatSend = document.getElementById('chat-send');

let messages = [];

// Load messages from LocalStorage
if (localStorage.getItem('messages')) {
  messages = JSON.parse(localStorage.getItem('messages'));
  messages.forEach((message) => {
    chatLog.innerHTML += `
      <li>
        <span>${message.username}:</span>
        <span>${message.message}</span>
        ${message.file ? `<img src="${URL.createObjectURL(message.file)}" />` : ''}
      </li>
    `;
  });
}

chatSend.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const message = chatInput.value.trim();
  const file = fileInput.files[0];

  if (username !== '' && message !== '') {
    const messageObject = {
      username: username,
      message: message,
      file: file,
    };

    messages.push(messageObject);
    chatLog.innerHTML += `
      <li>
        <span>${messageObject.username}:</span>
        <span>${messageObject.message}</span>
        ${messageObject.file ? `<img src="${URL.createObjectURL(messageObject.file)}" />` : ''}
      </li>
    `;

    // Save messages to LocalStorage
    localStorage.setItem('messages', JSON.stringify(messages));

    chatInput.value = '';
    fileInput.value = '';
  }
});