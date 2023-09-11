namespace cardKit {
    let playingCardsDeckData: cardKit.CardData[]
    
    export function createPlayingCards(): cardKit.CardStack {
        let template = cardLayout.createCardLayoutTemplate()
        template.backFrame = img`
        . 2 2 2 2 .
        2 4 d d 4 2
        2 d 2 3 d 2
        2 d 3 2 d 2
        2 4 d d 4 2
        . 2 2 2 2 .
        `
        cardLayout.addAttributeIndexText(template, 0, ['JK', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'])
        cardLayout.addEmptySpace(template, 2, 0)
        cardLayout.editNextRow(template)
        cardLayout.addAttributeTextToImage(template, 1, [
            cardLayout.createTextToImageLookupPair('spades', img`
            . . f . .
            . f f f .
            f f f f f
            f f f f f
            . . f . .
            . f f f .
            `),
            cardLayout.createTextToImageLookupPair('diamond', img`
            . . 2 . .
            . 2 2 2 .
            2 2 2 2 2
            2 2 2 2 2
            . 2 2 2 .
            . . 2 . .
            `),
            cardLayout.createTextToImageLookupPair('club', img`
            . f f f .
            f f f f f
            f f f f f
            f f f f f
            . . f . .
            . f f f .
            `),
            cardLayout.createTextToImageLookupPair('heart', img`
            . 2 . 2 .
            2 2 2 2 2
            2 2 2 2 2
            2 2 2 2 2
            . 2 2 2 .
            . . 2 . .
            `),
        ])
        cardLayout.addEmptySpace(template, 2, 0)

        const playingCardDeckData = []
        for (const suit of ['spades', 'diamond', 'club', 'heart']) {
            for (let rank = 1; rank <= 13; rank++) {
                const cardData = new cardKit.CardData(
                    null
                )
                cardData.setAttribute(0, rank)
                cardData.setAttribute(1, suit)
                playingCardDeckData.push(cardData)
            }
        }

        return new cardKit.CardStack(
            template.export(),
            playingCardDeckData,
            false,
            false
        )
    }
}