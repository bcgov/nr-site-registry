import { LoginDropdown } from '../../../components/login/LoginDropdown';

import './GatedTabSignInPrompt.css';

const GatedTabSignInPrompt = () => {
  return (
    <div className="gated-tab-signin" data-testid="gated-tab-signin">
      <div className="gated-tab-signin-info">
        <span>Sign in to view this site’s details.</span>
      </div>
      {LoginDropdown('Sign in')}
    </div>
  );
};

export default GatedTabSignInPrompt;
