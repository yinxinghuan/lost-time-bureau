type IconName = 'archive' | 'object' | 'memory' | 'echo' | 'close' | 'clock' | 'pause' | 'sound'

const paths: Record<IconName, React.ReactNode> = {
  archive: <><path d="M5 6.5h14v13H5z" /><path d="M4 3h16v4H4zM9 11h6" /></>,
  object: <><circle cx="12" cy="12" r="7.5" /><path d="M12 7.5V12l3 2" /></>,
  memory: <><path d="M4 12c2.2-5 4.4-5 6.6 0s4.4 5 9.4 0" /><path d="M4 7h3M17 17h3" /></>,
  echo: <><path d="M5 18V7l7-3 7 3v11" /><path d="M8 15l4-6 4 6M12 9v9" /></>,
  close: <><path d="M6 6l12 12M18 6L6 18" /></>,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 1.5" /></>,
  pause: <><path d="M8 6v12M16 6v12" /></>,
  sound: <><path d="M5 10v4h3l4 3V7L8 10H5zM16 9c1.5 1.5 1.5 4.5 0 6M18.5 6.5c3 3 3 8 0 11" /></>,
}

export function LineIcon({ name }: { name: IconName }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}
