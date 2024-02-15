namespace cardKit {
    let playingCardsDesignTemplate: cardDesign.CardDesignTemplate = null
    
    export function createPlayingCardsDesign() {
        const previousDesign = cardDesign.getCurrentTemplate()
        if (!playingCardsDesignTemplate) {
            cardDesign.resetCardDesignTemplate()
            cardDesign.getCurrentTemplate().backFrame = img`
            . 2 2 2 2 .
            2 4 d d 4 2
            2 d 2 3 d 2
            2 d 3 2 d 2
            2 4 d d 4 2
            . 2 2 2 2 .
            `
            cardDesign.createNewSection(AnchorPositions.Top, DrawDirections.TopToBottom, -1, 2)
            cardDesign.addAttributeIndexText(0, ['JK', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'])
            cardDesign.setSubjectColorToAttribute(2)
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
            playingCardsDesignTemplate = cardDesign.getCurrentTemplate()
            cardDesign.setCurrentTemplate(previousDesign)
        }
        return playingCardsDesignTemplate
    }

    //% group="Create" blockSetVariable="myContainer"
    //% block="deck of playing cards"
    export function createPlayingCards(): cardCore.CardContainer {
        let deck = cardDesign.createEmptyStack(0)
        deck.design = createPlayingCardsDesign().export()
        cardDesign.addCardVariantsToStack(deck,
            [
                cardDesign.createNumberAttributeVariations(2, 15, 15),
                cardDesign.createTextAttributeVariations(1, ['spades']),
                cardDesign.createNumberAttributeVariations(0, 1, 13)
            ]
        )
        cardDesign.addCardVariantsToStack(deck,
            [
                cardDesign.createNumberAttributeVariations(2, 2, 2),
                cardDesign.createTextAttributeVariations(1, ['diamonds']),
                cardDesign.createNumberAttributeVariations(0, 1, 13)
            ]
        )
        cardDesign.addCardVariantsToStack(deck,
            [
                cardDesign.createNumberAttributeVariations(2, 15, 15),
                cardDesign.createTextAttributeVariations(1, ['clubs']),
                cardDesign.createNumberAttributeVariations(0, 1, 13)
            ]
        )
        cardDesign.addCardVariantsToStack(deck,
            [
                cardDesign.createNumberAttributeVariations(2, 2, 2),
                cardDesign.createTextAttributeVariations(1, ['hearts']),
                cardDesign.createNumberAttributeVariations(0, 1, 13)
            ]
        )
        return deck
    }
}