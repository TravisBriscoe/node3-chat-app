const socket = io();

// socket.on('countUpdated', count => {
//   console.log('the count has been updated', count);
// });

// const incrementBtn = document.querySelector('#increment');

// incrementBtn.addEventListener('click', () => {
//   socket.emit('increment');
// });

// elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationBtn = document.querySelector('#location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector(
  '#location-message-template'
).innerHTML;

// const chatLog = document.querySelector('#chat-space');
// chatLog.innerText = '';

socket.on('message', message => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format('HH:mm:ss'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', url => {
  const html = Mustache.render(locationMessageTemplate, {
    url: url.url,
    createdAt: moment(url.createdAt).format('HH:mm:ss'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

$messageForm.addEventListener('submit', e => {
  e.preventDefault();
  // disable form
  $messageFormButton.setAttribute('disabled', 'disabled');

  socket.emit('sendMessage', $messageFormInput.value, error => {
    // re-enable form
    $messageFormButton.removeAttribute('disabled', 'disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log('The Message was delivered!');
  });
});

$locationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.');
  }

  $locationBtn.setAttribute('disabled', 'disabled');
  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      'sendLocation',
      {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
      () => {
        $locationBtn.removeAttribute('disabled', 'disabled');
        console.log('Location shared!');
      }
    );
  });
});
