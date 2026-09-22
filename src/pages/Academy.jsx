import DivisionComingSoon from '../components/DivisionComingSoon.jsx';

export default function Academy({ goTo }) {
  return (
    <DivisionComingSoon
      tag="OTW ACADEMY"
      colorVar="var(--magenta)"
      tintVar="var(--magenta-tint)"
      icon="🎓"
      headline="Learn to DJ and produce with OTW."
      body="Mentorship and studio time from the same team that's already booking real events and
        artists — training that's built around how the roster actually works, not a generic
        course."
      bullets={[
        'DJ fundamentals through to a performance-ready set',
        'Production mentorship for your own tracks',
        'A path onto the OTW Artists roster for graduates who are ready',
      ]}
      goTo={goTo}
    />
  );
}
