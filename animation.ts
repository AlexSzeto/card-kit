namespace extraAnimations {

    type AnimationTracker = {
        sprite: Sprite
        isHiddenOnComplete: boolean
        isDestroyedOnComplete: boolean
    }

    type SlideTracker = AnimationTracker & {
        timer: number
        x: number
        y: number
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
        stepHandler: (step: number) => void
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
        if (oldTracker.isDestroyedOnComplete) {
            sprite.destroy()
        } else {
            if (jump) {
                oldTracker.step = oldTracker.totalSteps - 1
                updateFixedFrameAnimation(oldTracker)
            }
            if (oldTracker.isHiddenOnComplete) {
                sprite.setFlag(SpriteFlag.Invisible, true)
            }
        }
        fixedFrameTrackers.splice(fixedFrameTrackers.indexOf(oldTracker), 1)
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
        if (!!tracker.stepHandler) {
            tracker.stepHandler(tracker.step)
        }
    }

    function clearSlideAnimation(sprite: Sprite, jump: boolean = false) {
        const oldTracker = slideTrackers.find(tracker => tracker.sprite === sprite)
        if (!oldTracker) {
            return
        }
        clearTimeout(oldTracker.timer)
        if (jump) {
            oldTracker.sprite.setPosition(oldTracker.x, oldTracker.y)
            oldTracker.sprite.setVelocity(0, 0)
        }
        slideTrackers.splice(slideTrackers.indexOf(oldTracker), 1)
    }

    export function slide(
        sprite: Sprite,
        x: number,
        y: number,
        timeInMs: number,
        isHiddenOnComplete: boolean = false,
        isDestroyedOnComplete: boolean = false
    ) {
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
            isHiddenOnComplete: isHiddenOnComplete,
            isDestroyedOnComplete: isDestroyedOnComplete
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
        stepHandler: (step: number) => void,
        isHiddenOnComplete: boolean,
        isDestroyedOnComplete: boolean
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
            isHiddenOnComplete: isHiddenOnComplete,
            isDestroyedOnComplete: isDestroyedOnComplete,
            stepHandler: stepHandler,
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
        return !!fixedFrameTrackers.find(tracker => tracker.sprite === sprite)
    }

    export function clearAnimations(sprite: Sprite, jump: boolean = false) {
        clearSlideAnimation(sprite, jump)
        clearFixedFrameAnimation(sprite, jump)
    }
}