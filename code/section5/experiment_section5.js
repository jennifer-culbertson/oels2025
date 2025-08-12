var jsPsych = initJsPsych({
    on_finish: function() {
        jsPsych.data.displayData();
    }
});

// initialise the variable
var trials = [];

// create trial variable, using the looped variable as stimulus value
// push to the trial variable each time to fill it
// for (var i=1; i<11; i++) {
//     var trial = {
//         type: jsPsychHtmlKeyboardResponse,
//         stimulus: i,
//         trial_duration: 500,
//         response_ends_trial: false
//     }
//     trials.push(trial);
// }

// variable with each of the words to be shown
var sentence = ["I", "wandered", "lonely", "as", "a", "cloud"];

// create trial variable, using the looped variable as stimulus value
// push to the trial variable each time to fill it
for (var word of sentence) {
    var trial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: word,
        trial_duration: 500,
        response_ends_trial: false
    }
    trials.push(trial);
}


jsPsych.run(trials);