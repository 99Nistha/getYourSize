const btn    = document.getElementById('activate-btn');
const status = document.getElementById('status');

function setStatus(msg, type = '') {
  status.textContent = msg;
  status.className   = `status ${type}`;
}

btn.addEventListener('click', async () => {
  btn.disabled = true;
  setStatus('Injecting widget…', 'loading');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check we're on a real web page (not chrome://, about:, etc.)
    if (!tab.url?.startsWith('http')) {
      setStatus('Open a fashion product page first.', 'error');
      btn.disabled = false;
      return;
    }

    // Check if already injected
    const [already] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func:   () => !!document.getElementById('gys-trigger'),
    });

    if (already?.result) {
      setStatus('Already active on this page ✓', 'ok');
      btn.disabled = false;
      return;
    }

    // Inject the widget
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files:  ['getyoursize.js'],
    });

    setStatus('Done! Look for the 📐 button on the page.', 'ok');

  } catch (err) {
    console.error(err);
    setStatus('Could not inject — try refreshing the page.', 'error');
    btn.disabled = false;
  }
});
