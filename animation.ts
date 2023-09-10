namespace smoothMoves {
    type SpriteTracker = {
        sprite: Sprite
        timer: number
    }

    const slideTrackers: SpriteTracker[] = []

    function clearSpriteTimeout(sprite: Sprite) {
        const oldTracker = slideTrackers.find(tracker => tracker.sprite === sprite)
        if (!!oldTracker) {
            clearTimeout(oldTracker.timer)
            slideTrackers.splice(slideTrackers.indexOf(oldTracker), 1)
        }
    }
    
    export function spriteHasActiveAnimation(sprite: Sprite): boolean {
        return slideTrackers.some(tracker => tracker.sprite === sprite)
    }
    
    export function spriteKindHasActiveAnimation(kind: number): boolean {
        return slideTrackers.some(tracker => tracker.sprite.kind() === kind)
    }

    export function slide(sprite: Sprite, x: number, y: number, timeInMs: number) {
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
        clearSpriteTimeout(sprite)
        slideTrackers.push({
            sprite: sprite,
            timer: setTimeout(() => {
                sprite.setPosition(x, y)
                sprite.setVelocity(0, 0)
                clearSpriteTimeout(sprite)
            }, timeInMs)
        })
    }
}