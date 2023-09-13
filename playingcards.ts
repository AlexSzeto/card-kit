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
        cardDesign.addAttributeIndexText(design, CardZoneAlignments.Center, 0, ['JK', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'])
        cardDesign.addEmptySpace(design, CardZoneAlignments.Center, 2, 0)
        cardDesign.editNextRow(design)
        cardDesign.addAttributeTextToImage(design, CardZoneAlignments.Center, 1, [
            cardDesign.createTextToImageLookupPair('spades', img`
            . . f . .
            . f f f .
            f f f f f
            f f f f f
            . . f . .
            . f f f .
            `),
            cardDesign.createTextToImageLookupPair('diamonds', img`
            . . 2 . .
            . 2 2 2 .
            2 2 2 2 2
            2 2 2 2 2
            . 2 2 2 .
            . . 2 . .
            `),
            cardDesign.createTextToImageLookupPair('clubs', img`
            . f f f .
            f f f f f
            f f f f f
            f f f f f
            . . f . .
            . f f f .
            `),
            cardDesign.createTextToImageLookupPair('hearts', img`
            . 2 . 2 .
            2 2 2 2 2
            2 2 2 2 2
            2 2 2 2 2
            . 2 2 2 .
            . . 2 . .
            `),
        ])
        cardDesign.addEmptySpace(design, CardZoneAlignments.Center, 2, 0)

        let deck = deckBuilder.createEmptyDeck(design)
        deckBuilder.addCardVariantsToDeck(deck,
            [
                deckBuilder.createTextAttributeVariations(1, ['spades', 'diamonds', 'clubs', 'hearts']),
                deckBuilder.createNumberAttributeVariations(0, 1, 13)
            ]
        )

        return deck
    }
}