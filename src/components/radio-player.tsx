import Hls from 'hls.js'
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'

interface RadioPlayerProps {
  url: string
}

export interface RadioPlayerHandleProps {
  handlePlay: () => void
  handlePause: () => void
}

export const RadioPlayer = forwardRef<RadioPlayerHandleProps, RadioPlayerProps>(
  ({ url }, ref) => {
    const [isHls, setIsHls] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const hlsInstance = useRef<Hls | null>(null)

    useEffect(() => {
      setIsHls(url.endsWith('.m3u8'))
    }, [url])

    const initializeHls = () => {
      if (Hls.isSupported() && audioRef.current) {
        const hls = new Hls()
        hls.loadSource(url)
        hls.attachMedia(audioRef.current)
        hls.on(Hls.Events.ERROR, (_, data) => {
          console.error('HLS Error:', data)
          toast.error('An error occurred while playing the radio.')
        })
        hlsInstance.current = hls
      } else if (
        audioRef.current?.canPlayType('application/vnd.apple.mpegurl')
      ) {
        audioRef.current.src = url
      }
    }

    const handlePlay = async () => {
      try {
        if (isHls) {
          if (!hlsInstance.current) {
            initializeHls()
          }
        } else {
          if (audioRef.current && audioRef.current.src !== url) {
            audioRef.current.src = url
          }
        }
        await audioRef.current?.play()
      } catch (err) {
        console.error(err)
        toast.error('An error occurred while playing the radio.', {
          description: (err as Error).message,
        })
      }
    }

    const handlePause = () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (hlsInstance.current) {
        hlsInstance.current.destroy()
        hlsInstance.current = null
      }
    }

    useImperativeHandle(ref, () => ({
      handlePlay,
      handlePause,
    }))

    useEffect(() => {
      if (isHls) {
        initializeHls()
      } else if (audioRef.current) {
        audioRef.current.src = url
      }

      return () => {
        if (hlsInstance.current) {
          hlsInstance.current.destroy()
          hlsInstance.current = null
        }
      }
    }, [isHls, url])

    return <audio ref={audioRef} className="hidden" controls />
  },
)

RadioPlayer.displayName = 'RadioPlayer'
