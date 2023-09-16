enum CardCursorAnchors {
    TopLeft,
    Top,
    TopRight,
    Left,
    Center,
    Right,
    BottomLeft,
    Bottom,
    BottomRight
}

namespace SpriteKind {
    export const Card = SpriteKind.create()
    export const Cursor = SpriteKind.create()
}

namespace cardKit {
    const FLIP_SCALES = [1.0, 0.6, 0.3, 0.3, 0.6, 1.0]
    const COLLAPSE_SCALE = [1.0, 0.3, 0.1, 0.1]
    const EXPAND_SCALE = [0.1, 0.7, 0.9, 1.0]

    let flipAnimationDuration = 300
    let slideAnimationDuration = 500

    function activate(sprite: Sprite) {
        const scene = game.currentScene();
        sprite.setKind(SpriteKind.Card);
        scene.physicsEngine.addSprite(sprite);
        scene.createdHandlers
            .filter(h => h.kind == SpriteKind.Card)
            .forEach(h => h.handler(sprite));
    }

    export class Card extends Sprite {
        location: CardContainer
        indicator: string
        private _isFaceUp: boolean

        constructor(
            private design: CardDesign,
            private card: CardData,
            isFaceUp: boolean
        ) {
            super(design.createCardBaseImage())
            this.location = null
            this._isFaceUp = isFaceUp
            this.refreshImage()
            activate(this)
        }

        private refreshImage() {
            this.image.fill(0)
            if(this._isFaceUp) {
                this.design.drawCardFront(this.image, 0, 0, this.card)
                this.design.drawStamp(this.image, this.indicator)
            } else {
                this.design.drawCardBack(this.image, 0, 0)
            }
        }

        public getData(): CardData {
            return this.card
        }

        set isFaceUp(value: boolean) {
            extraAnimations.clearAnimations(this, true)
            if (value != this._isFaceUp) {
                this._isFaceUp = value
                this.refreshImage()
            }
        }
        get isFaceUp(): boolean { return this._isFaceUp }        

        flip() {
            if (extraAnimations.hasFixedFrameAnimation(this)) {
                extraAnimations.reverseFixedFrameAnimation(this)
            }
            extraAnimations.fixedFrameAnimate(
                this,
                flipAnimationDuration,
                FLIP_SCALES.length,
                null,
                null,
                FLIP_SCALES,
                null,
                (step) => {
                    if (step == FLIP_SCALES.length / 2) {
                        this._isFaceUp = !this._isFaceUp
                        this.refreshImage()
                    }
                },
                false,
                false
            )
        }
    }

    type CardEventCondition = cardKit.CardAttribute
    type CardEventHandler = (card: Card) => void
    type CardEvent = {
        condition: CardEventCondition
        handler: CardEventHandler
    }

    function resolveEvents(card: Card, target: CardContainer, events: CardEvent[]) {
        const origin = card.location
        for (let event of events) {
            if(card.getData().getAttribute(event.condition.id) === event.condition.value) {
                event.handler(card)
                if(card.location !== origin || (card.flags & sprites.Flag.Destroyed)) {
                    return false
                }
            }
        }
        card.location = target
        return true
    }

    interface CardContainer {
        getId(): string
        getCardCount(): number,

        setPosition(x: number, y: number): void
        setLayer(z: number): void

        addEvent(condition: CardEventCondition, handler: CardEventHandler): void
        insertCard(card: Card, index: number): void
        removeCard(index: number): Card
    }

    export class CardStack extends Sprite implements CardContainer {
        private events: CardEvent[]
        constructor(
            private containerId: string,
            private design: CardDesign,
            private cards: CardData[],
            private isStackFaceUp: boolean,
            private isTopCardFaceUp: boolean,
        ) {
            super(design.createStackBaseimage())
            this.events = []
            this.refreshImage()
            activate(this)
        }

        private refreshImage() {
            this.image.fill(0)
            this.design.drawCardStack(this.image, 0, 0, this.cards, this.isStackFaceUp, this.isTopCardFaceUp)
        }

        insertCardData(data: CardData[]) {
            this.cards = data.concat(this.cards)
            this.refreshImage()
        }

        flipStack(isFaceUp: boolean): void {
            this.isStackFaceUp = isFaceUp
            this.isTopCardFaceUp = isFaceUp
            this.refreshImage()
        }

        flipTopCard(): void {
            this.isTopCardFaceUp = !this.isTopCardFaceUp
            this.refreshImage()
        }

        setLayer(z: number): void {
            this.z = z
        }

        getId(): string {
            return this.containerId
        }

