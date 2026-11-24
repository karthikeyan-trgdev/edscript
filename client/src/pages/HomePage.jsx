import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Programs from '../components/Programs.jsx';
import Way from '../components/Way.jsx';
import Faq from '../components/Faq.jsx';
import Contact from '../components/Contact.jsx';
import usePageTitle from '../hooks/usePageTitle.js';

export default function HomePage({ ready }) {
  usePageTitle();
  return (
    <>
      <Hero ready={ready} />
      <About />
      <Programs />
      <Way />
      <Faq />
      <Contact />
    </>
  );
}
