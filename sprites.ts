namespace SpriteKind {
    export const Card = SpriteKind.create()
    export const CardContainer = SpriteKind.create()
    export const Cursor = SpriteKind.create()
}

enum CardCursorAnchors {
    //% block="top left"
    TopLeft,
    //% block="top"
    Top,
    //% block="top right"
    TopRight,
    //% block="left"
    Left,
    //% block="center"
    Center,
    //% block="right"
    Right,
    //% block="bottom left"
    BottomLeft,
    //% block="bottom"
    Bottom,
    //% block="bottom right"
    BottomRight
}

enum CardLayoutDirections {
    //% block="centered left right"
    CenteredLeftRight,
    //% block="left to right"
    LeftToRight,
    //% block="right to left"
    RightToLeft,

    //% block="centered up down"
    CenteredUpDown,
    //% block="top to bottom"
    TopToBottom,
    //% block="bottom to top"
    BottomToTop,
}

enum CardFaces {
    //% block="face unchanged"
    Unchanged,
    //% block="face up"
    Up,
    //% block="face down"
    Down,
}

namespace cardCore {
    const FLIP_SCALES = [1.0, 0.6, 0.3, 0.3, 0.6, 1.0]

    let DEFAULT_FLIP_DURATION = 300
    // let cursorZ = 1000

    function activate(sprite: Sprite, kind: number) {
        const scene = game.currentScene();
        sprite.setKind(kind);
        scene.physicsEngine.addSprite(sprite);
        scene.createdHandlers
            .filter(h => h.kind == kind)
            .forEach(h => h.handler(sprite));
    }

    export const EMPTY_CARD_DATA = new CardData([])
    
    export class Card extends Sprite {
        private _stamp: string
        private _showEmpty: boolean
        private _faceUp: boolean
        private _card: CardData

        constructor(
            private _design: CardDesign,
            public data: CardData,
            public container: CardContainer,
            faceUp: boolean
        ) {
            super(_design.createCardBaseImage())
            this._faceUp = faceUp
            this._card = data
            this._showEmpty = false
            this.refreshImage()
            activate(this, SpriteKind.Card)
        }

        get isEmpty(): boolean {
            return this._card === EMPTY_CARD_DATA
        }

        set cardData(data: CardData) {
            this._card = data
            this.refreshImage()
        }

        get cardData(): CardData {
            return this._card
        }
        
        set stamp(value: string) {
            this._stamp = value
            this.refreshImage()
        }

        set design(value: CardDesign) {
            if (this._design != value) {
                this._design = value
                this.refreshImage()
            }
        }

        get design(): CardDesign {
            return this._design
        }

        set visible(value: boolean) {
            this.setFlag(SpriteFlag.Invisible, !value)
        }

        get visible(): boolean {
            return !(this.flags & sprites.Flag.Invisible)
        }        

        set showEmpty(value: boolean) {
            this._showEmpty = value
            if (this.isEmpty) {
                this.refreshImage()
            }
        }

        get showEmpty(): boolean { return this._showEmpty }

        set isFaceUp(value: boolean) {
            extraAnimations.clearFixedFrameAnimation(this, true)
            if (value != this._faceUp) {
                this._faceUp = value
                this.refreshImage()
            }
        }

        get isFaceUp(): boolean { return this._faceUp }

        detachFromContainer() {
            if (this.container != null) {
                this.container.removeCard(this)
            }
        }

        resetTransforms() {
            this.sx = 1.0
            this.sy = 1.0
            this.setFlag(SpriteFlag.Invisible, false)
        }

        refreshImage() {
            this.image.fill(0)
            if (this.isEmpty && !this._showEmpty) {
                return
            } else if (this.isEmpty) {
                this._design.drawEmptyCard(this.image, 0, 0)                    
            } else if (this._faceUp) {
                this._design.drawCardFront(this.image, 0, 0, this._card)
                this._design.drawStamp(this.image, this._stamp)
            } else {
                this._design.drawCardBack(this.image, 0, 0)
            }
        }

