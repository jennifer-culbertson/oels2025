/******************************************************************************/
/*** Preamble *****************************************************************/
/******************************************************************************/

/*
Participants alternate between two trial types:

Picture selection trials, where they hear audio from their partner (in fact recorded
audio from our confederate) and select the matching picture from 2 possibilities. 

Picture description trials, where they see a picture and produce a description for
their partner (clicking a mic icon to start and stop recording). 

We simulate the confederate preparing to speak and making a selection based on the 
participant's productions by inserting variable-duration "waiting for partner" screens.

We are interested in whether, on critical trials, the construction used by the partner
(featuring a redundant colour adjective) influences the description the participant 
produces.

The picture selection trials work in essentially the same was as picture selection
trials in the perceptual learning experiment.

Picture description trials are a series of html-audio-response trials, where we use 
the html stimulus to present a pair of images.
*/

/******************************************************************************/
/*** Initialise jspsych *******************************************************/
/******************************************************************************/

/*
As usual, we will dump all the trials on-screen at the end so you can see what's
going on. Note that data on critical trials is saved trial-by-trial as the experiment
runs, so unlike the word learning experiment we don't need to save all the data at 
the end of the experiment.
*/

var jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData("csv"); //dump the data to screen
  },
});

/******************************************************************************/
/*** Maintaining a list of images to preload **********************************/
/******************************************************************************/

/*
We can auto-load the audio used on audio-button-response trials.

Images which appear in buttons on picture selection trials are not automaticaly pre-loaded,
as we saw in the perceptual learning experiment

Our stimulus on picture description trials will *also* not be preloaded, because 
we have to make two images appear side-by-side, which involves using an 
html-audio-response trial (which doesn't automatically preload images) rather than 
an image-button-response trial (which does).

In order to preload images, we are going to look keep a list of images that appear in 
picture selection and picture description trials - we will build this list as we create
the trial list, then preload it when the experiment starts.
*/

//initially our images_to_preload list contains only 1 image, the microphone!
var images_to_preload = ["mic"];



/******************************************************************************/
/*** Generate a random participant ID *****************************************/
/******************************************************************************/

/*
We'll generate a random participant ID when the experiment starts, and use this
to save a separate set of data files per participant.
*/

var participant_id = jsPsych.randomization.randomID(10);


/******************************************************************************/
/*** Random waits *************************************************************/
/******************************************************************************/

/*
At several points in the code we want to generate a random wait, to simulate the
confederate participant pondering what to say or hunting for the correct image.
The random_wait function below will return a number between 1800 and 3000, which
be used as the delay (in milliseconds) on screens where the participant is waiting 
for the confederate.
*/

function random_wait() {
  return 1800 + Math.floor(Math.random() * 1200);
}


/******************************************************************************/
/*** Picture selection trials *************************************************/
/******************************************************************************/

/*
Picture selection: wait while the confederate prepares to click their mic button
(in reality, a random duration wait), then hear a description from the confederate
plus two pictures, then click on a picture.

make_picture_selection_trial takes the base name of the sound file to present,
and the base names of the target and foil pictures. It works out the path and full 
filename for the audio file,  then builds a 2-part trial 
(using a nested timeline): a short delay while we supposedly wait for the confederate
to speak (achieved using an audio-button-response trial with little bit of silence as 
the sound file) then an audio-button-response trial where the participant listens to 
the confederate audio and makes a selection. The function returns this trial object.

Note that the crucial selection_trial is closely based on the picture selection trials
in the perceptual learning experiment we covered last week - the main difference is that 
we shuffle the two buttons when creating the trial, since we need to show the choices 
in the same order in the pre-speaking delay and in the actual audio-button-response trial.
*/
function make_picture_selection_trial(sound, target_image, foil_image) {
  //add target_image and foil_image to our preload list
  images_to_preload.push(target_image);
  images_to_preload.push(foil_image);

  //create sound file name
  var sound_file = "sounds/" + sound + ".wav";

  //generate random wait and random order of images
  var wait_duration = random_wait();
  var shuffled_image_choices = jsPsych.randomization.shuffle([
    target_image,
    foil_image,
  ]);

  //trial for the delay before the partner starts speaking
  var waiting_for_partner = {
    type: jsPsychAudioButtonResponse,
    stimulus: "sounds/silence.wav",
    prompt: "<p><em>Click on the picture your partner described</em></p>",
    choices: shuffled_image_choices,
    trial_duration: wait_duration,
    response_ends_trial: false, //just ignore any clicks the participant makes here!
    button_html: function (choice) {
      return '<button class="jspsych-btn"> <img src="images/' + choice + '.png" style="width: 250px"></button>'
    }
  };

  //audio trial
  var selection_trial = {
    type: jsPsychAudioButtonResponse,
    stimulus: sound_file,
    prompt: "<p><em>Click on the picture your partner described</em></p>",
    choices: shuffled_image_choices,
    data: { participant_task: "picture_selection" }, //add a note that this is a picture selection trial
    save_trial_parameters: {choices: true}, //and we want to save the trial choices
    button_html: function (choice) {
      return '<button class="jspsych-btn"> <img src="images/' + choice + '.png" style="width: 250px"></button>'
    },
    post_trial_gap: 500, //a little pause after the participant makes their choice
    on_finish: function (data) {
      var button_number = data.response;
      data.button_selected = data.choices[button_number];
      save_confederate_priming_data(data); //save the trial data
    },
  };
  var full_trial = { timeline: [waiting_for_partner, selection_trial] };
  return full_trial;
}

