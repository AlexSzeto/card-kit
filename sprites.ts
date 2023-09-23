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

namespace cardCore {
    const FLIP_SCALES = [1.0, 0.6, 0.3, 0.3, 0.6, 1.0]
    const COLLAPSE_SCALE = [1.0, 0.3, 0.1, 0.1]
    const EXPAND_SCALE = [0.1, 0.7, 0.9, 1.0]

    let flipAnimationDuration = 300
    let slideAnimationDuration = 500
    let transitionZ = 100

    function activate(sprite: Sprite) {
        const scene = game.currentScene();
        sprite.setKind(SpriteKind.Card);
        scene.physicsEngine.addSprite(sprite);
        scene.createdHandlers
            .filter(h => h.kind == SpriteKind.Card)
            .forEach(h => h.handler(sprite));
    }

    function shuffle(list: any[]) {
        for (let i = 0; i < list.length; i++) {
            const j = randint(0, list.length - 1)
            const temp = list[i]
            list[i] = list[j]
            list[j] = temp
        }
    }

    const EmptyData = new CardData([])
    
    export class Card extends Sprite {
        container: CardContainer
        stamp: string
        private _isFaceUp: boolean

        constructor(
            private design: CardDesign,
            private card: CardData,
            isFaceUp: boolean
        ) {
            super(design.createCardBaseImage())
            this.container = null
            this._isFaceUp = isFaceUp
            this.refreshImage()
            activate(this)
        }

        get isEmptyCardSlot(): boolean {
            return this.card === EmptyData
        }

        refreshImage() {
            if (this.isEmptyCardSlot) {
                return
            }
            this.image.fill(0)
            if(this._isFaceUp) {
                this.design.drawCardFront(this.image, 0, 0, this.card)
                this.design.drawStamp(this.image, this.stamp)
            } else {
                this.design.drawCardBack(this.image, 0, 0)
            }
        }

        getDesign(): CardDesign {
            return this.design
        }

        getData(): CardData {
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

        resetTransforms() {
            this.sx = 1.0
            this.sy = 1.0
            this.setFlag(SpriteFlag.Invisible, false)
        }

        flip() {
            if (this.isEmptyCardSlot) {
                return
            }
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
                (_, step) => {
                    if (step == FLIP_SCALES.length / 2) {
                        this._isFaceUp = !this._isFaceUp
                        this.refreshImage()
                    }
                },
                null
            )
        }

        clone(): Card {
            const card = new Card(this.design, this.card.clone(), this._isFaceUp)
            card.setPosition(this.x, this.y)
            return card
        }

        createView(newDesign: CardDesign): Card {
            const card = new Card(newDesign, this.card, this._isFaceUp)
            card.setPosition(this.x, this.y)
            return card
        }

    }

    export type CardEventCondition = cardCore.CardAttribute
    export type CardEventHandler = (origin: CardContainer, card: Card) => void
    type CardEvent = {
        condition: CardEventCondition
        handler: CardEventHandler
    }

    function resolveEvents(card: Card, target: CardContainer, events: CardEvent[]) {
        if (card.container != null && card.container !== target) {
            card.container.removeCardSprite(card)
        }
        const origin = card.container
        card.container = target
        for (let event of events) {
            if(card.getData().attributeEquals(event.condition.attribute, event.condition.value)) {
                event.handler(origin, card)
                if(card.container !== target || (card.flags & sprites.Flag.Destroyed)) {
                    return false
                }
            }
        }
        return true
    }

    export interface CardContainer {
        getId(): string
        getCardCount(): number,

        setPosition(x: number, y: number): void
        setLayer(z: number): void

        shuffle(): void

        addEvent(condition: CardEventCondition, handler: CardEventHandler): void
        insertCard(card: Card, index: number): void
        removeCardAt(index: number): Card
        removeCardSprite(card: Card): void

        getCursorIndex(): number
        moveCursorIntoContainer(): void
    }

    export class CardStack extends Sprite implements CardContainer {
        private events: CardEvent[]
        private transitionCards: Card[]
        private defaultStackImage: Image
        constructor(
            private containerId: string,
            private design: CardDesign,
            private cards: CardData[],
            private isStackFaceUp: boolean,
            private isTopCardFaceUp: boolean,
        ) {
            super(!!design ? design.createStackBaseimage() : image.create(1, 1))
            this.defaultStackImage = this.image
            this.events = []
            this.transitionCards = []
            this.refreshImage()
            activate(this)
        }

        private getYOffset(): number {
            return (this.image === this.defaultStackImage ? this.design.getStackTopYOffset(this.cards.length) : 0)
        }

