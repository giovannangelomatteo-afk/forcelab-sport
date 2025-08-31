// ForceLab Sport - JavaScript per simulazioni interattive
class ForceLab {
    constructor() {
        this.currentSport = null;
        this.currentModule = 'peso';
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.gravity = 9.8;
        this.friction = 0.3;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.canvas = document.getElementById('simulationCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
    }

    setupCanvas() {
        // Imposta dimensioni canvas responsive
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

        // Controlli attrito
        const frictionSlider = document.getElementById('frictionSlider');
        frictionSlider.addEventListener('input', (e) => {
            this.friction = parseFloat(e.target.value);
            document.getElementById('frictionValue').textContent = this.friction;
        });

        // Preset superfici
        document.querySelectorAll('[data-friction]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const friction = parseFloat(e.target.dataset.friction);
                this.friction = friction;
                frictionSlider.value = friction;
                document.getElementById('frictionValue').textContent = friction;
            });
        });

        // Avvia simulazione
        document.getElementById('startSimulation').addEventListener('click', () => {
            this.startSimulation();
        });

        // Responsive canvas
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
        
        this.clearCanvas();
        this.drawSportEnvironment();
    }

    selectModule(module) {
        this.currentModule = module;
        
        // Aggiorna UI
        document.querySelectorAll('.module-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-module="${module}"]`).classList.add('active');
        
        // Mostra/nascondi controlli
        document.getElementById('pesoControls').style.display = 
            module === 'peso' ? 'block' : 'none';
        document.getElementById('attritoControls').style.display = 
            module === 'attrito' ? 'block' : 'none';
        
        this.clearCanvas();
        this.drawSportEnvironment();
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Sfondo gradiente
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawSportEnvironment() {
        this.clearCanvas();
        
        // Disegna ambiente specifico per sport
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
        
        // Porta
        this.ctx.strokeRect(this.canvas.width - 80, 320, 30, 40);
        
        // Pallone
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(100, 330, 15, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Pentagoni sul pallone
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawBasketballCourt() {
        // Campo da basket
        this.ctx.fillStyle = '#D2691E';
        this.ctx.fillRect(50, 300, this.canvas.width - 100, 80);
        
        // Canestro
        this.ctx.strokeStyle = '#FF4500';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width - 100, 320, 20, 0, Math.PI);
        this.ctx.stroke();
        
        // Palla da basket
        this.ctx.fillStyle = '#FF8C00';
        this.ctx.beginPath();
        this.ctx.arc(100, 320, 12, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Linee palla
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 1;
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
        
        // Bicicletta stilizzata
        this.ctx.strokeStyle = 'blue';
        this.ctx.lineWidth = 3;
        // Ruote
        this.ctx.beginPath();
        this.ctx.arc(80, 340, 15, 0, 2 * Math.PI);
        this.ctx.arc(120, 340, 15, 0, 2 * Math.PI);
        this.ctx.stroke();
        
        // Telaio
        this.ctx.beginPath();
        this.ctx.moveTo(80, 340);
        this.ctx.lineTo(100, 320);
        this.ctx.lineTo(120, 340);
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
            this.simulateGravity();
        } else if(this.currentModule === 'attrito') {
            this.simulateFriction();
        }
    }

    simulateGravity() {
        let time = 0;
        let initialHeight = 100;
        let velocity = 0;
        
        const animate = () => {
            this.drawSportEnvironment();
            
            // Calcoli fisici
            time += 0.1;
            velocity += this.gravity * 0.1;
            let height = initialHeight - (0.5 * this.gravity * time * time);
            
            if(height <= 0) {
                height = 0;
                velocity = 0;
                time = 0;
                initialHeight = 100;
            }
            
            // Disegna oggetto che cade
            this.ctx.fillStyle = 'red';
            this.ctx.beginPath();
            this.ctx.arc(300, 300 - height, 10, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Vettore velocità
            this.ctx.strokeStyle = 'blue';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(300, 300 - height);
            this.ctx.lineTo(300, 300 - height + velocity * 5);
            this.ctx.stroke();
            
            // Aggiorna risultati
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
        let position = 50;
        let velocity = 20;
        let deceleration = this.friction * this.gravity;
        
        const animate = () => {
            this.drawSportEnvironment();
            
            // Calcoli fisici
            velocity -= deceleration * 0.1;
            if(velocity < 0) velocity = 0;
            position += velocity * 0.1;
            
            if(position > this.canvas.width - 100) {
                position = 50;
                velocity = 20;
            }
            
            // Disegna oggetto che scivola
            this.ctx.fillStyle = 'red';
            this.ctx.beginPath();
            this.ctx.arc(position, 330, 10, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Vettore attrito
            this.ctx.strokeStyle = 'orange';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(position, 330);
            this.ctx.lineTo(position - this.friction * 50, 330);
            this.ctx.stroke();
            
            // Aggiorna risultati
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
        
        for(const [key, value] of Object.entries(data)) {
            const labels = {
                gravita: '🌍 Gravità',
                velocita: '⚡ Velocità',
                altezza: '📏 Altezza',
                tempo: '⏱️ Tempo',
                attrito: '🛹 Attrito',
                posizione: '📍 Posizione',
                decelerazione: '🔻 Decelerazione'
            };
            
            const units = {
                gravita: 'm/s²',
                velocita: 'm/s',
                altezza: 'm',
                tempo: 's',
                attrito: '',
                posizione: 'px',
                decelerazione: 'm/s²'
            };
            
            html += `<div><strong>${labels[key]}:</strong> ${value} ${units[key]}</div>`;
        }
        
        resultsDiv.innerHTML = html;
    }
}

// Inizializza l'applicazione quando la pagina è caricata
document.addEventListener('DOMContentLoaded', () => {
    new ForceLab();
});
