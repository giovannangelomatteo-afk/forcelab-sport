// ForceLab Sport - JavaScript Aggiornato con le modifiche richieste
class ForceLab {
    constructor() {
        this.currentSport = null;
        this.currentModule = 'peso';
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.gravity = 9.8;
        this.friction = 0.3;
        this.kickForce = 15; // Forza calcio
        this.shootDistance = 3; // Distanza canestro (metri)
        this.airResistance = 0.01; // Resistenza aria
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.canvas = document.getElementById('simulationCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = Math.min(600, container.clientWidth - 40);
        this.canvas.height = 400;
    }

    setupEventListeners() {
        // Selezione sport
        document.querySelectorAll('.sport-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectSport(e.target.dataset.sport);
            });
        });

        // Selezione modulo
        document.querySelectorAll('.module-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectModule(e.target.dataset.module);
            });
        });

        // Controlli gravità
        const gravitySlider = document.getElementById('gravitySlider');
        gravitySlider.addEventListener('input', (e) => {
            this.gravity = parseFloat(e.target.value);
            document.getElementById('gravityValue').textContent = this.gravity;
        });

        // Preset pianeti
        document.querySelectorAll('[data-gravity]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gravity = parseFloat(e.target.dataset.gravity);
                this.gravity = gravity;
                gravitySlider.value = gravity;
                document.getElementById('gravityValue').textContent = gravity;
            });
        });

        // Controlli attrito/forza
        const frictionSlider = document.getElementById('frictionSlider');
        frictionSlider.addEventListener('input', (e) => {
            if(this.currentSport === 'basket') {
                this.airResistance = parseFloat(e.target.value);
                document.getElementById('frictionValue').textContent = this.airResistance;
            } else {
                this.friction = parseFloat(e.target.value);
                document.getElementById('frictionValue').textContent = this.friction;
            }
        });

        // Preset superfici
        document.querySelectorAll('[data-friction]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const friction = parseFloat(e.target.dataset.friction);
                if(this.currentSport === 'basket') {
                    this.airResistance = friction;
                    frictionSlider.value = friction;
                    document.getElementById('frictionValue').textContent = friction;
                } else {
                    this.friction = friction;
                    frictionSlider.value = friction;
                    document.getElementById('frictionValue').textContent = friction;
                }
            });
        });

        // Avvia simulazione
        document.getElementById('startSimulation').addEventListener('click', () => {
            this.startSimulation();
        });

        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
    }

    selectSport(sport) {
        this.currentSport = sport;
        document.getElementById('labContainer').style.display = 'flex';
        document.querySelector('.sport-selector').style.display = 'none';
        
        const sportTitle = document.getElementById('sportTitle');
        const sportNames = {
            calcio: '⚽ Laboratorio Calcio',
            basket: '🏀 Laboratorio Basket',
            ciclismo: '🚴‍♂️ Laboratorio Ciclismo',
            nuoto: '🏊‍♂️ Laboratorio Nuoto',
            ginnastica: '🤸‍♂️ Laboratorio Ginnastica'
        };
        sportTitle.textContent = sportNames[sport];
        
        this.updateControlsForSport(sport);
        this.clearCanvas();
        this.drawSportEnvironment();
    }

    updateControlsForSport(sport) {
        const frictionSlider = document.getElementById('frictionSlider');
        const frictionValue = document.getElementById('frictionValue');
        const presets = document.querySelector('.surface-presets');
        
        if(sport === 'calcio') {
            // Aggiungi controllo forza calcio
            this.addKickForceControl();
            frictionSlider.min = 0;
            frictionSlider.max = 1;
            frictionSlider.step = 0.01;
            frictionSlider.value = 0.3;
            this.friction = 0.3;
            frictionValue.textContent = '0.3';
            
            // Aggiorna preset per calcio
            presets.innerHTML = `
                <button class="preset-btn" data-friction="0.1">Ghiaccio</button>
                <button class="preset-btn" data-friction="0.3">Erba</button>
                <button class="preset-btn" data-friction="0.7">Asfalto</button>
            `;
            
        } else if(sport === 'basket') {
            // Aggiungi controllo distanza
            this.addDistanceControl();
            frictionSlider.min = 0;
            frictionSlider.max = 0.05;
            frictionSlider.step = 0.001;
            frictionSlider.value = 0.01;
            this.airResistance = 0.01;
            frictionValue.textContent = '0.01';
            
            // Aggiorna preset per basket (resistenza aria)
            presets.innerHTML = `
                <button class="preset-btn" data-friction="0">Vuoto</button>
                <button class="preset-btn" data-friction="0.01">Aria</button>
                <button class="preset-btn" data-friction="0.03">Vento</button>
            `;
            
        } else if(sport === 'ciclismo') {
            // Controlli normali per ciclismo
            this.removeExtraControls();
            frictionSlider.min = 0;
            frictionSlider.max = 0.1;
            frictionSlider.step = 0.001;
            frictionSlider.value = 0.02;
            this.friction = 0.02;
            frictionValue.textContent = '0.02';
            
            presets.innerHTML = `
                <button class="preset-btn" data-friction="0.005">Asfalto</button>
                <button class="preset-btn" data-friction="0.02">Sterrato</button>
                <button class="preset-btn" data-friction="0.05">Sabbia</button>
            `;
        }
        
        // Riattacca event listeners per i nuovi preset
        this.reattachPresetListeners();
    }

    addKickForceControl() {
        const controlsPanel = document.querySelector('.controls-panel');
        
        // Rimuovi controlli esistenti se presenti
        this.removeExtraControls();
        
        // Aggiungi controllo forza calcio
        const kickControl = document.createElement('div');
        kickControl.className = 'control-group extra-control';
        kickControl.innerHTML = `
            <label for="kickForceSlider">Forza Calcio (m/s):</label>
            <input type="range" id="kickForceSlider" min="5" max="30" value="15" step="0.5">
            <span id="kickForceValue">15</span>
        `;
        
        controlsPanel.insertBefore(kickControl, document.getElementById('startSimulation'));
        
        // Event listener
        document.getElementById('kickForceSlider').addEventListener('input', (e) => {
            this.kickForce = parseFloat(e.target.value);
            document.getElementById('kickForceValue').textContent = this.kickForce;
        });
    }

    addDistanceControl() {
        const controlsPanel = document.querySelector('.controls-panel');
        
        // Rimuovi controlli esistenti se presenti
        this.removeExtraControls();
        
        // Aggiungi controllo distanza
        const distanceControl = document.createElement('div');
        distanceControl.className = 'control-group extra-control';
        distanceControl.innerHTML = `
            <label for="distanceSlider">Distanza Canestro (m):</label>
            <input type="range" id="distanceSlider" min="2" max="8" value="3" step="0.1">
            <span id="distanceValue">3</span>
        `;
        
        controlsPanel.insertBefore(distanceControl, document.getElementById('startSimulation'));
        
        // Event listener
        document.getElementById('distanceSlider').addEventListener('input', (e) => {
            this.shootDistance = parseFloat(e.target.value);
            document.getElementById('distanceValue').textContent = this.shootDistance;
        });
    }

    removeExtraControls() {
        document.querySelectorAll('.extra-control').forEach(el => el.remove());
    }

    reattachPresetListeners() {
        document.querySelectorAll('[data-friction]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const friction = parseFloat(e.target.dataset.friction);
                const frictionSlider = document.getElementById('frictionSlider');
                
                if(this.currentSport === 'basket') {
                    this.airResistance = friction;
                    frictionSlider.value = friction;
                    document.getElementById('frictionValue').textContent = friction;
                } else {
                    this.friction = friction;
                    frictionSlider.value = friction;
                    document.getElementById('frictionValue').textContent = friction;
                }
            });
        });
    }

    selectModule(module) {
        this.currentModule = module;
        
        document.querySelectorAll('.module-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-module="${module}"]`).classList.add('active');
        
        // Aggiorna etichette per sport specifici
        this.updateModuleLabels();
        
        document.getElementById('pesoControls').style.display = 
            module === 'peso' ? 'block' : 'none';
        document.getElementById('attritoControls').style.display = 
            module === 'attrito' ? 'block' : 'none';
        
        this.clearCanvas();
        this.drawSportEnvironment();
    }

    updateModuleLabels() {
        const frictionLabel = document.querySelector('#attritoControls label');
        
        if(this.currentSport === 'basket') {
            frictionLabel.textContent = 'Resistenza Aria:';
        } else if(this.currentSport === 'ciclismo') {
            frictionLabel.textContent = 'Resistenza Rotolamento:';
        } else {
            frictionLabel.textContent = 'Coefficiente Attrito:';
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawSportEnvironment() {
        this.clearCanvas();
        
        switch(this.currentSport) {
            case 'calcio':
                this.drawFootballField();
                break;
            case 'basket':
                this.drawBasketballCourt();
                break;
            case 'ciclismo':
                this.drawCyclingTrack();
                break;
            case 'nuoto':
                this.drawSwimmingPool();
                break;
            case 'ginnastica':
                this.drawGymnasticsArea();
                break;
        }
    }

    drawFootballField() {
    // Campo da calcio
    this.ctx.fillStyle = '#228B22';
    this.ctx.fillRect(50, 300, this.canvas.width - 100, 80);
    
    // Linee campo
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(50, 300, this.canvas.width - 100, 80);
    
    // Porta sulla destra - CORRETTA
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 4;
    
    // Pali verticali
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width - 80, 300);
    this.ctx.lineTo(this.canvas.width - 80, 320);
    this.ctx.moveTo(this.canvas.width - 50, 300);
    this.ctx.lineTo(this.canvas.width - 50, 320);
    this.ctx.stroke();
    
    // Palo trasversale
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width - 80, 300);
    this.ctx.lineTo(this.canvas.width - 50, 300);
    this.ctx.stroke();
    
    // Base porta
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width - 80, 320);
    this.ctx.lineTo(this.canvas.width - 50, 320);
    this.ctx.stroke();
    
    // Rete
    this.ctx.strokeStyle = 'lightgray';
    this.ctx.lineWidth = 1;
    for(let i = 0; i < 4; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width - 75 + i*5, 300);
        this.ctx.lineTo(this.canvas.width - 75 + i*5, 320);
        this.ctx.stroke();
    }
    
    // Pallone al centro
    this.ctx.fillStyle = '#000000';
    this.ctx.beginPath();
    this.ctx.arc(this.canvas.width/2, 340, 12, 0, 2 * Math.PI);
    this.ctx.fill();
    
    // Pentagoni sul pallone
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.canvas.width/2, 340, 12, 0, 2 * Math.PI);
    this.ctx.stroke();
}


    drawBasketballCourt() {
        // Campo da basket
        this.ctx.fillStyle = '#D2691E';
        this.ctx.fillRect(50, 300, this.canvas.width - 100, 80);
        
        // Canestro più realistico
        this.ctx.strokeStyle = '#FF4500';
        this.ctx.lineWidth = 6;
        
        // Palo
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width - 80, 300);
        this.ctx.lineTo(this.canvas.width - 80, 250);
        this.ctx.stroke();
        
        // Tabellone
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.canvas.width - 90, 250, 20, 30);
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.canvas.width - 90, 250, 20, 30);
        
        // Canestro
        this.ctx.strokeStyle = '#FF4500';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width - 80, 285, 15, 0, Math.PI);
        this.ctx.stroke();
        
        // Rete
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 1;
        for(let i = 0; i < 6; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width - 95 + i*5, 285);
            this.ctx.lineTo(this.canvas.width - 93 + i*5, 295);
            this.ctx.stroke();
        }
        
        // Palla da basket (posizione variabile in base alla distanza)
        const ballX = this.canvas.width - 80 - (this.shootDistance * 30);
        this.ctx.fillStyle = '#FF8C00';
        this.ctx.beginPath();
        this.ctx.arc(ballX, 340, 12, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Linee palla
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(ballX, 340, 12, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    drawCyclingTrack() {
        // Pista ciclabile
        this.ctx.fillStyle = '#696969';
        this.ctx.fillRect(0, 320, this.canvas.width, 60);
        
        // Strisce bianche
        this.ctx.fillStyle = 'white';
        for(let i = 0; i < this.canvas.width; i += 40) {
            this.ctx.fillRect(i, 345, 20, 5);
        }
        
        // Bicicletta più dettagliata
        const bikeX = 100;
        const bikeY = 340;
        
        // Ruote
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(bikeX - 20, bikeY, 15, 0, 2 * Math.PI);
        this.ctx.arc(bikeX + 20, bikeY, 15, 0, 2 * Math.PI);
        this.ctx.stroke();
        
        // Raggi ruote
        this.ctx.lineWidth = 1;
        for(let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            // Ruota posteriore
            this.ctx.beginPath();
            this.ctx.moveTo(bikeX - 20, bikeY);
            this.ctx.lineTo(bikeX - 20 + Math.cos(angle) * 15, bikeY + Math.sin(angle) * 15);
            this.ctx.stroke();
            // Ruota anteriore
            this.ctx.beginPath();
            this.ctx.moveTo(bikeX + 20, bikeY);
            this.ctx.lineTo(bikeX + 20 + Math.cos(angle) * 15, bikeY + Math.sin(angle) * 15);
            this.ctx.stroke();
        }
        
        // Telaio
        this.ctx.strokeStyle = 'blue';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        // Triangolo principale
        this.ctx.moveTo(bikeX - 20, bikeY);
        this.ctx.lineTo(bikeX, bikeY - 20);
        this.ctx.lineTo(bikeX + 20, bikeY);
        this.ctx.lineTo(bikeX, bikeY - 5);
        this.ctx.lineTo(bikeX - 20, bikeY);
        this.ctx.stroke();
        
        // Manubrio
        this.ctx.beginPath();
        this.ctx.moveTo(bikeX + 15, bikeY - 15);
        this.ctx.lineTo(bikeX + 25, bikeY - 15);
        this.ctx.stroke();
        
        // Sella
        this.ctx.strokeStyle = 'brown';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(bikeX - 10, bikeY - 20);
        this.ctx.lineTo(bikeX - 5, bikeY - 20);
        this.ctx.stroke();
        
        // Ciclista stilizzato
        this.ctx.fillStyle = '#FFB6C1';
        this.ctx.beginPath();
        this.ctx.arc(bikeX + 5, bikeY - 35, 8, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Corpo ciclista
        this.ctx.strokeStyle = '#FFB6C1';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(bikeX + 5, bikeY - 27);
        this.ctx.lineTo(bikeX, bikeY - 10);
        this.ctx.stroke();
    }

    drawSwimmingPool() {
        // Piscina
        this.ctx.fillStyle = '#4169E1';
        this.ctx.fillRect(50, 250, this.canvas.width - 100, 130);
        
        // Corsie
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        for(let i = 0; i < 5; i++) {
            const y = 270 + i * 20;
            this.ctx.beginPath();
            this.ctx.moveTo(50, y);
            this.ctx.lineTo(this.canvas.width - 50, y);
            this.ctx.stroke();
        }
        
        // Nuotatore
        this.ctx.fillStyle = '#FFB6C1';
        this.ctx.beginPath();
        this.ctx.arc(100, 300, 8, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Braccia
        this.ctx.strokeStyle = '#FFB6C1';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(90, 300);
        this.ctx.lineTo(110, 300);
        this.ctx.stroke();
    }

    drawGymnasticsArea() {
        // Materassino
        this.ctx.fillStyle = '#FF69B4';
        this.ctx.fillRect(50, 320, this.canvas.width - 100, 60);
        
        // Parallele
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.moveTo(200, 280);
        this.ctx.lineTo(400, 280);
        this.ctx.moveTo(200, 320);
        this.ctx.lineTo(400, 320);
        this.ctx.stroke();
        
        // Ginnasta
        this.ctx.fillStyle = '#FFB6C1';
        this.ctx.beginPath();
        this.ctx.arc(300, 270, 8, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Corpo
        this.ctx.strokeStyle = '#FFB6C1';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(300, 278);
        this.ctx.lineTo(300, 300);
        this.ctx.stroke();
    }

    startSimulation() {
        if(this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.drawSportEnvironment();
        
        if(this.currentModule === 'peso') {
            if(this.currentSport === 'calcio') {
                this.simulateFootballKick();
            } else if(this.currentSport === 'basket') {
                this.simulateBasketballShot();
            } else if(this.currentSport === 'ciclismo') {
                this.simulateCyclingGravity();
            } else {
                this.simulateGravity();
            }
        } else if(this.currentModule === 'attrito') {
            if(this.currentSport === 'calcio') {
                this.simulateFootballFriction();
            } else if(this.currentSport === 'basket') {
                this.simulateBasketballAir();
            } else if(this.currentSport === 'ciclismo') {
                this.simulateCyclingResistance();
            } else {
                this.simulateFriction();
            }
        }
    }

    simulateFootballKick() {
        let time = 0;
        let velocity = this.kickForce;
        let height = 0;
        let maxHeight = 0;
        let flightTime = 0;
        
        const animate = () => {
            this.drawSportEnvironment();
            
            // Calcoli fisici
            time += 0.05;
            height = velocity * time - 0.5 * this.gravity * time * time;
            
            if(height > maxHeight) maxHeight = height;
            
            if(height <= 0 && time > 0.1) {
                flightTime = time;
                height = 0;
                time = 0;
                velocity = this.kickForce;
                maxHeight = 0;
            }
            
            // Disegna palla in volo
            if(height > 0) {
                this.ctx.fillStyle = 'red';
                this.ctx.beginPath();
                this.ctx.arc(this.canvas.width/2, 340 - height * 3, 12, 0, 2 * Math.PI);
                this.ctx.fill();
                
                // Vettore velocità
                const currentVelocity = velocity - this.gravity * time;
                this.ctx.strokeStyle = 'blue';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(this.canvas.width/2, 340 - height * 3);
                this.ctx.lineTo(this.canvas.width/2, 340 - height * 3 + currentVelocity * 2);
                this.ctx.stroke();
            }
            
            // Aggiorna risultati
            this.updateResults({
                gravita: this.gravity.toFixed(1),
                forza_calcio: this.kickForce.toFixed(1),
                altezza_max: maxHeight.toFixed(1),
                tempo_volo: flightTime > 0 ? flightTime.toFixed(2) : time.toFixed(2),
                velocita_attuale: (velocity - this.gravity * time).toFixed(2)
            });
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    simulateBasketballShot() {
    let time = 0;
    let ballX = this.canvas.width - 80 - (this.shootDistance * 30);
    let ballY = 340;
    let targetX = this.canvas.width - 80;
    let targetY = 285;
    
    // Calcola velocità iniziale necessaria per raggiungere il canestro
    const dx = targetX - ballX;
    const dy = targetY - ballY;
    const distance = Math.sqrt(dx*dx + dy*dy);
    
    // Angolo ottimale per il tiro (45° modificato per la distanza)
    const optimalAngle = Math.PI/4 + (this.shootDistance - 3) * 0.1;
    const initialSpeed = Math.sqrt(distance * this.gravity / Math.sin(2 * optimalAngle));
    
    const vx = initialSpeed * Math.cos(optimalAngle);
    const vy = initialSpeed * Math.sin(optimalAngle); // POSITIVO = verso l'alto
    
    const animate = () => {
        this.drawSportEnvironment();
        
        time += 0.05;
        
        // Posizione con resistenza aria - FISICA CORRETTA
        const currentVx = vx * (1 - this.airResistance * time);
        const currentVy = vy - this.gravity * time; // Gravità sottrae velocità verticale
        
        const currentX = ballX + currentVx * time;
        const currentY = ballY + vy * time - 0.5 * this.gravity * time * time; // Parabola corretta
        
        // Disegna palla
        this.ctx.fillStyle = '#FF8C00';
        this.ctx.beginPath();
        this.ctx.arc(currentX, currentY, 12, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // VETTORE FORZA APPLICATA (verso l'alto e avanti) - BLU
        this.ctx.strokeStyle = 'blue';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(currentX, currentY);
        this.ctx.lineTo(currentX + vx/3, currentY - Math.abs(vy)/3); // Verso l'alto
        this.ctx.stroke();
        
        // Freccia forza applicata
        this.ctx.fillStyle = 'blue';
        this.ctx.beginPath();
        this.ctx.moveTo(currentX + vx/3, currentY - Math.abs(vy)/3);
        this.ctx.lineTo(currentX + vx/3 - 5, currentY - Math.abs(vy)/3 + 5);
        this.ctx.lineTo(currentX + vx/3 + 5, currentY - Math.abs(vy)/3 + 5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // VETTORE PESO (sempre verso il basso) - ROSSO
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(currentX, currentY);
        this.ctx.lineTo(currentX, currentY + this.gravity * 3); // Verso il basso
        this.ctx.stroke();
        
        // Freccia peso
        this.ctx.fillStyle = 'red';
        this.ctx.beginPath();
        this.ctx.moveTo(currentX, currentY + this.gravity * 3);
        this.ctx.lineTo(currentX - 5, currentY + this.gravity * 3 - 5);
        this.ctx.lineTo(currentX + 5, currentY + this.gravity * 3 - 5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Reset quando esce dal campo o tocca terra
        if(currentX > this.canvas.width || currentY > 400 || currentY < 0) {
            time = 0;
        }
        
        this.updateResults({
            gravita: this.gravity.toFixed(1),
            distanza: this.shootDistance.toFixed(1),
            velocita_iniziale: initialSpeed.toFixed(1),
            resistenza_aria: this.airResistance.toFixed(3),
            angolo: (optimalAngle * 180 / Math.PI).toFixed(1),
            altezza_attuale: (ballY - currentY).toFixed(1)
        });
        
        this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
}

    simulateCyclingGravity() {
    let pedalForce = 50; // Forza base pedalata
    let requiredForce = pedalForce * (this.gravity / 9.8); // Forza necessaria
    let efficiency = Math.max(0, (pedalForce - requiredForce) / pedalForce * 100);
    
    const animate = () => {
        this.drawSportEnvironment();
        
        // BICICLETTA FERMA - Solo visualizzazione forze
        const bikeX = 100;
        const bikeY = 340;
        
        // VETTORE FORZA PESO (verso il basso) - ROSSO
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(bikeX, bikeY - 20); // Dal centro bici
        this.ctx.lineTo(bikeX, bikeY - 20 + this.gravity * 4);
        this.ctx.stroke();
        
        // Freccia peso
        this.ctx.fillStyle = 'red';
        this.ctx.beginPath();
        this.ctx.moveTo(bikeX, bikeY - 20 + this.gravity * 4);
        this.ctx.lineTo(bikeX - 6, bikeY - 20 + this.gravity * 4 - 8);
        this.ctx.lineTo(bikeX + 6, bikeY - 20 + this.gravity * 4 - 8);
        this.ctx.closePath();
        this.ctx.fill();
        
        // VETTORE FORZA PEDALATA (orizzontale) - BLU
        this.ctx.strokeStyle = 'blue';
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(bikeX, bikeY - 5); // Dai pedali
        this.ctx.lineTo(bikeX + requiredForce * 2, bikeY - 5);
        this.ctx.stroke();
        
        // Freccia pedalata
        this.ctx.fillStyle = 'blue';
        this.ctx.beginPath();
        this.ctx.moveTo(bikeX + requiredForce * 2, bikeY - 5);
        this.ctx.lineTo(bikeX + requiredForce * 2 - 8, bikeY - 5 - 6);
        this.ctx.lineTo(bikeX + requiredForce * 2 - 8, bikeY - 5 + 6);
        this.ctx.closePath();
        this.ctx.fill();
        
        // ETICHETTE FORZE
        this.ctx.fillStyle = 'red';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText(`Peso: ${(this.gravity * 7).toFixed(0)}N`, bikeX + 20, bikeY + 10);
        
        this.ctx.fillStyle = 'blue';
        this.ctx.fillText(`Pedalata: ${requiredForce.toFixed(0)}N`, bikeX + 20, bikeY + 30);
        
        // INFORMAZIONI AGGIUNTIVE
        this.ctx.fillStyle = 'black';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Efficienza: ${efficiency.toFixed(1)}%`, 200, 50);
        
        let planetName = 'Terra';
        if(this.gravity === 3.7) planetName = 'Marte';
        else if(this.gravity === 24.8) planetName = 'Giove';
        
        this.ctx.fillText(`Pianeta: ${planetName}`, 200, 70);
        
        this.updateResults({
            gravita: this.gravity.toFixed(1),
            peso_ciclista: (this.gravity * 7).toFixed(1), // 70kg ciclista
            forza_pedalata_necessaria: requiredForce.toFixed(1),
            efficienza: efficiency.toFixed(1),
            pianeta: planetName,
            difficolta: efficiency > 80 ? 'Facile' : efficiency > 50 ? 'Medio' : 'Difficile'
        });
        
        this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
}

    simulateFootballFriction() {
        let position = this.canvas.width/2;
        let velocity = 15;
        let deceleration = this.friction * this.gravity;
        
        const animate = () => {
            this.drawSportEnvironment();
            
            // Calcoli fisici
            velocity -= deceleration * 0.1;
            if(velocity < 0) velocity = 0;
            position += velocity * 0.5;
            
            if(position > this.canvas.width - 50) {
                position = this.canvas.width/2;
                velocity = 15;
            }
            
            // Disegna palla che rotola
            this.ctx.fillStyle = 'red';
            this.ctx.beginPath();
            this.ctx.arc(position, 340, 12, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Vettore attrito
            this.ctx.strokeStyle = 'orange';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(position, 340);
            this.ctx.lineTo(position - this.friction * 50, 340);
            this.ctx.stroke();
            
            this.updateResults({
                attrito: this.friction.toFixed(2),
                velocita: velocity.toFixed(2),
                decelerazione: deceleration.toFixed(2),
                distanza: (position - this.canvas.width/2).toFixed(1)
            });
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    simulateBasketballAir() {
        // Simula effetto resistenza aria su tiro
        let time = 0;
        let ballX = this.canvas.width - 80 - (this.shootDistance * 30);
        let ballY = 340;
        
        const animate = () => {
            this.drawSportEnvironment();
            
            time += 0.05;
            
            // Traiettoria con e senza resistenza aria
            const withoutAir = ballX + 15 * time;
            const withAir = ballX + 15 * time * (1 - this.airResistance * time);
            
            // Palla senza resistenza (fantasma)
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = 'gray';
            this.ctx.beginPath();
            this.ctx.arc(withoutAir, ballY - 2 * time * time, 12, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Palla con resistenza
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = '#FF8C00';
            this.ctx.beginPath();
            this.ctx.arc(withAir, ballY - 2 * time * time, 12, 0, 2 * Math.PI);
            this.ctx.fill();
            
            if(withAir > this.canvas.width) time = 0;
            
            this.updateResults({
                resistenza_aria: this.airResistance.toFixed(3),
                differenza_distanza: (withoutAir - withAir).toFixed(1),
                velocita_ridotta: (15 * (1 - this.airResistance * time)).toFixed(2)
            });
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    simulateCyclingResistance() {
        let position = 100;
        let velocity = 20;
        let resistance = this.friction * 100; // Resistenza rotolamento
        
        const animate = () => {
            this.drawSportEnvironment();
            
            velocity -= resistance * 0.01;
            if(velocity < 0) velocity = 0;
            position += velocity * 0.1;
            
            if(position > this.canvas.width - 50) {
                position = 100;
                velocity = 20;
            }
            
            // Vettore resistenza
            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(position, 340);
            this.ctx.lineTo(position - resistance, 340);
            this.ctx.stroke();
            
            this.updateResults({
                resistenza: this.friction.toFixed(3),
                velocita: velocity.toFixed(2),
                potenza_necessaria: (resistance * velocity / 10).toFixed(1)
            });
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    simulateGravity() {
        // Simulazione generica per nuoto e ginnastica
        let time = 0;
        let initialHeight = 100;
        let velocity = 0;
        
        const animate = () => {
            this.drawSportEnvironment();
            
            time += 0.1;
            velocity += this.gravity * 0.1;
            let height = initialHeight - (0.5 * this.gravity * time * time);
            
            if(height <= 0) {
                height = 0;
                velocity = 0;
                time = 0;
                initialHeight = 100;
            }
            
            this.ctx.fillStyle = 'red';
            this.ctx.beginPath();
            this.ctx.arc(300, 300 - height, 10, 0, 2 * Math.PI);
            this.ctx.fill();
            
            this.updateResults({
                gravita: this.gravity.toFixed(1),
                velocita: velocity.toFixed(2),
                altezza: height.toFixed(1),
                tempo: time.toFixed(1)
            });
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    simulateFriction() {
        // Simulazione generica per nuoto e ginnastica
        let position = 50;
        let velocity = 20;
        let deceleration = this.friction * this.gravity;
        
        const animate = () => {
            this.drawSportEnvironment();
            
            velocity -= deceleration * 0.1;
            if(velocity < 0) velocity = 0;
            position += velocity * 0.1;
            
            if(position > this.canvas.width - 100) {
                position = 50;
                velocity = 20;
            }
            
            this.ctx.fillStyle = 'red';
            this.ctx.beginPath();
            this.ctx.arc(position, 330, 10, 0, 2 * Math.PI);
            this.ctx.fill();
            
            this.updateResults({
                attrito: this.friction.toFixed(2),
                velocita: velocity.toFixed(2),
                posizione: position.toFixed(1),
                decelerazione: deceleration.toFixed(2)
            });
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    updateResults(data) {
        const resultsDiv = document.getElementById('results');
        let html = '';
        
        const labels = {
            gravita: '🌍 Gravità',
            velocita: '⚡ Velocità',
            altezza: '📏 Altezza',
            tempo: '⏱️ Tempo',
            attrito: '🛹 Attrito',
            posizione: '📍 Posizione',
            decelerazione: '🔻 Decelerazione',
            forza_calcio: '⚽ Forza Calcio',
            altezza_max: '📈 Altezza Max',
            tempo_volo: '🕐 Tempo Volo',
            velocita_attuale: '💨 Velocità Attuale',
            distanza: '📏 Distanza',
            velocita_iniziale: '🚀 Velocità Iniziale',
            resistenza_aria: '💨 Resistenza Aria',
            angolo: '📐 Angolo',
            forza_pedalata: '🚴‍♂️ Forza Pedalata',
            forza_necessaria: '💪 Forza Necessaria',
            pianeta: '🪐 Pianeta',
            differenza_distanza: '📊 Differenza',
            velocita_ridotta: '📉 Velocità Ridotta',
            resistenza: '🔄 Resistenza',
            potenza_necessaria: '⚡ Potenza'
        };
        
        const units = {
            gravita: 'm/s²',
            velocita: 'm/s',
            altezza: 'm',
            tempo: 's',
            attrito: '',
            posizione: 'px',
            decelerazione: 'm/s²',
            forza_calcio: 'm/s',
            altezza_max: 'm',
            tempo_volo: 's',
            velocita_attuale: 'm/s',
            distanza: 'm',
            velocita_iniziale: 'm/s',
            resistenza_aria: '',
            angolo: '°',
            forza_pedalata: 'N',
            forza_necessaria: 'N',
            pianeta: '',
            differenza_distanza: 'px',
            velocita_ridotta: 'm/s',
            resistenza: '',
            potenza_necessaria: 'W'
        };
        
        for(const [key, value] of Object.entries(data)) {
            html += `<div><strong>${labels[key] || key}:</strong> ${value} ${units[key] || ''}</div>`;
        }
        
        resultsDiv.innerHTML = html;
    }
}

// Inizializza l'applicazione
document.addEventListener('DOMContentLoaded', () => {
    new ForceLab();
});
