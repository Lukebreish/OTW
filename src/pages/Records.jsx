import { DivisionHero, ComingSoon } from '../components/ComingSoon.jsx';

export default function Records() {
  return (
    <>
      <DivisionHero
        tag="OTW Records"
        title="Music released under the OTW name."
        lead="Tracks, EPs and distribution for artists in and around the crew."
      />
      <ComingSoon
        subject="OTW Records · demo"
        title="First release, soon"
        body="The catalogue starts at OTW001. Send us a demo or register interest to hear it first."
        points={[
          'Open to OTW artists and outside submissions',
          'Distribution, artwork and release scheduling handled',
          'Releases feed straight into what OTW Events plays out',
        ]}
      />
    </>
  );
}
