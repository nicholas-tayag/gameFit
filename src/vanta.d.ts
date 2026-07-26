declare module 'vanta/dist/vanta.clouds.min.js' {
  type VantaEffect = {
    destroy: () => void
    setOptions?: (options: Record<string, unknown>) => void
  }

  type VantaFactory = (options: Record<string, unknown>) => VantaEffect

  const clouds: VantaFactory
  export const CLOUDS: VantaFactory
  export default clouds
}
