/**
 * Theme controls — wires up the "Aa" panel.
 *
 * Three independent radiogroups (theme, size, font) update <html> / <body>
 * data attributes and persist to localStorage. The anti-FOUC bootstrap
 * inlined in BaseLayout has already applied any saved values before this
 * runs, so initialization is just about syncing aria-checked state and
 * binding event listeners.
 */

type ControlKey = 'theme' | 'size' | 'font';

const STORAGE_KEYS: Record<ControlKey, string> = {
  theme: 'ec-theme',
  size: 'ec-size',
  font: 'ec-font',
};

const DEFAULTS: Record<ControlKey, string> = {
  theme: 'auto',
  size: 'default',
  font: 'sans',
};

function getCurrentValue(key: ControlKey): string {
  try {
    return localStorage.getItem(STORAGE_KEYS[key]) ?? DEFAULTS[key];
  } catch {
    return DEFAULTS[key];
  }
}

function applyValue(key: ControlKey, value: string): void {
  const target = key === 'font' ? document.body : document.documentElement;
  const attr = `data-${key}`;
  const isDefault = value === DEFAULTS[key];
  if (isDefault) {
    target.removeAttribute(attr);
  } else {
    target.setAttribute(attr, value);
  }
  try {
    localStorage.setItem(STORAGE_KEYS[key], value);
  } catch {
    // localStorage indisponível — segue só com o atributo aplicado
  }
}

function detectKey(button: HTMLElement): ControlKey | null {
  if (button.dataset.theme !== undefined) return 'theme';
  if (button.dataset.size !== undefined) return 'size';
  if (button.dataset.font !== undefined) return 'font';
  return null;
}

function syncRadioGroup(group: HTMLElement, currentValue: string): void {
  const buttons = group.querySelectorAll<HTMLButtonElement>('[role=radio]');
  buttons.forEach((btn) => {
    const key = detectKey(btn);
    if (!key) return;
    const value = btn.dataset[key];
    btn.setAttribute('aria-checked', String(value === currentValue));
    btn.tabIndex = value === currentValue ? 0 : -1;
  });
}

function bindRadioGroup(group: HTMLElement): void {
  const buttons = Array.from(
    group.querySelectorAll<HTMLButtonElement>('[role=radio]')
  );
  if (buttons.length === 0) return;

  const firstKey = detectKey(buttons[0]!);
  if (!firstKey) return;

  syncRadioGroup(group, getCurrentValue(firstKey));

  buttons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const key = detectKey(btn);
      if (!key) return;
      const value = btn.dataset[key]!;
      applyValue(key, value);
      syncRadioGroup(group, value);
    });

    btn.addEventListener('keydown', (event) => {
      const key = event.key;
      let nextIndex: number | null = null;
      if (key === 'ArrowRight' || key === 'ArrowDown') {
        nextIndex = (index + 1) % buttons.length;
      } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
        nextIndex = (index - 1 + buttons.length) % buttons.length;
      } else if (key === 'Home') {
        nextIndex = 0;
      } else if (key === 'End') {
        nextIndex = buttons.length - 1;
      }
      if (nextIndex !== null) {
        event.preventDefault();
        const next = buttons[nextIndex]!;
        next.focus();
        next.click();
      }
    });
  });
}

function bindPanelToggle(): void {
  const trigger = document.getElementById('aa-trigger');
  const panel = document.getElementById('aa-panel');
  if (!trigger || !panel) return;

  const open = () => {
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    const firstFocus = panel.querySelector<HTMLElement>('[role=radio][aria-checked=true]')
      ?? panel.querySelector<HTMLElement>('[role=radio]');
    firstFocus?.focus();
  };

  const close = (returnFocus = true) => {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger.focus();
  };

  trigger.addEventListener('click', () => {
    if (panel.hidden) open(); else close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) {
      event.stopPropagation();
      close();
    }
  });

  document.addEventListener('click', (event) => {
    if (panel.hidden) return;
    const target = event.target as Node;
    if (panel.contains(target) || trigger.contains(target)) return;
    close(false);
  });
}

function init(): void {
  document
    .querySelectorAll<HTMLElement>('[data-aa-radiogroup]')
    .forEach(bindRadioGroup);
  bindPanelToggle();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
