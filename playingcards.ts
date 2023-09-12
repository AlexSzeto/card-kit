namespace cardKit {
    let playingCardsDeckData: cardKit.CardData[]
    
    export function createPlayingCards(): cardKit.CardStack {
        let design = cardDesign.createCardDesignTemplate()
        design.backFrame = img`
        . 2 2 2 2 .
        2 4 d d 4 2
        2 d 2 3 d 2
        2 d 3 2 d 2
        2 4 d d 4 2
        . 2 2 2 2 .
        `
        cardDesign.addAttributeIndexText(design, 0, ['JK', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'])
        cardDesign.addEmptySpace(design, 2, 0)
        cardDesign.editNextRow(design)
        cardDesign.addAttributeTextToImage(design, 1, [
            cardDesign.createTextToImageLookupPair('spades', img`
            . . f . .
            . f f f .
            f f f f f
            f f f f f
            . . f . .
            . f f f .
            `),
            cardDesign.createTextToImageLookupPair('diamond', img`
            . . 2 . .
            . 2 2 2 .
            2 2 2 2 2
            2 2 2 2 2
            . 2 2 2 .
            . . 2 . .
            `),
            cardDesign.createTextToImageLookupPair('club', img`
            . f f f .
            f f f f f
            f f f f f
            f f f f f
            . . f . .
            . f f f .
            `),
            cardDesign.createTextToImageLookupPair('heart', img`
            . 2 . 2 .
            2 2 2 2 2
            2 2 2 2 2
            2 2 2 2 2
            . 2 2 2 .
            . . 2 . .
            `),
        ])
        cardDesign.addEmptySpace(design, 2, 0)

        let deck = deckBuilder.createEmptyDeck(design)
        let card = deckBuilder.createCard(design)
        deckBuilder.addCardVariantsToDeck(deck, card, [
            deckBuilder.createTextAttributeVariations(1, ['spades', 'diamonds', 'clubs', 'hearts']),
            deckBuilder.createNumberAttributeVariations(0, 1, 13)
        ])
        card.destroy()

        return deck
    }
}