// initialise jspysch
var jsPsych = initJsPsych({
    on_finish: function() {
        jsPsych.data.displayData();
    }
});

// set out the factors you want to cross in the factorial design
// here we also add variable fixation durations
var factors = {
    image: ['Dog1.jpg', 'Dog2.jpg', 'Dog3.jpg'],
    duration: [400, 800, 1200],
    fixation_duration: [250, 500, 750]
};

// now create the factorical list
var factorial_values = jsPsych.randomization.factorial(factors);
console.log(JSON.stringify(factorial_values));

// now create the trials with the stimuli and durations specified using the variable names above
var trial = {
    type: jsPsychImageKeyboardResponse,
    prompt: '<p>Press a key!</p>',
    stimulus: jsPsych.timelineVariable('image'),
    trial_duration: jsPsych.timelineVariable('duration')
};

// add the fixation cross subtrial
var fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: 'X',
    trial_duration: jsPsych.timelineVariable('fixation_duration'),
}

// link the trials with the factorial_values variable
// in each trial, there is a subtrial with a fixation cross then a subtrial with the image
var trials_with_variables = {
    timeline: [fixation, trial],
    timeline_variables: factorial_values
};

// add some instructions
var instructions = {
    type: jsPsychHtmlKeyboardResponse,
    prompt: '<p>Press a key to start!</p>',
    stimulus: 'Welcome to the experiment!<br>When you see an image press any key you like.'
}

// run it
jsPsych.run([instructions,trials_with_variables]);