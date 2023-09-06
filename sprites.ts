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
            private layout: cardKit.CardLayoutData,
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
            private layout: cardKit.CardLayoutData,
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
}