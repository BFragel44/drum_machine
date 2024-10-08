
var sound_one = new Howl({src: ['drum_assets/DR-110Kick.wav'], preload: true});
var sound_two = new Howl({src: ['drum_assets/DR-110Snare.wav'], preload: true});
var sound_three = new Howl({src: ['drum_assets/DR-110Hat_C.wav'], preload: true});
var sound_four = new Howl({src: ['drum_assets/DR-110Clap.wav'], preload: true});
var metro_click = new Howl({src: ['drum_assets/metronome.wav'], preload: true});

const soundMap = {
    sound_one: sound_one,
    sound_two: sound_two,
    sound_three: sound_three,
    sound_four: sound_four
};

document.getElementById('start-btn').addEventListener('click', startSequence);
document.getElementById('stop-btn').addEventListener('click', stopSequence);
document.getElementById('clear-btn').addEventListener('click', clearPattern);

let isPlaying = false;
let tempo = 120;
let interval;
let globalVolume = 50;

document.getElementById('tempo-control').addEventListener('input', function () {
    tempo = this.value;
    document.querySelector('.tempo-display').innerText = `${tempo} BPM`;
    if (isPlaying) {
        stopSequence();
        startSequence();
    }
});

document.getElementById('volume-control').addEventListener('input', function () {
    globalVolume = this.value;
    Howler.volume(globalVolume / 100);
    document.querySelector('.volume-display').innerText = `Vol: ${globalVolume}%`;
});

document.querySelectorAll('.step-block-digits').forEach(digit => {
    digit.addEventListener('click', function () {
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

// change totalSteps based on which .step-block-digits button is selected
document.querySelectorAll('.step-block-digits').forEach(digit => {
    digit.addEventListener('click', function () {
        totalSteps = parseInt(this.innerText);
        console.log(`Total steps: ${totalSteps}`);
    });
});


// Play the corresponding sound for top drum pads
document.querySelectorAll('.drum-pad').forEach(pad => {
    pad.addEventListener('click', function() {
        // Remove 'selected' class from all drum pads
        document.querySelectorAll('.drum-pad').forEach(p => p.classList.remove('selected'));
        // Add 'selected' class to the clicked pad
        this.classList.add('selected');
        if (this.classList.contains('drum-one')) {
            sound_one.play();
        } else if (this.classList.contains('drum-two')) {
            sound_two.play();
        } else if (this.classList.contains('drum-three')) {
            sound_three.play();
        } else if (this.classList.contains('drum-four')) {
            sound_four.play();
        }
    });
});

function startSequence() {
    if (!isPlaying) {
        isPlaying = true;
        interval = setInterval(playPattern, (60000 / tempo) / 4); // Adjusts for tempo and timing
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
            console.log(`selected status: ${this.classList.contains('selected')}`);
        } else {
            // If the step is already selected, remove the velocity
            this.classList.remove('soft', 'medium', 'hard');
            this.removeAttribute('data-velocity');
            console.log(`selected status: ${this.classList.contains('selected')}`);
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

                console.log(`Playing sound: ${soundKey}, volume: ${volume}, velocity: ${velocity}`);
                sound.volume(volume);
                sound.play();
            }
        } else {
            console.log("Step is not selected and will not play.");
        }
    });
    // Update the .step-digits div to show the current step number
    document.querySelector('.step-digits').innerText = (currentStep + 1).toString().padStart(2, '0'); // Assuming steps are 1-indexed and padded to 2 digits

    // Move to the next step, loops back to the first step after 16
    currentStep = (currentStep + 1) % totalSteps;
    console.log(`Current step: ${currentStep}`);
}

const patterns = {
    1: { steps: [], blocks: [] },
    2: { steps: [], blocks: [] },
    3: { steps: [], blocks: [] },
    4: { steps: [], blocks: [] },
    5: { steps: [], blocks: [] },
    6: { steps: [], blocks: [] }
};

// Function to update the current pattern
function updateCurrentPattern() {
    const pattern = {
        steps: [],
        blocks: []
    };
    document.querySelectorAll('.step-pad').forEach(step => {
        pattern.steps.push({
            selected: step.classList.contains('selected'),
            velocity: step.getAttribute('data-velocity') || 'medium'
        });
    });
    document.querySelectorAll('.step-block-button').forEach(block => {
        pattern.blocks.push({
            selected: block.classList.contains('selected')
        });
    });
    patterns[currentPattern] = pattern;
    console.log(`Pattern ${currentPattern} updated.`);
}

// Event listeners for step pads
document.querySelectorAll('.step-pad').forEach(step => {
    step.addEventListener('click', function () {
        this.classList.toggle('selected');
        updateCurrentPattern();
    });
});

// Event listeners for step block buttons
document.querySelectorAll('.step-block-button').forEach(block => {
    block.addEventListener('click', function () {
        this.classList.toggle('selected');
        updateCurrentPattern();
    });
});

// Add event listeners to the pattern buttons
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
            if (pattern[index] && pattern[index].selected) {
                step.classList.add('selected');
                step.classList.add(pattern[index].velocity);
                step.setAttribute('data-velocity', pattern[index].velocity);
            } else {
                step.removeAttribute('data-velocity');
            }
        });
        document.querySelectorAll('.step-block-button').forEach((block, index) => {
            block.classList.remove('selected');
            if (pattern.blocks[index] && pattern.blocks[index].selected) {
                block.classList.add('selected');
            }
        });
        console.log(`Pattern ${patternNumber} loaded.`);
    } else {
        console.log(`Pattern ${patternNumber} not found.`);
    }
}

// Load the default pattern on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPattern(currentPattern);
});