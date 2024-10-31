namespace SpriteKind {
    export const Card = SpriteKind.create()
    export const CardContainer = SpriteKind.create()
    export const Cursor = SpriteKind.create()
}

enum CardLayoutDirections {
    //% block="left and right from center"
    CenteredLeftRight,
    //% block="left to right"
    LeftToRight,
    //% block="right to left"
    RightToLeft,

    //% block="up and down from center"
    CenteredUpDown,
    //% block="top to bottom"
    TopToBottom,
    //% block="bottom to top"
    BottomToTop,
}

enum RelativeDirections {
    //% block="above"
    Above = 1,
    //% block="below"
    Below,
    //% block="left of"
    LeftOf,
    //% block="right of"
    RightOf
}

enum CardFaces {
    //% block="face unchanged"
    Unchanged,
    //% block="face up"
    Up,
    //% block="face down"
    Down,
}

// Card
namespace cardCore {
    const FLIP_SCALES = [1.0, 0.6, 0.3, 0.3, 0.6, 1.0]
    const DEFAULT_FLIP_DURATION = 300

    let cardUID = 1

    function activate(sprite: Sprite, kind: number) {
        const scene = game.currentScene();
        sprite.setKind(kind);
        scene.physicsEngine.addSprite(sprite);
        scene.createdHandlers
            .filter(h => h.kind == kind)
            .forEach(h => h.handler(sprite));
    }

    export const EMPTY_CARD_DATA = new CardData()
    
    export class Card extends Sprite {
        private _design: CardDesign
        private _showEmpty: boolean
        private _faceUp: boolean
        private _card: CardData
        private _uid: number

        constructor(
            design: CardDesign,
            data: CardData,
            public container: CardContainer,
            faceUp: boolean
        ) {
            super(design.createCardBaseImage())
            this._design = design
            this._faceUp = faceUp
            this._card = data
            this._showEmpty = true
            this._uid = cardUID++
            this.refreshImage()
            activate(this, SpriteKind.Card)
        }

