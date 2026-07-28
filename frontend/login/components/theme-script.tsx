export function ThemeScript() {
  const script = `
(function () {
  try {
    var stored = localStorage.getItem('ako-theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();`

  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
