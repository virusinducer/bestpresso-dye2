  if (!window.bpSlider) return bpOrigMakeValueEditable(valueId, min, max, formatter, onChange);
  const valEl = document.getElementById(valueId);
  if (!valEl || valEl.dataset.editable) return;
  valEl.dataset.editable = '1';
  valEl.style.cursor = 'pointer';
  valEl.addEventListener('click', (e) => {
    e.stopPropagation();
    window.bpSlider.openField(valueId, valEl, min, max, formatter, (v) => {
      valEl.textContent = formatter(v);
      if (typeof onChange === 'function') onChange(v);
      else if (typeof syncPresetActive === 'function') syncPresetActive(valueId.replace('-value', ''), formatter(v));
    });
  });
}
function bpOrigMakeValueEditable(valueId, min, max, formatter, onChange) {
