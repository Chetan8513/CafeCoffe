import { appConfig } from './data/config.js';

const state = {
  screen: 'ticket',
  noAttempts: 0,
  currentStep: 0,
  vibe: 'Coffee',
  selectedPlace: null,
  date: '',
  time: '5:30 PM',
  note: '',
  weather: 'Choose a date and place to see the weather.',
  emailAttempted: false,
};

const elements = {
  ticketCard: document.getElementById('ticketCard'),
  unlockTicketBtn: document.getElementById('unlockTicketBtn'),
  questionScreen: document.getElementById('questionScreen'),
  typewriterLine: document.getElementById('typewriterLine'),
  questionText: document.getElementById('questionText'),
  yesBtn: document.getElementById('yesBtn'),
  noBtn: document.getElementById('noBtn'),
  noResponse: document.getElementById('noResponse'),
  maybeLaterBtn: document.getElementById('maybeLaterBtn'),
  goodbyeScreen: document.getElementById('goodbyeScreen'),
  goodbyeBackBtn: document.getElementById('goodbyeBackBtn'),
  planScreen: document.getElementById('planScreen'),
  planBackBtn: document.getElementById('planBackBtn'),
  planPrevBtn: document.getElementById('planPrevBtn'),
  planNextBtn: document.getElementById('planNextBtn'),
  choiceStage: document.getElementById('choiceStage'),
  vibeButtons: [...document.querySelectorAll('[data-vibe]')],
  stepPanels: [...document.querySelectorAll('.step-panel')],
  dots: [...document.querySelectorAll('.dot')],
  useLocationBtn: document.getElementById('useLocationBtn'),
  placeSearch: document.getElementById('placeSearch'),
  placeList: document.getElementById('placeList'),
  placeMap: document.getElementById('placeMap'),
  dateInput: document.getElementById('dateInput'),
  forecastText: document.getElementById('forecastText'),
  noteInput: document.getElementById('noteInput'),
  timeChips: [...document.querySelectorAll('.time-chip')],
  confirmationScreen: document.getElementById('confirmationScreen'),
  summaryVibe: document.getElementById('summaryVibe'),
  summaryDate: document.getElementById('summaryDate'),
  summaryTime: document.getElementById('summaryTime'),
  summaryPlace: document.getElementById('summaryPlace'),
  aiComment: document.getElementById('aiComment'),
  calendarBtn: document.getElementById('calendarBtn'),
  mapsBtn: document.getElementById('mapsBtn'),
  emailStatus: document.getElementById('emailStatus'),
  whatsappFallbackBtn: document.getElementById('whatsappFallbackBtn'),
  confettiCanvas: document.getElementById('confettiCanvas'),
};

let mapInstance = null;
let mapMarkers = [];
let confettiParticles = [];
let typingTimer = null;

function showScreen(screenName) {
  state.screen = screenName;
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.toggle('active', screen.id === `${screenName}Screen`);
  });
}