        flip() {
            if (this.isEmpty) {
                return
            }
            this._faceUp = !this._faceUp
            if (extraAnimations.hasFixedFrameAnimation(this)) {
                extraAnimations.reverseFixedFrameAnimation(this)
            } else {
                extraAnimations.fixedFrameAnimate(
                    this,
                    DEFAULT_FLIP_DURATION,
                    FLIP_SCALES.length,
                    null,
                    null,
                    FLIP_SCALES,
                    null,
                    (_, step) => {
                        if (step == FLIP_SCALES.length / 2) {
                            this.refreshImage()
                        }
                    },
                    null
                )
    
            }
        }
    }

    sprites.onDestroyed(SpriteKind.Card, function (sprite: Sprite) {
        if (sprite instanceof Card) {
            sprite.detachFromContainer()
        }
    })
}

namespace cardCore {
    export type CardEventCondition = cardCore.CardAttribute
    export type CardEventHandler = (container: CardContainer, card: Card) => void

    type CardEvent = {
        kind: number,
        forEmpty: boolean
        condition: CardEventCondition
        handler: CardEventHandler
    }

    export function addCardEvent(kind: number, handler: CardEventHandler, forEmpty: boolean, condition: CardEventCondition = null) {
        cardEvents.push({ kind: kind, condition: condition, forEmpty: forEmpty, handler: handler })
    }

    const cardEvents: CardEvent[] = []
    function triggerCardSelectEvents(card: Card) {
        const container = card.container
        if (!container) {
            return
        }
        for (let event of cardEvents) {
            if (
                event.kind === container.kind
                && (event.forEmpty === card.isEmpty)
                && (!event.condition || card.cardData.attributeEquals(event.condition.attribute, event.condition.value))
            ) {
                event.handler(container, card)
            }
        }
    }
}

namespace cardCore {
    export const DEFAULT_CONTAINER_Z = 0
    export const DEFAULT_TRANSITION_Z_OFFSET = 100

    export const DEFAULT_SLIDE_DURATION = 500

    export const LAST_CARD_INDEX = -2

    export class CardContainer {
        protected empty: Card
        protected cards: Card[]
        protected _design: CardDesign
        protected _z: number
        protected _spacing: number
        protected _wrapSelection: boolean
        protected _visible: boolean
        protected _showEmpty: boolean

        constructor(
            protected x: number,
            protected y: number,
            private _kind: number,
        ) {
            this._z = DEFAULT_CONTAINER_Z
            this._showEmpty = true
            this._visible = true
            this.empty = new Card(this._design, EMPTY_CARD_DATA, this, true)
        }

        get isCardContainer(): boolean {
            return true
        }
        
        get kind(): number {
            return this._kind
        }

        get count(): number {
            return this.cards.reduce((count, card) => count + (card.isEmpty ? 0 : 1), 0)
        }

        setPosition(x: number, y: number): void {
            this.x = x
            this.y = y
            this.refresh()
        }

        set z(value: number) {
            this._z = value
            this.refresh()
        }

        set spacing(value: number) {
            if (this._spacing !== value) {
                this._spacing = value
                this.refresh()
            }
        }

        set wrapSelection(value: boolean) {
            this._wrapSelection = value
        }

        set design(value: CardDesign) {
            this._design = value
            this.empty.design = value

            if (this.count > 0) {
                for (let card of this.cards) {
                    card.design = value
                }
                this.refresh()
            }
        }

        set showEmpty(value: boolean) {
            this._showEmpty = value
            for (let card of this.cards) {
                card.showEmpty = value
            }
        }

        set visible(value: boolean) {
            this._visible = value
            if (!this._visible) {
                for (let card of this.cards) {
                    card.visible = false
                }
            } else {
                this.refresh()
            }
        }

        getCard(index: number): Card {
            if (index == LAST_CARD_INDEX) {
                index = this.cards.length - 1
            }
            if (index == null || index < 0 || index > this.cards.length - 1) {
                return null
            }
            return this.cards[index]
        }

        getCards(): Card[] {
            return this.cards.slice().filter(card => !card.isEmpty)
        }

        shuffle(): void {
            for (let i = 0; i < this.cards.length; i++) {
                const j = randint(0, this.cards.length - 1)
                const temp = this.cards[i]
                this.cards[i] = this.cards[j]
                this.cards[j] = temp
            }
            this.refresh()
        }

