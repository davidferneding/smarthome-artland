const baseUrl = "http://localhost:8000/";
let deviceList = [];
const devicesDiv = document.getElementById('devices');

async function addDevice() {
    const nameInput = document.getElementById('device-name');
    const typeSelect = document.getElementById('device-type');
    const name = nameInput.value.trim();
    const type = typeSelect.value;
    if (name) {

    const response = await fetch(baseUrl + "add-device?" + "name=" + nameInput.value + "&type=" + typeSelect.value, {
        method: "POST"
    });
         
    const id = await response.json();

        const newDevice = {
            id: id,
            name: name,
            type: type,
            isOn: false,
            brightness: 50,
            color: '#ffffff',
            timer: null,
            timerDuration: 0
        };
        deviceList.push(newDevice);
        renderDevices();
        nameInput.value = '';
    } else {
        alert('Bitte gib einen Namen für das Gerät ein.');
    }
}
async function getDevices() {
    const response = await fetch(baseUrl + "get-devices", {
        method: "GET"

    });

    for(device in JSON.parse(response.json)){
    deviceList.push(device)
    }
      
}

function renderDevices() {
    devicesDiv.innerHTML = '';
    deviceList.forEach(device => {
        const deviceDiv = document.createElement('div');
        deviceDiv.classList.add('device-control');
        deviceDiv.innerHTML = `<h3>${device.name} (${device.type})</h3>`;

        if (device.type === 'lampe') {
            const lampeControls = document.createElement('div');
            lampeControls.classList.add('lampe-controls');
            lampeControls.innerHTML = `
                <label>Status:</label>
                <button onclick="toggleLampe(${device.id})">${device.isOn ? 'An' : 'Aus'}</button><br>
    
                <div class="slider-container">
                    <label for="brightness-${device.id}">Helligkeit:</label>
                    <input type="range" id="brightness-${device.id}" min="0" max="100" value="${device.brightness}" oninput="setBrightness(${device.id}, this.value); updateSliderUI(this)">
                    <span class="percentage">${device.brightness}%</span>
                </div>
                <div class="color-picker-container">
                    <label for="color-${device.id}">Farbe:</label>
                    <div class="color-preview" style="background-color: ${device.color}"></div>
                    <input type="color" id="color-${device.id}" value="${device.color}" oninput="setColor(${device.id}, this.value); updateColorPreview(this)">
                </div>
                <div class="timer-controls">
                    <label for="timer-${device.id}">Timer (Minuten):</label>
                    <input type="number" id="timer-${device.id}" min="0" value="${device.timerDuration}" oninput="setTimerDuration(${device.id}, this.value)">
                    <button onclick="startTimer(${device.id})">Start</button>
                    ${device.timer ? `<button onclick="cancelTimer(${device.id})">Abbrechen</button> <p class="timer-running">Timer läuft...</p>` : ''}
                </div>
                <div class"delete-device">
                <button class="delete" onclick="deleteDevice(${device.id})">
                <span class="material-icons">delete</span><span>Löschen</span></button>
                </div>
            `;
            deviceDiv.appendChild(lampeControls);
        } else if (device.type === 'klickbot') {
            const klickbotControls = document.createElement('div');
            klickbotControls.classList.add('klickbot-controls');
            klickbotControls.innerHTML = `
                <button onclick="simulateClick('${device.id}')">Klicken</button>

                </div>
                <div class"delete-device">
                <button class="delete" onclick="deleteDevice(${device.id})">
                <span class="material-icons">delete</span><span>Löschen</span></button>
                </div>
            `;
            deviceDiv.appendChild(klickbotControls);
        }

        devicesDiv.appendChild(deviceDiv);
    });
}

function toggleLampe(deviceId) { 
    const device = deviceList.find(d => d.id === deviceId);
    if (device) {
        device.isOn = !device.isOn;
        renderDevices();
        console.log(`${device.name} ist jetzt ${device.isOn ? 'an' : 'aus'}.`);
    }
}

function setBrightness(deviceId, brightness) {
    const device = deviceList.find(d => d.id === deviceId);
    if (device) {
        device.brightness = brightness;
        console.log(`${device.name} Helligkeit: ${brightness}%`);
    }
}

function setColor(deviceId, color) {
    const device = deviceList.find(d => d.id === deviceId);
    if (device) {
        device.color = color;
        console.log(`${device.name} Farbe: ${color}`);
    }
}

function setTimerDuration(deviceId, duration) {
    const device = deviceList.find(d => d.id === deviceId);
    if (device) {
        device.timerDuration = parseInt(duration) >= 0 ? parseInt(duration) : 0;
    }
}

function startTimer(deviceId) {
    const device = deviceList.find(d => d.id === deviceId);
    if (device && device.isOn && device.timerDuration > 0 && !device.timer) {
        const milliseconds = device.timerDuration * 60 * 1000;
        device.timer = setTimeout(() => {
            device.isOn = false;
            device.timer = null;
            device.timerDuration = 0;
            renderDevices();
            console.log(`${device.name} wurde nach ${device.timerDuration} Minuten ausgeschaltet.`);
        }, milliseconds);
        renderDevices();
        console.log(`${device.name} Timer für ${device.timerDuration} Minuten gestartet.`);
    } else if (device && !device.isOn) {
        alert(`Bitte schalte ${device.name} zuerst ein, um den Timer zu starten.`);
    } else if (device && device.timerDuration <= 0) {
        alert(`Bitte gib eine gültige Timer-Dauer (in Minuten) für ${device.name} ein.`);
    } else if (device && device.timer) {
        alert(`Der Timer für ${device.name} läuft bereits.`);
    }
}

