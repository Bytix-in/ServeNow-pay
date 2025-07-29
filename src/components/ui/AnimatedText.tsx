'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  speed?: number
  type?: 'typewriter' | 'fadeIn' | 'slideUp' | 'letterByLetter'
}

export default function AnimatedText({ 
  text, 
  className = '', 
  delay = 0, 
  speed = 50,
  type = 'fadeIn'
}: AnimatedTextProps) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (type === 'typewriter') {
      const timer = setTimeout(() => {
        let i = 0
        const typeInterval = setInterval(() => {
          if (i < text.length) {
            setDisplayText(text.slice(0, i + 1))
            i++
          } else {
            setIsComplete(true)
            clearInterval(typeInterval)
          }
        }, speed)

        return () => clearInterval(typeInterval)
      }, delay * 1000)

      return () => clearTimeout(timer)
    } else {
      setDisplayText(text)
      setIsComplete(true)
    }
  }, [text, delay, speed, type])

  if (type === 'typewriter') {
    return (
      <span className={className}>
        {displayText}
        {!isComplete && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-0.5 h-6 bg-current ml-1"
          />
        )}
      </span>
    )
  }

  if (type === 'letterByLetter') {
    return (
      <motion.span
        className={className}
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.05, delayChildren: delay }}
      >
        {text.split('').map((char, index) => (
          <motion.span
            key={index}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className={char === ' ' ? 'inline-block w-2' : 'inline-block'}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    )
  }

  if (type === 'slideUp') {
    return (
      <motion.span
        className={className}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          delay,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        {text}
      </motion.span>
    )
  }

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {text}
    </motion.span>
  )
}