        insertCard(card: Card, index: number = LAST_CARD_INDEX, facing: CardFaces = CardFaces.Unchanged): void {
            if (!card) {
                return
            }

            if (!this._design) {
                this.design = card.design
            }

            card.detachFromContainer()
            card.container = this
            card.isFaceUp = facing != CardFaces.Unchanged
                ? facing === CardFaces.Up
                : card.isFaceUp
            card.showEmpty = this._showEmpty

            if (index === LAST_CARD_INDEX) {
                this.cards.push(card)
            } else {
                this.cards.insertAt(index, card)
            }
            // TODO: adjust card Z
            this.refresh()

            // TODO: move this elsewhere            
            if (this.cards.length === 1 && getCursorContainer() === this) {
                pointCursorAt(card)
            }
        }

        removeCardAt(index: number): Card {
            const card = this.getCard(index)
            if (!card) {
                return card
            }

            // TODO: move this elsewhere
            if (getCursorCard() === card) {
                if (this.cards.length === 1) {
                    removeCursor()
                } else if (index === this.cards.length - 1) {
                    pointCursorAt(this.cards[index - 1])
                } else {
                    pointCursorAt(this.cards[index + 1])
                }
            }

            extraAnimations.clearAnimations(card, true)
            card.resetTransforms()
            this.cards.splice(index, 1)

            this.refresh()
            return card
        }

        removeCard(card: Card): void {
            this.removeCardAt(this.cards.indexOf(card))
        }

        replaceWithEmptyAt(index: number): Card {
            const card = this.getCard(index)
            if (!card) {
                return card
            }

            extraAnimations.clearAnimations(card, true)
            card.resetTransforms()
            this.cards.splice(index, 1)

            const blank = new Card(card.design, EMPTY_CARD_DATA, this, true)
            this.cards.insertAt(index, blank)
            this.refresh()

            // TODO: move this elsewhere
            if (this.count === 0) {
                removeCursor()
            } else if (getCursorCard() === card) {
                pointCursorAt(blank)
            }

            return card
        }

        destroy() {
            for (let card of this.cards) {
                card.destroy()
            }
            this.cards = []
        }
        
        // TODO: move this elsewhere
        getCursorIndex(): number {
            const index = this.cards.indexOf(getCursorCard())
            return index >= 0 ? index : null
        }

        moveCursorIntoContainer(): void {
            if (this.cards.length < 1) {
                return
            }
            pointCursorAt(this.cards[0])
        }

        protected refreshEmptyCard(): void { 
            if (this.count === 0) {
                this.empty.visible = this._showEmpty
                this.empty.setPosition(this.x, this.y)
                this.empty.z = this._z
            } else {
                this.empty.visible = false
            }
        }

        refresh(): void {}
    }
}

namespace cardCore {

    export class CardStack extends CardContainer {
        private stack: Sprite
        private stackedCards: Card[]
        private _topIsFaceUp: boolean

        constructor(
            x: number,
            y: number,
            kind: number,
            private _stackIsFaceUp: boolean,
        ) {
            super(x, y, kind)
            this.stack = sprites.create(image.create(1, 1), SpriteKind.CardContainer)
            this.stackedCards = []
            this._topIsFaceUp = this._stackIsFaceUp
        }

        set stackIsFaceUp(value: boolean) {
            if (this._stackIsFaceUp !== value) {
                this._stackIsFaceUp = value
                this.refresh()
            }
        }

        set topIsFaceUp(value: boolean) {
            if (this._topIsFaceUp !== value) {
                this._topIsFaceUp = value
                this.refresh()
            }
        }

        insertCard(card: Card, index: number = LAST_CARD_INDEX): void {
            if (!card) {
                return
            }

            if (!this._design) {
                this.stack.setImage(card.design.createStackBaseimage())
                this.stack._x = Fx8(Fx.toFloat(this.stack._x) - this.stack.image.width / 2);
                this.stack._y = Fx8(Fx.toFloat(this.stack._y) - this.stack.image.height / 2);
            }

            super.insertCard(card, index, this._stackIsFaceUp ? CardFaces.Up : CardFaces.Down)
        }

