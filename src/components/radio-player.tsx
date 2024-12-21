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

import { env } from '@/env'

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
          toast.error('Error when playing.')
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

    const proxyUrl = `${env.VITE_REACT_APP_STREAM_PROXY_URL}?url=${encodeURIComponent(url)}`

    useEffect(() => {
      if (!paused && isHls && Hls.isSupported() && audioRefHLS.current) {
        const hls = new Hls()
        hls.loadSource(proxyUrl)
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
        audioRefHLS.current.src = proxyUrl
      }
    }, [isHls, proxyUrl, paused])

    return (
      <div className="hidden">
        {isHls ? (
          <audio ref={audioRefHLS} controls>
            Seu navegador não suporta HLS.
          </audio>
        ) : (
          <ReactHowler src={proxyUrl} html5 playing={playingMp3} />
        )}
      </div>
    )
  },
)

RadioPlayer.displayName = 'RadioPlayer'