        getCardCount(): number {
            return this.cards.length
        }

        addEvent(condition: CardAttribute, handler: CardEventHandler): void {
            this.events.push({ condition: condition, handler: handler })
        }

        insertCard(card: Card, index: number = -1): void {
            if (resolveEvents(card, this, this.events)) {
                const cardData = card.getData()
                if (index < 0) {
                    this.cards.push(cardData)
                } else {
                    this.cards.insertAt(index, cardData)
                }
                sprites.destroy(card)
                this.refreshImage()                    
            }
        }

        removeCard(index: number = 0): Card {
            const card = new Card(this.design, this.cards[index], this.isStackFaceUp)
            card.setPosition(this.x, this.y + this.design.getStackTopYOffset(this.cards.length))
            this.cards.splice(index, 1)
            this.refreshImage()
            return card
        }
    }

    class BaseLayoutContainer implements CardContainer {
        private events: CardEvent[]        
        constructor(
            private id: string,
            protected x: number,
            protected y: number,
            protected z: number,
            protected cards: Card[],
            public isInsertFaceUp: boolean,
        ) { 
            this.events = []
        }

        getId(): string {
            return this.id
        }

        getCardCount(): number {
            return this.cards.length
        }

        setPosition(x: number, y: number): void {
            this.x = x
            this.y = y
            this.reposition()
        }

        setLayer(z: number): void {
            this.z = z
            this.reposition()
        }

        addEvent(condition: CardEventCondition, handler: CardEventHandler): void {
            this.events.push({ condition: condition, handler: handler })
        }

        insertCard(card: Card, index: number = -1): void {
            if (resolveEvents(card, this, this.events)) {
                card.isFaceUp = this.isInsertFaceUp
                if (index < 0) {
                    this.cards.push(card)
                } else {
                    this.cards.insertAt(index, card)
                }
                this.reposition()
            }
        }

        removeCard(index: number = 0): Card {
            const card = this.cards[index]
            this.cards.splice(index, 1)
            this.reposition()
            return card
        }
        
        getCursorIndex(): number {
            return this.cards.indexOf(getCursorCard())
        }

        selectCurrentCard() {
            
        }

        protected reposition(): void {}
    }

    export class CardSpread extends BaseLayoutContainer {
        private cardWidth: number
        private cardHeight: number

        constructor(
            id: string,
            x: number,
            y: number,
            z: number,
            cards: Card[],
            isInsertFaceUp: boolean,
            private isSpreadingLeftRight: boolean,
            private spacing: number,
            private selectedCardOffset: number,
            public isWrappingSelection: boolean
        ) {
            super(id, x, y, z, cards, isInsertFaceUp)
            this.cardWidth = -1
            this.cardHeight = -1
            this.reposition()
        }

        protected reposition() {
            if (this.cards.length === 0) {
                return
            }
            if (this.cardWidth < 0) {
                this.cardWidth = this.cards[0].width
            }
            if (this.cardHeight < 0) {
                this.cardHeight = this.cards[0].height
            }
            if(this.isSpreadingLeftRight) {
                const width = (this.cardWidth + this.spacing) * this.cards.length  - this.spacing
                let x = this.x - width / 2
                this.cards.forEach((card, index) => {
                    extraAnimations.slide(
                        card,
                        x + this.cardWidth / 2,
                        this.y + (cursorTarget === card ? this.selectedCardOffset : 0),
                        slideAnimationDuration)
                    x += this.cardWidth + this.spacing
                    card.z = this.z + this.spacing >= 0 ? 0 : index
                })
            } else {
                const height = (this.cardHeight + this.spacing) * this.cards.length  - this.spacing
                let y = this.y - height / 2
                this.cards.forEach((card, index) => {
                    extraAnimations.slide(
                        card,
                        this.x + (cursorTarget === card ? this.selectedCardOffset : 0),
                        y + this.cardHeight / 2,
                        slideAnimationDuration)
                    y += this.cardHeight + this.spacing
                    card.z = this.z + this.spacing >= 0 ? 0 : index
                })
            }
        }

        moveCursorToIndex(index: number) {
            if (index >= 0 && index < this.cards.length) {
                pointCursorAt(this.cards[index])                
            } else if (this.cards.length >= 1) {
                pointCursorAt(this.cards[0])
            }
        }

        private moveCursorIndexByOffset(offset: number) {
            const index = this.cards.indexOf(getCursorCard())
            if (index >= 0) {
                if (this.isWrappingSelection) {
                    this.moveCursorToIndex((index + this.cards.length + offset) % this.cards.length)
                } else {
                    this.moveCursorToIndex(Math.min(this.cards.length - 1, Math.max(0, index + offset)))
                }
            } else {
                this.moveCursorToIndex(-1)
            }
            this.reposition()
        }

