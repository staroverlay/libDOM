/* Popup */
export function spawnPopup(
  title: string,
  message: string,
  severity: 'crit' | 'warn',
  duration?: number,
) {
  const popup = document.createElement('div');
  popup.classList.add('popup');
  popup.classList.add('popup-' + severity);

  const titleObj = document.createElement('h1');
  titleObj.innerText = title;
  popup.appendChild(titleObj);

  const messageObj = document.createElement('p');
  messageObj.innerText = message;
  popup.appendChild(messageObj);

  document.body.appendChild(popup);

  if (duration) {
    setTimeout(() => {
      popup.remove();
    }, duration);
  }
}

/* Error catcher */
window.addEventListener('error', (e) => {
  spawnPopup(e.error, e.message, 'crit');
});

/* DOM Injector */
export function injectContent(q: string, content: string) {
  const element = document.querySelector(q);
  if (!element) {
    throw new Error(`Element with query "${q}" not found`);
  }

  element.innerHTML = content;

  const scripts = Array.prototype.slice.call(
    element.getElementsByTagName('script'),
  );

  for (let i = 0; i < scripts.length; i++) {
    if (scripts[i].src != '') {
      const tag = document.createElement('script');
      tag.src = scripts[i].src;
      document.getElementsByTagName('head')[0].appendChild(tag);
    } else {
      eval(scripts[i].innerHTML);
    }
  }
}

export function renderIf(attribName: string, value: string | undefined | null) {
  if (!value) return;

  const query = `[${attribName}="${value}"]`;
  const elms = document.querySelectorAll<HTMLElement>(query);

  elms.forEach((elm) => {
    elm.style.display = 'inherit';
  });
}
