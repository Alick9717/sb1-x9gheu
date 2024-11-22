// Previous code remains the same until attachEventListeners method

  attachEventListeners() {
    this.container.querySelectorAll('input[type="range"], input[type="color"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const control = e.target.dataset.control;
        const value = e.target.type === 'range' ? parseFloat(e.target.value) : e.target.value;
        
        // Update label
        const label = e.target.previousElementSibling;
        if (label) {
          const baseText = label.textContent.split(':')[0];
          const displayValue = e.target.type === 'range' ? value : '';
          label.textContent = `${baseText}: ${displayValue}`;
        }

        // Create nested object structure for complex controls
        let detail;
        if (control.includes('.')) {
          const [category, param] = control.split('.');
          const existingValue = this.getCurrentValue(category) || {};
          detail = {
            type: category,
            value: {
              ...existingValue,
              [param]: value
            }
          };
        } else {
          detail = { type: control, value };
        }

        // Dispatch event for scene update
        window.dispatchEvent(new CustomEvent('controlsUpdate', { detail }));
      });
    });
  }

  getCurrentValue(category) {
    const controls = this.container.querySelectorAll(`[data-control^="${category}."]`);
    const value = {};
    controls.forEach(control => {
      const param = control.dataset.control.split('.')[1];
      value[param] = control.type === 'range' ? parseFloat(control.value) : control.value;
    });
    return value;
  }