        get uid(): number {
            return this._uid
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

        set design(value: CardDesign) {
            if (!!value && this._design != value) {
                this._design = value
                this.setImage(this._design.createCardBaseImage())
                this._x = Fx8(Fx.toFloat(this._x) - this.image.width / 2)
                this._y = Fx8(Fx.toFloat(this._y) - this.image.height / 2)
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

        get showEmpty(): boolean {
            return this._showEmpty 
        }

        set isFaceUp(value: boolean) {
            extraAnimations.clearFixedFrameAnimation(this, true)
            if (value != this._faceUp) {
                this._faceUp = value
                this.refreshImage()
            }
        }

        get isFaceUp(): boolean { return this._faceUp }

        getAttribute(attribute: number): CardAttributeValues {
            return this.cardData.getAttribute(attribute)
        }

        setAttribute(attribute: number, value: CardAttributeValues) {
            if (!this.cardData.attributeEquals(attribute, value)) {
                this.cardData.setAttribute(attribute, value)
                this.refreshImage()
            }
        }

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

// CardEvent
namespace cardCore {

    type SpriteCursorEvent = {
        button: SelectionButtons,
        handler: (sprite: Sprite) => void
    }

    type CardEvent = {
        kind: number,
        button: SelectionButtons,
        handler: (container: CardContainer, card: Card) => void
    }

    type EmptySlotEvent = {
        kind: number,
        button: SelectionButtons,
        handler: (container: CardContainer) => void
    }

    const spriteCursorEvents: SpriteCursorEvent[] = []
    export function addSpriteEvent(button: SelectionButtons, handler: (sprite: Sprite) => void) {
        spriteCursorEvents.push({ button: button, handler: handler })
    }
    
    const cardEvents: CardEvent[] = []
    export function addCardEvent(kind: number, button: SelectionButtons, handler: (container: CardContainer, card: Card) => void) {
        cardEvents.push({ kind: kind, button: button, handler: handler })
    }

    const emptySlotEvents: EmptySlotEvent[] = []
    export function addEmptySlotEvent(kind: number, button: SelectionButtons, handler: (container: CardContainer) => void) {
        emptySlotEvents.push({ kind: kind, button: button, handler: handler })
    }

    export function dispatchActivateEvents(sprite: Sprite, button: SelectionButtons) {
        if (!(sprite instanceof Card)) {
            for (let event of spriteCursorEvents) {
                if (event.button === button) {
                    event.handler(sprite)
                }
            }
            return
        }

        const card = sprite as Card
        const container = card.container
        if (!container) {
            return
        }

        if (!card.isEmpty) {
            for (let event of cardEvents) {
                if (event.kind === container.kind && event.button === button) {
                    event.handler(container, card)
                }
            }
        } else {
            for (let event of emptySlotEvents) {
                if (event.kind === container.kind && event.button === button) {
                    event.handler(container)
                }
            }
        }
    }
}

// CardContainer
namespace cardCore {
    export const DEFAULT_CONTAINER_Z = 0
    export const DEFAULT_TRANSITION_Z_OFFSET = 100

    export const DEFAULT_SLIDE_SPEED = 125

    export const LAST_CARD_INDEX = -2

    const containerList: CardContainer[] = []

    export function getCardContainersOfKind(kind: number): CardContainer[] {
        return containerList.filter(container => container.kind === kind)
    }

    export class CardContainer implements cardCursor.SelectableContainer {        
        private _kind: number
        protected _design: CardDesign
        protected _z: number
        protected _visible: boolean

        protected _spacing: number

        protected empty: Card
        protected cards: Card[]
        protected transition: Card[]

        constructor(
            design: CardDesign,
            protected x: number,
            protected y: number,
            kind: number,
        ) {
            this._design = design
            this._kind = kind
            this._z = DEFAULT_CONTAINER_Z
            this._visible = true

            this._spacing = 1

            this.empty = new Card(this._design, EMPTY_CARD_DATA, this, true)
            this.cards = []
            this.transition = []

            containerList.push(this)
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

        get inactive(): number {
            return this.cards.reduce((count, card) => count + (card.isEmpty ? 0 : 1), 0) - this.transition.length
        }

        get slots(): number {
            return this.cards.length
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

        get z(): number {
            return this._z
        }

        set spacing(value: number) {
            if (this._spacing !== value) {
                this._spacing = value
                this.refresh()
            }
        }

        get spacing(): number {
            return this._spacing
        }

        protected setDesign(value: CardDesign) {
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
            this.empty.showEmpty = value
            for (let card of this.cards) {
                card.showEmpty = value
            }
        }

        get showEmpty(): boolean {
            return this.empty.showEmpty
        }

        set design(value: CardDesign) {
            this.setDesign(value)
        }

        get design(): CardDesign { return this._design }

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
                index = this.slots - 1
            }
            if (index == null || index < 0 || index > this.slots - 1) {
                return null
            }
            return this.cards[index]
        }

        getCards(): Card[] {
            return this.cards.slice().filter(card => !card.isEmpty)
        }

        shuffle(): void {
            for (let i = 0; i < this.slots; i++) {
                const j = randint(0, this.slots - 1)
                const temp = this.cards[i]
                this.cards[i] = this.cards[j]
                this.cards[j] = temp
            }
            this.refresh()
        }

        insertCard(card: Card, index: number, facing: CardFaces): void {
            if (!card) {
                return
            }

            card.detachFromContainer()
            card.container = this
            card.showEmpty = this.showEmpty
            card.isFaceUp = facing !== CardFaces.Unchanged
                ? facing === CardFaces.Up
                : card.isFaceUp

            if (index === LAST_CARD_INDEX) {
                this.cards.push(card)
            } else {
                const slot = this.getCard(index)
                if(!!slot && slot.isEmpty) {
                    sprites.destroy(slot)
                }
                this.cards.insertAt(index, card)
            }
            this.transition.push(card)
            this.refresh()

            if (this.slots === 1 && cardCursor.selectedCardContainer() === this) {
                cardCursor.select(card)
            }
        }

        protected completeTransition(card: Card) {
            const transitionIndex = this.transition.indexOf(card)
            if(transitionIndex >= 0) {
                this.transition.splice(transitionIndex, 1)
                this.refreshEmptyCard()
            }
        }

        removeCardAt(index: number): Card {
            const card = this.getCard(index)
            if (!card) {
                return card
            }

            this.deselect(index)

            extraAnimations.clearFixedFrameAnimation(card, true)
            card.resetTransforms()
            this.cards.splice(index, 1)

            const transitionIndex = this.transition.indexOf(card)
            if (transitionIndex >= 0) {
                this.transition.splice(transitionIndex, 1)
            }

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
            blank.showEmpty = this.showEmpty
            this.cards.insertAt(index, blank)
            this.refresh()
            this.completeTransition(blank)
            extraAnimations.clearSlideAnimation(blank, true)

            this.deselect(index)
            cardCursor.select(blank)

            return card
        }

        destroy() {
            while (this.cards.length > 0) {
                this.cards[0].destroy()
            }
            this.empty.destroy()
            containerList.removeElement(this)
        }        

        protected refreshEmptyCard(): void { 
            if (this.inactive === 0) {
                this.empty.visible = true
                this.empty.setPosition(this.x, this.y)
                this.empty.z = this._z
            } else {
                this.empty.visible = false
            }
        }

        refresh(): void { }

        set cursorIndex(index: number) {
            if (index === LAST_CARD_INDEX) {
                index = this.slots - 1
            }
            if (index < 0 || index >= this.slots) {
                return
            }
            cardCursor.select(this.cards[index])
        }
        
        get cursorIndex(): number {
            return this.cards.indexOf(cardCursor.selectedCard())
        }

        startSelection(): void {
            if (this.cursorIndex >= 0) {
                return
            }

            if (this.slots < 1) {
                cardCursor.select(this.empty)
            } else {
                cardCursor.select(this.cards[0])
            }
        }

        switchSelection(fromExit: RelativeDirections): void {
            this.startSelection()
        }

        protected deselect(index: number): void {
            if (this.cursorIndex != index) {
                return
            }

            if (this.slots === 1) {
                cardCursor.select(this.empty)
            } else if (index === this.slots - 1) {
                cardCursor.select(this.cards[index - 1])
            } else {
                cardCursor.select(this.cards[index + 1])
            }
        }

        selectLeft(): void { }
        selectRight(): void { }
        selectUp(): void { }
        selectDown(): void { }
    }
}

// CardStack
namespace cardCore {

    export class CardStack extends CardContainer {
        private stack: Sprite
        private _topIsFaceUp: boolean
        private _stackIsFaceUp: boolean

        constructor(
            design: CardDesign,
            x: number,
            y: number,
            kind: number,
            stackIsFaceUp: boolean,
        ) {
            super(design, x, y, kind)
            this.stack = sprites.create(design.createStackBaseimage(), SpriteKind.CardContainer)
            this._stackIsFaceUp = stackIsFaceUp
            this._topIsFaceUp = this._stackIsFaceUp
        }

        protected setDesign(value: CardDesign) {
            this.stack.setImage(value.createStackBaseimage())
            this.stack._x = Fx8(Fx.toFloat(this.stack._x) - this.stack.image.width / 2)
            this.stack._y = Fx8(Fx.toFloat(this.stack._y) - this.stack.image.height / 2)
            super.setDesign(value)
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

        get topIsFaceUp(): boolean {
            return this._topIsFaceUp
        }

        insertCard(card: Card, index: number, facing: CardFaces): void {
            if (!card) {
                return
            }
            super.insertCard(card, index, this._stackIsFaceUp ? CardFaces.Up : CardFaces.Down)
        }

        public refresh() {
            this.refreshEmptyCard()
            if (this.count === 0) {
                this.stack.setFlag(SpriteFlag.Invisible, true)
                return
            }

            const stackCount = this.cards.length - this.transition.length
            this.stack.setFlag(SpriteFlag.Invisible, false)
            this.stack.image.fill(0)
            this.design.drawCardStack(
                this.stack.image,
                0, 0,
                stackCount,
                this._stackIsFaceUp,
            )
            this.stack.setPosition(this.x, this.y - this.stack.image.height / 2 + this.design.height / 2)
            this.stack.z = this._z

            const topY = this.y - this.design.getStackThickness(stackCount)

            let findingTopCard = true
            for (let i = 0; i < this.slots; i++) {
                const card = this.cards[i]
                                if (this.transition.indexOf(card) < 0) {
                    card.setPosition(this.x, topY)
                    card.z = this._z + this.count - i + 1
                    if (findingTopCard) {
                        findingTopCard = false
                        card.visible = true
                        card.isFaceUp = this._topIsFaceUp
                    } else {
                        card.visible = false
                    }
                } else {
                    card.visible = true
                   card.z = this._z + this.slots - i + 1 + DEFAULT_TRANSITION_Z_OFFSET
                    extraAnimations.slide(
                        card,
                        this.x,
                        topY,
                        this._z + this.slots - i + 1,
                        DEFAULT_SLIDE_SPEED,
                        () => {
                            this.completeTransition(card)
                            this.refresh()
                        }
                    )
                }
            }
        }

        insertData(data: CardData[]) {
            if (!!this.design) {
                const insert = data
                    .map(cardData => new Card(this.design, cardData, this, this._stackIsFaceUp))
                this.cards = insert.slice().concat(this.cards)
                this.refresh()
            }
        }

        selectLeft(): void {
            cardCursor.dispatchExitContainerEvent(this, RelativeDirections.LeftOf)
        }

        selectRight(): void {
            cardCursor.dispatchExitContainerEvent(this, RelativeDirections.RightOf)
        }

        selectUp(): void {
            cardCursor.dispatchExitContainerEvent(this, RelativeDirections.Above)
        }

        selectDown(): void {
            cardCursor.dispatchExitContainerEvent(this, RelativeDirections.Below)
        }
    }
}

// CardSpread
namespace cardCore {

    export class CardSpread extends CardContainer {
        private _direction: CardLayoutDirections

        constructor(
            design: CardDesign,
            x: number,
            y: number,
            kind: number,
            direction: CardLayoutDirections,
        ) {
            super(design, x, y, kind)
            this._direction = direction
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

        insertData(data: CardData[], faceUp: boolean) {
            if (!!this.design) {
                data.forEach(cardData => {
                    const card = new Card(this.design, cardData, this, faceUp)
                    card.x = this.x
                    card.y = this.y
                    this.insertCard(card, LAST_CARD_INDEX, faceUp ? CardFaces.Up : CardFaces.Down)
                })
            }
        }

        refresh() {
            super.refreshEmptyCard()
            if (this.count === 0) {
                return
            }

            let x: number = this.x
            let y: number = this.y
            let offsetX: number = 0
            let offsetY: number = 0

            if (this.isHorizonal) {
                offsetX = this._design.width + this._spacing
            } else {
                offsetY = this._design.height + this._spacing
            }

            if (this.isReversed) {
                offsetX = -offsetX
                offsetY = -offsetY
            }

            const width = (this._design.width + this._spacing) * this.slots - this._spacing
            const height = (this._design.height + this._spacing) * this.slots - this._spacing
            
            switch (this._direction) {
                case CardLayoutDirections.CenteredLeftRight:
                    x -= width / 2 - this._design.width / 2
                    break
                case CardLayoutDirections.CenteredUpDown:
                    y -= height / 2 - this._design.height / 2
                    break
            }

            for (let i = 0; i < this.slots; i++) {
                const card = this.cards[i]
                card.z = this._z + i + 1 + (this.transition.indexOf(card) >= 0 ? DEFAULT_TRANSITION_Z_OFFSET : 0)
                extraAnimations.slide(
                    card, x, y,
                    this._z + i + 1,
                    DEFAULT_SLIDE_SPEED,
                    () => this.completeTransition(card)
                )
                x += offsetX
                y += offsetY
            }
        }

        switchSelection(fromExit: RelativeDirections): void {
            if (this.slots === 0) {
                this.startSelection()
                return
            }

            if (
                (this.isHorizonal && !this.isReversed && fromExit === RelativeDirections.LeftOf)
                || (this.isHorizonal && this.isReversed && fromExit === RelativeDirections.RightOf)
                || (!this.isHorizonal && !this.isReversed && fromExit === RelativeDirections.Above)
                || (!this.isHorizonal && this.isReversed && fromExit === RelativeDirections.Below)
            ) {
                cardCursor.select(this.cards[this.slots - 1])
            } else if (
                (this.isHorizonal && !this.isReversed && fromExit === RelativeDirections.RightOf)
                || (this.isHorizonal && this.isReversed && fromExit === RelativeDirections.LeftOf)
                || (!this.isHorizonal && !this.isReversed && fromExit === RelativeDirections.Below)
                || (!this.isHorizonal && this.isReversed && fromExit === RelativeDirections.Above)
            ) {
                cardCursor.select(this.cards[0])
            } else {
                cardCursor.select(this.cards[Math.floor(this.slots / 2)])
            }
        }

        private selectByOffset(offset: number) {
            const index = this.cursorIndex
            if (index >= 0) {
                this.cursorIndex = (Math.min(this.slots - 1, Math.max(0, index + offset)))
            } else {
                this.startSelection()
            }
        }

        selectLeft(): void {
            if (this.slots === 0) {
                cardCursor.dispatchExitContainerEvent(this, RelativeDirections.LeftOf)
                return
            }
            if (this.isHorizonal) {
                if (this.cursorIndex === 0) {
                    cardCursor.dispatchExitContainerEvent(this, RelativeDirections.LeftOf)
                } else {
                    this.selectByOffset(-1)
                }
            } else {
                cardCursor.dispatchExitContainerEvent(this, RelativeDirections.LeftOf)
            }
        }

        selectRight(): void {
            if (this.slots === 0) {
                cardCursor.dispatchExitContainerEvent(this, RelativeDirections.RightOf)
                return
            }
            if (this.isHorizonal) {
                if (this.cursorIndex === this.slots - 1) {
                    cardCursor.dispatchExitContainerEvent(this, RelativeDirections.RightOf)
                } else {
                    this.selectByOffset(1)
                }
            } else {
                cardCursor.dispatchExitContainerEvent(this, RelativeDirections.RightOf)
            }
        }

        selectUp(): void {
            if (this.slots === 0) {
                cardCursor.dispatchExitContainerEvent(this, RelativeDirections.Above)
                return
            }
            if (!this.isHorizonal) {
                if (this.cursorIndex === 0) {
                    cardCursor.dispatchExitContainerEvent(this, RelativeDirections.Above)
                } else {
                    this.selectByOffset(-1)
                }
            } else {
                cardCursor.dispatchExitContainerEvent(this, RelativeDirections.Above)
            }
        }

        selectDown(): void {
            if (this.slots === 0) {
                cardCursor.dispatchExitContainerEvent(this, RelativeDirections.Below)
                return
            }
            if (!this.isHorizonal) {
                if (this.cursorIndex === this.slots - 1) {
                    cardCursor.dispatchExitContainerEvent(this, RelativeDirections.Below)
                } else {
                    this.selectByOffset(1)
                }
            } else {
                cardCursor.dispatchExitContainerEvent(this, RelativeDirections.Below)
            }
        }
    }
}

// CardGrid
namespace cardCore {
    const COLLAPSE_SCALE = [0.7, 0.3, 0.1, 0.1]
    const EXPAND_SCALE = [0.1, 0.7, 0.9, 1.0]

    export class CardGrid extends CardContainer {
        private startLine: number
        private scrollLine: number

        private _locked: boolean

        private justInserted: Card
        private collapse: number[]
        private expand: number[]

        constructor(
            design: CardDesign,
            x: number,
            y: number,
            kind: number,
            private rows: number,
            private columns: number,
            private scrollUpDown: boolean,
            private back: Sprite = null,
            private forward: Sprite = null,
        ) {
            super(design, x, y, kind)
            this.startLine = 0
            this.scrollLine = 0
            this._spacing = 1
            this._locked = false
            this.refresh()
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

        lock(minLines: number) {
            this._locked = true

            if (minLines < 1) {
                minLines = this.scrollUpDown ? this.rows : this.columns
            }

            if ((this.scrollUpDown && this.count % this.columns === 0)
                || (!this.scrollUpDown && this.count % this.rows === 0)) {
                return
            }

            const filler = (this.scrollUpDown
                ? Math.max(minLines, Math.floor(this.slots / this.columns)) * this.columns
                : Math.max(minLines, Math.floor(this.slots / this.rows)) * this.rows)
                - this.slots
            
            for (let i = 0; i < filler; i++) {
                this.cards.push(new Card(this._design, EMPTY_CARD_DATA, this, true))
            }
            this.refresh()
        }

        unlock() {
            this._locked = false
            for (let i = 0; i < this.slots; i++) {
                const card = this.cards[i]
                if (card.isEmpty) {
                    this.deselect(i)
                    card.destroy()
                    this.cards.splice(i, 1)
                    i--
                }
            }
            this.refresh()
        }

        insertData(data: CardData[], faceUp: boolean) {
            if (!!this.design) {
                data.forEach(cardData => {
                    const card = new Card(this.design, cardData, this, faceUp)
                    card.x = this.x
                    card.y = this.y
                    this.insertCard(card, LAST_CARD_INDEX, faceUp ? CardFaces.Up : CardFaces.Down)
                })
            }
        }

        destroy(): void {
            if (!!this.back) {
                this.back.destroy()
            }
            if (!!this.forward) {
                this.forward.destroy()
            }
            this.unlock()
            super.destroy()
        }

        refresh() {
            super.refreshEmptyCard()

            // Calculate dimensions
            const cardWidth = this._design.width
            const cardHeight = this._design.height

            const width = (cardWidth + this._spacing) * this.columns - this._spacing
            const height = (cardHeight + this._spacing) * this.rows - this._spacing

            const left = this.x - width / 2 + cardWidth / 2
            const top = this.y - height / 2 + cardHeight / 2
            const right = left + (this.columns - 1) * (cardWidth + this._spacing)
            const bottom = top + (this.rows - 1) * (cardHeight + this._spacing)

            if (this.inactive === 0) {
                this.empty.x = left
                this.empty.y = top
            }

            if (this.slots === 0) {
                this.back.setFlag(SpriteFlag.Invisible, true)
                this.forward.setFlag(SpriteFlag.Invisible, true)
                return
            }

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
                this.scrollLine = Math.min(this.scrollLine, Math.max(0, Math.ceil(this.slots / this.columns) - this.rows))
            } else {
                this.scrollLine = Math.min(this.scrollLine, Math.max(0, Math.ceil(this.slots / this.rows) - this.columns))
            }
            const scrolling: boolean = Math.abs(this.startLine - this.scrollLine) <= 1
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
            const insertReferesh = this.justInserted !== null

            // Update cursor
            const cursorIndex = this.cursorIndex
            if (cursorIndex >= 0 && (cursorIndex < firstIndex || cursorIndex >= lastIndex)) {
                this.cursorIndex = Math.max(firstIndex, Math.min(lastIndex - 1, cursorIndex))
            }

            let index = firstIndex
            let row = 0
            let column = 0

            // Reset animations
            for (let card of this.cards) {
                if (!insertReferesh || card === this.justInserted) {
                    extraAnimations.clearFixedFrameAnimation(card, true)
                    card.z = this._z
                }
            }

            // Hide and collapse previously visible cards
            this.cards.forEach((card, i) => {
                if (insertReferesh && card != this.justInserted) {
                    return
                }
                if (i < index || i >= index + this.rows * this.columns) {
                    extraAnimations.clearSlideAnimation(card, true)
                    this.completeTransition(card)
                    if (scrolling && card.visible && card != this.justInserted) {
                        if (this.scrollUpDown) {
                            extraAnimations.fixedFrameAnimate(
                                card,
                                DEFAULT_SLIDE_SPEED,
                                this.collapse.length,
                                null, this.collapse,
                                null, COLLAPSE_SCALE,
                                null,
                                () => card.visible = false
                            )
                        } else {
                            extraAnimations.fixedFrameAnimate(
                                card,
                                DEFAULT_SLIDE_SPEED,
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
            do {
                if (!insertReferesh || this.justInserted === this.cards[index]) {
                    const x = left + column * (cardWidth + this._spacing)
                    const y = top + row * (cardHeight + this._spacing)
                    const card = this.cards[index]
                    card.z += index - firstIndex + 1

                    if (!scrolling) {
                        card.resetTransforms()
                        card.x = x
                        card.y = y
                        card.visible = true
                    } else if (!card.visible) {
                        extraAnimations.clearSlideAnimation(card, true)
                        card.resetTransforms()
                        card.x = x
                        card.y = y
                        if (this.scrollUpDown) {
                            extraAnimations.fixedFrameAnimate(
                                card,
                                DEFAULT_SLIDE_SPEED,
                                this.expand.length,
                                null, this.expand,
                                null, EXPAND_SCALE,
                                null,
                                null
                            )
                        } else {
                            extraAnimations.fixedFrameAnimate(
                                card,
                                DEFAULT_SLIDE_SPEED,
                                this.expand.length,
                                this.expand, null,
                                EXPAND_SCALE, null,
                                null,
                                null
                            )
                        }
                    } else {
                        if (this.transition.indexOf(card) >= 0) {
                            card.z += DEFAULT_TRANSITION_Z_OFFSET
                        } else {
                            extraAnimations.clearSlideAnimation(card, true)
                        }
                        extraAnimations.slide(card, x, y, this._z, DEFAULT_SLIDE_SPEED,
                            () => this.completeTransition(card)
                        )
                    }
                }

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
            } while (index < this.slots && index < lastIndex)
            
            // Update indicators visibility
            if (!!this.back) {
                this.back.setFlag(SpriteFlag.Invisible, this.startLine === 0)
            }
            if (!!this.forward) {
                this.forward.setFlag(SpriteFlag.Invisible, this.scrollUpDown
                    ? this.startLine + this.rows >= Math.ceil(this.slots / this.columns)
                    : this.startLine + this.columns >= Math.ceil(this.slots / this.rows)
                )
            }

            this.justInserted = null
        }

        insertCard(card: Card, index: number, facing: CardFaces): void {
            this.justInserted = card
            super.insertCard(card, index, facing)
        }

        removeCardAt(index: number): Card {
            return this._locked
                ? this.replaceWithEmptyAt(index)
                : super.removeCardAt(index)
        }

        switchSelection(fromExit: RelativeDirections): void {
            if (this.slots === 0) {
                this.startSelection()
                return
            }

            const totalRows = this.scrollUpDown ? Math.ceil(this.slots / this.columns) : this.rows
            const totalColumns = this.scrollUpDown ? this.columns : Math.ceil(this.slots / this.rows)
            let selectedRow = Math.floor(totalRows / 2)
            let selectedColumn = Math.floor(totalColumns / 2)

            switch (fromExit) {
                case RelativeDirections.LeftOf:
                    selectedColumn = totalColumns - 1
                    break
                case RelativeDirections.RightOf:
                    selectedColumn = 0
                    break
                case RelativeDirections.Above:
                    selectedRow = totalRows - 1
                    break
                case RelativeDirections.Below:
                    selectedRow = 0
                    break
            }

            if (this.scrollUpDown) {
                cardCursor.select(this.cards[Math.min(this.slots - 1, selectedRow * this.columns + selectedColumn)])
            } else {
                cardCursor.select(this.cards[Math.min(this.slots - 1, selectedColumn * this.rows + selectedRow)])
            }
        }

        private scrollToSelect(index: number) {
            this.cursorIndex = index
            if (this.cursorIndex < 0) {
                return
            }

            this.scrollLine = this.startLine
            if(this.scrollUpDown) {
                if(index < this.startLine * this.columns) {
                    this.scrollLine = Math.floor(index / this.columns)
                } else if(index > (this.startLine + this.rows - 1) * this.columns) {
                    this.scrollLine = Math.floor(index / this.columns - (this.rows - 1))
                }
            } else {
                if(index < this.startLine * this.rows) {
                    this.scrollLine = Math.floor(index / this.rows)
                } else if(index > (this.startLine + this.columns - 1) * this.rows) {
                    this.scrollLine = Math.floor(index / this.rows - (this.columns - 1))
                }
            }

            if(this.startLine !== this.scrollLine) {
                this.refresh()
            }
        }

        private selectOffset(rowOffset: number, columnOffset: number) {
            let index = this.cursorIndex
            if (index < 0) {
                this.startSelection()
                return
            }

            let row = this.scrollUpDown
                ? Math.floor(index / this.columns)
                : index % this.rows
            let column = this.scrollUpDown
                ? index % this.columns
                : Math.floor(index / this.rows)
            const bottom = this.scrollUpDown
                ? Math.ceil(this.slots / this.columns)
                : this.rows
            const right = this.scrollUpDown
                ? this.columns
                : Math.ceil(this.slots / this.rows)
            
            if (row + rowOffset < 0) {
                cardCursor.dispatchExitContainerEvent(this, RelativeDirections.Above)
                return
            } else if (row + rowOffset >= bottom) {
                cardCursor.dispatchExitContainerEvent(this, RelativeDirections.Below)
                return
            } else if (column + columnOffset < 0) {
                cardCursor.dispatchExitContainerEvent(this, RelativeDirections.LeftOf)
                return
            } else if (column + columnOffset >= right) {
                cardCursor.dispatchExitContainerEvent(this, RelativeDirections.RightOf)
                return
            }

            row = Math.max(0, Math.min(row + rowOffset, bottom - 1))
            column = Math.max(0, Math.min(column + columnOffset, right - 1))

            index = this.scrollUpDown
                ? row * this.columns + column
                : column * this.rows + row
            if (index >= this.slots) {
                index = this.slots - 1
            }

            this.scrollToSelect(index)
        }

        selectLeft() {
            this.selectOffset(0, -1)
        }

        selectRight() {
            this.selectOffset(0, 1)
        }

        selectUp() {
            this.selectOffset(-1, 0)
        }

        selectDown() {
            this.selectOffset(1, 0)
        }
    }
}

namespace cardCursor {

    export interface SelectableContainer {
        startSelection(): void
        switchSelection(fromExit: RelativeDirections): void 
        selectLeft(): void
        selectRight(): void
        selectUp(): void
        selectDown(): void
    }

    export class SelectableSpriteContainer implements SelectableContainer {
        constructor(public sprite: Sprite) { }

        startSelection() {
            if (!(!this.sprite || !!(this.sprite.flags & sprites.Flag.Destroyed))) {
                cardCursor.select(this.sprite)
            }
        }

        switchSelection(fromExit: RelativeDirections) {
            this.startSelection()
        }

        selectLeft() {
            dispatchExitContainerEvent(this, RelativeDirections.LeftOf)
        }

        selectRight() {
            dispatchExitContainerEvent(this, RelativeDirections.RightOf)
        }

        selectUp() {
            dispatchExitContainerEvent(this, RelativeDirections.Above)
        }

        selectDown() {
            dispatchExitContainerEvent(this, RelativeDirections.Below)
        }
    }

    let spriteContainers: SelectableSpriteContainer[] = []
    export function getContainerFromSprite(sprite: Sprite): SelectableSpriteContainer {
        const container = spriteContainers.find(c => c.sprite === sprite)
        if (!!container) {
            return container
        } else {
            const newContainer = new SelectableSpriteContainer(sprite)
            spriteContainers.push(newContainer)
            return newContainer
        }
    }

    type ExitContainerEvent = (container: SelectableContainer, direction: RelativeDirections) => void
    const exitContainerEvents: ExitContainerEvent[] = []

    export function addExitContainerEvent(handler: ExitContainerEvent) {
        exitContainerEvents.push(handler)
    }

    export function dispatchExitContainerEvent(container: SelectableContainer, direction: RelativeDirections) {
        for (let event of exitContainerEvents) {
            event(container, direction)
        }
    }

    const DEFAULT_CURSOR_Z = 1000

    let anchorPoint: AnchorPositions = AnchorPositions.Bottom
    let targetOffsetX = 0
    let targetOffsetY = 0
    let extraOffsetX = 0
    let extraOffsetY = 0
    
    let container: SelectableContainer = null
    let target: Sprite = null

    export const cursor = sprites.create(image.create(1, 1), SpriteKind.Cursor)
    cursor.z = DEFAULT_CURSOR_Z
    cursor.setFlag(SpriteFlag.Invisible, true)

    game.onUpdate(() => {
        if (!!cursor) {
            if (!!target) {
                updateOffset()
                cursor.x = Math.round((target.x + cursor.x + targetOffsetX) / 2)
                cursor.y = Math.round((target.y + cursor.y + targetOffsetY) / 2)
            }
        }
    })

    export function setImage(image: Image) {
        cursor.setImage(image)
        cursor._x = Fx8(Fx.toFloat(cursor._x) - image.width / 2)
        cursor._y = Fx8(Fx.toFloat(cursor._y) - image.height / 2)
    }

    export function setAnchor(anchor: AnchorPositions, offsetX: number = 0, offsetY: number = 0) {
        anchorPoint = anchor
        extraOffsetX = offsetX
        extraOffsetY = offsetY
    }

    function updateOffset() {
        if (!target) {
            return
        }
        switch (anchorPoint) {
            case AnchorPositions.Left:
            case AnchorPositions.TopLeft:
            case AnchorPositions.BottomLeft:
                targetOffsetX = -target.width / 2
                break
            case AnchorPositions.Right:
            case AnchorPositions.TopRight:
            case AnchorPositions.BottomRight:
                targetOffsetX = target.width / 2
                break
            case AnchorPositions.Center:
                targetOffsetX = 0
            }
        switch (anchorPoint) {
            case AnchorPositions.Top:
            case AnchorPositions.TopLeft:
            case AnchorPositions.TopRight:
                targetOffsetY = -target.height / 2
                break
            case AnchorPositions.Bottom:
            case AnchorPositions.BottomLeft:
            case AnchorPositions.BottomRight:
                targetOffsetY = target.height / 2
                break
            case AnchorPositions.Center:
                targetOffsetY = 0
        }
        targetOffsetX += extraOffsetX
        targetOffsetY += extraOffsetY
    }

    export function select(next: any) {
        const prev = target

        if (next instanceof cardCore.Card) {
            target = next
            container = next.container
        } else if (next instanceof cardCore.CardContainer) {
            container = next
            container.startSelection()
            return
        } else if (next instanceof Sprite) {
            target = next
            container = getContainerFromSprite(next)
        } else {
            deselect()
            return
        }
            
        cursor.setFlag(SpriteFlag.Invisible, false)
        updateOffset()
        if (!prev) {
            cursor.x = target.x + targetOffsetX
            cursor.y = target.y + targetOffsetY
        }
    }

    export function deselect() {
        target = null
        container = null
        cursor.setFlag(SpriteFlag.Invisible, true)
    }

    export function selectedSprite(): Sprite {
        return target
    }

    export function selectedCard(): cardCore.Card {
        if (!!target && target instanceof cardCore.Card) {
            return target
        } else {
            return null
        }
    }

    export function selectedContainer(): SelectableContainer {
        if (!!container) {
            return container
        } else {
            return null
        }
    }

    export function selectedCardContainer(): cardCore.CardContainer {
        if (!!container && container instanceof cardCore.CardContainer) {
            return container
        } else {
            return null
        }
    }

    export function activateSprite(button: SelectionButtons) {
        const sprite = selectedSprite()
        if (!sprite) {
            return
        }
        cardCore.dispatchActivateEvents(sprite, button)
    }
}