        removeCardAt(index: number): Card {
            const card = super.removeCardAt(index)

            if (!card) {
                return card
            }

            const stackIndex = this.stackedCards.indexOf(card)
            if (stackIndex >= 0) {
                this.stackedCards.splice(this.stackedCards.indexOf(card), 1)
            }

            return card
        }

        removeCard(card: Card): void {
            this.removeCardAt(this.cards.indexOf(card))
        }
        
        destroy(): void {
            super.destroy()
            this.stackedCards = []
            this.refresh()
        }

        public refresh() {
            if (!this.design) {
                this.stack.setPosition(this.x, this.y)
                return
            }

            this.refreshEmptyCard()
            if (this.count === 0) {
                this.stack.setFlag(SpriteFlag.Invisible, true)
                return
            }

            this.stack.setFlag(SpriteFlag.Invisible, false)
            this.stack.image.fill(0)
            this.design.drawCardStack(
                this.stack.image,
                0, 0,
                this.stackedCards.length,
                this._stackIsFaceUp,
            )
            this.stack.setPosition(this.x, this.y - this.stack.image.height / 2 + this.design.height / 2)
            this.stack.z = this._z

            const topY = this.y - this.design.getStackThickness(this.stackedCards.length)

            let findingTopCard = true
            for (let i = 0; i < this.cards.length; i++) {
                const card = this.cards[i]
                if (this.stackedCards.indexOf(card) >= 0) {
                    card.setPosition(this.x, topY)
                    card.z = this._z + this.count - i
                    if (findingTopCard) {
                        findingTopCard = false
                        card.visible = true
                        card.isFaceUp = this._topIsFaceUp
                    } else {
                        card.visible = false
                    }
                } else {
                    card.visible = true
                    card.z = this._z + DEFAULT_TRANSITION_Z_OFFSET + this.count - i
                    extraAnimations.slide(
                        card,
                        this.x,
                        topY,
                        this._z + this.count - i + DEFAULT_TRANSITION_Z_OFFSET,
                        DEFAULT_SLIDE_DURATION,
                        () => {
                            this.stackedCards.push(card)
                            this.refresh()
                        }
                    )
                }
            }
        }

        insertData(data: CardData[]) {
            if (!!this.design) {
                this.cards = data
                    .map(cardData => new Card(this.design, cardData, this, this._stackIsFaceUp))
                    .concat(this.cards)
                this.refresh()
            }
        }
    }
}

namespace cardCore {

    export class CardSpread extends CardContainer {
        constructor(
            x: number,
            y: number,
            kind: number,
            private _direction: CardLayoutDirections,
        ) {
            super(x, y, kind)
            this._spacing = 1
        }

        private get isHorizonal(): boolean {
            return this._direction === CardLayoutDirections.LeftToRight
                || this._direction === CardLayoutDirections.RightToLeft
                || this._direction === CardLayoutDirections.CenteredLeftRight
        }

        private get isReversed(): boolean {
            return this._direction === CardLayoutDirections.RightToLeft
                || this._direction === CardLayoutDirections.BottomToTop
        }

        refresh() {
            if (!this.design) {
                return
            }

            super.refreshEmptyCard()
            if (this.count === 0) {
                return
            }

            let x: number = this.x
            let y: number = this.y
            let offsetX: number = 0
            let offsetY: number = 0

            if (this.isHorizonal) {
                x += this._design.width / 2
                offsetX = this._design.width + this._spacing
            } else {
                y += this._design.height / 2
                offsetY = this._design.height + this._spacing
            }

            if (this.isReversed) {
                offsetX = -offsetX
                offsetY = -offsetY
            }

            const width = (this._design.width + this._spacing) * this.cards.length - this._spacing
            const height = (this._design.height + this._spacing) * this.cards.length - this._spacing
            
            switch (this._direction) {
                case CardLayoutDirections.RightToLeft:
                    x -= width
                    break
                case CardLayoutDirections.CenteredLeftRight:
                    x -= width / 2
                    break
                case CardLayoutDirections.BottomToTop:
                    y -= height
                    break
                case CardLayoutDirections.CenteredUpDown:
                    y -= height / 2
                    break
            }

            for (let i = 0; i < this.cards.length; i++) {
                const card = this.cards[i]
                card.z = this._z + this._spacing >= 0 ? 0 : i + DEFAULT_TRANSITION_Z_OFFSET
                extraAnimations.slide(
                    card, x, y,
                    this.z + this._spacing >= 0 ? 0 : i,
                    DEFAULT_SLIDE_DURATION,
                    null
                )
                x += offsetX
                y += offsetY
            }
        }