function formatDateForDisplay(dateString) {
  if (!dateString) return 'TBD';
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatTimeDisplay(timeValue) {
  return timeValue || '5:30 PM';
}

function getTodayIso() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function setDefaultDate() {
  const dateInput = elements.dateInput;
  dateInput.min = getTodayIso();
  dateInput.value = getTodayIso();
  state.date = getTodayIso();
}

function animateTypewriter() {
  const lines = [
    'Hey Tejashri 🙂 I have one important question…',
    'Will you have coffee with me?',
  ];

  if (typingTimer) {
    clearTimeout(typingTimer);
  }

  let lineIndex = 0;
  let charIndex = 0;
  let current = '';

  elements.typewriterLine.textContent = '';
  elements.questionText.textContent = '';

  const typeNext = () => {
    const currentLine = lines[lineIndex];
    if (charIndex <= currentLine.length) {
      current = currentLine.slice(0, charIndex);
      elements.typewriterLine.textContent = current;
      charIndex += 1;
      typingTimer = setTimeout(typeNext, 42);
      return;
    }

    if (lineIndex < lines.length - 1) {
      lineIndex += 1;
      charIndex = 0;
      current = '';
      elements.typewriterLine.textContent = '';
      setTimeout(() => {
        elements.questionText.textContent = lines[lineIndex];
      }, 170);
      typingTimer = setTimeout(typeNext, 260);
      return;
    }

    elements.questionText.textContent = lines[1];
  };

  elements.typewriterLine.textContent = '';
  elements.questionText.textContent = lines[0];
  typeNext();
}

function resetNoChoice() {
  state.noAttempts = 0;
  elements.noBtn.textContent = 'No';
  elements.noBtn.classList.remove('hidden');
  elements.noResponse.textContent = '';
  elements.noResponse.classList.add('hidden');
  elements.noResponse.classList.remove('blink');
  elements.maybeLaterBtn.classList.add('hidden');
}

function handleNoChoice() {
  const responses = [
    'Think again? 🤔',
    'One more thought? ☕',
    'Are you sure?',
    'No pressure at all 🙂',
    'I’ll understand either way.',
    'Could I tempt you with a cozy coffee? ☕',
  ];

  if (state.noAttempts < responses.length) {
    elements.noBtn.textContent = responses[state.noAttempts];
    state.noAttempts += 1;
    return;
  }

  elements.noBtn.classList.add('hidden');
  elements.noResponse.textContent = 'Okay, I understand 😔';
  elements.noResponse.classList.remove('hidden');
  elements.noResponse.classList.add('blink');
  elements.maybeLaterBtn.classList.remove('hidden');
}

function advanceToPlan() {
  const summary = document.getElementById('summaryVibe');
  if (summary) {
    summary.textContent = state.vibe;
  }
  showScreen('plan');
  renderPlanStep();
}

function renderPlanStep() {
  elements.stepPanels.forEach((panel) => {
    panel.classList.toggle('active', Number(panel.dataset.step) === state.currentStep);
  });

  elements.dots.forEach((dot) => {
    dot.classList.toggle('active', Number(dot.dataset.step) === state.currentStep);
  });

  const planFirstButton = document.getElementById('planPrevBtn');
  const planNextButton = document.getElementById('planNextBtn');
  planFirstButton.disabled = state.currentStep === 0;
  planFirstButton.style.opacity = state.currentStep === 0 ? '0.45' : '1';

  if (state.currentStep === 2) {
    planNextButton.textContent = 'Finish';
  } else {
    planNextButton.textContent = 'Next';
  }
}

function moveToNextStep() {
  if (state.currentStep < 2) {
    state.currentStep += 1;
    renderPlanStep();
    return;
  }

  finalizeConfirmation();
}

function moveToPreviousStep() {
  if (state.currentStep > 0) {
    state.currentStep -= 1;
    renderPlanStep();
  } else {
    showScreen('question');
  }
}

function updateVibeSelection(nextValue) {
  state.vibe = nextValue;
  elements.vibeButtons.forEach((button) => {
    button.classList.toggle('selected', button.dataset.vibe === nextValue);
  });
}

function renderPlaceList(items) {
  const listMarkup = items
    .map((item) => {
      const isSelected = state.selectedPlace && state.selectedPlace.name === item.name;
      return `
        <button
          type="button"
          class="place-item ${isSelected ? 'selected' : ''}"
          data-name="${item.name}"
          data-lat="${item.lat}"
          data-lon="${item.lon}"
          data-address="${escapeHtml(item.address || 'Pune')}"
        >
          <span class="place-name">${escapeHtml(item.name)}</span>
          <small>${escapeHtml(item.address || 'Pune')}</small>
        </button>
      `;
    })
    .join('');

  elements.placeList.innerHTML = listMarkup;

  elements.placeList.querySelectorAll('.place-item').forEach((button) => {
    button.addEventListener('click', () => {
      const selected = {
        name: button.dataset.name,
        lat: Number(button.dataset.lat),
        lon: Number(button.dataset.lon),
        address: button.dataset.address,
      };
      state.selectedPlace = selected;
      renderPlaceList(items);
      updateMapSelection(selected, items);
      elements.summaryPlace.textContent = selected.name;
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initializeMap(lat, lon) {
  if (!mapInstance) {
    mapInstance = L.map(elements.placeMap, { zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance);
  }

  mapInstance.setView([lat, lon], 13);
}

function updateMapSelection(selected, items) {
  if (!mapInstance) return;

  mapMarkers.forEach((marker) => marker.remove());
  mapMarkers = [];

  items.forEach((item) => {
    const marker = L.marker([item.lat, item.lon]).addTo(mapInstance);
    marker.bindPopup(`<strong>${item.name}</strong><br>${item.address || 'Pune'}`);
    if (selected && item.name === selected.name) {
      marker.openPopup();
    }
    mapMarkers.push(marker);
  });
}

function getNearbyPlaces(lat, lon) {
  const query = `
    [out:json][timeout:15];
    (
      node(around:3000,${lat},${lon})[amenity=cafe];
      way(around:3000,${lat},${lon})[amenity=cafe];
      relation(around:3000,${lat},${lon})[amenity=cafe];
    );
    out center 20;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  return fetchWithTimeout(url, { method: 'GET' }, 8000)
    .then((response) => response.json())
    .then((data) => {
      const nodes = data.elements
        .filter((element) => element.tags && element.tags.name)
        .map((element) => {
          const latValue = element.lat ?? (element.center && element.center.lat);
          const lonValue = element.lon ?? (element.center && element.center.lon);
          return {
            name: element.tags.name,
            address: element.tags['addr:street'] || element.tags['addr:city'] || 'Near you',
            lat: Number(latValue),
            lon: Number(lonValue),
          };
        });

      if (nodes.length) {
        const suggestions = nodes.slice(0, 6);
        renderPlaceList(suggestions);
        initializeMap(lat, lon);
        updateMapSelection(suggestions[0], suggestions);
        state.selectedPlace = suggestions[0];
        elements.summaryPlace.textContent = suggestions[0].name;
        return suggestions;
      }

      return [];
    })
    .catch(() => []);
}

function searchNominatim(query) {
  const target = query.trim();
  if (!target) {
    return Promise.resolve([]);
  }

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(`${target} cafe Pune`)}`;

  return fetchWithTimeout(
    url,
    {
      method: 'GET',
      headers: {
        'Accept-Language': 'en',
      },
    },
    7000,
  )
    .then((response) => response.json())
    .then((items) =>
      items.map((item) => ({
        name: item.name,
        address: item.display_name,
        lat: Number(item.lat),
        lon: Number(item.lon),
      })),
    )
    .catch(() => []);
}

function loadFavoritePlaces() {
  const favoritePlaces = appConfig.favoritePlaces || [];
  if (favoritePlaces.length) {
    renderPlaceList(favoritePlaces);
    const firstPlace = favoritePlaces[0];
    initializeMap(firstPlace.lat, firstPlace.lon);
    updateMapSelection(firstPlace, favoritePlaces);
    state.selectedPlace = firstPlace;
    elements.summaryPlace.textContent = firstPlace.name;
  }
}

function fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal })
    .then((response) => {
      clearTimeout(timer);
      return response;
    })
    .catch((error) => {
      clearTimeout(timer);
      throw error;
    });
}

async function useCurrentLocation() {
  if (!navigator.geolocation) {
    loadFavoritePlaces();
    return;
  }

  const locationPromise = new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 600000,
    });
  });

  try {
    const position = await locationPromise;
    const { latitude, longitude } = position.coords;
    initializeMap(latitude, longitude);
    const places = await getNearbyPlaces(latitude, longitude);

    if (places.length > 0) {
      state.selectedPlace = places[0];
      elements.summaryPlace.textContent = places[0].name;
      return;
    }

    loadFavoritePlaces();
  } catch (error) {
    loadFavoritePlaces();
  }
}

