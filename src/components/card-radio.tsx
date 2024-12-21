import { Check, Pause, Pencil, Play, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { RadioStationInfo } from '@/dtos/radio-station-info'
import { useRadioStations } from '@/hooks/use-radio-stations'
import { cn } from '@/lib/utils'

import { RadioPlayer, RadioPlayerHandleProps } from './radio-player'
import { Button } from './ui/button'
import { Input } from './ui/input'

interface CardRadioProps {
  radio: RadioStationInfo
  playingNow?: boolean
  className?: string
  onRemove?: () => void
  onPlay?: () => void
  onUpdate?: (updatedRadio: Partial<RadioStationInfo>) => void
}

export function CardRadio({
  radio,
  playingNow = false,
  className,
  onRemove,
  onUpdate,
}: CardRadioProps) {
  const [paused, setPaused] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(radio.name)
  const [editedTags, setEditedTags] = useState(radio.tags)

  const { currentRadioRef, setCurrentRadioRef, setRadioPlayingNow } =
    useRadioStations()

  const radioPlayerRef = useRef<RadioPlayerHandleProps>(null)

  const handlePlayPause = useCallback(() => {
    if (paused) {
      if (
        currentRadioRef?.current &&
        currentRadioRef.current !== radioPlayerRef.current
      ) {
        currentRadioRef.current.handlePause()
      }

      setCurrentRadioRef(radioPlayerRef)
      setRadioPlayingNow(radio)
      radioPlayerRef.current?.handlePlay()
      setPaused(false)
    } else {
      radioPlayerRef.current?.handlePause()
      setRadioPlayingNow(undefined)
      setPaused(true)
    }
  }, [paused, currentRadioRef, setCurrentRadioRef, setRadioPlayingNow, radio])

  useEffect(() => {
    if (currentRadioRef?.current === radioPlayerRef.current) {
      setPaused(false)
    } else {
      setPaused(true)
    }
  }, [currentRadioRef])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedName(radio.name)
    setEditedTags(radio.tags)
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
    if (onUpdate) {
      onUpdate({ name: editedName, tags: editedTags })
    }
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-md bg-card p-2 text-card-foreground dark:bg-card',
        className,
      )}
    >
      <div className="flex w-full items-center gap-2">
        {playingNow ? (
          <Button
            variant="default"
            size="icon"
            className={cn('h-7 w-7')}
            onClick={handlePlayPause}
          >
            <Pause />
          </Button>
        ) : (
          <Button
            variant="default"
            size="icon"
            className={cn('h-7 w-7')}
            onClick={handlePlayPause}
          >
            {paused ? <Play /> : <Pause />}
          </Button>
        )}
        <div className="flex w-full flex-col justify-center gap-1">
          {isEditing ? (
            <>
              <Input
                type="text"
                id="radioName"
                name="Name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full rounded-sm border px-1 text-sm"
              />
              {!playingNow && (
                <Input
                  id="radioTags"
                  name="Tags"
                  type="text"
                  value={editedTags}
                  onChange={(e) => setEditedTags(e.target.value)}
                  className="w-full rounded-sm border px-1 text-xs"
                />
              )}
            </>
          ) : (
            <>
              <span className="font-semibold leading-3 tracking-tight">
                {radio?.name}
              </span>
              {!playingNow && (
                <span className="font-extralight leading-3 tracking-tight">
                  {radio?.tags}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {!isEditing ? (
          <>
            {!playingNow && (
              <>
                <Trash2 onClick={onRemove} className="text-primary" />
                <Pencil onClick={handleEdit} className="text-primary" />
              </>
            )}
          </>
        ) : (
          <>
            <Check onClick={handleSaveEdit} className="text-green-500" />
            <X onClick={handleCancelEdit} className="text-red-500" />
          </>
        )}
      </div>

      <RadioPlayer
        ref={radioPlayerRef}
        paused={paused}
        url={radio.url_resolved}
      />
    </div>
  )
}
