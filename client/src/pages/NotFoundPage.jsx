import { ArrowUpRight } from 'lucide-react';
import PageHero from '../components/PageHero.jsx';
import { SmartLink } from '../lib/nav.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import bg from '@assets/images/about-bg.jpg';

export default function NotFoundPage({ ready }) {
  usePageTitle('Page not found');
  return (
    <PageHero
      ready={ready}
      image={bg}
      scene="404"
      crumb="Not found"
      eyebrow="Error 404"
      titleLine="This scene"
      titleAccent="didn’t make the cut."
      description="The page you’re looking for doesn’t exist or has moved. Let’s get you back on set."
    >
      <SmartLink to="/" className="btn btn--primary btn--lg">
        <span>Back to Home</span>
        <ArrowUpRight className="btn__arrow" size={20} strokeWidth={2.4} />
      </SmartLink>
      <SmartLink to="/programs" className="btn btn--outline btn--lg">
        <span>Explore Programs</span>
      </SmartLink>
    </PageHero>
  );
}