function bindPlanEvents() {
  elements.planBackBtn.addEventListener('click', () => {
    showScreen('question');
  });

  elements.planPrevBtn.addEventListener('click', moveToPreviousStep);
  elements.planNextBtn.addEventListener('click', moveToNextStep);

  elements.vibeButtons.forEach((button) => {
    button.addEventListener('click', () => updateVibeSelection(button.dataset.vibe));
  });

  elements.useLocationBtn.addEventListener('click', useCurrentLocation);

  elements.placeSearch.addEventListener('input', (event) => {
    const query = event.target.value;
    clearTimeout(window.placeSearchTimer);
    window.placeSearchTimer = setTimeout(async () => {
      const suggestions = await searchNominatim(query);
      if (suggestions.length) {
        renderPlaceList(suggestions);
        const first = suggestions[0];
        initializeMap(first.lat, first.lon);
        updateMapSelection(first, suggestions);
        state.selectedPlace = first;
        elements.summaryPlace.textContent = first.name;
      } else if (!query.trim()) {
        loadFavoritePlaces();
      }
    }, 350);
  });

  elements.timeChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      state.time = chip.dataset.time;
      elements.timeChips.forEach((item) => {
        item.classList.toggle('selected', item === chip);
      });
      elements.summaryTime.textContent = state.time;
    });
  });

  elements.dateInput.addEventListener('change', (event) => {
    state.date = event.target.value;
    elements.summaryDate.textContent = formatDateForDisplay(state.date);
    fetchWeatherForecast();
  });

  elements.noteInput.addEventListener('input', (event) => {
    state.note = event.target.value;
  });
}

