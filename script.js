const baseUrl = "http://smarthome.local:8000/";
let deviceList = [];
const devicesDiv = document.getElementById('devices');

getDevices();

async function addDevice() {
    const nameInput = document.getElementById('device-name');
    const typeSelect = document.getElementById('device-type');
    const nodeIdToggle = document.getElementById('toggleNodeId');
    const name = nameInput.value.trim();
    const type = typeSelect.value;
    if (name) {
        let query = "?name=" + name + "&type=" + type;
        if (nodeIdToggle.checked) {
            const nodeIdInput = document.getElementById('nodeid');
            query += "&nodeid=" + nodeIdInput.value;
        }
        const response = await fetch(baseUrl + "add-device" + query, {
            method: "POST"
        });

        const data = await response.json();

        const newDevice = {
            id: data.id,
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
    const response = await fetch(baseUrl + "get-devices", { method: "GET" });
    const data = await response.json();

    data.devices.forEach(device => {
        deviceList.push({
            id: device.id,
            name: device.name,
            type: device.type,
            isOn: device.status === "on",
            brightness: device.brightness ?? 50,
            color: '#ffffff',
            timer: null,
            timerDuration: 0
        });
    });

    renderDevices();
}

document.getElementById('toggleNodeId').addEventListener('change',
    function() {
        const aktiv = this.checked;
        const element = document.getElementById('nodeid');

        if (aktiv) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });

function renderDevices() {
    devicesDiv.innerHTML = '';
    deviceList.forEach(device => {
        const deviceDiv = document.createElement('div');
        deviceDiv.classList.add('device-control');
        deviceDiv.innerHTML = `<h3>${device.name} (${device.type})</h3>`;

        if (device.type === 'light') {
            const lightControls = document.createElement('div');
            lightControls.classList.add('light-controls');
            lightControls.innerHTML = `
                <label>Status:</label>
                <button onclick="toggleLight('${device.id}')">${device.isOn ? 'An' : 'Aus'}</button><br>

    
                <div class="slider-container">
                    <label for="brightness-${device.id}">Helligkeit:</label>
                    <input type="range" id="brightness-${device.id}" min="0" max="3" value="${device.brightness}" onchange="setBrightness('${device.id}', this.value); updateSliderUI(this)">
                    <span class="percentage">${device.brightness}%</span>
                </div>
                <div class="color-picker-container">
                    <label for="color-${device.id}">Farbe:</label>
                    <div class="color-preview" style="background-color: ${device.color}"></div>
                    <input type="color" id="color-${device.id}" value="${device.color}" onchange="setColor('${device.id}', this.value); updateColorPreview(this)">
                </div>
                <div class="timer-controls">
                    <label for="timer-${device.id}">Timer (Minuten):</label>
                    <input type="number" id="timer-${device.id}" min="0" value="${device.timerDuration}" onchange="setTimerDuration('${device.id}', this.value)">
                    <button onclick="startTimer('${device.id}')">Start</button>
                    ${device.timer ? `<button onclick="cancelTimer('${device.id}')">Abbrechen</button> <p class="timer-running">Timer läuft...</p>` : ''}
                </div>
                <div class"delete-device">
                <button class="delete" onclick="deleteDevice('${device.id}')">
                <span class="material-icons">delete</span><span>Löschen</span></button>
                </div>
            `;
            deviceDiv.appendChild(lightControls);
        } else if (device.type === 'plug') {
            const plugControls = document.createElement('div');
            plugControls.classList.add('plug-controls');
            plugControls.innerHTML = `
                <button onclick="simulateClick('${device.id}')">Klicken</button>

                </div>
                <div class="delete-device">
                <button class="delete" onclick="deleteDevice('${device.id}')">
                <span class="material-icons">delete</span><span>Löschen</span></button>
                </div>
            `;
            deviceDiv.appendChild(plugControls);
        }

        devicesDiv.appendChild(deviceDiv);
    });
}

async function toggleLight(deviceId) {
    const device = deviceList.find(d => d.id === deviceId);
    if (device) {
        await fetch(baseUrl + `toggle?id=${deviceId}`, {
            method: "POST"
        });
        device.isOn = !device.isOn;
        renderDevices();
        console.log(`${device.name} ist jetzt ${device.isOn ? 'an' : 'aus'}.`);
    }
}

async function setBrightness(deviceId, brightness) {
    const device = deviceList.find(d => d.id === deviceId);
    if (device) {
        device.brightness = brightness;

        try {
            const res = await fetch(baseUrl + `change-brightness?id=${deviceId}&brightnesslevel=${brightness}`, {
                method: "POST"
            });

            if (!res.ok) throw new Error();
            console.log(`${device.name} Helligkeit wurde auf Stufe ${brightness} gesetzt.`);
        } catch (error) {
            alert(`Fehler beim Aktualisieren der Helligkeit für ${device.name}`);
        }

        renderDevices();
    }
}

async function changeName(deviceId, newName) {
    const device = deviceList.find(d => d.id === deviceId);
    if (device && newName.trim()) {
        const response = await fetch(`${baseUrl}change-name?id=${deviceId}&targetname=${encodeURIComponent(newName)}`, {
            method: "POST"
        });

        if (response.ok) {
            device.name = newName;
            renderDevices();
            console.log(`Name des Geräts wurde zu "${newName}" geändert.`);
        } else {
            alert("Fehler beim Ändern des Gerätenamens.");
        }
    } else {
        alert("Ungültiger Name oder Gerät nicht gefunden.");
    }
}

async function setColor(deviceId, color) {
    const device = deviceList.find(d => d.id === deviceId);
    if (device) {
        device.color = color;

        fetch(baseUrl + `change-color?id=${deviceId}&color=${encodeURIComponent(color)}`, {
            method: "POST"
        }).then(response => {
            if (!response.ok) throw new Error();
            console.log(`${device.name} Farbe geändert zu ${color}`);
        }).catch(() => {
            alert(`Fehler beim Ändern der Farbe von ${device.name}`);
        });

        console.log(`${device.name} Farbe geändert zu ${color}`);
        renderDevices();
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

function simulateClick(deviceName) {
    console.log(`${deviceName} hat geklickt!`);
}


async function deleteDevice(deviceId) {
    const index = deviceList.findIndex(d => d.id === deviceId);
    if (index >= 0) {
        try {
            const res = await fetch(`${baseUrl}delete-device?id=${deviceId}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error();

            deviceList.splice(index, 1);
            renderDevices();
            console.log(`Gerät mit ID ${deviceId} wurde gelöscht.`);
        } catch (error) {
            alert("Fehler beim Löschen des Geräts.");
        }
    }
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
