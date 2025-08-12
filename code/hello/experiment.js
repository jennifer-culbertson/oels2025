// initialise jspysch
var jsPsych = initJsPsych({
    on_finish: function() {
        jsPsych.data.displayData();
    }
});

// create a trial, using a plugin, this one creates image stimuli
var star_trial = {
    type: jsPsychImageKeyboardResponse,
    stimulus: 'nasa_proxima.png'
}

// add another image trial
var image2_trial = {
    type: jsPsychImageKeyboardResponse,
    stimulus: 'Cat1.jpg'
}

// run the trial
jsPsych.run([star_trial,image2_trial]);