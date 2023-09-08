namespace cardKit {
    function activate(sprite: Sprite, kind?: number) {
        const scene = game.currentScene();
        sprite.setKind(kind);
        scene.physicsEngine.addSprite(sprite);
        scene.createdHandlers
            .filter(h => h.kind == kind)
            .forEach(h => h.handler(sprite));
    }

    const FLIP_SCALES = [0.6, 0.3, 0.1]

    export class Card extends Sprite {
        private flipStage: number
        private flipTimer: number
        constructor(
            public layout: cardKit.CardLayoutData,
            public data: cardKit.CardData,
            public isFaceUp: boolean
        ) {
            super(createCardImage(data, layout))
            this.redraw()
            this.flipStage = -1
            activate(this)
        }

        redraw() {
            if(this.isFaceUp) {
                drawFront(this.data, this.layout, this.image, 0, 0)
            } else {
                drawBack(this.layout, this.image, 0, 0)
            }
        }

        flip() {
            if(this.flipStage >= 0) {
                this.flipStage = FLIP_SCALES.length * 2 - this.flipStage - 1
                return
            }
            this.flipStage = 0
            this.flipTimer = setInterval(() => {
                this.flipStage++
                if(this.flipStage >= FLIP_SCALES.length * 2) {
                    this.sx = 1.0
                    this.flipStage = -1
                    clearInterval(this.flipTimer)
                } else {
                    if(this.flipStage == FLIP_SCALES.length) {
                        this.isFaceUp = !this.isFaceUp
                        this.redraw()
                    }
                    if(this.flipStage >= FLIP_SCALES.length) {
                        this.sx = FLIP_SCALES[FLIP_SCALES.length * 2 - this.flipStage - 1]
                    } else {
                        this.sx = FLIP_SCALES[this.flipStage]
                    }
                }
            }, 50)
        }
    }

    export class CardStack extends Sprite {
        constructor(
            public layout: cardKit.CardLayoutData,
            public data: cardKit.CardData[],
            public isStackFaceUp: boolean,
            public isTopCardFaceUp: boolean,
        ) {
            super(createStackImage(data, layout))
            this.redraw()
            activate(this)
        }

        redraw() {
            this.image.fill(0)
            drawStack(this.data, this.layout, this.isStackFaceUp, this.isTopCardFaceUp, this.image, 0, 0)
        }

        createCard(cardIndex: number = 0, isFaceUp: boolean = true): Card {
            const card = new Card(this.layout, this.data[cardIndex], isFaceUp)
            card.setPosition(this.x, this.y + this.image.height / 2 - this.layout.getStackHeight(this.data.length) + this.layout.height / 2)
            this.data.splice(cardIndex, 1)
            this.redraw()
            return card
        }
    }

    export class CardSpread {
        constructor(
            public cards: cardKit.Card[],
            public x: number,
            public y: number,
            public isHorizontal: boolean,
            public spacing: number
        ) {
            this.reposition()
        }

        reposition() {
            if(this.isHorizontal) {
                const width = this.cards.reduce((sum, card) => sum + card.layout.width + this.spacing, 0) - this.spacing
                let x = this.x - width / 2
                this.cards.forEach(card => {
                    smoothMoves.slide(
                        card,
                        x + card.layout.width / 2,
                        this.y - (selectedCard === card ? 6 : 0),
                        400)
                    x += card.layout.width + this.spacing
                })
            }
        }

        insert(card: Card, index: number = 0) {
            this.cards.insertAt(index, card)
        }

        select(index: number = 0) {
            selectCard(this.cards[index])
        }

        selectPrevious() {
            this.select((this.cards.indexOf(selectedCard) + this.cards.length - 1) % this.cards.length)
            this.reposition()
        }

        selectNext() {
            this.select((this.cards.indexOf(selectedCard) + 1) % this.cards.length)
            this.reposition()
        }
    }

    export class CardGrid {
        private currentLine: number
        private scrollTimer: number
        private scrollToLine: number
        constructor(
            public cards: cardKit.Card[],
            public x: number,
            public y: number,
            public rows: number,
            public columns: number,
            public isLeftRightScrolling: boolean,
            public spacing: number,            
        ) {
            this.currentLine = 0
            this.scrollToLine = 0
            this.reposition()
        }

        reposition() {
            if(this.cards.length < 1) {
                return
            }            
            const width = (this.cards[0].layout.width + this.spacing) * this.columns - this.spacing
            const height = (this.cards[0].layout.height + this.spacing) * this.rows - this.spacing
            let columnLeft = this.x - width / 2 + this.cards[0].layout.width / 2
            let rowTop = this.y - height / 2 + this.cards[0].layout.height / 2
            let row = 0
            let column = 0
            let index = this.isLeftRightScrolling 
                ? this.currentLine * this.rows 
                : this.currentLine * this.columns
            const lastIndex = index + this.rows * this.columns
            this.cards.forEach((card, i) => {
                if(i < index || i >= index + this.rows * this.columns) {
                    card.setFlag(SpriteFlag.Invisible, true)
                }
            })
            do {
                const x = columnLeft + column * (this.cards[index].layout.width + this.spacing)
                const y = rowTop + row * (this.cards[index].layout.height + this.spacing)
                if(!!(this.cards[index].flags & SpriteFlag.Invisible)) {
                    this.cards[index].setFlag(SpriteFlag.Invisible, false)
                    this.cards[index].x = x
                    this.cards[index].y = y
                    this.cards[index].z = 1
                } else {
                    this.cards[index].z = 2
                    smoothMoves.slide(this.cards[index], x, y, 500)
                }
                if (this.isLeftRightScrolling) {
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
            } while(index < this.cards.length && index < lastIndex)
        }

        selectIndex(index: number) {                        
            index = Math.max(0, Math.min(index, this.cards.length - 1))
            if(this.isLeftRightScrolling) {
                if(index < this.currentLine * this.rows) {
                    this.scrollToLine = Math.floor(index / this.rows)
                } else if(index > (this.currentLine + this.columns - 1) * this.rows) {
                    this.scrollToLine = Math.floor(index / this.rows - (this.columns - 1))
                }
            } else {
                if(index < this.currentLine * this.columns) {
                    this.scrollToLine = Math.floor(index / this.columns)
                } else if(index > (this.currentLine + this.rows - 1) * this.columns) {
                    this.scrollToLine = Math.floor(index / this.columns - (this.rows - 1))
                }
            }
            if(this.currentLine !== this.scrollToLine) {
                this.currentLine = this.scrollToLine
                this.reposition()
            }
            selectCard(this.cards[index])
        }

        selectLeft() {
            if (this.isLeftRightScrolling) {
                this.selectIndex(this.cards.indexOf(selectedCard) - this.rows)
            } else {
                this.selectIndex(this.cards.indexOf(selectedCard) - 1)
            }
        }

        selectRight() {
            if (this.isLeftRightScrolling) {
                this.selectIndex(this.cards.indexOf(selectedCard) + this.rows)
            } else {
                this.selectIndex(this.cards.indexOf(selectedCard) + 1)
            }
        }

        selectUp() {
            if (this.isLeftRightScrolling) {
                this.selectIndex(this.cards.indexOf(selectedCard) - 1)
            } else {
                this.selectIndex(this.cards.indexOf(selectedCard) - this.columns)
            }
        }

        selectDown() {
            if(this.isLeftRightScrolling) {
                this.selectIndex(this.cards.indexOf(selectedCard) + 1)
            } else {
                this.selectIndex(this.cards.indexOf(selectedCard) + this.columns)
            }
        }
    }

    let selectedCard: Card = null
    const cursor = sprites.create(img`
        . . . . . . . . .
        . . . . . . . . .
        . . . . . . . . .
        . . . . . . . . .
        . . . . . . . . .
        . . . . . . . . .
        . . . . . . . . .
        . . . . . . . . .
        . . . . . . . . .
        . . . . . . . . .
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

    export function selectCard(card: Card) {
        selectedCard = card
        cursor.follow(card, 200, 800)
    }

    export function getSelectedCard(): Card {
        return selectedCard
    }
}