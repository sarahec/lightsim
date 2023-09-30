# Lightsim Product Requirements

Lightsim builds web-based simulations differently from the big authoring tools: it's a framework and build system to
using Markdown and Javascript that builds lightweight web apps. 

## Audience

This is build for Instructional Designers / Learning Designers / Learning Engineers who aren't afraid of source code
and who have built web pages before. In particular, developers should be comfortable with:

* Writing in Markdown
* Writing simple Javascript functions (ES6 and later)
* Writing simple HTML in Markdown (e.g. image tags, input types, class names, etc.)
* Writing or editing CSS to readch styling requirements.
* Running basic command line tools sych as Yarn
* Deploying files to a web server.

## Simulation types

Lightsim builds state-machine based simulations integrated with a model. Some common uses are:

* "Branching path" simulations with the ability to collapse common branches together
* Circular paths in simulations (e.g. exploration from a central starting point)
* Device/screen simulations (such as for data entry)

## The content model

The model is screen based, with text and images, and with clickable areas and value inputs. A shared model 
object acts as a whiteboard for tracking values (for decision making and to show on screen). Standard hooks control
screen visibility, alter control flow, implement breakpoints, and implement time-based simulations.

Screen flows may be grouped into scenarios. Scenarios have their own custom setup hooks.

## Reporting

Reporting is via SCORM or CMI-5.

## Data persistance

The model object should persist between runs and work with LMS/LRS bookmarks. 

## Authoring help 

Anything beyond basic markdown will be provided as sample code or snippets. This includes data display, inputs, LMS
metadata, etc.

The framework validates the navigation path (i.e. no missed pages, no paths to non-existent pages, etc.)

## Deployment

Generated simulations will be performant, self-contained web apps and able to run offline.
