import Hls from 'hls.js'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
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
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const handlePlay = async () => {
      if (audioRef.current) {
        try {
          if (isHls && paused) {
            setTimeout(async () => {
              await audioRef.current?.play()
            }, 1000)
          } else {
            audioRef.current.play()
          }
        } catch (err) {
          const error = err as Error
          console.error(err)
          toast.error('An error occurred while selecting the radio.', {
            description: error.message,
          })
        }
      }
    }

    const handlePause = () => {
      audioRef.current?.pause()
    }

    useImperativeHandle(ref, () => ({
      handlePlay,
      handlePause,
    }))

    useEffect(() => {
      setIsHls(url.endsWith('.m3u8'))
    }, [url])

    useEffect(() => {
      if (isHls && audioRef.current && Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(url)
        hls.attachMedia(audioRef.current)

        hls.on(Hls.Events.ERROR, (_, data) => {
          console.error('HLS Error:', data)
          toast.error('Failed to connect to the radio station.')
        })

        return () => {
          hls.destroy()
        }
      } else if (!isHls && audioRef.current) {
        audioRef.current.src = url
      }
    }, [isHls, url])

    return (
      <div className="hidden">
        <audio ref={audioRef} controls />
      </div>
    )
  },
)

RadioPlayer.displayName = 'RadioPlayer'