        moveCursorForward() {
            this.moveCursorIndexByOffset(-1)
        }

        moveCursorBack() {
            this.moveCursorIndexByOffset(1)
        }
    }

    type GridLayoutPosition = {
        x: number,
        y: number,
        animated: boolean,
        xFrames: number[],
        yFrames: number[],
        sxFrames: number[],
        syFrames: number[],

    }

    export class CardGrid extends BaseLayoutContainer {
        private firstLine: number
        private scrollToLine: number
        private cardWidth: number
        private cardHeight: number

        private collapsePositions: number[]
        private expandPositions: number[]

        constructor(
            id: string,
            x: number,
            y: number,
            z: number,
            cards: Card[],
            private rows: number,
            private columns: number,
            private isScrollingLeftRight: boolean,
            isInsertFaceUp: boolean,
            private spacing: number,
            public isWrappingSelection: boolean,
            private scrollBackIndicator: Sprite,
            private scrollForwardIndicator: Sprite,
        ) {
            super(id, x, y, z, cards, isInsertFaceUp)
            this.firstLine = 0
            this.scrollToLine = 0
            this.cardWidth = -1
            this.cardHeight = -1

            this.reposition()            
        }

        protected reposition() {
            if (this.cards.length === 0) {
                this.scrollBackIndicator.setFlag(SpriteFlag.Invisible, true)
                this.scrollForwardIndicator.setFlag(SpriteFlag.Invisible, true)
                return
            }

            if (this.cardWidth < 0) {
                this.cardWidth = this.cards[0].width
            }
            if (this.cardHeight < 0) {
                this.cardHeight = this.cards[0].height
            }

            const isScrolling: boolean = Math.abs(this.firstLine - this.scrollToLine) == 1
            const scrollDirection = this.scrollToLine - this.firstLine
            this.firstLine = this.scrollToLine

            const width = (this.cardWidth + this.spacing) * this.columns - this.spacing
            const height = (this.cardHeight + this.spacing) * this.rows - this.spacing

            const columnLeft = this.x - width / 2 + this.cardWidth / 2
            const rowTop = this.y - height / 2 + this.cardHeight / 2
            const columnRight = columnLeft + (this.columns - 1) * (this.cardWidth + this.spacing)
            const columnBottom = rowTop + (this.rows - 1) * (this.cardHeight + this.spacing)

            let index = this.isScrollingLeftRight
                ? this.firstLine * this.rows 
                : this.firstLine * this.columns
            const lastIndex = index + this.rows * this.columns

            if (this.isScrollingLeftRight) {
                if (!!this.scrollBackIndicator) {
                    this.scrollBackIndicator.x = this.x - width / 2 - this.scrollBackIndicator.width / 2 - this.spacing
                    this.scrollBackIndicator.y = this.y
                }
                if (!!this.scrollForwardIndicator) {
                    this.scrollForwardIndicator.x = this.x + width / 2 + this.scrollForwardIndicator.width / 2 + this.spacing
                    this.scrollForwardIndicator.y = this.y
                }               
            } else {
                if (!!this.scrollBackIndicator) {
                    this.scrollBackIndicator.x = this.x
                    this.scrollBackIndicator.y = this.y - height / 2 - this.scrollBackIndicator.height / 2 - this.spacing
                }
                if (!!this.scrollForwardIndicator) {
                    this.scrollForwardIndicator.x = this.x
                    this.scrollForwardIndicator.y = this.y + height / 2 + this.scrollForwardIndicator.height / 2 + this.spacing
                }               
            }

            const isVisible = (card: Card): boolean => !(card.flags & SpriteFlag.Invisible)
            const createPositionLookup = (scales: number[], center: number, size: number, direction: number): number[] => scales.map(scale =>
                center + (size / 2 * direction) - (size * scale / 2 * direction)
            )

            if (isScrolling) {
                if (this.isScrollingLeftRight) {
                    if (scrollDirection > 0) {
                        this.collapsePositions = createPositionLookup(COLLAPSE_SCALE, columnLeft, this.cardWidth, -1)
                        this.expandPositions = createPositionLookup(EXPAND_SCALE, columnRight, this.cardWidth, 1)
                    } else {
                        this.collapsePositions = createPositionLookup(COLLAPSE_SCALE, columnRight, this.cardWidth, 1)
                        this.expandPositions = createPositionLookup(EXPAND_SCALE, columnLeft, this.cardWidth, -1)
                    }
                } else {
                    if (scrollDirection > 0) {
                        this.collapsePositions = createPositionLookup(COLLAPSE_SCALE, rowTop, this.cardHeight, -1)
                        this.expandPositions = createPositionLookup(EXPAND_SCALE, columnBottom, this.cardHeight, 1)
                    } else {
                        this.collapsePositions = createPositionLookup(COLLAPSE_SCALE, columnBottom, this.cardHeight, 1)
                        this.expandPositions = createPositionLookup(EXPAND_SCALE, rowTop, this.cardHeight, -1)
                    }
                }
            }
            
            let row = 0
            let column = 0
                
            this.cards.forEach((card, i) => {
                if ((i < index || i >= index + this.rows * this.columns) && isVisible(card)) {
                    if (isScrolling) {
                        extraAnimations.clearAnimations(card, true)
                        if (this.isScrollingLeftRight) {
                            extraAnimations.fixedFrameAnimate(card, slideAnimationDuration, this.collapsePositions.length, this.collapsePositions, null, COLLAPSE_SCALE, null, null, true, false)
                        } else {
                            extraAnimations.fixedFrameAnimate(card, slideAnimationDuration, this.collapsePositions.length, null, this.collapsePositions, null, COLLAPSE_SCALE, null, true, false)
                        }
                    } else {
                        card.setFlag(SpriteFlag.Invisible, true)
                    }
                }
            })

            do {
                const x = columnLeft + column * (this.cardWidth + this.spacing)
                const y = rowTop + row * (this.cardHeight + this.spacing)
                const card = this.cards[index]

                if (!isVisible(card)) {
                    card.setFlag(SpriteFlag.Invisible, false)
                    card.x = x
                    card.y = y
                    card.z = this.z
                    extraAnimations.clearAnimations(card, true)                    
                    if (isScrolling) {
                        if (this.isScrollingLeftRight) {
                            extraAnimations.fixedFrameAnimate(card, slideAnimationDuration, this.expandPositions.length, this.expandPositions, null, EXPAND_SCALE, null, null, false, false)
                        } else {
                            extraAnimations.fixedFrameAnimate(card, slideAnimationDuration, this.expandPositions.length, null, this.expandPositions, null, EXPAND_SCALE, null, false, false)
                        }
                    } 
                } else {
                    extraAnimations.clearFixedFrameAnimation(card, true)
                    extraAnimations.slide(card, x, y, slideAnimationDuration)
                }

                if (this.isScrollingLeftRight) {
                    row++
                    if(row >= this.rows) {
                        column++
                        row = 0
                    }
                } else {
                    column++
                    if(column >= this.columns) {
                        row++
                        column = 0
                    }
                }
                index++
            } while (index < this.cards.length && index < lastIndex)
            
            if (!!this.scrollBackIndicator) {
                this.scrollBackIndicator.setFlag(SpriteFlag.Invisible, this.firstLine === 0)
            }
            if (!!this.scrollForwardIndicator) {
                this.scrollForwardIndicator.setFlag(SpriteFlag.Invisible, this.isScrollingLeftRight
                    ? this.firstLine + this.columns >= Math.ceil(this.cards.length / this.rows)
                    : this.firstLine + this.rows >= Math.ceil(this.cards.length / this.columns)
                )
            }
        }