        public refreshImage() {
            if (this.image !== this.defaultStackImage || this.design === null) {
                return
            }            
            this.image.fill(0)
            const inDeckCards = this.cards.filter(card => !this.transitionCards.some(transitionCard => transitionCard.getData() === card))
            this.design.drawCardStack(this.image, 0, 0, inDeckCards, this.isStackFaceUp, this.isTopCardFaceUp)                    
            
        }

        get container(): CardContainer {
            return this
        }

        shuffle(): void {
            shuffle(this.cards)
            if (this.isTopCardFaceUp) {
                this.refreshImage()
            }
        }

        split(id: string, count: number) {
            const cards = this.cards.slice(0, count)
            this.cards.splice(this.cards.length - count, count)
            const stack = new CardStack(id, this.design, cards, this.isStackFaceUp, this.isTopCardFaceUp)
            stack.setPosition(this.x, this.y - this.design.getStackThickness(this.getCardCount()) - 1)
            stack.setLayer(this.z)
            this.refreshImage()
            return stack
        }

        insertCardData(data: CardData[]) {
            if (!!this.design) {
                this.cards = data.concat(this.cards)
                this.refreshImage()
            }
        }

        flipStack(): void {
            this.isStackFaceUp = !this.isStackFaceUp
            this.isTopCardFaceUp = this.isStackFaceUp
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
            if (card == null) {
                return
            }
            if (!this.design) {
                this.design = card.getDesign()
                this.setImage(this.design.createStackBaseimage())
                this.defaultStackImage = this.image
            }
            if (resolveEvents(card, this, this.events)) {
                const cardData = card.getData()
                if (index < 0) {
                    this.cards.push(cardData)
                } else {
                    this.cards.insertAt(index, cardData)
                }
                card.isFaceUp = this.isTopCardFaceUp
                extraAnimations.slide(
                    card, this.x, this.y + this.getYOffset(),
                    slideAnimationDuration,
                    () => {
                        this.transitionCards.splice(this.transitionCards.indexOf(card), 1)
                        card.destroy()
                        this.refreshImage()
                    }
                )
                this.transitionCards.push(card)
                this.refreshImage()
                card.z = transitionZ
            }
        }

        removeCardSprite(card: Card): void {
            this.removeCardAt(this.cards.indexOf(card.getData()))
        }

        removeCardAt(index: number = 0): Card {
            if (index == null || index < 0 || index > this.cards.length - 1) {
                return null
            }
            const oldCard = this.transitionCards.find(card => card.getData() === this.cards[index])
            const card = new Card(this.design, this.cards[index], this.isStackFaceUp)
            if (!!oldCard) {
                card.setPosition(oldCard.x, oldCard.y)
                extraAnimations.clearAnimations(oldCard, true)
            } else {
                card.setPosition(this.x, this.y + this.getYOffset())
            }
            this.cards.splice(index, 1)
            this.refreshImage()
            return card
        }

        getCursorIndex(): number {
            return (getCursorSprite() === this) ? 0 : null
        }

        moveCursorIntoContainer(): void {
            pointCursorAt(this)
        }
    }

    export class LayoutContainer implements CardContainer {
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
            return this.cards.reduce((count, card) => count + (card.isEmptyCardSlot ? 0 : 1), 0)
        }

        getCardsCopy(): Card[] {
            return this.cards.slice().filter(card => !card.isEmptyCardSlot)
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

        shuffle(): void {
            shuffle(this.cards)
            this.reposition()
        }

        insertCard(card: Card, index: number = -1): void {
            if (card == null) {
                return
            }
            if (resolveEvents(card, this, this.events)) {
                card.isFaceUp = this.isInsertFaceUp
                if (index < 0) {
                    this.cards.push(card)
                } else {
                    this.cards.insertAt(index, card)
                }
                this.reposition()
                card.z = transitionZ
                if (this.cards.length === 1 && getMostRecentCursorContainer() === this) {
                    pointCursorAt(card)
                }
            }
        }

        removeCardSprite(card: Card): void {
            this.removeCardAt(this.cards.indexOf(card))
        }

        removeCardAt(index: number = 0): Card {
            if (index == null || index < 0 || index > this.cards.length - 1) {
                return null
            }
            const card = this.cards[index]
            if (getCursorCard() === card) {
                if (this.cards.length === 1) {
                    removeCursor()
                } else if (index === this.cards.length - 1) {
                    pointCursorAt(this.cards[index - 1])
                } else {
                    pointCursorAt(this.cards[index + 1])
                }
            }
            card.resetTransforms()
            this.cards.splice(index, 1)
            this.reposition()
            return card
        }

        replaceCardWithBlankAt(index: number = 0): Card {
            if (index == null || index < 0 || index > this.cards.length - 1) {
                return null
            }
            const blank = new Card(this.cards[index].getDesign(), EmptyData, true)
            const card = this.cards[index]
            blank.setPosition(card.x, card.y)
            pointCursorAt(blank)
            this.cards.splice(index, 1)
            this.cards.insertAt(index, blank)
            return card
        }

        destroyCards() {
            this.cards.forEach(card => card.destroy())
            this.cards = []
        }
        
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

        reposition(): void {}
    }

