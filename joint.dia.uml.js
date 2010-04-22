/**
 * Joint.dia.uml 0.1.0 - Joint.dia plugin for creating UML diagrams.
 * Copyright (c) 2009 David Durman
 * Licensed under the MIT license: (http://www.opensource.org/licenses/mit-license.php)
 */
(function(global){	// BEGIN CLOSURE

var Joint = global.Joint;

var uml = Joint.dia.uml = {};
var Element = Joint.dia.Element;

var point = Joint.point;

/**
 * Predefined arrows for Class diagram.
 */
global.Joint.arrows.aggregation = function(size){
    return {
	path: ["M","7","0","L","0","5","L","-7","0", "L", "0", "-5", "z"],
	dx: 9, 
	dy: 9,
	attrs: { 
	    stroke: "black", 
	    "stroke-width": 2.0, 
	    fill: "black" 
	}
    };
};

uml.aggregationArrow = {
  endArrow: { type: "aggregation" },
  startArrow: {type: "none"},
  attrs: { "stroke-dasharray": "none" }
};
uml.dependencyArrow = {
  endArrow: { type: "basic", size: 5 },
  startArrow: {type: "none"},
  attrs: { "stroke-dasharray": "none" }
};
uml.generalizationArrow = {
  endArrow: { type: "basic", size: 10, attrs: {fill: "white"} },
  startArrow: {type: "none"},
  attrs: { "stroke-dasharray": "none" }
};

/**
 * Predefined arrow for StateChart.
 */
uml.arrow = {
    startArrow: {type: "none"},
    endArrow: {type: "basic", size: 5}, 
    attrs: {"stroke-dasharray": "none"}
};

/**
 * UML StateChart state.
 * @param raphael raphael paper
 * @param r rectangle
 * @param name string state name
 * @param attrs shape SVG attributes
 * @param actions object entry/exit/inner actions
 */
uml.State = Element.extend({
    object: "State",
    module: "uml",
    init: function(properties){
	// options
	var p = this.properties;
	var rect = p.rect = properties.rect;
	var radius = p.radius = properties.radius || 15;
	var attrs = p.attrs = properties.attrs || {};
	if (!p.attrs.fill){
	    p.attrs.fill = "white";
	}
	p.label = properties.label || "";
	p.labelOffsetX = properties.labelOffsetX || 20;
	p.labelOffsetY = properties.labelOffsetY || 5;
	p.swimlaneOffsetY = properties.swimlaneOffsetY || 18;
	if (!properties.actions){
	    properties.actions = {};
	}
	p.entryAction = properties.actions.entry || null;
	p.exitAction = properties.actions.exit || null;
	p.innerActions = properties.actions.inner || [];
	p.actionsOffsetX = properties.actionsOffsetX || 5;
	p.actionsOffsetY = properties.actionsOffsetY || 5;
	// wrapper
	this.setWrapper(this.paper.rect(rect.x, rect.y, rect.width, rect.height, radius).attr(attrs));
	// inner
	this.addInner(this.getLabelElement());
	this.addInner(this.getSwimlaneElement());
	this.addInner(this.getActionsElement());
    },
    getLabelElement: function(){
	var 
	p = this.properties,
	bb = this.wrapper.getBBox(),
	t = this.paper.text(bb.x, bb.y, p.label),
	tbb = t.getBBox();
	t.translate(bb.x - tbb.x + p.labelOffsetX, 
		    bb.y - tbb.y + p.labelOffsetY);
	return t;
    },
    getSwimlaneElement: function(){
	var bb = this.wrapper.getBBox(), p = this.properties;
	return this.paper.path(["M", bb.x, bb.y + p.labelOffsetY + p.swimlaneOffsetY, "L", bb.x + bb.width, bb.y + p.labelOffsetY + p.swimlaneOffsetY].join(" "));
    },
    getActionsElement: function(){
	// collect all actions
	var p = this.properties;
	var str = (p.entryAction) ? "entry/ " + p.entryAction + "\n" : "";
	str += (p.exitAction) ? "exit/ " + p.exitAction + "\n" : "";
	var l = p.innerActions.length;
	for (var i = 0; i < l; i += 2){
	    str += p.innerActions[i] + "/ " + p.innerActions[i+1] + "\n";
	}
	// trim
	str = str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

	// draw text with actions
	var 
	bb = this.wrapper.getBBox(),
	t = this.paper.text(bb.x + p.actionsOffsetX, bb.y + p.labelOffsetY + p.swimlaneOffsetY + p.actionsOffsetY, str),
	tbb = t.getBBox();
	t.attr("text-anchor", "start");
	t.translate(0, tbb.height/2);	// tune the y position
	return t;
    },
    zoom: function(){
	this.wrapper.attr("r", this.properties.radius); 	// set wrapper's radius back to its initial value (it deformates after scaling)
	this.inner[0].remove();	// label
	this.inner[1].remove();	// swimlane
	this.inner[2].remove();	// actions
	this.inner[0] = this.getLabelElement();
	this.inner[1] = this.getSwimlaneElement();
	this.inner[2] = this.getActionsElement();
    }
});


/**
 * UML StateChart start state.
 * @param raphael raphael paper
 * @param p point position
 * @param r radius
 * @param attrs shape SVG attributes
 */
uml.StartState = Element.extend({
     object: "StartState",
     module: "uml",
     init: function(properties){
	 // options
	 var p = this.properties;
	 p.position = properties.position || point(0, 0);
	 p.radius = properties.radius || 10;
	 p.attrs = properties.attrs || {};
	 if (!p.attrs.fill){
	     p.attrs.fill = "black";
	 }
	 // wrapper
	 this.setWrapper(this.paper.circle(p.position.x, p.position.y, p.radius).attr(p.attrs));
     }
});


/**
 * UML StateChart end state.
 * @param raphael raphael paper
 * @param p point position
 * @param r radius
 * @param attrs shape SVG attributes
 */
uml.EndState = Element.extend({
     object: "EndState",
     module: "uml",
     init: function(properties){
	 // options
	 var p = this.properties;
	 p.position = properties.position || point(0, 0);
	 p.radius = properties.radius || 10;
	 p.innerRadius = properties.innerRadius || (p.radius / 2);
	 p.attrs = properties.attrs || {};
	 if (!p.attrs.fill){
	     p.attrs.fill = "white";
	 }
	 p.innerAttrs = properties.innerAttrs || {};
	 if (!p.innerAttrs.fill){
	     p.innerAttrs.fill = "black";
	 }
	 // wrapper
	 this.setWrapper(this.paper.circle(p.position.x, p.position.y, p.radius).attr(p.attrs));
	 // inner
	 this.addInner(this.paper.circle(p.position.x, p.position.y, p.innerRadius).attr(p.innerAttrs));
     },
     zoom: function(){
	 this.inner[0].scale.apply(this.inner[0], arguments);
     }
});


/**************************************************
 * UML Class Diagram
 **************************************************/

uml.Class = Element.extend({
    object: "Class",
    module: "uml",
    init: function(properties){
	var p = this.properties;
	var rect = p.rect = properties.rect;
	var attrs = p.attrs = properties.attrs || {};
	if (!attrs.fill){
	    attrs.fill = "white";
	}
	p.label = properties.label || "";
	p.labelOffsetX = properties.labelOffsetX || 20;
	p.labelOffsetY = properties.labelOffsetY || 5;
	p.swimlane1OffsetY = properties.swimlane1OffsetY || 18;
	p.swimlane2OffsetY = properties.swimlane2OffsetY || 18;
	p.attributes = properties.attributes || [];
	p.attributesOffsetX = properties.attributesOffsetX || 5;
	p.attributesOffsetY = properties.attributesOffsetY || 5;
	p.methods = properties.methods || [];
	p.methodsOffsetX = properties.methodsOffsetX || 5;
	p.methodsOffsetY = properties.methodsOffsetY || 5;
	// wrapper
	this.setWrapper(this.paper.rect(rect.x, rect.y, rect.width, rect.height).attr(attrs));
	// inner
	this.addInner(this.getLabelElement());
	this.addInner(this.getSwimlane1Element());
	this.addInner(this.getAttributesElement());
	this.addInner(this.getSwimlane2Element());
	this.addInner(this.getMethodsElement());
    },
    getLabelElement: function(){
	var
	p = this.properties,
	bb = this.wrapper.getBBox(),
	t = this.paper.text(bb.x, bb.y, p.label),
	tbb = t.getBBox();
	t.translate(bb.x - tbb.x + p.labelOffsetX, bb.y - tbb.y + p.labelOffsetY);
	return t;
    },
    getSwimlane1Element: function(){
	var bb = this.wrapper.getBBox(), p = this.properties;
	return this.paper.path(["M", bb.x, bb.y + p.labelOffsetY + p.swimlane1OffsetY, "L", bb.x + bb.width, bb.y + p.labelOffsetY + p.swimlane1OffsetY].join(" "));
    },
    getSwimlane2Element: function(){
	var 
	p = this.properties,
	bb = this.wrapper.getBBox(),
	bbAtrrs = this.inner[2].getBBox();  // attributes
	return this.paper.path(["M", bb.x, bb.y + p.labelOffsetY + p.swimlane1OffsetY + bbAtrrs.height + p.swimlane2OffsetY, "L", bb.x + bb.width, bb.y + p.labelOffsetY + p.swimlane1OffsetY + bbAtrrs.height + p.swimlane2OffsetY].join(" "));
    },
    getAttributesElement: function(){
	var str = " ", p = this.properties;
	for (var i = 0, len = p.attributes.length; i < len; i++){
	    str += p.attributes[i] + "\n";
	}
	// trim
	str = str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    
	var
	bb = this.wrapper.getBBox(),
	t = this.paper.text(bb.x + p.attributesOffsetX, bb.y + p.labelOffsetY + p.swimlane1OffsetY + p.attributesOffsetY, str),
	tbb = t.getBBox();
	t.attr("text-anchor", "start");
	t.translate(0, tbb.height/2);	// tune the y-position
	return t;
    },
    getMethodsElement: function(){
	var str = " ", p = this.properties;
	for (var i = 0, len = p.methods.length; i < len; i++){
	    str += p.methods[i] + "\n";
	}
	// trim
	str = str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    	var
	bb = this.wrapper.getBBox(),
	bbAtrrs = this.inner[2].getBBox(),  // attributes
	t = this.paper.text(bb.x + p.methodsOffsetX, bb.y + p.labelOffsetY + p.swimlane1OffsetY + p.attributesOffsetY + bbAtrrs.height + p.swimlane2OffsetY + p.methodsOffsetY, str),
	tbb = t.getBBox();
	t.attr("text-anchor", "start");
	t.translate(0, tbb.height/2);	// tune the y-position
	return t;
    },
    zoom: function(){
	this.inner[0].remove();	// label
	this.inner[1].remove();	// swimlane1
	this.inner[2].remove();	// attributes
	this.inner[3].remove();	// swimlane2
	this.inner[4].remove();	// methods
	this.inner[0] = this.getLabelElement();
	this.inner[1] = this.getSwimlane1Element();
	this.inner[2] = this.getAttributesElement();
	this.inner[3] = this.getSwimlane2Element();
	this.inner[4] = this.getMethodsElement();
    }			       
});

})(this);	// END CLOSURE