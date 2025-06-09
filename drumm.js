const sound_one = new Howl({
    src: ['drum_assets/DR-110Kick.wav'], 
    preload: true, mute: false, stereo: 0.0
});
const sound_two = new Howl({
    src: ['drum_assets/DR-110Snare.wav'], 
    preload: true, mute: false, stereo: 0.0
});
const sound_three = new Howl({
    src: ['drum_assets/DR-110Hat_C.wav'], 
    preload: true, mute: false, stereo: 0.0
});
const sound_four = new Howl(
    {src: ['drum_assets/DR-110Hat_O.wav'], 
    preload: true, mute: false, stereo: 0.0
});

const soundMap = {
    "sound_one": sound_one,
    "sound_two": sound_two,
    "sound_three": sound_three,
    "sound_four": sound_four
};

let isPlaying = false;
let tempo = 120;
let interval;
let globalVolume = 50;

// Event listeners for start, stop, and clear buttons
document.getElementById('start-btn').addEventListener('click', startSequence);
document.getElementById('stop-btn').addEventListener('click', stopSequence);
document.getElementById('clear-btn').addEventListener('click', clearPattern);

// Event listener for tempo control
document.getElementById('tempo-control').addEventListener('input', function () {
    tempo = this.value;
    document.querySelector('.tempo-display').innerText = `${tempo} BPM`;
    if (isPlaying) {
        stopSequence();
        startSequence();
    }
});

// Event listener for volume control
document.getElementById('volume-control').addEventListener('input', function () {
    globalVolume = this.value;
    Howler.volume(globalVolume / 100);
    document.querySelector('.volume-display').innerText = `Vol: ${globalVolume}%`;
});

// Event listener for the step block digit "selected" logic
document.querySelectorAll('.step-block-digits').forEach(digit => {
    digit.addEventListener('click', function () {
        // Get the data-value attribute of the clicked button
        const pattern = patterns[currentPattern];
        pattern.blocks = parseInt(this.getAttribute('data-value'));
        // Add dataValue to totalSteps
        totalSteps = pattern.blocks;
        console.log(`Total steps: ${totalSteps}`);
        // Check if the clicked element is the left-most button
        if (this.previousElementSibling === null) {
            // If it is the left-most button, ensure it remains selected
            this.classList.add('selected-amount');
            // Remove the class from all next siblings
            let nextSibling = this.nextElementSibling;
            while (nextSibling) {
                nextSibling.classList.remove('selected-amount');
                nextSibling = nextSibling.nextElementSibling;
            }
            return; // Exit the function early
        }
        // Toggle the selected-amount class on the clicked element
        this.classList.toggle('selected-amount');
        // Get all previous siblings and add the selected-amount class to them
        let previousSibling = this.previousElementSibling;
        while (previousSibling) {
            previousSibling.classList.add('selected-amount');
            previousSibling = previousSibling.previousElementSibling;
        }
        // If the clicked element is deselected, remove the class from all next siblings
        if (!this.classList.contains('selected-amount')) {
            let nextSibling = this.nextElementSibling;
            while (nextSibling) {
                nextSibling.classList.remove('selected-amount');
                nextSibling = nextSibling.nextElementSibling;
            }
        }
    });
});

// Play the drum preview sound
document.querySelectorAll('.preview-btn').forEach(pad => {
    pad.addEventListener('click', function() {
        var sound = null;
        if (pad.getAttribute('data-sound') === 'sound_one') {
            sound = sound_one;
        } else if (this.getAttribute('data-sound') === 'sound_two') {
            sound = sound_two;
        } else if (this.getAttribute('data-sound') === 'sound_three') {
            sound = sound_three;
        } else if (this.getAttribute('data-sound') === 'sound_four') {
            sound = sound_four;
        }
        if (sound) {
            this.classList.add('selected');
            let id = sound.play();
            sound.on('end', (soundId) => {
                this.classList.remove('selected');
            });
        }  
    });
});

