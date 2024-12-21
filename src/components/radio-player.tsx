import Hls from 'hls.js'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import ReactHowler from 'react-howler'
import { toast } from 'sonner'

interface RadioPlayerProps {
  url: string
  paused: boolean
}

export interface RadioPlayerHandleProps {
  handlePlay: () => void
  handlePause: () => void
}

export const RadioPlayer = forwardRef<RadioPlayerHandleProps, RadioPlayerProps>(
  ({ url, paused }, ref) => {
    const [isHls, setIsHls] = useState(false)
    const [playingMp3, setPlayingMp3] = useState(false)
    const audioRefHLS = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
      setIsHls(url.endsWith('.m3u8'))
    }, [url])

    const handlePlay = async () => {
      if (isHls && audioRefHLS.current) {
        try {
          setTimeout(async () => {
            await audioRefHLS.current?.play()
          }, 1000)
        } catch (err) {
          console.log(err)
          toast.error('An error occurred while selecting the radio.')
        }
      } else {
        setPlayingMp3(true)
      }
    }

    const handlePause = () => {
      if (isHls && audioRefHLS.current) {
        audioRefHLS.current.pause()
      } else {
        setPlayingMp3(false)
      }
    }

    useImperativeHandle(ref, () => ({
      handlePlay,
      handlePause,
    }))

    useEffect(() => {
      if (!paused && isHls && Hls.isSupported() && audioRefHLS.current) {
        const hls = new Hls()
        hls.loadSource(url)
        hls.attachMedia(audioRefHLS.current)

        hls.on(Hls.Events.ERROR, (_, data) => {
          console.error('HLS Error:', data)
        })

        return () => {
          hls.destroy()
        }
      } else if (
        audioRefHLS.current?.canPlayType('application/vnd.apple.mpegurl')
      ) {
        audioRefHLS.current.src = url
      }
    }, [isHls, url, paused])

    return (
      <div className="hidden">
        {isHls ? (
          <audio ref={audioRefHLS} controls />
        ) : (
          <ReactHowler src={url} html5 playing={playingMp3} />
        )}
      </div>
    )
  },
)

RadioPlayer.displayName = 'RadioPlayer'
