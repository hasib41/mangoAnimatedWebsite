import { Composition } from 'remotion'
import { Monolith, FPS, DURATION } from './Monolith'

export const RemotionRoot = () => {
  return (
    <Composition
      id="Monolith"
      component={Monolith}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
    />
  )
}