/******************************************************************************/
/*** Infrastructure for recording audio ***************************************/
/******************************************************************************/

/*
On picture description trials we will be recording audio using the 
html-audio-response plugin. To do this we need to have the participant give us 
permission to access their mic, then select which mic to use. Permission to access 
the mic happens through a pop-up in the browser, but we warn them it is coming. 
For selecting their mic (which also initialises it) we can use the 
jsPsychInitializeMicrophone plugin. 

The code for saving the audio responses in in utilities.js, it works in essentially 
the same way as the usual save_data function. Fort each participant audio response 
it constructs a filename for the saved audio, which will consist of the participant ID 
and a unique number identifier corresponding to the current trial index.
*/

//A simple warning that they are going to have to grant access to the mic
var audio_permission_instructions = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Permission to access your microphone</h3>\
  <p style='text-align:left'>In this experiment you will be interacting with another participant. \
  You will be recording audio descriptions using your microphone, and listening to \
  descriptions your partner has recorded.</p>\
  <p style='text-align:left'><b>On the next screen we will ask for permission to access your microphone</b>. \
  When the pop-up appears asking for permission to access your microphone, please grant \
  access, otherwise the experiment won't work. </p>\
  <p style='text-align:left'>We will only record when you click the record button - you are always in control.</p>",
  choices: ["Continue"]
};

//then have them select a mic
var initialize_mic = {
  type: jsPsychInitializeMicrophone
};


/******************************************************************************/
/*** Picture description trials ********************************************/
/******************************************************************************/

/*
Picture description: see the picture to be described, click
on the mic icon to begin recording a description, then click on the mic icon to
stop recording, then finally wait while the confederate
prepares completes the picture selection task (in reality, a random duration wait).

make_picture_description_trial takes the name of the target and foil image to present, 
and constructs a composite HTML object showing those two images next to one another, with 
the target highlighted with a green box. It then constructs a 3-part trial (using a nested 
timeline). The 3 parts are:
1. Show the composite image plus white mic button, using html-button-response plugin. When 
  the participant clicks the mic button, we move on to 2.
2. Change mic orange and start recording audio (using the html-audio-response plugin). When
  the participant clicks the mic button again, stops recording audio.
3. Show a "waiting for partner" message.

In Loy & Smith (2021) we indicated the target picture with an arrow; here we are indicating 
the target using a green box (because it's easier to implement!).
*/

function make_picture_description_trial(target_image, foil_image) {
  //add target_image and foil_image to our preload list
  images_to_preload.push(target_image);
  images_to_preload.push(foil_image);

  //generate random wait 
  var wait_duration = random_wait();
  
  //need to highlight the target with a green border
  var target_image_as_html =
    "<img src=images/" +
    target_image +
    ".png style='border:5px solid green; width:250px'>";
  var foil_image_as_html =
    "<img src=images/" + foil_image + ".png style='width:250px'>";

  //shuffle and paste together into a composite bit of html
  var shuffled_images = jsPsych.randomization.shuffle([
    target_image_as_html,
    foil_image_as_html,
  ]);
  var composite_image = shuffled_images[0] + shuffled_images[1];
  var composite_image_with_prompt =
    composite_image + "<p><em>Describe the picture in the green box</em></p>";

  //html button response
  var picture_plus_white_mic = {
    type: jsPsychHtmlButtonResponse,
    stimulus: composite_image_with_prompt,
    choices: [
      '<img src="images/mic.png" style="background-color:white; width:75px">',
    ],
  };
  var record_audio = {
    type: jsPsychHtmlAudioResponse,
    stimulus: composite_image_with_prompt,
    recording_duration: 10000,
    done_button_label:
      '<img src="images/mic.png" style="background-color:Darkorange; width:75px">',
    data: { participant_task: "picture_description" , //add a note that this is a picture description trial
            target: target_image, //and record target and foil images
            foil: foil_image}, 

    on_finish: function (data) {
      //console.log(data.response) // uncomment this if you want to see what the encrypted audio looks like      
      save_confederate_priming_data(data);
    },
  };

  var waiting_for_partner = {
    type: jsPsychHtmlButtonResponse,
    stimulus: "Waiting for partner to select",
    choices: [],
    trial_duration: wait_duration,
    post_trial_gap: 500, //short pause after the confederate makes their selection
  };

  var full_trial = {
    timeline: [picture_plus_white_mic, record_audio, waiting_for_partner],
  };
  return full_trial;
}