        removeCard(index?: number): Card {            
            extraAnimations.clearAnimations(this.cards[index], true)
            return super.removeCard(index)
        }

        moveCursorToIndex(index: number) {
            if (this.cards.length === 0) {
                return
            }
            if (index < 0 || index >= this.cards.length) {
                index = 0
            }
            this.scrollToLine = this.firstLine
            if(this.isScrollingLeftRight) {
                if(index < this.firstLine * this.rows) {
                    this.scrollToLine = Math.floor(index / this.rows)
                } else if(index > (this.firstLine + this.columns - 1) * this.rows) {
                    this.scrollToLine = Math.floor(index / this.rows - (this.columns - 1))
                }
            } else {
                if(index < this.firstLine * this.columns) {
                    this.scrollToLine = Math.floor(index / this.columns)
                } else if(index > (this.firstLine + this.rows - 1) * this.columns) {
                    this.scrollToLine = Math.floor(index / this.columns - (this.rows - 1))
                }
            }
            if(this.firstLine !== this.scrollToLine) {
                this.reposition()
            }
            pointCursorAt(this.cards[index])
        }
        
        private moveCursorIndexByOffset(rowOffset: number, columnOffset: number) {
            let index = this.getCursorIndex()
            if (index < 0) {
                this.moveCursorToIndex(0)
                return
            }

            let row = this.isScrollingLeftRight
                ? index % this.rows
                : Math.floor(index / this.columns)
            let column = this.isScrollingLeftRight
                ? Math.floor(index / this.rows)
                : index % this.columns
            let maxRow = this.isScrollingLeftRight
                ? this.rows
                : Math.ceil(this.cards.length / this.columns)
            let maxColumn = this.isScrollingLeftRight
                ? Math.ceil(this.cards.length / this.rows)
                : this.columns
            row += rowOffset
            column += columnOffset

            if (this.isWrappingSelection) {
                if (row < 0) {
                    row = maxRow + row
                } else if (row >= maxRow) {
                    row -= maxRow
                }
                if (column < 0) {
                    column = maxColumn + column
                } else if (column >= maxColumn) {
                    column -= maxColumn
                }
            } else {
                row = Math.max(0, Math.min(row, maxRow - 1))
                column = Math.max(0, Math.min(column, maxColumn - 1))
            }

            index = this.isScrollingLeftRight
                ? column * this.rows + row
                : row * this.columns + column            
            if (index >= this.cards.length) {
                index = this.cards.length - 1
            }
            this.moveCursorToIndex(index)
        }

