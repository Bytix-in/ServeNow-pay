'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: true, 
    margin: "-100px",
    amount: threshold 
  })

  return { ref, isInView }
}

export function useStaggeredAnimation(itemCount: number, delay = 0.1) {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const { ref, isInView } = useScrollAnimation()

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        for (let i = 0; i < itemCount; i++) {
          setTimeout(() => {
            setVisibleItems(prev => [...prev, i])
          }, i * delay * 1000)
        }
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [isInView, itemCount, delay])

  return { ref, visibleItems, isInView }
}

export function useTypewriterEffect(text: string, speed = 50) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1))
        i++
      } else {
        setIsComplete(true)
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return { displayText, isComplete }
}