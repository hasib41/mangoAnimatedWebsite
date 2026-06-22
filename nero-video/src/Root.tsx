import { Composition } from 'remotion'
import { Nero, FPS, DURATION } from './Nero'

export const RemotionRoot = () => {
  return (
    <Composition
      id="Nero"
      component={Nero}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
    />
  )
}
