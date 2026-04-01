import React from 'react';
import { render, screen } from '@testing-library/react';
import Notation from './Notation';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { RequestStatus } from '../../../helpers/requests/status';
import { UserType } from '../../../helpers/requests/userType';

/**
 * ✅ Mock Widget to expose isRequired
 * This is the line Sonar wants covered.
 */

jest.mock('../../../components/widget/Widget', () => {
  const PropTypes = require('prop-types');

  function MockWidget(props) {
    return (
      <div
        data-testid="mock-widget"
        data-isrequired={String(props.isRequired)}
      />
    );
  }

  MockWidget.propTypes = {
    isRequired: PropTypes.bool.isRequired,
  };

  return MockWidget;
});


/**
 * ✅ Mock all heavy UI dependencies
 * Keeps test fast & stable
 */
jest.mock('../../../components/form/Form', () => () => <div />);


jest.mock('../../../components/simple/PanelWithUpDown', () => {
  const PropTypes = require('prop-types');

  function MockPanelWithUpDown({ firstChild, secondChild }) {
    return (
      <div>
        <div>{firstChild}</div>
        <div>{secondChild}</div>
      </div>
    );
  }

  MockPanelWithUpDown.propTypes = {
    firstChild: PropTypes.node.isRequired,
    secondChild: PropTypes.node.isRequired,
  };

  return MockPanelWithUpDown;
});

jest.mock('../../../components/action/Actions', () => () => <div />);
jest.mock('../../../components/approve/ApproveReject', () => ({
  ApproveRejectButtons: () => <div />,
}));

jest.mock('../../../components/button/Button', () => {
  const PropTypes = require('prop-types');

  function MockButton({ children }) {
    return <button>{children}</button>;
  }

  MockButton.propTypes = {
    children: PropTypes.node,
  };

  return { Button: MockButton };
});

jest.mock('../../../components/common/icon', () => ({
  UserMinus: () => <span />,
  UserPlus: () => <span />,
  Minus: () => <span />,
  Plus: () => <span />,
}));

describe('Notation – Widget isRequired logic', () => {
  const baseProps = {
    notation: {
      id: 1,
      notationParticipant: [],
    },
    handleNotationFormRowFirstChild: jest.fn(() => []),
    handleInputChange: jest.fn(),
    handleNotationFormRowExternal: jest.fn(() => []),
    handleChangeNotationFormRow: jest.fn(() => []),
    handleNotationFormRowsInternal: jest.fn(() => []),
    handleTableChange: jest.fn(),
    handleWidgetCheckBox: jest.fn(),
    internalTableColumn: [],
    externalTableColumn: [],
    loading: RequestStatus.success,
    handleTableSort: jest.fn(),
    handleAddParticipant: jest.fn(),
    isAnyParticipantSelected: jest.fn(() => false),
    handleRemoveParticipant: jest.fn(),
    handleDeleteNotation: jest.fn(),
    handleRestoreNotation: jest.fn(),
    srVisibilityConfig: [],
    handleItemClick: jest.fn(),
    userType: UserType.Internal,
    isArchived: false,
  };

  it('sets isRequired=true when viewMode is EditMode', () => {
    render(
      <Notation
        {...baseProps}
        viewMode={SiteDetailsMode.EditMode}
      />
    );

    expect(screen.getByTestId('mock-widget'))
      .toHaveAttribute('data-isrequired', 'true');
  });

  it('sets isRequired=false when viewMode is NOT EditMode', () => {
    render(
      <Notation
        {...baseProps}
        viewMode={SiteDetailsMode.SRMode}
      />
    );

    expect(screen.getByTestId('mock-widget'))
      .toHaveAttribute('data-isrequired', 'false');
  });
});