export function createDrawer() {
  const drawer = document.querySelector('#drawer');
  const backdrop = document.querySelector('#drawer-backdrop');
  const content = document.querySelector('#drawer-content');
  const closeButton = document.querySelector('#drawer-close');

  function close() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.hidden = true;
  }

  function open(html) {
    content.innerHTML = html;
    backdrop.hidden = false;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
  }

  closeButton.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });

  return { open, close };
}
