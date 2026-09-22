import DivisionComingSoon from '../components/DivisionComingSoon.jsx';

export default function Label({ goTo }) {
  return (
    <DivisionComingSoon
      tag="OTW LABEL"
      colorVar="var(--cyan)"
      tintVar="var(--cyan-tint)"
      icon="💿"
      headline="Music released under the OTW name."
      body="Tracks, EPs and distribution for artists in and around the OTW network — a home for
        releases that back up everything else the name stands for."
      bullets={[
        'Open to OTW artists and outside submissions alike',
        'Distribution, artwork and release scheduling handled for you',
        'Releases feed straight back into what OTW Events and Artists play out',
      ]}
      goTo={goTo}
    />
  );
}
