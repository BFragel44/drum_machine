
var sound_one = new Howl({
    src: ['drum_assets/DR-110Kick.wav'],
    volume: 1.0,
});

var sound_two = new Howl({
    src: ['drum_assets/DR-110Snare.wav'],
    volume: 1.0,
});

var sound_three = new Howl({
    src: ['drum_assets/DR-110Hat_C.wav'],
    volume: 1.0,
});

var sound_four = new Howl({
    src: ['drum_assets/DR-110Clap.wav'],
    volume: 1.0,
});

var metro_click = new Howl({
    src: ['drum_assets/metronome.wav'],
    volume: 1.0,
});

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

        // Play the corresponding sound
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

document.querySelectorAll('.step-button button').forEach(button => {
    button.addEventListener('click', function() {
        this.classList.toggle('selected');
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


let currentVelocity = 'medium'; // Default velocity

// Handle velocity button clicks
document.querySelectorAll('.velocity-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        currentVelocity = this.getAttribute('data-velocity'); // Get the velocity (soft, medium, hard)
        
        // Add visual feedback for the selected velocity button
        document.querySelectorAll('.velocity-btn').forEach(b => b.classList.remove('selected-velocity'));
        this.classList.add('selected-velocity');
    });
});



let currentStep = 0;

function playPattern() {
    // Iterate over each row in the sequencer
    document.querySelectorAll('.step-row').forEach(row => {
        const buttons = row.querySelectorAll('.step-pad');

        // Remove the 'active-step' class from all steps
        buttons.forEach(step => step.classList.remove('active-step'));

        // Highlight the current step
        const currentPad = buttons[currentStep];
        currentPad.classList.add('active-step');

        // Play the sound if the step is selected
        if (currentPad.classList.contains('selected')) {
            const soundKey = currentPad.getAttribute('data-sound');
            const sound = soundMap[soundKey];

            if (sound && sound.state() === 'loaded') {
                sound.play();
            }
        }
    });

    // Move to the next step
    currentStep = (currentStep + 1) % 16; // Loop back to the first step after 16
}

function playSound(sound) {
    if (sound === 'sound_one') {
        sound_one.play(); // kick drum
    } else if (sound === 'sound_two') {
        sound_two.play(); // snare drum
    } else if (sound === 'sound_three') {
        sound_three.play(); // hi-hat
    } else if (sound === 'sound_four') {
        sound_four.play(); // clap
    }
}

document.querySelectorAll('.step-pad').forEach(step => {
    step.addEventListener('click', function () {
        this.classList.toggle('selected'); // Toggle selected state
    });
});

document.getElementById('volume-control').addEventListener('input', function () {
    var volume = this.value / 10; // Scale to 0-1 for Howler.js
    sound_one.volume(volume);
    sound_two.volume(volume);
    sound_three.volume(volume);
    sound_four.volume(volume);
});