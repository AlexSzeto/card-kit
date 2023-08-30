namespace cardKit {

    export class Card extends game.BaseDialog {
        constructor() {
            super(44, 24, img`
                . 1 1 1 1 .
                1 4 4 4 4 1
                1 4 4 4 4 1
                1 4 4 4 4 1
                1 4 4 4 4 1
                . 1 1 1 1 .
                `, image.font5)
            this.drawBorder()

            tinyFont.print(this.image, 'quest?', 2, 2, 13)
            // this.image.print('9', 2, 2, 1, image.font5)

            let mySprite = sprites.create(image.create(44, 24), SpriteKind.Player)
            mySprite.image.drawTransparentImage(this.image, 0, 0)
        }
    }
}
const card = new cardKit.Card()

// Card
// Collection -> Deck -> Hand -> Pile