        // moveCursorToIndex(index: number) {
        //     if (index >= 0 && index < this.cards.length) {
        //         pointCursorAt(this.cards[index])                
        //     } else if (this.cards.length >= 1) {
        //         pointCursorAt(this.cards[0])
        //     }
        // }

        // private moveCursorIndexByOffset(offset: number) {
        //     const index = this.cards.indexOf(getCursorCard())
        //     if (index >= 0) {
        //         if (this.isWrappingSelection) {
        //             this.moveCursorToIndex((index + this.cards.length + offset) % this.cards.length)
        //         } else {
        //             this.moveCursorToIndex(Math.min(this.cards.length - 1, Math.max(0, index + offset)))
        //         }
        //     } else {
        //         this.moveCursorToIndex(-1)
        //     }
        //     this.refresh()
        // }

        // moveCursorForward() {
        //     this.moveCursorIndexByOffset(1)
        // }

        // moveCursorBack() {
        //     this.moveCursorIndexByOffset(-1)
        // }
    }
}

namespace cardCore {
    const COLLAPSE_SCALE = [1.0, 0.3, 0.1, 0.1]
    const EXPAND_SCALE = [0.1, 0.7, 0.9, 1.0]

    export class CardGrid extends CardContainer {
        private startLine: number
        private scrollLine: number

        private _locked: boolean

        private lastShown: Card[]
        private collapse: number[]
        private expand: number[]

        constructor(
            x: number,
            y: number,
            kind: number,
            private rows: number,
            private columns: number,
            private scrollUpDown: boolean,
            private back: Sprite = null,
            private forward: Sprite = null,
        ) {
            super(x, y, kind)
            this.startLine = 0
            this.scrollLine = 0
            this._spacing = 1
            this._locked = false
            this._wrapSelection = false
            this.lastShown = []
        }

        setIndicators(back: Sprite, forward: Sprite) {
            if (!!this.back) {
                this.back.destroy()
            }
            if (!!this.forward) {
                this.forward.destroy()
            }
            this.back = back
            this.forward = forward
            this.refresh()
        }

        lock() {
            this._locked = true

            if ((this.scrollUpDown && this.count % this.columns === 0)
                || (!this.scrollUpDown && this.count % this.rows === 0)) {
                return
            }

            const filler = this.scrollUpDown
                ? this.columns - (this.cards.length % this.columns)
                : this.rows - (this.cards.length % this.rows)
            
            for (let i = 0; i < filler; i++) {
                this.cards.push(new Card(this._design, EMPTY_CARD_DATA, this, true))
            }
            this.refresh()
        }

        unlock() {
            this._locked = false
            for (let i = 0; i < this.cards.length; i++) {
                const card = this.cards[i]
                if (card.isEmpty) {
                    // if (getCursorCard() === card) {
                    //     if (this.cards.length === 1) {
                    //         removeCursor()
                    //     } else if (i > 0) {
                    //         pointCursorAt(this.cards[i - 1])
                    //     } else {
                    //         pointCursorAt(this.cards[i + 1])
                    //     }
                    // }
                    card.destroy()
                    this.cards.splice(i, 1)
                    i--
                }
            }
            this.refresh()
        }