function cancelTimer(deviceId) {
    const device = deviceList.find(d => d.id === deviceId);
    if (device && device.timer) {
        clearTimeout(device.timer);
        device.timer = null;
        device.timerDuration = 0;
        renderDevices();
        console.log(`${device.name} Timer wurde abgebrochen.`);
    }
}

function simulateClick(deviceId) {
    console.log(`${deviceName} hat geklickt!`);
}

function deleteDevice(deviceId) {
    var removeIndex = deviceList.map(item=> item.id).indexOf(deviceId);
    if (removeIndex >=0) {
        deviceList.splice(removeIndex, 1);
    }

    renderDevices();
}


renderDevices();

function updateSliderUI(slider) {
    // Aktualisiere die Prozentanzeige
    const percentage = slider.nextElementSibling;
    percentage.textContent = slider.value + '%';
    
    // Aktualisiere den Slider-Hintergrund
    const percent = slider.value + '%';
    slider.style.background = `linear-gradient(to right, #00ff00 0%, #00ff00 ${percent}, #000000 ${percent}, #000000 100%)`;
}

// Initialisiere alle vorhandenen Slider beim Laden
document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(updateSliderUI);
});

function updateColorPreview(colorInput) {
    // Finde das Preview-Element (es ist das vorherige Geschwisterelement)
    const colorPreview = colorInput.previousElementSibling;
    colorPreview.style.backgroundColor = colorInput.value;
}


// Animierter Hintergrund (optimierte Version)
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('background-container');
    if (!container) return;
    
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const rectangleCount = 5; // Reduziert von 12 auf 5
    const rectangles = [];
    
    // Erstelle Rechtecke
    for (let i = 0; i < rectangleCount; i++) {
        createRectangle();
    }
    
    function createRectangle() {
        // Zufällige Größe, Position und Geschwindigkeit
        const width = Math.random() * 150 + 50;
        const height = Math.random() * 150 + 50;
        const x = Math.random() * (containerWidth - width);
        const y = Math.random() * (containerHeight - height);
        const angle = Math.random() * 360;
        const speedX = (Math.random() - 0.5) * 0.8; // Langsamere Geschwindigkeit
        const speedY = (Math.random() - 0.5) * 0.8; // Langsamere Geschwindigkeit
        const rotationSpeed = (Math.random() - 0.5) * 0.5; // Langsamere Rotation
        
        // Erstelle DOM-Element
        const rectangle = document.createElement('div');
        rectangle.className = 'rectangle';
        rectangle.style.width = `${width}px`;
        rectangle.style.height = `${height}px`;
        rectangle.style.left = `${x}px`;
        rectangle.style.top = `${y}px`;
        rectangle.style.transform = `rotate(${angle}deg)`;
        rectangle.style.boxShadow = 'none'; // Schatten entfernt für bessere Performance
        rectangle.style.opacity = '0.5'; // Geringere Deckkraft
        
        // Einfacherer Gradient für bessere Performance
        const gradientAngle = Math.floor(Math.random() * 360);
        rectangle.style.background = `linear-gradient(${gradientAngle}deg, rgba(30,30,30,0.1) 0%, rgba(255,255,255,0.5) 100%)`;
        
        container.appendChild(rectangle);
        
        // Speichere Rechteck-Daten
        rectangles.push({
            element: rectangle,
            x: x,
            y: y,
            angle: angle,
            speedX: speedX,
            speedY: speedY,
            rotationSpeed: rotationSpeed
        });
    }
    
    // Performance-optimierte Animation
    let lastTime = 0;
    function animate(currentTime) {
        // Überspringe Frames, wenn der Tab nicht sichtbar ist
        if (document.hidden) {
            setTimeout(() => requestAnimationFrame(animate), 1000);
            return;
        }
        
        // Frame-Begrenzung (max. 30 FPS für bessere Performance)
        if (currentTime - lastTime < 33) { // ~30 FPS
            requestAnimationFrame(animate);
            return;
        }
        lastTime = currentTime;
        
        rectangles.forEach(rect => {
            // Aktualisiere Position
            rect.x += rect.speedX;
            rect.y += rect.speedY;
            rect.angle += rect.rotationSpeed;
            
            // Prüfe Kollision mit den Rändern
            if (rect.x < -150 || rect.x > containerWidth) {
                rect.speedX *= -1;
            }
            if (rect.y < -150 || rect.y > containerHeight) {
                rect.speedY *= -1;
            }
            
            // Aktualisiere DOM-Element
            rect.element.style.left = `${rect.x}px`;
            rect.element.style.top = `${rect.y}px`;
            rect.element.style.transform = `rotate(${rect.angle}deg)`;
        });
        
        requestAnimationFrame(animate);
    }
    
    requestAnimationFrame(animate);
});
