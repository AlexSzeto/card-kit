namespace cardKit {
    function activate(sprite: Sprite, kind?: number) {
        const scene = game.currentScene();
        sprite.setKind(kind);
        scene.physicsEngine.addSprite(sprite);
        scene.createdHandlers
            .filter(h => h.kind == kind)
            .forEach(h => h.handler(sprite));
    }

    export class Card extends Sprite {
        constructor(
            public layout: cardKit.CardLayoutData,
            public data: cardKit.CardData,
            public isFaceUp: boolean
        ) {
            super(createCardImage(data, layout))
            this.redraw()
            activate(this)
        }

        redraw() {
            if(this.isFaceUp) {
                drawFront(this.data, this.layout, this.image, 0, 0)
            } else {
                drawBack(this.layout, this.image, 0, 0)
            }
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
}