    export class CardSpread extends LayoutContainer {
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
            private _spacing: number,
            private hoverX: number,
            private hoverY: number,
            public isWrappingSelection: boolean
        ) {
            super(id, x, y, z, cards, isInsertFaceUp)
            this.cardWidth = -1
            this.cardHeight = -1
            this.reposition()
        }

        isCardSpread(): boolean { return true }

        get isLeftRight(): boolean {
            return this.isSpreadingLeftRight
        }
        
        set isLeftRight(value: boolean) {
            if (this.isSpreadingLeftRight !== value) {
                this.isSpreadingLeftRight = value
                this.reposition()
            }
        }

        set spacing(value: number) {
            if (this._spacing !== value) {
                this._spacing = value
                this.reposition()
            }
        }

        setHoverOffset(x: number, y: number) {
            this.hoverX = x
            this.hoverY = y
            this.reposition()
        }
        
        reposition() {
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
                const width = (this.cardWidth + this._spacing) * this.cards.length  - this._spacing
                let x = this.x - width / 2
                this.cards.forEach((card, index) => {
                    extraAnimations.slide(
                        card,
                        x + this.cardWidth / 2 + (cursorTarget === card ? this.hoverX : 0),
                        this.y + (cursorTarget === card ? this.hoverY : 0),
                        slideAnimationDuration,
                        null)
                    x += this.cardWidth + this._spacing
                    card.z = this.z + this._spacing >= 0 ? 0 : index
                })
            } else {
                const height = (this.cardHeight + this._spacing) * this.cards.length  - this._spacing
                let y = this.y - height / 2
                this.cards.forEach((card, index) => {
                    extraAnimations.slide(
                        card,
                        this.x + (cursorTarget === card ? this.hoverX : 0),
                        y + this.cardHeight / 2 + (cursorTarget === card ? this.hoverY : 0),
                        slideAnimationDuration,
                        null)
                    y += this.cardHeight + this._spacing
                    card.z = this.z + this._spacing >= 0 ? 0 : index
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

    export class CardGrid extends LayoutContainer {
        private firstLine: number
        private scrollToLine: number
        private cardWidth: number
        private cardHeight: number
        private isLocked: boolean

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
            private _spacing: number,
            public isWrappingSelection: boolean,
            private scrollBackIndicator: Sprite,
            private scrollForwardIndicator: Sprite,
        ) {
            super(id, x, y, z, cards, isInsertFaceUp)
            this.firstLine = 0
            this.scrollToLine = 0
            this.cardWidth = -1
            this.cardHeight = -1
            this.isLocked = false

            this.reposition()            
        }

        isCardGrid(): boolean { return true }

        set isLeftRight(value: boolean) {
            if (this.isScrollingLeftRight !== value) {
                this.isScrollingLeftRight = value
                this.reposition()
            }
        }

        set spacing(value: number) {
            if (this._spacing !== value) {
                this._spacing = value
                this.reposition()
            }
        }

        set isWrapping(value: boolean) {
            if (this.isWrappingSelection !== value) {
                this.isWrappingSelection = value
                this.reposition()
            }
        }

        lock() {
            this.isLocked = true
        }

        unlock() {
            this.isLocked = false
            for (let i = 0; i < this.cards.length; i++) {
                const card = this.cards[i]
                if (card.isEmptyCardSlot) {
                    if (getCursorCard() === card) {
                        if (this.cards.length === 1) {
                            removeCursor()
                        } else if (i > 0) {
                            pointCursorAt(this.cards[i - 1])
                        } else {
                            pointCursorAt(this.cards[i + 1])
                        }
                    }
                    card.destroy()
                    this.cards.splice(i, 1)
                    i--    
                }
            }
            this.reposition()
        }

        setScrollSprites(back: Sprite, forward: Sprite) {
            if (!!this.scrollBackIndicator) {
                this.scrollBackIndicator.destroy()
            }
            if (!!this.scrollForwardIndicator) {
                this.scrollForwardIndicator.destroy()
            }
            this.scrollBackIndicator = back
            this.scrollForwardIndicator = forward
            this.reposition()
        }

        reposition() {
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

            const maxScroll = Math.max(0, Math.ceil(this.cards.length / this.columns) - this.rows)
            this.scrollToLine = Math.min(this.scrollToLine, maxScroll)
            
            const isScrolling: boolean = Math.abs(this.firstLine - this.scrollToLine) == 1
            const scrollDirection = this.scrollToLine - this.firstLine
            this.firstLine = this.scrollToLine

            const width = (this.cardWidth + this._spacing) * this.columns - this._spacing
            const height = (this.cardHeight + this._spacing) * this.rows - this._spacing

            const columnLeft = this.x - width / 2 + this.cardWidth / 2
            const rowTop = this.y - height / 2 + this.cardHeight / 2
            const columnRight = columnLeft + (this.columns - 1) * (this.cardWidth + this._spacing)
            const columnBottom = rowTop + (this.rows - 1) * (this.cardHeight + this._spacing)

            let index = this.isScrollingLeftRight
                ? this.firstLine * this.rows 
                : this.firstLine * this.columns
            const lastIndex = index + this.rows * this.columns

            const cursorIndex = this.cards.indexOf(getCursorCard())
            if (cursorIndex >= 0 && (cursorIndex < index || cursorIndex >= lastIndex)) {
                pointCursorAt(this.cards[Math.max(index, Math.min(lastIndex - 1, cursorIndex))])
            }

            if (this.isScrollingLeftRight) {
                if (!!this.scrollBackIndicator) {
                    this.scrollBackIndicator.x = this.x - width / 2 - this.scrollBackIndicator.width / 2 - this._spacing
                    this.scrollBackIndicator.y = this.y
                }
                if (!!this.scrollForwardIndicator) {
                    this.scrollForwardIndicator.x = this.x + width / 2 + this.scrollForwardIndicator.width / 2 + this._spacing
                    this.scrollForwardIndicator.y = this.y
                }               
            } else {
                if (!!this.scrollBackIndicator) {
                    this.scrollBackIndicator.x = this.x
                    this.scrollBackIndicator.y = this.y - height / 2 - this.scrollBackIndicator.height / 2 - this._spacing
                }
                if (!!this.scrollForwardIndicator) {
                    this.scrollForwardIndicator.x = this.x
                    this.scrollForwardIndicator.y = this.y + height / 2 + this.scrollForwardIndicator.height / 2 + this._spacing
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
                extraAnimations.clearFixedFrameAnimation(card, true)
                card.sx = 1.0
                card.sy = 1.0
                card.z = this.z
                if ((i < index || i >= index + this.rows * this.columns) && isVisible(card)) {
                    if (isScrolling) {
                        extraAnimations.clearAnimations(card, true)
                        if (this.isScrollingLeftRight) {
                            extraAnimations.fixedFrameAnimate(card, slideAnimationDuration, this.collapsePositions.length, this.collapsePositions, null, COLLAPSE_SCALE, null, null, () => card.setFlag(SpriteFlag.Invisible, true))
                        } else {
                            extraAnimations.fixedFrameAnimate(card, slideAnimationDuration, this.collapsePositions.length, null, this.collapsePositions, null, COLLAPSE_SCALE, null, () => card.setFlag(SpriteFlag.Invisible, true))
                        }
                    } else {
                        card.setFlag(SpriteFlag.Invisible, true)
                    }
                }
            })

            do {
                const x = columnLeft + column * (this.cardWidth + this._spacing)
                const y = rowTop + row * (this.cardHeight + this._spacing)
                const card = this.cards[index]

                if (!isVisible(card)) {
                    card.setFlag(SpriteFlag.Invisible, false)
                    card.x = x
                    card.y = y
                    extraAnimations.clearAnimations(card, true)                    
                    if (isScrolling) {
                        if (this.isScrollingLeftRight) {
                            extraAnimations.fixedFrameAnimate(card, slideAnimationDuration, this.expandPositions.length, this.expandPositions, null, EXPAND_SCALE, null, null, null)
                        } else {
                            extraAnimations.fixedFrameAnimate(card, slideAnimationDuration, this.expandPositions.length, null, this.expandPositions, null, EXPAND_SCALE, null, null)
                        }
                    } 
                } else {
                    extraAnimations.slide(card, x, y, slideAnimationDuration, null)
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

        removeCardAt(index?: number): Card {
            if (index == null || index < 0 || index > this.cards.length - 1 || this.cards[index].isEmptyCardSlot) {
                return null
            }            
            extraAnimations.clearAnimations(this.cards[index], true)
            return this.isLocked
                ? this.replaceCardWithBlankAt(index)
                : super.removeCardAt(index)
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
    let mostRecentCursorContainer: any = null
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
        if (!target) {
            removeCursor()
            return
        }
        const hasPreviousTarget = !!cursorTarget
        cursorTarget = target
        if (!!(cursorTarget as any).container) {
            mostRecentCursorContainer = (cursorTarget as any).container
        }
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

    export function getMostRecentCursorContainer(): any {
        return mostRecentCursorContainer
    }

    export function preselectCursorContainer(container: any) {
        mostRecentCursorContainer = container
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