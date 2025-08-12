// initialise jspysch
var jsPsych = initJsPsych({
    on_finish: function() {
        jsPsych.data.displayData();
    }
});

// store some image filenames in a variable
var variables = [
    { image: "Dog1.jpg" },
    { image: "Dog2.jpg" },
    { image: "Cat1.jpg" },
    { image: "Cat2.jpg" }
];

// create a trial, using a plugin, this one creates image stimuli
var trial = {
    type: jsPsychImageKeyboardResponse,
    stimulus: jsPsych.timelineVariable("image")
}

// create a set of trials with stimuli specified using the list of filenames above
// var trials_with_variables = {
//     timeline: [trial],
//     timeline_variables: variables
// };

// create a new variable that repeats the images 5 times in random order
var repeated_variables = jsPsych.randomization.repeat(variables, 5);

// create a set of trials with the repeated stimuli specified
var trials_with_variables = {
    timeline: [trial],
    timeline_variables: repeated_variables
};


// run the trial
jsPsych.run([trials_with_variables]);