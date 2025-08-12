// initialise jspysch
var jsPsych = initJsPsych({
    on_finish: function() {
        jsPsych.data.displayData();
    }
});

// set out the factors you want to cross in the factorial design
var factors = {
    image: ['Dog1.jpg', 'Dog2.jpg', 'Dog3.jpg'],
    duration: [400, 800, 1200]
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

// link the trials with the factorial_values variable
var trials_with_variables = {
    timeline: [trial],
    timeline_variables: factorial_values
};

// run it
jsPsych.run([trials_with_variables]);