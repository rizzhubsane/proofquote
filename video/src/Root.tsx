import { Composition } from "remotion";
import cues from "./cues.json";
import { Launch } from "./Launch";

export const RemotionRoot = () => (
  <Composition
    id="Proofquote"
    component={Launch}
    durationInFrames={cues.durationSec * cues.fps}
    fps={cues.fps}
    width={1920}
    height={1080}
  />
);
