
var sound_one = new Howl({src: ['drum_assets/DR-110Kick.wav']});
var sound_two = new Howl({src: ['drum_assets/DR-110Snare.wav']});
var sound_three = new Howl({src: ['drum_assets/DR-110Hat_C.wav']});
var sound_four = new Howl({src: ['drum_assets/DR-110Clap.wav']});
var metro_click = new Howl({src: ['drum_assets/metronome.wav']});

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

document.getElementById('tempo-control').addEventListener('input', function () {
    tempo = this.value;
    document.querySelector('.tempo-display').innerText = `Tempo: ${tempo} BPM`;
    if (isPlaying) {
        stopSequence();
        startSequence();
    }
});

document.querySelectorAll('.drum-pad').forEach(pad => {
    pad.addEventListener('click', function() {
        // Remove 'selected' class from all drum pads
        document.querySelectorAll('.drum-pad').forEach(p => p.classList.remove('selected'));

        // Add 'selected' class to the clicked pad
        this.classList.add('selected');

        // Play the corresponding sound for top drum pads
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
}

function stopSequence() {
    isPlaying = false;
    clearInterval(interval);
}

function clearPattern() {
    // Reset or clear the current pattern
}
let currentStep = 0;
let currentVelocity = 'medium'; // Default velocity

// Handle velocity button clicks
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
        // Toggle selected state
        this.classList.toggle('selected'); 
        
        // Remove any previous velocity class
        this.classList.remove('soft', 'medium', 'hard');

        // Add the current velocity class
        this.classList.add(currentVelocity);

        // Mark step as selected
        this.classList.toggle('selected');
        this.setAttribute('selected', true);
        console.log('currentVelocity =', currentVelocity);
        console.log('selected =', this.getAttribute('selected'));
        // Store the velocity data on the element
        this.setAttribute('data-velocity', currentVelocity);
    });
});

// ******velocity pad playPattern version******
function playPattern() {
    document.querySelectorAll('.step-row').forEach(row => {
        const buttons = row.querySelectorAll('.step-pad');

        // Remove the 'active-step' class from all steps
        buttons.forEach(step => step.classList.remove('active-step'));

        // Highlight the current step
        const currentPad = buttons[currentStep];
        currentPad.classList.add('active-step');

        // Check if the step is selected
        if (currentPad.classList.contains('selected')) {
            const soundKey = currentPad.getAttribute('data-sound');
            const sound = soundMap[soundKey];
            console.log('soundKey =', soundKey);

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
                // Set the volume and play the sound
                sound.volume(volume);
                sound.play();
            }
        }
    });
    // Move to the next step
    currentStep = (currentStep + 1) % 16; // Loop back to the first step after 16
}

document.querySelectorAll('.step-pad').forEach(step => {
    step.addEventListener('click', function () {
        this.classList.toggle('selected'); // Toggle selected state
    });
});