// Solo all sounds with this button selected
document.querySelectorAll('.solo-btn').forEach(s => {
    s.addEventListener('click', function () {
        const soundKey = this.getAttribute('data-sound'); // The sound key for the selected sound
        const soloSound = soundMap[soundKey]; // The Howl object for the selected sound
        const currentState = this.getAttribute('data-state'); // Get the current state of the button

        // Toggle the button state - toggle between 'unsoloed' and 'soloed'
        const newState = currentState === 'unsoloed' ? 'soloed' : 'unsoloed';
        this.setAttribute('data-state', newState);

        // If the current button is being soloed
        if (newState === 'soloed') {
            // Mute all other sounds except for those already soloed or the one just soloed
            document.querySelectorAll('.solo-btn').forEach(otherSoloBtn => {
                const otherSoundKey = otherSoloBtn.getAttribute('data-sound');
                const otherSound = soundMap[otherSoundKey];
                const otherState = otherSoloBtn.getAttribute('data-state');

                if (otherSoundKey !== soundKey && otherState !== 'soloed') {
                    // Mute any sound that is not already soloed
                    otherSound.mute(true);
                    const muteBtn = document.querySelector(`.mute-btn[data-sound="${otherSoundKey}"]`);
                    if (muteBtn) {
                        muteBtn.setAttribute('data-state', 'muted');
                    }
                }
            });

            // Ensure the soloed sound is not muted
            soloSound.mute(false);
            const muteBtn = document.querySelector(`.mute-btn[data-sound="${soundKey}"]`);
            if (muteBtn) {
                muteBtn.setAttribute('data-state', 'unmuted');
            }
        } else {
            // If the current button is being unsoloed, check if any other solo buttons are still active
            const anySoloed = Array.from(document.querySelectorAll('.solo-btn'))
                .some(btn => btn.getAttribute('data-state') === 'soloed');

            if (anySoloed) {
                // If there are other solo buttons still active, mute this sound
                soloSound.mute(true);
                const muteBtn = document.querySelector(`.mute-btn[data-sound="${soundKey}"]`);
                if (muteBtn) {
                    muteBtn.setAttribute('data-state', 'muted');
                }
            } else {
                // If no other solo buttons are active, unmute all sounds
                document.querySelectorAll('.mute-btn').forEach(muteBtn => {
                    const otherSoundKey = muteBtn.getAttribute('data-sound');
                    const otherSound = soundMap[otherSoundKey];
                    otherSound.mute(false);
                    muteBtn.setAttribute('data-state', 'unmuted');
                });
            }
        }
    });
});

// Mute the selected sound
document.querySelectorAll('.mute-btn').forEach(m => {
    m.addEventListener('click', function () {
        const soundKey = this.getAttribute('data-sound');
        const muteSound = soundMap[soundKey];
        const currentState = this.getAttribute('data-state');

        if (muteSound) {
            const newState = currentState === 'unmuted' ? 'muted' : 'unmuted';
            this.setAttribute('data-state', newState);

            if (newState === 'muted') {
                muteSound.mute(true);
                console.log(`${soundKey} muted`);

                // Deactivate the corresponding solo button if it exists
                const soloBtn = document.querySelector(`.solo-btn[data-sound="${soundKey}"]`);
                if (soloBtn) {
                    soloBtn.setAttribute('data-state', 'unsoloed');
                }
            } else {
                muteSound.mute(false);
                console.log(`${soundKey} unmuted`);
            }
        } else {
            console.log(`No sound found for key: ${soundKey}`);
        }
    });
});

// Pan the selected sound
document.querySelectorAll('.pan-control').forEach(pan => {
    pan.addEventListener('input', function () {
        const soundKey = this.getAttribute('data-sound');
        const panSound = soundMap[soundKey];
        const panValue = parseFloat(this.value);
        if (panSound) {
            panSound.stereo(panValue);
        }
    });
});

function startSequence() {
    if (!isPlaying) {
        isPlaying = true;
        interval = setInterval(playPattern, (60000 / tempo) / 4);
    }
};

let pressCount = 0;

function stopSequence() {
    if (isPlaying) {
        isPlaying = false;
        clearInterval(interval);
        console.log('Sequence stopped');
    }
    pressCount++;

    // If pressed a second time, reset step digits
    if (pressCount >= 2) {
        resetSequence();
    }
}

function resetSequence() {
    currentStep = 0;
    pressCount = 0;
    document.querySelector('.step-digits').innerText = '01';
    document.querySelectorAll('.step-pad').forEach(step => step.classList.remove('active-step'));
    console.log('Sequence reset');
}

function clearPattern() {
    // Reset or clear the current pattern
    document.querySelectorAll('.step-pad').forEach(step => {
        step.classList.remove('selected', 'soft', 'medium', 'hard');
        step.removeAttribute('data-velocity');
    });
};


let currentPattern = '1'; // Default pattern

// Pattern button clicks
document.querySelectorAll('.pattern-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        currentPattern = this.getAttribute('data-pattern');
        document.querySelectorAll('.pattern-display').forEach(display => {
            display.innerText = `Pattern: ${currentPattern}`;
        });
        // Add visual feedback for the pattern buttons
        document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('selected-pattern'));
        this.classList.add('selected-pattern');
    });
});


let totalSteps = 16; // will be updated based on [16, 32, 48, 64] step buttons
let currentChunk = 1; // Start with the first chunk
let currentStep = 0; // current step in the sequencer
let currentVelocity = 'medium'; // Default velocity

// .step-slider flips between 1-16, 32, 48, 64 steps for editing patterns
function updateChunkDisplay() {
    // Hide all .step-buttons not in the current chunk, .step-buttons chunk-1 is the default
    document.querySelectorAll('.step-buttons').forEach(step => {
        if (step.classList.contains(`chunk-${currentChunk}`)) {
            step.style.display = 'flex';
        } else {
            step.style.display = 'none';
        }
    });
}

// .step-slider flips between 1-16, 32, 48, 64 steps for editing patterns
document.querySelector('.step-slider').addEventListener('input', function () {
    currentChunk = parseInt(this.value);
    updateChunkDisplay();
});

// Called on page load to set default chunk-1
updateChunkDisplay();

