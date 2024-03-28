namespace cardKit {

    cardDesign.createCardDesignTemplate(0)
    cardDesign.setDesignGraphics(CardDesignFrameTypes.Back, img`
    . 2 2 2 2 .
    2 4 d d 4 2
    2 d 2 3 d 2
    2 d 3 2 d 2
    2 4 d d 4 2
    . 2 2 2 2 .
    `)
    cardDesign.createNewGroup(AnchorPositions.Top, DrawDirections.TopToBottom, -1, 0)
    cardDesign.addAttributeIndexText(0, ['JK', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'])
    cardDesign.setItemColorToAttribute(2)
    cardDesign.addAttributeTextToImage(1, [
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
        f f . f f
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

    //% group="Create" blockSetVariable="myContainer"
    //% block="deck of playing cards"
    export function createPlayingCards(): cardCore.CardContainer {
        let deck = cardDesign.createEmptyStack(0, 0)
        cardDesign.addCardVariantsToContainer(deck,
            [
                cardDesign.createNumberAttributeVariations(2, 15, 15),
                cardDesign.createTextAttributeVariations(1, ['spades']),
                cardDesign.createNumberAttributeVariations(0, 1, 13)
            ]
        )
        cardDesign.addCardVariantsToContainer(deck,
            [
                cardDesign.createNumberAttributeVariations(2, 2, 2),
                cardDesign.createTextAttributeVariations(1, ['diamonds']),
                cardDesign.createNumberAttributeVariations(0, 1, 13)
            ]
        )
        cardDesign.addCardVariantsToContainer(deck,
            [
                cardDesign.createNumberAttributeVariations(2, 15, 15),
                cardDesign.createTextAttributeVariations(1, ['clubs']),
                cardDesign.createNumberAttributeVariations(0, 1, 13)
            ]
        )
        cardDesign.addCardVariantsToContainer(deck,
            [
                cardDesign.createNumberAttributeVariations(2, 2, 2),
                cardDesign.createTextAttributeVariations(1, ['hearts']),
                cardDesign.createNumberAttributeVariations(0, 1, 13)
            ]
        )
        return deck
    }
}