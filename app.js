/**
 * Verainfacher – Material Design 3 Web App Mockup
 * Interaktive Logik für Kamera, Upload, Bildvorschau, Vereinfachung & Sprachausgabe
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM-Elemente
  const cameraActionBtn = document.getElementById('cameraActionBtn');
  const uploadActionBtn = document.getElementById('uploadActionBtn');
  const cameraInput = document.getElementById('cameraInput');
  const fileInput = document.getElementById('fileInput');
  const loadSampleBtn = document.getElementById('loadSampleBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // Views (Screens)
  const startView = document.getElementById('startView');
  const previewView = document.getElementById('previewView');
  const loadingView = document.getElementById('loadingView');
  const resultView = document.getElementById('resultView');

  // Preview & Result Elements
  const previewImage = document.getElementById('previewImage');
  const cancelPreviewBtn = document.getElementById('cancelPreviewBtn');
  const retakeBtn = document.getElementById('retakeBtn');
  const processBtn = document.getElementById('processBtn');
  const readAloudBtn = document.getElementById('readAloudBtn');
  const startOverBtn = document.getElementById('startOverBtn');

  /**
   * Wechselt die sichtbare Ansicht
   * @param {HTMLElement} targetView 
   */
  function switchView(targetView) {
    const views = [startView, previewView, loadingView, resultView];
    views.forEach(view => {
      if (view === targetView) {
        view.classList.add('active');
        view.removeAttribute('hidden');
      } else {
        view.classList.remove('active');
        view.setAttribute('hidden', '');
      }
    });

    // Fokus für Barrierefreiheit auf die neue Überschrift setzen
    const heading = targetView.querySelector('h1, h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  }

  /**
   * Lädt ein Bild und zeigt die Vorschau
   * @param {File|string} source 
   */
  function handleImageSource(source) {
    if (typeof source === 'string') {
      previewImage.src = source;
      switchView(previewView);
    } else if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.src = e.target.result;
        switchView(previewView);
      };
      reader.readAsDataURL(source);
    }
  }

  // Kamera-Knopf Klick
  cameraActionBtn.addEventListener('click', () => {
    cameraInput.click();
  });

  cameraInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageSource(e.target.files[0]);
    }
  });

  // Upload-Knopf Klick
  uploadActionBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageSource(e.target.files[0]);
    }
  });

  // Drag & Drop auf gesamtem Fenster
  window.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleImageSource(file);
      }
    }
  });

  // Beispiel-Dokument generieren (für Desktop-Tests ohne Kamera)
  loadSampleBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    // Weißer Brief-Hintergrund
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Briefkopf & Linien
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('Amt für Soziales und Wohnen', 60, 90);

    ctx.fillStyle = '#64748b';
    ctx.font = '18px sans-serif';
    ctx.fillText('Behördenweg 12, 10115 Berlin • Aktenzeichen: BK-2026-9921', 60, 130);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 150);
    ctx.lineTo(740, 150);
    ctx.stroke();

    // Betreff
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('Bescheid über die Mitwirkungspflicht', 60, 210);

    // Komplizierter Text (Behördendeutsch)
    ctx.font = '19px serif';
    ctx.fillStyle = '#1e293b';
    const textLines = [
      'Sehr geehrte Bürgerin, sehr geehrter Bürger,',
      '',
      'im Rahmen des Verwaltungsverfahrens gemäß § 60 SGB I werden Sie hiermit',
      'aufgefordert, die erforderlichen Angaben zur Feststellung der Anspruchs-',
      'voraussetzungen fristgerecht bis zum 15. Oktober darzulegen.',
      '',
      'Kommen Sie Ihrer Mitwirkungspflicht innerhalb der gesetzten Frist nicht nach,',
      'kann die Leistung bis zur Nachholung ganz oder teilweise versagt werden.',
      '',
      'Bitte nutzen Sie den beigefügten Erhebungsbogen und reichen Sie diesen',
      'unterzeichnet bei der oben genannten Dienststelle ein.',
      '',
      'Für Rückfragen erreichen Sie die zuständige Sachbearbeitung unter:',
      'Telefon: 030 / 123 456 78 (Mo-Fr 9-12 Uhr).'
    ];

    let y = 260;
    textLines.forEach(line => {
      ctx.fillText(line, 60, y);
      y += 34;
    });

    // Stempel-Mock
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.strokeRect(520, 720, 200, 90);
    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('AMT BEGLAUBIGT', 535, 760);
    ctx.font = '14px sans-serif';
    ctx.fillText('Eingegangen 2026', 560, 785);

    handleImageSource(canvas.toDataURL('image/png'));
  });

  // Vorschau abbrechen oder neu aufnehmen
  cancelPreviewBtn.addEventListener('click', () => {
    switchView(startView);
  });

  retakeBtn.addEventListener('click', () => {
    switchView(startView);
    cameraActionBtn.click();
  });

  // Text vereinfachen (Mockup Processing)
  processBtn.addEventListener('click', () => {
    switchView(loadingView);

    // Realistische Verzögerung für das KI-Mockup (1,5 Sekunden)
    setTimeout(() => {
      switchView(resultView);
    }, 1500);
  });

  // Text vorlesen (Web Speech API)
  readAloudBtn.addEventListener('click', () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Vorherige Wiedergabe stoppen
      
      const textToRead = `Worum geht es in dem Brief? 
      Erstens: Sie haben ein Schreiben von einem Amt bekommen. 
      Zweitens: Das Amt braucht bis zum 15. Oktober eine Antwort. 
      Drittens: Sie müssen ein Formular ausfüllen und unterschreiben. 
      Viertens: Wenn Sie Hilfe brauchen, können Sie dort anrufen. 
      Telefonnummer für Fragen: 0 3 0 1 2 3 4 5 6 7 8.`;

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9; // Etwas langsamer für bessere Verständlichkeit

      readAloudBtn.classList.add('reading');
      utterance.onend = () => {
        readAloudBtn.classList.remove('reading');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Ihr Browser unterstützt leider keine Sprachausgabe.');
    }
  });

  // Von vorne beginnen
  startOverBtn.addEventListener('click', () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    cameraInput.value = '';
    fileInput.value = '';
    previewImage.src = '';
    switchView(startView);
  });

  // Hoher Kontrast-Modus Toggle
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('high-contrast');
    const isHighContrast = document.body.classList.contains('high-contrast');
    themeToggleBtn.setAttribute('aria-pressed', isHighContrast);
  });

  // Material Ripple Effekt für interaktive Buttons
  document.querySelectorAll('.m3-ripple').forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${e.clientX - rect.left - radius}px`;
      ripple.style.top = `${e.clientY - rect.top - radius}px`;
      ripple.classList.add('ripple-wave');

      const existingRipple = btn.querySelector('.ripple-wave');
      if (existingRipple) {
        existingRipple.remove();
      }

      btn.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
});