        refresh() {
            if (!this.design) {
                return
            }

            super.refreshEmptyCard()
            if (this.cards.length === 0) {
                this.back.setFlag(SpriteFlag.Invisible, true)
                this.forward.setFlag(SpriteFlag.Invisible, true)
                return
            }

            // Calculate dimensions
            const cardWidth = this._design.width
            const cardHeight = this._design.height

            const width = (cardWidth + this._spacing) * this.columns - this._spacing
            const height = (cardHeight + this._spacing) * this.rows - this._spacing

            const left = this.x - width / 2 + cardWidth / 2
            const top = this.y - height / 2 + cardHeight / 2
            const right = left + (this.columns - 1) * (cardWidth + this._spacing)
            const bottom = top + (this.rows - 1) * (cardHeight + this._spacing)

            // Reposition indicators
            if (this.scrollUpDown) {
                if (!!this.back) {
                    this.back.x = this.x
                    this.back.y = this.y - height / 2 - this.back.height / 2 - this._spacing
                }
                if (!!this.forward) {
                    this.forward.x = this.x
                    this.forward.y = this.y + height / 2 + this.forward.height / 2 + this._spacing
                }
            } else {
                if (!!this.back) {
                    this.back.x = this.x - width / 2 - this.back.width / 2 - this._spacing
                    this.back.y = this.y
                }
                if (!!this.forward) {
                    this.forward.x = this.x + width / 2 + this.forward.width / 2 + this._spacing
                    this.forward.y = this.y
                }
            }

            // Calculate scroll
            if (this.scrollUpDown) {
                this.scrollLine = Math.min(this.scrollLine, Math.max(0, Math.ceil(this.cards.length / this.columns) - this.rows))
            } else {
                this.scrollLine = Math.min(this.scrollLine, Math.max(0, Math.ceil(this.cards.length / this.rows) - this.columns))
            }
            const scrolling: boolean = Math.abs(this.startLine - this.scrollLine) == 1
            const scrollDirection = this.scrollLine - this.startLine
            this.startLine = this.scrollLine
            
            const createPositionLookup = (scales: number[], center: number, size: number, direction: number): number[] => scales.map(scale =>
                center + (size / 2 * direction) - (size * scale / 2 * direction)
            )
            if (scrolling) {
                if (this.scrollUpDown) {
                    if (scrollDirection > 0) {
                        this.collapse = createPositionLookup(COLLAPSE_SCALE, top, cardHeight, -1)
                        this.expand = createPositionLookup(EXPAND_SCALE, bottom, cardHeight, 1)
                    } else {
                        this.collapse = createPositionLookup(COLLAPSE_SCALE, bottom, cardHeight, 1)
                        this.expand = createPositionLookup(EXPAND_SCALE, top, cardHeight, -1)
                    }
                } else {
                    if (scrollDirection > 0) {
                        this.collapse = createPositionLookup(COLLAPSE_SCALE, left, cardWidth, -1)
                        this.expand = createPositionLookup(EXPAND_SCALE, right, cardWidth, 1)
                    } else {
                        this.collapse = createPositionLookup(COLLAPSE_SCALE, right, cardWidth, 1)
                        this.expand = createPositionLookup(EXPAND_SCALE, left, cardWidth, -1)
                    }
                }
            }

            const firstIndex = this.scrollUpDown
                ? this.startLine * this.columns
                : this.startLine * this.rows
            const lastIndex = firstIndex + this.rows * this.columns

            let index = firstIndex
            let row = 0
            let column = 0

            // const cursorIndex = this.cards.indexOf(getCursorCard())
            // if (cursorIndex >= 0 && (cursorIndex < index || cursorIndex >= lastIndex)) {
            //     pointCursorAt(this.cards[Math.max(index, Math.min(lastIndex - 1, cursorIndex))])
            // }

            // Reset animations
            for (let card of this.cards) {
                extraAnimations.clearFixedFrameAnimation(card, true)
                card.resetTransforms()
                card.z = this._z
            }

            // Hide and collapse previously visible cards
            this.cards.forEach((card, i) => {
                if (i < index || i >= index + this.rows * this.columns) {
                    if (scrolling && this.lastShown.indexOf(card) >= 0) {
                        extraAnimations.clearSlideAnimation(card, true)
                        if (this.scrollUpDown) {
                            extraAnimations.fixedFrameAnimate(
                                card,
                                DEFAULT_SLIDE_DURATION,
                                this.collapse.length,
                                null, this.collapse,
                                null, COLLAPSE_SCALE,
                                null,
                                () => card.visible = false
                            )
                        } else {
                            extraAnimations.fixedFrameAnimate(
                                card,
                                DEFAULT_SLIDE_DURATION,
                                this.collapse.length,
                                this.collapse, null,
                                COLLAPSE_SCALE, null,
                                null,
                                () => card.visible = false)
                        }
                    } else {
                        card.visible = false
                    }
                }
            })

            // Slide and expand visible cards
            const nextShown: Card[] = []
            do {
                const x = left + column * (cardWidth + this._spacing)
                const y = top + row * (cardHeight + this._spacing)
                const card = this.cards[index]

                if (scrolling && this.lastShown.indexOf(card) < 0) {
                    extraAnimations.clearSlideAnimation(card, true)
                    card.x = x
                    card.y = y
                    if (this.scrollUpDown) {
                        extraAnimations.fixedFrameAnimate(
                            card,
                            DEFAULT_SLIDE_DURATION,
                            this.expand.length,
                            null, this.expand,
                            null, EXPAND_SCALE,
                            null,
                            null
                        )
                    } else {
                        extraAnimations.fixedFrameAnimate(
                            card,
                            DEFAULT_SLIDE_DURATION,
                            this.expand.length,
                            this.expand, null,
                            EXPAND_SCALE, null,
                            null,
                            null
                        )
                    }
                } else {
                    extraAnimations.slide(card, x, y, this._z, DEFAULT_SLIDE_DURATION, null)
                }
                nextShown.push(card)

                if (this.scrollUpDown) {
                    column++
                    if (column >= this.columns) {
                        row++
                        column = 0
                    }
                } else {
                    row++
                    if (row >= this.rows) {
                        column++
                        row = 0
                    }
                }
                index++
            } while (index < this.cards.length && index < lastIndex)
            this.lastShown = nextShown
            
            // Update indicators visibility
            if (!!this.back) {
                this.back.setFlag(SpriteFlag.Invisible, this.startLine === 0)
            }
            if (!!this.forward) {
                this.forward.setFlag(SpriteFlag.Invisible, this.scrollUpDown
                    ? this.startLine + this.rows >= Math.ceil(this.cards.length / this.columns)
                    : this.startLine + this.columns >= Math.ceil(this.cards.length / this.rows)
                )
            }
        }

