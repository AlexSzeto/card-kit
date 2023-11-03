namespace extraAnimations {

    type AnimationTracker = {
        sprite: Sprite
        onComplete: (sprite: Sprite) => void
    }

    type SlideTracker = AnimationTracker & {
        timer: number
        x: number
        y: number
        z: number
    }

    type FixedFrameTracker = AnimationTracker & {
        step: number
        totalSteps: number
        elapsed: number
        msPerFrame: number
        direction: number
        x: number[]
        y: number[]
        sx: number[]
        sy: number[]
        onAnimateStep: (sprite: Sprite, step: number) => void
    }

    const slideTrackers: SlideTracker[] = []
    const fixedFrameTrackers: FixedFrameTracker[] = []

    let elapsedTime: number = game.runtime()
    game.onUpdate(() => {
        const elapsed = game.runtime() - elapsedTime
        elapsedTime = game.runtime()
        for (let i = 0; i < fixedFrameTrackers.length; i++) {
            const tracker = fixedFrameTrackers[i]
            let isComplete = false
            tracker.elapsed += elapsed
            while (!isComplete && tracker.elapsed >= tracker.msPerFrame) {
                tracker.step += tracker.direction
                if (
                    (tracker.direction > 0 && tracker.step >= tracker.totalSteps)
                    || (tracker.direction < 0 && tracker.step < 0)
                ) {
                    isComplete = true
                    clearFixedFrameAnimation(tracker.sprite)
                    i--
                } else {
                    updateFixedFrameAnimation(tracker)
                    tracker.elapsed -= tracker.msPerFrame
                }
            }
        }
    })

    export function clearFixedFrameAnimation(sprite: Sprite, jump: boolean = false) {
        const oldTracker = fixedFrameTrackers.find(tracker => tracker.sprite === sprite)
        if (!oldTracker) {
            return
        }
        fixedFrameTrackers.splice(fixedFrameTrackers.indexOf(oldTracker), 1)
        if (jump) {
            oldTracker.step += oldTracker.direction
            while(oldTracker.step >= 0 && oldTracker.step < oldTracker.totalSteps) {
                updateFixedFrameAnimation(oldTracker)
                oldTracker.step += oldTracker.direction
            }
        }
        if (!!oldTracker.onComplete) {
            oldTracker.onComplete(oldTracker.sprite)
        }
    }

    export function updateFixedFrameAnimation(tracker: FixedFrameTracker) {
        if (!!tracker.x) {
            tracker.sprite.x = tracker.x[tracker.step]
        }
        if (!!tracker.y) {
            tracker.sprite.y = tracker.y[tracker.step]
        }
        if (!!tracker.sx) {
            tracker.sprite.sx = tracker.sx[tracker.step]
        }
        if (!!tracker.sy) {
            tracker.sprite.sy = tracker.sy[tracker.step]
        }
        if (!!tracker.onAnimateStep) {
            tracker.onAnimateStep(tracker.sprite, tracker.step)
        }
    }

    export function clearSlideAnimation(sprite: Sprite, jump: boolean = false) {
        const oldTracker = slideTrackers.find(tracker => tracker.sprite === sprite)
        if (!oldTracker) {
            return
        }
        slideTrackers.splice(slideTrackers.indexOf(oldTracker), 1)
        clearTimeout(oldTracker.timer)
        if (jump) {
            oldTracker.sprite.setPosition(oldTracker.x, oldTracker.y)
            oldTracker.sprite.setVelocity(0, 0)
            oldTracker.sprite.z = oldTracker.z
        }
        if (!!oldTracker.onComplete) {
            oldTracker.onComplete(oldTracker.sprite)
        }
    }

    export function slide(
        sprite: Sprite,
        x: number,
        y: number,
        z: number,
        timeInMs: number,
        onComplete: (sprite: Sprite) => void
    ) {
        const oldTracker = slideTrackers.find(tracker => tracker.sprite === sprite)
        if (!!oldTracker) {
            if (oldTracker.x === x && oldTracker.y === y && oldTracker.z === z) {
                return
            } else {
                slideTrackers.splice(slideTrackers.indexOf(oldTracker), 1)
            }
        }
        const t = timeInMs / 1000
        const v = Math.sqrt((x - sprite.x) * (x - sprite.x) + (y - sprite.y) * (y - sprite.y)) / t
        if (v > 250) {
            const t = timeInMs / 1000
            sprite.vx = (x - sprite.x) / t
            sprite.vy = (y - sprite.y) / t
            sprite.fx = 0
            sprite.fy = 0
            sprite.ax = 0
            sprite.ay = 0
        } else {
            const t = timeInMs / 1000
            const ax = -2 * (x - sprite.x) / (t * t)
            sprite.vx = -Math.floor(ax * t)
            sprite.fx = Math.ceil(Math.abs(ax))
            sprite.ax = 0
            const ay = -2 * (y - sprite.y) / (t * t)
            sprite.vy = -Math.floor(ay * t)
            sprite.fy = Math.ceil(Math.abs(ay))
            sprite.ay = 0
        }
        clearSlideAnimation(sprite)
        slideTrackers.push({
            sprite: sprite,
            timer: setTimeout(() => clearSlideAnimation(sprite, true), timeInMs),
            x: x,
            y: y,
            z: z,
            onComplete: onComplete
        })
    }

    export function fixedFrameAnimate(
        sprite: Sprite,
        timeInMs: number,
        totalSteps: number,
        x: number[],
        y: number[],
        sx: number[],
        sy: number[],
        onAnimateStep: (sprite: Sprite, step: number) => void,
        onComplete: (sprite: Sprite) => void
    ) {
        clearFixedFrameAnimation(sprite)
        const tracker = {
            sprite: sprite,
            step: 0,
            totalSteps: totalSteps,
            elapsed: 0,
            msPerFrame: timeInMs / totalSteps,
            x: x,
            y: y,
            sx: sx,
            sy: sy,
            onAnimateStep: onAnimateStep,
            onComplete: onComplete,
            direction: 1
        }
        updateFixedFrameAnimation(tracker)
        fixedFrameTrackers.push(tracker)
    }

    export function reverseFixedFrameAnimation(sprite: Sprite) {
        const tracker = fixedFrameTrackers.find(tracker => tracker.sprite === sprite)
        if (!!tracker) {
            tracker.direction = -tracker.direction
        }
    }

    export function hasFixedFrameAnimation(sprite: Sprite): boolean {
        return fixedFrameTrackers.some(tracker => tracker.sprite === sprite)
    }

    export function clearAnimations(sprite: Sprite, jump: boolean = false) {
        clearSlideAnimation(sprite, jump)
        clearFixedFrameAnimation(sprite, jump)
    }
}