// Velocity button clicks
document.querySelectorAll('.velocity-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        currentVelocity = this.getAttribute('data-velocity'); // Get the velocity (soft, medium, hard)
        console.log(currentVelocity);
        // Add visual feedback for the S, M, H buttons
        document.querySelectorAll('.velocity-btn').forEach(b => b.classList.remove('selected-velocity'));
        this.classList.add('selected-velocity');
    });
});

// Handle step pad clicks to set the velocity for each step
document.querySelectorAll('.step-pad').forEach(step => {
    step.addEventListener('click', function () {
        if (!this.classList.contains('selected')) {
            // If the step is selected, set the velocity
            this.classList.add(currentVelocity);
            this.setAttribute('data-velocity', currentVelocity);
        } else {
            // If the step is already selected, remove the velocity
            this.classList.remove('soft', 'medium', 'hard');
            this.removeAttribute('data-velocity');
        }
    });
});


// Controls the playback of the pattern, visual metronome
function playPattern() {
    document.querySelectorAll('.step-row').forEach(row => {
        const buttons = row.querySelectorAll('.step-pad');

        // Remove the 'active-step' class from all steps
        buttons.forEach(step => step.classList.remove('active-step'));

        // Highlight the current step
        const currentPad = buttons[currentStep];
        currentPad.classList.add('active-step');

        // Check if the step is selected before playing sound
        if (currentPad.classList.contains('selected')) {
            const soundKey = currentPad.getAttribute('data-sound');
            const sound = soundMap[soundKey];

            if (sound) {
                // Adjust volume based on velocity
                const velocity = currentPad.getAttribute('data-velocity') || 'medium';
                let volume = 1.0;

                if (velocity === 'soft') {
                    volume = 0.5;
                } else if (velocity === 'hard') {
                    volume = 1.5;
                }
                sound.volume(volume);
                sound.play();
            }
        }
    });
    // Update the .step-digits div to show the current step number
    document.querySelector('.step-digits').innerText = (currentStep + 1).toString().padStart(2, '0'); // Assuming steps are 1-indexed and padded to 2 digits

    // Move to the next step, loops back to the first step after 16
    currentStep = (currentStep + 1) % totalSteps;
}

let patterns = {
    1: { steps: [], blocks: 16 },
    2: { steps: [], blocks: 16 },
    3: { steps: [], blocks: 16 },
    4: { steps: [], blocks: 16 },
    5: { steps: [], blocks: 16 },
    6: { steps: [], blocks: 16 }
};

// Function to update the current pattern STEPS and BLOCKS
function updateCurrentPattern() {
    let pattern = {
        steps: [],
        // blocks: 16
        // preserve the selected number of blocks for the pattern instead of hardcoding at 16
        blocks: totalSteps
    };
    document.querySelectorAll('.step-pad').forEach(step => {
        pattern.steps.push({
            selected: step.classList.contains('selected'),
            velocity: step.getAttribute('data-velocity') || 'medium'
        });
    });
    patterns[currentPattern] = pattern;
    console.log(pattern);
    console.log(`Pattern ${currentPattern} updated.`);
}

// Event listeners for step pads
document.querySelectorAll('.step-pad').forEach(step => {
    step.addEventListener('click', function () {
        this.classList.toggle('selected');
        updateCurrentPattern();
    });
});

// Add event listeners for pattern buttons, runs loadPattern()
document.querySelectorAll('.pattern-btn').forEach(button => {
    button.addEventListener('click', function () {
        // Remove the 'selected-pattern' class from all buttons
        document.querySelectorAll('.pattern-btn').forEach(btn => btn.classList.remove('selected-pattern'));

        // Add the 'selected-pattern' class to the clicked button
        this.classList.add('selected-pattern');

        // Update the current pattern
        currentPattern = this.getAttribute('data-pattern');
        document.querySelectorAll('.pattern-display').forEach(display => {
            display.innerText = `Pattern: ${currentPattern}`;
        });

        // Load the selected pattern
        loadPattern(currentPattern);
    });
});


// Function to load a stored pattern
function loadPattern(patternNumber) {
    const pattern = patterns[patternNumber];
    if (pattern) {
        document.querySelectorAll('.step-pad').forEach((step, index) => {
            step.classList.remove('selected', 'soft', 'medium', 'hard');
            if (pattern.steps[index] && pattern.steps[index].selected) {
                step.classList.add('selected');
                step.classList.add(pattern.steps[index].velocity);
                step.setAttribute('data-velocity', pattern.steps[index].velocity);
            } else {
                step.removeAttribute('data-velocity');
            }
        });
        // Update the totalSteps and step-block button selection based on the pattern
        document.querySelectorAll('.step-block-digits').forEach((block) => {
            // remove all existing selected-amount classes
            block.classList.remove('selected-amount');
            // Get the data-value attribute of the clicked button
            const dataValue = parseInt(block.getAttribute('data-value'));
            if (pattern.blocks >= dataValue) {
            block.classList.add('selected-amount');
            totalSteps = dataValue;
            }
        console.log(`totalSteps: ${totalSteps}`);
        });

// Load the default pattern on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPattern(currentPattern);
});
}};