        removeCardAt(index: number): Card {
            return this._locked
                ? this.replaceWithEmptyAt(index)
                : super.removeCardAt(index)
        }

        // moveCursorToIndex(index: number) {
        //     if (this.cards.length === 0) {
        //         return
        //     }
        //     if (index < 0 || index >= this.cards.length) {
        //         index = 0
        //     }
        //     this.scrollLine = this.startLine
        //     if(this.scrollLeftRight) {
        //         if(index < this.startLine * this.rows) {
        //             this.scrollLine = Math.floor(index / this.rows)
        //         } else if(index > (this.startLine + this.columns - 1) * this.rows) {
        //             this.scrollLine = Math.floor(index / this.rows - (this.columns - 1))
        //         }
        //     } else {
        //         if(index < this.startLine * this.columns) {
        //             this.scrollLine = Math.floor(index / this.columns)
        //         } else if(index > (this.startLine + this.rows - 1) * this.columns) {
        //             this.scrollLine = Math.floor(index / this.columns - (this.rows - 1))
        //         }
        //     }
        //     if(this.startLine !== this.scrollLine) {
        //         this.refresh()
        //     }
        //     pointCursorAt(this.cards[index])
        // }
        
        // private moveCursorIndexByOffset(rowOffset: number, columnOffset: number) {
        //     let index = this.getCursorIndex()
        //     if (index < 0) {
        //         this.moveCursorToIndex(0)
        //         return
        //     }

        //     let row = this.scrollLeftRight
        //         ? index % this.rows
        //         : Math.floor(index / this.columns)
        //     let column = this.scrollLeftRight
        //         ? Math.floor(index / this.rows)
        //         : index % this.columns
        //     let maxRow = this.scrollLeftRight
        //         ? this.rows
        //         : Math.ceil(this.cards.length / this.columns)
        //     let maxColumn = this.scrollLeftRight
        //         ? Math.ceil(this.cards.length / this.rows)
        //         : this.columns
        //     row += rowOffset
        //     column += columnOffset