        moveCursorLeft() {
            this.moveCursorIndexByOffset(0, -1)
        }

        moveCursorRight() {
            this.moveCursorIndexByOffset(0, 1)
        }

        moveCursorUp() {
            this.moveCursorIndexByOffset(-1, 0)
        }

        moveCursorDown() {
            this.moveCursorIndexByOffset(1, 0)
        }
    }

    let cursorAnchor: CardCursorAnchors = CardCursorAnchors.Bottom
    let cursorOffsetX = 0
    let cursorOffsetY = 0
    let cursorTarget: Sprite = null
    const cursor = sprites.create(img`
        . . . f f . . . .
        . . f 1 1 f . . .
        . . f 1 1 f . . .
        . . f 1 1 f f . .
        . f f 1 1 b b f .
        f 1 f 1 1 d d d f
        f 1 d 1 1 1 1 1 f
        . f d 1 1 1 1 1 f
        . . f d 1 1 1 d f
        . . . f f f f f .
    `, SpriteKind.Cursor)
    cursor.z = 1000
    cursor.setFlag(SpriteFlag.Invisible, true)

    game.onUpdate(() => {
        if (!!cursor) {
            if (!!cursorTarget) {
                setCursorAnchor(cursorAnchor)
                cursor.x = Math.round((cursorTarget.x + cursor.x + cursorOffsetX) / 2)
                cursor.y = Math.round((cursorTarget.y + cursor.y + cursorOffsetY) / 2)
            }
        }
    })

    export function getCursorSprite(): Sprite {
        return cursor
    }
    
    export function setCursorAnchor(anchor: CardCursorAnchors) {
        cursorAnchor = anchor
        if (!cursorTarget) {
            return
        }
        switch (cursorAnchor) {
            case CardCursorAnchors.Left:
            case CardCursorAnchors.TopLeft:
            case CardCursorAnchors.BottomLeft:
                cursorOffsetX = -cursorTarget.width / 2
                break
            case CardCursorAnchors.Right:
            case CardCursorAnchors.TopRight:
            case CardCursorAnchors.BottomRight:
                cursorOffsetX = cursorTarget.height / 2
                break
        }
        switch (cursorAnchor) {
            case CardCursorAnchors.Top:
            case CardCursorAnchors.TopLeft:
            case CardCursorAnchors.TopRight:
                cursorOffsetY = -cursorTarget.height / 2
                break
            case CardCursorAnchors.Bottom:
            case CardCursorAnchors.BottomLeft:
            case CardCursorAnchors.BottomRight:
                cursorOffsetY = cursorTarget.height / 2
        }        
    }

    export function pointCursorAt(target: Sprite) {
        const hasPreviousTarget = !!cursorTarget
        cursorTarget = target
        cursor.setFlag(SpriteFlag.Invisible, !cursorTarget)
        setCursorAnchor(cursorAnchor)
        if (!hasPreviousTarget) {
            cursor.x = cursorTarget.x + cursorOffsetX
            cursor.y = cursorTarget.y + cursorOffsetY
        }
    }

    export function removeCursor() {
        cursorTarget = null
        cursor.setFlag(SpriteFlag.Invisible, true)
    }

    export function getCursorTarget(): Sprite {
        return cursorTarget
    }

    export function getCursorCard(): Card {
        if (!!cursorTarget && cursorTarget instanceof Card) {
            return cursorTarget
        } else {
            return null
        }
    }
}