---
title: Week 2 practical
description: Basics of jsPsych and javascript
---

## The plan for week 2 practical

This week we are going to look at a little bit more of the [Online Experiments with jsPsych tutorial](https://softdev.ppls.ed.ac.uk/online_experiments/index.html), then next week we'll be in a position to start looking at code for actual experiments. Remember, the idea is that you can work through these practicals in the lab classes and, if necessary, in your own time (e.g. if you want to make a start before the lab class, or if you don't complete the practical in the lab class) - the lab class provides dedicated time each week to focus on doing the practicals with on-tap support from the teaching team, but you may need more than the 2 hours to get these practicals done. We are happy to help with the previous week's class if you tried to finish it off in your own time and need some help.

## Tutorial content

- Work through sections 04 and 05 of [the Online Experiments with jsPsych tutorial](https://softdev.ppls.ed.ac.uk/online_experiments/), completing the exercises in those sections. 

The key things you need to take away from the tutorial are:
- How to display results on-screen at the end of the experiment.
- The general gist of timeline variables - we won't be doing anything with factorial designs, and in general I prefer creating trial lists with for-loops and functions rather than using timeline variables, but it's handy to see how it's done in case you prefer that style. 
- Some basics of javascript, including for-loops and the bare bones of defining a function that returns some value - we'll make extensive use of functions and for-loops when building our timelines.

Some tips on points that might cause confusion:
- One of the exercises in section 04 mentions adding a fixation cross. A fixation cross is just a cross or point on the screen, usually in the center, which is intended to get the participant looking at the screen in a specific location (e.g. where a stimulus will appear later). When it comes to creating your own `fixation` trial, have a think about how you could use the plugins you have already seen to put a cross-like thing on screen, and how you could have it appear for a fixed duration (e.g. 1000ms), which is how fixation crosses usually work. I think figuring this kind of thing out is the heart of building a jsPsych experiment - how do I use the plugins I know about (or that I haven't used before but are provided by jsPsych) to achieve a particular on-screen effect I am looking for? So take your time with this one rather than just jumping straight to looking at the answer!

## Re-use

All aspects of this work are licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).
