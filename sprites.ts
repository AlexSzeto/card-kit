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
}

namespace cardKitCore {
    const FLIP_SCALES = [0.6, 0.3, 0.1]

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
        private flipStage: number
        private flipTimer: number

        constructor(
            private layout: CardLayout,
            private card: CardData,
            private __isFaceUp: boolean
        ) {
            super(layout.createCardBaseImage())
            this.flipStage = -1
            this.refreshImage()
            activate(this)
        }

        private refreshImage() {
            this.image.fill(0)
            if(this.__isFaceUp) {
                this.layout.drawCardFront(this.image, 0, 0, this.card)
            } else {
                this.layout.drawCardBack(this.image, 0, 0)
            }
        }

        public getData(): CardData {
            return this.card
        }

        private stopFlipAnimation() {
            if (this.flipStage >= 0) {
                this.flipStage = -1
                this.sx = 1.0
                clearInterval(this.flipTimer)
            }
        }

        set isFaceUp(value: boolean) {
            if(this.flipStage >= 0) {
                this.stopFlipAnimation()
            }            
            if (value != this.__isFaceUp) {
                this.__isFaceUp = value
                this.refreshImage()
            }
        }
        get isFaceUp(): boolean { return this.__isFaceUp}

        flip() {
            if(this.flipStage >= 0) {
                this.flipStage = FLIP_SCALES.length * 2 - this.flipStage - 1
                return
            }
            this.flipStage = 0
            this.flipTimer = setInterval(() => {
                this.flipStage++
                if(this.flipStage >= FLIP_SCALES.length * 2) {
                    this.stopFlipAnimation()
                } else {
                    if(this.flipStage == FLIP_SCALES.length) {
                        this.__isFaceUp = !this.__isFaceUp
                        this.refreshImage()
                    }
                    if(this.flipStage >= FLIP_SCALES.length) {
                        this.sx = FLIP_SCALES[FLIP_SCALES.length * 2 - this.flipStage - 1]
                    } else {
                        this.sx = FLIP_SCALES[this.flipStage]
                    }
                }
            }, flipAnimationDuration / (FLIP_SCALES.length * 2))
        }
    }

    type TransferrableCards = Card | CardData
    export interface CardContainer {
        getCardCount(): number,
        insertCardAt(index: number, card: Card): void
        removeCardAt(index: number, isFaceUp: boolean): Card
        insertCardsFrom(source: CardContainer, count: number): void
        flipCardsUp(): void
        flipCardsDown(): void

        removeCardsAsData(count: number): CardData[]
        removeCardsAsSprite(count: number): Card[]
    }

    export class CardStack extends Sprite implements CardContainer {
        constructor(
            private layout: CardLayout,
            private cards: CardData[],
            private isStackFaceUp: boolean,
            private isTopCardFaceUp: boolean,
        ) {
            super(layout.createStackBaseimage())
            this.refreshImage()
            activate(this)
        }

        private refreshImage() {
            this.image.fill(0)
            this.layout.drawCardStack(this.image, 0, 0, this.cards, this.isStackFaceUp, this.isTopCardFaceUp)
        }

        getCardCount(): number {
            return this.cards.length
        }

        insertCardAt(index: number, card: Card): void {
            const cardData = card.getData()
            if (index < 0) {
                this.cards.push(cardData)
            } else {
                this.cards.insertAt(index, cardData)
            }
            sprites.destroy(card)
            this.refreshImage()
        }

        removeCardAt(index: number, isFaceUp: boolean): Card {
            const card = new Card(this.layout, this.cards[index], isFaceUp)
            card.setPosition(this.x, this.y + this.layout.getStackTopYOffset(this.cards.length))
            this.cards.splice(index, 1)
            this.refreshImage()
            return card
        }

        insertCardsFrom(source: CardContainer, count: number): void {
            const data = source.removeCardsAsData(count)
            this.cards = data.concat(this.cards)
        }

        flipCardsUp(): void {
            this.isStackFaceUp = true
            this.isTopCardFaceUp = true
            this.refreshImage()
        }

        flipCardsDown(): void {
            this.isStackFaceUp = false
            this.isTopCardFaceUp = false
            this.refreshImage()
        }

        flipTopCard(): void {
            this.isTopCardFaceUp = !this.isTopCardFaceUp
            this.refreshImage()
        }

        removeCardsAsData(count: number): CardData[] {
            const data = this.cards.slice(0, count)
            this.cards.splice(0, count)
            this.refreshImage()
            return data
        }

        removeCardsAsSprite(count: number): Card[] {            
            return this.removeCardsAsData(count).map(
                data => {
                    const card = new Card(this.layout, data, this.isTopCardFaceUp)
                    card.setPosition(this.x, this.y + this.layout.getStackTopYOffset(this.cards.length))
                    return card
                }
            )
        }        
    }

    export class CardSpread implements CardContainer {
        constructor(
            private x: number,
            private y: number,
            private z: number,
            private cards: Card[],
            private cardWidth: number,
            private cardHeight: number,
            private isSpreadingLeftRight: boolean,
            private spacing: number,
            private selectedCardOffset: number,
            public isWrappingSelection: boolean
        ) {
            this.repositionSprites()
        }

        private repositionSprites() {
            if (this.cards.length === 0) {
                return
            }
            if(this.isSpreadingLeftRight) {
                const width = (this.cardWidth + this.spacing) * this.cards.length  - this.spacing
                let x = this.x - width / 2
                this.cards.forEach((card, index) => {
                    smoothMoves.slide(
                        card,
                        x + this.cardWidth / 2,
                        this.y + (cursorTarget === card ? this.selectedCardOffset : 0),
                        slideAnimationDuration)
                    x += this.cardWidth + this.spacing
                    card.z = this.z + index
                })
            } else {
                const height = (this.cardHeight + this.spacing) * this.cards.length  - this.spacing
                let y = this.y - height / 2
                this.cards.forEach((card, index) => {
                    smoothMoves.slide(
                        card,
                        this.x + (cursorTarget === card ? this.selectedCardOffset : 0),
                        y + this.cardHeight / 2,
                        slideAnimationDuration)
                    y += this.cardHeight + this.spacing
                    card.z = this.z + index
                })
            }
        }

        getCardCount(): number {
            return this.cards.length
        }

        insertCardAt(index: number, card: Card): void {
            if (index < 1) {
                this.cards.push(card)
            } else {
                this.cards.insertAt(index, card)
            }
            this.repositionSprites()
        }

        removeCardAt(index: number, isFaceUp: boolean): Card {
            const card = this.cards[index]
            this.cards.splice(index, 1)
            this.repositionSprites()
            return card
        }

        insertCardsFrom(source: CardContainer, count: number): void {
            const cards = source.removeCardsAsSprite(count)
            this.cards = cards.concat(this.cards)
            this.repositionSprites()
        }

        flipCardsUp(): void {
            this.cards.forEach(card => {
                if (!card.isFaceUp) {
                    card.flip()
                }
            })
        }

        flipCardsDown(): void {
            this.cards.forEach(card => {
                if (card.isFaceUp) {
                    card.flip()
                }
            })
        }

        removeCardsAsData(count: number): CardData[] {
            return this.removeCardsAsSprite(count).map(card => {
                const data = card.getData()
                sprites.destroy(card)
                return data
            })
        }

        removeCardsAsSprite(count: number): Card[] {
            const cards = this.cards.slice(0, count)
            this.cards.splice(0, count)
            this.repositionSprites()
            return cards
        }

        selectCardAt(index: number) {
            if (index >= 0 && index < this.cards.length) {
                pointCursorAt(this.cards[index])                
            } else if (this.cards.length >= 1) {
                pointCursorAt(this.cards[0])
            }
        }

        getSelectedCardIndex(): number {
            return this.cards.indexOf(getSelectedCard())
        }

        private selectCardAtOffset(offset: number) {
            const index = this.getSelectedCardIndex()
            if (index >= 0) {
                if (this.isWrappingSelection) {
                    this.selectCardAt((index + this.cards.length + offset) % this.cards.length)
                } else {
                    this.selectCardAt(Math.min(this.cards.length - 1, Math.max(0, index + offset)))
                }
            } else {
                this.selectCardAt(-1)
            }
            this.repositionSprites()
        }

        selectPreviousCard() {
            this.selectCardAtOffset(-1)
        }

        selectNextCard() {
            this.selectCardAtOffset(1)
        }
    }

    export class CardGrid {
        private firstLine: number

        constructor(
            private x: number,
            private y: number,
            private z: number,
            private cards: Card[],
            private cardWidth: number,
            private cardHeight: number,
            private rows: number,
            private columns: number,
            private isScrollingLeftRight: boolean,
            private spacing: number,            
            private isWrappingSelection: boolean,
            private scrollBackIndicator: Sprite,
            private scrollForwardIndicator: Sprite,
        ) {
            this.firstLine = 0
            const width = (this.cardWidth + this.spacing) * this.columns - this.spacing
            const height = (this.cardHeight + this.spacing) * this.rows - this.spacing
            if (isScrollingLeftRight) {
                if (!!scrollBackIndicator) {
                    scrollBackIndicator.x = x - width / 2 - scrollBackIndicator.width / 2 - this.spacing
                    scrollBackIndicator.y = y
                }
                if (!!scrollForwardIndicator) {
                    scrollForwardIndicator.x = x + width / 2 + scrollForwardIndicator.width / 2 + this.spacing
                    scrollForwardIndicator.y = y
                }               
            } else {
                if (!!scrollBackIndicator) {
                    scrollBackIndicator.x = x
                    scrollBackIndicator.y = y - height / 2 - scrollBackIndicator.height / 2 - this.spacing
                }
                if (!!scrollForwardIndicator) {
                    scrollForwardIndicator.x = x
                    scrollForwardIndicator.y = y + height / 2 + scrollForwardIndicator.height / 2 + this.spacing
                }               
            }
            this.repositionSprites()            
        }

        repositionSprites() {
            if(this.cards.length === 0) {
                return
            }            
            const width = (this.cardWidth + this.spacing) * this.columns - this.spacing
            const height = (this.cardHeight + this.spacing) * this.rows - this.spacing
            let columnLeft = this.x - width / 2 + this.cardWidth / 2
            let rowTop = this.y - height / 2 + this.cardHeight / 2
            let row = 0
            let column = 0
            let index = this.isScrollingLeftRight 
                ? this.firstLine * this.rows 
                : this.firstLine * this.columns
            const lastIndex = index + this.rows * this.columns
            this.cards.forEach((card, i) => {
                if(i < index || i >= index + this.rows * this.columns) {
                    card.setFlag(SpriteFlag.Invisible, true)
                }
            })

            do {
                const x = columnLeft + column * (this.cardWidth + this.spacing)
                const y = rowTop + row * (this.cardHeight + this.spacing)
                if(!!(this.cards[index].flags & SpriteFlag.Invisible)) {
                    this.cards[index].setFlag(SpriteFlag.Invisible, false)
                    this.cards[index].x = x
                    this.cards[index].y = y
                    this.cards[index].z = this.z
                } else {
                    this.cards[index].z = this.z + 1
                    smoothMoves.slide(this.cards[index], x, y, slideAnimationDuration)
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

        getCardCount(): number {
            return this.cards.length
        }

        insertCardAt(index: number, card: Card): void {
            if (index < 1) {
                this.cards.push(card)
            } else {
                this.cards.insertAt(index, card)
            }
            this.repositionSprites()
        }

        removeCardAt(index: number, isFaceUp: boolean): Card {
            const card = this.cards[index]
            this.cards.splice(index, 1)
            this.repositionSprites()
            return card
        }

        insertCardsFrom(source: CardContainer, count: number): void {
            const cards = source.removeCardsAsSprite(count)
            this.cards = cards.concat(this.cards)
            this.repositionSprites()
        }

        flipCardsUp(): void {
            this.cards.forEach(card => {
                if (!card.isFaceUp) {
                    card.flip()
                }
            })
        }

        flipCardsDown(): void {
            this.cards.forEach(card => {
                if (card.isFaceUp) {
                    card.flip()
                }
            })
        }

        removeCardsAsData(count: number): CardData[] {
            return this.removeCardsAsSprite(count).map(card => {
                const data = card.getData()
                sprites.destroy(card)
                return data
            })
        }

        removeCardsAsSprite(count: number): Card[] {
            const cards = this.cards.slice(0, count)
            this.cards.splice(0, count)
            this.repositionSprites()
            return cards
        }

        selectCardAt(index: number) {
            if (this.cards.length === 0) {
                return
            }
            if (index < 0 || index >= this.cards.length) {
                index = 0
            }
            let scrollToLine: number = this.firstLine
            if(this.isScrollingLeftRight) {
                if(index < this.firstLine * this.rows) {
                    scrollToLine = Math.floor(index / this.rows)
                } else if(index > (this.firstLine + this.columns - 1) * this.rows) {
                    scrollToLine = Math.floor(index / this.rows - (this.columns - 1))
                }
            } else {
                if(index < this.firstLine * this.columns) {
                    scrollToLine = Math.floor(index / this.columns)
                } else if(index > (this.firstLine + this.rows - 1) * this.columns) {
                    scrollToLine = Math.floor(index / this.columns - (this.rows - 1))
                }
            }
            if(this.firstLine !== scrollToLine) {
                this.firstLine = scrollToLine
                this.repositionSprites()
            }
            pointCursorAt(this.cards[index])
        }

        getSelectedCardIndex(): number {
            return this.cards.indexOf(getSelectedCard())
        }
        
        private selectCardAtOffset(rowOffset: number, columnOffset: number) {
            let index = this.getSelectedCardIndex()
            if (index < 0) {
                this.selectCardAt(0)
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
            this.selectCardAt(index)
        }

        selectPreviousColumnCard() {
            this.selectCardAtOffset(0, -1)
        }

        selectNextColumnCard() {
            this.selectCardAtOffset(0, 1)
        }

        selectPreviousRowCard() {
            this.selectCardAtOffset(-1, 0)
        }

        selectNextRowCard() {
            this.selectCardAtOffset(1, 0)
        }
    }

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
    `)
    cursor.z = 1000
    cursor.setFlag(SpriteFlag.Invisible, true)

    let cursorAnchor: CardCursorAnchors = CardCursorAnchors.Bottom
    let cursorOffsetX = 0
    let cursorOffsetY = 0

    game.onUpdate(() => {
        if (!!cursor) {
            if (!!cursorTarget) {
                cursor.x = Math.round((cursorTarget.x + cursor.x + cursorOffsetX) / 2)
                cursor.y = Math.round((cursorTarget.y + cursor.y + cursorOffsetY) / 2)
            }
        }
    })

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

    export function getSelectedCard(): Card {
        if (!!cursorTarget && cursorTarget instanceof Card) {
            return cursorTarget
        } else {
            return null
        }
    }

    export function getSelectedStack(): CardStack {
        if (!!cursorTarget && cursorTarget instanceof CardStack) {
            return cursorTarget
        } else {
            return null
        }
    }
}