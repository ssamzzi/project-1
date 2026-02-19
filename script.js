(function () {
  const message = 'Hello, World!\nYour site is working.';
  const target = document.getElementById('message');
  if (target) {
    target.textContent = message;
  }
})();
