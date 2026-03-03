import './Intro.css';
import {
  CONTACT_US,
  GUIDANCE_AND_RESOURCES,
  HOW_TO_SEARCH,
} from '../../constants/Constant';

const Intro = () => {
  return (
    <div data-testid="intro" className="intro">
      <div className="intro-heading">
        <span className="gold-bar">&nbsp;</span>
        <span className="text">Introducing the new Site Registry</span>
      </div>
      <div className="intro-section-parent">
        <div data-testid="intro-section" className="intro-section">
          <span className="intro-section-heading">How To Search</span>
          <span className="intro-section-content">{HOW_TO_SEARCH}</span>
        </div>
        <div data-testid="intro-section" className="intro-section">
          <span className="intro-section-heading">Help + Support</span>
          <span className="intro-section-content">
            {GUIDANCE_AND_RESOURCES}
          </span>
        </div>
        <div data-testid="intro-section" className="intro-section">
          <span className="intro-section-heading">Contact Us</span>
          <span className="intro-section-content">{CONTACT_US}</span>
        </div>
      </div>
    </div>
  );
};

export default Intro;