        //     if (this.isWrappingSelection) {
        //         if (row < 0) {
        //             row = maxRow + row
        //         } else if (row >= maxRow) {
        //             row -= maxRow
        //         }
        //         if (column < 0) {
        //             column = maxColumn + column
        //         } else if (column >= maxColumn) {
        //             column -= maxColumn
        //         }
        //     } else {
        //         row = Math.max(0, Math.min(row, maxRow - 1))
        //         column = Math.max(0, Math.min(column, maxColumn - 1))
        //     }

        //     index = this.scrollLeftRight
        //         ? column * this.rows + row
        //         : row * this.columns + column            
        //     if (index >= this.cards.length) {
        //         index = this.cards.length - 1
        //     }
        //     this.moveCursorToIndex(index)
        // }

        // moveCursorLeft() {
        //     this.moveCursorIndexByOffset(0, -1)
        // }

        // moveCursorRight() {
        //     this.moveCursorIndexByOffset(0, 1)
        // }

        // moveCursorUp() {
        //     this.moveCursorIndexByOffset(-1, 0)
        // }

        // moveCursorDown() {
        //     this.moveCursorIndexByOffset(1, 0)
        // }
    }
}

namespace cardCore {
    let cursorAnchor: CardCursorAnchors = CardCursorAnchors.Bottom
    let cursorExtraOffsetX = 0
    let cursorExtraOffsetY = 0
    let cursorOffsetX = 0
    let cursorOffsetY = 0
    let cursorContainer: CardContainer = null
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
    cursor.z = cursorZ
    cursor.setFlag(SpriteFlag.Invisible, true)

    game.onUpdate(() => {
        if (!!cursor) {
            if (!!cursorTarget) {
                updateCursorOffset()
                cursor.x = Math.round((cursorTarget.x + cursor.x + cursorOffsetX) / 2)
                cursor.y = Math.round((cursorTarget.y + cursor.y + cursorOffsetY) / 2)
            }
        }
    })

    export function getCursorSprite(): Sprite {
        return cursor
    }
    
    export function setCursorAnchor(anchor: CardCursorAnchors, x: number = 0, y: number = 0) {
        cursorAnchor = anchor
        cursorExtraOffsetX = x
        cursorExtraOffsetY = y
    }

    export function updateCursorOffset() {
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
            case CardCursorAnchors.Center:
                cursorOffsetX = 0
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
                break
            case CardCursorAnchors.Center:
                cursorOffsetY = 0
        }
        cursorOffsetX += cursorExtraOffsetX
        cursorOffsetY += cursorExtraOffsetY
    }

    export function pointCursorAt(target: any) {
        if (!target) {
            removeCursor()
            return
        }
        const hasPreviousTarget = !!cursorTarget

        if (target instanceof Sprite) {
            cursorTarget = target
        } else if (target.isCardContainer()) {
            (target as CardContainer).moveCursorIntoContainer()
            return
        } else {
            removeCursor()
            return
        }

        if (cursorTarget instanceof Card) {
            cursorContainer = (cursorTarget as Card).container
        }
        if (cursorTarget instanceof CardStack) {
            cursorContainer = cursorTarget
        }
            
        cursor.setFlag(SpriteFlag.Invisible, false)
        updateCursorOffset()
        if (!hasPreviousTarget) {
            cursor.x = cursorTarget.x + cursorOffsetX
            cursor.y = cursorTarget.y + cursorOffsetY
        }
    }

    export function removeCursor() {
        cursorTarget = null
        cursor.setFlag(SpriteFlag.Invisible, true)
    }

    export function getCursorContainer(): CardContainer {
        return cursorContainer
    }

    export function preselectCursorContainer(container: CardContainer) {
        cursorContainer = container
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

    export function selectCursorCard() {
        if(!!cursorTarget && cursorTarget instanceof Card) {
            triggerCardSelectEvents(cursorTarget)
        }
    }
}