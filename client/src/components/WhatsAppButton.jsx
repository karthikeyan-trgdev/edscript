import { SOCIAL_ICONS, whatsappHref } from './SocialIcons.jsx';
import '../styles/whatsapp.css';

// Floating "chat on WhatsApp" button, bottom-right on every page.
// The number + opening message come from content.json → footer.contact.whatsapp / whatsappMessage.
export default function WhatsAppButton({ ready }) {
  return (
    <a
      className={`wa-float ${ready ? 'is-ready' : ''}`}
      href={whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with EDSCRIPT on WhatsApp"
    >
      <span className="wa-float__pulse" aria-hidden="true" />
      <span className="wa-float__icon" aria-hidden="true">{SOCIAL_ICONS.WhatsApp}</span>
      <span className="wa-float__label" aria-hidden="true">Chat with us</span>
    </a>
  );
}
