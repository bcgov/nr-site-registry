import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Notation from './Notation';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { RequestStatus } from '../../../helpers/requests/status';
import { UserType } from '../../../helpers/requests/userType';

/**
 * ✅ Mock Widget to expose isRequired
 * Covers Sonar "new code" line
 */
jest.mock('../../../components/widget/Widget', () => {
  const React = require('react');

  return function MockWidget(props: { isRequired: boolean }) {
    return React.createElement('div', {
      'data-testid': 'mock-widget',
      'data-isrequired': String(props.isRequired),
    });
  };
});

/** ✅ Mock heavy UI dependencies (NO JSX) */
jest.mock('../../../components/form/Form', () => {
  const React = require('react');
  return () => React.createElement('div');
});

jest.mock('../../../components/action/Actions', () => {
  const React = require('react');
  return () => React.createElement('div');
});

jest.mock('../../../components/approve/ApproveReject', () => {
  const React = require('react');
  return {
    ApproveRejectButtons: () => React.createElement('div'),
  };
});

jest.mock('../../../components/button/Button', () => {
  const React = require('react');
  return {
    Button: (props: { children?: React.ReactNode }) =>
      React.createElement('button', null, props.children),
  };
});

jest.mock('../../../components/common/icon', () => {
  const React = require('react');
  return {
    UserMinus: () => React.createElement('span'),
    UserPlus: () => React.createElement('span'),
    Minus: () => React.createElement('span'),
    Plus: () => React.createElement('span'),
  };
});

jest.mock('../../../components/simple/PanelWithUpDown', () => {
  const React = require('react');

  return function MockPanel(props: {
    firstChild: React.ReactNode;
    secondChild: React.ReactNode;
    isDefaultOpen?: boolean;
  }) {
    return React.createElement(
      'div',
      {
        'data-testid': 'notation-panel',
        'data-default-open': String(Boolean(props.isDefaultOpen)),
      },
      React.createElement('div', null, props.firstChild),
      React.createElement('div', null, props.secondChild),
    );
  };
});

describe('Notation – Widget isRequired logic', () => {
  const baseProps = {
    notation: {
      id: 1,
      notationParticipant: [],
    },
    handleNotationFormRowFirstChild: jest.fn(() => []),
    handleNotationFormRowExternal: jest.fn(() => []),
    handleChangeNotationFormRow: jest.fn(() => []),
    handleNotationFormRowsInternal: jest.fn(() => []),
    handleInputChange: jest.fn(),
    handleTableChange: jest.fn(),
    handleWidgetCheckBox: jest.fn(),
    handleTableSort: jest.fn(),
    handleAddParticipant: jest.fn(),
    handleRemoveParticipant: jest.fn(),
    handleDeleteNotation: jest.fn(),
    handleRestoreNotation: jest.fn(),
    handleItemClick: jest.fn(),
    isAnyParticipantSelected: jest.fn(() => false),
    internalTableColumn: [],
    externalTableColumn: [],
    loading: RequestStatus.success,
    srVisibilityConfig: [],
    userType: UserType.Internal,
    isArchived: false,
  };

  it('sets isRequired=true when viewMode is EditMode', () => {
    render(
      React.createElement(Notation, {
        ...baseProps,
        viewMode: SiteDetailsMode.EditMode,
      }),
    );

    expect(screen.getByTestId('mock-widget')).toHaveAttribute(
      'data-isrequired',
      'true',
    );
  });

  it('sets isRequired=false when viewMode is not EditMode', () => {
    render(
      React.createElement(Notation, {
        ...baseProps,
        viewMode: SiteDetailsMode.SRMode,
      }),
    );

    expect(screen.getByTestId('mock-widget')).toHaveAttribute(
      'data-isrequired',
      'false',
    );
  });

  it('opens the panel by default', () => {
    render(
      React.createElement(Notation, {
        ...baseProps,
        viewMode: SiteDetailsMode.ViewOnlyMode,
      }),
    );

    expect(screen.getByTestId('notation-panel')).toHaveAttribute(
      'data-default-open',
      'true',
    );
  });
});
