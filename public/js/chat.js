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
const $sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector(
  '#location-message-template'
).innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible Height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on('message', message => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('HH:mm:ss'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('locationMessage', url => {
  const html = Mustache.render(locationMessageTemplate, {
    username: url.username,
    url: url.url,
    createdAt: moment(url.createdAt).format('HH:mm:ss'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
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

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  $sidebar.innerHTML = html;
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

socket.emit('join', { username, room }, error => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
