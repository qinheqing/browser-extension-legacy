import assert from 'assert';
import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import { CSSTransition } from 'react-transition-group';
import Sidebar from '../sidebar.component';

import CustomizeGas from '../../gas-customization/gas-modal-page-container';

const propsMethodSpies = {
  hideSidebar: sinon.spy(),
};

describe('Sidebar Component', function () {
  let wrapper;

  beforeEach(function () {
    wrapper = shallow(
      <Sidebar
        sidebarOpen={false}
        hideSidebar={propsMethodSpies.hideSidebar}
        transitionName="someTransition"
        type="customize-gas"
      />,
    );
  });

  afterEach(function () {
    propsMethodSpies.hideSidebar.resetHistory();
  });

  describe('renderOverlay', function () {
    let renderOverlay;

    beforeEach(function () {
      renderOverlay = shallow(wrapper.instance().renderOverlay());
    });

    it('should render a overlay element', function () {
      assert(renderOverlay.hasClass('sidebar-overlay'));
    });

    it('should pass the correct onClick function to the element', function () {
      assert.strictEqual(propsMethodSpies.hideSidebar.callCount, 0);
      renderOverlay.props().onClick();
      assert.strictEqual(propsMethodSpies.hideSidebar.callCount, 1);
    });
  });

  describe('renderSidebarContent', function () {
    let renderSidebarContent;

    beforeEach(function () {
      renderSidebarContent = wrapper.instance().renderSidebarContent();
    });

    it('should render sidebar content with the type customize-gas', function () {
      renderSidebarContent = wrapper.instance().renderSidebarContent();
      const renderedSidebarContent = shallow(renderSidebarContent);
      assert(renderedSidebarContent.hasClass('sidebar-left'));
      assert(renderedSidebarContent.childAt(0).is(CustomizeGas));
    });

    it('should not render with an unrecognized type', function () {
      wrapper.setProps({ type: 'foobar' });
      renderSidebarContent = wrapper.instance().renderSidebarContent();
      assert.strictEqual(renderSidebarContent, null);
    });
  });

  describe('render', function () {
    it('should render a div with one child', function () {
      assert(wrapper.is('div'));
      assert.strictEqual(wrapper.children().length, 1);
    });

    it('should render the ReactCSSTransitionGroup without any children', function () {
      assert(wrapper.children().at(0).is(CSSTransition));
      assert.strictEqual(wrapper.children().at(0).children().length, 0);
    });

    it('should render sidebar content and the overlay if sidebarOpen is true', function () {
      wrapper.setProps({ sidebarOpen: true });
      assert.strictEqual(wrapper.children().length, 2);
      assert(wrapper.children().at(1).hasClass('sidebar-overlay'));
      assert.strictEqual(wrapper.children().at(0).children().length, 1);
      assert(
        wrapper.children().at(0).children().at(0).hasClass('sidebar-left'),
      );
      assert(
        wrapper
          .children()
          .at(0)
          .children()
          .at(0)
          .children()
          .at(0)
          .is(CustomizeGas),
      );
    });
  });
});