async function fetchWeatherForecast() {
  const chosenDate = state.date || getTodayIso();

  if (!state.selectedPlace) {
    elements.forecastText.textContent = 'Choose a place first to see the local weather.';
    return;
  }

  const lat = state.selectedPlace.lat;
  const lon = state.selectedPlace.lon;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&start_date=${chosenDate}&end_date=${chosenDate}`;

  try {
    const response = await fetchWithTimeout(url, { method: 'GET' }, 8000);
    const data = await response.json();

    if (!data.daily || !data.daily.temperature_2m_max) {
      throw new Error('No forecast data');
    }

    const max = data.daily.temperature_2m_max[0];
    const min = data.daily.temperature_2m_min[0];
    const rain = data.daily.precipitation_probability_max[0];
    state.weather = `High ${Math.round(max)}°C • Low ${Math.round(min)}°C • Rain ${rain}%`;
    elements.forecastText.textContent = `${state.weather} on ${formatDateForDisplay(chosenDate)}.`;
  } catch (error) {
    state.weather = 'Weather service is unavailable right now, but the coffee plan is still on.';
    elements.forecastText.textContent = state.weather;
  }
}

function finalizeConfirmation() {
  const planSummary = {
    vibe: state.vibe,
    date: formatDateForDisplay(state.date),
    time: formatTimeDisplay(state.time),
    place: state.selectedPlace ? state.selectedPlace.name : 'A cosy café nearby',
  };

  elements.summaryVibe.textContent = planSummary.vibe;
  elements.summaryDate.textContent = planSummary.date;
  elements.summaryTime.textContent = planSummary.time;
  elements.summaryPlace.textContent = planSummary.place;

  if (!state.selectedPlace) {
    state.selectedPlace = {
      name: 'A cozy café near you',
      lat: 18.5204,
      lon: 73.8567,
      address: 'Pune',
    };
  }

  showScreen('confirmation');
  launchConfetti();
  buildAiComment();
  if (!state.emailAttempted) {
    sendConfirmationEmailSafely();
  }
}

function buildAiComment() {
  elements.aiComment.textContent = appConfig.aiFallbackComment;
}

function launchConfetti() {
  const canvas = elements.confettiCanvas;
  const context = canvas.getContext('2d');
  const colors = ['#f7d58b', '#f0b54f', '#ffefe1', '#c97d6d', '#9cc0bf'];
  const pieceCount = 140;

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  resize();
  confettiParticles = Array.from({ length: pieceCount }, () => ({
    x: canvas.width / 2,
    y: canvas.height * 0.18,
    size: 6 + Math.random() * 8,
    rotation: Math.random() * Math.PI,
    speedX: (Math.random() - 0.5) * 8,
    speedY: 2 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  const render = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    confettiParticles.forEach((piece) => {
      piece.x += piece.speedX;
      piece.y += piece.speedY;
      piece.speedY += 0.06;
      piece.rotation += 0.1;

      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 1.3);
      context.restore();
    });

    if (confettiParticles.some((piece) => piece.y < canvas.height + 20)) {
      requestAnimationFrame(render);
    }
  };

  render();
}

function buildCalendarEntry() {
  const selectedDate = state.date || getTodayIso();
  const selectedTime = state.time || '5:30 PM';
  const dateValue = new Date(`${selectedDate}T${selectedTimeTo24(selectedTime)}:00`);
  const endDate = new Date(dateValue.getTime() + 60 * 60 * 1000);

  const formatIcsDate = (value) =>
    value
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, 'Z');

  const mapQuery = encodeURIComponent(`${state.selectedPlace?.name || 'Coffee place'} ${state.selectedPlace?.address || 'Pune'}`);
  const description = `Coffee date with ${appConfig.herName}. Vibe: ${state.vibe}. Note: ${state.note || 'No notes'}.`;

  return `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:coffee-${Date.now()}@cafeclick\nDTSTAMP:${formatIcsDate(new Date())}\nDTSTART:${formatIcsDate(dateValue)}\nDTEND:${formatIcsDate(endDate)}\nSUMMARY:Coffee with ${appConfig.herName}\nLOCATION:${state.selectedPlace?.name || 'A cozy café'}\nDESCRIPTION:${description}\nURL:https://www.google.com/maps/search/?api=1&query=${mapQuery}\nEND:VEVENT\nEND:VCALENDAR`;
}