/*
A note on saving audio data:

In an html-audio-response trial, we are collecting an audio recording from the participant.
It would therefore be sensible if the data we collected from these trials was an audio recording, i.e. a .wav or .mp3 file.
However, to conserve storage space, jsPsych instead saves the audio-response as a very long, encrypted string (i.e a series of
numbers and letters) that represents the audio. This can be transformed back into an audio file by the researcher at a later date.
For now, we are just saving that encrypted string into the participant's CSV file - just like we would save any other kind of response.
)
*/

/******************************************************************************/
/*** Write headers for data file **********************************************/
/******************************************************************************/

/*
Same as the perceptual learning practical.
*/
var write_headers = {
  type: jsPsychCallFunction,
  func: function () {
    var this_participant_filename = "cp_" + participant_id + ".csv";
    save_data(
      this_participant_filename,
      "participant_id,trial_index,participant_task,time_elapsed,sound_file,target_image,foil_image,button_choice0,button_choice1,button_selected,response,rt\n"
    );
  },
};

/******************************************************************************/
/*** Native English check *****************************************************/
/******************************************************************************/

/*
NB This wasn't included in the original study, but we want to show you how to 
use conditionals to screen participants.

We ask a simple yes-no question using the jsPsychSurveyMultiChoice plugin.
The on the following trial (native_english_check) we look at the response and 
either run or do not run an trial (nonnative_english_exclusion_screen) which 
participants cannot escape from - we run this if they do not meet our eligibilty 
criterion, i.e. if they are not native speakers or English, they end up stuck.
*/

// A simple 2-choice question
var native_english_question = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt: "Are you a native speaker of English?",
      name: "NativeEnglish",
      options: ["Yes", "No"],
      required: true,
    },
  ],
};

/* 
This is the screen participants will see if they report 
being a non-native speaker - note there are no choices, so it cannot be exited
to get to the rest of the experiment timeline!
*/
var nonnative_english_exclusion_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<p style='text-align:left'>Sorry, but we can only use native speakers of English in this experiment.</p>",
  choices: [],
};

/*
This is our conditional trial - we run timeline if the conditional_function returns true
*/
var native_english_check = {
  timeline: [nonnative_english_exclusion_screen],
  conditional_function: function () {
    // get the data from the last trial
    var data = jsPsych.data.get().last(1).values()[0];
    //retrieve their answer to the question - this will be Yes or No
    var answer = data.response.NativeEnglish;
    if (answer == "No") {
      //this means we *will* run the conditional timeline
      return true;
    } else {
      //this means we will not
      return false;
    }
  },
};

/******************************************************************************/
/*** Instruction trials *******************************************************/
/******************************************************************************/

/*
As usual, your experiment will need some instruction screens.
*/

var consent_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Welcome to the experiment</h3> \
  <p style='text-align:left'>Experiments begin with an information sheet that explains to the participant \
  what they will be doing, how their data will be used, and how they will be \
  remunerated.</p> \
  <p style='text-align:left'>This is a placeholder for that information, which is normally reviewed \
  as part of the ethical review process.</p>",
  choices: ["Yes, I consent to participate"],
};

var pre_interaction_instructions = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Instructions for interaction</h3>\
  <p style='text-align:left'>During the experiment, you will alternate between describing pictures \
  to your partner and matching pictures your partner describes to you.</p>\
  <p style='text-align:left'>When it is your turn to describe, you will see two pictures, one of which \
  will be highlighted with a green box. You should <u>describe the picture highlighted in the green box</u> to \
  your partner. Click the mic icon to start recording audio, then click again to stop. There are no rules \
  as to what you can or cannot say; you can name the object if you like. \
  Remember that your partner sees the same two pictures, but they may not be in the same positions \
  (left/right).</p>\
  <p style='text-align:left'>When it is your turn to match, simply click on the picture your partner \
  describes to you.</p>",
  choices: ["Continue"],
};

