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
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            #creep-btn.active {
                background: url('${bgURL}') center/cover, linear-gradient(45deg, #00ff00, #006600);
                border-color: #006600;
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
            @keyframes slowShake {
                0%, 100% { transform: translate(0, 0); }
                25% { transform: translate(-2px, -2px); }
                50% { transform: translate(2px, 2px); }
                75% { transform: translate(-1px, 1px); }
            }
            .creepy-mode {
                animation: slowShake 3s infinite ease-in-out;
            }
            .creature {
                position: fixed;
                z-index: 9998;
                pointer-events: none;
                transition: all 1s cubic-bezier(0.2, 0.8, 0.2, 1);
                transform-origin: center;
            }
            .creature.spawn {
                animation: spawnCreature 0.5s ease-out;
            }
            @keyframes spawnCreature {
                from {
                    transform: scale(0);
                    opacity: 0;
                }
                to {
                    transform: scale(1);
                    opacity: 1;
                }
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
            startButtonSpawning();
        } else {
            document.body.classList.remove('creepy-mode');
            btn.classList.remove('active');
            creatures.forEach(c => c.remove());
            creatures = [];
            if (buttonSpawnInterval) clearInterval(buttonSpawnInterval);
        }
    }

    let buttonSpawnInterval;

    function startButtonSpawning() {
        buttonSpawnInterval = setInterval(() => {
            if (!creepyModeActive) return;
            const buttons = Array.from(document.querySelectorAll('button, .btn, .button, input[type="button"], input[type="submit"]'));
            if (buttons.length) {
                const randomButton = buttons[Math.floor(Math.random() * buttons.length)];
                const rect = randomButton.getBoundingClientRect();
                spawnCreatureFromPosition(rect.left, rect.top);
            }
        }, 5000); // Spawn from random button every 5 seconds
    }

    function spawnCreatureFromPosition(x, y) {
        const roachURL = chrome.runtime.getURL('roach.gif');
        const spiderURL = chrome.runtime.getURL('spider.gif');
        
        const isSpider = Math.random() > 0.5;
        const creature = document.createElement('img');
        creature.src = isSpider ? spiderURL : roachURL;
        creature.className = `creature ${isSpider ? 'spider' : 'roach'} spawn`;
        
        creature.style.left = `${x}px`;
        creature.style.top = `${y}px`;
        
        document.body.appendChild(creature);
        creatures.push(creature);

        // Start random movement after spawn
        setTimeout(() => {
            creature.classList.remove('spawn');
            setInterval(() => {
                if (creepyModeActive) {
                    positionCreature(creature);
                }
            }, 2000 + Math.random() * 1000);
        }, 500);
    }

    function spawnCreatures() {
        if (!creepyModeActive) return;
        
        function spawnBatch() {
            if (!creepyModeActive) return;
            
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    if (!creepyModeActive) return;
                    // Random edge spawn
                    const edge = Math.floor(Math.random() * 4);
                    let x, y;
                    switch(edge) {
                        case 0: // top
                            x = Math.random() * window.innerWidth;
                            y = -50;
                            break;
                        case 1: // right
                            x = window.innerWidth + 50;
                            y = Math.random() * window.innerHeight;
                            break;
                        case 2: // bottom
                            x = Math.random() * window.innerWidth;
                            y = window.innerHeight + 50;
                            break;
                        case 3: // left
                            x = -50;
                            y = Math.random() * window.innerHeight;
                            break;
                    }
                    spawnCreatureFromPosition(x, y);
                }, i * 200);
            }
        }

        spawnBatch();
        setInterval(spawnBatch, 20000);
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