function timeTo24(timeValue) {
  const [rawTime, modifier] = timeValue.split(' ');
  let [hours, minutes] = rawTime.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function selectedTimeTo24(timeValue) {
  const value = timeValue || '5:30 PM';
  return timeTo24(value);
}

function downloadCalendarFile() {
  const content = buildCalendarEntry();
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'coffee-date.ics';
  anchor.click();
  URL.revokeObjectURL(url);
}

function openMapsLink() {
  const placeName = state.selectedPlace ? state.selectedPlace.name : 'coffee shop';
  const query = encodeURIComponent(`${placeName} Pune`);
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
}

function buildEmailTemplatePayload() {
  const place = state.selectedPlace ? state.selectedPlace.name : 'A cozy café nearby';
  const date = formatDateForDisplay(state.date);
  const time = formatTimeDisplay(state.time);
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${state.selectedPlace?.name || 'coffee'} ${state.selectedPlace?.address || 'Pune'}`)}`;
  const note = state.note || 'No note';
  const whatsappLink = `https://wa.me/${appConfig.whatsappNumber}?text=${encodeURIComponent(`Hi! ${appConfig.herName} said yes for coffee. Vibe: ${state.vibe}. Date: ${date} at ${time}. Place: ${place}.`)}`;

  const palette = {
    page_bg: '#fdeef3',
    header_solid: '#b3204f',
    header_gradient: 'linear-gradient(135deg,#8e1745 0%,#ff6b8b 100%)',
    header_text: '#ffe3ea',
    accent: '#d62f60',
    soft: '#fff0f4',
    line: '#ffc2d1',
    ink: '#3a0f1f',
    muted: '#a8707f',
    btn_bg: '#3a0f1f',
    btn_text: '#ffffff',
    pill_bg: '#ffc857',
    pill_text: '#3a0f1f',
    footer_bg: '#fff6f8',
  };

  const answerHtml = `
    <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="background:#ffffff;border:2px dashed ${palette.line};border-radius:18px;margin-bottom:16px;">
      <tr><td align="center" style="padding:24px 16px 8px;">
        <div style="color:${palette.muted};font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">The Date</div>
        <div style="color:${palette.ink};font-size:30px;font-weight:700;margin-top:8px;">${date}</div>
      </td></tr>
      <tr><td align="center" style="padding:6px 16px 26px;">
        <span style="display:inline-block;background:${palette.pill_bg};color:${palette.pill_text};font-size:20px;font-weight:700;padding:10px 28px;border-radius:999px;">🕒 ${time}</span>
      </td></tr>
    </table>
    <div style="background:${palette.soft};border-radius:14px;padding:16px 18px;margin-bottom:12px;">
      <div style="color:${palette.accent};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Plan</div>
      <div style="color:${palette.ink};font-size:18px;font-weight:600;margin-top:6px;">${state.vibe}</div>
    </div>
    <div style="background:${palette.soft};border-radius:14px;padding:16px 18px;margin-bottom:12px;">
      <div style="color:${palette.accent};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">📍 Place</div>
      <div style="color:${palette.ink};font-size:18px;font-weight:600;margin-top:6px;">${place}</div>
    </div>
    <div style="background:${palette.soft};border-radius:14px;padding:16px 18px;margin-bottom:12px;">
      <div style="color:${palette.accent};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Weather</div>
      <div style="color:${palette.ink};font-size:18px;font-weight:600;margin-top:6px;">${state.weather}</div>
    </div>`;

  return {
    palette: appConfig.palette || 'rose',
    page_bg: palette.page_bg,
    header_solid: palette.header_solid,
    header_gradient: palette.header_gradient,
    header_text: palette.header_text,
    accent: palette.accent,
    soft: palette.soft,
    line: palette.line,
    ink: palette.ink,
    muted: palette.muted,
    btn_bg: palette.btn_bg,
    btn_text: palette.btn_text,
    pill_bg: palette.pill_bg,
    pill_text: palette.pill_text,
    footer_bg: palette.footer_bg,
    subject: `☕ ${appConfig.herName} said YES! ${date} at ${time}`,
    preheader: `${appConfig.herName} accepted. ${date}, ${time} at ${place}.`,
    emoji: '☕',
    badge: 'Invitation accepted',
    headline: `${appConfig.herName} said YES! 🎉`,
    subline: 'Your coffee date is officially on.',
    answer_html: answerHtml,
    note,
    maps_button: `<a href="${mapsLink}" style="display:inline-block;background:#ffffff;color:${palette.ink};text-decoration:none;font-weight:600;padding:13px 26px;border:2px solid ${palette.accent};border-radius:999px;font-size:15px;margin:5px;">📍 Open in Maps</a>`,
    whatsapp_link: whatsappLink,
    whatsapp_label: '💬 Reply on WhatsApp',
    footer_line: 'Now go pick a good shirt 😄',
    sent_at: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
  };
}

function buildGmailComposeUrl(subject, body) {
  const composeUrl = new URL('https://mail.google.com/mail/');
  composeUrl.searchParams.set('view', 'cm');
  composeUrl.searchParams.set('fs', '1');
  composeUrl.searchParams.set('authuser', appConfig.myEmail);
  composeUrl.searchParams.set('to', appConfig.myEmail);
  composeUrl.searchParams.set('su', subject);
  composeUrl.searchParams.set('body', body);
  return composeUrl.toString().replace(/\+/g, '%20');
}

function buildGmailAppUrl(subject, body) {
  const composeParams = new URLSearchParams({
    to: appConfig.myEmail,
    subject,
    body,
  });
  return `googlegmail://co?${composeParams.toString().replace(/\+/g, '%20')}`;
}

function buildGmailAndroidIntentUrl(subject, body, composeUrl) {
  const mailtoParams = new URLSearchParams({
    subject,
    body,
  });
  const fallbackUrl = encodeURIComponent(composeUrl);
  const encodedParams = mailtoParams.toString().replace(/\+/g, '%20');
  return `intent:${encodeURIComponent(appConfig.myEmail)}?${encodedParams}#Intent;scheme=mailto;action=android.intent.action.SENDTO;package=com.google.android.gm;S.browser_fallback_url=${fallbackUrl};end`;
}

function buildConfirmationEmailUrl() {
  const date = formatDateForDisplay(state.date);
  const time = formatTimeDisplay(state.time);
  const place = state.selectedPlace ? state.selectedPlace.name : 'A cozy café nearby';
  const address = state.selectedPlace?.address || 'Pune';
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place} ${address}`)}`;
  const weather = state.weather.toLowerCase().includes('unavailable')
    ? 'Forecast unavailable right now'
    : state.weather || 'Forecast unavailable right now';
  const note = state.note.trim() || 'No extra note added';

  const subject = `☕ A coffee date with ${appConfig.herName} | ${date} at ${time}`;
  const body = [
    'Hi Chetan,',
    '',
    `A little happy news: ${appConfig.herName} said yes to coffee! ☕`,
    '',
    'Here is the plan for our catch-up:',
    '',
    'OUR COFFEE DATE',
    `Vibe        ${state.vibe}`,
    `Date        ${date}`,
    `Time        ${time}`,
    `Place       ${place}`,
    `Address     ${address}`,
    `Map         ${mapsLink}`,
    `Forecast    ${weather}`,
    '',
    `A little note: ${note}`,
    '',
    'Looking forward to a warm drink and a lovely conversation.',
    '',
    'Warmly,',
    appConfig.herName,
  ].join('\n');

  return { subject, body };
}

