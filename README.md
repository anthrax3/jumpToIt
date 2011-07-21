jQuery trackIt Plugin - v0.1.0
==============================
Simple Google Analytics tools - event tracking, custom pages, etc  

_NOTE: This is pre-release software under active development! Not intended for use in production (yet)!_

_NOTE NOTE: Demo coming soon(ish)!_

Overview
--------
trackIt provides easy access to Google Analytic's event tracking API...  

###highlights:###

+ Event tracking
+ Set custom page names
+ Works in IE7-9 and the _reasonable_ browsers too!


Usage
-----

###setup###
For any element you'd like to show a tooltip for, simply assign a
target classname then include a data attribute with the content of your
tip. Like this:

    <a href="http://github.com" class="tip" data-tip="Secure source code hosting and collaborative development">example tooltip</a>

- - -

###basic###

    //initialize your target elements
    $("a.tip").tipIt();

- - -

###advanced###

    //configuration options
    $("a.tip").tipIt({
        id : "tmpl-ToolTip", //the id to assign to tipIt's container element
        container : "tipContainer", //css class to assign to container
        content : "tipContent", //css class to assign to content element
        right : "tipR", //css class assigned when standard tip is shown
        left : "tipL", //css class assigned when flipped tip is shown
        arrowR: "arrowR", //css class to assign to right-pointing arrow
        arrowL: "arrowL", //css class to assign to left-pointing arrow
        delay : 200 //delay in ms before tip is shown
    });

- - -

###support files###

**CSS**  
To display tips, tipIt merely drops css class names on to its container element and assigns a position. As such, you'll need to include the appropriate css rules in your project. Here's the basic ruleset:  

    .tipContainer {
      display: none;
      position: fixed;
      top: 0px;
      z-index:9997;
    }
    .tipContainer.tipR,
    .tipContainer.tipL {
      display:block;
    }
    .tipContent {
      display:block;
      padding: 5px;
      background: #000;
      background:rgba(0,0,0,0.7);
      color: #fff;
      font: bold 12px/10px arial;
      text-align: center;
      text-indent: 0;
      text-transform: none;
      text-shadow:none;
      vertical-align: 1px;
    }
    .tipR .tipContent {
      -webkit-border-radius: 0 3px 3px 0;
      -moz-border-radius: 0 3px 3px 0;
      border-radius: 0 3px 3px 0;
    }
    .tipL .tipContent {
      -webkit-border-radius: 3px 0 0 3px;
      -moz-border-radius: 3px 0 0 3px;
      border-radius: 3px 0 0 3px;
    }
    .arrowR,
    .arrowL {
      display:none;
      position:absolute;
      content: ".";
      text-indent:-9999px;
      border-style: solid;
      border-width: 10px;
      width: 0;
      height: 0;
      pointer-events:none;
      top:0;
    }
    .tipR .arrowR {
      display:block;
      left:-20px;
      border-color: transparent #000 transparent transparent;
      border-color: transparent rgba(0,0,0,0.7) transparent transparent;
    }
    .tipL .arrowL {
      display:block;
      right: -20px;
      border-color: transparent transparent transparent #000;
      border-color: transparent transparent transparent rgba(0,0,0,0.7);
    }

- - -

License
-------
jQuery tipIt Plugin  
Copyright (c) 2011 Matthew Mirande  
Dual licensed under the MIT or GPL Version 2 licenses.
