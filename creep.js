(function() {
    'use strict';

    // Create floating button
    function createCreepButton() {
        const btn = document.createElement('button');
        btn.id = 'creep-btn';
        
        // Use image instead of text
        const bgURL = chrome.runtime.getURL('creepybg.png');
        btn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: url('${bgURL}') center/cover, linear-gradient(45deg, #ff0000, #990000);
            border: 3px solid #990000;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 0 20px rgba(255,0,0,0.7);
            animation: pulse 2s infinite;
            transition: all 0.3s ease;
        `;

        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'creepy-tooltip';
        tooltip.innerHTML = '⚠️ WARNING: Clicking will trigger intense animations.<br>Proceed with caution! 🕷️';
        btn.appendChild(tooltip);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); box-shadow: 0 0 20px rgba(255,0,0,0.7); }
                50% { transform: scale(1.1); box-shadow: 0 0 30px rgba(255,0,0,0.9); }
                100% { transform: scale(1); box-shadow: 0 0 20px rgba(255,0,0,0.7); }
            }
            #creep-btn.active {
                background: url('${bgURL}') center/cover, linear-gradient(45deg, #00ff00, #006600);
                border-color: #006600;
                box-shadow: 0 0 20px rgba(0,255,0,0.7);
            }
            .creepy-tooltip {
                position: absolute;
                left: 100%;
                top: 50%;
                transform: translateY(-50%);
                margin-left: 15px;
                padding: 8px;
                background: rgba(0,0,0,0.9);
                border: 1px solid #ff0000;
                border-radius: 5px;
                width: 200px;
                font-size: 12px;
                color: white;
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
                white-space: normal;
                text-align: center;
                line-height: 1.4;
            }
            @keyframes shake {
                0%, 100% { transform: translate(0, 0) rotate(0); }
                25% { transform: translate(-5px, -5px) rotate(-1deg); }
                50% { transform: translate(5px, 5px) rotate(1deg); }
                75% { transform: translate(-3px, 3px) rotate(-0.5deg); }
            }
            @keyframes glitch {
                0% { filter: none; }
                50% { filter: hue-rotate(90deg) contrast(150%); }
                51% { filter: hue-rotate(-90deg) contrast(150%); }
                100% { filter: none; }
            }
            @keyframes flicker {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }
            .creepy-mode {
                animation: shake 0.5s infinite, glitch 0.3s infinite;
                filter: contrast(120%);
            }
            .creepy-mode * {
                animation: flicker 0.1s infinite;
            }
            .creature {
                position: fixed;
                z-index: 9998;
                pointer-events: none;
                transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
                filter: contrast(120%) brightness(0.8);
            }
            .roach { width: 10%; height: 10%; }
            .spider { width: 10%; height: 10%; }
        `;
        document.head.appendChild(style);

        // Add click handler
        btn.addEventListener('click', toggleCreepyMode);
        document.body.appendChild(btn);
    }

    let creepyModeActive = false;
    let creatures = [];

    function toggleCreepyMode() {
        creepyModeActive = !creepyModeActive;
        
        const btn = document.getElementById('creep-btn');
        if (creepyModeActive) {
            document.body.classList.add('creepy-mode');
            btn.classList.add('active');
            spawnCreatures();
        } else {
            document.body.classList.remove('creepy-mode');
            btn.classList.remove('active');
            creatures.forEach(c => c.remove());
            creatures = [];
        }
    }

    function spawnCreatures() {
        if (!creepyModeActive) return;

        const roachURL = chrome.runtime.getURL('roach.gif');
        const spiderURL = chrome.runtime.getURL('spider.gif');
        
        function spawnBatch() {
            if (!creepyModeActive) return;
            
            // Spawn 5 creatures
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    if (!creepyModeActive) return;

                    const isSpider = Math.random() > 0.5;
                    const creature = document.createElement('img');
                    creature.src = isSpider ? spiderURL : roachURL;
                    creature.className = `creature ${isSpider ? 'spider' : 'roach'}`;
                    
                    positionCreature(creature);
                    document.body.appendChild(creature);
                    creatures.push(creature);

                    // Animate movement
                    setInterval(() => {
                        if (creepyModeActive) {
                            positionCreature(creature);
                        }
                    }, 2000 + Math.random() * 1000);

                }, i * 200);
            }
        }

        // Initial spawn
        spawnBatch();
        
        // Spawn every 20 seconds
        const spawnInterval = setInterval(() => {
            if (!creepyModeActive) {
                clearInterval(spawnInterval);
                return;
            }
            spawnBatch();
        }, 20000);
    }

    function positionCreature(creature) {
        const x = Math.random() * (window.innerWidth - 100);
        const y = Math.random() * (window.innerHeight - 100);
        creature.style.left = x + 'px';
        creature.style.top = y + 'px';
        creature.style.transform = `rotate(${Math.random() * 360}deg) ${Math.random() > 0.5 ? 'scaleX(-1)' : ''}`;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createCreepButton);
    } else {
        createCreepButton();
    }
})();