function sendConfirmationEmail() {
  const { subject, body } = buildConfirmationEmailUrl();
  const composeUrl = buildGmailComposeUrl(subject, body);
  state.emailAttempted = true;
  elements.emailStatus.textContent = 'Opening a prefilled Gmail draft...';
  elements.emailStatus.classList.add('success');

  if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.location.href = composeUrl;
    return;
  }

  let fallbackTimer;
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      clearTimeout(fallbackTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  const appUrl = /Android/i.test(navigator.userAgent)
    ? buildGmailAndroidIntentUrl(subject, body, composeUrl)
    : buildGmailAppUrl(subject, body);
  window.location.href = appUrl;
  fallbackTimer = setTimeout(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    if (document.visibilityState === 'visible') {
      window.location.href = composeUrl;
    }
  }, 1500);
}

function showWhatsappFallback() {
  const message = `Hi! ${appConfig.herName} said yes 😊\nVibe: ${state.vibe}\nDate: ${formatDateForDisplay(state.date)}\nTime: ${formatTimeDisplay(state.time)}\nPlace: ${state.selectedPlace ? state.selectedPlace.name : 'A cozy café nearby'}\nNote: ${state.note || 'No note'}\nWeather: ${state.weather}`;
  const encoded = encodeURIComponent(message);
  const link = `https://wa.me/${appConfig.whatsappNumber}?text=${encoded}`;
  window.open(link, '_blank', 'noopener,noreferrer');
}

