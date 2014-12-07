var TestHelper = require('../../../TestHelper'),
    Events = require('../../../util/Events');

/* global bootstrapDiagram, inject */


var $ = require('jquery');

var overlayModule = require('../../../../lib/features/overlays'),
    selectionModule = require('../../../../lib/features/selection'),
    modelingModule = require('../../../../lib/features/modeling'),
    resizeModule = require('../../../../lib/features/resize'),
    moveModule = require('../../../../lib/features/move');


var resizeBounds = require('../../../../lib/features/resize/Util').resizeBounds;

describe('features/overlay - integration', function() {

  beforeEach(bootstrapDiagram({ modules: [
    overlayModule,
    selectionModule,
    modelingModule,
    moveModule,
    resizeModule
  ] }));


  var Event;

  beforeEach(inject(function(canvas, dragging) {
    Event = Events.target(canvas._svg);

    dragging.setOptions({ manual: true });
  }));


  describe('modeling integration', function() {

    it('should update on shape.move', inject(function(modeling, canvas, overlays) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });

      var html = $('<div style="width: 40px; height: 40px">TEST<br/>TEST</div>');

      // add overlay to a single shape (or connection)
      overlays.add(shape, {
        html: html,
        position: {
          top: 0,
          left: 0
        }
      });

      // when
      modeling.moveShape(shape, { x: -20, y: +20 });

      // then
      expect(html.parent().parent().position()).toEqual({
        top: 70,
        left: 30
      });

    }));


    it('should update on shape.move undo', inject(function(modeling, canvas, commandStack, overlays) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });

      var html = $('<div style="width: 40px; height: 40px">TEST<br/>TEST</div>');

      // add overlay to a single shape (or connection)
      overlays.add(shape, {
        html: html,
        position: {
          top: 0,
          left: 0
        }
      });

      // when
      modeling.moveShape(shape, { x: -20, y: +20 });
      commandStack.undo();

      // then
      expect(html.parent().parent().position()).toEqual({
        top: 50,
        left: 50
      });

    }));


    it('should update on shape.resize', inject(function(modeling, canvas, overlays) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });

      var html = $('<div style="width: 40px; height: 40px;">TEST<br/>TEST</div>');

      // add overlay to a single shape (or connection)
      overlays.add(shape, {
        html: html,
        position: {
          top:  10,
          left: 10
        }
      });

      // when
      modeling.resizeShape(shape, resizeBounds(shape, 'ne', { x: 0, y: -15 }));

      // then
      expect(html.parent().parent().position()).toEqual({
        top:  35,
        left: 50
      });

    }));


    it('should update on shape.resize undo', inject(function(modeling, canvas, overlays, commandStack, resize) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });

      var html = $('<div style="width: 40px; height: 40px;">TEST<br/>TEST</div>');

      // add overlay to a single shape (or connection)
      overlays.add(shape, {
        html: html,
        position: {
          top:  10,
          left: 10
        }
      });

      modeling.resizeShape(shape, resizeBounds(shape, 'ne', { x: 0, y: -15 }));

      // when
      commandStack.undo();

      // then
      expect(html.parent().parent().position()).toEqual({
        top:  50,
        left: 50
      });

    }));

  });


  describe('selection/hover integration', function() {

    it('should add selection/hover markers', inject(function(selection, canvas, overlays) {

      // given
      var shape = canvas.addShape({
        id: 'shape',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });

      var overlayContainer = overlays._getOverlayContainer(shape);

      // when
      selection.select(shape);

      // then
      expect(overlayContainer.html.hasClass('selected')).toBe(true);
    }));


    it('should remove selection/hover markers', inject(function(selection, canvas, overlays) {

      // given
      var shape = canvas.addShape({
        id: 'shape',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });

      var overlayContainer = overlays._getOverlayContainer(shape);

      // when
      selection.select(shape);
      selection.select(null);

      // then
      expect(overlayContainer.html.hasClass('selected')).toBe(false);
    }));

  });


  describe('drag integration', function() {

    it('should add <djs-dragging> marker class', inject(function(canvas, move, dragging, overlays) {

      // given
      var parent = canvas.addShape({
        id: 'parent',
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        children: []
      });

      var child = canvas.addShape({
        id: 'child',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      }, parent);

      var parentOverlayContainer = overlays._getOverlayContainer(parent);
      var childOverlayContainer = overlays._getOverlayContainer(child);

      // when
      move.start(Event.create({ x: 10, y: 10 }), parent);
      dragging.move(Event.create({ x: 20, y: 30 }));

      // then
      expect(parentOverlayContainer.html.hasClass('djs-dragging')).toBe(true);
      expect(childOverlayContainer.html.hasClass('djs-dragging')).toBe(true);
    }));


    it('should remove <djs-dragging> marker class on end', inject(function(canvas, move, dragging, overlays) {

      // given
      var parent = canvas.addShape({
        id: 'parent',
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        children: []
      });

      var child = canvas.addShape({
        id: 'child',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      }, parent);

      var parentOverlayContainer = overlays._getOverlayContainer(parent);
      var childOverlayContainer = overlays._getOverlayContainer(child);

      // when
      move.start(Event.create({ x: 10, y: 10 }), parent);
      dragging.move(Event.create({ x: 30, y: 30 }));
      dragging.end(Event.create({ x: 30, y: 30 }));

      // then
      expect(parentOverlayContainer.html.hasClass('djs-dragging')).toBe(false);
      expect(childOverlayContainer.html.hasClass('djs-dragging')).toBe(false);
    }));

  });

});
