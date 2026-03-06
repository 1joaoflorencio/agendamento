import { useRef, useCallback } from 'react'

/**
 * Custom hook for fluid drag-to-scroll with momentum.
 * Simulates native iOS scrolling behavior for desktop users clicking and dragging.
 */
export function useDragScroll() {
    const scrollRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)
    const startX = useRef(0)
    const scrollLeft = useRef(0)
    const velocity = useRef(0)
    const lastTime = useRef(0)
    const lastX = useRef(0)
    const animationFrame = useRef<number>(0)
    const autoScrollAnimationFrame = useRef<number>(0)
    const didDrag = useRef(false) // Flag to differentiate drag from click

    const animate = useCallback(function animationStep() {
        if (!scrollRef.current || isDragging.current) return

        if (Math.abs(velocity.current) > 0.3) {
            scrollRef.current.scrollLeft -= velocity.current
            velocity.current *= 0.95 // friction
            animationFrame.current = requestAnimationFrame(animationStep)
        }
    }, [])

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (!scrollRef.current) return
        if (animationFrame.current) cancelAnimationFrame(animationFrame.current)
        if (autoScrollAnimationFrame.current) cancelAnimationFrame(autoScrollAnimationFrame.current)

        isDragging.current = true
        didDrag.current = false // Reset no mousedown
        startX.current = e.pageX - scrollRef.current.offsetLeft
        scrollLeft.current = scrollRef.current.scrollLeft

        lastTime.current = performance.now()
        lastX.current = e.pageX

        scrollRef.current.style.cursor = 'grabbing'
        scrollRef.current.style.userSelect = 'none'
        scrollRef.current.style.scrollSnapType = 'none'
    }, [])

    const onMouseLeave = useCallback(() => {
        if (!isDragging.current || !scrollRef.current) return
        isDragging.current = false
        scrollRef.current.style.cursor = 'grab'
        scrollRef.current.style.removeProperty('user-select')
        animationFrame.current = requestAnimationFrame(animate)
    }, [animate])

    const onMouseUp = useCallback(() => {
        if (!isDragging.current || !scrollRef.current) return
        isDragging.current = false
        scrollRef.current.style.cursor = 'grab'
        scrollRef.current.style.removeProperty('user-select')

        if (didDrag.current) {
            animationFrame.current = requestAnimationFrame(animate)
        } else {
            scrollRef.current.style.removeProperty('scroll-snap-type')
        }

        // Timer curto para resetar o didDrag e permitir o clique logo após o drag termiar
        setTimeout(() => {
            didDrag.current = false;
        }, 50)
    }, [animate])

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging.current || !scrollRef.current) return

        const x = e.pageX - scrollRef.current.offsetLeft
        const walk = x - startX.current

        // Apenas considera drag se mover mais de 3px (evita falsos drag em cliques trêmulos)
        if (Math.abs(walk) > 3) {
            didDrag.current = true // Dragging ocorreu!
            e.preventDefault()
        } else {
            return
        }

        const now = performance.now()
        const dt = now - lastTime.current
        const dx = e.pageX - lastX.current

        if (dt > 0) {
            velocity.current = dx / dt * 15 // Calculate velocity (px per frame roughly)
        }

        lastTime.current = now
        lastX.current = e.pageX

        scrollRef.current.scrollLeft = scrollLeft.current - walk
    }, [])

    const hasDragged = useCallback(() => didDrag.current, [])

    return {
        events: {
            onMouseDown,
            onMouseLeave,
            onMouseUp,
            onMouseMove,
        },
        scrollRef,
        hasDragged
    }
}