async function sendConfirmationEmailSafely() {
  elements.emailStatus.textContent = 'Opening a prefilled Gmail draft...';
  sendConfirmationEmail();
  elements.whatsappFallbackBtn.classList.remove('hidden');
}

function bindConfirmationEvents() {
  elements.calendarBtn.addEventListener('click', downloadCalendarFile);
  elements.mapsBtn.addEventListener('click', openMapsLink);
  elements.whatsappFallbackBtn.addEventListener('click', showWhatsappFallback);
}

function bindTicketAndQuestionEvents() {
  elements.unlockTicketBtn.addEventListener('click', () => {
    resetNoChoice();
    elements.ticketCard.classList.add('is-open');
    navigator.vibrate?.(30);
    setTimeout(() => showScreen('question'), 700);
    setTimeout(() => animateTypewriter(), 1100);
  });

  elements.yesBtn.addEventListener('click', advanceToPlan);

  elements.noBtn.addEventListener('click', handleNoChoice);

  elements.maybeLaterBtn.addEventListener('click', () => {
    showScreen('goodbye');
  });

  elements.goodbyeBackBtn.addEventListener('click', () => {
    resetNoChoice();
    showScreen('question');
  });
}

function init() {
  setDefaultDate();
  bindTicketAndQuestionEvents();
  bindPlanEvents();
  bindConfirmationEvents();
  loadFavoritePlaces();
  renderPlaceList(appConfig.favoritePlaces || []);
  renderPlanStep();
  elements.summaryDate.textContent = formatDateForDisplay(state.date);
  elements.summaryTime.textContent = state.time;
  elements.summaryVibe.textContent = state.vibe;
  elements.summaryPlace.textContent = (appConfig.favoritePlaces && appConfig.favoritePlaces[0]?.name) || 'A cozy café';
  elements.emailStatus.textContent = 'Sending your plan...';
  elements.whatsappFallbackBtn.classList.add('hidden');
  showScreen('ticket');
}

window.addEventListener('resize', () => {
  if (mapInstance) {
    mapInstance.invalidateSize();
  }
});

init();