var final_screen = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<h3>Finished!</h3>\
  <p style='text-align:left'>Experiments often end with a final screen, e.g. that contains a completion\
  code so the participant can claim their payment.</p>\
  <p style='text-align:left'>Click Continue to finish the experiment and see your raw data. \
  Your trial was also saved to the server trial by trial.</p>",
  choices: ["Continue"],
};

/******************************************************************************/
/*** Saving data trial by trial ***********************************************/
/******************************************************************************/

/*
This is a slightly modification to Alisdair's save_data_line code. Note that data is
save to a file named cp_ID.csv, where cp stands for confederate priming and ID is
the randomly-generated participant ID.

We have to check which trial type we are selecting data for, since picture_description 
trials lack a button_selected entry. There's also no point 
saving the data.response info for picture_description trials, since it just indicates 
the participant clicking on the mic button, so we will save "NA" for those missing values.

*/
function save_confederate_priming_data(data) {
  // choose the data we want to save - this will also determine the order of the columns
  if (data.participant_task == "picture_selection") {
    var data_to_save = [
      participant_id,
      data.trial_index,
      data.participant_task,
      data.time_elapsed,
      data.stimulus,
      "NA",
      "NA", //'missing' target and foil image
      data.choices,
      data.button_selected,
      data.rt,
      data.response
    ];
  } else if (data.participant_task == "picture_description") {
    var data_to_save = [
      participant_id,
      data.trial_index,
      data.participant_task,
      data.time_elapsed,
      "NA", //'missing' sound file
      data.target,
      data.foil,
      "NA",
      "NA", //'missing' choices for description trials
      "NA", //'missing' button_selected
      data.response, // an encrypted string that represents the recorded audio
      data.rt
    ];
  }
  // join these with commas and add a newline
  var line = data_to_save.join(",") + "\n";
  var this_participant_filename = "cp_" + participant_id + ".csv";
  save_data(this_participant_filename, line);
}

/******************************************************************************/
/*** Reading the trial list from a CSV file ***********************************/
/******************************************************************************/

/*
This function reads the trial list provided in triallist_filename (using code in a 
separate file, read_from_csv.js), and converts it to a series of jsPsych trials. 
We read the trial list in as a javascript array using read_trial_list (defined 
in read_from_csv.js). Since reading the CSV file takes some time, we have to 
use the async and await functions to ensure that the CSV file has been read before we 
start processing it. We then use build_timeline to turn the array into a list of jsPsych 
trials. 
*/

async function read_trials_and_prepare_timeline(triallist_filename) {
  var trial_list = await read_trial_list(triallist_filename);
  console.log(trial_list)
  var interaction_trials = build_timeline(trial_list);
  var preload_trial = build_button_image_preload();
  var full_timeline = [].concat(
    consent_screen,
    native_english_question,
    native_english_check,
    audio_permission_instructions,
    initialize_mic,
    preload_trial,
    write_headers,
    pre_interaction_instructions,
    interaction_trials,
    final_screen
  );
  jsPsych.run(full_timeline);
}

/*
build_timeline takes a trial list read from a CSV and uses make_picture_selection_trial
and make_picture_description_trial to convert each row of that CSV file into a jsPsych trial, 
reading the relevant info from the appropriate columns in the CSV data structure.
*/
function build_timeline(trial_list) {
  var interaction_trials = [];
  for (trial of trial_list) {
    if (trial.participantRole == "match") {
      var match_trial = make_picture_selection_trial(
        trial.soundFile,
        trial.targetImage,
        trial.distractorImage
      );
      interaction_trials.push(match_trial);
    } else if (trial.participantRole == "direct") {
      var direct_trial = make_picture_description_trial(
        trial.targetImage,
        trial.distractorImage
      );
      interaction_trials.push(direct_trial);
    }
  }
  return interaction_trials;
}

/*
This simply wraps up the code to build the preload trial into a function, so we 
can call it once we've created our trial list (which will have built images_to_preload
for us).
*/

function build_button_image_preload() {
  var images_to_preload_with_path = [];
  for (image of images_to_preload) {
    var full_image_name = "images/" + image + ".png";
    images_to_preload_with_path.push(full_image_name);
  }

/*
Now we can make our preload trial
*/
  var preload = {
    type: jsPsychPreload,
    auto_preload: true,
    images: images_to_preload_with_path,
  };

  return preload;
}

/*
Finally, run the code to read the trial list and start the experiment - I have
provided two trial lists, overspecific_confederate.csv (a confederate who always produces
redundant colour adjectives) and minimal_confederate.csv (who never does).
*/
read_trials_and_prepare_timeline("minimal_confederate.csv");
