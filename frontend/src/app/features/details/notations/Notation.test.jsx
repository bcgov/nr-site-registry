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
  return function MockWidget(props) {
    return (
      <div
        data-testid="mock-widget"
        data-isrequired={String(props.isRequired)}
      />
    );
  };
});

/**
 * ✅ Mock all heavy UI dependencies
 * Keeps test fast & stable
 */
jest.mock('../../../components/form/Form', () => () => <div />);

jest.mock('../../../components/simple/PanelWithUpDown', () => {
  return ({ firstChild, secondChild }) => (
    <div>
      <div key="first">{firstChild}</div>
      <div key="second">{secondChild}</div>
    </div>
  );
});

jest.mock('../../../components/action/Actions', () => () => <div />);
jest.mock('../../../components/approve/ApproveReject', () => ({
  ApproveRejectButtons: () => <div />,
}));
jest.mock('../../../components/button/Button', () => ({
  Button: ({ children }) => <button>{children}</button>,
}));
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